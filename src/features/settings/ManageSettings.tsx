// src/pages/ManageSettings.tsx
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import PageContainer from '../../components/common/PageContainer.tsx';
import AllRegionsSettingsTab from './AllRegionsSettingsTab.tsx';
import AlertSettingsTabContent from './AlertSettingsTabContent.tsx';
import '../../pages/PageStyles.css';

const ManageSettings = () => {
  const location = useLocation();
  const defaultTab = location.state?.defaultTab || 'allRegions';
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <PageContainer title="관리 설정">
      <div className="tabs-container">
        <button
          className={`tab-button ${activeTab === 'allRegions' ? 'active' : ''}`}
          onClick={() => setActiveTab('allRegions')}
        >
          관리 설정
        </button>
        <button
          className={`tab-button ${activeTab === 'alert' ? 'active' : ''}`}
          onClick={() => setActiveTab('alert')}
        >
          알림 설정
        </button>
      </div>

      <div className="main-content-area">
        {activeTab === 'allRegions' && <AllRegionsSettingsTab />}
        {activeTab === 'alert' && <AlertSettingsTabContent />}
      </div>
    </PageContainer>
  );
};

export default ManageSettings;