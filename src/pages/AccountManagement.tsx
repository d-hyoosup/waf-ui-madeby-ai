// src/pages/AccountManagement.tsx
import { useState } from 'react';
import PageContainer from '../components/PageContainer';
import AccountTable from '../components/AccountTable';
import AddAccountModal from '../components/AddAccountModal';

const AccountManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <PageContainer
      title="계정 관리"
      controls={
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          계정 추가
        </button>
      }
    >
      <AccountTable />
      {isModalOpen && <AddAccountModal onClose={() => setIsModalOpen(false)} />}
    </PageContainer>
  );
};

export default AccountManagement;