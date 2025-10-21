// src/api/mockBackupService.ts
import { mockBackupData } from '../data/mockBackupData';
import { mockBackupResourceData, mockCurrentResourceData } from '../data/mockResourceData';
import type {
    WafSnapshot, PagedResponse, RollbackProcessInfo, WafRuleResourceFile,
    RollbackInterruptRequest, WafRuleDiffStatus, WafRulePairContent, WafResource, BackupItem, JiraIssue // Import JiraIssue
} from '../types/api.types';

// Helper function remains the same
const mapResourceTypeToMockKey = (resourceType: string): string => {
    switch (resourceType) {
        case 'WEB_ACL': return 'Web ACLs';
        case 'IP_SET': return 'IP Sets';
        case 'REGEX_PATTERN_SET': return 'Regex pattern';
        case 'RULE_GROUP': return 'Rule Groups';
        default: return resourceType;
    }
};

// Update getSnapshots to return WafSnapshot structure
export const getSnapshots = (): Promise<PagedResponse<WafSnapshot>> => {
    // Map BackupItem (which includes calculated fields) back to WafSnapshot structure
    const content: WafSnapshot[] = mockBackupData.map(item => ({
        snapshotId: item.snapshotId,
        scopeId: item.scopeId,
        accountId: item.accountId,
        accountName: item.accountName,
        regionCode: item.regionCode,
        regionName: item.regionName,
        scope: item.scope,
        tagName: item.tagName,
        gitlabUrl: item.gitlabUrl, // Ensure mockBackupData includes this if needed
        backupType: item.backupType,
        state: item.state, // Use state
        requiresManualBackup: item.requiresManualBackup,
        jira: item.jira, // Use jira object
        jiraBaseUrl: item.jiraBaseUrl, // Ensure mockBackupData includes this if needed
    }));
    return new Promise(resolve => setTimeout(() => resolve({
        total: content.length,
        content: content,
        pagination: { pageNumber: 1, pageSize: 10, sort: { orders: [] } }
    }), 500));
};

// Update getJiraIssues to return RollbackProcessInfo structure matching Swagger
export const getJiraIssues = (snapshotId: string): Promise<RollbackProcessInfo> => {
    const backup = mockBackupData.find(b => b.snapshotId === snapshotId);
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (backup) {
                // Construct JiraIssue array based on the single jira object or jiraIssues array
                let issues: JiraIssue[] = [];
                if (backup.jira) {
                    issues.push({
                        issueKey: backup.jira.jiraIssueKey,
                        link: backup.jira.jiraIssueLink,
                        // Attempt to get interruptFlag, default to NONE. Requires interruptFlag in mock data's jira object.
                        interruptFlag: (backup.jira as any).interruptFlag || 'NONE'
                    });
                } else if (backup.jiraIssues && backup.jiraIssues.length > 0) {
                    // Fallback if only jiraIssues array exists in mock data
                    issues = backup.jiraIssues.map(key => ({
                        issueKey: key,
                        link: backup.jiraBaseUrl ? `${backup.jiraBaseUrl}${key}` : `https://jira.example.com/browse/${key}`,
                        interruptFlag: 'NONE' // Default flag
                    }));
                }

                resolve({
                    snapshotId: backup.snapshotId,
                    accountId: backup.accountId,
                    accountName: backup.accountName,
                    regionCode: backup.regionCode,
                    regionName: backup.regionName,
                    scope: backup.scope,
                    tagName: backup.tagName,
                    state: backup.state, // Use state
                    issues: issues // Use the constructed JiraIssue array
                });
            } else {
                reject({ message: "Snapshot not found", metaInfo: { name: "NOT_FOUND" } });
            }
        }, 300);
    });
};


// getSnapshotFiles remains largely the same, ensure resourceType mapping is correct
export const getSnapshotFiles = (snapshotId: string): Promise<WafRuleResourceFile[]> => {
    const resources = mockBackupResourceData[snapshotId] || {};
    const files = Object.keys(resources).map(mockResourceTypeKey => {
        let apiResourceType = '';
        switch (mockResourceTypeKey) { // Use the key from mock data
            case 'Web ACLs': apiResourceType = 'WEB_ACL'; break;
            case 'IP Sets': apiResourceType = 'IP_SET'; break;
            case 'Regex pattern': apiResourceType = 'REGEX_PATTERN_SET'; break;
            case 'Rule Groups': apiResourceType = 'RULE_GROUP'; break;
        }
        return {
            resourceType: apiResourceType,
            files: Object.keys(resources[mockResourceTypeKey] || {}) // Handle case where resourceType might be missing
        };
    });
    // Filter out entries where mapping failed or no files exist
    return new Promise(resolve => setTimeout(() => resolve(files.filter(f => f.resourceType && f.files.length > 0)), 200));
};


// getFileContent remains largely the same
export const getFileContent = (snapshotId: string, resourceType: string, fileName: string): Promise<WafResource | null> => {
    const mockResourceType = mapResourceTypeToMockKey(resourceType);
    const content = mockBackupResourceData[snapshotId]?.[mockResourceType]?.[fileName];
    return new Promise(resolve => setTimeout(() => resolve(content ? JSON.parse(content) : null), 100));
};

// getFileContentPair remains largely the same
export const getFileContentPair = (snapshotId: string, resourceType: string, fileName: string, withSnapshotId?: string): Promise<WafRulePairContent> => {
     const mockResourceType = mapResourceTypeToMockKey(resourceType);

     const baseContent = mockBackupResourceData[snapshotId]?.[mockResourceType]?.[fileName];
     const targetContent = withSnapshotId
        ? mockBackupResourceData[withSnapshotId]?.[mockResourceType]?.[fileName]
        : mockCurrentResourceData[mockResourceType]?.[fileName]; // Assumes mockCurrentResourceData uses the same keys

    return new Promise(resolve => setTimeout(() => resolve({
        base: baseContent ? JSON.parse(baseContent) : null,
        target: targetContent ? JSON.parse(targetContent) : null,
    }), 400));
};

// getDiffStatus remains largely the same
export const getDiffStatus = (snapshotId: string, withSnapshotId?: string): Promise<WafRuleDiffStatus[]> => {
    const diffs: WafRuleDiffStatus[] = [];
    const baseId = snapshotId;
    const targetId = withSnapshotId || 'live'; // 'live' maps to mockCurrentResourceData

    const baseResources = mockBackupResourceData[baseId];
    const targetResources = targetId === 'live'
        ? mockCurrentResourceData
        : mockBackupResourceData[targetId];

    if (!baseResources || !targetResources) {
        // Return empty array if either resource set is missing
        return new Promise(resolve => setTimeout(() => resolve([]), 300));
    }

    // Combine keys from both base and target resources
    const allResourceTypes = new Set([...Object.keys(baseResources), ...Object.keys(targetResources)]);

    allResourceTypes.forEach(resourceTypeKey => { // resourceTypeKey is like 'Web ACLs'
        const baseFiles = baseResources[resourceTypeKey] || {};
        const targetFiles = targetResources[resourceTypeKey] || {};
        const allFileNames = new Set([...Object.keys(baseFiles), ...Object.keys(targetFiles)]);

        let apiResourceType = ''; // Map back to API resource type like 'WEB_ACL'
        switch (resourceTypeKey) {
            case 'Web ACLs': apiResourceType = 'WEB_ACL'; break;
            case 'IP Sets': apiResourceType = 'IP_SET'; break;
            case 'Regex pattern': apiResourceType = 'REGEX_PATTERN_SET'; break;
            case 'Rule Groups': apiResourceType = 'RULE_GROUP'; break;
        }

        if (!apiResourceType) return; // Skip if mapping fails

        allFileNames.forEach(fileName => {
            const fileContentBase = baseFiles[fileName];
            const fileContentTarget = targetFiles[fileName];
            let status: 'ADDED' | 'DELETED' | 'MODIFIED' | 'UNCHANGED';

            if (fileContentBase !== undefined && fileContentTarget !== undefined) {
                // Use JSON.stringify for object comparison if needed, simple string compare here
                status = fileContentBase === fileContentTarget ? 'UNCHANGED' : 'MODIFIED';
            } else if (fileContentBase !== undefined) { // In base only
                status = 'DELETED';
            } else { // In target only
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


// Mock implementations for write operations - Update return type to WafSnapshot
export const manualBackup = (scopeId: string): Promise<WafSnapshot> => new Promise(res => setTimeout(() => {
    const now = new Date();
    const tagName = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}-${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now.getSeconds().toString().padStart(2, '0')}`;
    const newSnapshot: WafSnapshot = {
        snapshotId: `mock-snap-${Date.now()}`,
        scopeId: scopeId,
        accountId: 'mock-account-123',
        accountName: 'Mock Account',
        regionCode: 'us-east-1', // Example region
        regionName: 'US East (N. Virginia)', // Example name
        scope: 'REGIONAL', // Example scope
        tagName: tagName,
        backupType: 'MANUAL',
        state: 'APPLIED', // Initial state after backup
        requiresManualBackup: false, // Typically reset after manual backup
        jira: null,
        gitlabUrl: `https://mock-gitlab.com/repo/-/tags/${tagName}`,
        jiraBaseUrl: 'https://mock-jira.com/browse/'
    };
    // Optionally add to mockBackupData if needed for subsequent calls in tests
    // mockBackupData.push(newSnapshot as any);
    res(newSnapshot);
}, 1000));

export const rollback = (snapshotId: string): Promise<WafSnapshot> => new Promise((resolve, reject) => setTimeout(() => {
    const backupIndex = mockBackupData.findIndex(b => b.snapshotId === snapshotId);
    if (backupIndex > -1 && mockBackupData[backupIndex].state === 'ARCHIVED') {
        mockBackupData[backupIndex].state = 'ROLLBACK_WAIT_FOR_APPLY'; // State change
        // Simulate adding a Jira issue info
        const issueKey = `GCI-${Math.floor(Math.random() * 100)}`;
        mockBackupData[backupIndex].jira = {
            jiraIssueKey: issueKey,
            jiraIssueLink: `https://jira.example.com/browse/${issueKey}`,
            issueStatus: 'OPEN'
        };
         mockBackupData[backupIndex].hasJiraIssues = true; // Update calculated field
         mockBackupData[backupIndex].issueCount = 1; // Update calculated field
         mockBackupData[backupIndex].jiraIssues = [issueKey]; // Update compatibility field
        resolve(mockBackupData[backupIndex] as unknown as WafSnapshot); // Return updated snapshot
    } else {
        reject({ message: "Rollback condition not met", metaInfo: { name: "BAD_REQUEST"} });
    }
}, 1000));

export const forceRollback = (data: RollbackInterruptRequest): Promise<WafSnapshot> => new Promise((resolve, reject) => setTimeout(() => {
     const backupIndex = mockBackupData.findIndex(b => b.snapshotId === data.snapshotId);
    // Allow force rollback even if not ARCHIVED, maybe from WAIT_FOR_APPLY? Adjust logic as needed.
    if (backupIndex > -1) {
        mockBackupData[backupIndex].state = 'ROLLBACK_IN_PROGRESS'; // State change
        // Update Jira info based on request
        const issueKey = data.jiraIssueKey || 'FORCED';
        mockBackupData[backupIndex].jira = {
            jiraIssueKey: issueKey,
            jiraIssueLink: `https://jira.example.com/browse/${issueKey}`,
            issueStatus: 'IN_PROGRESS'
            // Add interruptFlag if needed in mock
        };
        mockBackupData[backupIndex].hasJiraIssues = true;
        mockBackupData[backupIndex].issueCount = 1;
        mockBackupData[backupIndex].jiraIssues = [issueKey];
        resolve(mockBackupData[backupIndex] as unknown as WafSnapshot);
    } else {
         reject({ message: "Snapshot not found", metaInfo: { name: "NOT_FOUND"} });
    }
}, 1000));

export const cancelRollback = (data: RollbackInterruptRequest): Promise<WafSnapshot> => new Promise((resolve, reject) => setTimeout(() => {
     const backupIndex = mockBackupData.findIndex(b => b.snapshotId === data.snapshotId);
    // Can cancel if in WAIT_FOR_APPLY or IN_PROGRESS? Adjust logic.
    if (backupIndex > -1 && (mockBackupData[backupIndex].state === 'ROLLBACK_WAIT_FOR_APPLY' || mockBackupData[backupIndex].state === 'ROLLBACK_IN_PROGRESS')) {
        mockBackupData[backupIndex].state = 'ARCHIVED'; // Revert state
        // Update Jira status
        if(mockBackupData[backupIndex].jira) {
             (mockBackupData[backupIndex].jira as any).issueStatus = 'CANCELLED'; // Use type assertion if needed
             (mockBackupData[backupIndex].jira as any).interruptFlag = 'CANCEL'; // Add interrupt flag
        }
        // No need to update hasJiraIssues/issueCount as the record still exists
        resolve(mockBackupData[backupIndex] as unknown as WafSnapshot);
    } else {
         reject({ message: "Cannot cancel rollback in current state", metaInfo: { name: "BAD_REQUEST"} });
    }
}, 1000));

// getLiveFileContent - Mock remains the same conceptually
export const getLiveFileContent = (scopeId: string, resourceType: string, fileName: string): Promise<WafResource | null> => {
    console.log(`Mock getLiveFileContent for scopeId: ${scopeId}, type: ${resourceType}, file: ${fileName}`);
    const mockResourceType = mapResourceTypeToMockKey(resourceType);
    const content = mockCurrentResourceData[mockResourceType]?.[fileName];
    return new Promise(res => setTimeout(() => res(content ? JSON.parse(content) : null), 100));
};

// getLiveSnapshotFiles (New mock)
export const getLiveSnapshotFiles = (scopeId: string): Promise<WafRuleResourceFile[]> => {
    console.log(`Mock getLiveSnapshotFiles for scopeId: ${scopeId}`);
    const files = Object.keys(mockCurrentResourceData).map(mockResourceTypeKey => {
        let apiResourceType = '';
        switch (mockResourceTypeKey) {
            case 'Web ACLs': apiResourceType = 'WEB_ACL'; break;
            case 'IP Sets': apiResourceType = 'IP_SET'; break;
            case 'Regex pattern': apiResourceType = 'REGEX_PATTERN_SET'; break;
            case 'Rule Groups': apiResourceType = 'RULE_GROUP'; break;
        }
        return {
            resourceType: apiResourceType,
            files: Object.keys(mockCurrentResourceData[mockResourceTypeKey] || {})
        };
    });
     return new Promise(resolve => setTimeout(() => resolve(files.filter(f => f.resourceType && f.files.length > 0)), 200));
};