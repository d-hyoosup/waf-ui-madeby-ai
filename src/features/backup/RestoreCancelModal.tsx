// src/components/RestoreCancelModal.tsx
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
  const [requester, setRequester] = useState('');
  const [reason, setReason] = useState('');

  const handleCancelRestore = () => {
    if (!requester.trim() || !reason.trim()) {
      alert('요청자와 사유를 모두 입력해주세요.');
      return;
    }
    onConfirm(requester, reason);
    onClose();
  };

  const isFormValid = requester.trim().length > 0 && reason.trim().length > 0;

  return (
    <div className="modal-overlay">
      <div className="modal-content emergency-modal">
        <header className="modal-header">
          <h3>복원 취소 요청</h3>
          <button className="close-button" onClick={onClose}>&times;</button>
        </header>

        <main className="modal-body">
          <div className="emergency-warning-container">
            <div className="warning-icon">🛑</div>
            <div className="warning-content">
              <h4>복원 취소 확인</h4>
              <p>
                <strong>백업 ID: {backupId}</strong>의 복원을 취소하려고 합니다.
              </p>
              <div className="warning-list">
                <p><strong>다음 사항을 확인하세요:</strong></p>
                <ul>
                  <li>진행 중인 복원 작업이 중단됩니다</li>
                  <li>일부 변경사항이 이미 적용되었을 수 있습니다</li>
                  <li>취소 후 시스템 상태를 반드시 확인해야 합니다</li>
                  <li>취소 사유는 기록으로 남습니다</li>
                </ul>
              </div>

              <div className="approval-form">
                <div className="form-group">
                  <label htmlFor="requester">요청자 *</label>
                  <input
                    id="requester"
                    type="text"
                    value={requester}
                    onChange={(e) => setRequester(e.target.value)}
                    placeholder="요청자 이름을 입력하세요"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="reason">복원 취소 사유 *</label>
                  <textarea
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="복원을 취소하는 구체적인 사유를 입력하세요"
                    className="form-textarea"
                    rows={4}
                  />
                </div>
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
            disabled={!isFormValid}
          >
            복원 취소
          </button>
        </footer>
      </div>
    </div>
  );
};

export default RestoreCancelModal;