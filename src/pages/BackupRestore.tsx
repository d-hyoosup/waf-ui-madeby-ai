// src/pages/BackupRestore.tsx
import { useState, useMemo } from 'react';
import PageContainer from '../components/PageContainer';
import BackupHistoryTable from '../components/BackupHistoryTable';
import ResourceViewModal from '../components/ResourceViewModal';
import RestoreStatusModal from '../components/RestoreStatusModal';
import JiraDetailModal from '../components/JiraDetailModal';
import type { RestoreData, JiraIssue } from '../types/restore.types';
import { mockBackupData, type BackupItem } from '../data/mockBackupData';
import { AWS_REGIONS } from '../constants/awsRegions';
import '../components/FilterStyles.css';

const BackupRestore = () => {
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [resourceViewModal, setResourceViewModal] = useState<{
        type: 'view' | 'compare' | null;
        items: string[]
    }>({ type: null, items: [] });
    const [restoreModalOpen, setRestoreModalOpen] = useState(false);
    const [restoreProcessData, setRestoreProcessData] = useState<RestoreData | null>(null);
    const [jiraDetailModal, setJiraDetailModal] = useState<{
        isOpen: boolean;
        issueCount: number;
        backupId: string
    }>({
        isOpen: false,
        issueCount: 0,
        backupId: ''
    });

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

    // 유니크한 계정과 리전 목록
    const uniqueAccounts = useMemo(() =>
        [...new Set(mockBackupData.map(item => item.account))],
        []
    );

    const uniqueRegions = useMemo(() =>
        [...new Set(mockBackupData.map(item => item.region))],
        []
    );

    const handleSelectionChange = (newSelection: string[]) => {
        setSelectedItems(newSelection);
    };

    const numSelected = selectedItems.length;

    // 백업 조회 버튼 클릭
    const handleViewClick = () => {
        if (numSelected === 1) {
            setResourceViewModal({ type: 'view', items: selectedItems });
        }
    };

    // 비교 버튼 클릭 (통합)
    const handleCompareClick = () => {
        if (numSelected === 1 || numSelected === 2) {
            setResourceViewModal({ type: 'compare', items: selectedItems });
        }
    };

    // 수동 백업 버튼 클릭 - 현재 룰과 비교 기능 표시
    const handleManualBackupClick = () => {
        // 수동 백업 시 현재 룰과 비교 화면 표시
        setResourceViewModal({ type: 'compare', items: ['current'] });
    };

    const handleJiraIssueClick = (issueCount: number, backupId: string) => {
        setJiraDetailModal({
            isOpen: true,
            issueCount: issueCount,
            backupId: backupId
        });
    };

    const handleRestoreAction = (action: string, backupId: string) => {
        const backup = mockBackupData.find(item => item.id === backupId);
        if (!backup) return;

        const mockIssues: JiraIssue[] = Array.from({ length: backup.issueCount || 1 }, (_, i) => ({
            issueKey: `GCI-${51 + i}`,
            link: `https://jira.example.com/browse/GCI-${51 + i}`,
            interruptFlag: "NONE"
        }));

        const mockRestoreData: RestoreData = {
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

        if (action === 'JIRA_APPROVAL_WAITING') {
            // Jira 승인 대기 - 긴급 승인 확인
            if (window.confirm('긴급 승인을 하시겠습니까?\n\n긴급 승인 시 Jira 이슈의 승인 절차를 무시하고 즉시 복원이 진행됩니다.')) {
                setRestoreProcessData({ ...mockRestoreData, showEmergencyApproval: true });
                setRestoreModalOpen(true);
            }
        } else if (action === 'ROLLBACK_CANCEL') {
            // 복원 취소 확인
            if (window.confirm('복원을 취소하시겠습니까?\n\n진행 중인 복원 작업이 중단됩니다.')) {
                setRestoreProcessData({ ...mockRestoreData, showCancelProcess: true });
                setRestoreModalOpen(true);
            }
        } else if (action === 'VIEW_DETAIL') {
            // 상세 보기 - WAF Rule 복원 작업 상태 모달
            setRestoreProcessData(mockRestoreData);
            setRestoreModalOpen(true);
        }
    };

    return (
        <PageContainer
            title="WAF Rule 백업/복원"
            controls={
                <div className="controls-group">
                    {numSelected === 1 && (
                        <button
                            className="btn btn-secondary"
                            onClick={handleViewClick}
                        >
                            백업 조회
                        </button>
                    )}
                    <button
                        className="btn btn-secondary"
                        disabled={numSelected === 0 || numSelected > 2}
                        onClick={handleCompareClick}
                    >
                        비교
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={handleManualBackupClick}
                    >
                        수동백업
                    </button>
                </div>
            }
        >
            {/* 필터 영역 */}
            <div className="filter-container">
                <div className="filter-group">
                    <label>Account</label>
                    <select
                        value={filters.account}
                        onChange={(e) => setFilters({...filters, account: e.target.value})}
                    >
                        <option value="">전체</option>
                        {uniqueAccounts.map(account => (
                            <option key={account} value={account}>{account}</option>
                        ))}
                    </select>
                </div>

                <div className="filter-group">
                    <label>Region</label>
                    <select
                        value={filters.region}
                        onChange={(e) => setFilters({...filters, region: e.target.value})}
                    >
                        <option value="">전체</option>
                        {uniqueRegions.map(region => {
                            const regionInfo = AWS_REGIONS.find(r => r.code === region);
                            return (
                                <option key={region} value={region}>
                                    {regionInfo ? regionInfo.name : region}
                                </option>
                            );
                        })}
                    </select>
                </div>

                <div className="filter-group">
                    <label>백업 방식</label>
                    <select
                        value={filters.backupType}
                        onChange={(e) => setFilters({...filters, backupType: e.target.value})}
                    >
                        <option value="">전체</option>
                        <option value="자동백업">자동백업</option>
                        <option value="수동백업">수동백업</option>
                    </select>
                </div>

                <button
                    className="btn btn-secondary filter-reset"
                    onClick={() => setFilters({ account: '', region: '', backupType: '' })}
                >
                    필터 초기화
                </button>
            </div>

            <BackupHistoryTable
                data={filteredData}
                selectedItems={selectedItems}
                onSelectionChange={handleSelectionChange}
                onJiraIssueClick={handleJiraIssueClick}
                onRestoreAction={handleRestoreAction}
            />

            {resourceViewModal.type && (
                <ResourceViewModal
                    type={resourceViewModal.type}
                    items={resourceViewModal.items}
                    onClose={() => setResourceViewModal({ type: null, items: [] })}
                />
            )}

            {restoreModalOpen && restoreProcessData && (
                <RestoreStatusModal
                    onClose={() => setRestoreModalOpen(false)}
                    data={restoreProcessData}
                />
            )}

            {jiraDetailModal.isOpen && (
                <JiraDetailModal
                    issueCount={jiraDetailModal.issueCount}
                    backupId={jiraDetailModal.backupId}
                    onClose={() => setJiraDetailModal({ isOpen: false, issueCount: 0, backupId: '' })}
                />
            )}
        </PageContainer>
    );
};

export default BackupRestore;