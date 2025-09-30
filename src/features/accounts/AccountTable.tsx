// src/components/AccountTable.tsx
import '../../components/styles/TableStyles.css';
import { TrashIcon, EditIcon, NotificationIcon } from '../../components/common/Icons.tsx';
import { useNavigate } from 'react-router-dom';

const AccountTable = () => {
    const navigate = useNavigate();
    const accounts = [
        { id: '123456789012', name: 'hmr_manager@hyundai.com' },
        { id: '987654321098', name: 'hae_manager@hyundai.com' },
    ];

    const handleEditClick = () => {
        navigate('/manage-settings', { state: { defaultTab: 'management' } });
    };

    const handleNotificationClick = () => {
        navigate('/manage-settings', { state: { defaultTab: 'alert' } });
    };

    const handleDeleteClick = (accountId: string) => {
        if (window.confirm(`정말로 계정 '${accountId}'을(를) 삭제하시겠습니까?`)) {
            // 실제 삭제 로직을 여기에 구현합니다.
            console.log(`Deleting account: ${accountId}`);
            alert(`계정 '${accountId}'이(가) 삭제되었습니다.`);
        }
    };

    return (
        <div className="table-container">
            <table className="data-table">
                {/* ... thead ... */}
                <thead>
                    <tr>
                        <th>계정</th>
                        <th>이름</th>
                        <th style={{ width: '150px' }}>관리</th>
                    </tr>
                </thead>
                <tbody>
                    {accounts.map((account) => (
                        <tr key={account.id}>
                            <td>{account.id}</td>
                            <td>{account.name}</td>
                            <td>
                                <div className="btn-group">
                                    <button className="btn-table" title="관리 설정" onClick={handleEditClick}>
                                        <EditIcon />
                                    </button>
                                    <button className="btn-table" title="알림 설정" onClick={handleNotificationClick}>
                                        <NotificationIcon />
                                    </button>
                                    <button className="btn-table" title="삭제하기" onClick={() => handleDeleteClick(account.id)}>
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