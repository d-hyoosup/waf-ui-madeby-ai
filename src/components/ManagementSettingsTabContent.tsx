// src/components/ManagementSettingsTabContent.tsx
import { useState } from 'react';
import './TableStyles.css';
import './FormStyles.css';
import { AWS_REGIONS } from '../constants/awsRegions';

interface Setting {
  id: string;
  account: string;
  regionCode: string;
  regionName: string;
  scope: 'REGIONAL' | 'CLOUDFRONT';
  isManaged: boolean;
  backupType: '자동백업' | '수동백업';
}

const initialSettings: Setting[] = [
    {
        id: 'setting-1',
        account: '123456789012',
        regionCode: 'us-east-1',
        regionName: '버지니아 북부 (us-east-1)',
        scope: 'REGIONAL',
        isManaged: false,
        backupType: '수동백업'
    },
    {
        id: 'setting-2',
        account: '123456789012',
        regionCode: 'us-east-2',
        regionName: '오하이오 (us-east-2)',
        scope: 'REGIONAL',
        isManaged: true,
        backupType: '자동백업'
    },
    {
        id: 'setting-3',
        account: '987654321098',
        regionCode: 'aws-global',
        regionName: '글로벌 (CloudFront)',
        scope: 'CLOUDFRONT',
        isManaged: true,
        backupType: '수동백업'
    },
];

const AddSettingForm = () => (
    <div className="setting-add-form improved-form" style={{ opacity: 0.5, pointerEvents: 'none' }}>
        <h4>관리 설정 추가 (비활성화)</h4>
        <div className="form-controls">
            <div className="form-group">
                <label>계정</label>
                <select defaultValue="123456789012" disabled>
                    <option>123456789012</option>
                    <option>987654321098</option>
                </select>
            </div>
            <div className="form-group">
                <label>리전</label>
                <select defaultValue="us-east-1" disabled>
                    {AWS_REGIONS.map(region => (
                      <option key={region.code} value={region.code}>
                        {region.name}
                      </option>
                    ))}
                </select>
            </div>
            <div className="form-group">
                <label>영역</label>
                <select defaultValue="REGIONAL" disabled>
                    <option>REGIONAL</option>
                    <option>CLOUDFRONT</option>
                </select>
            </div>
            <div className="form-group">
                <label>&nbsp;</label>
                <button type="button" className="btn btn-primary" disabled>추가</button>
            </div>
        </div>
    </div>
);

const ManagementSettingsTabContent = () => {
  const [settings, setSettings] = useState<Setting[]>(initialSettings);

  const handleToggleManaged = (id: string) => {
    // 비활성화 상태이므로 동작하지 않음
    return;
  };

  const handleBackupTypeChange = (id: string, newBackupType: '자동백업' | '수동백업') => {
    // 비활성화 상태이므로 동작하지 않음
    return;
  };

  return (
    <>
      <AddSettingForm />
      <div className="table-container" style={{ marginTop: '20px', opacity: 0.5, pointerEvents: 'none' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>계정</th>
              <th>리전</th>
              <th>영역</th>
              <th style={{ width: '120px' }}>관리 여부</th>
              <th>백업 방식</th>
            </tr>
          </thead>
          <tbody>
            {settings.map((s) => (
              <tr key={s.id}>
                <td>{s.account}</td>
                <td>{s.regionName}</td>
                <td>{s.scope}</td>
                <td>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={s.isManaged}
                      onChange={() => handleToggleManaged(s.id)}
                      disabled
                    />
                    <span className="slider"></span>
                  </label>
                </td>
                <td>
                  <div className="radio-group" style={{ opacity: s.isManaged ? 1 : 0.5 }}>
                    <label>
                      <input
                        type="radio"
                        name={`backupType-${s.id}`}
                        value="자동백업"
                        checked={s.backupType === '자동백업'}
                        disabled
                        onChange={() => handleBackupTypeChange(s.id, '자동백업')}
                      />
                      자동백업
                    </label>
                    <label>
                      <input
                        type="radio"
                        name={`backupType-${s.id}`}
                        value="수동백업"
                        checked={s.backupType === '수동백업'}
                        disabled
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
      <div style={{
        marginTop: '20px',
        padding: '15px',
        background: '#fff3cd',
        border: '1px solid #ffc107',
        borderRadius: '8px',
        color: '#856404'
      }}>
        <strong>안내:</strong> 개별 관리 설정 기능은 현재 비활성화 상태입니다. 전체 리전 설정 탭을 이용해주세요.
      </div>
    </>
  );
};

export default ManagementSettingsTabContent;