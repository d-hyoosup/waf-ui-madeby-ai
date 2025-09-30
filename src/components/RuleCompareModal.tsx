// src/components/RuleCompareModal.tsx
import React, { useState, useMemo } from 'react';
import './ModalStyles.css';
import './CodeViewer.css';
import { mockBackupResourceData, mockCurrentResourceData } from '../data/mockResourceData';

interface RuleCompareModalProps {
  selectedBackup?: string;
  onClose: () => void;
}

const RuleCompareModal: React.FC<RuleCompareModalProps> = ({ selectedBackup, onClose }) => {
  const [activeResource, setActiveResource] = useState<string>("Web ACLs");
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const backupId = selectedBackup || '20250112-150430';

  // Import된 데이터를 컴포넌트가 사용하는 구조로 재구성
  const resourceData = useMemo(() => {
    const backupData = mockBackupResourceData[backupId] || {};
    return {
        "Web ACLs": { backup: backupData["Web ACLs"], current: mockCurrentResourceData["Web ACLs"] },
        "IP Sets": { backup: backupData["IP Sets"], current: mockCurrentResourceData["IP Sets"] },
        "Regex pattern sets": { backup: backupData["Regex pattern sets"], current: mockCurrentResourceData["Regex pattern sets"] },
        "Rule groups": { backup: backupData["Rule groups"], current: mockCurrentResourceData["Rule groups"] },
    };
  }, [backupId]);

  const resources = Object.keys(resourceData);

  React.useEffect(() => {
    setActiveFile(null);
  }, [activeResource]);

  const fileListWithStatus = useMemo(() => {
    const resource = resourceData[activeResource as keyof typeof resourceData];
    if (!resource) return [];

    const backupFiles = Object.keys(resource.backup || {});
    const currentFiles = Object.keys(resource.current || {});
    const allFiles = Array.from(new Set([...backupFiles, ...currentFiles])).sort();

    return allFiles.map(file => {
      const inBackup = backupFiles.includes(file);
      const inCurrent = currentFiles.includes(file);
      let status: 'both' | 'backup_only' | 'current_only' = 'both';
      if (inBackup && !inCurrent) {
        status = 'backup_only';
      } else if (!inBackup && inCurrent) {
        status = 'current_only';
      }
      return { name: file, status };
    });
  }, [activeResource, resourceData]);

  const highlightDiffs = (text: string, isBackup: boolean) => {
    if (!text || !activeFile) return [];
    const otherContent = getCurrentContent(!isBackup);
    const lines = text.split('\n');

    return lines.map((line, index) => {
      const trimmedLine = line.trim();
      const isDifferent = trimmedLine.length > 0 && !otherContent.includes(trimmedLine);
      const className = isDifferent ? (isBackup ? 'diff-removed' : 'diff-added') : '';

      return (
        <div key={index} className={`code-line ${className}`}>
          {line || ' '}
        </div>
      );
    });
  };

  const getCurrentContent = (isBackup: boolean): string => {
    if (!activeFile) return '';
    const resource = resourceData[activeResource as keyof typeof resourceData];
    if (!resource) return '';
    const source = isBackup ? resource.backup : resource.current;
    return source?.[activeFile as keyof typeof source] || '';
  };

  const renderContentView = (isBackup: boolean) => {
    if (!activeFile) {
      return (
        <div className="empty-state">
          <div className="empty-state-content">
            <span className="empty-icon">📄</span>
            <h4>파일을 선택하여 비교하세요.</h4>
            <p>왼쪽 목록에서 비교할 파일을 선택해주세요.</p>
          </div>
        </div>
      );
    }

    const content = getCurrentContent(isBackup);
    const title = isBackup ? backupId : '현재 룰';

    if (!content) {
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
            <div className="code-viewer-with-diff">
                {highlightDiffs(content, isBackup)}
            </div>
        </div>
    );
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content modal-lg">
        <header className="modal-header">
          <h3>룰 비교: {backupId} vs 현재 룰</h3>
          <button className="close-button" onClick={onClose}>&times;</button>
        </header>

        <main className="modal-body snapshot-body">
          <aside className="resource-list">
            <div className="resource-section">
              <h5>리소스 타입</h5>
              <ul className="resource-type-list">
                {resources.map(res => (
                  <li key={res} className={activeResource === res ? 'active' : ''} onClick={() => setActiveResource(res)}>{res}</li>
                ))}
              </ul>
            </div>

            <div className="resource-section">
              <h5>
                파일 목록
                <div className="file-status-legend">
                    <span><i className="status-indicator status-backup-only"></i> {backupId}</span>
                    <span><i className="status-indicator status-current-only"></i> 현재</span>
                    <span><i className="status-indicator status-both"></i> 모두</span>
                </div>
              </h5>
              <ul className="file-list">
                {fileListWithStatus.length > 0 ? fileListWithStatus.map(({ name, status }) => (
                  <li key={name} className={activeFile === name ? 'active' : ''} onClick={() => setActiveFile(name)} data-status={status}>
                    <span className={`file-status-indicator status-${status}`}></span>
                    <span className="file-name">{name}</span>
                    {status === 'backup_only' && <span className="file-status-tag">백업</span>}
                    {status === 'current_only' && <span className="file-status-tag">현재</span>}
                  </li>
                )) : (
                  <li className="no-files">파일이 없습니다</li>
                )}
              </ul>
            </div>
          </aside>

          <section className="resource-content">
            {renderContentView(true)}
            {renderContentView(false)}
          </section>
        </main>

        <footer className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>닫기</button>
          <button className="btn btn-primary">이 버전으로 복원</button>
        </footer>
      </div>
    </div>
  );
};

export default RuleCompareModal;