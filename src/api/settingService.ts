// src/api/settingService.ts
import apiClient from './apiClient';
import type {
  PagedResponse, WafSetting, UpdateSettingRequest,
  NotificationSummary, NotificationDetail, AddNotificationRequest,
  NotificationResource, TemplateVariables
} from '../types/api.types';

// Management Settings
export const getSettings = (params: { page: number; pageSize: number }): Promise<PagedResponse<WafSetting>> => {
  return apiClient.get('/waf/settings', { params });
};

export const updateSettings = (settings: UpdateSettingRequest[]): Promise<void> => {
  return apiClient.patch('/waf/settings', settings);
};

// Alert Settings
export const getNotifications = (params: { page: number; pageSize: number }): Promise<PagedResponse<NotificationSummary>> => {
  return apiClient.get('/waf/notifications', { params });
};

export const getNotificationDetail = (notificationId: string): Promise<NotificationDetail> => {
    return apiClient.get(`/waf/notifications/${notificationId}`);
};

export const addNotification = (data: AddNotificationRequest): Promise<void> => {
    return apiClient.post('/waf/notifications', data);
};

export const updateNotification = (notificationId: string, data: AddNotificationRequest): Promise<void> => {
    return apiClient.patch(`/waf/notifications/${notificationId}`, data);
};

export const deleteNotification = (notificationId: string): Promise<void> => {
    return apiClient.delete(`/waf/notifications/${notificationId}`);
};

export const getActiveWafRules = (): Promise<NotificationResource[]> => {
    return apiClient.get('/waf/notifications/active-rules');
};

export const getTemplateVariables = (): Promise<TemplateVariables> => {
    return apiClient.get('/waf/notifications/variables');
};