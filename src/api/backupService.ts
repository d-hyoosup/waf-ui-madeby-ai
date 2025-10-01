// src/api/backupService.ts
import apiClient from './apiClient';
import type {
    PagedResponse,
    WafSnapshot,
    RollbackProcessInfo,
    RollbackInterruptRequest,
    WafRuleResourceFile,
    WafRuleDiffStatus,
    WafRulePairContent
} from '../types/api.types';

export const getSnapshots = (params: { page: number; pageSize: number }): Promise<PagedResponse<WafSnapshot>> => {
    return apiClient.get('/waf/snapshots', { params });
};

export const manualBackup = (scopeId: string): Promise<WafSnapshot> => {
    return apiClient.post(`/waf/snapshots/${scopeId}/backup`);
};

export const rollback = (snapshotId: string): Promise<WafSnapshot> => {
    return apiClient.post(`/waf/snapshots/${snapshotId}/rollback`);
};

export const forceRollback = (data: RollbackInterruptRequest): Promise<WafSnapshot> => {
    return apiClient.post('/waf/snapshots/rollback/force', data);
};

export const cancelRollback = (data: RollbackInterruptRequest): Promise<WafSnapshot> => {
    return apiClient.post('/waf/snapshots/rollback/cancel', data);
};

export const getJiraIssues = (snapshotId: string): Promise<RollbackProcessInfo> => {
    return apiClient.get(`/waf/snapshots/${snapshotId}/jira`);
};

export const getSnapshotFiles = (snapshotId: string): Promise<WafRuleResourceFile[]> => {
    return apiClient.get(`/waf/snapshots/${snapshotId}/files`);
};

export const getDiffStatus = (snapshotId: string, withSnapshotId?: string): Promise<WafRuleDiffStatus[]> => {
    const params = withSnapshotId ? { withSnapshotId } : {};
    return apiClient.get(`/waf/snapshots/${snapshotId}/files/diff`, { params });
};

export const getFileContent = (snapshotId: string, resourceType: string, fileName: string): Promise<any> => {
    return apiClient.get(`/waf/snapshots/${snapshotId}/${resourceType}/${fileName}/content`);
};

export const getFileContentPair = (snapshotId: string, resourceType: string, fileName: string, withSnapshotId?: string): Promise<WafRulePairContent> => {
    const params = withSnapshotId ? { withSnapshotId } : {};
    return apiClient.get(`/waf/snapshots/${snapshotId}/${resourceType}/${fileName}/bundle`, { params });
};

export const getLiveFileContent = (scopeId: string, resourceType: string, fileName: string): Promise<any> => {
    return apiClient.get(`/waf/live/${scopeId}/${resourceType}/${fileName}/content`);
};