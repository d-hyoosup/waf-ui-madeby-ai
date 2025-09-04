// src/components/ManagementSettingsTabContent.tsx
import { useState } from 'react';
import './TableStyles.css';
import './FormStyles.css';

// ✅ [수정] 데이터 구조를 AllRegionsSettingsTab과 일치시킴
interface Setting {
  id: string;
  account: string;
  regionCode: string;
  regionName: string;
  scope: 'REGIONAL' | 'CLOUDFRONT';
  isManaged: boolean;
  backupType: '자동백업' | '수동백업';
}

// ✅ [추가] 리전 이름 매칭을 위한 데이터
const awsRegions = [
    { code: "us-east-1", name: "US East (N. Virginia)" },
    { code: "us-east-2", name: "US East (Ohio)" },
    { code: "ap-northeast-2", name: "Asia Pacific (Seoul)" },
    { code: "Global", name: "Global" }, // Global 케이스 추가
];

// ✅ [수정] 목업 데이터에 scope, regionName 값 추가
const initialSettings: Setting[] = [
    { id: 'setting-1', account: '123456789012', regionCode: 'us-east-1', regionName: 'US East (N. Virginia)', scope: 'REGIONAL', isManaged: false, backupType: '수동백업' },
    { id: 'setting-2', account: '123456789012', regionCode: 'us-east-2', regionName: 'US East (Ohio)', scope: 'REGIONAL', isManaged: true, backupType: '자동백업' },
    { id: 'setting-3', account: '987654321098', regionCode: 'Global', regionName: 'Global', scope: 'CLOUDFRONT', isManaged: true, backupType: '수동백업' },
];

const AddSettingForm = () => (
    <div className="setting-add-form improved-form">
        <h4>관리 설정 추가</h4>
        <div className="form-controls">
            <div className="form-group">
                <label>계정</label>
                <select defaultValue="123456789012">
                    <option>123456789012</option>
                    <option>987654321098</option>
                </select>
            </div>
            <div className="form-group">
                <label>리전</label>
                {/* ✅ [수정] 리전 선택지를 전체 목록으로 변경 */}
                <select defaultValue="us-east-1">
                    {awsRegions.map(region => (
                      <option key={region.code} value={region.code}>
                        {`${region.name} (${region.code})`}
                      </option>
                    ))}
                </select>
            </div>
            <div className="form-group">
                <label>영역</label>
                <select defaultValue="REGIONAL">
                    <option>REGIONAL</option>
                    <option>CLOUDFRONT</option>
                </select>
            </div>
            <div className="form-group">
                <label>&nbsp;</label>
                <button type="button" className="btn btn-primary">추가</button>
            </div>
        </div>
    </div>
);

const ManagementSettingsTabContent = () => {
  const [settings, setSettings] = useState<Setting[]>(initialSettings);

  const handleToggleManaged = (id: string) => {
    setSettings(
      settings.map(s =>
        s.id === id ? { ...s, isManaged: !s.isManaged } : s
      )
    );
  };

  const handleBackupTypeChange = (id: string, newBackupType: '자동백업' | '수동백업') => {
    setSettings(
      settings.map(s =>
        s.id === id ? { ...s, backupType: newBackupType } : s
      )
    );
  };

  return (
    <>
      <AddSettingForm />
      <div className="table-container" style={{ marginTop: '20px' }}>
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
                {/* ✅ [수정] 리전명과 리전 코드를 함께 표시 */}
                <td>{`${s.regionName} (${s.regionCode})`}</td>
                <td>{s.scope}</td>
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
                        name={`backupType-${s.id}`}
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
                        name={`backupType-${s.id}`}
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
    </>
  );
};

export default ManagementSettingsTabContent;