// src/features/backup/BackupHistoryTable.tsx
import React, { useMemo, useState } from 'react';
import '../../components/styles/TableStyles.css';
import { ExternalLinkIcon } from '../../components/common/Icons.tsx';
// Update import: JiraInfo might not be needed if directly accessing item.jira
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
    onRestoreClick: (backupId: string) => void; // Added for clarity
}

// ✅ [수정] SortField 에 backupType 추가 (Swagger 스키마 기준)
type SortField = 'tagName' | 'accountId' | 'regionCode' | 'backupType' | 'state';
type SortOrder = 'asc' | 'desc';

const BackupHistoryTable: React.FC<BackupHistoryTableProps> = ({
    data,
    selectedItems,
    onSelectionChange,
    onRestoreAction,
    onRestoreClick, // Use this prop
}) => {
    const [expandedIssues, setExpandedIssues] = useState<Record<string, boolean>>({}); // Use object for multiple expansions
    const [sortField, setSortField] = useState<SortField>('tagName');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

    const sortedData = useMemo(() => {
        return [...data].sort((a, b) => {
            const aValue = a[sortField];
            const bValue = b[sortField];

            // Handle undefined or null safely, particularly for nested properties if needed later
            if (aValue === undefined || aValue === null) return sortOrder === 'asc' ? -1 : 1;
            if (bValue === undefined || bValue === null) return sortOrder === 'asc' ? 1 : -1;

            // Handle boolean sorting for 'managed' if added back
            // if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
            //     return sortOrder === 'asc' ? (aValue === bValue ? 0 : aValue ? -1 : 1) : (aVal === bVal ? 0 : aVal ? 1 : -1);
            // }

            // General comparison
            if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
    }, [data, sortField, sortOrder]);

    const handleSort = (field: SortField) => {
        const newOrder = (sortField === field && sortOrder === 'asc') ? 'desc' : 'asc';
        setSortField(field);
        setSortOrder(newOrder);
    };

    const getSortIcon = (field: SortField) => {
        if (sortField !== field) return ' ↕️';
        return sortOrder === 'asc' ? ' ⬇️' : '⬆️'; // Consistent icons
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.stopPropagation();
        onSelectionChange(e.target.checked ? data.map(item => item.id) : []);
    };

    const handleSelectItem = (id: string, event: React.ChangeEvent<HTMLInputElement>) => {
        event.stopPropagation();
        const isChecked = event.target.checked;
        const newSelection = isChecked
            ? [...selectedItems, id]
            : selectedItems.filter(itemId => itemId !== id);
        onSelectionChange(newSelection);
    };

    const isAllSelected = useMemo(() =>
        data.length > 0 && selectedItems.length === data.length,
        [selectedItems, data]
    );

    const toggleExpandedIssues = (itemId: string, event: React.MouseEvent) => {
        event.stopPropagation();
        setExpandedIssues(prev => ({ ...prev, [itemId]: !prev[itemId] }));
    };

    // Updated renderJiraIssues to handle the new `jira` object structure
    const renderJiraIssues = (item: BackupItem) => {
        // Use the primary jira object if available
        const primaryJira = item.jira;
        // Keep fallback to jiraIssues array for potential backward compatibility or if needed
        const issuesArray = item.jiraIssues || (primaryJira ? [primaryJira.jiraIssueKey] : []);

        if (issuesArray.length === 0) return <div className="jira-issue-container" />;

        const firstIssueKey = issuesArray[0];
        // Determine the link for the first issue
        const firstIssueLink = primaryJira?.jiraIssueKey === firstIssueKey
            ? primaryJira.jiraIssueLink
            : (item.jiraBaseUrl ? `${item.jiraBaseUrl}${firstIssueKey}` : '#'); // Fallback URL

        const remainingIssues = issuesArray.slice(1);
        const isExpanded = !!expandedIssues[item.id];

        return (
            <div className="jira-issue-container">
                <div className="jira-issue-links">
                    <div className="jira-issue-main">
                        <a href={firstIssueLink} target="_blank" rel="noopener noreferrer" className="jira-issue-link" onClick={(e) => e.stopPropagation()}>
                            {firstIssueKey} <ExternalLinkIcon />
                        </a>
                    </div>
                    {remainingIssues.length > 0 && (
                        <div className="jira-issue-extra">
                            <button className={`jira-more-indicator ${isExpanded ? 'active' : ''}`} onClick={(e) => toggleExpandedIssues(item.id, e)} aria-expanded={isExpanded}>
                                {isExpanded ? '−' : `+${remainingIssues.length}`}
                            </button>
                        </div>
                    )}
                    {remainingIssues.length > 0 && (
                        // Consider accessibility for expanded content (e.g., using details/summary or aria-controls)
                        <div className={`jira-expanded-issues ${isExpanded ? 'show' : ''}`} aria-hidden={!isExpanded}>
                            {remainingIssues.map((issueKey: string, index: number) => {
                                // Attempt to find corresponding link if primary jira object exists (unlikely for multiple issues in current API)
                                const issueLink = item.jiraBaseUrl ? `${item.jiraBaseUrl}${issueKey}` : '#';
                                return (
                                    <a key={index} href={issueLink} target="_blank" rel="noopener noreferrer" className="jira-issue-link" onClick={(e) => e.stopPropagation()}>
                                        {issueKey} <ExternalLinkIcon />
                                    </a>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // Updated renderActionButtons to use `item.state`
    const renderActionButtons = (item: BackupItem) => {
        // Use item.state for conditions
        // issueCount is calculated in BackupRestore component
        const showDetailButton = item.state === 'ROLLBACK_IN_PROGRESS' || item.state === 'ROLLING_BACK' || (item.state === 'ARCHIVED' && item.issueCount > 0);
        const showRollbackControlButtons = item.state === 'ROLLBACK_WAIT_FOR_APPLY';
        const showRestoreButton = item.state === 'ARCHIVED'; // Only show restore for ARCHIVED

        return (
            <div className="action-badges">
                {showRestoreButton && (
                    <button className={`badge ${getRollbackActionBadgeClass('RESTORE')}`} onClick={(e) => { e.stopPropagation(); onRestoreClick(item.id); }}>
                        {getRollbackActionText('RESTORE')}
                    </button>
                )}
                 {/* Show details if rolling back OR if archived with issues, OR waiting for apply */}
                {(showDetailButton || showRollbackControlButtons) && (
                    <button className={`badge ${getRollbackActionBadgeClass('VIEW_DETAIL')}`} onClick={(e) => { e.stopPropagation(); onRestoreAction('VIEW_DETAIL', item.id); }}>
                        {getRollbackActionText('VIEW_DETAIL')}
                    </button>
                )}
                {showRollbackControlButtons && (
                    <>
                        <button className={`badge ${getRollbackActionBadgeClass('JIRA_APPROVAL_WAITING')}`} onClick={(e) => { e.stopPropagation(); onRestoreAction('JIRA_APPROVAL_WAITING', item.id); }}>
                            {getRollbackActionText('JIRA_APPROVAL_WAITING')}
                        </button>
                        <button className={`badge ${getRollbackActionBadgeClass('ROLLBACK_CANCEL')}`} onClick={(e) => { e.stopPropagation(); onRestoreAction('ROLLBACK_CANCEL', item.id); }}>
                            {getRollbackActionText('ROLLBACK_CANCEL')}
                        </button>
                        {/* VIEW_DETAIL is already shown above if showRollbackControlButtons is true */}
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
                        <th style={{ width: '4%' }} onClick={(e) => e.stopPropagation()}>
                            <input
                                type="checkbox"
                                aria-label="Select all rows" // Accessibility
                                onChange={handleSelectAll}
                                checked={isAllSelected}
                            />
                        </th>
                        <th style={{ width: '12%', cursor: 'pointer' }} onClick={() => handleSort('accountId')}>Account{getSortIcon('accountId')}</th>
                        {/* Update sort field key */}
                        <th style={{ width: '14%', cursor: 'pointer' }} onClick={() => handleSort('regionCode')}>리전{getSortIcon('regionCode')}</th>
                        <th style={{ width: '16%', cursor: 'pointer' }} onClick={() => handleSort('tagName')}>Tag (ID){getSortIcon('tagName')}</th>
                        {/* ✅ [수정] 정렬 필드 backupType 사용 */}
                        <th style={{ width: '10%', cursor: 'pointer' }} onClick={() => handleSort('backupType')}>백업 방식{getSortIcon('backupType')}</th>
                        {/* Update sort field key */}
                        <th style={{ width: '8%', cursor: 'pointer' }} onClick={() => handleSort('state')}>상태{getSortIcon('state')}</th>
                        <th style={{ width: '18%' }}>Jira 이슈</th>
                        <th style={{ width: '18%' }}>동작</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedData.length === 0 ? (
                        <tr>
                            <td colSpan={8} className="table-empty">
                                <div className="table-empty-icon">📂</div>
                                <div className="table-empty-title">백업 기록 없음</div>
                                <div className="table-empty-description">표시할 백업 기록이 없습니다.</div>
                            </td>
                        </tr>
                    ) : (
                        sortedData.map((item) => {
                            const isSelected = selectedItems.includes(item.id);
                            // Use item.state for class logic
                            const rowClasses = [ isSelected ? 'selected' : '', item.requiresManualBackup ? 'requires-manual-backup' : '' ].filter(Boolean).join(' ');

                            return (
                                <tr key={item.id} className={rowClasses}>
                                    <td onClick={(e) => e.stopPropagation()}>
                                        <input
                                            type="checkbox"
                                            aria-label={`Select row ${item.tagName}`} // Accessibility
                                            checked={isSelected}
                                            onChange={(e) => handleSelectItem(item.id, e)}
                                        />
                                    </td>
                                    <td>{item.accountId}</td>
                                    {/* Use regionCode */}
                                    <td>{getRegionDisplayName(item.regionCode)}</td>
                                    <td>
                                        {/* UI Improvement: Conditional ExternalLinkIcon based on gitlabUrl */}
                                        {item.gitlabUrl ? (
                                            <a href={item.gitlabUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                                                {item.tagName} <ExternalLinkIcon />
                                            </a>
                                        ) : (
                                            item.tagName // Display only tag name if no URL
                                        )}
                                    </td>
                                    {/* ✅ [수정] item.type (자동/수동백업) 표시 */}
                                    <td>{item.type}</td>
                                    {/* Use item.state */}
                                    <td><span className={`badge ${getStatusBadgeClass(item.state)}`}>{getStatusText(item.state)}</span></td>
                                    <td>{renderJiraIssues(item)}</td>
                                    <td>{renderActionButtons(item)}</td>
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default BackupHistoryTable;