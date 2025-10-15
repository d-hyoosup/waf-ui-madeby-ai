// src/types/api.types.ts

// 1. Common & Pagination
export interface CommonResponseMetaInfo {
  txId: string;
  name: string;
  message?: string;
}

export interface Pageable {
  pageNumber: number;
  pageSize: number;
  sort: {
    orders: {
      direction: string;
      property: string;
      ignoreCase: boolean;
      nullHandling: string;
    }[];
  };
}

export interface PagedResponse<T> {
  total: number;
  content: T[];
  pagination: Pageable;
}

// 2. Account Management
export interface WafManagerAccount {
  accountId: string;
  accountName: string;
  email?: string;
}

export type AddAccountRequest = Omit<WafManagerAccount, 'email'>;


// 3. Settings Management
export type BackupType = 'MANUAL' | 'AUTO';

export interface WafSetting {
  scopeId: string;
  accountId: string;
  region: string;
  managed: boolean;
  backupType: BackupType;
  regionName?: string;
}

export interface UpdateSettingRequest {
  scopeId: string;
  managed: boolean;
  backupType: BackupType;
}

// 4. Alert Settings
export interface NotificationSummary {
  notificationId: string;
  channelName: string;
  selectedRulesCount: number;
  affectedRulesCount: number;
  description: string;
}

export interface NotificationChannelInfo {
  channelName: string;
  description: string;
  slackWebhookUrl: string;
  messageTemplate: string;
}

export interface NotificationResource {
  isSelected: boolean;
  nodeId: string;
  awsAccountId: string;
  regionCode: string;
  scope: string;
  resourceType: string;
  fileName: string;
  nodePath: string;
}

export interface NotificationDetail {
  channelInfo: NotificationChannelInfo;
  resources: NotificationResource[];
}

export interface AddNotificationRequest {
    channelInfo: NotificationChannelInfo;
    alertNodeIds: string[];
}

export interface TemplateVariables {
    templateTypes: string;
    variables: Record<string, string>;
}


// 5. Backup & Restore
export type BackupStatus = 'INIT' | 'APPLIED' | 'ARCHIVED' | 'ROLLBACK_WAIT_FOR_APPLY' | 'ROLLBACK_IN_PROGRESS';
export type InterruptFlag = 'CANCEL' | 'FORCE_APPROVED' | 'NONE' | string;

export interface WafSnapshot {
  snapshotId: string;
  scopeId: string;
  accountId: string;
  accountName: string;
  regionCode: string;
  regionName: string;
  scope: string;
  tagName: string;
  backupType: BackupType;
  state: BackupStatus; // status -> state로 변경
  requiresManualBackup: boolean;
  hasJiraIssues: boolean;
  jiraIssues?: string[];
  issueCount?: number;
}

export type BackupItem = WafSnapshot & {
  id: string; // snapshotId와 동일
  account: string; // accountId와 동일, 호환성을 위해 유지
  region: string; // regionCode와 동일
  type: '자동백업' | '수동백업';
  status: BackupStatus; // BackupHistoryTable 컴포넌트 호환성을 위해 유지 (state 값과 동일)
  rollbackStatus?: 'JIRA_APPROVAL_WAITING' | 'ROLLBACK_CANCEL' | 'VIEW_DETAIL';
};


export interface JiraIssue {
  issueKey: string;
  link: string;
  interruptFlag: InterruptFlag;
}

export interface RollbackProcessInfo {
  snapshotId: string;
  accountId: string;
  accountName: string;
  regionCode: string;
  regionName: string;
  scope: string;
  tagName: string;
  state: BackupStatus; // status -> state로 변경
  issues: JiraIssue[];
}

export type RestoreData = RollbackProcessInfo & {
  showCancelProcess?: boolean;
};


export interface RollbackInterruptRequest {
  snapshotId: string;
  jiraIssueKey: string;
  interruptedBy: string;
  reason: string;
}

export interface WafRuleResourceFile {
    resourceType: string;
    files: string[];
}

export interface WafRuleDiffStatus {
    resourceType: string;
    fileName: string;
    status: 'ADDED' | 'DELETED' | 'MODIFIED' | 'UNCHANGED';
}

interface WafVisibilityConfig {
  SampledRequestsEnabled: boolean;
  CloudWatchMetricsEnabled: boolean;
  MetricName: string;
}

export interface WebAcl {
  Name: string;
  Id: string;
  ARN: string;
  DefaultAction: { [key: string]: object };
  Rules?: object[];
  VisibilityConfig: WafVisibilityConfig;
}

export interface IpSet {
  Name: string;
  Id: string;
  ARN: string;
  IPAddressVersion: 'IPV4' | 'IPV6';
  Addresses: string[];
}

export interface RuleGroup {
  Name: string;
  Id: string;
  ARN: string;
  Capacity: number;
  Rules?: object[];
  VisibilityConfig: WafVisibilityConfig;
}

export interface RegexPatternSet {
  Name: string;
  Id: string;
  ARN: string;
  RegularExpressionList: { RegexString: string }[];
}

export type WafResource = WebAcl | IpSet | RuleGroup | RegexPatternSet;

export interface WafRulePairContent {
    base: WafResource | null;
    target: WafResource | null;
}