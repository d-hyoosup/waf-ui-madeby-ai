// src/components/SnapshotDetailModal.tsx
import React, { useState, useMemo } from 'react';
import './ModalStyles.css';
import './CodeViewer.css';

interface SnapshotDetailModalProps {
  type: 'view' | 'compare' | 'restore';
  items: string[];
  onClose: () => void;
}

// 백업별 리소스 데이터 - 파일 구조로 개선
const backupResourceData: { [backupId: string]: { [resourceType: string]: { [fileName: string]: string } } } = {
  "20250112-150430": {
    "Web ACLs": {
      "cpx-global_vehicle_cci-hmg_net.json": `{
  "Name": "cpx-global_vehicle_cci-hmg_net",
  "ID": "107370258-1b4b-4df8-8c31-c3c7725e2d6f",
  "Capacity": 1.44371701984,
  "DefaultAction": { "Allow": {} },
  "Rules": [
    {
      "Name": "lcs.auth.countbridge",
      "Priority": 0,
      "Statement": {
        "ByteMatchStatement": {
          "FieldToMatch": { "UriPath": {} },
          "PositionalConstraint": "CONTAINS",
          "SearchString": "countbridge",
          "TextTransformations": [ { "Type": "NONE" } ]
        }
      },
      "Action": { "Block": {} },
      "VisibilityConfig": { 
        "CloudWatchMetricsEnabled": true,
        "MetricName": "countbridge-rule",
        "SampledRequestsEnabled": false
      }
    }
  ]
}`,
      "security-rules-webacl.json": `{
  "Name": "security-rules-webacl",
  "ID": "sec-456789-abcd-efgh-ijkl",
  "Capacity": 2.5,
  "DefaultAction": { "Block": {} },
  "Rules": [
    {
      "Name": "rate.limit.rule",
      "Priority": 1,
      "Statement": {
        "RateBasedStatement": {
          "Limit": 10000,
          "AggregateKeyType": "IP"
        }
      },
      "Action": { "Block": {} }
    }
  ]
}`,
      "backup-only-webacl.json": `{
  "Name": "backup-only-webacl",
  "ID": "backup-only-123",
  "Capacity": 1.0,
  "DefaultAction": { "Allow": {} },
  "Rules": []
}`
    },
    "IP Sets": {
      "allowed-ips.json": `{
  "IPSet": {
    "Name": "AllowedIPs",
    "Addresses": [
      "192.168.1.0/24",
      "10.0.0.0/8",
      "203.0.113.0/24"
    ]
  }
}`,
      "blocked-ips.json": `{
  "IPSet": {
    "Name": "BlockedIPs",
    "Addresses": [
      "198.51.100.0/24",
      "203.0.113.100/32"
    ]
  }
}`
    },
    "Regex pattern sets": {
      "user-agent-patterns.json": `{
  "RegexPatternSet": {
    "Name": "UserAgentPatterns",
    "RegularExpressionList": [
      "(?i)(bot|crawl|spider)",
      "badagent.*"
    ]
  }
}`
    },
    "Rule groups": {
      "security-rule-group.json": `{
  "RuleGroup": {
    "Name": "SecurityRuleGroup",
    "Capacity": 300,
    "Rules": [
      {
        "Name": "XSSProtection",
        "Priority": 1,
        "Action": { "Block": {} }
      }
    ]
  }
}`
    }
  },
  "20241223-112030": {
    "Web ACLs": {
      "cpx-global_vehicle_cci-hmg_net.json": `{
  "Name": "cpx-global_vehicle_cci-hmg_net",
  "ID": "107370258-1b4b-4df8-8c31-c3c7725e2d6f",
  "Capacity": 1.44371701984,
  "DefaultAction": { "Allow": {} },
  "Rules": [
    {
      "Name": "lcs.auth.countbridge",
      "Priority": 0,
      "Statement": {
        "ByteMatchStatement": {
          "FieldToMatch": { "UriPath": {} },
          "PositionalConstraint": "CONTAINS",
          "SearchString": "countbridgevehicle",
          "TextTransformations": [ { "Type": "NONE" } ]
        }
      },
      "Action": { "Allow": {} },
      "VisibilityConfig": { 
        "CloudWatchMetricsEnabled": true,
        "MetricName": "countbridge-rule-updated",
        "SampledRequestsEnabled": true
      }
    }
  ]
}`,
      "security-rules-webacl.json": `{
  "Name": "security-rules-webacl",
  "ID": "sec-456789-abcd-efgh-ijkl",
  "Capacity": 3.2,
  "DefaultAction": { "Block": {} },
  "Rules": [
    {
      "Name": "rate.limit.rule",
      "Priority": 1,
      "Statement": {
        "RateBasedStatement": {
          "Limit": 5000,
          "AggregateKeyType": "IP"
        }
      },
      "Action": { "Block": {} }
    },
    {
      "Name": "geo.block.rule",
      "Priority": 2,
      "Statement": {
        "GeoMatchStatement": {
          "CountryCodes": ["CN", "RU"]
        }
      },
      "Action": { "Block": {} }
    }
  ]
}`,
      "newer-backup-only.json": `{
  "Name": "newer-backup-webacl",
  "ID": "newer-123456",
  "Capacity": 0.5,
  "DefaultAction": { "Block": {} },
  "Rules": []
}`
    },
    "IP Sets": {
      "allowed-ips.json": `{
  "IPSet": {
    "Name": "AllowedIPs",
    "Addresses": [
      "192.168.1.0/24",
      "10.0.0.0/8",
      "203.0.113.0/24",
      "172.16.0.0/16"
    ]
  }
}`,
      "blocked-ips.json": `{
  "IPSet": {
    "Name": "BlockedIPs",
    "Addresses": [
      "198.51.100.0/24",
      "203.0.113.100/32",
      "192.0.2.0/24"
    ]
  }
}`
    },
    "Regex pattern sets": {
      "user-agent-patterns.json": `{
  "RegexPatternSet": {
    "Name": "UserAgentPatterns",
    "RegularExpressionList": [
      "(?i)(bot|crawl|spider)",
      "badagent.*",
      "malicious.*pattern"
    ]
  }
}`
    },
    "Rule groups": {
      "security-rule-group.json": `{
  "RuleGroup": {
    "Name": "SecurityRuleGroup",
    "Capacity": 450,
    "Rules": [
      {
        "Name": "XSSProtection",
        "Priority": 1,
        "Action": { "Block": {} }
      },
      {
        "Name": "SQLInjectionProtection",
        "Priority": 2,
        "Action": { "Block": {} }
      }
    ]
  }
}`
    }
  }
};


const SnapshotDetailModal: React.FC<SnapshotDetailModalProps> = ({ type, items, onClose }) => {
  const resources = ["Web ACLs", "IP Sets", "Regex pattern sets", "Rule groups"];
  const [activeResource, setActiveResource] = useState(resources[0]);
  const [activeFile, setActiveFile] = useState<string | null>(null);

  const modalTitle = {
    view: "백업 상세 조회",
    compare: "백업 비교",
    restore: "백업 복원",
  }[type];

  const isCompare = type === 'compare';

  React.useEffect(() => {
    setActiveFile(null);
  }, [activeResource]);

  const fileListWithStatus = useMemo(() => {
    if (!isCompare || items.length < 2) {
      const files = Object.keys(backupResourceData[items[0]]?.[activeResource] || {});
      return files.map(name => ({ name, status: 'single' as const }));
    }

    const [itemA, itemB] = items;
    const filesA = Object.keys(backupResourceData[itemA]?.[activeResource] || {});
    const filesB = Object.keys(backupResourceData[itemB]?.[activeResource] || {});
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
  }, [activeResource, items, isCompare]);

  const highlightDiffs = (text: string, itemIndex: number) => {
    if (!isCompare || items.length < 2 || !activeFile) {
        return <pre className="json-viewer">{text}</pre>;
    }

    const lines = text.split('\n');
    const otherItemId = items[1 - itemIndex];
    const otherText = activeFile ? getData(otherItemId, activeResource, activeFile) : '';

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

  const getData = (itemId: string, resourceType: string, fileName: string | null) => {
    if (!fileName) return '';
    const resourceFiles = backupResourceData[itemId]?.[resourceType];
    if (!resourceFiles) return `// Resource type "${resourceType}" not found for ${itemId}`;
    return resourceFiles[fileName] || '';
  };

  const renderContentView = (itemId: string, itemIndex: number = 0) => {
    if (!activeFile) {
      return (
        <div className="empty-state">
          <div className="empty-state-content">
            <span className="empty-icon">📄</span>
            <h4>내용을 보려면 파일을 선택하세요.</h4>
            <p>왼쪽 목록에서 리소스 타입과 파일을 선택하면 해당 내용이 여기에 표시됩니다.</p>
          </div>
        </div>
      );
    }

    const fileData = getData(itemId, activeResource, activeFile);

    if (!fileData) {
        return (
            <div className="json-viewer-container">
                <h4>{itemId}</h4>
                <div className="file-info">파일: {activeFile}</div>
                <div className="empty-state">
                    <div className="empty-state-content">
                        <p>이 백업에는 파일이 존재하지 않습니다.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="json-viewer-container">
            <h4>{itemId}</h4>
            <div className="file-info">파일: {activeFile}</div>
            {isCompare ? highlightDiffs(fileData, itemIndex) : <pre className="json-viewer">{fileData}</pre>}
        </div>
    );
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content modal-lg">
        <header className="modal-header">
          <h3>{modalTitle}: {isCompare ? items.join(' vs ') : items[0]}</h3>
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
                {isCompare && items.length === 2 && (
                  <div className="file-status-legend">
                    <span><i className="status-indicator status-itemA-only"></i> {items[0]}</span>
                    <span><i className="status-indicator status-itemB-only"></i> {items[1]}</span>
                    <span><i className="status-indicator status-both"></i> 모두</span>
                  </div>
                )}
              </h5>
              <ul className="file-list">
                {fileListWithStatus.length > 0 ? fileListWithStatus.map(({ name, status }) => (
                  <li key={name} className={activeFile === name ? 'active' : ''} onClick={() => setActiveFile(name)} data-status={status}>
                    {isCompare ? (
                      <>
                        <span className={`file-status-indicator status-${status}`}></span>
                        <span className="file-name">{name}</span>
                        {status === 'itemA_only' && <span className="file-status-tag">A</span>}
                        {status === 'itemB_only' && <span className="file-status-tag">B</span>}
                      </>
                    ) : (
                      <span className="file-name">{name}</span>
                    )}
                  </li>
                )) : (
                  <li className="no-files">파일이 없습니다</li>
                )}
              </ul>
            </div>
          </aside>

          <section className="resource-content">
            {isCompare ? (
              <>
                {renderContentView(items[0], 0)}
                {renderContentView(items[1], 1)}
              </>
            ) : (
                renderContentView(items[0])
            )}
          </section>
        </main>

        <footer className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>닫기</button>
          {type === 'restore' && (
            <button className="btn btn-primary" onClick={() => alert(`${items[0]} 복원을 시작합니다.`)}>이 버전으로 복원</button>
          )}
        </footer>
      </div>
    </div>
  );
};

export default SnapshotDetailModal;