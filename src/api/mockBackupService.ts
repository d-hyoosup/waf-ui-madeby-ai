// src/api/mockBackupService.ts
import { mockBackupData } from '../data/mockBackupData';
import { mockBackupResourceData, mockCurrentResourceData } from '../data/mockResourceData';
import type { WafSnapshot, PagedResponse, RollbackProcessInfo, WafRuleResourceFile, RollbackInterruptRequest } from '../types/api.types';

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
                    status: backup.status,
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
    const files = Object.keys(resources).map(resourceType => ({
        resourceType: resourceType.toUpperCase().replace(' ', '_'),
        files: Object.keys(resources[resourceType])
    }));
    return new Promise(resolve => setTimeout(() => resolve(files), 200));
};

export const getFileContent = (snapshotId: string, resourceType: string, fileName: string): Promise<any> => {
    const content = mockBackupResourceData[snapshotId]?.[resourceType]?.[fileName];
    return new Promise(resolve => setTimeout(() => resolve(content ? JSON.parse(content) : null), 100));
};

export const getFileContentPair = (snapshotId: string, resourceType: string, fileName: string, withSnapshotId?: string) => {
     const baseContent = mockBackupResourceData[snapshotId]?.[resourceType]?.[fileName];
     const targetContent = withSnapshotId
        ? mockBackupResourceData[withSnapshotId]?.[resourceType]?.[fileName]
        : mockCurrentResourceData[resourceType]?.[fileName];

    return new Promise(resolve => setTimeout(() => resolve({
        base: baseContent ? JSON.parse(baseContent) : null,
        target: targetContent ? JSON.parse(targetContent) : null,
    }), 400));
};


// Mock implementations for write operations
export const manualBackup = (_scopeId: string) => new Promise(res => setTimeout(() => res({}), 1000));
export const rollback = (_snapshotId: string) => new Promise(res => setTimeout(() => res({}), 1000));
export const forceRollback = (_data: RollbackInterruptRequest) => new Promise(res => setTimeout(() => res({}), 1000));
export const cancelRollback = (_data: RollbackInterruptRequest) => new Promise(res => setTimeout(() => res({}), 1000));
export const getLiveFileContent = (_scopeId: string, _resourceType: string, _fileName: string) => new Promise(res => setTimeout(() => res({}), 100));
export const getDiffStatus = (_snapshotId: string, _withSnapshotId?: string) => new Promise(res => setTimeout(() => res([]), 300));