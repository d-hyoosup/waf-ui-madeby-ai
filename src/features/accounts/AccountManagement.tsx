// src/features/accounts/AccountManagement.tsx
import { useState, useEffect } from 'react';
import PageContainer from '../../components/common/PageContainer.tsx';
import AccountTable from './AccountTable.tsx';
import AddAccountModal from './AddAccountModal.tsx';
import { getAccounts } from '../../api/accountService.ts';
import type { WafManagerAccount } from '../../types/api.types.ts';

const AccountManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [accounts, setAccounts] = useState<WafManagerAccount[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const response = await getAccounts({ page: 1, pageSize: 100 }); // Adjust paging as needed
      setAccounts(response.content);
    } catch (error) {
      console.error("Failed to fetch accounts", error);
      // Handle error UI
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleModalClose = (shouldRefetch: boolean) => {
    setIsModalOpen(false);
    if (shouldRefetch) {
      fetchAccounts();
    }
  };


  return (
    <PageContainer
      title="계정 관리"
      controls={
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          계정 추가
        </button>
      }
    >
      {loading ? <p>Loading...</p> : <AccountTable accounts={accounts} onRefresh={fetchAccounts} />}
      {isModalOpen && <AddAccountModal onClose={handleModalClose} />}
    </PageContainer>
  );
};

export default AccountManagement;