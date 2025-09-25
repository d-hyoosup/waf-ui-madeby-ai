// src/pages/ManageSettings.tsx
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import PageContainer from '../components/PageContainer';
import ManagementSettingsTabContent from '../components/ManagementSettingsTabContent';
import AllRegionsSettingsTab from '../components/AllRegionsSettingsTab';
import AlertSettingsTabContent from '../components/AlertSettingsTabContent';
import './PageStyles.css';

const ManageSettings = () => {
  const location = useLocation();
  const defaultTab = location.state?.defaultTab || 'allRegions';
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    // ✅ [수정] controls prop을 제거하여 '설정 적용' 버튼 삭제
    <PageContainer title="관리 설정">
      <div className="tabs-container">
        <button
          className={`tab-button ${activeTab === 'allRegions' ? 'active' : ''}`}
          onClick={() => setActiveTab('allRegions')}
        >
          전체 리전 설정
        </button>
        {/*<button*/}
        {/*  className={`tab-button ${activeTab === 'individual' ? 'active' : ''}`}*/}
        {/*  onClick={() => setActiveTab('individual')}*/}
        {/*>*/}
        {/*  개별 관리 설정*/}
        {/*</button>*/}
        <button
          className={`tab-button ${activeTab === 'alert' ? 'active' : ''}`}
          onClick={() => setActiveTab('alert')}
        >
          알림 설정
        </button>
      </div>

      <div className="main-content-area">
        {activeTab === 'allRegions' && <AllRegionsSettingsTab />}
        {/*{activeTab === 'individual' && <ManagementSettingsTabContent />}*/}
        {activeTab === 'alert' && <AlertSettingsTabContent />}
      </div>
    </PageContainer>
  );
};

export default ManageSettings;