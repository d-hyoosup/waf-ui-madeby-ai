// src/components/RestoreStatusModal.tsx
import React, {useEffect, useMemo, useState} from 'react';
import type {JiraIssue, RestoreData} from '../../types/restore.types.ts';
import './RestoreStatusModal.css';
import {ExternalLinkIcon} from '../../components/common/Icons.tsx';

interface RestoreStatusModalProps {
    onClose: () => void;
    data: RestoreData;
}

const RestoreStatusModal: React.FC<RestoreStatusModalProps> = ({onClose, data}) => {
    const [cancelStep, setCancelStep] = useState<'confirm' | 'processing' | 'completed'>(data.showCancelProcess ? 'confirm' : 'completed');
    // const [approver, setApprover] = useState('');
    // const [reason, setReason] = useState('');

    useEffect(() => {
        if (data.showCancelProcess) {
            setCancelStep('confirm');
        }
    }, [data.showCancelProcess]);

    const getFlagBadgeClass = (flag: JiraIssue['interruptFlag']) => {
        switch (flag) {
            case 'CANCEL':
                return 'badge-danger';
            case 'FORCE_APPROVED':
                return 'badge-success';
            default:
                return 'badge-secondary';
        }
    };

    const getFlagText = (flag: JiraIssue['interruptFlag']) => {
        switch (flag) {
            case 'CANCEL':
                return '취소됨';
            case 'FORCE_APPROVED':
                return '강제 승인';
            default:
                return '-';
        }
    };

    // snapshotId: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
    // accountId: backup.account,
    // accountName: "HAE_Manager",
    // regionCode: backup.region,
    // regionName: AWS_REGIONS.find(r => r.code === backup.region)?.name || backup.region,
    // scope: backup.region === 'aws-global' ? 'CLOUDFRONT' : 'REGIONAL',
    // tagName: emergencyApprovalModal.backupId,
    // status: 'ROLLBACK_INPROGRESS', // 긴급 승인 시 복원중으로 상태 변경
    // issues: mockIssues,

    const currentStep = useMemo(() => {
        if (data.issues != undefined) {
            if (data.status === 'ROLLBACK_WAIT_FOR_APPLY') {
                return 3;
            } else if (data.status === 'ROLLBACK_INPROGRESS') {
                return 4;
            } else if (data.status === 'APPLIED' || data.status === 'ARCHIVED') {
                return 5;
            } else {
                return 2;
            }
        }

        return 0;
    }, [data.status]);

    const statusMessages: { [key: number]: string } = {
        1: `Jira 이슈 등록이 완료되었습니다. 관리자 승인을 대기합니다.`,
        2: `관리자 승인을 대기하고 있습니다. Jira 이슈를 확인할 수 있습니다.`,
        3: `WAF Rule 복원을 진행하고 있습니다.`,
        4: `복원이 성공적으로 완료되었습니다.`,
    };

    const steps = ['Jira 이슈 등록', '관리자 승인 대기', 'WAF Rule 복원중', '복원 완료'];

    const handleCancelRestore = () => {
        setCancelStep('processing');
        setTimeout(() => {
            setCancelStep('completed');
            setTimeout(() => {
                alert('복원이 취소되었습니다.');
                onClose();
            }, 1500);
        }, 2000);
    };

    const getModalTitle = () => {
        return data.showCancelProcess ? '⚠️복원 취소' : 'WAF Rule 복원 작업 상태';
    };

    if (data.showCancelProcess) {
        return (
            <div className="modal-overlay">
                <div className="modal-content restore-status-modal">
                    <header className="modal-header">
                        <h3>{getModalTitle()}</h3>
                        <button className="close-button" onClick={onClose}>&times;</button>
                    </header>
                    <main className="modal-body">
                        {cancelStep === 'confirm' && (
                            <div className="cancel-confirmation">
                                <div className="warning-message">
                                    <div className="warning-text">
                                        {/*<strong>복원 취소 확인</strong>*/}
                                        <p>진행 중인 WAF Rule 복원 요청을 취소하시겠습니까?</p>
                                        <ul>
                                            <li>Jira 이슈가 '취소됨' 상태로 변경됩니다.</li>
                                        </ul>
                                    </div>
                                </div>
                                {/*<div className="approval-form">*/}
                                {/*    <div className="form-group">*/}
                                {/*        <label htmlFor="approver">승인자 *</label>*/}
                                {/*        <input*/}
                                {/*            id="approver"*/}
                                {/*            type="text"*/}
                                {/*            value={approver}*/}
                                {/*            onChange={(e) => setApprover(e.target.value)}*/}
                                {/*            placeholder="승인자 이름을 입력하세요"*/}
                                {/*            className="form-input"*/}
                                {/*        />*/}
                                {/*    </div>*/}

                                {/*    <div className="form-group">*/}
                                {/*        <label htmlFor="reason">긴급 복원 사유 *</label>*/}
                                {/*        <textarea*/}
                                {/*            id="reason"*/}
                                {/*            value={reason}*/}
                                {/*            onChange={(e) => setReason(e.target.value)}*/}
                                {/*            placeholder="긴급 복원이 필요한 구체적인 사유를 입력하세요"*/}
                                {/*            className="form-textarea"*/}
                                {/*            rows={4}*/}
                                {/*        />*/}
                                {/*    </div>*/}
                                {/*</div>*/}
                            </div>
                        )}
                        {cancelStep === 'processing' && (
                            <div className="cancel-processing">
                                <div className="processing-spinner"></div>
                                <h4>복원 취소 처리중...</h4>
                                <p>WAF Rule 복원 작업을 취소하고 있습니다.</p>
                            </div>
                        )}
                        {cancelStep === 'completed' && (
                            <div className="cancel-completed">
                                <div className="success-icon">✅</div>
                                <h4>복원 취소 완료</h4>
                                <p>WAF Rule 복원 작업이 성공적으로 취소되었습니다.</p>
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
                    </footer>
                </div>
            </div>
        );
    }

    return (
        <div className="modal-overlay">
            <div className="modal-content restore-status-modal">
                <header className="modal-header">
                    <h3>{getModalTitle()}</h3>
                    <button className="close-button" onClick={onClose}>&times;</button>
                </header>
                <main className="modal-body">
                    <div className="restore-info-box">
                        <div><span>Account ID</span> {data.accountId}</div>
                        <div><span>Region</span> {data.regionName} ({data.regionCode})</div>
                        <div><span>Tag</span> {data.tagName}</div>
                    </div>

                    <div className="stepper-container">
                        {steps.map((label, index) => (
                            <div key={index}
                                 className={`step ${index + 1 <= currentStep ? (index + 1 === currentStep ? 'active' : 'completed') : ''}`}>
                                <div className="step-icon">{index + 1 < currentStep ? '✔' : index + 1}</div>
                                <div className="step-label">{label}</div>
                            </div>
                        ))}
                    </div>

                    <div className="jira-issues-container">
                        <h4>관련 Jira 이슈</h4>
                        <div className="jira-issues-list">
                            {data.issues.map((issue) => (
                                <div key={issue.issueKey} className="jira-issue-item">
                                    <a href={issue.link} target="_blank" rel="noopener noreferrer"
                                       className="issue-key-link">
                                        {issue.issueKey}
                                        <ExternalLinkIcon/>
                                    </a>
                                    <span className={`badge ${getFlagBadgeClass(issue.interruptFlag)}`}>
                                        {getFlagText(issue.interruptFlag)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="status-message-box">
                        {new Date().toLocaleString('ko-KR')} - {statusMessages[currentStep]}
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