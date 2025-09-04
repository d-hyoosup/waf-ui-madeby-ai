// src/components/JiraDetailModal.tsx
import React from 'react';
import './ModalStyles.css';
import { ExternalLinkIcon } from './Icons';

interface JiraDetailModalProps {
  onClose: () => void;
  issueCount?: number;
  backupId?: string;
}

const JiraDetailModal: React.FC<JiraDetailModalProps> = ({ onClose, issueCount = 1, backupId = '20241223-112030' }) => {
  const singleIssueData = {
    issueKey: "GCI-51",
    title: "WAF Rule 복원 승인 요청",
    status: "승인 대기",
    priority: "High",
    assignee: "김현대",
    reporter: "시스템관리자",
    created: "2025-01-15 14:30:25",
    updated: "2025-01-15 15:45:12",
    link: "https://jira.example.com/browse/GCI-51",
    description: "계정 123456789012의 ap-northeast-2 리전에 있는 WAF Rule을 20250901-111052 백업으로 복원하는 작업에 대한 승인을 요청드립니다.",
    comments: [
      {
        author: "시스템관리자",
        date: "2025-01-15 14:30:25",
        content: "자동화된 복원 요청이 생성되었습니다."
      },
      {
        author: "김현대",
        date: "2025-01-15 15:45:12",
        content: "복원 요청 내용을 검토 중입니다. 백업 데이터의 무결성을 확인해주세요."
      }
    ],
    attachments: [
      {
        name: "backup_verification.txt",
        size: "2.1 KB",
        date: "2025-01-15 14:30:25"
      }
    ]
  };

  const multipleIssuesData = [
    {
      issueKey: "GCI-51",
      title: "WAF Rule 복원 승인 요청 - Primary",
      status: "승인 대기",
      priority: "High",
      assignee: "김현대",
      reporter: "시스템관리자",
      created: "2025-01-15 14:30:25",
      updated: "2025-01-15 15:45:12",
      link: "https://jira.example.com/browse/GCI-51",
      description: "메인 WAF Rule 복원 작업에 대한 승인 요청입니다."
    },
    {
      issueKey: "GCI-48",
      title: "WAF Rule 복원 승인 요청 - Secondary",
      status: "진행 중",
      priority: "Medium",
      assignee: "박보안",
      reporter: "시스템관리자",
      created: "2025-01-15 13:15:10",
      updated: "2025-01-15 16:20:33",
      link: "https://jira.example.com/browse/GCI-48",
      description: "보조 WAF Rule 복원 작업에 대한 승인 요청입니다."
    }
  ];

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case '승인 대기': return 'badge-warning';
      case '진행 중': return 'badge-info';
      case '완료': return 'badge-success';
      case '취소': return 'badge-danger';
      default: return 'badge-secondary';
    }
  };

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case 'High': return 'badge-danger';
      case 'Medium': return 'badge-warning';
      case 'Low': return 'badge-secondary';
      default: return 'badge-secondary';
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: issueCount === 1 ? '700px' : '900px' }}>
        <header className="modal-header">
          <h3>Jira 이슈 상세 정보 ({issueCount}개)</h3>
          <button className="close-button" onClick={onClose}>&times;</button>
        </header>

        <main className="modal-body">
          {issueCount === 1 ? (
            <div className="jira-issue-detail">
              <div className="issue-header-section">
                <div className="issue-title-area">
                  <h4>
                    <a href={singleIssueData.link} target="_blank" rel="noopener noreferrer" className="issue-link">
                      {singleIssueData.issueKey}
                      <ExternalLinkIcon />
                    </a>
                  </h4>
                  <p className="issue-title">{singleIssueData.title}</p>
                </div>
                <div className="issue-badges">
                  <span className={`badge ${getStatusBadgeClass(singleIssueData.status)}`}>
                    {singleIssueData.status}
                  </span>
                  <span className={`badge ${getPriorityBadgeClass(singleIssueData.priority)}`}>
                    {singleIssueData.priority}
                  </span>
                </div>
              </div>

              <div className="issue-meta-grid">
                <div className="meta-item">
                  <label>담당자</label>
                  <span>{singleIssueData.assignee}</span>
                </div>
                <div className="meta-item">
                  <label>보고자</label>
                  <span>{singleIssueData.reporter}</span>
                </div>
                <div className="meta-item">
                  <label>생성일</label>
                  <span>{singleIssueData.created}</span>
                </div>
                <div className="meta-item">
                  <label>수정일</label>
                  <span>{singleIssueData.updated}</span>
                </div>
              </div>

              <div className="issue-description-section">
                <h5>설명</h5>
                <div className="description-content">
                  {singleIssueData.description}
                </div>
              </div>

              <div className="issue-comments-section">
                <h5>댓글 ({singleIssueData.comments.length}개)</h5>
                <div className="comments-list">
                  {singleIssueData.comments.map((comment, index) => (
                    <div key={index} className="comment-item">
                      <div className="comment-header">
                        <strong>{comment.author}</strong>
                        <span className="comment-date">{comment.date}</span>
                      </div>
                      <div className="comment-content">{comment.content}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="issue-attachments-section">
                <h5>첨부파일 ({singleIssueData.attachments.length}개)</h5>
                <div className="attachments-list">
                  {singleIssueData.attachments.map((attachment, index) => (
                    <div key={index} className="attachment-item">
                      <span className="attachment-name">📎 {attachment.name}</span>
                      <span className="attachment-meta">
                        {attachment.size} • {attachment.date}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="jira-issues-summary">
              <div className="issues-grid">
                {/* ✅ [수정] 사용되지 않는 index 파라미터 제거 */}
                {multipleIssuesData.map((issue) => (
                  <div key={issue.issueKey} className="issue-card">
                    <div className="issue-card-header">
                      <div className="issue-key-title">
                        <h5>
                          <a href={issue.link} target="_blank" rel="noopener noreferrer" className="issue-link">
                            {issue.issueKey}
                            <ExternalLinkIcon />
                          </a>
                        </h5>
                        <p className="issue-card-title">{issue.title}</p>
                      </div>
                      <div className="issue-card-badges">
                        <span className={`badge ${getStatusBadgeClass(issue.status)}`}>
                          {issue.status}
                        </span>
                        <span className={`badge ${getPriorityBadgeClass(issue.priority)}`}>
                          {issue.priority}
                        </span>
                      </div>
                    </div>

                    <div className="issue-card-meta">
                      <div className="meta-row">
                        <span className="meta-label">담당자:</span>
                        <span>{issue.assignee}</span>
                      </div>
                      <div className="meta-row">
                        <span className="meta-label">생성일:</span>
                        <span>{issue.created}</span>
                      </div>
                      <div className="meta-row">
                        <span className="meta-label">수정일:</span>
                        <span>{issue.updated}</span>
                      </div>
                    </div>

                    <div className="issue-card-description">
                      {issue.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>

        <footer className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>닫기</button>
          {issueCount === 1 && (
            <button className="btn btn-primary">
              이슈에 댓글 추가
            </button>
          )}
        </footer>
      </div>
    </div>
  );
};

export default JiraDetailModal;