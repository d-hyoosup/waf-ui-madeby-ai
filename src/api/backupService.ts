// src/api/backupService.ts
import apiClient from './apiClient';
import type {
    PagedResponse,
    WafSnapshot, // Corresponds to WafSnapshotVO
    RollbackProcessInfo, // Corresponds to RollbackProcessInfoVO
    RollbackInterruptRequest, // Corresponds to RequestRollbackInterruptDTO
    WafRuleResourceFile, // Corresponds to WafRuleResourceVO
    WafRuleDiffStatus, // Corresponds to WafRuleDiffStatusVO
    WafRulePairContent, // Corresponds to WafRulePairContentVOObject
    WafResource // Type for single file content response data
} from '../types/api.types';

// GET /api/v1/waf/snapshots
export const getSnapshots = (params: { page: number; pageSize: number }): Promise<PagedResponse<WafSnapshot>> => {
    // Response data matches PagedResponse<WafSnapshot> after apiClient extracts 'data'
    return apiClient.get('/waf/snapshots', { params });
};

// POST /api/v1/waf/snapshots/{scopeId}/backup
export const manualBackup = (scopeId: string): Promise<WafSnapshot> => {
    // Response data matches WafSnapshot after apiClient extracts 'data'
    return apiClient.post(`/waf/snapshots/${scopeId}/backup`);
};

// POST /api/v1/waf/snapshots/{snapshotId}/rollback
export const rollback = (snapshotId: string): Promise<WafSnapshot> => {
    // Response data matches WafSnapshot after apiClient extracts 'data'
    return apiClient.post(`/waf/snapshots/${snapshotId}/rollback`);
};

// POST /api/v1/waf/snapshots/rollback/force
export const forceRollback = (data: RollbackInterruptRequest): Promise<WafSnapshot> => {
    // Response data matches WafSnapshot after apiClient extracts 'data'
    return apiClient.post('/waf/snapshots/rollback/force', data);
};

// POST /api/v1/waf/snapshots/rollback/cancel
export const cancelRollback = (data: RollbackInterruptRequest): Promise<WafSnapshot> => {
    // Response data matches WafSnapshot after apiClient extracts 'data'
    return apiClient.post('/waf/snapshots/rollback/cancel', data);
};

// GET /api/v1/waf/snapshots/{snapshotId}/jira
export const getJiraIssues = (snapshotId: string): Promise<RollbackProcessInfo> => {
    // Response data matches RollbackProcessInfo after apiClient extracts 'data'
    return apiClient.get(`/waf/snapshots/${snapshotId}/jira`);
};

// GET /api/v1/waf/snapshots/{snapshotId}/files
export const getSnapshotFiles = (snapshotId: string): Promise<WafRuleResourceFile[]> => {
    // Response data matches WafRuleResourceFile[] after apiClient extracts 'data'
    return apiClient.get(`/waf/snapshots/${snapshotId}/files`);
};

// GET /api/v1/waf/snapshots/{snapshotId}/files/diff
export const getDiffStatus = (snapshotId: string, withSnapshotId?: string): Promise<WafRuleDiffStatus[]> => {
    // Response data matches WafRuleDiffStatus[] after apiClient extracts 'data'
    const params = withSnapshotId ? { withSnapshotId } : {};
    return apiClient.get(`/waf/snapshots/${snapshotId}/files/diff`, { params });
};

// GET /api/v1/waf/snapshots/{snapshotId}/{resourceType}/{fileName}/content
export const getFileContent = (snapshotId: string, resourceType: string, fileName: string): Promise<WafResource | null> => {
    // Response data matches WafResource | null after apiClient extracts 'data'
    return apiClient.get(`/waf/snapshots/${snapshotId}/${resourceType}/${fileName}/content`);
};

// GET /api/v1/waf/snapshots/{snapshotId}/{resourceType}/{fileName}/bundle
export const getFileContentPair = (snapshotId: string, resourceType: string, fileName: string, withSnapshotId?: string): Promise<WafRulePairContent> => {
    // Response data matches WafRulePairContent after apiClient extracts 'data'
    const params = withSnapshotId ? { withSnapshotId } : {};
    return apiClient.get(`/waf/snapshots/${snapshotId}/${resourceType}/${fileName}/bundle`, { params });
};

// GET /api/v1/waf/live/{scopeId}/{resourceType}/{fileName}/content
export const getLiveFileContent = (scopeId: string, resourceType: string, fileName: string): Promise<WafResource | null> => {
    // Response data matches WafResource | null after apiClient extracts 'data'
    return apiClient.get(`/waf/live/${scopeId}/${resourceType}/${fileName}/content`);
};

// GET /api/v1/waf/live/{scopeId}/files (New endpoint from Swagger)
export const getLiveSnapshotFiles = (scopeId: string): Promise<WafRuleResourceFile[]> => {
    // Response data matches WafRuleResourceFile[] after apiClient extracts 'data'
    return apiClient.get(`/waf/live/${scopeId}/files`);
};