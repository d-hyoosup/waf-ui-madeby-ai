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
export type BackupStatus = 'INIT' | 'APPLIED' | 'ARCHIVED' | 'ROLLBACK_WAIT_FOR_APPLY' | 'ROLLBACK_INPROGRESS';
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
  status: BackupStatus;
  requiresManualBackup: boolean;
  hasJiraIssues: boolean;
  jiraIssues?: string[];
  issueCount?: number;
}

export type BackupItem = WafSnapshot & {
  id: string;
  region: string;
  type: '자동백업' | '수동백업';
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
  status: BackupStatus;
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

// --- ✅ [수정] WAF 리소스 상세 타입 정의 ---
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
  Rules?: object[]; // 복잡성을 고려하여 우선 object로 유지
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

// --- ✅ [수정] WAF 리소스 Union 타입 생성 ---
export type WafResource = WebAcl | IpSet | RuleGroup | RegexPatternSet;

// --- ✅ [수정] WafRulePairContent 인터페이스 수정 ---
// 'any' 대신 구체적인 Union 타입을 사용하고,
// 파일이 한쪽에만 존재할 경우를 대비해 null을 허용합니다.
export interface WafRulePairContent {
    base: WafResource | null;
    target: WafResource | null;
}