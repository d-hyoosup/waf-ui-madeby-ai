// src/api/mockBackupService.ts
import { mockBackupData } from '../data/mockBackupData';
import { mockBackupResourceData, mockCurrentResourceData } from '../data/mockResourceData';
import type { WafSnapshot, PagedResponse, RollbackProcessInfo, WafRuleResourceFile, RollbackInterruptRequest, WafRuleDiffStatus } from '../types/api.types';

// ✅ [수정] API enum 타입을 Mock 데이터의 키로 변환하는 헬퍼 함수
const mapResourceTypeToMockKey = (resourceType: string): string => {
    switch (resourceType) {
        case 'WEB_ACL':
            return 'Web ACLs';
        case 'IP_SET':
            return 'IP Sets';
        case 'REGEX_PATTERN_SET':
            return 'Regex pattern';
        case 'RULE_GROUP':
            return 'Rule Groups';
        default:
            return resourceType;
    }
};

export const getSnapshots = (): Promise<PagedResponse<WafSnapshot>> => {
    const content = mockBackupData.map(item => ({...item} as unknown as WafSnapshot));
    return new Promise(resolve => setTimeout(() => resolve({
        total: content.length,
        content: content,
        pagination: { pageNumber: 1, pageSize: 10, sort: { orders: [] } }
    }), 500));
};

export const getJiraIssues = (snapshotId: string): Promise<RollbackProcessInfo> => {
    const backup = mockBackupData.find(b => b.snapshotId === snapshotId);
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (backup) {
                resolve({
                    snapshotId: backup.snapshotId,
                    accountId: backup.accountId,
                    accountName: backup.accountName,
                    regionCode: backup.regionCode,
                    regionName: backup.regionName,
                    scope: backup.scope,
                    tagName: backup.tagName,
                    state: backup.state, // status -> state
                    issues: (backup.jiraIssues || []).map(key => ({
                        issueKey: key,
                        link: `https://jira.example.com/browse/${key}`,
                        interruptFlag: 'NONE'
                    }))
                });
            } else {
                reject("Not Found");
            }
        }, 300);
    });
};

export const getSnapshotFiles = (snapshotId: string): Promise<WafRuleResourceFile[]> => {
    const resources = mockBackupResourceData[snapshotId] || {};
    const files = Object.keys(resources).map(resourceType => {
        let apiResourceType = '';
        switch (resourceType) {
            case 'Web ACLs': apiResourceType = 'WEB_ACL'; break;
            case 'IP Sets': apiResourceType = 'IP_SET'; break;
            case 'Regex pattern': apiResourceType = 'REGEX_PATTERN_SET'; break;
            case 'Rule Groups': apiResourceType = 'RULE_GROUP'; break;
        }
        return {
            resourceType: apiResourceType,
            files: Object.keys(resources[resourceType])
        };
    });
    return new Promise(resolve => setTimeout(() => resolve(files.filter(f => f.resourceType)), 200));
};


export const getFileContent = (snapshotId: string, resourceType: string, fileName: string): Promise<any> => {
    const mockResourceType = mapResourceTypeToMockKey(resourceType);
    const content = mockBackupResourceData[snapshotId]?.[mockResourceType]?.[fileName];
    return new Promise(resolve => setTimeout(() => resolve(content ? JSON.parse(content) : null), 100));
};

export const getFileContentPair = (snapshotId: string, resourceType: string, fileName: string, withSnapshotId?: string) => {
     const mockResourceType = mapResourceTypeToMockKey(resourceType);

     const baseContent = mockBackupResourceData[snapshotId]?.[mockResourceType]?.[fileName];
     const targetContent = withSnapshotId
        ? mockBackupResourceData[withSnapshotId]?.[mockResourceType]?.[fileName]
        : mockCurrentResourceData[mockResourceType]?.[fileName];

    return new Promise(resolve => setTimeout(() => resolve({
        base: baseContent ? JSON.parse(baseContent) : null,
        target: targetContent ? JSON.parse(targetContent) : null,
    }), 400));
};

// ✅ [수정] getDiffStatus 함수를 제대로 구현
export const getDiffStatus = (snapshotId: string, withSnapshotId?: string): Promise<WafRuleDiffStatus[]> => {
    const diffs: WafRuleDiffStatus[] = [];
    const baseId = snapshotId;
    const targetId = withSnapshotId || 'live';

    const baseResources = mockBackupResourceData[baseId];
    const targetResources = targetId === 'live'
        ? mockCurrentResourceData
        : mockBackupResourceData[targetId];

    if (!baseResources || !targetResources) {
        return new Promise(resolve => setTimeout(() => resolve([]), 300));
    }

    const allResourceTypes = new Set([...Object.keys(baseResources), ...Object.keys(targetResources)]);

    allResourceTypes.forEach(resourceType => {
        const baseFiles = baseResources[resourceType] || {};
        const targetFiles = targetResources[resourceType] || {};
        const allFileNames = new Set([...Object.keys(baseFiles), ...Object.keys(targetFiles)]);

        let apiResourceType = '';
        switch (resourceType) {
            case 'Web ACLs': apiResourceType = 'WEB_ACL'; break;
            case 'IP Sets': apiResourceType = 'IP_SET'; break;
            case 'Regex pattern': apiResourceType = 'REGEX_PATTERN_SET'; break;
            case 'Rule Groups': apiResourceType = 'RULE_GROUP'; break;
        }

        if (!apiResourceType) return;

        allFileNames.forEach(fileName => {
            const inBase = fileName in baseFiles;
            const inTarget = fileName in targetFiles;
            let status: 'ADDED' | 'DELETED' | 'MODIFIED' | 'UNCHANGED';

            if (inBase && inTarget) {
                status = baseFiles[fileName] === targetFiles[fileName] ? 'UNCHANGED' : 'MODIFIED';
            } else if (inBase && !inTarget) {
                status = 'DELETED';
            } else { // !inBase && inTarget
                status = 'ADDED';
            }

            diffs.push({
                resourceType: apiResourceType,
                fileName,
                status,
            });
        });
    });

    return new Promise(resolve => setTimeout(() => resolve(diffs), 300));
};


// Mock implementations for write operations
export const manualBackup = (_scopeId: string) => new Promise(res => setTimeout(() => res({}), 1000));
export const rollback = (_snapshotId: string) => new Promise(res => setTimeout(() => res({}), 1000));
export const forceRollback = (_data: RollbackInterruptRequest) => new Promise(res => setTimeout(() => res({}), 1000));
export const cancelRollback = (_data: RollbackInterruptRequest) => new Promise(res => setTimeout(() => res({}), 1000));
export const getLiveFileContent = (_scopeId: string, _resourceType: string, _fileName: string) => new Promise(res => setTimeout(() => res({}), 100));