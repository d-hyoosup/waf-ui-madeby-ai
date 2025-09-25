// src/components/ResourceViewModal.tsx
import React, { useState, useMemo } from 'react';
import './ModalStyles.css';
import './ResourceViewModal.css';
import { mockBackupResourceData, mockCurrentResourceData } from '../data/mockResourceData';

interface ResourceViewModalProps {
  type: 'view' | 'compare';
  items: string[];
  onClose: () => void;
}

const ResourceViewModal: React.FC<ResourceViewModalProps> = ({ type, items, onClose }) => {
  const resourceTypes = ["Web ACLs", "IP Sets", "Regex pattern", "Rule Groups"];
  const [activeTab, setActiveTab] = useState(resourceTypes[0]);
  const [activeFile, setActiveFile] = useState<string | null>(null);

  const isCompare = type === 'compare';
  const isCurrentCompare = items.includes('current');

  // 모달 제목 설정
  const modalTitle = useMemo(() => {
    if (type === 'view') {
      return `백업 조회: ${items[0]}`;
    } else if (isCurrentCompare) {
      return '현재 룰과 비교';
    } else if (items.length === 2) {
      return `백업 간 비교: ${items[0]} vs ${items[1]}`;
    } else if (items.length === 1) {
      return `현재 룰과 비교: ${items[0]}`;
    }
    return '리소스 보기';
  }, [type, items, isCurrentCompare]);

  // 탭 변경 시 파일 선택 초기화
  React.useEffect(() => {
    setActiveFile(null);
  }, [activeTab]);

  // 파일 목록 가져오기
  const getFilesForTab = (itemId: string) => {
    if (itemId === 'current') {
      return Object.keys(mockCurrentResourceData[activeTab] || {});
    }
    return Object.keys(mockBackupResourceData[itemId]?.[activeTab] || {});
  };

  // 파일 상태 포함한 파일 목록
  const fileListWithStatus = useMemo(() => {
    if (!isCompare) {
      const files = getFilesForTab(items[0]);
      return files.map(name => ({ name, status: 'single' as const }));
    }

    const itemA = isCurrentCompare ? 'current' : items[0];
    const itemB = isCurrentCompare ? items[0] : (items[1] || 'current');

    const filesA = getFilesForTab(itemA);
    const filesB = getFilesForTab(itemB);
    const allFiles = Array.from(new Set([...filesA, ...filesB])).sort();

    return allFiles.map(file => {
      const inA = filesA.includes(file);
      const inB = filesB.includes(file);
      let status: 'both' | 'itemA_only' | 'itemB_only' = 'both';
      if (inA && !inB) {
        status = 'itemA_only';
      } else if (!inA && inB) {
        status = 'itemB_only';
      }
      return { name: file, status };
    });
  }, [activeTab, items, isCompare, isCurrentCompare]);

  // 데이터 가져오기
  const getData = (itemId: string, fileName: string | null) => {
    if (!fileName) return '';

    if (itemId === 'current') {
      return mockCurrentResourceData[activeTab]?.[fileName] || '';
    }

    const resourceFiles = mockBackupResourceData[itemId]?.[activeTab];
    if (!resourceFiles) return '';
    return resourceFiles[fileName] || '';
  };

  // 차이점 하이라이팅
  const highlightDiffs = (text: string, itemIndex: number) => {
    if (!isCompare || !activeFile) {
        return <pre className="json-viewer">{text}</pre>;
    }

    const lines = text.split('\n');
    let otherItemId: string;

    if (isCurrentCompare) {
      otherItemId = itemIndex === 0 ? items[0] : 'current';
    } else {
      otherItemId = items[1 - itemIndex] || 'current';
    }

    const otherText = getData(otherItemId, activeFile);

    return (
      <div className="code-viewer-with-diff">
        {lines.map((line, index) => {
          const trimmedLine = line.trim();
          const isDifferent = trimmedLine.length > 0 && !otherText.includes(trimmedLine);
          const className = isDifferent ? (itemIndex === 0 ? 'diff-removed' : 'diff-added') : '';

          return (
            <div key={index} className={`code-line ${className}`}>
              {line || ' '}
            </div>
          );
        })}
      </div>
    );
  };

  // 컨텐츠 뷰 렌더링
  const renderContentView = (itemId: string, itemIndex: number = 0) => {
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
    const title = itemId === 'current' ? '현재 적용중' : itemId;

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

  return (
    <div className="modal-overlay">
      <div className="modal-content modal-lg">
        <header className="modal-header">
          <h3>{modalTitle}</h3>
          <button className="close-button" onClick={onClose}>&times;</button>
        </header>

        <main className="modal-body resource-view-body">
          {/* 탭 영역 */}
          <div className="resource-tabs">
            {resourceTypes.map(type => (
              <button
                key={type}
                className={`resource-tab ${activeTab === type ? 'active' : ''}`}
                onClick={() => setActiveTab(type)}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="resource-content-wrapper">
            {/* 파일 목록 */}
            <aside className="file-list-panel">
              <h5>파일 목록</h5>
              <ul className="file-list">
                {fileListWithStatus.length > 0 ? fileListWithStatus.map(({ name, status }) => (
                  <li
                    key={name}
                    className={activeFile === name ? 'active' : ''}
                    onClick={() => setActiveFile(name)}
                    data-status={status}
                  >
                    {isCompare && (
                      <span className={`file-status-indicator status-${status}`}></span>
                    )}
                    <span className="file-name">{name}</span>
                    {isCompare && status === 'itemA_only' && (
                      <span className="file-status-tag">
                        {isCurrentCompare ? '현재' : items[0].substring(0, 8)}
                      </span>
                    )}
                    {isCompare && status === 'itemB_only' && (
                      <span className="file-status-tag">
                        {isCurrentCompare ? items[0].substring(0, 8) : (items[1] || 'current').substring(0, 8)}
                      </span>
                    )}
                  </li>
                )) : (
                  <li className="no-files">파일이 없습니다</li>
                )}
              </ul>
              {isCompare && fileListWithStatus.length > 0 && (
                <div className="file-status-legend">
                  <span><i className="status-indicator status-itemA-only"></i>
                    {isCurrentCompare ? '현재만' : `${items[0].substring(0, 8)}만`}
                  </span>
                  <span><i className="status-indicator status-itemB-only"></i>
                    {isCurrentCompare ? `${items[0].substring(0, 8)}만` : items[1] ? `${items[1].substring(0, 8)}만` : '현재만'}
                  </span>
                  <span><i className="status-indicator status-both"></i> 모두</span>
                </div>
              )}
            </aside>

            {/* 컨텐츠 영역 */}
            <section className="resource-content">
              {isCompare ? (
                <>
                  {isCurrentCompare ? (
                    <>
                      {renderContentView('current', 0)}
                      {renderContentView(items[0], 1)}
                    </>
                  ) : (
                    <>
                      {renderContentView(items[0], 0)}
                      {renderContentView(items[1] || 'current', 1)}
                    </>
                  )}
                </>
              ) : (
                renderContentView(items[0])
              )}
            </section>
          </div>
        </main>

        <footer className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>닫기</button>
          {type === 'compare' && items.length === 1 && !isCurrentCompare && (
            <button className="btn btn-primary">이 버전으로 복원</button>
          )}
        </footer>
      </div>
    </div>
  );
};

export default ResourceViewModal;