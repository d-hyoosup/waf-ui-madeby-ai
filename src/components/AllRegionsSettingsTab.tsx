// src/components/AllRegionsSettingsTab.tsx
import { useState } from 'react';
import './TableStyles.css';

interface Setting {
    id: string;
    account: string;
    regionCode: string; // AWS 리전 코드 (예: us-east-1)
    regionName: string; // AWS 리전 이름 (예: US East (N. Virginia))
    isManaged: boolean;
    backupType: '자동백업' | '수동백업';
}

// AWS 전체 리전 목록 (2023년 기준, 일부 GovCloud 및 중국 리전 제외)
const awsRegions = [
    { code: "us-east-1", name: "US East (N. Virginia)" },
    { code: "us-east-2", name: "US East (Ohio)" },
    { code: "us-west-1", name: "US West (N. California)" },
    { code: "us-west-2", name: "US West (Oregon)" },
    { code: "af-south-1", name: "Africa (Cape Town)" },
    { code: "ap-east-1", name: "Asia Pacific (Hong Kong)" },
    { code: "ap-south-1", name: "Asia Pacific (Mumbai)" },
    { code: "ap-northeast-3", name: "Asia Pacific (Osaka)" },
    { code: "ap-northeast-2", name: "Asia Pacific (Seoul)" },
    { code: "ap-southeast-1", name: "Asia Pacific (Singapore)" },
    { code: "ap-southeast-2", name: "Asia Pacific (Sydney)" },
    { code: "ap-northeast-1", name: "Asia Pacific (Tokyo)" },
    { code: "ca-central-1", name: "Canada (Central)" },
    { code: "eu-central-1", name: "Europe (Frankfurt)" },
    { code: "eu-west-1", name: "Europe (Ireland)" },
    { code: "eu-west-2", name: "Europe (London)" },
    { code: "eu-south-1", name: "Europe (Milan)" },
    { code: "eu-west-3", name: "Europe (Paris)" },
    { code: "eu-north-1", name: "Europe (Stockholm)" },
    { code: "me-south-1", name: "Middle East (Bahrain)" },
    { code: "sa-east-1", name: "South America (São Paulo)" },
];

const generateInitialSettings = (accountId: string): Setting[] => {
    return awsRegions.map(region => ({
        id: `${accountId}-${region.code}`,
        account: accountId,
        regionCode: region.code,
        regionName: region.name,
        isManaged: false,
        backupType: '수동백업',
    }));
};

const AllRegionsSettingsTab = () => {
    const currentAccountId = '123456789012';
    const [settings, setSettings] = useState<Setting[]>(() => generateInitialSettings(currentAccountId));

    const handleToggleManaged = (id: string) => {
        setSettings(settings.map(s => s.id === id ? { ...s, isManaged: !s.isManaged } : s));
    };

    const handleBackupTypeChange = (id: string, newBackupType: '자동백업' | '수동백업') => {
        setSettings(settings.map(s => s.id === id ? { ...s, backupType: newBackupType } : s));
    };

    return (
        <div className="table-container">
            <table className="data-table">
                <thead>
                    <tr>
                        <th>계정</th>
                        {/* ✅ [수정] '리전명'과 '리전 코드'를 '리전'으로 통합 */}
                        <th>리전</th>
                        <th style={{ width: '120px' }}>관리 여부</th>
                        <th>백업 방식</th>
                    </tr>
                </thead>
                <tbody>
                    {settings.map((s) => (
                        <tr key={s.id}>
                            <td>{s.account}</td>
                            {/* ✅ [수정] 리전명과 리전 코드를 함께 표시 */}
                            <td>{`${s.regionName} (${s.regionCode})`}</td>
                            <td>
                                <label className="toggle-switch">
                                    <input type="checkbox" checked={s.isManaged} onChange={() => handleToggleManaged(s.id)} />
                                    <span className="slider"></span>
                                </label>
                            </td>
                            <td>
                                <div className="radio-group" style={{ opacity: s.isManaged ? 1 : 0.5 }}>
                                    <label>
                                        <input type="radio" name={`backup-${s.id}`} value="자동백업" checked={s.backupType === '자동백업'} disabled={!s.isManaged} onChange={() => handleBackupTypeChange(s.id, '자동백업')} /> 자동백업
                                    </label>
                                    <label>
                                        <input type="radio" name={`backup-${s.id}`} value="수동백업" checked={s.backupType === '수동백업'} disabled={!s.isManaged} onChange={() => handleBackupTypeChange(s.id, '수동백업')} /> 수동백업
                                    </label>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AllRegionsSettingsTab;