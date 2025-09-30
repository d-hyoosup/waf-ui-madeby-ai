// src/components/EmergencyApprovalModal.tsx
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
  const [approver, setApprover] = useState('사용자');
  const [reason, setReason] = useState('긴급 승인');

  const handleEmergencyRestore = () => {
    // if (!approver.trim() || !reason.trim()) {
    //   alert('승인자와 사유를 모두 입력해주세요.');
    //   return;
    // }
    onConfirm(approver, reason);
    onClose();
  };

  // const isFormValid = approver.trim().length > 0 && reason.trim().length > 0;

  return (
    <div className="modal-overlay">
      <div className="modal-content emergency-modal">
        <header className="modal-header">
          <h3>⚠️ 긴급 복원 승인</h3>
          <button className="close-button" onClick={onClose}>&times;</button>
        </header>

        <main className="modal-body">
          <div className="emergency-warning-container">
            {/*<div className="warning-icon">⚠️</div>*/}
            <div className="warning-content">
              {/*<h4>긴급 복원 실행 경고</h4>*/}
              <p>
                  Gitlab tag: <strong>{backupId}</strong>를 긴급 복원하려고 합니다.
              </p>
              <div className="warning-list">
                <p><strong>다음 사항을 반드시 확인하세요:</strong></p>
                <ul>
                  <li>정상적인 Jira 승인 절차가 생략됩니다</li>
                  {/*<li>현재 적용 중인 WAF 규칙이 즉시 변경됩니다</li>*/}
                  <li>서비스에 영향을 줄 수 있는 중요한 작업입니다</li>
                  {/*<li>복원 후 되돌리기가 어려울 수 있습니다</li>*/}
                  {/*<li>모든 책임은 승인자에게 있습니다</li>*/}
                </ul>
              </div>

              {/*
              <div className="approval-form">
                <div className="form-group">
                  <label htmlFor="approver">승인자 *</label>
                  <input
                    id="approver"
                    type="text"
                    value={approver}
                    onChange={(e) => setApprover(e.target.value)}
                    placeholder="승인자 이름을 입력하세요"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="reason">긴급 복원 사유 *</label>
                  <textarea
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="긴급 복원이 필요한 구체적인 사유를 입력하세요"
                    className="form-textarea"
                    rows={4}
                  />
                </div>
              </div>
              */}

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
            // disabled={!isFormValid}
          >
            긴급 복원 승인
          </button>
        </footer>
      </div>
    </div>
  );
};

export default EmergencyApprovalModal;