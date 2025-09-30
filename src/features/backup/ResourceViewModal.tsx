// src/components/ResourceViewModal.tsx
import React, { useState, useMemo } from 'react';
import '../../components/styles/ModalStyles.css';
import './ResourceViewModal.css';
import { mockBackupResourceData, mockCurrentResourceData } from '../../data/mockResourceData';
import type {BackupStatus} from '../../types/restore.types';

// Props 타입 정의
interface ResourceViewItem {
  id: string;
  status: BackupStatus;
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

  const isCompare = type === 'compare' || type === 'restore' || type === 'manual_backup';
  const isCurrentCompare = items.some(item => item.id === 'current' || item.id === 'live');

  const itemIds = useMemo(() => items.map(item => item.id), [items]);

  const modalTitle = useMemo(() => {
    if (type === 'restore') return 'WAF Rule 복원';
    if (type === 'manual_backup') return 'WAF Rule 비교';
    if (type === 'compare') return 'WAF Rule 비교';
    if (type === 'view') {
        const item = items[0];
        const prefix = item.status === 'APPLIED' ? '최종 백업 조회: ' : '백업 조회: ';
        return `${prefix}${item.id}`;
    }
    return '리소스 보기';
  }, [type, items]);

  React.useEffect(() => {
    setActiveFile(null);
  }, [activeTab]);

  const getFilesForTab = (itemId: string) => {
    if (itemId === 'current' || itemId === 'live') {
      return Object.keys(mockCurrentResourceData[activeTab] || {});
    }
    return Object.keys(mockBackupResourceData[itemId]?.[activeTab] || {});
  };

  const getData = (itemId: string, fileName: string | null) => {
    if (!fileName) return '';
    if (itemId === 'current' || itemId === 'live') return mockCurrentResourceData[activeTab]?.[fileName] || '';
    return mockBackupResourceData[itemId]?.[activeTab]?.[fileName] || '';
  };

  const fileListWithStatus = useMemo(() => {
    if (!isCompare) {
      const files = getFilesForTab(items[0].id);
      return files.map(name => ({ name, status: 'single' as const }));
    }

    const itemA_id = isCurrentCompare ? (items.find(item => item.id === 'live' || item.id === 'current')!.id) : items[0].id;
    const itemB_id = isCurrentCompare ? (items.find(item => item.id !== 'live' && item.id !== 'current')!.id) : items[1].id;

    const filesA = getFilesForTab(itemA_id);
    const filesB = getFilesForTab(itemB_id);
    const allFiles = Array.from(new Set([...filesA, ...filesB])).sort();

    const filesWithStatus = allFiles.map(file => {
      const inA = filesA.includes(file);
      const inB = filesB.includes(file);

      if (!inA && inB) return { name: file, status: 'itemB_only' as const };
      if (inA && !inB) return { name: file, status: 'itemA_only' as const };

      const dataA = getData(itemA_id, file);
      const dataB = getData(itemB_id, file);
      const isIdentical = dataA === dataB;

      return {
        name: file,
        status: isIdentical ? 'identical' as const : 'modified' as const
      };
    });

    if (showChangedOnly) {
      return filesWithStatus.filter(f => f.status !== 'identical');
    }

    return filesWithStatus;
  }, [activeTab, items, isCompare, isCurrentCompare, showChangedOnly]);

  const getStatusText = (status: string) => {
    if (status === 'itemA_only') return '삭제됨';
    if (status === 'itemB_only') return '추가됨';
    if (status === 'modified') return '수정됨';
    if (status === 'identical') return '동일';
    return '';
  };

  const highlightDiffs = (text: string, currentItemId: string) => {
    if (!isCompare || !activeFile) {
        return <pre className="json-viewer">{text}</pre>;
    }

    const lines = text.split('\n');
    const otherItem = items.find(item => item.id !== currentItemId);
    if (!otherItem) {
        return <pre className="json-viewer">{text}</pre>;
    }
    const otherText = getData(otherItem.id, activeFile);

    if (!otherText) {
        return <pre className="json-viewer">{text}</pre>;
    }

    return (
      <div className="code-viewer-with-diff">
        {lines.map((line, index) => {
          const trimmedLine = line.trim();
          const isDifferent = trimmedLine.length > 0 && !otherText.includes(trimmedLine);
          const isFirstItem = items[0].id === currentItemId;
          const className = isDifferent ? (isFirstItem ? 'diff-removed' : 'diff-added') : '';
          return <div key={index} className={`code-line ${className}`}>{line || ' '}</div>;
        })}
      </div>
    );
  };

  const renderContentPane = (itemId: string) => {
    const fileData = getData(itemId, activeFile);
    const itemTitle = getItemTitle(itemId);

    // activeFile이 없을 때 초기 뷰
    if (!activeFile && isCompare) {
        return (
            <div className="content-pane">
                 <h4 className="content-pane-title">{itemTitle}</h4>
                 <div className="json-viewer-container empty">
                    <div className="empty-state">
                        <div className="empty-state-content">
                             <span className="empty-icon">📄</span>
                            <h4>파일을 선택하여 내용을 확인하세요</h4>
                        </div>
                    </div>
                 </div>
            </div>
        )
    }

    return (
        <div className="content-pane">
            <h4 className="content-pane-title">{itemTitle}</h4>
            <div className="json-viewer-container">
                {fileData ? (
                     isCompare ? highlightDiffs(fileData, itemId) : <pre className="json-viewer">{fileData}</pre>
                ) : (
                    <div className="empty-state">
                        <div className="empty-state-content">
                            <p>이 버전에는 파일이 존재하지 않습니다.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
  };

  const ResourceContentHeader = () => {
    if (!activeFile) return <div className="resource-content-header placeholder">파일을 선택하세요</div>;

    const currentFile = fileListWithStatus.find(f => f.name === activeFile);
    if (!currentFile) return null;

    return (
      <div className="resource-content-header">
        <div className="file-info-wrapper">
            {isCompare && <span className={`file-status-indicator status-${currentFile.status}`}></span>}
            <span className="file-name">{activeFile}</span>
            {isCompare && (
              <span className="file-status-tag">{getStatusText(currentFile.status)}</span>
            )}
        </div>
      </div>
    );
  };

  const getFooterButtons = () => {
    if (type === 'restore') {
      return (
        <>
          <button className="btn btn-primary">복원</button>
          <button className="btn btn-secondary" onClick={onClose}>닫기</button>
        </>
      );
    } else if (type === 'manual_backup') {
      return (
        <>
          <button className="btn btn-primary">백업</button>
          <button className="btn btn-secondary" onClick={onClose}>닫기</button>
        </>
      );
    } else {
      return <button className="btn btn-secondary" onClick={onClose}>닫기</button>;
    }
  };

  const itemA = isCurrentCompare ? (itemIds.includes('live') ? 'live' : 'current') : items[0].id;
  const itemB = isCurrentCompare ? itemIds.find(id => id !== 'current' && id !== 'live')! : items[1].id;

  const getItemTitle = (itemId: string) => {
      const currentItem = items.find(it => it.id === itemId);
      const isApplied = currentItem?.status === 'APPLIED';
      return itemId === 'current' || itemId === 'live' ? '현재 적용중' :
             isApplied ? `최종 백업 (${itemId})` : itemId;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content modal-lg">
        <header className="modal-header">
          <h3>{modalTitle}</h3>
          <button className="close-button" onClick={onClose}>&times;</button>
        </header>

        <main className="modal-body resource-view-body">
          <div className="resource-tabs">
            {resourceTypes.map(type => (
              <button key={type} className={`resource-tab ${activeTab === type ? 'active' : ''}`} onClick={() => setActiveTab(type)}>
                {type}
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
              <ul className="file-list">
                {fileListWithStatus.map(({ name, status }) => (
                  <li
                    key={name}
                    className={activeFile === name ? 'active' : ''}
                    data-status={status}
                    onClick={() => setActiveFile(name)}
                  >
                    {isCompare && <span className={`file-status-indicator status-${status}`}></span>}
                    <span className="file-name">{name}</span>
                    {isCompare && (
                      <span className="file-status-tag">{getStatusText(status)}</span>
                    )}
                  </li>
                ))}
              </ul>
            </aside>

            <div className="resource-main-content">
              <ResourceContentHeader />
              <section className="resource-content">
                {isCompare ? (
                  <>
                    {renderContentPane(itemA)}
                    {renderContentPane(itemB)}
                  </>
                ) : (
                  // 비교 모드가 아닐 때는 하나의 Pane만 렌더링
                  !activeFile ? (
                     <div className="json-viewer-container empty single-view">
                        <div className="empty-state">
                            <div className="empty-state-content">
                                <span className="empty-icon">📄</span>
                                <h4>파일을 선택하여 내용을 확인하세요</h4>
                                <p>왼쪽 목록에서 파일을 선택해주세요.</p>
                            </div>
                        </div>
                     </div>
                  ) : renderContentPane(items[0].id)
                )}
              </section>
            </div>
          </div>
        </main>

        <footer className="modal-footer">
          {getFooterButtons()}
        </footer>
      </div>
    </div>
  );
};

export default ResourceViewModal;