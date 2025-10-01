// src/features/backup/ResourceViewModal.tsx
import React, { useState, useMemo, useEffect } from 'react';
import '../../components/styles/ModalStyles.css';
import './ResourceViewModal.css';
import { getSnapshotFiles, getFileContent, getFileContentPair } from '../../api/backupService';
import type { BackupStatus } from '../../types/api.types';

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

const ResourceViewModal: React.FC<ResourceViewModalProps> = ({ type, items, onClose }) => {
  const resourceTypes = ["Web ACLs", "IP Sets", "Regex pattern", "Rule Groups"];
  const [activeTab, setActiveTab] = useState(resourceTypes[0]);
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [showChangedOnly, setShowChangedOnly] = useState(false);
  const [fileList, setFileList] = useState<{name: string, status: string}[]>([]);
  const [contentA, setContentA] = useState('');
  const [contentB, setContentB] = useState('');
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

  useEffect(() => {
    const fetchFiles = async () => {
        if (!itemA) return;
        setLoading(true);
        try {
            const filesData = await getSnapshotFiles(itemA.id);
            const currentTabFiles = filesData.find(f => f.resourceType.replace('_', ' ') === activeTab.replace('s', ''));
            const files = currentTabFiles ? currentTabFiles.files.map(name => ({ name, status: 'single' })) : [];
            setFileList(files);

        } catch (error) {
            console.error("Failed to fetch file list", error);
            setFileList([]);
        } finally {
            setLoading(false);
        }
    };
    fetchFiles();
    setActiveFile(null);
  }, [activeTab, itemA]);

 useEffect(() => {
    const fetchContent = async () => {
        if (!activeFile || !itemA) return;
        setLoading(true);
        setContentA('');
        setContentB('');
        try {
            const resourceType = activeTab.replace(' ', '_').toUpperCase();
            if (isCompare && itemB) {
                const { base, target } = await getFileContentPair(itemA.id, resourceType, activeFile, itemB.id === 'live' ? undefined : itemB.id);
                setContentA(base ? JSON.stringify(base, null, 2) : '파일 없음');
                setContentB(target ? JSON.stringify(target, null, 2) : '파일 없음');
            } else {
                const content = await getFileContent(itemA.id, resourceType, activeFile);
                setContentA(JSON.stringify(content, null, 2));
            }
        } catch (error) {
            console.error("Failed to fetch file content", error);
            setContentA('콘텐츠를 불러오는 데 실패했습니다.');
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

  const renderContentPane = (content: string, title: string) => {
    return (
        <div className="content-pane">
            <h4 className="content-pane-title">{title}</h4>
            <div className="json-viewer-container">
                {loading ? <p>Loading content...</p> : <pre className="json-viewer">{content}</pre>}
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
                        <ul className="file-list">
                            {fileList.map(({ name }) => (
                            <li key={name} className={activeFile === name ? 'active' : ''} onClick={() => setActiveFile(name)}>
                                <span className="file-name">{name}</span>
                            </li>
                            ))}
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