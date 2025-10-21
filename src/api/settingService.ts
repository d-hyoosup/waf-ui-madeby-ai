// src/api/settingService.ts
import apiClient from './apiClient';
import type {
  PagedResponse, WafSetting, UpdateSettingRequest, // WafSettingVO, UpdateSettingDto
  NotificationSummary, NotificationDetail, AddNotificationRequest, // NotificationSummaryVO, NotificationVO, RequestNotificationDTO
  NotificationResource, TemplateVariables // NotificationResourceVO, GET /variables data
} from '../types/api.types';

// Management Settings
// GET /api/v1/waf/settings
export const getSettings = (params: { page: number; pageSize: number }): Promise<PagedResponse<WafSetting>> => {
  // Response data matches PagedResponse<WafSetting> after apiClient extracts 'data'
  return apiClient.get('/waf/settings', { params });
};

// PATCH /api/v1/waf/settings
export const updateSettings = (settings: UpdateSettingRequest[]): Promise<void | any> => { // Can return data on partial success (206)
  // apiClient extracts 'data'. Returns void for 200 (data: null), or array for 206
  return apiClient.patch('/waf/settings', settings);
};

// Alert Settings
// GET /api/v1/waf/notifications
export const getNotifications = (params: { page: number; pageSize: number }): Promise<PagedResponse<NotificationSummary>> => {
  // Response data matches PagedResponse<NotificationSummary> after apiClient extracts 'data'
  return apiClient.get('/waf/notifications', { params });
};

// GET /api/v1/waf/notifications/{notificationId}
export const getNotificationDetail = (notificationId: string): Promise<NotificationDetail> => {
    // Response data matches NotificationDetail after apiClient extracts 'data'
    return apiClient.get(`/waf/notifications/${notificationId}`);
};

// POST /api/v1/waf/notifications
export const addNotification = (data: AddNotificationRequest): Promise<void> => {
    // Response data is null after apiClient extracts 'data', compatible with void
    return apiClient.post('/waf/notifications', data);
};

// PATCH /api/v1/waf/notifications/{notificationId}
export const updateNotification = (notificationId: string, data: AddNotificationRequest): Promise<void> => {
    // Response data is null after apiClient extracts 'data', compatible with void
    return apiClient.patch(`/waf/notifications/${notificationId}`, data);
};

// DELETE /api/v1/waf/notifications/{notificationId}
export const deleteNotification = (notificationId: string): Promise<void> => {
    // Response data is null after apiClient extracts 'data', compatible with void
    return apiClient.delete(`/waf/notifications/${notificationId}`);
};

// GET /api/v1/waf/notifications/active-rules
export const getActiveWafRules = (): Promise<NotificationResource[]> => {
    // Response data matches NotificationResource[] after apiClient extracts 'data'
    return apiClient.get('/waf/notifications/active-rules');
};

// GET /api/v1/waf/notifications/variables
export const getTemplateVariables = (): Promise<TemplateVariables> => {
    // Response data matches TemplateVariables after apiClient extracts 'data'
    return apiClient.get('/waf/notifications/variables');
};