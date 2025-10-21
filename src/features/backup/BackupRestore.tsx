// src/features/backup/BackupRestore.tsx
import { useState, useEffect, useMemo } from 'react';
import PageContainer from '../../components/common/PageContainer.tsx';
import BackupHistoryTable from './BackupHistoryTable.tsx';
import ResourceViewModal from './ResourceViewModal.tsx';
import RestoreStatusModal from './RestoreStatusModal.tsx';
import EmergencyApprovalModal from './EmergencyApprovalModal.tsx';
import RestoreCancelModal from './RestoreCancelModal.tsx';
// Update types import
import type { RestoreData, BackupItem as BackupItemType, BackupStatus, WafSnapshot } from '../../types/api.types.ts'; // WafSnapshot 추가
import { AWS_REGIONS, getRegionDisplayName } from '../../constants/awsRegions.ts'; // Import getRegionDisplayName
import '../../components/styles/FilterStyles.css';
import { BackupService } from '../../api';

// Interface remains the same, but uses BackupStatus now
interface ResourceViewItem {
  id: string; // snapshotId or 'live'/'current'
  status: BackupStatus;
  scopeId?: string; // scopeId는 optional
}

const BackupRestore = () => {
    const [backupData, setBackupData] = useState<BackupItemType[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [resourceViewModal, setResourceViewModal] = useState<{
        type: 'view' | 'compare' | 'restore' | 'manual_backup' | null;
        items: ResourceViewItem[]
    }>({ type: null, items: [] });
    const [restoreModalOpen, setRestoreModalOpen] = useState(false);
    const [restoreProcessData, setRestoreProcessData] = useState<RestoreData | null>(null);
    const [emergencyApprovalModal, setEmergencyApprovalModal] = useState({ open: false, backupId: '' });
    const [restoreCancelModal, setRestoreCancelModal] = useState({ open: false, backupId: '' });
    const [filters, setFilters] = useState({ account: '', region: '', backupType: '' });

    const fetchSnapshots = async () => {
        setLoading(true);
        setSelectedItems([]); // Reset selection on fetch
        try {
            const response = await BackupService.getSnapshots({ page: 1, pageSize: 100 }); // Adjust pageSize if needed
            // Map WafSnapshot from API to BackupItemType for the table
            const formattedData: BackupItemType[] = response.content.map((item: WafSnapshot) => {
                // --- 수정된 부분: id 생성 로직 명확화 ---
                // 테이블의 key와 선택 로직에는 고유 ID가 필요합니다. snapshotId를 우선 사용하고 없으면 scopeId 사용
                const uniqueId = item.snapshotId || item.scopeId;
                // --- 수정 끝 ---
                if (!uniqueId) {
                    // snapshotId와 scopeId 둘 다 없는 경우에 대한 경고 (이론상 발생하면 안 됨)
                    console.warn('Item missing both snapshotId and scopeId:', item);
                }
                const hasJira = !!item.jira;
                // Issue count logic might need refinement based on how multiple issues are represented
                const issueCount = hasJira ? 1 : 0; // Simplified count based on jira object presence
                // Keep jiraIssues array for potential compatibility, populate from jira object
                const jiraIssues = hasJira ? [item.jira!.jiraIssueKey] : [];

                return {
                    ...item,
                    id: uniqueId || `fallback-${Math.random()}`, // Fallback ID 추가 (만약을 위해)
                    account: item.accountId, // Compatibility field
                    region: item.regionCode, // Compatibility field
                    type: item.backupType === 'AUTO' ? '자동백업' : '수동백업',
                    status: item.state, // Copy state to status for table compatibility
                    // Calculate these for the table component
                    hasJiraIssues: hasJira,
                    issueCount: issueCount,
                    jiraIssues: jiraIssues, // Keep for table compatibility if needed
                };
            });
            setBackupData(formattedData);
        } catch (error) {
            console.error("Failed to fetch snapshots", error);
            alert(`백업 목록 조회 실패: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSnapshots();
    }, []);

    const filteredData = useMemo(() => {
        return backupData.filter(item => {
            if (filters.account && item.accountId !== filters.account) return false;
            if (filters.region && item.regionCode !== filters.region) return false;
            if (filters.backupType && item.backupType !== filters.backupType) return false;
            return true;
        });
    }, [backupData, filters]);

    const uniqueAccounts = useMemo(() => [...new Set(backupData.map(item => item.accountId))].sort(), [backupData]);
    const uniqueRegions = useMemo(() => [...new Set(backupData.map(item => item.regionCode))].sort(), [backupData]);

    const numSelected = selectedItems.length;

    // --- 수정된 부분: selectedItem 로직 변경 ---
    // 여러 항목 선택 시 첫 번째 선택 항목 기준으로 동작하던 것을, 모든 선택 항목을 가져오도록 수정
    const selectedBackupItems = useMemo(() =>
        backupData.filter(item => selectedItems.includes(item.id)), // backupData에서 찾아야 정확
        [backupData, selectedItems]
    );
    // 첫 번째 선택된 아이템 (단일 선택 시 주로 사용)
    const firstSelectedItem = selectedBackupItems.length > 0 ? selectedBackupItems[0] : undefined;
    // --- 수정 끝 ---

    const handleSelectionChange = (newSelection: string[]) => {
        setSelectedItems(newSelection);
    };

    // --- 수정된 부분: handleCompare 함수 수정 ---
    const handleCompare = () => {
        // 1. 선택된 항목들의 snapshotId 유효성 검사
        const invalidItem = selectedBackupItems.find(item => !item.snapshotId);
        if (invalidItem) {
            alert(`Snapshot ID가 없는 항목(${invalidItem.tagName || invalidItem.scopeId})이 포함되어 있어 비교할 수 없습니다.`);
            return; // 함수 종료
        }

        // 2. 기존 비교 로직 수행 (snapshotId가 모두 유효한 경우)
        if (numSelected === 1 && firstSelectedItem) {
            // Compare selected item with 'live' (live 항목은 snapshotId가 없음)
            setResourceViewModal({
                type: 'compare',
                items: [
                    { id: firstSelectedItem.snapshotId!, status: firstSelectedItem.state, scopeId: firstSelectedItem.scopeId }, // snapshotId 사용
                    { id: 'live', status: 'APPLIED', scopeId: firstSelectedItem.scopeId } // live 항목
                ]
            });
        } else if (numSelected === 2) {
            // Compare two selected items (둘 다 snapshotId가 있음)
            const itemsToCompare = selectedBackupItems.map(item => ({
                id: item.snapshotId!, // snapshotId 사용 보장
                status: item.state,
                scopeId: item.scopeId
            }));

            if (itemsToCompare.length === 2) {
                 setResourceViewModal({ type: 'compare', items: itemsToCompare });
            } else {
                // 이 경우는 selectedBackupItems 필터링 로직상 발생하기 어려움
                alert("비교할 항목을 찾을 수 없습니다.");
            }
        } else {
             // 선택된 항목이 0개 또는 3개 이상인 경우 (기존 로직 유지)
             alert("비교할 항목을 1개 또는 2개 선택해주세요.");
        }
    };
    // --- 수정 끝 ---

    const handleManualBackupClick = async () => {
        // --- 수정된 부분: firstSelectedItem 사용 ---
        if (numSelected === 1 && firstSelectedItem?.requiresManualBackup && firstSelectedItem.scopeId) { // Check scopeId exists
            if (window.confirm(`'${firstSelectedItem.accountName}(${firstSelectedItem.regionName})'의 현재 WAF 설정을 수동 백업하시겠습니까?`)) {
                setLoading(true); // Indicate loading state
                try {
                    await BackupService.manualBackup(firstSelectedItem.scopeId);
                    alert('수동 백업 요청이 완료되었습니다.');
                    fetchSnapshots(); // Refresh data
                } catch(error: any) {
                     console.error("Manual backup failed:", error);
                     alert(`수동 백업 요청에 실패했습니다: ${error?.metaInfo?.message || error?.message || 'Unknown error'}`);
                } finally {
                     setLoading(false);
                }
            }
        // --- 수정된 부분: firstSelectedItem 사용 ---
        } else if (!firstSelectedItem?.scopeId && firstSelectedItem?.requiresManualBackup) {
             alert("선택된 항목의 Scope ID가 없어 수동 백업을 진행할 수 없습니다.");
        } else {
            // 단일 항목이 아니거나 수동 백업 대상이 아닐 때 메시지 (선택 사항)
            // alert("수동 백업을 하려면 'requiresManualBackup'이 true인 항목 1개만 선택해야 합니다.");
        }
    };

    const handleRestoreClick = (backupIdOrScopeId: string) => { // id는 snapshotId 또는 scopeId일 수 있음
        const itemToRestore = backupData.find(item => item.id === backupIdOrScopeId); // Find in original data
        if (itemToRestore) {
             // --- 수정된 부분: 복원 비교 시 snapshotId 확인 ---
             if (!itemToRestore.snapshotId) {
                 alert(`Snapshot ID가 없는 항목(${itemToRestore.tagName || itemToRestore.scopeId})은 복원 비교를 할 수 없습니다.`);
                 return;
             }
             // --- 수정 끝 ---
             setResourceViewModal({
                 type: 'restore',
                 items: [
                     {id: itemToRestore.snapshotId, status: itemToRestore.state, scopeId: itemToRestore.scopeId}, // snapshotId 사용
                     {id: 'live', status: 'APPLIED', scopeId: itemToRestore.scopeId} // 'live' state
                 ]
             });
        } else {
             console.error(`Item to restore with id ${backupIdOrScopeId} not found.`);
             alert("복원할 항목을 찾을 수 없습니다.");
        }
    };

    const handleEmergencyApprovalConfirm = async (approver: string, reason: string) => {
        const backupId = emergencyApprovalModal.backupId; // backupId는 snapshotId여야 함
        const item = backupData.find(b => b.snapshotId === backupId); // snapshotId로 검색
        // Use the actual Jira key if available, otherwise use a placeholder specified in Swagger example
        const jiraIssueKey = item?.jira?.jiraIssueKey || 'GCI-133'; // Using example from Swagger for fallback
        setLoading(true);
        try {
            await BackupService.forceRollback({ snapshotId: backupId, interruptedBy: approver, reason, jiraIssueKey: jiraIssueKey });
            alert(`긴급 승인이 완료되었습니다.\n복원을 시작합니다.`);
            setEmergencyApprovalModal({ open: false, backupId: '' });
            fetchSnapshots(); // Refresh
        } catch(error: any) {
            console.error("Force rollback failed:", error);
            alert(`긴급 복원 승인에 실패했습니다: ${error?.metaInfo?.message || error?.message || 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    const handleRestoreCancelConfirm = async (requester: string, reason: string) => {
        const backupId = restoreCancelModal.backupId; // backupId는 snapshotId여야 함
        const item = backupData.find(b => b.snapshotId === backupId); // snapshotId로 검색
        // Use the actual Jira key if available, otherwise use a placeholder specified in Swagger example
        const jiraIssueKey = item?.jira?.jiraIssueKey || 'GCI-133'; // Requires Jira key, using example as fallback
         if (!item?.jira?.jiraIssueKey) {
             console.warn("Attempting to cancel rollback without a known Jira issue key for snapshot:", backupId);
             // Optionally use a default/placeholder, but the API might require a valid one.
         }
        setLoading(true);
        try {
            await BackupService.cancelRollback({ snapshotId: backupId, interruptedBy: requester, reason, jiraIssueKey: jiraIssueKey });
            alert(`복원 취소가 요청되었습니다.`);
            setRestoreCancelModal({ open: false, backupId: '' });
            fetchSnapshots(); // Refresh
        } catch(error: any) {
            console.error("Cancel rollback failed:", error);
            alert(`복원 취소 요청에 실패했습니다: ${error?.metaInfo?.message || error?.message || 'Unknown error'}`);
        } finally {
             setLoading(false);
        }
    };

    const handleRestoreAction = async (action: string, backupId: string) => { // backupId는 snapshotId
        if (action === 'JIRA_APPROVAL_WAITING') {
            setEmergencyApprovalModal({ open: true, backupId });
        } else if (action === 'ROLLBACK_CANCEL') {
            setRestoreCancelModal({ open: true, backupId });
        } else if (action === 'VIEW_DETAIL') {
            setLoading(true);
            try {
                // API response type is RollbackProcessInfo
                const data: RollbackProcessInfo = await BackupService.getJiraIssues(backupId);
                // Cast to RestoreData (which includes optional showCancelProcess)
                setRestoreProcessData(data as RestoreData);
                setRestoreModalOpen(true);
            } catch(error: any) {
                 console.error("Failed to fetch Jira issues:", error);
                 alert(`상세 정보를 불러오는 데 실패했습니다: ${error?.metaInfo?.message || error?.message || 'Unknown error'}`);
            } finally {
                 setLoading(false);
            }
        }
    };

    // --- 수정된 부분: firstSelectedItem 사용 및 조건 명확화 ---
    const canManualBackup = numSelected === 1 && !!firstSelectedItem?.requiresManualBackup && !!firstSelectedItem?.scopeId;
    const compareButtonDisabled = numSelected === 0 || numSelected > 2 || loading;
    // --- 수정 끝 ---

    return (
        <PageContainer
            title="WAF Rule 백업/복원"
            controls={
                <div className="controls-group">
                    {/* --- 수정된 부분: firstSelectedItem 사용 --- */}
                    <button
                        className="btn btn-secondary"
                        onClick={handleManualBackupClick}
                        disabled={!canManualBackup || loading}
                        title={!firstSelectedItem?.scopeId && firstSelectedItem?.requiresManualBackup ? "Scope ID가 없어 수동 백업 불가" : ""}
                    >
                        수동 백업
                    </button>
                    {/* --- 수정 끝 --- */}
                    <button
                        className="btn btn-secondary"
                        onClick={handleCompare}
                        disabled={compareButtonDisabled}
                        // --- 수정된 부분: 비교 불가 조건 툴팁 추가 ---
                        title={
                            compareButtonDisabled && (numSelected > 0 && numSelected <= 2) && selectedBackupItems.some(item => !item.snapshotId)
                            ? "Snapshot ID가 없는 항목은 비교할 수 없습니다."
                            : (numSelected === 0 || numSelected > 2 ? "1개 또는 2개의 항목을 선택하세요." : "")
                        }
                        // --- 수정 끝 ---
                    >
                        비교
                    </button>
                </div>
            }
        >
            <div className="filter-container">
                <div className="filter-group">
                    <label htmlFor="account-filter">Account</label>
                    <select id="account-filter" value={filters.account} onChange={(e) => setFilters({...filters, account: e.target.value})}>
                        <option value="">전체</option>
                        {uniqueAccounts.map(acc => <option key={acc} value={acc}>{acc}</option>)}
                    </select>
                </div>
                <div className="filter-group">
                    <label htmlFor="region-filter">Region</label>
                    <select id="region-filter" value={filters.region} onChange={(e) => setFilters({...filters, region: e.target.value})}>
                        <option value="">전체</option>
                        {uniqueRegions.map(regCode => <option key={regCode} value={regCode}>{getRegionDisplayName(regCode)}</option>)}
                    </select>
                </div>
                <div className="filter-group">
                    <label htmlFor="backup-type-filter">백업 방식</label>
                    <select id="backup-type-filter" value={filters.backupType} onChange={(e) => setFilters({...filters, backupType: e.target.value})}>
                        <option value="">전체</option>
                        <option value="AUTO">자동백업</option>
                        <option value="MANUAL">수동백업</option>
                    </select>
                </div>
                <button className="btn btn-secondary filter-reset" onClick={() => setFilters({ account: '', region: '', backupType: '' })}>
                    필터 초기화
                </button>
            </div>

            {loading ? (
                 <div className="content-loading">
                     <div className="loading-spinner"></div>
                     <p className="loading-text">백업 기록을 불러오는 중...</p>
                 </div>
            ) : (
                <BackupHistoryTable
                    data={filteredData} // 필터링된 데이터를 테이블에 전달
                    selectedItems={selectedItems}
                    onSelectionChange={handleSelectionChange}
                    onRestoreAction={handleRestoreAction}
                    onRestoreClick={handleRestoreClick}
                />
            )}

            {resourceViewModal.type && (
                <ResourceViewModal
                    type={resourceViewModal.type}
                    items={resourceViewModal.items}
                    onClose={() => setResourceViewModal({ type: null, items: [] })}
                />
            )}

            {emergencyApprovalModal.open && (
                <EmergencyApprovalModal
                    backupId={emergencyApprovalModal.backupId} // snapshotId 전달
                    onClose={() => setEmergencyApprovalModal({ open: false, backupId: '' })}
                    onConfirm={handleEmergencyApprovalConfirm}
                />
            )}

            {restoreCancelModal.open && (
                <RestoreCancelModal
                    backupId={restoreCancelModal.backupId} // snapshotId 전달
                    onClose={() => setRestoreCancelModal({ open: false, backupId: '' })}
                    onConfirm={handleRestoreCancelConfirm}
                />
            )}

            {restoreModalOpen && restoreProcessData && (
                <RestoreStatusModal
                    onClose={() => setRestoreModalOpen(false)}
                    data={restoreProcessData} // Ensure RestoreData type matches expectation
                />
            )}
        </PageContainer>
    );
};

export default BackupRestore;