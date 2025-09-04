// src/components/AddChannelModal.tsx
import React, { useState } from 'react';
import './ModalStyles.css';
import './FormStyles.css';
// ... TreeView 컴포넌트와 관련 타입 및 함수들을 이 파일로 가져오거나 import 해야 합니다 ...

// 이 예시에서는 AlertSettingsTabContent에 있던 TreeView 관련 코드를 여기에 포함시켰다고 가정합니다.
// ... (기존 TreeView 관련 코드 생략) ...

interface AddChannelModalProps {
  onClose: () => void;
  onSave: (channelData: Omit<Channel, 'id' | 'ruleCount'>, id?: string) => void;
  channelToEdit?: Channel;
}

const AddChannelModal: React.FC<AddChannelModalProps> = ({ onClose, onSave, channelToEdit }) => {
  const [formData, setFormData] = useState({
    name: channelToEdit?.name || '',
    description: channelToEdit?.description || '',
    slackUrl: channelToEdit?.slackUrl || '',
    options: channelToEdit?.options || { /* default options */ },
    monitoredRules: channelToEdit?.monitoredRules || [],
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveClick = () => {
    onSave(formData, channelToEdit?.id);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content modal-lg">
        <header className="modal-header">
          <h3>{channelToEdit ? '알림 채널 수정' : '새 알림 채널 추가'}</h3>
          <button className="close-button" onClick={onClose}>&times;</button>
        </header>
        <main className="modal-body">
          {/* 여기에 채널명, 설명, Slack URL 등 입력 폼 구현 */}
          <div className="form-group">
            <label htmlFor="name">채널명</label>
            <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} />
          </div>
          {/* ... 다른 폼 필드들 ... */}

          {/* WAF Rule TreeView */}
          <h4>WAF Rule 모니터링 선택</h4>
          {/* <TreeView ... /> */}
        </main>
        <footer className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>취소</button>
          <button className="btn btn-primary" onClick={handleSaveClick}>저장</button>
        </footer>
      </div>
    </div>
  );
};

export default AddChannelModal;