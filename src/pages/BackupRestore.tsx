// src/pages/BackupRestore.tsx
import { useState, useMemo } from 'react';
import PageContainer from '../components/PageContainer';
import BackupHistoryTable from '../components/BackupHistoryTable';
import ResourceViewModal from '../components/ResourceViewModal';
import RestoreStatusModal from '../components/RestoreStatusModal';
import EmergencyApprovalModal from '../components/EmergencyApprovalModal';
import type { RestoreData, JiraIssue, BackupItem } from '../types/restore.types';
import { mockBackupData } from '../data/mockBackupData';
import { AWS_REGIONS } from '../constants/awsRegions';
import '../components/FilterStyles.css';

const BackupRestore = () => {
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [resourceViewModal, setResourceViewModal] = useState<{
        type: 'view' | 'compare' | 'restore' | 'manual_backup' | null;
        items: string[]
    }>({ type: null, items: [] });
    const [restoreModalOpen, setRestoreModalOpen] = useState(false);
    const [restoreProcessData, setRestoreProcessData] = useState<RestoreData | null>(null);
    const [emergencyApprovalModal, setEmergencyApprovalModal] = useState<{
        open: boolean;
        backupId: string;
    }>({ open: false, backupId: '' });

    // 필터 상태
    const [filters, setFilters] = useState({
        account: '',
        region: '',
        backupType: ''
    });

    // 필터링된 데이터
    const filteredData = useMemo(() => {
        return mockBackupData.filter((item: BackupItem) => {
            if (filters.account && item.account !== filters.account) return false;
            if (filters.region && item.region !== filters.region) return false;
            if (filters.backupType && item.type !== filters.backupType) return false;
            return true;
        });
    }, [filters]);

    // 필터링을 위한 유니크한 목록
    const uniqueAccounts = useMemo(() => [...new Set(mockBackupData.map(item => item.account))], []);
    const uniqueRegions = useMemo(() => [...new Set(mockBackupData.map(item => item.region))], []);

    const handleSelectionChange = (newSelection: string[]) => {
        setSelectedItems(newSelection);
    };

    const numSelected = selectedItems.length;

    // ✅ [추가] 복원 버튼 핸들러
    const handleRestoreClick = () => {
        if (numSelected === 1) {
            const selectedItem = filteredData.find(item => selectedItems.includes(item.id));
            if (selectedItem && selectedItem.status === 'ARCHIVED') {
                setResourceViewModal({
                    type: 'restore',
                    items: ['live', selectedItems[0]]
                });
            }
        }
    };

    const handleViewClick = () => {
        if (numSelected === 1) {
            setResourceViewModal({ type: 'view', items: selectedItems });
        }
    };

    // ✅ [수정] 비교 로직 개선
    const handleCompare = () => {
        if (numSelected === 1) {
            // 단일 선택: Live WAF와 선택된 백업 비교
            setResourceViewModal({
                type: 'compare',
                items: ['live', selectedItems[0]]
            });
        } else if (numSelected === 2) {
            // 2개 선택: 백업 간 비교
            setResourceViewModal({
                type: 'compare',
                items: selectedItems
            });
        }
    };

    // ✅ [수정] 수동백업 시 선택된 항목과 Live WAF 비교
    const handleManualBackupClick = () => {
        if (numSelected === 1 && canManualBackup) {
            // 수동 백업 시 선택된 항목과 Live WAF 비교
            setResourceViewModal({
                type: 'manual_backup',
                items: ['live', selectedItems[0]]
            });
        }
    };

    // ✅ [수정] 수동백업 버튼 활성화 조건 - 단일 선택 + requiresManualBackup: true
    const canManualBackup = numSelected === 1 && filteredData.find(item =>
        selectedItems.includes(item.id) && item.requiresManualBackup
    );

    // ✅ [추가] 복원 버튼 활성화 조건 체크
    const canRestore = numSelected === 1 && filteredData.find(item =>
        selectedItems.includes(item.id) && item.status === 'ARCHIVED'
    );

    // ✅ [추가] 비교 버튼 텍스트 동적 변경
    // ✅ [수정] 긴급 승인 확인 처리 - 승인자와 사유 추가
    const handleEmergencyApprovalConfirm = (approver: string, reason: string) => {
        const backup = mockBackupData.find(item => item.id === emergencyApprovalModal.backupId);
        if (!backup) return;

        const mockIssues: JiraIssue[] = Array.from({ length: backup.issueCount || 1 }, (_, i) => ({
            issueKey: `GCI-${51 + i}`,
            link: `https://jira.example.com/browse/GCI-${51 + i}`,
            interruptFlag: "NONE"
        }));

        const restoreData: RestoreData = {
            snapshotId: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
            accountId: backup.account,
            accountName: "HAE_Manager",
            regionCode: backup.region,
            regionName: AWS_REGIONS.find(r => r.code === backup.region)?.name || backup.region,
            scope: backup.region === 'aws-global' ? 'CLOUDFRONT' : 'REGIONAL',
            tagName: emergencyApprovalModal.backupId,
            status: 'PROCESSING',
            issues: mockIssues,
        };

        alert(`긴급 승인이 완료되었습니다.\n승인자: ${approver}\n사유: ${reason}\n\n복원을 시작합니다.`);
        setRestoreProcessData(restoreData);
        setRestoreModalOpen(true);
    };

    const handleRestoreAction = (action: string, backupId: string) => {
        const backup = mockBackupData.find(item => item.id === backupId);
        if (!backup) return;

        const mockIssues: JiraIssue[] = Array.from({ length: backup.issueCount || 1 }, (_, i) => ({
            issueKey: `GCI-${51 + i}`,
            link: `https://jira.example.com/browse/GCI-${51 + i}`,
            interruptFlag: "NONE"
        }));

        const baseRestoreData: RestoreData = {
            snapshotId: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
            accountId: backup.account,
            accountName: "HAE_Manager",
            regionCode: backup.region,
            regionName: AWS_REGIONS.find(r => r.code === backup.region)?.name || backup.region,
            scope: backup.region === 'aws-global' ? 'CLOUDFRONT' : 'REGIONAL',
            tagName: backupId,
            status: "WAITING_FOR_APPROVAL",
            issues: mockIssues,
        };

        // ✅ [수정] 긴급 승인 로직 - 모달 사용
        if (action === 'JIRA_APPROVAL_WAITING') {
            setEmergencyApprovalModal({
                open: true,
                backupId: backupId
            });
        } else if (action === 'ROLLBACK_CANCEL') {
            setRestoreProcessData({ ...baseRestoreData, showCancelProcess: true });
            setRestoreModalOpen(true);
        } else if (action === 'VIEW_DETAIL') {
            setRestoreProcessData(baseRestoreData);
            setRestoreModalOpen(true);
        }
    };

    return (
        <PageContainer
            title="WAF Rule 백업/복원"
            controls={
                <div className="controls-group">
                    <button
                        className="btn btn-primary"
                        onClick={handleRestoreClick}
                        disabled={!canRestore}
                    >
                        복원
                    </button>
                    <button
                        className="btn btn-secondary"
                        onClick={handleManualBackupClick}
                        disabled={!canManualBackup}
                    >
                        수동 백업
                    </button>
                    <button
                        className="btn btn-secondary"
                        onClick={handleViewClick}
                        disabled={numSelected !== 1}
                    >
                        백업 조회
                    </button>
                    <button
                        className="btn btn-secondary"
                        onClick={handleCompare}
                        disabled={numSelected === 0 || numSelected > 2}
                    >
                        비교
                    </button>
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
                        <option value="자동백업">자동백업</option>
                        <option value="수동백업">수동백업</option>
                    </select>
                </div>
                <button className="btn btn-secondary filter-reset" onClick={() => setFilters({ account: '', region: '', backupType: '' })}>
                    필터 초기화
                </button>
            </div>

            <BackupHistoryTable
                data={filteredData}
                selectedItems={selectedItems}
                onSelectionChange={handleSelectionChange}
                onRestoreAction={handleRestoreAction}
            />

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