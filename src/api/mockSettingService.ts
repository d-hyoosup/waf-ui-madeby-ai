// src/api/mockSettingService.ts
import type { PagedResponse, WafSetting, UpdateSettingRequest, NotificationSummary, AddNotificationRequest, NotificationResource } from '../types/api.types';

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

// --- 💡 수정된 부분 ---
// WAF Rule 모니터링을 위한 목업 데이터를 추가합니다.
const mockActiveWafRules: NotificationResource[] = [
    {
        "isSelected": false, "nodeId": "123456789012", "awsAccountId": "123456789012",
        "regionCode": "", "scope": "", "resourceType": "", "fileName": "",
        "nodePath": "/123456789012"
    },
    {
        "isSelected": false, "nodeId": "123456789012/Global", "awsAccountId": "123456789012",
        "regionCode": "aws-global", "scope": "CLOUDFRONT", "resourceType": "", "fileName": "",
        "nodePath": "/123456789012/Global"
    },
    {
        "isSelected": false, "nodeId": "123456789012/Global/WebACLs", "awsAccountId": "123456789012",
        "regionCode": "aws-global", "scope": "CLOUDFRONT", "resourceType": "WEB_ACL", "fileName": "",
        "nodePath": "/123456789012/Global/WebACLs"
    },
    {
        "isSelected": true, "nodeId": "123456789012/Global/WebACLs/cpx-global_vehicle_cci-hmg_net", "awsAccountId": "123456789012",
        "regionCode": "aws-global", "scope": "CLOUDFRONT", "resourceType": "WEB_ACL", "fileName": "cpx-global_vehicle_cci-hmg_net",
        "nodePath": "/123456789012/Global/WebACLs/cpx-global_vehicle_cci-hmg_net"
    },
    {
        "isSelected": false, "nodeId": "123456789012/ap-northeast-1", "awsAccountId": "123456789012",
        "regionCode": "ap-northeast-1", "scope": "REGIONAL", "resourceType": "", "fileName": "",
        "nodePath": "/123456789012/ap-northeast-1"
    },
    {
        "isSelected": false, "nodeId": "123456789012/ap-northeast-1/WebACLs", "awsAccountId": "123456789012",
        "regionCode": "ap-northeast-1", "scope": "REGIONAL", "resourceType": "WEB_ACL", "fileName": "",
        "nodePath": "/123456789012/ap-northeast-1/WebACLs"
    },
    {
        "isSelected": false, "nodeId": "123456789012/ap-northeast-1/WebACLs/cpx_ext_cci-hmg_net", "awsAccountId": "123456789012",
        "regionCode": "ap-northeast-1", "scope": "REGIONAL", "resourceType": "WEB_ACL", "fileName": "cpx_ext_cci-hmg_net",
        "nodePath": "/123456789012/ap-northeast-1/WebACLs/cpx_ext_cci-hmg_net"
    },
];

export const getActiveWafRules = (): Promise<NotificationResource[]> => {
    // 빈 배열 대신 목업 데이터를 반환하도록 수정합니다.
    return new Promise(res => setTimeout(() => res(mockActiveWafRules), 300));
};
// --- 💡 수정 끝 ---

export const getTemplateVariables = () => new Promise(res => setTimeout(() => res({variables: {
    "eventTime": "이벤트 시간", "eventName": "이벤트 명", "accountId": "계정 ID",
    "awsRegion": "AWS 리전", "userName": "사용자명", "ruleName": "규칙 이름",
    "userAgent": "사용자 Agent", "sourceIPAddress": "발신지 IP 주소", "consoleLink": "콘솔 링크"
}}), 300));