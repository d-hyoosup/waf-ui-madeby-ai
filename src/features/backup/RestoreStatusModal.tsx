// src/features/backup/RestoreStatusModal.tsx
import React, {useEffect, useMemo, useState} from 'react';
// Update type import
import type { JiraIssue, RestoreData, BackupStatus } from '../../types/api.types.ts';
import './RestoreStatusModal.css';
import {ExternalLinkIcon} from '../../components/common/Icons.tsx';

interface RestoreStatusModalProps {
    onClose: () => void;
    data: RestoreData; // Uses RollbackProcessInfo which includes 'state' and 'issues'
}

const RestoreStatusModal: React.FC<RestoreStatusModalProps> = ({onClose, data}) => {
    // Determine initial cancel step based on props
    const initialCancelStep = data.showCancelProcess ? 'confirm' : 'completed';
    const [cancelStep, setCancelStep] = useState<'confirm' | 'processing' | 'completed'>(initialCancelStep);

    // Reset cancel step if showCancelProcess changes after initial render
    useEffect(() => {
        if (data.showCancelProcess) {
            setCancelStep('confirm');
        } else {
            // If the modal is kept open but showCancelProcess becomes false, reset or hide cancel UI
            setCancelStep('completed'); // Or potentially hide this part entirely
        }
    }, [data.showCancelProcess]);

    // Badge class logic remains the same
    const getFlagBadgeClass = (flag: JiraIssue['interruptFlag']) => {
        switch (flag) {
            case 'CANCEL': return 'badge-danger';
            case 'FORCE_APPROVED': return 'badge-success';
            default: return 'badge-secondary'; // NONE or other/undefined
        }
    };

    // Flag text logic remains the same
    const getFlagText = (flag: JiraIssue['interruptFlag']) => {
        switch (flag) {
            case 'CANCEL': return '취소됨';
            case 'FORCE_APPROVED': return '강제 승인';
            default: return '-'; // NONE or other/undefined
        }
    };

    // Calculate current step based on 'state' from API data
    const currentStep = useMemo(() => {
        // Map API states to step numbers
        switch (data.state) {
            case 'INIT': // Assuming INIT might map to step 1 (Jira registered)
                return 1;
            case 'ROLLBACK_WAIT_FOR_APPLY':
                return 2; // Waiting for approval
            case 'ROLLBACK_IN_PROGRESS':
            case 'ROLLING_BACK': // Handle ROLLING_BACK based on updated BackupStatus
                return 3; // Restore in progress
            case 'APPLIED':
            case 'ARCHIVED': // Consider these as completed states
                return 4; // Restore complete
            default:
                console.warn(`Unknown rollback state: ${data.state}`);
                return 0; // Unknown or initial state before Jira issue creation?
        }
    }, [data.state]);

    // Define steps labels
    const steps = ['Jira 이슈 등록', '관리자 승인 대기', 'WAF Rule 복원중', '복원 완료'];

    // Map step numbers to status messages, using data.state for context
    const statusMessages: { [key: number]: string } = {
        0: '롤백 프로세스 정보를 가져오는 중...',
        1: `Jira 이슈 등록이 완료되었습니다. (상태: ${data.state})`,
        2: `관리자 승인을 대기하고 있습니다. Jira 이슈를 확인할 수 있습니다. (상태: ${data.state})`,
        3: `WAF Rule 복원을 진행하고 있습니다. (상태: ${data.state})`,
        4: `복원이 완료되었습니다. (상태: ${data.state})`,
    };


    // Simulation for cancel processing - In real app, call API here
    const handleCancelRestore = () => {
        setCancelStep('processing');
        // Simulate API call delay
        setTimeout(() => {
            // Assume API call successful
            setCancelStep('completed');
            // Optionally close modal after showing success
            // setTimeout(() => {
            //     alert('복원이 취소되었습니다.'); // Or use a success toast
            //     onClose();
            // }, 1500);
        }, 2000);
        // TODO: Replace setTimeout with actual API call (BackupService.cancelRollback)
        // const item = backupData.find(b => b.id === backupId); // Need access to backupId or pass it
        // const jiraIssueKey = item?.jira?.jiraIssueKey || 'MANUAL-CANCEL';
        // BackupService.cancelRollback({ snapshotId: backupId, interruptedBy: 'user', reason: 'Cancelled via UI', jiraIssueKey })
        //   .then(() => { setCancelStep('completed'); /* ... */ })
        //   .catch(err => { /* handle error, reset step? */ setCancelStep('confirm'); });
    };

    const getModalTitle = () => data.showCancelProcess ? '⚠️ 복원 취소' : 'WAF Rule 복원 작업 상태';

    // Render cancel process UI if showCancelProcess is true
    if (data.showCancelProcess) {
        return (
            <div className="modal-overlay">
                <div className="modal-content restore-status-modal"> {/* Use specific class */}
                    <header className="modal-header">
                        <h3>{getModalTitle()}</h3>
                        <button className="close-button" onClick={onClose} aria-label="Close modal">&times;</button>
                    </header>
                    <main className="modal-body">
                        {cancelStep === 'confirm' && (
                            <div className="cancel-confirmation">
                                <div className="warning-message">
                                    <span className="warning-icon" role="img" aria-label="Warning">⚠️</span>
                                    <div className="warning-text">
                                        <p><strong>복원 취소 확인</strong></p>
                                        <p>진행 중인 WAF Rule 복원 요청 (Tag: {data.tagName})을 취소하시겠습니까?</p>
                                        <ul><li>관련 Jira 이슈 ({data.issues?.map(i => i.issueKey).join(', ') || 'N/A'}) 상태가 변경될 수 있습니다.</li></ul>
                                    </div>
                                </div>
                            </div>
                        )}
                        {cancelStep === 'processing' && (
                            <div className="cancel-processing">
                                <div className="processing-spinner" aria-hidden="true"></div>
                                <h4>복원 취소 처리중...</h4>
                                <p>WAF Rule 복원 작업을 취소하고 있습니다.</p>
                            </div>
                        )}
                        {cancelStep === 'completed' && (
                            <div className="cancel-completed">
                                <div className="success-icon" role="img" aria-label="Success">✅</div>
                                <h4>복원 취소 완료</h4>
                                <p>WAF Rule 복원 작업이 성공적으로 취소되었습니다.</p>
                                {/* Automatically close after a delay */}
                                {/* {useEffect(() => { const timer = setTimeout(onClose, 2000); return () => clearTimeout(timer); }, [])} */}
                            </div>
                        )}
                    </main>
                    <footer className="modal-footer">
                        {cancelStep === 'confirm' && (
                            <>
                                <button className="btn btn-secondary" onClick={onClose}>닫기</button>
                                <button className="btn btn-danger" onClick={handleCancelRestore}>복원 요청 취소</button>
                            </>
                        )}
                         {/* Optionally show a close button even during processing/completed */}
                         {(cancelStep === 'processing' || cancelStep === 'completed') && (
                             <button className="btn btn-secondary" onClick={onClose}>닫기</button>
                         )}
                    </footer>
                </div>
            </div>
        );
    }

    // Render status view UI if showCancelProcess is false
    return (
        <div className="modal-overlay">
            <div className="modal-content restore-status-modal">
                <header className="modal-header">
                    <h3>{getModalTitle()}</h3>
                    <button className="close-button" onClick={onClose} aria-label="Close modal">&times;</button>
                </header>
                <main className="modal-body">
                    {/* Info box remains the same */}
                    <div className="restore-info-box">
                        <div><span>Account ID</span> {data.accountId}</div>
                        <div><span>Region</span> {data.regionName} ({data.regionCode})</div>
                        <div><span>Tag</span> {data.tagName}</div>
                    </div>

                    {/* Stepper logic updated */}
                    <div className="stepper-container">
                        {steps.map((label, index) => (
                            <div key={index} className={`step ${index + 1 < currentStep ? 'completed' : index + 1 === currentStep ? 'active' : ''}`}>
                                <div className="step-icon" aria-hidden="true">{index + 1 < currentStep ? '✔' : index + 1}</div>
                                <div className="step-label">{label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Jira issues rendering updated using issue.link */}
                    <div className="jira-issues-container">
                        <h4>관련 Jira 이슈</h4>
                        <div className="jira-issues-list">
                            {data.issues && data.issues.length > 0 ? (
                                data.issues.map((issue: JiraIssue) => (
                                    <div key={issue.issueKey} className="jira-issue-item">
                                        <a href={issue.link} target="_blank" rel="noopener noreferrer" className="issue-key-link">
                                            {issue.issueKey}
                                            <ExternalLinkIcon/>
                                        </a>
                                        <span className={`badge ${getFlagBadgeClass(issue.interruptFlag)}`}>
                                            {getFlagText(issue.interruptFlag)}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <p>관련 Jira 이슈가 없습니다.</p> // Message when no issues
                            )}
                        </div>
                    </div>

                    {/* Status message box updated */}
                    <div className="status-message-box">
                       {/* Display current time and the message corresponding to the current step */}
                       {new Date().toLocaleString('ko-KR')} - {statusMessages[currentStep] || `알 수 없는 상태 (${data.state})`}
                    </div>
                </main>
                <footer className="modal-footer">
                    <button className="btn btn-primary" onClick={onClose}>닫기</button>
                </footer>
            </div>
        </div>
    );
};

export default RestoreStatusModal;