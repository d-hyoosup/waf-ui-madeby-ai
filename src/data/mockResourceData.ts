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

// --- [상세 비교용] 123456789012 / global ---

// Older Version: 20250929-103000
const globalResources_v1: BackupResources = {
  "Web ACLs": {
    "acl-identical.json": `{\n  "Description": "This ACL is identical."\n}`,
    "acl-modified.json": `{\n  "Description": "This is the original version of the ACL."\n}`,
    "acl-deleted.json": `{\n  "Description": "This ACL is deleted in the next version."\n}`,
  },
  "IP Sets": {
    "ipset-identical.json": `{\n  "Description": "This IPSet is identical."\n}`,
    "ipset-modified.json": `{\n  "Addresses": ["1.1.1.1/32"]\n}`,
    "ipset-deleted.json": `{\n  "Description": "This IPSet is deleted."\n}`,
  },
  "Rule Groups": {
    "rulegroup-identical.json": `{\n  "Description": "This RuleGroup is identical."\n}`,
    "rulegroup-modified.json": `{\n  "Capacity": 100\n}`,
    "rulegroup-deleted.json": `{\n  "Description": "This RuleGroup is deleted."\n}`,
  },
  "Regex pattern": {
    "regex-identical.json": `{\n  "Description": "This Regex is identical."\n}`,
    "regex-modified.json": `{\n  "Pattern": "OLD_PATTERN"\n}`,
    "regex-deleted.json": `{\n  "Description": "This Regex is deleted."\n}`,
  },
};

// Newer Version: 20250929-111530
const globalResources_v2: BackupResources = {
  "Web ACLs": {
    "acl-identical.json": `{\n  "Description": "This ACL is identical."\n}`,
    "acl-modified.json": `{\n  "Description": "This is the MODIFIED version of the ACL."\n}`,
    "acl-added.json": `{\n  "Description": "This ACL is newly added in this version."\n}`,
  },
  "IP Sets": {
    "ipset-identical.json": `{\n  "Description": "This IPSet is identical."\n}`,
    "ipset-modified.json": `{\n  "Addresses": ["1.1.1.1/32", "8.8.8.8/32"]\n}`,
    "ipset-added.json": `{\n  "Description": "This IPSet is newly added."\n}`,
  },
  "Rule Groups": {
    "rulegroup-identical.json": `{\n  "Description": "This RuleGroup is identical."\n}`,
    "rulegroup-modified.json": `{\n  "Capacity": 200\n}`,
    "rulegroup-added.json": `{\n  "Description": "This RuleGroup is newly added."\n}`,
  },
  "Regex pattern": {
    "regex-identical.json": `{\n  "Description": "This Regex is identical."\n}`,
    "regex-modified.json": `{\n  "Pattern": "NEW_PATTERN"\n}`,
    "regex-added.json": `{\n  "Description": "This Regex is newly added."\n}`,
  },
};

// --- 기타 형상 데이터 (항목별 1~3개) ---
const globalAppliedResources: BackupResources = { "Web ACLs": { "current-global-acl.json": `{ "Version": 3 }` } };
const usEast1Resources: BackupResources = { "IP Sets": { "us-office-ips.json": `{}`, "us-partner-ips.json": `{}` } };
const apNortheast2ArchivedResources: BackupResources = { "Rule Groups": { "seoul-prod-rules.json": `{}`, "seoul-test-rules.json": `{}` } };
const apNortheast2RollbackResources: BackupResources = { "Rule Groups": { "seoul-prod-rules.json": `{}`, "seoul-test-rules.json": `{}`, "seoul-staging-rules.json": `{}` } };
const euWest1Resources: BackupResources = { "Regex pattern": { "ireland-patterns.json": `{}` } };

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

  // --- 4. 기타 샘플 데이터 ---
  "20250926-185559": euWest1Resources,
};

// 현재 적용중인 리소스 데이터 (참고용)
export const mockCurrentResourceData: BackupResources = {
    ...globalAppliedResources
};