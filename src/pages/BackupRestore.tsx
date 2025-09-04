import { useState } from 'react';
import PageContainer from '../components/PageContainer';
import BackupHistoryTable from '../components/BackupHistoryTable';
import SnapshotDetailModal from '../components/SnapshotDetailModal';
import RestoreStatusModal from '../components/RestoreStatusModal';
import RuleCompareModal from '../components/RuleCompareModal';
import JiraDetailModal from '../components/JiraDetailModal';

// BackupItem interface를 여기서 직접 정의
interface BackupItem {
    id: string;
    account: string;
    region: string;
    type: string;
    status: string;
    jiraIssue: string;
    issueCount: number;
}

const backupData: BackupItem[] = [
    { id: '20250112-150430', account: '123456789012', region: 'Global(CloudFront)', type: '수동', status: '적용중', jiraIssue: '', issueCount: 0 },
    { id: '20241223-112030', account: '123456789012', region: 'Global(CloudFront)', type: '수동', status: '보관됨', jiraIssue: '', issueCount: 0 },
    { id: '20241010-150530', account: '123456789012', region: 'Global(CloudFront)', type: '수동', status: '복원중', jiraIssue: 'GCI-GW-001', issueCount: 2 },
    { id: '20240615-152230', account: '123456789012', region: 'ap-northeast-2', type: '수동', status: '보관됨', jiraIssue: 'GCI-GW-002', issueCount: 1 },
    { id: '20250915-152230', account: '123456789012', region: 'ap-northeast-2', type: '수동', status: '백업 필요', jiraIssue: '', issueCount: 0 },
];

interface JiraIssue {
    issueKey: string;
    link: string;
    interruptFlag: 'CANCEL' | 'FORCE_APPROVED' | string;
}

interface RestoreData {
    snapshotId: string;
    accountId: string;
    accountName: string;
    regionCode: string;
    regionName: string;
    scope: string;
    tagName: string;
    status: 'NONE' | 'REQUESTED' | 'WAITING_FOR_APPROVAL' | 'PROCESSING' | 'COMPLETED';
    issues: JiraIssue[];
}

const BackupRestore = () => {
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [snapshotModal, setSnapshotModal] = useState<{ type: 'view' | 'compare' | 'restore' | null; items: string[] }>({ type: null, items: [] });
    const [compareModalOpen, setCompareModalOpen] = useState(false);
    const [restoreModalOpen, setRestoreModalOpen] = useState(false);
    const [restoreProcessData, setRestoreProcessData] = useState<RestoreData | null>(null);
    const [jiraDetailModal, setJiraDetailModal] = useState<{ isOpen: boolean; issueCount: number; backupId: string }>({
        isOpen: false,
        issueCount: 0,
        backupId: ''
    });

    const handleSelectionChange = (newSelection: string[]) => {
        setSelectedItems(newSelection);
    };

    const numSelected = selectedItems.length;

    const isManualBackupEnabled = () => {
        if (numSelected !== 1) {
            return false;
        }
        const selectedItem = backupData.find(item => item.id === selectedItems[0]);
        return selectedItem?.status === '백업 필요';
    };

    const handleCurrentRuleCompare = () => {
        if (numSelected === 1) {
            setCompareModalOpen(true);
        }
    };

    const handleJiraIssueClick = (issueCount: number, backupId: string) => {
        const mockIssues: JiraIssue[] = Array.from({ length: issueCount }, (_, i) => ({
            issueKey: `GCI-${51 + i}`,
            link: `https://jira.example.com/browse/GCI-${51 + i}`,
            interruptFlag: "NONE"
        }));

        const mockRestoreData: RestoreData = {
            snapshotId: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
            accountId: "123456789012",
            accountName: "HAE_Manager",
            regionCode: "ap-northeast-2",
            regionName: "아시아 태평양(서울)",
            scope: "REGIONAL",
            tagName: backupId,
            status: "WAITING_FOR_APPROVAL",
            issues: mockIssues,
        };

        setRestoreProcessData(mockRestoreData);
        setRestoreModalOpen(true);
    };

    return (
        <PageContainer
            title="WAF Rule 백업/복원"
            controls={
                <div className="controls-group">
                    {numSelected === 1 && (
                        <>
                            <button
                                className="btn btn-secondary"
                                onClick={() => setSnapshotModal({ type: 'view', items: selectedItems })}
                            >
                                백업 조회
                            </button>
                            <button
                                className="btn btn-secondary"
                                onClick={handleCurrentRuleCompare}
                            >
                                현재 룰과 비교
                            </button>
                        </>
                    )}
                     <button
                        className="btn btn-secondary"
                        disabled={numSelected !== 2}
                        onClick={() => setSnapshotModal({ type: 'compare', items: selectedItems })}
                    >
                        백업 간 비교
                    </button>
                    <button
                        className="btn btn-primary"
                        disabled={!isManualBackupEnabled()}
                    >
                        수동백업
                    </button>
                </div>
            }
        >
            <BackupHistoryTable
                data={backupData}
                selectedItems={selectedItems}
                onSelectionChange={handleSelectionChange}
                onJiraIssueClick={handleJiraIssueClick}
            />

            {snapshotModal.type && (
                <SnapshotDetailModal
                    type={snapshotModal.type}
                    items={snapshotModal.items}
                    onClose={() => setSnapshotModal({ type: null, items: [] })}
                />
            )}

            {compareModalOpen && (
                <RuleCompareModal
                    selectedBackup={selectedItems[0]}
                    onClose={() => setCompareModalOpen(false)}
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