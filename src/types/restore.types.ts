// src/types/restore.types.ts
export type RollbackStatus = 'NONE' | 'REQUESTED' | 'WAITING_FOR_APPROVAL' | 'PROCESSING' | 'COMPLETED';
export type InterruptFlag = 'CANCEL' | 'FORCE_APPROVED' | 'NONE' | string;

export interface JiraIssue {
  issueKey: string;
  link: string;
  interruptFlag: InterruptFlag;
}

export interface RestoreData {
  snapshotId: string;
  accountId: string;
  accountName: string;
  regionCode: string;
  regionName: string;
  scope: string;
  tagName: string;
  status: RollbackStatus;
  issues: JiraIssue[];
  showEmergencyApproval?: boolean;
  showCancelProcess?: boolean;
}

// ✅ [수정] BackupStatus 타입 업데이트
export type BackupStatus = 'INIT' | 'APPLIED' | 'ARCHIVED' | 'ROLLBACK_WAIT_FOR_APPLY' | 'ROLLBACK_INPROGRESS';

export interface BackupItem {
  id: string;
  account: string;
  region: string;
  type: '자동백업' | '수동백업';
  status: BackupStatus;
  jiraIssues?: string[];
  issueCount: number;
  rollbackStatus?: 'JIRA_APPROVAL_WAITING' | 'ROLLBACK_CANCEL' | 'VIEW_DETAIL';
  requiresManualBackup?: boolean;
}