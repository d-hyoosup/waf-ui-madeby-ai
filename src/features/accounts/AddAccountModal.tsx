// src/components/AddAccountModal.tsx
import { useState } from 'react';
import '../../components/styles/ModalStyles.css';

interface AddAccountModalProps {
  onClose: () => void;
}

const AddAccountModal: React.FC<AddAccountModalProps> = ({ onClose }) => {
  const [accountId, setAccountId] = useState('987654321098');
  const [accountName] = useState('WAF Manager A');

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <header className="modal-header">
          <h3>계정 추가</h3>
          <button className="close-button" onClick={onClose}>&times;</button>
        </header>
        <main className="modal-body">
          <div className="form-group">
            <label htmlFor="accountId">Account ID</label>
            {/* ✅ [수정] input과 button을 div로 감싸 스타일 적용 */}
            <div className="input-group">
              <input id="accountId" type="text" value={accountId} onChange={(e) => setAccountId(e.target.value)} />
              <button className="btn btn-secondary">조회</button>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="accountName">Account Name</label>
            <input id="accountName" type="text" value={accountName} readOnly />
          </div>
        </main>
        <footer className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>취소</button>
          <button className="btn btn-primary">추가</button>
        </footer>
      </div>
    </div>
  );
};

export default AddAccountModal;