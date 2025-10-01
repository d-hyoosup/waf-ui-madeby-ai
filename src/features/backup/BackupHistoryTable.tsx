// src/features/backup/BackupHistoryTable.tsx
import React, { useMemo, useState } from 'react';
import '../../components/styles/TableStyles.css';
import { ExternalLinkIcon } from '../../components/common/Icons.tsx';
import type { BackupItem, BackupStatus } from '../../types/api.types.ts';
import { getRegionDisplayName } from '../../constants/awsRegions.ts';

// Helper functions moved from deleted mockData file
export const getStatusBadgeClass = (status: BackupStatus): string => {
  switch (status) {
    case 'INIT': return 'badge-secondary';
    case 'APPLIED': return 'badge-success';
    case 'ARCHIVED': return 'badge-secondary';
    case 'ROLLBACK_WAIT_FOR_APPLY': return 'badge-warning';
    case 'ROLLBACK_INPROGRESS': return 'badge-restoring';
    default: return 'badge-secondary';
  }
};

export const getStatusText = (status: BackupStatus): string => {
  switch (status) {
    case 'INIT': return '초기상태';
    case 'APPLIED': return '적용중';
    case 'ARCHIVED': return '보관됨';
    case 'ROLLBACK_WAIT_FOR_APPLY': return '복원대기';
    case 'ROLLBACK_INPROGRESS': return '복원중';
    default: return status;
  }
};

export const getRollbackActionText = (action: string): string => {
  switch (action) {
    case 'JIRA_APPROVAL_WAITING': return '긴급 승인';
    case 'ROLLBACK_CANCEL': return '복원 취소';
    case 'VIEW_DETAIL': return '상세 보기';
    default: return '';
  }
};

export const getRollbackActionBadgeClass = (action: string): string => {
  switch (action) {
    case 'JIRA_APPROVAL_WAITING': return 'badge-danger';
    case 'ROLLBACK_CANCEL': return 'badge-warning';
    case 'VIEW_DETAIL': return 'badge-info';
    default: return 'badge-secondary';
  }
};


interface BackupHistoryTableProps {
    data: BackupItem[];
    selectedItems: string[];
    onSelectionChange: (newSelection: string[]) => void;
    onRestoreAction: (action: string, backupId: string) => void;
}

type SortField = 'id' | 'accountId' | 'region' | 'type' | 'status';
type SortOrder = 'asc' | 'desc';

const BackupHistoryTable: React.FC<BackupHistoryTableProps> = ({
    data,
    selectedItems,
    onSelectionChange,
    onRestoreAction
}) => {
    const [expandedIssues, setExpandedIssues] = useState<string | null>(null);
    const [sortField, setSortField] = useState<SortField>('id');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

    const sortedData = useMemo(() => {
        const sorted = [...data].sort((a, b) => {
            const aValue = a[sortField];
            const bValue = b[sortField];

            if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
        return sorted;
    }, [data, sortField, sortOrder]);

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    const getSortIcon = (field: SortField) => {
        if (sortField !== field) return ' ↕️';
        return sortOrder === 'asc' ? ' ⬇️' : '⬆️';
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            onSelectionChange(data.map(item => item.id));
        } else {
            onSelectionChange([]);
        }
    };

    const handleSelectItem = (id: string) => {
        const newSelection = selectedItems.includes(id)
            ? selectedItems.filter(item => item !== id)
            : [...selectedItems, id];
        onSelectionChange(newSelection);
    };

    const isAllSelected = useMemo(() =>
        data.length > 0 && selectedItems.length === data.length,
        [selectedItems, data]
    );

    const toggleExpandedIssues = (itemId: string, event: React.MouseEvent) => {
        event.stopPropagation();
        setExpandedIssues(expandedIssues === itemId ? null : itemId);
    };

    const renderJiraIssues = (item: BackupItem) => {
        const issues = item.jiraIssues || [];
        if (issues.length === 0) return <div className="jira-issue-container" />;

        const firstIssue = issues[0];
        const remainingIssues = issues.slice(1);
        const isExpanded = expandedIssues === item.id;

        return (
            <div className="jira-issue-container">
                <div className="jira-issue-links">
                    <div className="jira-issue-main">
                        <a href={`#jira/${firstIssue}`} target="_blank" rel="noopener noreferrer" className="jira-issue-link" onClick={(e) => e.stopPropagation()}>
                            {firstIssue} <ExternalLinkIcon />
                        </a>
                    </div>
                    {remainingIssues.length > 0 && (
                        <div className="jira-issue-extra">
                            <button className={`jira-more-indicator ${isExpanded ? 'active' : ''}`} onClick={(e) => toggleExpandedIssues(item.id, e)}>
                                {isExpanded ? '−' : `+${remainingIssues.length}`}
                            </button>
                        </div>
                    )}
                    {remainingIssues.length > 0 && (
                        <div className={`jira-expanded-issues ${isExpanded ? 'show' : ''}`}>
                            {remainingIssues.map((issue: string, index: number) => (
                                <a key={index} href={`#jira/${issue}`} target="_blank" rel="noopener noreferrer" className="jira-issue-link" onClick={(e) => e.stopPropagation()}>
                                    {issue} <ExternalLinkIcon />
                                </a>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderActionButtons = (item: BackupItem) => {
        const showOnlyDetailButton = item.status === 'ROLLBACK_INPROGRESS' || (item.status === 'ARCHIVED' && (item.issueCount ?? 0) > 0);
        const showAllButtons = item.status === 'ROLLBACK_WAIT_FOR_APPLY';


        if (!showOnlyDetailButton && !showAllButtons) return null;

        return (
            <div className="action-badges">
                {showOnlyDetailButton && (
                    <button className={`badge ${getRollbackActionBadgeClass('VIEW_DETAIL')}`} onClick={() => onRestoreAction('VIEW_DETAIL', item.id)}>
                        {getRollbackActionText('VIEW_DETAIL')}
                    </button>
                )}
                {showAllButtons && (
                    <>
                        <button className={`badge ${getRollbackActionBadgeClass('JIRA_APPROVAL_WAITING')}`} onClick={() => onRestoreAction('JIRA_APPROVAL_WAITING', item.id)}>
                            {getRollbackActionText('JIRA_APPROVAL_WAITING')}
                        </button>
                        <button className={`badge ${getRollbackActionBadgeClass('ROLLBACK_CANCEL')}`} onClick={() => onRestoreAction('ROLLBACK_CANCEL', item.id)}>
                            {getRollbackActionText('ROLLBACK_CANCEL')}
                        </button>
                        <button className={`badge ${getRollbackActionBadgeClass('VIEW_DETAIL')}`} onClick={() => onRestoreAction('VIEW_DETAIL', item.id)}>
                            {getRollbackActionText('VIEW_DETAIL')}
                        </button>
                    </>
                )}
            </div>
        );
    };

    return (
        <div className="table-container">
            <table className="data-table" style={{ tableLayout: 'fixed', width: '100%' }}>
                <thead>
                    <tr>
                        <th style={{ width: '4%' }}><input type="checkbox" onChange={handleSelectAll} checked={isAllSelected} /></th>
                        <th style={{ width: '12%', cursor: 'pointer' }} onClick={() => handleSort('accountId')}>Account{getSortIcon('accountId')}</th>
                        <th style={{ width: '14%', cursor: 'pointer' }} onClick={() => handleSort('region')}>리전{getSortIcon('region')}</th>
                        <th style={{ width: '16%', cursor: 'pointer' }} onClick={() => handleSort('id')}>Tag (ID){getSortIcon('id')}</th>
                        <th style={{ width: '10%', cursor: 'pointer' }} onClick={() => handleSort('type')}>백업 방식{getSortIcon('type')}</th>
                        <th style={{ width: '8%', cursor: 'pointer' }} onClick={() => handleSort('status')}>상태{getSortIcon('status')}</th>
                        <th style={{ width: '18%' }}>Jira 이슈</th>
                        <th style={{ width: '18%' }}>작업</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedData.map((item) => {
                        const isSelected = selectedItems.includes(item.id);
                        const rowClasses = [ isSelected ? 'selected' : '', item.requiresManualBackup ? 'requires-manual-backup' : '' ].filter(Boolean).join(' ');

                        return (
                            <tr key={item.id} className={rowClasses}>
                                <td><input type="checkbox" checked={isSelected} onChange={() => handleSelectItem(item.id)} /></td>
                                <td>{item.accountId}</td>
                                <td>{getRegionDisplayName(item.region)}</td>
                                <td><a href={`#gitlab-link-for-${item.id}`} target="_blank" rel="noopener noreferrer">{item.id} <ExternalLinkIcon /></a></td>
                                <td>{item.type}</td>
                                <td><span className={`badge ${getStatusBadgeClass(item.status)}`}>{getStatusText(item.status)}</span></td>
                                <td>{renderJiraIssues(item)}</td>
                                <td>{renderActionButtons(item)}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default BackupHistoryTable;