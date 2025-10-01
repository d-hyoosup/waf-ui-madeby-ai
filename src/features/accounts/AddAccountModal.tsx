// src/features/accounts/AddAccountModal.tsx
import { useState } from 'react';
import '../../components/styles/ModalStyles.css';
import { getAccountById, addAccount } from '../../api/accountService.ts';

interface AddAccountModalProps {
  onClose: (shouldRefetch: boolean) => void;
}

const AddAccountModal: React.FC<AddAccountModalProps> = ({ onClose }) => {
  const [accountId, setAccountId] = useState('');
  const [accountName, setAccountName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleQuery = async () => {
    if (!accountId) {
      setError('Account ID를 입력해주세요.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const account = await getAccountById(accountId);
      setAccountName(account.accountName);
    } catch (err) {
      setError('계정 정보를 조회할 수 없습니다.');
      setAccountName('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = async () => {
      if(!accountId || !accountName) {
          setError('계정 정보가 올바르지 않습니다.');
          return;
      }
      setIsLoading(true);
      setError('');
      try {
          await addAccount({ accountId, accountName });
          alert('계정이 성공적으로 추가되었습니다.');
          onClose(true);
      } catch (err: any) {
          setError(err.metaInfo?.message || '계정 추가에 실패했습니다.');
      } finally {
          setIsLoading(false);
      }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <header className="modal-header">
          <h3>계정 추가</h3>
          <button className="close-button" onClick={() => onClose(false)}>&times;</button>
        </header>
        <main className="modal-body">
          <div className="form-group">
            <label htmlFor="accountId">Account ID</label>
            <div className="input-group">
              <input id="accountId" type="text" value={accountId} onChange={(e) => setAccountId(e.target.value)} />
              <button className="btn btn-secondary" onClick={handleQuery} disabled={isLoading}>
                {isLoading ? '조회중...' : '조회'}
              </button>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="accountName">Account Name</label>
            <input id="accountName" type="text" value={accountName} readOnly />
          </div>
          {error && <p style={{ color: 'red' }}>{error}</p>}
        </main>
        <footer className="modal-footer">
          <button className="btn btn-secondary" onClick={() => onClose(false)}>취소</button>
          <button className="btn btn-primary" onClick={handleAdd} disabled={isLoading || !accountName}>
            {isLoading ? '추가중...' : '추가'}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default AddAccountModal;