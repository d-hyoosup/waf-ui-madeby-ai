import React, { useState, useEffect } from 'react';
import './ModalStyles.css';
import { ExternalLinkIcon } from './Icons';

type RollbackStatus = 'NONE' | 'REQUESTED' | 'WAITING_FOR_APPROVAL' | 'PROCESSING' | 'COMPLETED';
type InterruptFlag = 'CANCEL' | 'FORCE_APPROVED';

interface JiraIssue {
  issueKey: string;
  link: string;
  interruptFlag: InterruptFlag;
}

interface RestoreData {
  snapshotId: string;
  accountId: string;
  accountName: string;
  regionCode: string;
  regionName: string;
  scope: string;
  tagName: string;
  status: RollbackStatus;
  issues: JiraIssue[];
}

interface JiraApprovalModalProps {
  onClose: () => void;
  data?: RestoreData;
}

const JiraApprovalModal: React.FC<JiraApprovalModalProps> = ({ onClose, data }) => {
  // 목업 데이터 (실제로는 props로 전달받음)
  const mockData: RestoreData = data || {
    snapshotId: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
    accountId: "123456789012",
    accountName: "tester",
    regionCode: "us-east-1",
    regionName: "미국 동부(버지니아 북부)",
    scope: "REGIONAL",
    tagName: "20250901-111052",
    status: "WAITING_FOR_APPROVAL",
    issues: [
      {
        issueKey: "GCI-51",
        link: "https://jira.example.com/browse/GCI-51",
        interruptFlag: "CANCEL"
      },
      {
        issueKey: "GCI-48",
        link: "https://jira.example.com/browse/GCI-48",
        interruptFlag: "FORCE_APPROVED"
      },
      {
        issueKey: "GCI-49",
        link: "https://jira.example.com/browse/GCI-49",
        interruptFlag: "CANCEL"
      },
      {
        issueKey: "GCI-52",
        link: "https://jira.example.com/browse/GCI-52",
        interruptFlag: "FORCE_APPROVED"
      },
      {
        issueKey: "GCI-55",
        link: "https://jira.example.com/browse/GCI-55",
        interruptFlag: "CANCEL"
      }
    ]
  };

  const [approvalStatus, setApprovalStatus] = useState<'pending' | 'processing'>('pending');
  const [currentStep, setCurrentStep] = useState(1);

  // 강제 승인 버튼 클릭 시
  const handleForceApprove = () => {
    setApprovalStatus('processing');
  };

  // 진행 단계 자동 업데이트
  useEffect(() => {
    if (approvalStatus === 'processing' && currentStep < 4) {
      const timer = setTimeout(() => {
        setCurrentStep(prevStep => prevStep + 1);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [approvalStatus, currentStep]);

  // 상태별 배지 스타일
  const getStatusBadgeClass = (flag: InterruptFlag) => {
    switch (flag) {
      case 'FORCE_APPROVED': return 'badge-success';
      case 'CANCEL': return 'badge-danger';
      default: return 'badge-secondary';
    }
  };

  const getStatusText = (flag: InterruptFlag) => {
    switch (flag) {
      case 'FORCE_APPROVED': return '강제 승인됨';
      case 'CANCEL': return '취소됨';
      default: return '대기중';
    }
  };

  const getRegionDisplayName = (code: string, name: string) => {
    return `${name} (${code})`;
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '700px' }}>
        {approvalStatus === 'pending' && (
          <>
            <header className="modal-header">
              <h3>Jira 강제 승인</h3>
              <button className="close-button" onClick={onClose}>&times;</button>
            </header>

            <main className="modal-body">
              {/* 복원 정보 */}
              <div className="restore-info-section">
                <h4>복원 정보</h4>
                <div className="info-grid">
                  <div className="info-item">
                    <label className="info-label">Account ID</label>
                    <input type="text" className="info-input" value={mockData.accountId} readOnly />
                  </div>
                  <div className="info-item">
                    <label className="info-label">Account Name</label>
                    <input type="text" className="info-input" value={mockData.accountName} readOnly />
                  </div>
                  <div className="info-item">
                    <label className="info-label">Region Code</label>
                    <input type="text" className="info-input" value={mockData.regionCode} readOnly />
                  </div>
                  <div className="info-item">
                    <label className="info-label">Region Name</label>
                    <input type="text" className="info-input" value={mockData.regionName} readOnly />
                  </div>
                  <div className="info-item">
                    <label className="info-label">Scope</label>
                    <input type="text" className="info-input" value={mockData.scope} readOnly />
                  </div>
                  <div className="info-item">
                    <label className="info-label">Tag Name</label>
                    <input type="text" className="info-input" value={mockData.tagName} readOnly />
                  </div>
                </div>
              </div>

              {/* Jira 이슈 목록 */}
              <div className="jira-issues-section">
                <h4>관련 Jira 이슈 ({mockData.issues.length}개)</h4>
                <div className="issues-list">
                  {mockData.issues.map((issue) => (
                    <div key={issue.issueKey} className="issue-item">
                      <div className="issue-header">
                        <div className="issue-key-link">
                          <a
                            href={issue.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="issue-link"
                          >
                            {issue.issueKey}
                            <ExternalLinkIcon />
                          </a>
                        </div>
                        <span className={`badge ${getStatusBadgeClass(issue.interruptFlag)}`}>
                          {getStatusText(issue.interruptFlag)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="warning-message">
                <div className="warning-icon">⚠️</div>
                <div className="warning-text">
                  <strong>강제 승인 시 주의사항:</strong>
                  <ul>
                    <li>모든 Jira 이슈의 승인 절차가 무시됩니다</li>
                    <li>복원 작업이 즉시 진행됩니다</li>
                    <li>이 작업은 되돌릴 수 없습니다</li>
                  </ul>
                </div>
              </div>
            </main>

            <footer className="modal-footer">
              <button className="btn btn-secondary" onClick={onClose}>취소</button>
              <button className="btn btn-danger" onClick={handleForceApprove}>
                강제 승인하고 복원 시작
              </button>
            </footer>
          </>
        )}

        {approvalStatus === 'processing' && (
          <>
            <header className="modal-header">
              <h3>복원 진행</h3>
              <button className="close-button" onClick={onClose}>&times;</button>
            </header>

            <main className="modal-body">
              <div className="processing-info">
                <p><strong>Account:</strong> {mockData.accountName} ({mockData.accountId})</p>
                <p><strong>Region:</strong> {getRegionDisplayName(mockData.regionCode, mockData.regionName)}</p>
                <p><strong>Tag:</strong> {mockData.tagName}</p>
                <p><strong>복원 시작 시간:</strong> {new Date().toLocaleString('ko-KR')}</p>
              </div>

              <div className="progress-bar-container">
                <div className={`progress-step ${currentStep >= 1 ? 'active' : ''}`}>1 Jira 승인</div>
                <div className={`progress-step ${currentStep >= 2 ? 'active' : ''}`}>2 복원 확인</div>
                <div className={`progress-step ${currentStep >= 3 ? 'active' : ''}`}>3 WAF Rule 복원</div>
                <div className={`progress-step ${currentStep >= 4 ? 'active' : ''}`}>4 복원 완료</div>
              </div>

              <div className="step-message">
                {currentStep < 4
                  ? `${currentStep}단계 진행 중...`
                  : '복원이 완료되었습니다.'}
              </div>

              {/* 처리된 이슈 목록 */}
              <div className="processed-issues">
                <h5>처리된 Jira 이슈</h5>
                <div className="issues-summary">
                  {mockData.issues.map(issue => (
                    <div key={issue.issueKey} className="processed-issue">
                      <span className="issue-key">{issue.issueKey}</span>
                      <span className="badge badge-success">강제 승인 완료</span>
                    </div>
                  ))}
                </div>
              </div>
            </main>

            <footer className="modal-footer">
              {currentStep < 4 ? (
                <button className="btn btn-secondary" onClick={onClose}>
                  진행 취소
                </button>
              ) : (
                <button className="btn btn-primary" onClick={onClose}>
                  닫기
                </button>
              )}
            </footer>
          </>
        )}
      </div>
    </div>
  );
};

export default JiraApprovalModal;