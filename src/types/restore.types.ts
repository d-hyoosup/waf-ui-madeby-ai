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
