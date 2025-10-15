// src/features/backup/BackupHistoryTable.tsx
import React, { useMemo, useState } from 'react';
import '../../components/styles/TableStyles.css';
import { ExternalLinkIcon } from '../../components/common/Icons.tsx';
import type { BackupItem } from '../../types/api.types.ts';
import { getRegionDisplayName } from '../../constants/awsRegions.ts';
import {
    getStatusBadgeClass,
    getStatusText,
    getRollbackActionText,
    getRollbackActionBadgeClass
} from './backupUtils.ts';


interface BackupHistoryTableProps {
    data: BackupItem[];
    selectedItems: string[];
    onSelectionChange: (newSelection: string[]) => void;
    onRestoreAction: (action: string, backupId: string) => void;
    onRestoreClick: (backupId: string) => void;
}

type SortField = 'tagName' | 'accountId' | 'region' | 'type' | 'state';
type SortOrder = 'asc' | 'desc';

const BackupHistoryTable: React.FC<BackupHistoryTableProps> = ({
    data,
    selectedItems,
    onSelectionChange,
    onRestoreAction,
    onRestoreClick,
}) => {
    const [expandedIssues, setExpandedIssues] = useState<string | null>(null);
    const [sortField, setSortField] = useState<SortField>('tagName');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

    const sortedData = useMemo(() => {
        return [...data].sort((a, b) => {
            const aValue = a[sortField];
            const bValue = b[sortField];

            if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
    }, [data, sortField, sortOrder]);

    const handleSort = (field: SortField) => {
        setSortField(field);
        setSortOrder(current => (current === 'asc' ? 'desc' : 'asc'));
    };

    const getSortIcon = (field: SortField) => {
        if (sortField !== field) return ' ↕️';
        return sortOrder === 'asc' ? ' ⬇️' : '⬆️';
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        onSelectionChange(e.target.checked ? data.map(item => item.id) : []);
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
        const showDetailButton = item.state === 'ROLLBACK_IN_PROGRESS' || (item.state === 'ARCHIVED' && (item.issueCount ?? 0) > 0);
        const showAllButtons = item.state === 'ROLLBACK_WAIT_FOR_APPLY';
        const showRestoreButton = item.state === 'ARCHIVED';

        return (
            <div className="action-badges">
                {showRestoreButton && (
                    <button className={`badge ${getRollbackActionBadgeClass('RESTORE')}`} onClick={() => onRestoreClick(item.id)}>
                        {getRollbackActionText('RESTORE')}
                    </button>
                )}
                {showDetailButton && !showAllButtons && (
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
                        <th style={{ width: '16%', cursor: 'pointer' }} onClick={() => handleSort('tagName')}>Tag (ID){getSortIcon('tagName')}</th>
                        <th style={{ width: '10%', cursor: 'pointer' }} onClick={() => handleSort('type')}>백업 방식{getSortIcon('type')}</th>
                        <th style={{ width: '8%', cursor: 'pointer' }} onClick={() => handleSort('state')}>상태{getSortIcon('state')}</th>
                        <th style={{ width: '18%' }}>Jira 이슈</th>
                        <th style={{ width: '18%' }}>동작</th>
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
                                <td><a href={`#gitlab-link-for-${item.tagName}`} target="_blank" rel="noopener noreferrer">{item.tagName} <ExternalLinkIcon /></a></td>
                                <td>{item.type}</td>
                                <td><span className={`badge ${getStatusBadgeClass(item.state)}`}>{getStatusText(item.state)}</span></td>
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