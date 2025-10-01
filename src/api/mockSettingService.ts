// src/api/mockSettingService.ts
import type { PagedResponse, WafSetting, UpdateSettingRequest, NotificationSummary, AddNotificationRequest } from '../types/api.types';

const mockSettings: WafSetting[] = [
    { scopeId: 'scope-1', accountId: '123456789012', region: 'us-east-1', managed: true, backupType: 'AUTO' },
    { scopeId: 'scope-2', accountId: '123456789012', region: 'ap-northeast-2', managed: false, backupType: 'MANUAL' },
    { scopeId: 'scope-3', accountId: '987654321098', region: 'aws-global', managed: true, backupType: 'MANUAL' },
];

export const getSettings = (): Promise<PagedResponse<WafSetting>> => {
  return new Promise(resolve => setTimeout(() => resolve({
    total: mockSettings.length,
    content: mockSettings,
    pagination: { pageNumber: 1, pageSize: 10, sort: { orders: [] } }
  }), 500));
};

export const updateSettings = (settings: UpdateSettingRequest[]): Promise<void> => {
    console.log("Mock saving settings:", settings);
    return new Promise(resolve => setTimeout(resolve, 500));
};

const mockNotifications: NotificationSummary[] = [
    { notificationId: 'ch1', channelName: '#Global_CPX_WAF', description: 'Global CPX WAF 알림', selectedRulesCount: 1, affectedRulesCount: 1 },
    { notificationId: 'ch2', channelName: '#TMOS_WAF', description: 'TMOS WAF 알림', selectedRulesCount: 0, affectedRulesCount: 0 },
];

export const getNotifications = (): Promise<PagedResponse<NotificationSummary>> => {
    return new Promise(resolve => setTimeout(() => resolve({
        total: mockNotifications.length,
        content: mockNotifications,
        pagination: { pageNumber: 1, pageSize: 10, sort: {orders: []}}
    }), 300));
};

export const getNotificationDetail = (_id: string) => new Promise(res => setTimeout(() => res({
    channelInfo: { channelName: "mock", description: "desc", slackWebhookUrl: "url", messageTemplate: ""},
    resources: []
}), 300));
export const addNotification = (_data: AddNotificationRequest) => new Promise(res => setTimeout(() => res({}), 300));
export const updateNotification = (_id: string, _data: AddNotificationRequest) => new Promise(res => setTimeout(() => res({}), 300));
export const deleteNotification = (_id: string) => new Promise(res => setTimeout(() => res({}), 300));
export const getActiveWafRules = () => new Promise(res => setTimeout(() => res([]), 300));
export const getTemplateVariables = () => new Promise(res => setTimeout(() => res({variables: {}}), 300));