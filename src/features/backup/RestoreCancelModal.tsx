// src/features/backup/RestoreCancelModal.tsx
import React, { useState } from 'react';
import '../../components/styles/ModalStyles.css';

interface RestoreCancelModalProps {
  onClose: () => void;
  onConfirm: (requester: string, reason: string) => void;
  backupId: string;
}

const RestoreCancelModal: React.FC<RestoreCancelModalProps> = ({
  onClose,
  onConfirm,
  backupId
}) => {
  const [requester] = useState('사용자');
  const [reason] = useState('복원 취소');

  const handleCancelRestore = () => {
    onConfirm(requester, reason);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content emergency-modal">
        <header className="modal-header">
          <h3>🛑복원 취소 요청</h3>
          <button className="close-button" onClick={onClose}>&times;</button>
        </header>

        <main className="modal-body">
          <div className="emergency-warning-container">
            <div className="warning-content">
              <p>
                  Gitlab tag: <strong>{backupId}</strong>의 복원을 취소하려고 합니다.
              </p>
              <div className="warning-list">
                <p><strong>다음 사항을 확인하세요:</strong></p>
                <ul>
                  <li>진행 중인 복원 작업이 중단됩니다</li>
                  <li>취소 후 시스템 상태를 반드시 확인해야 합니다</li>
                </ul>
              </div>

              <div className="confirmation-text">
                <strong>정말로 복원을 취소하시겠습니까?</strong>
              </div>
            </div>
          </div>
        </main>

        <footer className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            닫기
          </button>
          <button
            className="btn btn-danger"
            onClick={handleCancelRestore}
          >
            복원 취소
          </button>
        </footer>
      </div>
    </div>
  );
};

export default RestoreCancelModal;