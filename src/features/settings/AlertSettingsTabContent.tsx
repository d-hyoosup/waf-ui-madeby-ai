// src/features/settings/AlertSettingsTabContent.tsx
import React, {useState, useEffect, useMemo} from 'react';
import '../../components/styles/FormStyles.css';
import { TrashIcon } from '../../components/common/Icons.tsx';
import '../../components/styles/TableStyles.css';
import TreeView from '../../components/common/TreeView.tsx';
import { convertPathsToTreeData } from '../../utils/treeUtils.ts';
import { SettingService } from '../../api';
import type {
    NotificationSummary, NotificationDetail, NotificationResource
} from '../../types/api.types.ts';

type OptionKey = 'eventTime' | 'eventName' | 'eventId' | 'awsRegion' | 'userName' | 'ruleName' | 'userAgent' | 'srcIp' | 'link';

const BLANK_CHANNEL: Omit<NotificationDetail, 'resources'> = {
  channelInfo: {
    channelName: '',
    description: '',
    slackWebhookUrl: '',
    messageTemplate: 'eventName;eventTime;accountId;awsRegion;sourceIPAddress;userAgent;userName;RuleName;scope;consoleLink',
  }
};

const AlertSettingsTabContent: React.FC = () => {
  const [channels, setChannels] = useState<NotificationSummary[]>([]);
  const [activeRules, setActiveRules] = useState<NotificationResource[]>([]);
  const [templateVariables, setTemplateVariables] = useState<Record<string, string>>({});

  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
  const [mode, setMode] = useState<'none' | 'edit' | 'add'>('none');
  const [formData, setFormData] = useState<NotificationDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // activeRules가 변경될 때만 tree를 다시 계산
  const tree = useMemo(() => convertPathsToTreeData(activeRules.map(r => r.nodePath)), [activeRules]);

  useEffect(() => {
    const fetchData = async () => {
        setLoading(true);
        try {
            const [channelsRes, rulesRes, varsRes] = await Promise.all([
                SettingService.getNotifications({ page: 1, pageSize: 100 }),
                SettingService.getActiveWafRules(),
                SettingService.getTemplateVariables(),
            ]);
            setChannels(channelsRes.content);
            // API 응답에는 isSelected가 없으므로 추가해줍니다.
            setActiveRules(rulesRes.map(rule => ({...rule, isSelected: false})));
            setTemplateVariables(varsRes.variables);
        } catch (error) {
            console.error("Failed to load alert settings data", error);
        } finally {
            setLoading(false);
        }
    };
    fetchData();
  }, []);

  const fetchChannels = async () => {
      try {
          const res = await SettingService.getNotifications({ page: 1, pageSize: 100 });
          setChannels(res.content);
      } catch (error) {
          console.error("Failed to fetch notification channels", error);
      }
  }

  // --- 💡 수정된 부분 ---
  const handleSelectChannel = async (channelId: string) => {
    try {
      const detailFromApi = await SettingService.getNotificationDetail(channelId);
      setSelectedChannelId(channelId);

      // 전체 규칙 목록(activeRules)을 기반으로 API에서 받은 선택 정보를 병합합니다.
      const selectedNodeIds = new Set(detailFromApi.resources.map(r => r.nodeId));
      const mergedResources = activeRules.map(rule => ({
          ...rule,
          isSelected: selectedNodeIds.has(rule.nodeId)
      }));

      setFormData({
          channelInfo: detailFromApi.channelInfo,
          resources: mergedResources
      });
      setMode('edit');
    } catch (error) {
      console.error(`Failed to fetch channel detail for ${channelId}`, error);
    }
  };
  // --- 💡 수정 끝 ---

  const handleAddClick = () => {
    setSelectedChannelId(null);
    const initialFormData: NotificationDetail = {
        channelInfo: { ...BLANK_CHANNEL.channelInfo },
        resources: activeRules.map(rule => ({ ...rule, isSelected: false }))
    }
    setFormData(initialFormData);
    setMode('add');
  };

  const handleCancel = () => {
    setMode('none');
    setSelectedChannelId(null);
    setFormData(null);
  };

  const handleSave = async () => {
    if (!formData) return;

    const requestData = {
        channelInfo: formData.channelInfo,
        alertNodeIds: formData.resources.filter(r => r.isSelected).map(r => r.nodeId),
    };

    try {
        if (mode === 'edit' && selectedChannelId) {
            await SettingService.updateNotification(selectedChannelId, requestData);
        } else if (mode === 'add') {
            await SettingService.addNotification(requestData);
        }
        alert('저장되었습니다.');
        setMode('none');
        setSelectedChannelId(null);
        setFormData(null);
        fetchChannels();
    } catch (error) {
        console.error('Failed to save channel', error);
        alert('저장에 실패했습니다.');
    }
  };

  const handleDeleteChannel = async (e: React.MouseEvent, channelId: string) => {
    e.stopPropagation();
    if (window.confirm('정말로 이 채널을 삭제하시겠습니까?')) {
        try {
            await SettingService.deleteNotification(channelId);
            alert('삭제되었습니다.');
            if (selectedChannelId === channelId) {
                handleCancel();
            }
            fetchChannels();
        } catch(error) {
            console.error('Failed to delete channel', error);
            alert('삭제에 실패했습니다.');
        }
    }
  };

  const handleFormInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!formData) return;
    setFormData({
        ...formData,
        channelInfo: {
            ...formData.channelInfo,
            [e.target.name]: e.target.value
        }
    });
  };

  const handleCheckboxChange = (key: string) => {
    if (!formData) return;

    const currentTemplate = formData.channelInfo.messageTemplate || '';
    const variables = currentTemplate.split(';').filter(v => v);
    const newVariables = variables.includes(key)
      ? variables.filter(v => v !== key)
      : [...variables, key];

    setFormData({
      ...formData,
      channelInfo: {
        ...formData.channelInfo,
        messageTemplate: newVariables.join(';')
      }
    });
  };

  const handleTreeSelectionChange = (selection: string[]) => {
    if (!formData || !formData.resources) return;
    const updatedResources = formData.resources.map(rule => ({
        ...rule,
        isSelected: selection.includes(rule.nodePath)
    }));
    setFormData({ ...formData, resources: updatedResources });
  };

  const getMonitoredRulesFromFormData = () => {
      if (!formData || !formData.resources) return [];
      return formData.resources.filter(r => r.isSelected).map(r => r.nodePath);
  }

  if (loading) return <p>Loading...</p>

  return (
    <div className="alert-settings-container">
      <div className="alert-channel-list">
        <h3>알림 채널 목록</h3>
        <ul>
            {channels.map(channel => (
                <li key={channel.notificationId} className={channel.notificationId === selectedChannelId ? 'active' : ''} onClick={() => handleSelectChannel(channel.notificationId)}>
                    <div className="channel-name" title={channel.channelName}>{channel.channelName}</div>
                    <div className="channel-actions">
                        <span>{channel.selectedRulesCount}개 규칙</span>
                        <button className="btn-table delete" title="삭제" onClick={(e) => handleDeleteChannel(e, channel.notificationId)}>
                            <TrashIcon />
                        </button>
                    </div>
                </li>
            ))}
        </ul>
        <button className="btn btn-primary add-channel-btn" onClick={handleAddClick}>
          + 채널 추가
        </button>
      </div>

      {(mode === 'add' || mode === 'edit') && formData && (
        <div className="channel-details-area">
          <div className="info-panel">
            <h3>{mode === 'add' ? '새 채널 추가' : '채널 상세 수정'}</h3>
            <div className="info-field">
              <label>채널명</label>
              <input type="text" name="channelName" value={formData.channelInfo.channelName} onChange={handleFormInputChange} />
            </div>
            <div className="info-field">
              <label>설명</label>
              <input type="text" name="description" value={formData.channelInfo.description} onChange={handleFormInputChange} />
            </div>
            <div className="info-field">
              <label>Slack Webhook URL</label>
              <input type="text" name="slackWebhookUrl" value={formData.channelInfo.slackWebhookUrl} onChange={handleFormInputChange} />
            </div>
            <div className="alert-options">
              <h4>알림 옵션 (Message Template)</h4>
              <div className="option-grid">
                {Object.entries(templateVariables).map(([key, label]) => (
                    <label key={key}>
                      <input type="checkbox" checked={formData.channelInfo.messageTemplate.includes(key)} onChange={() => handleCheckboxChange(key)} />
                      {label}
                    </label>
                  )
                )}
              </div>
            </div>
          </div>

          <div className="monitoring-panel">
            <h4>WAF Rule 모니터링</h4>
            <div className="rule-monitoring-tree">
              <TreeView
                data={tree}
                selectedPaths={getMonitoredRulesFromFormData()}
                onSelectionChange={handleTreeSelectionChange}
                isReadOnly={false}
              />
            </div>
            <div className="form-actions">
              <button className="btn btn-secondary" onClick={handleCancel}>취소</button>
              <button className="btn btn-primary" onClick={handleSave}>저장</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertSettingsTabContent;