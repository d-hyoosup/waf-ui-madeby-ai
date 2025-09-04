import React, { useMemo } from 'react';
import './TableStyles.css';
import { ExternalLinkIcon } from './Icons';

// 업데이트된 데이터 구조
const backupData = [
    { id: '20250112-150430', account: '123456789012', region: 'Global(CloudFront)', type: '수동', status: '적용중', jiraIssue: '' },
    { id: '20241223-112030', account: '123456789012', region: 'Global(CloudFront)', type: '수동', status: '보관됨', jiraIssue: '' },
    { id: '20241010-150530', account: '123456789012', region: 'Global(CloudFront)', type: '수동', status: '복원중', jiraIssue: 'GCI-GW-001' },
    { id: '20240615-152230', account: '123456789012', region: 'ap-northeast-2', type: '수동', status: '보관됨', jiraIssue: '' },
    { id: '20250915-152230', account: '123456789012', region: 'ap-northeast-2', type: '수동', status: '백업 필요', jiraIssue: '' },
];

// 통합된 상태 배지 스타일 결정 함수
const getStatusBadgeClass = (status: string) => {
    switch (status) {
        case '적용중': return 'badge-success';
        case '보관됨': return 'badge-secondary';
        case '복원중': return 'badge-restoring';
        case '백업 필요': return 'badge-warning';
        default: return 'badge-secondary';
    }
};

interface BackupHistoryTableProps {
  selectedItems: string[];
  onSelectionChange: (newSelection: string[]) => void;
  onJiraIssueClick: () => void;
}

const BackupHistoryTable: React.FC<BackupHistoryTableProps> = ({ selectedItems, onSelectionChange, onJiraIssueClick }) => {
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            onSelectionChange(backupData.map(item => item.id));
        } else {
            onSelectionChange([]);
        }
    };

    const handleSelectItem = (id: string) => {
        let newSelection;
        if (selectedItems.includes(id)) {
            newSelection = selectedItems.filter(item => item !== id);
        } else {
            newSelection = [...selectedItems, id];
        }
        onSelectionChange(newSelection);
    };

    const isAllSelected = useMemo(() => backupData.length > 0 && selectedItems.length === backupData.length, [selectedItems]);

    return (
        <div className="table-container">
            <table className="data-table" style={{ tableLayout: 'fixed', width: '100%' }}>
                <thead>
                    <tr>
                        <th style={{ width: '50px' }}>
                            <input type="checkbox" onChange={handleSelectAll} checked={isAllSelected} />
                        </th>
                        <th style={{ width: '130px' }}>Account</th>
                        <th style={{ width: '180px' }}>리전</th>
                        <th style={{ width: '160px' }}>Tag (ID)</th>
                        <th style={{ width: '100px' }}>백업 방식</th>
                        <th style={{ width: '100px' }}>상태</th>
                        <th style={{ width: '120px' }}>Jira 이슈</th>
                    </tr>
                </thead>
                <tbody>
                    {backupData.map((item) => (
                        <tr key={item.id} className={selectedItems.includes(item.id) ? 'selected' : ''}>
                            <td>
                                <input type="checkbox" checked={selectedItems.includes(item.id)} onChange={() => handleSelectItem(item.id)} />
                            </td>
                            <td>{item.account}</td>
                            <td>{item.region}</td>
                            <td>
                                <a href={`#gitlab-link-for-${item.id}`} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center' }}>
                                    {item.id}
                                    <ExternalLinkIcon />
                                </a>
                            </td>
                            <td>{item.type}</td>
                            <td>
                                <span className={`badge ${getStatusBadgeClass(item.status)}`}>{item.status}</span>
                            </td>
                            <td>
                                {item.jiraIssue && (
                                    <a
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            onJiraIssueClick(item.issueCount || 1, item.id);
                                        }}
                                        className="jira-issue-link"
                                    >
                                        {(item.issueCount && item.issueCount > 1) ? `${item.issueCount}개 이슈` : item.jiraIssue}
                                    </a>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default BackupHistoryTable;