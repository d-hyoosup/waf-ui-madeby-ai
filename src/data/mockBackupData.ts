// src/data/mockBackupData.ts
import type { BackupItem, BackupStatus } from '../types/restore.types';

export const mockBackupData: BackupItem[] = [
  {
    id: '20250112-150430',
    account: '123456789012',
    region: 'aws-global',
    type: '수동백업',
    status: 'APPLIED',
    jiraIssues: [],
    issueCount: 0,
    requiresManualBackup: false
  },
    {
      id: '20250912-150430',
      account: '123456789012',
      region: 'ap-northeast-1',
      type: '수동백업',
      status: 'APPLIED',
      jiraIssues: [],
      issueCount: 0,
      requiresManualBackup: true
    },
  {
    id: '20241223-112030',
    account: '123456789012',
    region: 'aws-global',
    type: '수동백업',
    status: 'ARCHIVED',
    jiraIssues: [],
    issueCount: 0,
    requiresManualBackup: false
  },
  {
    id: '20241010-150530',
    account: '123456789012',
    region: 'aws-global',
    type: '수동백업',
    status: 'ROLLBACK_INPROGRESS',
    jiraIssues: ['GCI-GW-001', 'GCI-GW-002'],
    issueCount: 2,
    rollbackStatus: 'VIEW_DETAIL',
    requiresManualBackup: false
  },
  {
    id: '20240615-152230',
    account: '123456789012',
    region: 'ap-northeast-2',
    type: '자동백업',
    status: 'ARCHIVED',
    jiraIssues: ['GCI-GW-003'],
    issueCount: 1,
    rollbackStatus: 'VIEW_DETAIL',
    requiresManualBackup: false
  },
  {
    id: '20250915-152230',
    account: '123456789012',
    region: 'ap-northeast-2',
    type: '수동백업',
    status: 'ROLLBACK_WAIT_FOR_APPLY',
    jiraIssues: ['GCI-GW-004', 'GCI-GW-005', 'GCI-GW-006'],
    issueCount: 3,
    requiresManualBackup: false
  },
  {
    id: '20250101-093000',
    account: '987654321098',
    region: 'us-east-1',
    type: '자동백업',
    status: 'ARCHIVED',
    jiraIssues: [],
    issueCount: 0,
    requiresManualBackup: false
  },
  {
    id: '20241215-141500',
    account: '987654321098',
    region: 'eu-west-1',
    type: '수동백업',
    status: 'ROLLBACK_INPROGRESS',
    jiraIssues: ['GCI-GW-007'],
    issueCount: 1,
    rollbackStatus: 'VIEW_DETAIL',
    requiresManualBackup: false
  }
];

// 상태별 배지 클래스 반환
export const getStatusBadgeClass = (status: BackupStatus): string => {
  switch (status) {
    case 'INIT': return 'badge-secondary';
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
    case 'INIT': return '초기상태';
    case 'APPLIED': return '적용중';
    case 'ARCHIVED': return '보관됨';
    case 'ROLLBACK_WAIT_FOR_APPLY': return '복원대기';
    case 'ROLLBACK_INPROGRESS': return '복원중';
    default: return status;
  }
};

// 작업 버튼 텍스트 반환
export const getRollbackActionText = (action: string): string => {
  switch (action) {
    case 'JIRA_APPROVAL_WAITING': return '긴급 승인';
    case 'ROLLBACK_CANCEL': return '복원 취소';
    case 'VIEW_DETAIL': return '상세 보기';
    default: return '';
  }
};

// 작업 버튼 스타일(색상) 반환
export const getRollbackActionBadgeClass = (action: string): string => {
  switch (action) {
    case 'JIRA_APPROVAL_WAITING': return 'badge-danger';
    case 'ROLLBACK_CANCEL': return 'badge-warning';
    case 'VIEW_DETAIL': return 'badge-info';
    default: return 'badge-secondary';
  }
};