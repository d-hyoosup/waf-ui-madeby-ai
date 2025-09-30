import React, { useState } from 'react';
import '../../components/styles/FormStyles.css';
import { TrashIcon } from '../../components/common/Icons.tsx';
import '../../components/styles/TableStyles.css';
import TreeView from '../../components/common/TreeView.tsx';
import { convertPathsToTreeData } from '../../utils/treeUtils.ts'; // 수정: 임포트 경로 변경

type OptionKey = 'eventTime' | 'eventName' | 'eventId' | 'awsRegion' | 'userName' | 'ruleName' | 'userAgent' | 'srcIp' | 'link';

interface ChannelOptions {
  eventTime: boolean; eventName: boolean; eventId: boolean; awsRegion: boolean;
  userName: boolean; ruleName: boolean; userAgent: boolean; srcIp: boolean; link: boolean;
}

interface Channel {
  id: string; name: string; description: string; slackUrl: string;
  ruleCount: number; options: ChannelOptions; monitoredRules: string[];
}

const BLANK_CHANNEL: Omit<Channel, 'id' | 'ruleCount'> = {
  name: '', description: '', slackUrl: '',
  options: { eventTime: true, eventName: true, eventId: true, awsRegion: true, userName: false, ruleName: true, userAgent: false, srcIp: true, link: true },
  monitoredRules: [],
};

const treeDataSource = [
    "/123456789012/Global/WebACLs/cpx-global_vehicle_cci-hmg_net",
    "/123456789012/Global/IP Sets", "/123456789012/Global/Regex pattern sets",
    "/123456789012/Global/Rule groups", "/123456789012/ap-northeast-1/WebACLs/cpx_ext_cci-hmg_net",
    "/123456789012/ap-northeast-1/WebACLs/cpx_ap-northeast_hmgmobility.com"
];

const AlertSettingsTabContent: React.FC = () => {
  const tree = convertPathsToTreeData(treeDataSource);

  const [channels, setChannels] = useState<Channel[]>([
    { id: 'ch1', name: '#Global_CPX_WAF', description: 'Global CPX WAF의 WebACL 알림', slackUrl: 'https://slack.com/webhook/global', ruleCount: 1, options: { eventTime: true, eventName: true, eventId: true, awsRegion: true, userName: false, ruleName: true, userAgent: true, srcIp: true, link: true }, monitoredRules: ["/123456789012/Global/WebACLs/cpx-global_vehicle_cci-hmg_net"] },
    { id: 'ch2', name: '#TMOS_WAF', description: 'TMOS WAF 알림', slackUrl: 'https://slack.com/webhook/tmos', ruleCount: 0, options: { eventTime: true, eventName: false, eventId: true, awsRegion: false, userName: true, ruleName: true, userAgent: false, srcIp: true, link: true }, monitoredRules: [] },
    { id: 'ch3', name: '#hello_WAF', description: '테스트용 WAF 알림', slackUrl: 'https://slack.com/webhook/hello', ruleCount: 0, options: { eventTime: true, eventName: true, eventId: false, awsRegion: true, userName: false, ruleName: true, userAgent: false, srcIp: false, link: false }, monitoredRules: [] },
  ]);

  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
  const [mode, setMode] = useState<'none' | 'edit' | 'add'>('none');
  const [formData, setFormData] = useState<Omit<Channel, 'id' | 'ruleCount'>>(BLANK_CHANNEL);

  const handleSelectChannel = (channelId: string) => {
    const channel = channels.find(c => c.id === channelId);
    if (channel) {
      setSelectedChannelId(channelId);
      setFormData(channel);
      setMode('edit');
    }
  };

  const handleAddClick = () => {
    setSelectedChannelId(null);
    setFormData(BLANK_CHANNEL);
    setMode('add');
  };

  const handleCancel = () => {
    setMode('none');
    setSelectedChannelId(null);
  };

  const handleSave = () => {
    const ruleCount = formData.monitoredRules.length;
    let newSelectedId = selectedChannelId;

    if (mode === 'edit' && selectedChannelId) {
      setChannels(channels.map(c => c.id === selectedChannelId ? { ...c, ...formData, ruleCount } : c));
    } else if (mode === 'add') {
      const newChannel: Channel = { id: `ch${Date.now()}`, ...formData, ruleCount };
      setChannels([...channels, newChannel]);
      newSelectedId = newChannel.id;
    }

    if (newSelectedId) {
      handleSelectChannel(newSelectedId);
    } else {
      setMode('none');
    }
  };

  const handleDeleteChannel = (e: React.MouseEvent, channelId: string) => {
    e.stopPropagation();
    if (window.confirm('정말로 이 채널을 삭제하시겠습니까?')) {
      setChannels(prev => prev.filter(c => c.id !== channelId));
      if (selectedChannelId === channelId) {
        setSelectedChannelId(null);
        setMode('none');
      }
    }
  };

  const handleFormInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckboxChange = (key: OptionKey) => {
    setFormData({ ...formData, options: { ...formData.options, [key]: !formData.options[key] } });
  };

  const handleTreeSelectionChange = (selection: string[]) => {
    setFormData(currentFormData => ({ ...currentFormData, monitoredRules: selection }));
  };

  const optionLabels: Record<OptionKey, string> = {
    eventTime: "이벤트 시간", eventName: "이벤트 명", eventId: "계정 ID",
    awsRegion: "AWS 리전", userName: "사용자명", ruleName: "규칙 이름",
    userAgent: "사용자 Agent", srcIp: "발신지 IP 주소", link: "link"
  };

  return (
    <div className="alert-settings-container">
      <div className="alert-channel-list">
        <h3>알림 채널 목록</h3>
        <ul>
            {channels.map(channel => (
                <li key={channel.id} className={channel.id === selectedChannelId ? 'active' : ''} onClick={() => handleSelectChannel(channel.id)}>
                    <div className="channel-name" title={channel.name}>{channel.name}</div>
                    <div className="channel-actions">
                        <span>{channel.ruleCount}개 규칙</span>
                        <button className="btn-table delete" title="삭제" onClick={(e) => handleDeleteChannel(e, channel.id)}>
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

      {(mode === 'add' || mode === 'edit') && (
        <div className="channel-details-area">
          <div className="info-panel">
            <h3>{mode === 'add' ? '새 채널 추가' : '채널 상세 수정'}</h3>
            <div className="info-field">
              <label>채널명</label>
              <input type="text" name="name" value={formData.name} onChange={handleFormInputChange} />
            </div>
            <div className="info-field">
              <label>설명</label>
              <input type="text" name="description" value={formData.description} onChange={handleFormInputChange} />
            </div>
            <div className="info-field">
              <label>Slack Webhook URL</label>
              <input type="text" name="slackUrl" value={formData.slackUrl} onChange={handleFormInputChange} />
            </div>
            <div className="alert-options">
              <h4>알림 옵션</h4>
              <div className="option-grid">
                {Object.keys(optionLabels).map(keyStr => {
                  const key = keyStr as OptionKey;
                  return (
                    <label key={key}>
                      <input type="checkbox" checked={formData.options[key]} onChange={() => handleCheckboxChange(key)} />
                      {optionLabels[key]}
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="monitoring-panel">
            <h4>WAF Rule 모니터링</h4>
            <div className="rule-monitoring-tree">
              <TreeView
                data={tree}
                selectedPaths={formData.monitoredRules}
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