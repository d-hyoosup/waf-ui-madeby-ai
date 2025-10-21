// src/features/settings/AllRegionsSettingsTab.tsx
import { useState, useEffect, useMemo } from 'react';
import '../../components/styles/TableStyles.css';
import '../../components/styles/FilterStyles.css';
import { AWS_REGIONS, getRegionDisplayName } from '../../constants/awsRegions.ts'; // getRegionDisplayName 추가
import { SettingService } from '../../api';
import type { WafSetting, BackupType } from '../../types/api.types.ts';

type SortField = 'accountId' | 'regionName' | 'managed' | 'backupType';
type SortOrder = 'asc' | 'desc';

const AllRegionsSettingsTab = () => {
    const [settings, setSettings] = useState<WafSetting[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortField, setSortField] = useState<SortField>('accountId');
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
    const [filters, setFilters] = useState({ account: '', region: '', isManaged: '' });

    useEffect(() => {
        const fetchSettings = async () => {
            setLoading(true);
            try {
                const response = await SettingService.getSettings({ page: 1, pageSize: 200 });
                // --- 수정된 부분 ---
                // API 응답에 regionName이 있으므로 직접 사용합니다.
                // regionCode를 사용해 일관된 표시 이름 형식을 원하면 getRegionDisplayName을 사용할 수 있습니다.
                // 예: regionDisplayName: getRegionDisplayName(s.regionCode)
                const settingsWithCorrectRegion = response.content.map(s => ({
                    ...s,
                    // API 응답의 regionName을 그대로 사용하거나, 필요시 awsRegions.ts에서 조회
                    regionName: s.regionName || getRegionDisplayName(s.regionCode) // API 응답 우선, 없으면 매핑 시도
                }));
                setSettings(settingsWithCorrectRegion);
                // --- 수정 끝 ---
            } catch (error) {
                console.error("Failed to fetch settings", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleSave = async () => {
        try {
            const updateData = settings.map(({ scopeId, managed, backupType }) => ({
                scopeId,
                managed,
                backupType,
            }));
            await SettingService.updateSettings(updateData);
            alert('설정이 저장되었습니다.');
        } catch (error) {
            console.error("Failed to save settings", error);
            alert('설정 저장에 실패했습니다.');
        }
    };

    const handleToggleManaged = (id: string) => {
        setSettings(settings.map(s => s.scopeId === id ? { ...s, managed: !s.managed } : s));
    };

    const handleBackupTypeChange = (id: string, newBackupType: BackupType) => {
        setSettings(settings.map(s => s.scopeId === id ? { ...s, backupType: newBackupType } : s));
    };

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    const getSortIcon = (field: SortField) => {
        if (sortField !== field) return ' ↕️';
        return sortOrder === 'asc' ? ' ⬇️' : '⬆️';
    };

    const filteredSettings = useMemo(() => {
        return settings.filter(item => {
            if (filters.account && item.accountId !== filters.account) return false;
            // --- 수정된 부분 ---
            // regionCode 기준으로 필터링
            if (filters.region && item.regionCode !== filters.region) return false;
            // --- 수정 끝 ---
            if (filters.isManaged !== '') {
                const isManaged = filters.isManaged === 'true';
                if (item.managed !== isManaged) return false;
            }
            return true;
        });
    }, [settings, filters]);

    const sortedSettings = useMemo(() => {
        return [...filteredSettings].sort((a, b) => {
            const aVal = a[sortField];
            const bVal = b[sortField];

            // Handle undefined safely
            if (aVal === undefined || bVal === undefined) return 0;

            if (typeof aVal === 'boolean' && typeof bVal === 'boolean') {
                return sortOrder === 'asc' ? (aVal === bVal ? 0 : aVal ? -1 : 1) : (aVal === bVal ? 0 : aVal ? 1 : -1)
            }

            // --- 수정된 부분 ---
            // regionName으로 정렬하도록 명시적 처리 (문자열 비교)
             if (sortField === 'regionName') {
                 const nameA = String(aVal);
                 const nameB = String(bVal);
                 return sortOrder === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
             }
            // --- 수정 끝 ---

            if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
    }, [filteredSettings, sortField, sortOrder]);

    const uniqueAccounts = useMemo(() => [...new Set(settings.map(s => s.accountId))], [settings]);
    // --- 수정된 부분 ---
    // 필터링 옵션 생성을 위해 regionCode와 매핑된 이름을 사용
    const uniqueRegions = useMemo(() => {
        const regionMap = new Map<string, string>();
        settings.forEach(s => {
            if (!regionMap.has(s.regionCode)) {
                // API 응답의 regionName을 사용하거나, 없으면 awsRegions.ts에서 찾음
                regionMap.set(s.regionCode, s.regionName || getRegionDisplayName(s.regionCode));
            }
        });
        return Array.from(regionMap.entries()).map(([code, name]) => ({ code, name }));
    }, [settings]);
    // --- 수정 끝 ---

    if (loading) return <p>Loading settings...</p>;

    return (
        <div className="settings-tab-container">
            <div className="filter-container">
                 <div className="filter-group">
                    <label>Account</label>
                    <select
                        value={filters.account}
                        onChange={(e) => setFilters({...filters, account: e.target.value})}
                    >
                        <option value="">전체</option>
                        {uniqueAccounts.map(account => (
                            <option key={account} value={account}>{account}</option>
                        ))}
                    </select>
                </div>
                 <div className="filter-group">
                    <label>Region</label>
                    <select
                        value={filters.region}
                        onChange={(e) => setFilters({...filters, region: e.target.value})}
                    >
                        <option value="">전체</option>
                        {/* --- 수정된 부분: uniqueRegions 사용 --- */}
                        {uniqueRegions.map(region => (
                            <option key={region.code} value={region.code}>
                                {region.name} {/* API 응답 또는 매핑된 이름 표시 */}
                            </option>
                        ))}
                        {/* --- 수정 끝 --- */}
                    </select>
                </div>
                <div className="filter-group">
                    <label>관리 여부</label>
                    <select
                        value={filters.isManaged}
                        onChange={(e) => setFilters({...filters, isManaged: e.target.value})}
                    >
                        <option value="">전체</option>
                        <option value="true">관리중</option>
                        <option value="false">미관리</option>
                    </select>
                </div>
                <button
                    className="btn btn-secondary filter-reset"
                    onClick={() => setFilters({ account: '', region: '', isManaged: '' })}
                >
                    필터 초기화
                </button>
            </div>

            <div className="table-container">
                <table className="data-table">
                     <thead>
                        <tr>
                            <th style={{ cursor: 'pointer' }} onClick={() => handleSort('accountId')}>
                                계정{getSortIcon('accountId')}
                            </th>
                            <th style={{ cursor: 'pointer' }} onClick={() => handleSort('regionName')}>
                                리전{getSortIcon('regionName')}
                            </th>
                            <th style={{ width: '120px', cursor: 'pointer' }} onClick={() => handleSort('managed')}>
                                관리 여부{getSortIcon('managed')}
                            </th>
                            <th style={{ cursor: 'pointer' }} onClick={() => handleSort('backupType')}>
                                백업 방식{getSortIcon('backupType')}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedSettings.map((s) => (
                            <tr key={s.scopeId}>
                                <td>{s.accountId}</td>
                                {/* --- 수정된 부분: s.regionName 사용 --- */}
                                <td>{s.regionName}</td>
                                {/* --- 수정 끝 --- */}
                                <td>
                                    <label className="toggle-switch">
                                        <input
                                            type="checkbox"
                                            checked={s.managed}
                                            onChange={() => handleToggleManaged(s.scopeId)}
                                        />
                                        <span className="slider"></span>
                                    </label>
                                </td>
                                <td>
                                    <div className="radio-group" style={{ opacity: s.managed ? 1 : 0.5 }}>
                                        <label>
                                            <input
                                                type="radio"
                                                name={`backup-${s.scopeId}`}
                                                value="AUTO"
                                                checked={s.backupType === 'AUTO'}
                                                disabled={!s.managed}
                                                onChange={() => handleBackupTypeChange(s.scopeId, 'AUTO')}
                                            />
                                            자동백업
                                        </label>
                                        <label>
                                            <input
                                                type="radio"
                                                name={`backup-${s.scopeId}`}
                                                value="MANUAL"
                                                checked={s.backupType === 'MANUAL'}
                                                disabled={!s.managed}
                                                onChange={() => handleBackupTypeChange(s.scopeId, 'MANUAL')}
                                            />
                                            수동백업
                                        </label>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
             <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button className="btn btn-primary" onClick={handleSave}>
                    설정 저장
                </button>
            </div>
        </div>
    );
};

export default AllRegionsSettingsTab;