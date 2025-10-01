// src/features/backup/backupUtils.ts
import type { BackupStatus } from '../../types/api.types.ts';

export const getStatusBadgeClass = (status: BackupStatus): string => {
  switch (status) {
    case 'INIT': return 'badge-secondary';
    case 'APPLIED': return 'badge-success';
    case 'ARCHIVED': return 'badge-secondary';
    case 'ROLLBACK_WAIT_FOR_APPLY': return 'badge-warning';
    case 'ROLLBACK_IN_PROGRESS': return 'badge-restoring';
    default: return 'badge-secondary';
  }
};

export const getStatusText = (status: BackupStatus): string => {
  switch (status) {
    case 'INIT': return '초기상태';
    case 'APPLIED': return '적용중';
    case 'ARCHIVED': return '보관됨';
    case 'ROLLBACK_WAIT_FOR_APPLY': return '복원대기';
    case 'ROLLBACK_IN_PROGRESS': return '복원중';
    default: return status;
  }
};

export const getRollbackActionText = (action: string): string => {
  switch (action) {
    case 'JIRA_APPROVAL_WAITING': return '긴급 승인';
    case 'ROLLBACK_CANCEL': return '복원 취소';
    case 'VIEW_DETAIL': return '상세 보기';
    case 'RESTORE': return '복원';
    default: return '';
  }
};

export const getRollbackActionBadgeClass = (action: string): string => {
  switch (action) {
    case 'JIRA_APPROVAL_WAITING': return 'badge-danger';    // 긴급 승인: 빨간색 (유지)
    case 'ROLLBACK_CANCEL': return 'badge-warning';
    case 'VIEW_DETAIL': return 'badge-info';
    case 'RESTORE': return 'badge-restoring'; // 복원: 주황색으로 변경
    default: return 'badge-secondary';
  }
};