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

  const modalTitle = useMemo(() => {
    if (type === 'restore') return 'WAF Rule 복원';
    if (type === 'manual_backup') return 'WAF Rule 비교';
    if (type === 'compare') return 'WAF Rule 비교';
    if (type === 'view') {
        return 'WAF Rule 백업 조회'
        // const item = items[0];
        // const prefix = item.status === 'APPLIED' ? '최종 백업 조회: ' : '백업 조회: ';
        // return `${prefix}${item.id}`;
    }
    return '리소스 보기';
  }, [type, items]);

  // ✅ [수정] itemA와 itemB를 명확하게 분리하여 순서를 고정합니다.
  const { itemA, itemB } = useMemo(() => {
    if (!isCompare) return { itemA: items[0]?.id, itemB: null };

    if (isCurrentCompare) {
        // live와 비교 시: itemA는 백업, itemB는 live로 고정
        return {
            itemA: items.find(item => item.id !== 'live' && item.id !== 'current')?.id,
            itemB: items.find(item => item.id === 'live' || item.id === 'current')?.id,
        }
    }
    // 백업 간 비교 시: 첫 번째 선택을 itemA, 두 번째를 itemB로 설정
    return { itemA: items[0]?.id, itemB: items[1]?.id };
  }, [items, isCompare, isCurrentCompare]);

  React.useEffect(() => {
    setActiveFile(null);
  }, [activeTab]);

  const getData = (itemId: string | null, fileName: string | null) => {
    if (!itemId || !fileName) return '';
    if (itemId === 'current' || itemId === 'live') return mockCurrentResourceData[activeTab]?.[fileName] || '';
    return mockBackupResourceData[itemId]?.[activeTab]?.[fileName] || '';
  };

  const fileListWithStatus = useMemo(() => {
    if (!isCompare || !itemA || !itemB) {
      if (!items || items.length === 0 || !items[0].id) return [];
      const files = Object.keys(mockBackupResourceData[items[0].id]?.[activeTab] || {});
      return files.map(name => ({ name, status: 'single' as const }));
    }

    const filesA = Object.keys(mockBackupResourceData[itemA]?.[activeTab] || {});
    const filesB = Object.keys((itemB === 'live' || itemB === 'current')
        ? (mockCurrentResourceData[activeTab] || {})
        : (mockBackupResourceData[itemB]?.[activeTab] || {}));

    const allFiles = Array.from(new Set([...filesA, ...filesB])).sort();

    return allFiles.map(file => {
      const inA = filesA.includes(file);
      const inB = filesB.includes(file);

      // ✅ [수정] live 기준 비교 로직 반영
      // itemA: 백업(old), itemB: live(new)
      if (inA && !inB) return { name: file, status: 'itemA_only' as const }; // 백업에만 존재 -> live에서 '삭제됨'
      if (!inA && inB) return { name: file, status: 'itemB_only' as const }; // live에만 존재 -> live에 '추가됨'

      const dataA = getData(itemA, file);
      const dataB = getData(itemB, file);
      const isIdentical = dataA === dataB;

      return {
        name: file,
        status: isIdentical ? 'identical' as const : 'modified' as const
      };
    });

  }, [activeTab, itemA, itemB, isCompare, showChangedOnly, items]);

  const getStatusText = (status: string) => {
      if (status === 'itemA_only') return '삭제됨'; // live에 없으므로 '삭제됨'
      if (status === 'itemB_only') return '추가됨'; // live에 있으므로 '추가됨'
    if (status === 'modified') return '수정됨';
    if (status === 'identical') return '동일';
    return '';
  };

  const highlightDiffs = (text: string, currentItemId: string | null) => {
    if (!isCompare || !activeFile || !itemA || !itemB) {
        return <pre className="json-viewer">{text}</pre>;
    }

    const lines = text.split('\n');
    const otherItemId = currentItemId === itemA ? itemB : itemA;
    const otherText = getData(otherItemId, activeFile);

    if (!otherText) {
        // 비교 대상 파일이 없으면 전체를 추가/삭제로 처리
        const className = currentItemId === itemA ? 'diff-removed' : 'diff-added';
        return (
            <div className="code-viewer-with-diff">
                {lines.map((line, index) => (
                    <div key={index} className={`code-line ${className}`}>{line || ' '}</div>
                ))}
            </div>
        );
    }

    return (
      <div className="code-viewer-with-diff">
        {lines.map((line, index) => {
          const trimmedLine = line.trim();
          const isDifferent = trimmedLine.length > 0 && !otherText.includes(trimmedLine);
          // itemA(백업)에만 있는 라인은 removed, itemB(live)에만 있는 라인은 added
          const className = isDifferent ? (currentItemId === itemA ? 'diff-removed' : 'diff-added') : '';
          return <div key={index} className={`code-line ${className}`}>{line || ' '}</div>;
        })}
      </div>
    );
  };

  const getItemTitle = (itemId: string | null) => {
    if (!itemId) return '';
    const currentItem = items.find(it => it.id === itemId);
    const isApplied = currentItem?.status === 'APPLIED';

    if (itemId === 'current' || itemId === 'live') return '현재 적용중 (Live)';

    return isApplied ? `최종 백업 (${itemId})` : `백업 (${itemId})`;
  }

  const renderContentPane = (itemId: string | null) => {
    if (!itemId) return null;
    const fileData = getData(itemId, activeFile);
    const itemTitle = getItemTitle(itemId);

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
                  ) : (items && items.length > 0 && renderContentPane(items[0].id))
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