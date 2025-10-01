// src/data/mockResourceData.ts

export interface ResourceFiles {
  [fileName: string]: string;
}

export interface BackupResources {
  [resourceType: string]: ResourceFiles;
}

export interface BackupResourceData {
  [backupId: string]: BackupResources;
}

// Helper to pretty-print JSON
const pretty = (obj: object) => JSON.stringify(obj, null, 2);

// --- [상세 비교용] 123456789012 / global ---

// Older Version: 20250929-103000
const globalResources_v1: BackupResources = {
  "Web ACLs": {
    "acl-identical.json": pretty({
      Name: "Identical-WebACL",
      DefaultAction: { Allow: {} },
      Rules: [],
      VisibilityConfig: {
        SampledRequestsEnabled: true,
        CloudWatchMetricsEnabled: true,
        MetricName: "Identical-WebACL",
      },
    }),
    "acl-modified.json": pretty({
      Name: "Modified-WebACL",
      DefaultAction: { Block: {} }, // This will change
      Description: "This is the original version of the ACL.",
      Rules: [],
      VisibilityConfig: {
        SampledRequestsEnabled: true,
        CloudWatchMetricsEnabled: true,
        MetricName: "Modified-WebACL",
      },
    }),
    "acl-deleted.json": pretty({
      Name: "Deleted-WebACL",
      DefaultAction: { Allow: {} },
      Description: "This ACL is deleted in the next version.",
      Rules: [],
      VisibilityConfig: {
        SampledRequestsEnabled: true,
        CloudWatchMetricsEnabled: true,
        MetricName: "Deleted-WebACL",
      },
    }),
  },
  "IP Sets": {
    "ipset-identical.json": pretty({
      Name: "Identical-IPSet",
      Scope: "CLOUDFRONT",
      IPAddressVersion: "IPV4",
      Addresses: ["192.0.2.0/24"],
    }),
    "ipset-modified.json": pretty({
      Name: "Modified-IPSet",
      Scope: "CLOUDFRONT",
      IPAddressVersion: "IPV4",
      Addresses: ["203.0.113.10/32"],
      Description: "Original IP set for partners.",
    }),
    "ipset-deleted.json": pretty({
      Name: "Deleted-IPSet",
      Scope: "CLOUDFRONT",
      IPAddressVersion: "IPV4",
      Addresses: ["198.51.100.44/32"],
    }),
  },
  "Rule Groups": {
    "rulegroup-identical.json": pretty({
      Name: "Identical-RuleGroup",
      Scope: "CLOUDFRONT",
      Capacity: 10,
      Rules: [],
      VisibilityConfig: {
        SampledRequestsEnabled: true,
        CloudWatchMetricsEnabled: true,
        MetricName: "Identical-RuleGroup",
      },
    }),
    "rulegroup-modified.json": pretty({
      Name: "Modified-RuleGroup",
      Scope: "CLOUDFRONT",
      Capacity: 20, // This will change
      Rules: [],
      VisibilityConfig: {
        SampledRequestsEnabled: true,
        CloudWatchMetricsEnabled: true,
        MetricName: "Modified-RuleGroup",
      },
    }),
    "rulegroup-deleted.json": pretty({
      Name: "Deleted-RuleGroup",
      Scope: "CLOUDFRONT",
      Capacity: 5,
      Rules: [],
      VisibilityConfig: {
        SampledRequestsEnabled: true,
        CloudWatchMetricsEnabled: true,
        MetricName: "Deleted-RuleGroup",
      },
    }),
  },
  "Regex pattern": {
    "regex-identical.json": pretty({
      Name: "Identical-Regex",
      Scope: "CLOUDFRONT",
      RegularExpressionList: [{ RegexString: "identical-pattern" }],
    }),
    "regex-modified.json": pretty({
      Name: "Modified-Regex",
      Scope: "CLOUDFRONT",
      RegularExpressionList: [{ RegexString: "old-pattern" }], // This will change
    }),
    "regex-deleted.json": pretty({
      Name: "Deleted-Regex",
      Scope: "CLOUDFRONT",
      RegularExpressionList: [{ RegexString: "delete-this-pattern" }],
    }),
  },
};

// Newer Version: 20250929-111530
const globalResources_v2: BackupResources = {
  "Web ACLs": {
    "acl-identical.json": pretty({ // IDENTICAL
      Name: "Identical-WebACL",
      DefaultAction: { Allow: {} },
      Rules: [],
      VisibilityConfig: {
        SampledRequestsEnabled: true,
        CloudWatchMetricsEnabled: true,
        MetricName: "Identical-WebACL",
      },
    }),
    "acl-modified.json": pretty({ // MODIFIED
      Name: "Modified-WebACL",
      DefaultAction: { Allow: {} }, // Changed from Block to Allow
      Description: "This is the MODIFIED version of the ACL.", // Changed description
      Rules: [],
      VisibilityConfig: {
        SampledRequestsEnabled: true,
        CloudWatchMetricsEnabled: true,
        MetricName: "Modified-WebACL",
      },
    }),
    "acl-added.json": pretty({ // ADDED
      Name: "Added-WebACL",
      DefaultAction: { Block: {} },
      Description: "This ACL is newly added in this version.",
      Rules: [],
      VisibilityConfig: {
        SampledRequestsEnabled: true,
        CloudWatchMetricsEnabled: true,
        MetricName: "Added-WebACL",
      },
    }),
  },
  "IP Sets": {
    "ipset-identical.json": pretty({ // IDENTICAL
      Name: "Identical-IPSet",
      Scope: "CLOUDFRONT",
      IPAddressVersion: "IPV4",
      Addresses: ["192.0.2.0/24"],
    }),
    "ipset-modified.json": pretty({ // MODIFIED
      Name: "Modified-IPSet",
      Scope: "CLOUDFRONT",
      IPAddressVersion: "IPV4",
      Addresses: ["203.0.113.10/32", "203.0.113.11/32"], // Added an IP
      Description: "Modified IP set for partners.", // Changed description
    }),
    "ipset-added.json": pretty({ // ADDED
      Name: "Added-IPSet",
      Scope: "CLOUDFRONT",
      IPAddressVersion: "IPV4",
      Addresses: ["203.0.114.0/24"],
    }),
  },
  "Rule Groups": {
    "rulegroup-identical.json": pretty({ // IDENTICAL
      Name: "Identical-RuleGroup",
      Scope: "CLOUDFRONT",
      Capacity: 10,
      Rules: [],
      VisibilityConfig: {
        SampledRequestsEnabled: true,
        CloudWatchMetricsEnabled: true,
        MetricName: "Identical-RuleGroup",
      },
    }),
    "rulegroup-modified.json": pretty({ // MODIFIED
      Name: "Modified-RuleGroup",
      Scope: "CLOUDFRONT",
      Capacity: 25, // Changed from 20
      Rules: [ // Added a rule
        {
          Name: "NewRule",
          Priority: 1,
          Action: { Count: {} },
          Statement: { GeoMatchStatement: { CountryCodes: ["KR"] } },
          VisibilityConfig: { SampledRequestsEnabled: true, CloudWatchMetricsEnabled: true, MetricName: "NewRule" },
        }
      ],
      VisibilityConfig: {
        SampledRequestsEnabled: true,
        CloudWatchMetricsEnabled: true,
        MetricName: "Modified-RuleGroup",
      },
    }),
    "rulegroup-added.json": pretty({ // ADDED
      Name: "Added-RuleGroup",
      Scope: "CLOUDFRONT",
      Capacity: 15,
      Rules: [],
      VisibilityConfig: {
        SampledRequestsEnabled: true,
        CloudWatchMetricsEnabled: true,
        MetricName: "Added-RuleGroup",
      },
    }),
  },
  "Regex pattern": {
    "regex-identical.json": pretty({ // IDENTICAL
      Name: "Identical-Regex",
      Scope: "CLOUDFRONT",
      RegularExpressionList: [{ RegexString: "identical-pattern" }],
    }),
    "regex-modified.json": pretty({ // MODIFIED
      Name: "Modified-Regex",
      Scope: "CLOUDFRONT",
      RegularExpressionList: [{ RegexString: "new-pattern" }], // Changed from "old-pattern"
    }),
    "regex-added.json": pretty({ // ADDED
      Name: "Added-Regex",
      Scope: "CLOUDFRONT",
      RegularExpressionList: [{ RegexString: "added-pattern" }],
    }),
  },
};

// --- 기타 형상 데이터 (항목별 1~3개) ---
const globalAppliedResources: BackupResources = { "Web ACLs": { "current-global-acl.json": pretty({ Name: "current-acl", Rules: [], DefaultAction: { Block: {} }}) } };
const usEast1Resources: BackupResources = { "IP Sets": { "us-office-ips.json": pretty({ Addresses: ["10.0.0.0/16"] }), "us-partner-ips.json": pretty({ Addresses: ["10.1.0.0/16"] }) } };
const apNortheast2ArchivedResources: BackupResources = { "Rule Groups": { "seoul-prod-rules.json": pretty({ Capacity: 100 }), "seoul-test-rules.json": pretty({ Capacity: 50 }) } };
const apNortheast2RollbackResources: BackupResources = { "Rule Groups": { "seoul-prod-rules.json": pretty({ Capacity: 100 }), "seoul-test-rules.json": pretty({ Capacity: 50 }), "seoul-staging-rules.json": pretty({ Capacity: 25 }) } };

// --- 최종 데이터 매핑 ---
export const mockBackupResourceData: BackupResourceData = {
  // --- 1. 123456789012 / global ---
  "20250929-103000": globalResources_v1,
  "20250929-111530": globalResources_v2,
  "20250929-120500": globalAppliedResources,

  // --- 2. 123456789012 / us-east-1 ---
  "20250928-094510": usEast1Resources,

  // --- 3. 987654321098 / ap-northeast-2 ---
  "20250927-142000": apNortheast2ArchivedResources,
  "20250927-150005": apNortheast2RollbackResources,

};

// 현재 적용중인 리소스 데이터 (참고용)
export const mockCurrentResourceData: BackupResources = {
    ...globalResources_v2 // 최신 버전의 글로벌 리소스를 현재 적용된 것으로 가정
};