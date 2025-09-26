// src/components/BackupHistoryTable.tsx
import React, { useMemo, useState } from 'react';
import './TableStyles.css';
import { ExternalLinkIcon } from './Icons';
import type { BackupItem } from '../types/restore.types';
import {
    getStatusBadgeClass,
    getStatusText,
    getRollbackActionText,
    getRollbackActionBadgeClass
} from '../data/mockBackupData';
import { getRegionDisplayName } from '../constants/awsRegions';

interface BackupHistoryTableProps {
    data: BackupItem[];
    selectedItems: string[];
    onSelectionChange: (newSelection: string[]) => void;
    onRestoreAction: (action: string, backupId: string) => void;
}

const BackupHistoryTable: React.FC<BackupHistoryTableProps> = ({
    data,
    selectedItems,
    onSelectionChange,
    onRestoreAction
}) => {
    // ✅ [추가] 확장된 이슈 상태 관리
    const [expandedIssues, setExpandedIssues] = useState<string | null>(null);

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

    // ✅ [수정] 인라인 확장 토글 함수
    const toggleExpandedIssues = (itemId: string, event: React.MouseEvent) => {
        event.stopPropagation();
        setExpandedIssues(expandedIssues === itemId ? null : itemId);
    };

    // ✅ [수정] Jira 이슈 렌더링 - 인라인 확장 방식
    const renderJiraIssues = (item: BackupItem) => {
        const issues = item.jiraIssues || [];

        // 이슈가 없는 경우
        if (issues.length === 0) {
            return (
                <div className="jira-issue-container">
                    <div className="jira-issue-links">
                        <div className="jira-issue-main"></div>
                        <div className="jira-issue-extra"></div>
                    </div>
                </div>
            );
        }

        // 첫 번째 이슈와 나머지 이슈 분리
        const firstIssue = issues[0];
        const remainingIssues = issues.slice(1);
        const remainingCount = remainingIssues.length;
        const isExpanded = expandedIssues === item.id;

        return (
            <div className="jira-issue-container">
                <div className="jira-issue-links">
                    {/* 메인 이슈 - 첫 번째 이슈 */}
                    <div className="jira-issue-main">
                        <a
                            href={`#jira/${firstIssue}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="jira-issue-link"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {firstIssue}
                            <ExternalLinkIcon />
                        </a>
                    </div>

                    {/* +N 토글 버튼 */}
                    <div className="jira-issue-extra">
                        {remainingCount > 0 && (
                            <button
                                className={`jira-more-indicator ${isExpanded ? 'active' : ''}`}
                                onClick={(e) => toggleExpandedIssues(item.id, e)}
                            >
                                {isExpanded ? '−' : `+${remainingCount}`}
                            </button>
                        )}
                    </div>

                    {/* 확장된 추가 이슈들 */}
                    {remainingCount > 0 && (
                        <div className={`jira-expanded-issues ${isExpanded ? 'show' : ''}`}>
                            {remainingIssues.map((issue, index) => (
                                <a
                                    key={index}
                                    href={`#jira/${issue}`}
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
                </div>
            </div>
        );
    };

    // ✅ [기존] 작업 버튼 렌더링 로직
    const renderActionButtons = (item: BackupItem) => {
        const showOnlyDetailButton = item.status === 'ROLLBACK_INPROGRESS' || (item.status === 'ARCHIVED' && item.issueCount > 0);
        const showAllButtons = item.status === 'ROLLBACK_WAIT_FOR_APPLY';

        // 버튼이 없는 경우
        if (!showOnlyDetailButton && !showAllButtons) {
            return null;
        }

        return (
            <div className="action-badges">
                {showOnlyDetailButton && (
                    <button
                        className={`badge ${getRollbackActionBadgeClass('VIEW_DETAIL')}`}
                        onClick={() => onRestoreAction('VIEW_DETAIL', item.id)}
                    >
                        {getRollbackActionText('VIEW_DETAIL')}
                    </button>
                )}
                {showAllButtons && (
                    <>
                        <button
                            className={`badge ${getRollbackActionBadgeClass('JIRA_APPROVAL_WAITING')}`}
                            onClick={() => onRestoreAction('JIRA_APPROVAL_WAITING', item.id)}
                        >
                            {getRollbackActionText('JIRA_APPROVAL_WAITING')}
                        </button>
                        <button
                            className={`badge ${getRollbackActionBadgeClass('ROLLBACK_CANCEL')}`}
                            onClick={() => onRestoreAction('ROLLBACK_CANCEL', item.id)}
                        >
                            {getRollbackActionText('ROLLBACK_CANCEL')}
                        </button>
                        <button
                            className={`badge ${getRollbackActionBadgeClass('VIEW_DETAIL')}`}
                            onClick={() => onRestoreAction('VIEW_DETAIL', item.id)}
                        >
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
                        <th style={{ width: '4%' }}>
                            <input
                                type="checkbox"
                                onChange={handleSelectAll}
                                checked={isAllSelected}
                            />
                        </th>
                        <th style={{ width: '12%' }}>Account</th>
                        <th style={{ width: '14%' }}>리전</th>
                        <th style={{ width: '16%' }}>Tag (ID)</th>
                        <th style={{ width: '10%' }}>백업 방식</th>
                        <th style={{ width: '8%' }}>상태</th>
                        <th style={{ width: '18%' }}>Jira 이슈</th>
                        <th style={{ width: '18%' }}>작업</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item) => {
                        const isSelected = selectedItems.includes(item.id);
                        const rowClasses = [
                            isSelected ? 'selected' : '',
                            item.requiresManualBackup ? 'requires-manual-backup' : ''
                        ].filter(Boolean).join(' ');

                        return (
                            <tr key={item.id} className={rowClasses}>
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
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
                                    {renderJiraIssues(item)}
                                </td>
                                <td>
                                    {renderActionButtons(item)}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default BackupHistoryTable;