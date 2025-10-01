// src/features/backup/ResourceViewModal.tsx
import React, { useState, useMemo, useEffect } from 'react';
import '../../components/styles/ModalStyles.css';
import './ResourceViewModal.css';
import '../../components/styles/CodeViewer.css'; // Diff 스타일을 위해 추가
import { BackupService } from '../../api';
import type { BackupStatus, WafRuleDiffStatus } from '../../types/api.types';

// Props 타입 정의
interface ResourceViewItem {
  id: string; // snapshotId
  status: BackupStatus;
  scopeId?: string;
}

interface ResourceViewModalProps {
  type: 'view' | 'compare' | 'restore' | 'manual_backup';
  items: ResourceViewItem[];
  onClose: () => void;
}

// API 리소스 타입 매핑 함수
const mapTabToApiResourceType = (tabName: string): string => {
    switch (tabName) {
        case "Web ACLs": return "WEB_ACL";
        case "IP Sets": return "IP_SET";
        case "Regex pattern": return "REGEX_PATTERN_SET";
        case "Rule Groups": return "RULE_GROUP";
        default: return "";
    }
};

// 파일 상태 타입 정의
type FileStatus = 'ADDED' | 'DELETED' | 'MODIFIED' | 'UNCHANGED' | 'single';
type DisplayFileStatus = 'itemA_only' | 'itemB_only' | 'modified' | 'identical' | 'single';


const ResourceViewModal: React.FC<ResourceViewModalProps> = ({ type, items, onClose }) => {
  const resourceTypes = ["Web ACLs", "IP Sets", "Regex pattern", "Rule Groups"];
  const [activeTab, setActiveTab] = useState(resourceTypes[0]);
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [showChangedOnly, setShowChangedOnly] = useState(false);
  const [fileList, setFileList] = useState<{name: string, status: DisplayFileStatus}[]>([]);
  const [contentA, setContentA] = useState<string | null>(null);
  const [contentB, setContentB] = useState<string | null>(null);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [loadingContent, setLoadingContent] = useState(false);

  const isCompare = type === 'compare' || type === 'restore' || type === 'manual_backup';

  const { itemA, itemB } = useMemo(() => {
    if (!isCompare) return { itemA: items[0], itemB: null };

    // 'live' 또는 'current'가 있으면 항상 itemB로 설정
    const liveItem = items.find(item => item.id === 'live' || item.id === 'current');
    if (liveItem) {
        const backupItem = items.find(item => item.id !== 'live' && item.id !== 'current');
        return { itemA: backupItem || items[0], itemB: liveItem }; // backupItem이 없는 경우 대비
    }

    // 그 외에는 순서대로
    return { itemA: items[0], itemB: items[1] };
  }, [items, isCompare]);


  useEffect(() => {
    const fetchFiles = async () => {
        if (!itemA) return;
        setLoadingFiles(true);
        setActiveFile(null); // 탭 변경 시 선택된 파일 초기화
        try {
            const apiResourceType = mapTabToApiResourceType(activeTab);
            if (!apiResourceType) {
                setFileList([]);
                return;
            };

            if (isCompare && itemB) {
                const diffStatusList: WafRuleDiffStatus[] = await BackupService.getDiffStatus(itemA.id, itemB.id === 'live' ? undefined : itemB.id);

                const files = diffStatusList
                    .filter(d => d.resourceType === apiResourceType)
                    .map(diff => {
                        // API 상태를 디자인 시스템의 상태로 매핑
                        let displayStatus: DisplayFileStatus;
                        switch (diff.status) {
                            case 'DELETED': displayStatus = 'itemA_only'; break;
                            case 'ADDED': displayStatus = 'itemB_only'; break;
                            case 'MODIFIED': displayStatus = 'modified'; break;
                            case 'UNCHANGED': displayStatus = 'identical'; break;
                            default: displayStatus = 'single';
                        }
                        return { name: diff.fileName, status: displayStatus };
                    });
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
            setLoadingFiles(false);
        }
    };
    fetchFiles();
  }, [activeTab, itemA, itemB, isCompare]);

 useEffect(() => {
    const fetchContent = async () => {
        if (!activeFile || !itemA) return;
        setLoadingContent(true);
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
        } finally {
            setLoadingContent(false);
        }
    };
    if (activeFile) {
        fetchContent();
    } else {
        setContentA(null);
        setContentB(null);
    }
  }, [activeFile]);


  const modalTitle = useMemo(() => {
    if (type === 'restore') return 'WAF Rule 복원';
    if (type === 'manual_backup') return 'WAF Rule 비교 (백업 생성)';
    if (type === 'compare') return 'WAF Rule 비교';
    return 'WAF Rule 백업 조회';
  }, [type]);

  // Diff 하이라이팅 로직 (디자인 시스템 버전 기반)
  const highlightDiffs = (textA: string | null, textB: string | null) => {
      if (textA === null && textB === null) return null;

      const linesA = textA?.split('\n') || [];
      const linesB = textB?.split('\n') || [];
      const maxLen = Math.max(linesA.length, linesB.length);
      const diffResult = [];

      for (let i = 0; i < maxLen; i++) {
          const lineA = linesA[i];
          const lineB = linesB[i];

          if (lineA !== undefined && lineA === lineB) {
              diffResult.push({ type: 'common', line: lineA, aNum: i + 1, bNum: i + 1 });
          } else {
              if (lineA !== undefined) {
                  diffResult.push({ type: 'removed', line: lineA, aNum: i + 1 });
              }
              if (lineB !== undefined) {
                  diffResult.push({ type: 'added', line: lineB, bNum: i + 1 });
              }
          }
      }
      // This simple line-by-line diff is not perfect. For a real implementation, a proper diffing library (like diff-match-patch or jsdiff) would be much better.
      // For this case, we will just mark lines that don't have an identical counterpart at the same line number.
      const contentAWithDiff = linesA.map((line, i) => (
          <div key={`a-${i}`} className={`code-line ${linesB[i] === line ? '' : 'diff-removed'}`}>{line || ' '}</div>
      ));
      const contentBWithDiff = linesB.map((line, i) => (
          <div key={`b-${i}`} className={`code-line ${linesA[i] === line ? '' : 'diff-added'}`}>{line || ' '}</div>
      ));

      return { contentAWithDiff, contentBWithDiff };
  };

  const diffResult = isCompare ? highlightDiffs(contentA, contentB) : null;


  const getItemTitle = (item?: ResourceViewItem | null) => {
    if (!item) return '';
    const { id, status } = item;
    if (id === 'current' || id === 'live') return '현재 적용중 (Live)';
    const isApplied = status === 'APPLIED';
    return isApplied ? `최종 백업 (${id})` : `백업 (${id})`;
  }

  const renderContentPane = (title: string, content: React.ReactNode, isLoading: boolean) => {
    return (
        <div className="content-pane">
            <h4 className="content-pane-title">{title}</h4>
            <div className={`json-viewer-container ${!content && !isLoading ? 'empty' : ''}`}>
                {isLoading ? (
                    <div className="empty-state"><div className="loading-spinner"></div></div>
                ) : content ? (
                    <div className="code-viewer-with-diff">{content}</div>
                ) : (
                    <div className="empty-state">
                        <div className="empty-state-content">
                            <div className="empty-icon">📄</div>
                            <h4>{activeFile ? '내용 없음' : '파일 선택'}</h4>
                            <p>{activeFile ? '이 형상에는 해당 파일이 존재하지 않습니다.' : '좌측 목록에서 비교할 파일을 선택하세요.'}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
  };

  const ResourceContentHeader = () => {
    if (!activeFile) return <div className="resource-content-header placeholder">파일을 선택하세요</div>;
    const currentFile = fileList.find(f => f.name === activeFile);
    if (!currentFile) return null;

     const statusTextMap: Record<DisplayFileStatus, string> = {
        itemA_only: '삭제됨',
        itemB_only: '추가됨',
        modified: '수정됨',
        identical: '동일',
        single: ''
    };

    return (
      <div className="resource-content-header">
        <div className="file-info-wrapper">
            {isCompare && <span className={`file-status-indicator status-${currentFile.status}`}></span>}
            <span className="file-name">{activeFile}</span>
            {isCompare && (
              <span className="file-status-tag">{statusTextMap[currentFile.status]}</span>
            )}
        </div>
      </div>
    );
  };

  const getFooterButtons = () => {
    if (type === 'restore') {
      return (
        <>
          <button className="btn btn-secondary" onClick={onClose}>닫기</button>
          <button className="btn btn-primary">복원</button>
        </>
      );
    }
    return <button className="btn btn-secondary" onClick={onClose}>닫기</button>;
  };

  const filteredFileList = showChangedOnly
      ? fileList.filter(f => f.status !== 'identical' && f.status !== 'single')
      : fileList;

  // 상태 텍스트를 가져오는 함수
  const getStatusText = (status: DisplayFileStatus): string => {
      const statusTextMap: Record<DisplayFileStatus, string> = {
          itemA_only: '삭제됨',
          itemB_only: '추가됨',
          modified: '수정됨',
          identical: '동일',
          single: ''
      };
      return statusTextMap[status];
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
                    <input type="checkbox" checked={showChangedOnly} onChange={(e) => setShowChangedOnly(e.target.checked)} />
                    <span>변경사항만 보기</span>
                  </label>
                </div>
              )}
              {loadingFiles ? <div className="empty-state"><div className="loading-spinner"></div></div> : (
                  <ul className="file-list">
                    {filteredFileList.map(({ name, status }) => (
                      <li key={name} className={activeFile === name ? 'active' : ''} data-status={status} onClick={() => setActiveFile(name)}>
                        {isCompare && <span className={`file-status-indicator status-${status}`}></span>}
                        <span className="file-name">{name}</span>
                        {/* 요청하신 status tag 추가 */}
                        {isCompare && <span className="file-status-tag">{getStatusText(status)}</span>}
                      </li>
                    ))}
                  </ul>
              )}
            </aside>

            <div className="resource-main-content">
              <ResourceContentHeader />
              <section className="resource-content">
                {isCompare ? (
                  <>
                    {renderContentPane(getItemTitle(itemA), diffResult?.contentAWithDiff, loadingContent)}
                    {renderContentPane(getItemTitle(itemB), diffResult?.contentBWithDiff, loadingContent)}
                  </>
                ) : (
                  renderContentPane(getItemTitle(itemA), contentA ? <pre className="json-viewer">{contentA}</pre> : null, loadingContent)
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