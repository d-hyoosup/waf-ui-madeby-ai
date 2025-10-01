// src/features/backup/BackupRestore.tsx
import { useState, useEffect, useMemo } from 'react';
import PageContainer from '../../components/common/PageContainer.tsx';
import BackupHistoryTable from './BackupHistoryTable.tsx';
import ResourceViewModal from './ResourceViewModal.tsx';
import RestoreStatusModal from './RestoreStatusModal.tsx';
import EmergencyApprovalModal from './EmergencyApprovalModal.tsx';
import RestoreCancelModal from './RestoreCancelModal.tsx';
import type { RestoreData, BackupItem as BackupItemType, BackupStatus } from '../../types/api.types.ts';
import { AWS_REGIONS } from '../../constants/awsRegions.ts';
import '../../components/styles/FilterStyles.css';
import { BackupService } from '../../api';

interface ResourceViewItem {
  id: string; // snapshotId
  status: BackupStatus;
  scopeId?: string;
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
        try {
            const response = await BackupService.getSnapshots({ page: 1, pageSize: 100 });
            const formattedData: BackupItemType[] = response.content.map((item: any) => ({
                ...item,
                id: item.snapshotId,
                account: item.accountId,
                region: item.regionCode,
                type: item.backupType === 'AUTO' ? '자동백업' : '수동백업',
                issueCount: item.jiraIssues?.length || 0,
            }));
            setBackupData(formattedData);
        } catch (error) {
            console.error("Failed to fetch snapshots", error);
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

    const uniqueAccounts = useMemo(() => [...new Set(backupData.map(item => item.accountId))], [backupData]);
    const uniqueRegions = useMemo(() => [...new Set(backupData.map(item => item.regionCode))], [backupData]);

    const numSelected = selectedItems.length;
    const selectedItem = useMemo(() => filteredData.find(item => selectedItems.includes(item.id)), [filteredData, selectedItems]);

    const handleSelectionChange = (newSelection: string[]) => {
        setSelectedItems(newSelection);
    };

    const handleCompare = () => {
        if (numSelected === 1 && selectedItem) {
            setResourceViewModal({ type: 'compare', items: [{ id: selectedItem.id, status: selectedItem.status, scopeId: selectedItem.scopeId }, { id: 'live', status: 'APPLIED', scopeId: selectedItem.scopeId }] });
        } else if (numSelected === 2) {
             const itemsInSelectionOrder = selectedItems.map(id => {
                const item = filteredData.find(d => d.id === id)!;
                return { id: item.id, status: item.status, scopeId: item.scopeId };
            });
            setResourceViewModal({ type: 'compare', items: itemsInSelectionOrder });
        }
    };

    const handleManualBackupClick = async () => {
        if (numSelected === 1 && selectedItem && selectedItem.requiresManualBackup) {
            if (window.confirm(`'${selectedItem.accountName}(${selectedItem.regionName})'의 현재 WAF 설정을 수동 백업하시겠습니까?`)) {
                try {
                    await BackupService.manualBackup(selectedItem.scopeId);
                    alert('수동 백업 요청이 완료되었습니다.');
                    fetchSnapshots();
                } catch(error) {
                    alert('수동 백업 요청에 실패했습니다.');
                }
            }
        }
    };

    const handleRestoreClick = (backupId: string) => {
        const itemToRestore = filteredData.find(item => item.id === backupId);
        if (itemToRestore) {
             setResourceViewModal({
                 type: 'restore',
                 items: [
                     {id: itemToRestore.id, status: itemToRestore.status, scopeId: itemToRestore.scopeId},
                     {id: 'live', status: 'APPLIED', scopeId: itemToRestore.scopeId} // 'live' 아이템 추가
                 ]
             });
        }
    };

    const handleEmergencyApprovalConfirm = async (approver: string, reason: string) => {
        const backupId = emergencyApprovalModal.backupId;
        try {
            await BackupService.forceRollback({ snapshotId: backupId, interruptedBy: approver, reason, jiraIssueKey: 'MANUAL-APPROVAL' });
            alert(`긴급 승인이 완료되었습니다.\n복원을 시작합니다.`);
            setEmergencyApprovalModal({ open: false, backupId: '' });
            fetchSnapshots();
        } catch(error) {
            alert('긴급 복원 승인에 실패했습니다.');
        }
    };

    const handleRestoreCancelConfirm = async (requester: string, reason: string) => {
        const backupId = restoreCancelModal.backupId;
        try {
            await BackupService.cancelRollback({ snapshotId: backupId, interruptedBy: requester, reason, jiraIssueKey: 'MANUAL-CANCEL' });
            alert(`복원 취소가 요청되었습니다.`);
            setRestoreCancelModal({ open: false, backupId: '' });
            fetchSnapshots();
        } catch(error) {
            alert('복원 취소 요청에 실패했습니다.');
        }
    };

    const handleRestoreAction = async (action: string, backupId: string) => {
        if (action === 'JIRA_APPROVAL_WAITING') {
            setEmergencyApprovalModal({ open: true, backupId });
        } else if (action === 'ROLLBACK_CANCEL') {
            setRestoreCancelModal({ open: true, backupId });
        } else if (action === 'VIEW_DETAIL') {
            try {
                const data = await BackupService.getJiraIssues(backupId);
                setRestoreProcessData(data as RestoreData);
                setRestoreModalOpen(true);
            } catch(error) {
                alert('상세 정보를 불러오는 데 실패했습니다.');
            }
        }
    };

    const canManualBackup = numSelected === 1 && selectedItem?.requiresManualBackup;

    return (
        <PageContainer
            title="WAF Rule 백업/복원"
            controls={
                <div className="controls-group">
                    <button className="btn btn-secondary" onClick={handleManualBackupClick} disabled={!canManualBackup}>수동 백업</button>
                    <button className="btn btn-secondary" onClick={handleCompare} disabled={numSelected === 0 || numSelected > 2}>비교</button>
                </div>
            }
        >
            <div className="filter-container">
                <div className="filter-group">
                    <label>Account</label>
                    <select value={filters.account} onChange={(e) => setFilters({...filters, account: e.target.value})}>
                        <option value="">전체</option>
                        {uniqueAccounts.map(acc => <option key={acc} value={acc}>{acc}</option>)}
                    </select>
                </div>
                <div className="filter-group">
                    <label>Region</label>
                    <select value={filters.region} onChange={(e) => setFilters({...filters, region: e.target.value})}>
                        <option value="">전체</option>
                        {uniqueRegions.map(reg => <option key={reg} value={reg}>{AWS_REGIONS.find(r => r.code === reg)?.name || reg}</option>)}
                    </select>
                </div>
                <div className="filter-group">
                    <label>백업 방식</label>
                    <select value={filters.backupType} onChange={(e) => setFilters({...filters, backupType: e.target.value})}>
                        <option value="">전체</option>
                        <option value="AUTO">자동백업</option>
                        <option value="MANUAL">수동백업</option>
                    </select>
                </div>
                <button className="btn btn-secondary filter-reset" onClick={() => setFilters({ account: '', region: '', backupType: '' })}>
                    필터 초기화
                </button>
            </div>

            {loading ? <p>Loading backups...</p> : (
                <BackupHistoryTable
                    data={filteredData}
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
                    backupId={emergencyApprovalModal.backupId}
                    onClose={() => setEmergencyApprovalModal({ open: false, backupId: '' })}
                    onConfirm={handleEmergencyApprovalConfirm}
                />
            )}

            {restoreCancelModal.open && (
                <RestoreCancelModal
                    backupId={restoreCancelModal.backupId}
                    onClose={() => setRestoreCancelModal({ open: false, backupId: '' })}
                    onConfirm={handleRestoreCancelConfirm}
                />
            )}

            {restoreModalOpen && restoreProcessData && (
                <RestoreStatusModal
                    onClose={() => setRestoreModalOpen(false)}
                    data={restoreProcessData}
                />
            )}
        </PageContainer>
    );
};

export default BackupRestore;