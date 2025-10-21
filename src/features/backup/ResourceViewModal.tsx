// src/features/backup/ResourceViewModal.tsx
import React, { useState, useMemo, useEffect } from 'react';
import '../../components/styles/ModalStyles.css';
import './ResourceViewModal.css';
import '../../components/styles/CodeViewer.css'; // Diff 스타일을 위해 추가
import { BackupService } from '../../api';
import type { BackupStatus, WafRuleDiffStatus, WafRuleResourceFile } from '../../types/api.types';

// Props 타입 정의
interface ResourceViewItem {
  id: string; // snapshotId or 'live'/'current'
  status: BackupStatus;
  scopeId?: string;
}

interface ResourceViewModalProps {
  type: 'view' | 'compare' | 'restore' | 'manual_backup';
  items: ResourceViewItem[];
  onClose: () => void;
}

// UI 표시용 상태 타입 정의
type DisplayFileStatus = 'itemA_only' | 'itemB_only' | 'modified' | 'identical' | 'single';

// 모든 파일 정보를 저장하기 위한 타입
interface FileInfo {
    name: string;
    status: DisplayFileStatus;
    resourceType: string; // 어떤 리소스 타입(WEB_ACL 등)에 속하는지 저장
}

// API 리소스 타입과 탭 이름 매핑
const apiResourceTypeMap: Record<string, string> = {
    "WEB_ACL": "Web ACLs",
    "IP_SET": "IP Sets",
    "REGEX_PATTERN_SET": "Regex pattern",
    "RULE_GROUP": "Rule Groups",
};
const tabToApiResourceTypeMap: Record<string, string> = Object.fromEntries(
    Object.entries(apiResourceTypeMap).map(([api, tab]) => [tab, api])
);
const mapTabToApiResourceType = (tabName: string): string => tabToApiResourceTypeMap[tabName] || "";
// const mapApiResourceTypeToTab = (apiType: string): string => apiResourceTypeMap[apiType] || ""; // 필요 시 사용


const ResourceViewModal: React.FC<ResourceViewModalProps> = ({ type, items, onClose }) => {
  const resourceTypes = ["Web ACLs", "IP Sets", "Regex pattern", "Rule Groups"]; // 탭 순서
  const [activeTab, setActiveTab] = useState(resourceTypes[0]);
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [showChangedOnly, setShowChangedOnly] = useState(false);
  // ✅ [수정] 모든 파일 정보를 저장할 상태 추가
  const [allFilesData, setAllFilesData] = useState<FileInfo[]>([]);
  // ✅ [수정] 현재 탭에 해당하는 파일 목록 (필터링된 결과)
  const [currentTabFileList, setCurrentTabFileList] = useState<FileInfo[]>([]);
  const [contentA, setContentA] = useState<string | null>(null);
  const [contentB, setContentB] = useState<string | null>(null);
  const [loadingFiles, setLoadingFiles] = useState(true); // 초기 로딩 상태 true
  const [loadingContent, setLoadingContent] = useState(false);

  const isCompare = type === 'compare' || type === 'restore' || type === 'manual_backup';

  const { itemA, itemB } = useMemo(() => {
    // 이전 로직과 동일
    if (!isCompare || items.length < 1) return { itemA: items[0], itemB: null };
    const liveItemIndex = items.findIndex(item => item.id === 'live' || item.id === 'current');
    if (liveItemIndex !== -1) {
        const liveItem = items[liveItemIndex];
        const backupItem = items[1 - liveItemIndex];
        return { itemA: backupItem || items[0], itemB: liveItem };
    }
    return { itemA: items[0], itemB: items.length > 1 ? items[1] : null };
  }, [items, isCompare]);


  // ✅ [수정] API 호출 로직: 모달이 열리거나 itemA, itemB가 변경될 때만 실행
  useEffect(() => {
    const fetchAllFilesAndDiffs = async () => {
        if (!itemA) {
            setLoadingFiles(false);
            return;
        };
        setLoadingFiles(true);
        setActiveFile(null); // 비교 대상 변경 시 선택 파일 초기화
        setContentA(null);
        setContentB(null);
        setAllFilesData([]); // 이전 데이터 초기화

        try {
            // 1. 기준(itemA)의 모든 리소스 타입에 대한 전체 파일 목록 가져오기
            const allFilesResponse: WafRuleResourceFile[] = await BackupService.getSnapshotFiles(itemA.id);

            // 초기 파일 목록 생성 (Map 사용)
            let filesMap = new Map<string, FileInfo>(); // Key: resourceType/fileName
            allFilesResponse.forEach(resource => {
                resource.files.forEach(fileName => {
                    const key = `${resource.resourceType}/${fileName}`;
                    filesMap.set(key, {
                        name: fileName,
                        status: isCompare ? 'identical' : 'single',
                        resourceType: resource.resourceType // API 리소스 타입 저장
                    });
                });
            });

            // 2. 비교 대상(itemB)이 있으면 모든 리소스 타입에 대한 diff 정보 가져오기
            if (isCompare && itemB) {
                const diffStatusList: WafRuleDiffStatus[] = await BackupService.getDiffStatus(
                    itemA.id,
                    itemB.id === 'live' ? undefined : itemB.id
                );

                diffStatusList.forEach(diff => {
                    const key = `${diff.resourceType}/${diff.fileName}`;
                    let displayStatus: DisplayFileStatus;
                    switch (diff.status) {
                        case 'DELETED': // itemA 에만 있음
                            displayStatus = 'itemA_only';
                            if (filesMap.has(key)) {
                                filesMap.get(key)!.status = displayStatus;
                            } else {
                                console.warn(`Diff reported DELETED file '${key}' not found in base snapshot files.`);
                            }
                            break;
                        case 'ADDED': // itemB 에만 있음
                            displayStatus = 'itemB_only';
                            // ADDED된 파일도 filesMap에 추가
                            filesMap.set(key, {
                                name: diff.fileName,
                                status: displayStatus,
                                resourceType: diff.resourceType
                            });
                            break;
                        case 'MODIFIED': // 양쪽 모두 존재하며 내용 다름
                            displayStatus = 'modified';
                            if (filesMap.has(key)) {
                                filesMap.get(key)!.status = displayStatus;
                            } else {
                                console.warn(`Diff reported MODIFIED file '${key}' not found in base snapshot files, adding.`);
                                // 수정된 파일이 base에 없는 경우 추가 (방어 코드)
                                filesMap.set(key, { name: diff.fileName, status: displayStatus, resourceType: diff.resourceType });
                            }
                            break;
                        // UNCHANGED 는 diff API 에서 반환되지 않는다고 가정
                    }
                });
            }
             // Map을 배열로 변환하여 최종 allFilesData 설정
            setAllFilesData(Array.from(filesMap.values()));

        } catch (error) {
            console.error("Failed to fetch all files and diff status", error);
            setAllFilesData([]); // 에러 시 초기화
        } finally {
            setLoadingFiles(false);
        }
    };
    fetchAllFilesAndDiffs();
  // itemA, itemB, isCompare 가 변경될 때만 API 호출
  }, [itemA, itemB, isCompare]);

  // ✅ [수정] 탭 전환 또는 전체 데이터 로딩 완료 시 현재 탭 파일 목록 필터링
  useEffect(() => {
      const apiResourceType = mapTabToApiResourceType(activeTab);
      if (apiResourceType) {
          const filtered = allFilesData.filter(file => file.resourceType === apiResourceType);
          setCurrentTabFileList(filtered);
          // 탭 전환 시 선택된 파일 초기화
          setActiveFile(null);
          setContentA(null);
          setContentB(null);
      } else {
          setCurrentTabFileList([]); // 유효하지 않은 탭이면 빈 목록
      }
  // allFilesData 또는 activeTab이 변경될 때 실행
  }, [allFilesData, activeTab]);


 // 파일 내용 가져오는 로직 (activeFile, itemA, itemB, isCompare 변경 시 실행)
 useEffect(() => {
    const fetchContent = async () => {
        if (!activeFile || !itemA) return;
        setLoadingContent(true);
        setContentA(null);
        setContentB(null);
        try {
            // 현재 활성화된 파일 정보 찾기 (resourceType 확인용)
            const currentFile = allFilesData.find(f => f.name === activeFile && mapTabToApiResourceType(activeTab) === f.resourceType);
            if (!currentFile) {
                console.warn(`Active file ${activeFile} not found in allFilesData for tab ${activeTab}`);
                return; // 파일 정보 없으면 중단
            }
            const resourceType = currentFile.resourceType; // API resourceType 사용

            if (isCompare && itemB) {
                const { base, target } = await BackupService.getFileContentPair(
                    itemA.id,
                    resourceType,
                    activeFile,
                    itemB.id === 'live' ? undefined : itemB.id
                );
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
  // activeFile이 변경되거나 비교 대상이 바뀌면 내용을 다시 가져옴
  }, [activeFile, itemA, itemB, isCompare, allFilesData, activeTab]); // allFilesData, activeTab 추가


  const modalTitle = useMemo(() => { /* 이전과 동일 */
    if (type === 'restore') return 'WAF Rule 복원 비교';
    if (type === 'manual_backup') return 'WAF Rule 비교 (백업 생성 전)';
    if (type === 'compare') return 'WAF Rule 비교';
    return 'WAF Rule 백업 조회';
  }, [type]);

  // Diff 하이라이팅 로직 (이전과 동일)
  const highlightDiffs = (textA: string | null, textB: string | null) => {
      // ... (이전 코드와 동일) ...
      if (!isCompare) return null;
      if (textA === null && textB === null) return { contentAWithDiff: null, contentBWithDiff: null };
      const linesA = textA?.split('\n') || [];
      const linesB = textB?.split('\n') || [];
      const lenA = linesA.length;
      const lenB = linesB.length;
      const maxLen = Math.max(lenA, lenB);
      const contentAWithDiff: JSX.Element[] = [];
      const contentBWithDiff: JSX.Element[] = [];
      for (let i = 0; i < maxLen; i++) {
          const lineA = i < lenA ? linesA[i] : undefined;
          const lineB = i < lenB ? linesB[i] : undefined;
          if (lineA !== undefined && lineA === lineB) {
              contentAWithDiff.push(<div key={`a-${i}`} className="code-line">{lineA || ' '}</div>);
              contentBWithDiff.push(<div key={`b-${i}`} className="code-line">{lineB || ' '}</div>);
          } else {
              if (lineA !== undefined) {
                  contentAWithDiff.push(<div key={`a-${i}`} className="code-line diff-removed">{lineA || ' '}</div>);
              } else if (lineB !== undefined) {
                 contentAWithDiff.push(<div key={`a-${i}-placeholder`} className="code-line placeholder"> </div>);
             }
             if (lineB !== undefined) {
                 contentBWithDiff.push(<div key={`b-${i}`} className="code-line diff-added">{lineB || ' '}</div>);
             } else if (lineA !== undefined) {
                 contentBWithDiff.push(<div key={`b-${i}-placeholder`} className="code-line placeholder"> </div>);
             }
          }
      }
      return { contentAWithDiff, contentBWithDiff };
  };

  const diffResult = highlightDiffs(contentA, contentB);

  const getItemTitle = (item?: ResourceViewItem | null) => { /* 이전과 동일 */
    if (!item) return '';
    const { id } = item;
    if (id === 'current' || id === 'live') return '현재 적용중 (Live)';
    return `백업 (${id})`;
  }

  const renderContentPane = (title: string, content: React.ReactNode, isLoading: boolean, isEmptyFile: boolean) => { /* 이전과 동일 */
    return (
        <div className="content-pane">
            <h4 className="content-pane-title">{title}</h4>
            <div className={`json-viewer-container ${!content && !isLoading && !isEmptyFile ? 'empty' : ''} ${!isCompare ? 'single-view' : ''}`}>
                {isLoading ? (
                    <div className="empty-state"><div className="loading-spinner"></div><p>로딩 중...</p></div>
                ) : content ? (
                    <div className="code-viewer-with-diff">{content}</div>
                ) : isEmptyFile && activeFile ? (
                    <div className="empty-state">
                        <div className="empty-state-content">
                            <div className="empty-icon">📄</div>
                            <h4>내용 없음</h4>
                            <p>이 파일은 존재하지만 내용이 비어있습니다.</p>
                        </div>
                    </div>
                 ) : (
                    <div className="empty-state">
                        <div className="empty-state-content">
                            <div className="empty-icon">🧐</div>
                            <h4>{activeFile ? '파일 없음' : '파일 선택'}</h4>
                            <p>{activeFile ? '이 형상에는 해당 파일이 존재하지 않습니다.' : '좌측 목록에서 비교할 파일을 선택하세요.'}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
  };

  const ResourceContentHeader = () => { /* 이전과 동일 */
    if (!activeFile) return <div className="resource-content-header placeholder">파일을 선택하세요</div>;
    // ✅ [수정] currentTabFileList 에서 현재 파일 정보 찾기
    const currentFile = currentTabFileList.find(f => f.name === activeFile);
    if (!currentFile && !loadingFiles) return <div className="resource-content-header placeholder">파일 정보를 찾을 수 없습니다.</div>;
    if (!currentFile && loadingFiles) return <div className="resource-content-header placeholder">파일 목록 로딩 중...</div>;
    if (!currentFile) return null;

     const statusTextMap: Record<DisplayFileStatus, string> = {
        itemA_only: `${getItemTitle(itemA)} 에만 존재`,
        itemB_only: `${getItemTitle(itemB)} 에만 존재`,
        modified: '수정됨',
        identical: '동일',
        single: ''
    };

    return (
      <div className="resource-content-header">
        <div className="file-info-wrapper">
            {isCompare && <span className={`file-status-indicator status-${currentFile.status}`} title={statusTextMap[currentFile.status]}></span>}
            <span className="file-name" title={activeFile}>{activeFile}</span>
            {isCompare && currentFile.status !== 'single' && (
              <span className={`file-status-tag status-tag-${currentFile.status}`}>{statusTextMap[currentFile.status]}</span>
            )}
        </div>
      </div>
    );
  };

  const handleRestore = async () => { /* 이전과 동일 */
       if (!itemA || itemA.id === 'live' || itemA.id === 'current') {
           alert('백업본을 선택해야 복원을 진행할 수 있습니다.');
           return;
       }
        if (window.confirm(`선택한 백업 '${itemA.id}'으로 복원하시겠습니까? 이 작업은 Jira 승인 프로세스를 시작합니다.`)) {
            setLoadingContent(true);
            try {
                await BackupService.rollback(itemA.id);
                alert('복원 요청(Jira 이슈 생성)이 시작되었습니다. Jira에서 승인 절차를 진행해주세요.');
                onClose();
                // TODO: 부모 컴포넌트에서 목록 새로고침 트리거 (예: onClose(true))
            } catch (error: any) {
                 console.error("Rollback request failed:", error);
                 alert(`복원 요청에 실패했습니다: ${error?.metaInfo?.message || error?.message || 'Unknown error'}`);
            } finally {
                setLoadingContent(false);
            }
        }
  };

  const getFooterButtons = () => { /* 이전과 동일 */
    if (type === 'restore' && itemA && itemA.id !== 'live' && itemA.id !== 'current') {
      return (
        <>
          <button className="btn btn-secondary" onClick={onClose} disabled={loadingContent}>닫기</button>
          <button className="btn btn-primary" onClick={handleRestore} disabled={loadingContent || loadingFiles}>
            {loadingContent ? '처리 중...' : '복원 요청'}
          </button>
        </>
      );
    }
    return <button className="btn btn-secondary" onClick={onClose} disabled={loadingContent}>닫기</button>;
  };

   // ✅ [수정] 필터링 로직: currentTabFileList 사용
   const filteredCurrentTabFileList = showChangedOnly && isCompare
       ? currentTabFileList.filter(f => f.status !== 'identical')
       : currentTabFileList;

  // 상태 텍스트 가져오는 함수 (파일 목록 내 태그용) - 이전과 동일
   const getStatusTagText = (status: DisplayFileStatus): string => {
       const statusTextMap: Record<DisplayFileStatus, string> = {
           itemA_only: 'A Only',
           itemB_only: 'B Only',
           modified: '수정',
           identical: '동일',
           single: ''
       };
       return statusTextMap[status];
   };


  return (
    <div className="modal-overlay">
      {/* 모달 컨텐츠 구조는 이전과 동일 */}
      <div className="modal-content modal-lg resource-view-modal-content">
        <header className="modal-header">
          <h3>{modalTitle}</h3>
          <button className="close-button" onClick={onClose} aria-label="Close modal">&times;</button>
        </header>

        <main className="modal-body resource-view-body">
          <div className="resource-tabs">
            {resourceTypes.map(tabType => (
              <button
                key={tabType}
                className={`resource-tab ${activeTab === tabType ? 'active' : ''}`}
                onClick={() => setActiveTab(tabType)}
                // ✅ [수정] 초기 전체 파일 로딩 중에도 탭 비활성화
                disabled={loadingFiles}
              >
                {tabType}
              </button>
            ))}
          </div>

          <div className="resource-content-wrapper">
            <aside className="file-list-panel">
              {isCompare && (
                <div className="filter-checkbox">
                  <label>
                    <input type="checkbox" checked={showChangedOnly} onChange={(e) => setShowChangedOnly(e.target.checked)} />
                    <span>변경사항만 보기</span>
                  </label>
                </div>
              )}
              {/* ✅ [수정] 로딩 상태 표시: 초기 로딩(loadingFiles) 시 */}
              {loadingFiles ? (
                    <div className="empty-state compact">
                        <div className="loading-spinner small"></div>
                        <span>파일 목록 로딩 중...</span>
                    </div>
              // ✅ [수정] 필터링된 현재 탭 목록(filteredCurrentTabFileList) 사용
              ) : filteredCurrentTabFileList.length === 0 ? (
                     <div className="empty-state compact">
                         <span className="empty-icon small">🤷</span>
                         <span>{showChangedOnly ? '변경된 파일 없음' : '파일 없음'}</span>
                    </div>
                ) : (
                  <ul className="file-list">
                    {/* ✅ [수정] filteredCurrentTabFileList 사용 */}
                    {filteredCurrentTabFileList.map(({ name, status }) => (
                      <li
                        key={name}
                        className={activeFile === name ? 'active' : ''}
                        data-status={status}
                        onClick={() => setActiveFile(name)}
                        title={name}
                       >
                        {isCompare && <span className={`file-status-indicator status-${status}`} title={getStatusTagText(status)}></span>}
                        <span className="file-name">{name}</span>
                        {isCompare && status !== 'single' && (
                          <span className={`file-status-tag status-tag-${status}`}>{getStatusTagText(status)}</span>
                        )}
                      </li>
                    ))}
                  </ul>
              )}
            </aside>

            {/* 메인 컨텐츠 영역은 이전과 동일 */}
            <div className="resource-main-content">
              <ResourceContentHeader />
              <section className="resource-content">
                {isCompare ? (
                  <>
                    {renderContentPane(getItemTitle(itemA), diffResult?.contentAWithDiff, loadingContent, contentA === null && !loadingContent)}
                    {renderContentPane(getItemTitle(itemB), diffResult?.contentBWithDiff, loadingContent, contentB === null && !loadingContent)}
                  </>
                ) : (
                  renderContentPane(getItemTitle(itemA), contentA ? <pre className="json-viewer">{contentA}</pre> : null, loadingContent, contentA === null && !loadingContent)
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