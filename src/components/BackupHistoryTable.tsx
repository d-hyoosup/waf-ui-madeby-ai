// src/components/BackupHistoryTable.tsx
import React, { useMemo } from 'react';
import './TableStyles.css';
import { ExternalLinkIcon } from './Icons';
import {
    BackupItem,
    getStatusBadgeClass,
    getStatusText,
    getRollbackStatusText,
    getRollbackBadgeClass
} from '../data/mockBackupData';
import { getRegionDisplayName } from '../constants/awsRegions';

interface BackupHistoryTableProps {
    data: BackupItem[];
    selectedItems: string[];
    onSelectionChange: (newSelection: string[]) => void;
    onJiraIssueClick: (issueCount: number, backupId: string) => void;
    onRestoreAction: (action: string, backupId: string) => void;
}

const BackupHistoryTable: React.FC<BackupHistoryTableProps> = ({
    data,
    selectedItems,
    onSelectionChange,
    onJiraIssueClick,
    onRestoreAction
}) => {
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            onSelectionChange(data.map(item => item.id));
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

    const isAllSelected = useMemo(() =>
        data.length > 0 && selectedItems.length === data.length,
        [selectedItems, data]
    );

    return (
        <div className="table-container">
            <table className="data-table" style={{ tableLayout: 'fixed', width: '100%' }}>
                <thead>
                    <tr>
                        <th style={{ width: '50px' }}>
                            <input
                                type="checkbox"
                                onChange={handleSelectAll}
                                checked={isAllSelected}
                            />
                        </th>
                        <th style={{ width: '120px' }}>Account</th>
                        <th style={{ width: '200px' }}>리전</th>
                        <th style={{ width: '140px' }}>Tag (ID)</th>
                        <th style={{ width: '90px' }}>백업 방식</th>
                        <th style={{ width: '90px' }}>상태</th>
                        <th style={{ width: '150px' }}>Jira 이슈</th>
                        <th style={{ width: '160px' }}>작업</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item) => (
                        <tr key={item.id} className={selectedItems.includes(item.id) ? 'selected' : ''}>
                            <td>
                                <input
                                    type="checkbox"
                                    checked={selectedItems.includes(item.id)}
                                    onChange={() => handleSelectItem(item.id)}
                                />
                            </td>
                            <td>{item.account}</td>
                            <td>{getRegionDisplayName(item.region)}</td>
                            <td>
                                <a
                                    href={`#gitlab-link-for-${item.id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ display: 'inline-flex', alignItems: 'center' }}
                                >
                                    {item.id}
                                    <ExternalLinkIcon />
                                </a>
                            </td>
                            <td>{item.type}</td>
                            <td>
                                <span className={`badge ${getStatusBadgeClass(item.status)}`}>
                                    {getStatusText(item.status)}
                                </span>
                            </td>
                            <td>
                                {item.jiraIssues && item.jiraIssues.length > 0 && (
                                    <div className="jira-issue-links">
                                        {item.jiraIssues.map((issue, index) => (
                                            <a
                                                key={index}
                                                href={`https://jira.example.com/browse/${issue}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="jira-issue-link"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                {issue}
                                                <ExternalLinkIcon />
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </td>
                            <td>
                                {item.status === 'ROLLBACK_INPROGRESS' && (
                                    <div className="action-badges">
                                        {item.rollbackStatus === 'JIRA_APPROVAL_WAITING' && (
                                            <button
                                                className={`badge-button ${getRollbackBadgeClass('JIRA_APPROVAL_WAITING')}`}
                                                onClick={() => onRestoreAction('JIRA_APPROVAL_WAITING', item.id)}
                                            >
                                                {getRollbackStatusText('JIRA_APPROVAL_WAITING')}
                                            </button>
                                        )}
                                        {item.rollbackStatus === 'ROLLBACK_CANCEL' && (
                                            <button
                                                className={`badge-button ${getRollbackBadgeClass('ROLLBACK_CANCEL')}`}
                                                onClick={() => onRestoreAction('ROLLBACK_CANCEL', item.id)}
                                            >
                                                {getRollbackStatusText('ROLLBACK_CANCEL')}
                                            </button>
                                        )}
                                        {item.rollbackStatus === 'VIEW_DETAIL' && (
                                            <button
                                                className={`badge-button ${getRollbackBadgeClass('VIEW_DETAIL')}`}
                                                onClick={() => onRestoreAction('VIEW_DETAIL', item.id)}
                                            >
                                                {getRollbackStatusText('VIEW_DETAIL')}
                                            </button>
                                        )}
                                    </div>
                                )}
                                {item.status === 'ROLLBACK_WAIT_FOR_APPLY' && item.rollbackStatus && (
                                    <button
                                        className={`badge-button ${getRollbackBadgeClass(item.rollbackStatus)}`}
                                        onClick={() => onRestoreAction(item.rollbackStatus, item.id)}
                                    >
                                        {getRollbackStatusText(item.rollbackStatus)}
                                    </button>
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