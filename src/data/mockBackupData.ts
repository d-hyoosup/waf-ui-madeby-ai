// src/data/mockBackupData.ts

export type BackupStatus = 'APPLIED' | 'ARCHIVED' | 'ROLLBACK_WAIT_FOR_APPLY' | 'ROLLBACK_INPROGRESS';

export interface BackupItem {
  id: string;
  account: string;
  region: string;
  type: '자동백업' | '수동백업';
  status: BackupStatus;
  jiraIssue: string;
    jiraIssues?: string[];
  issueCount: number;
  rollbackStatus?: 'JIRA_APPROVAL_WAITING' | 'ROLLBACK_CANCEL' | 'VIEW_DETAIL';
}

export const mockBackupData: BackupItem[] = [
  {
    id: '20250112-150430',
    account: '123456789012',
    region: 'aws-global',
    type: '수동백업',
    status: 'APPLIED',
    jiraIssue: '',
    issueCount: 0
  },
  {
    id: '20241223-112030',
    account: '123456789012',
    region: 'aws-global',
    type: '수동백업',
    status: 'ARCHIVED',
    jiraIssue: '',
    issueCount: 0
  },
  {
    id: '20241010-150530',
    account: '123456789012',
    region: 'aws-global',
    type: '수동백업',
    status: 'ROLLBACK_INPROGRESS',
    jiraIssue: 'GCI-GW-001',
    jiraIssues: ['GCI-GW-001', 'GCI-GW-002'],
    issueCount: 2,
    rollbackStatus: 'JIRA_APPROVAL_WAITING'
  },
  {
    id: '20240615-152230',
    account: '123456789012',
    region: 'ap-northeast-2',
    type: '자동백업',
    status: 'ARCHIVED',
    jiraIssue: 'GCI-GW-003',
    jiraIssues: ['GCI-GW-003'],
    issueCount: 1
  },
  {
    id: '20250915-152230',
    account: '123456789012',
    region: 'ap-northeast-2',
    type: '수동백업',
    status: 'ROLLBACK_WAIT_FOR_APPLY',
    jiraIssue: 'GCI-GW-004',
    jiraIssues: ['GCI-GW-004', 'GCI-GW-005', 'GCI-GW-006'],
    issueCount: 3,
    rollbackStatus: 'VIEW_DETAIL'
  },
  {
    id: '20250101-093000',
    account: '987654321098',
    region: 'us-east-1',
    type: '자동백업',
    status: 'ARCHIVED',
    jiraIssue: '',
    issueCount: 0
  },
  {
    id: '20241215-141500',
    account: '987654321098',
    region: 'eu-west-1',
    type: '수동백업',
    status: 'ROLLBACK_INPROGRESS',
    jiraIssue: 'GCI-GW-007',
    jiraIssues: ['GCI-GW-007'],
    issueCount: 1,
    rollbackStatus: 'ROLLBACK_CANCEL'
  },
];

// 상태별 배지 클래스 반환
export const getStatusBadgeClass = (status: BackupStatus): string => {
  switch (status) {
    case 'APPLIED': return 'badge-success';
    case 'ARCHIVED': return 'badge-secondary';
    case 'ROLLBACK_WAIT_FOR_APPLY': return 'badge-warning';
    case 'ROLLBACK_INPROGRESS': return 'badge-restoring';
    default: return 'badge-secondary';
  }
};

// 상태별 텍스트 반환
export const getStatusText = (status: BackupStatus): string => {
  switch (status) {
    case 'APPLIED': return '적용중';
    case 'ARCHIVED': return '보관됨';
    case 'ROLLBACK_WAIT_FOR_APPLY': return '복원대기';
    case 'ROLLBACK_INPROGRESS': return '복원중';
    default: return status;
  }
};

// 롤백 상태 텍스트 반환
export const getRollbackStatusText = (status?: string): string => {
  switch (status) {
    case 'JIRA_APPROVAL_WAITING': return 'Jira 승인 대기';
    case 'ROLLBACK_CANCEL': return '복원 취소';
    case 'VIEW_DETAIL': return '상세 보기';
    default: return '';
  }
};

// 롤백 상태 배지 클래스 반환
export const getRollbackBadgeClass = (status?: string): string => {
  switch (status) {
    case 'JIRA_APPROVAL_WAITING': return 'badge-warning';
    case 'ROLLBACK_CANCEL': return 'badge-danger';
    case 'VIEW_DETAIL': return 'badge-info';
    default: return '';
  }
};