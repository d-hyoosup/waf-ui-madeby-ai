// src/features/accounts/AccountTable.tsx
import '../../components/styles/TableStyles.css';
import { TrashIcon, EditIcon, NotificationIcon } from '../../components/common/Icons.tsx';
import { useNavigate } from 'react-router-dom';
import type { WafManagerAccount } from '../../types/api.types.ts';
import { AccountService } from '../../api';

interface AccountTableProps {
    accounts: WafManagerAccount[];
    onRefresh: () => void;
}

const AccountTable: React.FC<AccountTableProps> = ({ accounts, onRefresh }) => {
    const navigate = useNavigate();

    const handleEditClick = () => {
        navigate('/manage-settings', { state: { defaultTab: 'management' } });
    };

    const handleNotificationClick = () => {
        navigate('/manage-settings', { state: { defaultTab: 'alert' } });
    };

    const handleDeleteClick = async (accountId: string, accountName: string) => {
        if (window.confirm(`정말로 계정 '${accountName} (${accountId})'을(를) 삭제하시겠습니까?`)) {
            try {
                await AccountService.deleteAccount(accountId);
                alert(`계정 '${accountName}'이(가) 삭제되었습니다.`);
                onRefresh();
            } catch (error) {
                console.error(`Failed to delete account: ${accountId}`, error);
                alert('계정 삭제에 실패했습니다.');
            }
        }
    };

    return (
        <div className="table-container">
            <table className="data-table">
                <thead>
                    <tr>
                        <th>계정 ID</th>
                        <th>계정 이름</th>
                        <th style={{ width: '150px' }}>관리</th>
                    </tr>
                </thead>
                <tbody>
                    {accounts.map((account) => (
                        <tr key={account.accountId}>
                            <td>{account.accountId}</td>
                            <td>{account.accountName}</td>
                            <td>
                                <div className="btn-group">
                                    <button className="btn-table" title="관리 설정" onClick={handleEditClick}>
                                        <EditIcon />
                                    </button>
                                    <button className="btn-table" title="알림 설정" onClick={handleNotificationClick}>
                                        <NotificationIcon />
                                    </button>
                                    <button className="btn-table" title="삭제하기" onClick={() => handleDeleteClick(account.accountId, account.accountName)}>
                                        <TrashIcon />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AccountTable;