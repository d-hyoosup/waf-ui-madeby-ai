// src/components/RestoreStatusModal.tsx
import React, { useState, useMemo } from 'react';
import './RestoreStatusModal.css';
import { ExternalLinkIcon } from './Icons';

interface JiraIssue {
    issueKey: string;
    link: string;
    interruptFlag: 'CANCEL' | 'FORCE_APPROVED' | 'NONE' | string;
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

interface RestoreStatusModalProps {
    onClose: () => void;
    data: RestoreData;
}

const RestoreStatusModal: React.FC<RestoreStatusModalProps> = ({ onClose, data }) => {
    const [showEmergencyApproval, setShowEmergencyApproval] = useState(false);
    const [emergencyStep, setEmergencyStep] = useState<'request' | 'submit'>('request');
    const [issuedToken, setIssuedToken] = useState<string>('');
    const [inputToken, setInputToken] = useState<string>('');

    const getFlagBadgeClass = (flag: JiraIssue['interruptFlag']) => {
        switch (flag) {
            case 'CANCEL': return 'badge-danger';
            case 'FORCE_APPROVED': return 'badge-success';
            default: return 'badge-secondary';
        }
    };

    const getFlagText = (flag: JiraIssue['interruptFlag']) => {
        switch (flag) {
            case 'CANCEL': return '취소됨';
            case 'FORCE_APPROVED': return '강제 승인';
            default: return '-';
        }
    };

    const currentStep = useMemo(() => {
        switch (data.status) {
            case 'NONE':
            case 'REQUESTED':
                return 1;
            case 'WAITING_FOR_APPROVAL':
                return 2;
            case 'PROCESSING':
                return 3;
            case 'COMPLETED':
                return 4;
            default:
                return 1;
        }
    }, [data.status]);

    const statusMessages: { [key: number]: string } = {
        1: `${new Date().toLocaleTimeString('ko-KR', { hour: 'numeric', minute: 'numeric', second: 'numeric' })} Jira 이슈 등록이 완료되었습니다. 관리자 승인을 대기합니다.`,
        2: `${new Date().toLocaleTimeString('ko-KR', { hour: 'numeric', minute: 'numeric', second: 'numeric' })} 관리자 승인을 대기하고 있습니다. Jira 이슈를 확인할 수 있습니다.`,
        3: `${new Date().toLocaleTimeString('ko-KR', { hour: 'numeric', minute: 'numeric', second: 'numeric' })} WAF Rule 복원을 진행하고 있습니다.`,
        4: `${new Date().toLocaleTimeString('ko-KR', { hour: 'numeric', minute: 'numeric', second: 'numeric' })} 복원이 성공적으로 완료되었습니다.`,
    };

    const steps = ['Jira 이슈 등록', '관리자 승인 대기', 'WAF Rule 복원중', '복원 완료'];

    const restoreStartTime = useMemo(() => {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const time = date.toLocaleTimeString('ko-KR', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
        return `${year}-${month}-${day} ${time}`;
    }, []);

    const handleEmergencyApprovalClick = () => {
        setShowEmergencyApproval(true);
        setEmergencyStep('request');
    };

    const handleRequestToken = () => {
        const newToken = '262a0ff4-70a4-4e05-8381-de3096f41527';
        setIssuedToken(newToken);
        setEmergencyStep('submit');
    };

    const handleSubmitApproval = () => {
        if (inputToken === issuedToken) {
            alert('긴급 승인이 성공적으로 요청되었습니다.');
            setShowEmergencyApproval(false);
            setInputToken('');
            setIssuedToken('');
            setEmergencyStep('request');
            onClose();
        } else {
            alert('토큰이 일치하지 않습니다. 다시 확인해 주세요.');
        }
    };

    const handleCancelEmergency = () => {
        setShowEmergencyApproval(false);
        setInputToken('');
        setIssuedToken('');
        setEmergencyStep('request');
    };

    const getModalTitle = () => {
        if (!showEmergencyApproval) return 'WAF Rule 복원 작업 상태';
        return emergencyStep === 'request' ? '긴급 승인 (1/2) - 토큰 발급' : '긴급 승인 (2/2) - 승인 요청';
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content restore-status-modal">
                <header className="modal-header">
                    <h3>{getModalTitle()}</h3>
                    <button className="close-button" onClick={onClose}>&times;</button>
                </header>
                <main className="modal-body">
                    {!showEmergencyApproval ? (
                        <>
                            <div className="restore-info-box">
                                <div><span>Account ID</span> {data.accountId}</div>
                                <div><span>Region</span> {data.regionName} ({data.regionCode})</div>
                                <div><span>Tag</span> {data.tagName}</div>
                                <div><span>복원 시작 시간</span> {restoreStartTime}</div>
                            </div>

                            <div className="stepper-container">
                                {steps.map((label, index) => {
                                    const stepNumber = index + 1;
                                    let statusClass = '';
                                    if (stepNumber < currentStep) statusClass = 'completed';
                                    if (stepNumber === currentStep) statusClass = 'active';

                                    return (
                                        <div key={stepNumber} className={`step ${statusClass}`}>
                                            <div className="step-icon">
                                                {statusClass === 'completed' ? '✓' : stepNumber}
                                            </div>
                                            <div className="step-label">{label}</div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="jira-issues-container">
                                <h4>관련 Jira 이슈</h4>
                                <div className="jira-issues-list">
                                    {data.issues.map((issue) => (
                                        <div key={issue.issueKey} className="jira-issue-item">
                                            <a href={issue.link} target="_blank" rel="noopener noreferrer" className="issue-key-link">
                                                {issue.issueKey}
                                                <ExternalLinkIcon />
                                            </a>
                                            <span className={`badge ${getFlagBadgeClass(issue.interruptFlag)}`}>
                                                {getFlagText(issue.interruptFlag)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="restore-actions">
                                <button className="btn btn-secondary">복원 취소</button>
                                <button className="btn btn-danger" onClick={handleEmergencyApprovalClick}>긴급 승인</button>
                            </div>

                            <div className="status-message-box">
                                {statusMessages[currentStep]}
                            </div>
                        </>
                    ) : (
                        <div className="emergency-approval-container">
                            {emergencyStep === 'request' ? (
                                <div className="approval-step-content">
                                    <p>긴급 승인을 진행하려면 일회용 토큰이 필요합니다. 아래 버튼을 눌러 토큰을 발급받으세요.</p>
                                </div>
                            ) : (
                                <div className="approval-step-content">
                                    <div className="token-display-box">
                                        <div className="token-label">발급된 토큰:</div>
                                        <div className="token-value">{issuedToken}</div>
                                    </div>
                                    <p>위 토큰을 아래 입력란에 입력하고 승인을 요청하세요.</p>
                                    <div className="form-group">
                                        <label htmlFor="tokenInput">토큰 입력</label>
                                        <input
                                            id="tokenInput"
                                            type="text"
                                            value={inputToken}
                                            onChange={(e) => setInputToken(e.target.value)}
                                            placeholder="발급된 토큰 정보를 입력하세요."
                                            className="token-input"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </main>
                <footer className="modal-footer" style={{ justifyContent: 'flex-end' }}>
                    {!showEmergencyApproval ? (
                        <button className="btn btn-primary">새로고림</button>
                    ) : emergencyStep === 'request' ? (
                        <>
                            <button className="btn btn-secondary" onClick={handleCancelEmergency}>취소</button>
                            <button className="btn btn-primary" onClick={handleRequestToken}>토큰 발급 요청</button>
                        </>
                    ) : (
                        <>
                            <button className="btn btn-secondary" onClick={handleCancelEmergency}>취소</button>
                            <button
                                className="btn btn-danger"
                                onClick={handleSubmitApproval}
                                disabled={inputToken !== issuedToken || !inputToken}
                            >
                                긴급 승인 요청
                            </button>
                        </>
                    )}
                </footer>
            </div>
        </div>
    );
};

export default RestoreStatusModal;