// src/data/mockBackupData.ts
import type { BackupItem, BackupStatus } from '../types/restore.types';

export const mockBackupData: BackupItem[] = [
  // --- 1. 123456789012 / global ---
  {
    id: '20250929-103000',
    account: '123456789012',
    region: 'aws-global',
    type: '자동백업',
    status: 'ARCHIVED',
    jiraIssues: [],
    issueCount: 0,
    requiresManualBackup: false
  },
  {
    id: '20250929-111530',
    account: '123456789012',
    region: 'aws-global',
    type: '자동백업',
    status: 'ROLLBACK_INPROGRESS',
    jiraIssues: ['GCI-101', 'GCI-102'],
    issueCount: 2,
    requiresManualBackup: false
  },
  {
    id: '20250929-120500',
    account: '123456789012',
    region: 'aws-global',
    type: '자동백업',
    status: 'ACTIVE',
    jiraIssues: [],
    issueCount: 0,
    requiresManualBackup: false
  },

  // --- 2. 123456789012 / us-east-1 ---
  {
    id: '20250928-094510',
    account: '123456789012',
    region: 'us-east-1',
    type: '수동백업',
    status: 'ACTIVE',
    jiraIssues: [],
    issueCount: 0,
    requiresManualBackup: true
  },

  // --- 3. 987654321098 / ap-northeast-2 ---
  {
    id: '20250927-142000',
    account: '987654321098',
    region: 'ap-northeast-2',
    type: '수동백업',
    status: 'ARCHIVED',
    jiraIssues: [],
    issueCount: 0,
    requiresManualBackup: false
  },
  {
    id: '20250927-150005',
    account: '987654321098',
    region: 'ap-northeast-2',
    type: '수동백업',
    status: 'ROLLBACK_WAIT_FOR_APPLY',
    jiraIssues: ['GCI-201'],
    issueCount: 1,
    rollbackStatus: 'VIEW_DETAIL',
    requiresManualBackup: false
  },

  // --- 4. 기타 샘플 데이터 ("적용중" 상태) ---
  {
    id: '20250926-185559',
    account: '123456789012',
    region: 'eu-west-1',
    type: '자동백업',
    status: 'ACTIVE', // 적용중
    jiraIssues: [],
    issueCount: 0,
    requiresManualBackup: false,
  },
];


// 상태별 배지 클래스 반환
export const getStatusBadgeClass = (status: BackupStatus): string => {
  switch (status) {
    case 'INIT': return 'badge-secondary';
    case 'ACTIVE': return 'badge-success';
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
    case 'ACTIVE': return '적용중';
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