// src/components/EmergencyApprovalModal.tsx
import React, { useState } from 'react';
import './ModalStyles.css';

interface EmergencyApprovalModalProps {
  onClose: () => void;
}

const EmergencyApprovalModal: React.FC<EmergencyApprovalModalProps> = ({ onClose }) => {
  const [step, setStep] = useState<'request' | 'submit'>('request');
  const [issuedToken, setIssuedToken] = useState<string>('');
  const [inputToken, setInputToken] = useState<string>('');

  // 1단계: 토큰 발급 요청 처리
  const handleRequestToken = () => {
    // 실제로는 API를 통해 토큰을 받아옵니다. 여기서는 6자리 랜덤 숫자를 생성합니다.
    const newToken = '262a0ff4-70a4-4e05-8381-de3096f41527';
    setIssuedToken(newToken);
    setStep('submit'); // 2단계(입력/제출)로 전환
  };

  // 2단계: 긴급 승인 최종 요청 처리
  const handleSubmitApproval = () => {
    if (inputToken === issuedToken) {
      alert('긴급 승인이 성공적으로 요청되었습니다.');
      onClose(); // 성공 시 모달 닫기
    } else {
      alert('토큰이 일치하지 않습니다. 다시 확인해 주세요.');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content small-modal">
        <header className="modal-header">
          <h3>{step === 'request' ? '토큰 발급 요청' : '긴급 승인 요청'}</h3>
          <button className="close-button" onClick={onClose}>&times;</button>
        </header>

        <main className="modal-body">
          {step === 'request' && (
            <div className="approval-step-container">
              <p>긴급 승인을 진행하려면 일회용 토큰이 필요합니다. 아래 버튼을 눌러 토큰을 발급받으세요.</p>
            </div>
          )}

          {step === 'submit' && (
            <div className="approval-step-container">
              <div className="token-display-box">
                <strong>발급된 토큰:</strong>
                <span className="token-value">{issuedToken}</span>
              </div>
              <p>위 토큰을 아래 입력란에 입력하고 승인을 요청하세요.</p>
              <div className="form-group">
                <label htmlFor="tokenInput">토큰 입력</label>
                <input
                  id="tokenInput"
                  type="text"
                  value={inputToken}
                  onChange={(e) => setInputToken(e.target.value)}
                  placeholder="6자리 토큰을 입력하세요"
                />
              </div>
            </div>
          )}
        </main>

        <footer className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>취소</button>
          {step === 'request' && (
            <button className="btn btn-primary" onClick={handleRequestToken}>토큰 발급 요청</button>
          )}
          {step === 'submit' && (
            <button
              className="btn btn-danger"
              onClick={handleSubmitApproval}
              disabled={inputToken !== issuedToken || !inputToken}
            >
              긴급 승인 요청
            </button>
          )}
        </footer>
      </div>
    </div>
  );
};

export default EmergencyApprovalModal;