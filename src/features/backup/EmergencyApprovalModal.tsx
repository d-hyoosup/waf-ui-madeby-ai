// src/features/backup/EmergencyApprovalModal.tsx
import React, { useState } from 'react';
import '../../components/styles/ModalStyles.css';

interface EmergencyApprovalModalProps {
  onClose: () => void;
  onConfirm: (approver: string, reason: string) => void;
  backupId: string;
}

const EmergencyApprovalModal: React.FC<EmergencyApprovalModalProps> = ({
  onClose,
  onConfirm,
  backupId
}) => {
  const [approver] = useState('사용자');
  const [reason] = useState('긴급 승인');

  const handleEmergencyRestore = () => {
    onConfirm(approver, reason);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content emergency-modal">
        <header className="modal-header">
          <h3>⚠️ 긴급 복원 승인</h3>
          <button className="close-button" onClick={onClose}>&times;</button>
        </header>

        <main className="modal-body">
          <div className="emergency-warning-container">
            <div className="warning-content">
              <p>
                  Gitlab tag: <strong>{backupId}</strong>를 긴급 복원하려고 합니다.
              </p>
              <div className="warning-list">
                <p><strong>다음 사항을 반드시 확인하세요:</strong></p>
                <ul>
                  <li>정상적인 Jira 승인 절차가 생략됩니다</li>
                  <li>서비스에 영향을 줄 수 있는 중요한 작업입니다</li>
                </ul>
              </div>

              <div className="confirmation-text">
                <strong>정말로 긴급 복원을 진행하시겠습니까?</strong>
              </div>
            </div>
          </div>
        </main>

        <footer className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            취소
          </button>
          <button
            className="btn btn-danger"
            onClick={handleEmergencyRestore}
          >
            긴급 복원 승인
          </button>
        </footer>
      </div>
    </div>
  );
};

export default EmergencyApprovalModal;