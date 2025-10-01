// src/features/backup/ResourceViewModal.tsx
import React, { useState, useMemo, useEffect } from 'react';
import '../../components/styles/ModalStyles.css';
import './ResourceViewModal.css';
import { BackupService } from '../../api';
import type { BackupStatus, WafRuleDiffStatus } from '../../types/api.types';

interface ResourceViewItem {
  id: string;
  status: BackupStatus;
  scopeId?: string;
}

interface ResourceViewModalProps {
  type: 'view' | 'compare' | 'restore' | 'manual_backup';
  items: ResourceViewItem[];
  onClose: () => void;
}

const mapTabToApiResourceType = (tabName: string): string => {
    switch (tabName) {
        case "Web ACLs": return "WEB_ACL";
        case "IP Sets": return "IP_SET";
        case "Regex pattern": return "REGEX_PATTERN_SET";
        case "Rule Groups": return "RULE_GROUP";
        default: return "";
    }
};

type FileStatus = 'ADDED' | 'DELETED' | 'MODIFIED' | 'UNCHANGED' | 'single';

const ResourceViewModal: React.FC<ResourceViewModalProps> = ({ type, items, onClose }) => {
  const resourceTypes = ["Web ACLs", "IP Sets", "Regex pattern", "Rule Groups"];
  const [activeTab, setActiveTab] = useState(resourceTypes[0]);
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [showChangedOnly, setShowChangedOnly] = useState(false);
  const [fileList, setFileList] = useState<{name: string, status: FileStatus}[]>([]);
  const [contentA, setContentA] = useState<string | null>(null);
  const [contentB, setContentB] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isCompare = type === 'compare' || type === 'restore' || type === 'manual_backup';

  const { itemA, itemB } = useMemo(() => {
    if (!isCompare) return { itemA: items[0], itemB: null };
    const liveItem = items.find(item => item.id === 'live' || item.id === 'current');
    const backupItem = items.find(item => item.id !== 'live' && item.id !== 'current');
    if (liveItem && backupItem) {
        return { itemA: backupItem, itemB: liveItem };
    }
    return { itemA: items[0], itemB: items[1] };
  }, [items, isCompare]);

  // ✅ [수정] 비교 모드일 때 getDiffStatus를 호출하도록 로직 변경
  useEffect(() => {
    const fetchFiles = async () => {
        if (!itemA) return;
        setLoading(true);
        try {
            const apiResourceType = mapTabToApiResourceType(activeTab);

            if (isCompare && itemB) {
                const diffStatusList = await BackupService.getDiffStatus(itemA.id, itemB.id === 'live' ? undefined : itemB.id);
                const currentTabDiffs = diffStatusList.filter(d => d.resourceType === apiResourceType);
                const files = currentTabDiffs.map(diff => ({
                    name: diff.fileName,
                    status: diff.status
                }));
                setFileList(files);
            } else {
                const filesData = await BackupService.getSnapshotFiles(itemA.id);
                const currentTabFiles = filesData.find(f => f.resourceType === apiResourceType);
                const files = currentTabFiles ? currentTabFiles.files.map(name => ({ name, status: 'single' as const })) : [];
                setFileList(files);
            }
        } catch (error) {
            console.error("Failed to fetch file list", error);
            setFileList([]);
        } finally {
            setLoading(false);
        }
    };
    fetchFiles();
    setActiveFile(null);
  }, [activeTab, itemA, itemB, isCompare]);

 useEffect(() => {
    const fetchContent = async () => {
        if (!activeFile || !itemA) return;
        setLoading(true);
        setContentA(null);
        setContentB(null);
        try {
            const resourceType = mapTabToApiResourceType(activeTab);
            if (isCompare && itemB) {
                const { base, target } = await BackupService.getFileContentPair(itemA.id, resourceType, activeFile, itemB.id === 'live' ? undefined : itemB.id);
                setContentA(base ? JSON.stringify(base, null, 2) : null);
                setContentB(target ? JSON.stringify(target, null, 2) : null);
            } else {
                const content = await BackupService.getFileContent(itemA.id, resourceType, activeFile);
                setContentA(content ? JSON.stringify(content, null, 2) : null);
            }
        } catch (error) {
            console.error("Failed to fetch file content", error);
            setContentA(null);
            setContentB(null);
        } finally {
            setLoading(false);
        }
    };
    if (activeFile) {
        fetchContent();
    }
  }, [activeFile, itemA, itemB, activeTab, isCompare]);


  const modalTitle = useMemo(() => {
    if (type === 'restore') return 'WAF Rule 복원';
    if (type === 'manual_backup') return 'WAF Rule 비교 (백업 생성)';
    if (type === 'compare') return 'WAF Rule 비교';
    return 'WAF Rule 백업 조회';
  }, [type]);

  const renderContentPane = (content: string | null, title: string) => {
    return (
        <div className="content-pane">
            <h4 className="content-pane-title">{title}</h4>
            <div className={`json-viewer-container ${!content ? 'empty' : ''}`}>
                {loading ? (
                    <div className="empty-state"><p>Loading content...</p></div>
                ) : content ? (
                    <pre className="json-viewer">{content}</pre>
                ) : (
                    <div className="empty-state">
                        <div className="empty-state-content">
                            <div className="empty-icon">📄</div>
                            <h4>파일 없음</h4>
                            <p>이 형상에는 해당 파일이 존재하지 않습니다.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content modal-lg">
        <header className="modal-header">
          <h3>{modalTitle}</h3>
          <button className="close-button" onClick={onClose}>&times;</button>
        </header>

        <main className="modal-body resource-view-body">
            <div className="resource-tabs">
                {resourceTypes.map(tabType => (
                <button key={tabType} className={`resource-tab ${activeTab === tabType ? 'active' : ''}`} onClick={() => setActiveTab(tabType)}>
                    {tabType}
                </button>
                ))}
            </div>
             <div className="resource-content-wrapper">
                <aside className="file-list-panel">
                    <h5>파일 목록</h5>
                    {isCompare && (
                        <div className="filter-checkbox">
                        <label>
                            <input
                            type="checkbox"
                            checked={showChangedOnly}
                            onChange={(e) => setShowChangedOnly(e.target.checked)}
                            />
                            <span>변경사항만 보기</span>
                        </label>
                        </div>
                    )}
                    {loading ? <p>Loading files...</p> : (
                        // ✅ [수정] 파일 목록 렌더링 시 상태 뱃지와 색상 표시 로직 추가
                        <ul className="file-list">
                            {fileList
                                .filter(file => !showChangedOnly || (file.status !== 'UNCHANGED' && file.status !== 'single'))
                                .map(file => {
                                    const statusMap = {
                                        'DELETED': { text: '삭제됨', cssClass: 'itemA_only' },
                                        'ADDED': { text: '추가됨', cssClass: 'itemB_only' },
                                        'MODIFIED': { text: '수정됨', cssClass: 'modified' },
                                        'UNCHANGED': { text: '동일', cssClass: 'identical' },
                                        'single': { text: '-', cssClass: 'single' },
                                    };
                                    const statusInfo = statusMap[file.status];

                                    return (
                                        <li
                                            key={file.name}
                                            className={activeFile === file.name ? 'active' : ''}
                                            onClick={() => setActiveFile(file.name)}
                                            data-status={statusInfo.cssClass}
                                        >
                                            <span className={`file-status-indicator status-${statusInfo.cssClass}`} />
                                            <span className="file-name">{file.name}</span>
                                            {isCompare && <span className="file-status-tag">{statusInfo.text}</span>}
                                        </li>
                                    );
                                })}
                        </ul>
                    )}
                </aside>
                <div className="resource-main-content">
                    <section className="resource-content">
                        {isCompare ? (
                            <>
                                {renderContentPane(contentA, `백업 (${itemA?.id})`)}
                                {renderContentPane(contentB, itemB?.id === 'live' ? '현재 적용중 (Live)' : `백업 (${itemB?.id})`)}
                            </>
                        ) : (
                            renderContentPane(contentA, `백업 (${itemA?.id})`)
                        )}
                    </section>
                </div>
            </div>
        </main>
        <footer className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>닫기</button>
        </footer>
      </div>
    </div>
  );
};

export default ResourceViewModal;