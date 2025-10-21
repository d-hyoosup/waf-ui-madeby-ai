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
export interface WafManagerAccount { // Corresponds to WafManagerAccountVO
  accountId: string;
  accountName: string;
  email?: string; // Not in WafManagerAccountVO schema, but present in GET /accounts example
}

export type AddAccountRequest = Omit<WafManagerAccount, 'email'>; // Corresponds to RequestAddAccountDto


// 3. Settings Management
// ✅ [수정] Swagger enum 값 MANUAL, AUTO 로 수정
export type BackupType = 'MANUAL' | 'AUTO';

export interface WafSetting { // Corresponds to WafSettingVO
  scopeId: string;
  accountId: string;
  regionCode: string; // Corresponds to 'region' in WafSettingVO, renamed for clarity
  managed: boolean;
  backupType: BackupType;
  // Additional fields from WafSettingVO
  accountName?: string;
  regionName?: string;
  configured?: boolean;
  region: string; // Keep original 'region' from WafSettingVO if needed elsewhere
}

export interface UpdateSettingRequest { // Corresponds to UpdateSettingDto
  scopeId: string;
  managed: boolean;
  backupType: BackupType;
}

// 4. Alert Settings
export interface NotificationSummary { // Corresponds to NotificationSummaryVO
  notificationId: string;
  channelName: string;
  selectedRulesCount: number;
  // affectedRulesCount: number; // Not in NotificationSummaryVO
  description: string;
}

export interface NotificationChannelInfo { // Corresponds to NotificationChannelVO and RequestNotificationChannelDTO
  channelName: string;
  description: string;
  slackWebhookUrl: string;
  messageTemplate: string;
  // Potential additions based on Swagger examples (getNotificationDetail)
  // notificationLevel?: string;
  // titleTemplate?: string;
  // bodyTemplate?: string;
}

export interface NotificationResource { // Corresponds to NotificationResourceVO
  isSelected: boolean;
  nodeId: string;
  awsAccountId: string; // Changed from accountId to match Swagger
  regionCode: string;
  scope: string;
  resourceType: string;
  fileName: string;
  nodePath: string;
}

export interface NotificationDetail { // Corresponds to NotificationVO
  channelInfo: NotificationChannelInfo;
  resources: NotificationResource[]; // Corresponds to 'resources' in NotificationVO
}

export interface AddNotificationRequest { // Corresponds to RequestNotificationDTO
    channelInfo: NotificationChannelInfo;
    alertNodeIds: string[];
}

export interface TemplateVariables { // Corresponds to GET /waf/notifications/variables response data
    templateTypes: string;
    variables: Record<string, string>;
}


// 5. Backup & Restore
export type BackupStatus = 'INIT' | 'APPLIED' | 'ARCHIVED' | 'ROLLBACK_WAIT_FOR_APPLY' | 'ROLLBACK_IN_PROGRESS' | 'ROLLING_BACK'; // Added ROLLING_BACK based on example

export type InterruptFlag = 'CANCEL' | 'FORCE_APPROVED' | 'NONE' | string; // From IssueInfoVO

// Jira related info from WafSnapshotVO
export interface JiraInfo {
    jiraIssueKey: string;
    jiraIssueLink: string;
    issueStatus?: string; // Optional based on Swagger schema vs example discrepancy
}

export interface WafSnapshot { // Corresponds to WafSnapshotVO
  snapshotId: string;
  scopeId: string;
  accountId: string;
  accountName: string;
  regionCode: string; // Use regionCode consistently
  regionName: string;
  scope: string;
  tagName: string;
  gitlabUrl?: string; // Added from WafSnapshotVO
  backupType: BackupType;
  state: BackupStatus; // Changed from status to state
  requiresManualBackup: boolean;
  jira?: JiraInfo | null; // Changed from jiraIssues: string[]
  jiraBaseUrl?: string; // Added from WafSnapshotVO
  // hasJiraIssues and issueCount removed (derive in frontend if needed)
}

// Type used by BackupHistoryTable component, derived from WafSnapshot
export type BackupItem = WafSnapshot & {
  id: string; // snapshotId or scopeId for uniqueness
  account: string; // Maintain for compatibility (accountId)
  region: string; // Maintain for compatibility (regionCode)
  // ✅ [수정] 자동백업, 수동백업 문자열은 UI 표시용으로 BackupRestore 에서 변환
  type: '자동백업' | '수동백업'; // Derived from backupType
  status: BackupStatus; // Maintain for compatibility (state)
  // rollbackStatus removed
  // Calculated fields for UI
  hasJiraIssues: boolean;
  issueCount: number;
  jiraIssues?: string[]; // Keep optionally for compatibility if needed by table logic initially
};


export interface JiraIssue { // Corresponds to IssueInfoVO
  issueKey: string;
  link: string; // Changed from jiraIssueLink to link
  interruptFlag: InterruptFlag;
}

export interface RollbackProcessInfo { // Corresponds to RollbackProcessInfoVO
  snapshotId: string;
  accountId: string;
  accountName: string;
  regionCode: string;
  regionName: string;
  scope: string;
  tagName: string;
  state: BackupStatus; // Changed from status to state
  issues: JiraIssue[]; // Changed from jiraIssues
}

export type RestoreData = RollbackProcessInfo & {
  showCancelProcess?: boolean;
};


export interface RollbackInterruptRequest { // Corresponds to RequestRollbackInterruptDTO
  snapshotId: string;
  jiraIssueKey: string;
  interruptedBy: string;
  reason: string;
}

export interface WafRuleResourceFile { // Corresponds to WafRuleResourceVO
    resourceType: string;
    files: string[];
}

export interface WafRuleDiffStatus { // Corresponds to WafRuleDiffStatusVO
    resourceType: string;
    fileName: string;
    status: 'ADDED' | 'DELETED' | 'MODIFIED' | 'UNCHANGED';
}

// WAF Resource Types (mirroring Swagger definitions)
interface WafVisibilityConfig {
  SampledRequestsEnabled: boolean;
  CloudWatchMetricsEnabled: boolean;
  MetricName: string;
}

export interface WebAcl { // Corresponds to WebACL schema (simplified)
  Name: string;
  Id: string;
  ARN: string;
  DefaultAction: { [key: string]: object };
  Rules?: object[];
  VisibilityConfig: WafVisibilityConfig;
  // Add other fields like Scope, LockToken if needed based on usage
}

export interface IpSet { // Corresponds to IPSet schema
  Name: string;
  Id: string;
  ARN: string;
  IPAddressVersion: 'IPV4' | 'IPV6';
  Addresses: string[];
  // Add other fields like Scope, LockToken if needed
}

export interface RuleGroup { // Corresponds to RuleGroup schema (simplified)
  Name: string;
  Id: string;
  ARN: string;
  Capacity: number;
  Rules?: object[];
  VisibilityConfig: WafVisibilityConfig;
  // Add other fields like Scope, LockToken if needed
}

export interface RegexPatternSet { // Corresponds to RegexPatternSet schema
  Name: string;
  Id: string;
  ARN: string;
  RegularExpressionList: { RegexString: string }[];
  // Add other fields like Scope, LockToken if needed
}

// Union type for WAF resources
export type WafResource = WebAcl | IpSet | RuleGroup | RegexPatternSet;

export interface WafRulePairContent { // Corresponds to WafRulePairContentVOObject
    base: WafResource | null;
    target: WafResource | null;
}