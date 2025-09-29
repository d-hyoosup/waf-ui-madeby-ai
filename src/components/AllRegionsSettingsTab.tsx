// src/components/AllRegionsSettingsTab.tsx
import { useState, useMemo } from 'react';
import './TableStyles.css';
import './FilterStyles.css';
import { AWS_REGIONS } from '../constants/awsRegions';

interface Setting {
    id: string;
    account: string;
    regionCode: string;
    regionName: string;
    isManaged: boolean;
    backupType: '자동백업' | '수동백업';
}

type SortField = 'account' | 'regionName' | 'isManaged' | 'backupType';
type SortOrder = 'asc' | 'desc';

const generateInitialSettings = (accountId: string): Setting[] => {
    return AWS_REGIONS.map(region => ({
        id: `${accountId}-${region.code}`,
        account: accountId,
        regionCode: region.code,
        regionName: region.name,
        isManaged: Math.random() > 0.7,
        backupType: '수동백업' as const,
    }));
};

const AllRegionsSettingsTab = () => {
    const accounts = ['123456789012', '987654321098'];
    const [settings, setSettings] = useState<Setting[]>(() => {
        return accounts.flatMap(account => generateInitialSettings(account));
    });

    // ✅ [추가] 정렬 상태
    const [sortField, setSortField] = useState<SortField>('account');
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

    // 필터 상태
    const [filters, setFilters] = useState({
        account: '',
        region: '',
        isManaged: ''
    });

    const handleToggleManaged = (id: string) => {
        setSettings(settings.map(s => s.id === id ? { ...s, isManaged: !s.isManaged } : s));
    };

    const handleBackupTypeChange = (id: string, newBackupType: '자동백업' | '수동백업') => {
        setSettings(settings.map(s => s.id === id ? { ...s, backupType: newBackupType } : s));
    };

    // ✅ [추가] 정렬 핸들러
    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    // ✅ [추가] 정렬 아이콘
    const getSortIcon = (field: SortField) => {
        if (sortField !== field) return ' ↕️';
        return sortOrder === 'asc' ? ' ⬇️' : '⬆️';
    };

    // 필터링된 데이터
    const filteredSettings = useMemo(() => {
        return settings.filter(item => {
            if (filters.account && item.account !== filters.account) return false;
            if (filters.region && item.regionCode !== filters.region) return false;
            if (filters.isManaged !== '') {
                const isManaged = filters.isManaged === 'true';
                if (item.isManaged !== isManaged) return false;
            }
            return true;
        });
    }, [settings, filters]);

    // ✅ [추가] 정렬된 데이터
    const sortedSettings = useMemo(() => {
        const sorted = [...filteredSettings].sort((a, b) => {
            let aValue: string | boolean = '';
            let bValue: string | boolean = '';

            switch (sortField) {
                case 'account':
                    aValue = a.account;
                    bValue = b.account;
                    break;
                case 'regionName':
                    aValue = a.regionName;
                    bValue = b.regionName;
                    break;
                case 'isManaged':
                    aValue = a.isManaged;
                    bValue = b.isManaged;
                    break;
                case 'backupType':
                    aValue = a.backupType;
                    bValue = b.backupType;
                    break;
            }

            if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
                if (aValue === bValue) return 0;
                return sortOrder === 'asc'
                    ? (aValue ? 1 : -1)
                    : (aValue ? -1 : 1);
            }

            if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
        return sorted;
    }, [filteredSettings, sortField, sortOrder]);

    const uniqueAccounts = useMemo(() => [...new Set(settings.map(s => s.account))], [settings]);
    const uniqueRegions = useMemo(() => AWS_REGIONS, []);

    return (
        <div className="settings-tab-container">
            {/* 필터 영역 */}
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
                        {uniqueRegions.map(region => (
                            <option key={region.code} value={region.code}>
                                {region.name}
                            </option>
                        ))}
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

            {/* 테이블 */}
            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th style={{ cursor: 'pointer' }} onClick={() => handleSort('account')}>
                                계정{getSortIcon('account')}
                            </th>
                            <th style={{ cursor: 'pointer' }} onClick={() => handleSort('regionName')}>
                                리전{getSortIcon('regionName')}
                            </th>
                            <th style={{ width: '120px', cursor: 'pointer' }} onClick={() => handleSort('isManaged')}>
                                관리 여부{getSortIcon('isManaged')}
                            </th>
                            <th style={{ cursor: 'pointer' }} onClick={() => handleSort('backupType')}>
                                백업 방식{getSortIcon('backupType')}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedSettings.map((s) => (
                            <tr key={s.id}>
                                <td>{s.account}</td>
                                <td>{s.regionName}</td>
                                <td>
                                    <label className="toggle-switch">
                                        <input
                                            type="checkbox"
                                            checked={s.isManaged}
                                            onChange={() => handleToggleManaged(s.id)}
                                        />
                                        <span className="slider"></span>
                                    </label>
                                </td>
                                <td>
                                    <div className="radio-group" style={{ opacity: s.isManaged ? 1 : 0.5 }}>
                                        <label>
                                            <input
                                                type="radio"
                                                name={`backup-${s.id}`}
                                                value="자동백업"
                                                checked={s.backupType === '자동백업'}
                                                disabled={!s.isManaged}
                                                onChange={() => handleBackupTypeChange(s.id, '자동백업')}
                                            />
                                            자동백업
                                        </label>
                                        <label>
                                            <input
                                                type="radio"
                                                name={`backup-${s.id}`}
                                                value="수동백업"
                                                checked={s.backupType === '수동백업'}
                                                disabled={!s.isManaged}
                                                onChange={() => handleBackupTypeChange(s.id, '수동백업')}
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
        </div>
    );
};

export default AllRegionsSettingsTab;