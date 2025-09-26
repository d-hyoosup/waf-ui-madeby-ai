// src/components/ResourceViewModal.tsx
import React, { useState, useMemo } from 'react';
import './ModalStyles.css';
import './ResourceViewModal.css';
import { mockBackupResourceData, mockCurrentResourceData } from '../data/mockResourceData';

interface ResourceViewModalProps {
  type: 'view' | 'compare' | 'restore' | 'manual_backup';
  items: string[];
  onClose: () => void;
}

const ResourceViewModal: React.FC<ResourceViewModalProps> = ({ type, items, onClose }) => {
  const resourceTypes = ["Web ACLs", "IP Sets", "Regex pattern", "Rule Groups"];
  const [activeTab, setActiveTab] = useState(resourceTypes[0]);
  const [activeFile, setActiveFile] = useState<string | null>(null);

  const isCompare = type === 'compare' || type === 'restore' || type === 'manual_backup';
  const isCurrentCompare = items.includes('current') || items.includes('live');

  // ✅ [수정] 타이틀 로직 개선
  const modalTitle = useMemo(() => {
    if (type === 'restore') {
      return 'WAF Rule 복원';
    } else if (type === 'manual_backup') {
      return 'WAF Rule 비교'; // manual_backup도 비교 모달과 동일한 타이틀
    } else if (type === 'compare') {
      return 'WAF Rule 비교';
    } else if (type === 'view') {
      return `백업 조회: ${items[0]}`;
    }
    return '리소스 보기';
  }, [type, items]);

  // ✅ [수정] 버튼 로직 개선
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

  React.useEffect(() => {
    setActiveFile(null);
  }, [activeTab]);

  const getFilesForTab = (itemId: string) => {
    if (itemId === 'current' || itemId === 'live') {
      return Object.keys(mockCurrentResourceData[activeTab] || {});
    }
    return Object.keys(mockBackupResourceData[itemId]?.[activeTab] || {});
  };

  const fileListWithStatus = useMemo(() => {
    if (!isCompare) {
      const files = getFilesForTab(items[0]);
      return files.map(name => ({ name, status: 'single' as const }));
    }

    const itemA = isCurrentCompare ? (items.includes('live') ? 'live' : 'current') : items[0];
    const itemB = isCurrentCompare ? items.find(item => item !== 'current' && item !== 'live')! : items[1];

    const filesA = getFilesForTab(itemA);
    const filesB = getFilesForTab(itemB);
    const allFiles = Array.from(new Set([...filesA, ...filesB])).sort();

    return allFiles.map(file => {
      const inA = filesA.includes(file);
      const inB = filesB.includes(file);
      let status: 'both' | 'itemA_only' | 'itemB_only' = 'both';
      if (inA && !inB) status = 'itemA_only';
      else if (!inA && inB) status = 'itemB_only';
      return { name: file, status };
    });
  }, [activeTab, items, isCompare, isCurrentCompare]);

  const getData = (itemId: string, fileName: string | null) => {
    if (!fileName) return '';
    if (itemId === 'current' || itemId === 'live') return mockCurrentResourceData[activeTab]?.[fileName] || '';
    return mockBackupResourceData[itemId]?.[activeTab]?.[fileName] || '';
  };

  const highlightDiffs = (text: string, itemIndex: number) => {
    if (!isCompare || !activeFile) {
        return <pre className="json-viewer">{text}</pre>;
    }

    const lines = text.split('\n');
    let otherItemId: string;

    if (isCurrentCompare) {
      otherItemId = itemIndex === 0 ? items.find(item => item !== 'current' && item !== 'live')! : (items.includes('live') ? 'live' : 'current');
    } else {
      otherItemId = items[1 - itemIndex];
    }

    const otherText = getData(otherItemId, activeFile);
    if (!otherText) {
        return <pre className="json-viewer">{text}</pre>;
    }

    return (
      <div className="code-viewer-with-diff">
        {lines.map((line, index) => {
          const trimmedLine = line.trim();
          const isDifferent = trimmedLine.length > 0 && !otherText.includes(trimmedLine);
          const className = isDifferent ? (itemIndex === 0 ? 'diff-removed' : 'diff-added') : '';
          return <div key={index} className={`code-line ${className}`}>{line || ' '}</div>;
        })}
      </div>
    );
  };

  const renderContentView = (itemId: string, itemIndex: number = 0) => {
    const title = itemId === 'current' || itemId === 'live' ? '현재 적용중' : itemId;

    if (!activeFile) {
      return (
        <div className="empty-state">
          <div className="empty-state-content">
            <span className="empty-icon">📄</span>
            <h4>파일을 선택하여 내용을 확인하세요</h4>
            <p>왼쪽 목록에서 파일을 선택해주세요.</p>
          </div>
        </div>
      );
    }

    const fileData = getData(itemId, activeFile);

    if (!fileData) {
        return (
            <div className="json-viewer-container">
                <h4>{title}</h4>
                <div className="file-info">파일: {activeFile}</div>
                <div className="empty-state">
                    <div className="empty-state-content">
                        <p>이 버전에는 파일이 존재하지 않습니다.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="json-viewer-container">
            <h4>{title}</h4>
            <div className="file-info">파일: {activeFile}</div>
            {isCompare ? highlightDiffs(fileData, itemIndex) : <pre className="json-viewer">{fileData}</pre>}
        </div>
    );
  };

  const itemA = isCurrentCompare ? (items.includes('live') ? 'live' : 'current') : items[0];
  const itemB = isCurrentCompare ? items.find(item => item !== 'current' && item !== 'live')! : items[1];

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
              <ul className="file-list">
                {fileListWithStatus.map(({ name, status }) => (
                  <li key={name} className={activeFile === name ? 'active' : ''} onClick={() => setActiveFile(name)}>
                    {isCompare && <span className={`file-status-indicator status-${status}`}></span>}
                    <span className="file-name">{name}</span>
                    {isCompare && status === 'itemA_only' && <span className="file-status-tag">A</span>}
                    {isCompare && status === 'itemB_only' && <span className="file-status-tag">B</span>}
                  </li>
                ))}
              </ul>
              {/* ✅ [삭제] 파일 상태 범례 제거 */}
            </aside>

            <section className="resource-content">
              {isCompare ? (
                <>
                  {renderContentView(itemA, 0)}
                  {renderContentView(itemB, 1)}
                </>
              ) : (
                renderContentView(items[0])
              )}
            </section>
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