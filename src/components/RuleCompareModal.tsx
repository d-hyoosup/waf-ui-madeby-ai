// src/components/RuleCompareModal.tsx
import React, { useState, useMemo } from 'react';
import './ModalStyles.css';
import './CodeViewer.css';

interface RuleCompareModalProps {
  selectedBackup?: string;
  onClose: () => void;
}

// 리소스 타입별 파일 구조로 변경
const resourceData = {
  "Web ACLs": {
    backup: {
      "cpx-global_vehicle_cci-hmg_net.json": `{
  "Name": "cpx-global_vehicle_cci-hmg_net",
  "ID": "107370258-1b4b-4df8-8c31-c3c7725e2d6f",
  "ARN": "arn:aws:wafv2:global:123456789012:webacl/cpx...",
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
    current: {
      "cpx-global_vehicle_cci-hmg_net.json": `{
  "Name": "cpx-global_vehicle_cci-hmg_net",
  "ID": "107370258-1b4b-4df8-8c31-c3c7725e2d6f",
  "ARN": "arn:aws:wafv2:global:123456789012:webacl/cpx...",
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
      "new-current-file.json": `{
  "Name": "new-current-webacl",
  "ID": "new-123456789",
  "Capacity": 1.0,
  "DefaultAction": { "Allow": {} },
  "Rules": []
}`
    }
  },
  "IP Sets": {
    backup: {
      "allowed-ips.json": `{
  "IPSet": {
    "Name": "AllowedIPs",
    "Id": "a1b2c3d4-5678-90ab-cdef-123456789012",
    "ARN": "arn:aws:wafv2:us-east-1:123456789012:ipset/AllowedIPs/a1b2c3d4",
    "Scope": "REGIONAL",
    "IPAddressVersion": "IPV4",
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
    "Id": "blocked-123-456-789",
    "Scope": "REGIONAL",
    "IPAddressVersion": "IPV4",
    "Addresses": [
      "198.51.100.0/24",
      "203.0.113.100/32"
    ]
  }
}`,
      "backup-only-ips.json": `{
  "IPSet": {
    "Name": "BackupOnlyIPs",
    "Id": "backup-only-123",
    "Scope": "REGIONAL",
    "IPAddressVersion": "IPV4",
    "Addresses": [
      "172.20.0.0/16"
    ]
  }
}`
    },
    current: {
      "allowed-ips.json": `{
  "IPSet": {
    "Name": "AllowedIPs",
    "Id": "a1b2c3d4-5678-90ab-cdef-123456789012",
    "ARN": "arn:aws:wafv2:us-east-1:123456789012:ipset/AllowedIPs/a1b2c3d4",
    "Scope": "REGIONAL",
    "IPAddressVersion": "IPV4",
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
    "Id": "blocked-123-456-789",
    "Scope": "REGIONAL",
    "IPAddressVersion": "IPV4",
    "Addresses": [
      "198.51.100.0/24",
      "203.0.113.100/32",
      "192.0.2.0/24"
    ]
  }
}`
    }
  },
  "Regex pattern sets": {
    backup: {
      "bad-user-agents.json": `{
  "RegexPatternSet": {
    "Name": "BadUserAgents",
    "Id": "regex-12345678-abcd-efgh-ijkl-123456789012",
    "ARN": "arn:aws:wafv2:us-east-1:123456789012:regexpatternset/BadUserAgents",
    "Scope": "REGIONAL",
    "RegularExpressionList": [
      "(?i)(bot|crawl|spider)",
      "badagent.*",
      "test.*user"
    ]
  }
}`
    },
    current: {
      "bad-user-agents.json": `{
  "RegexPatternSet": {
    "Name": "BadUserAgents",
    "Id": "regex-12345678-abcd-efgh-ijkl-123456789012",
    "ARN": "arn:aws:wafv2:us-east-1:123456789012:regexpatternset/BadUserAgents",
    "Scope": "REGIONAL",
    "RegularExpressionList": [
      "(?i)(bot|crawl|spider)",
      "badagent.*"
    ]
  }
}`
    }
  },
  "Rule groups": {
    backup: {
      "custom-rule-group.json": `{
  "RuleGroup": {
    "Name": "CustomRuleGroup",
    "Id": "rg-12345678-abcd-efgh-ijkl-123456789012",
    "ARN": "arn:aws:wafv2:us-east-1:123456789012:rulegroup/CustomRuleGroup",
    "Scope": "REGIONAL",
    "Capacity": 500,
    "Rules": [
      {
        "Name": "BlockSQLInjection",
        "Priority": 1,
        "Statement": {
          "SqliMatchStatement": {
            "FieldToMatch": { "Body": {} },
            "TextTransformations": [
              { "Type": "URL_DECODE" },
              { "Type": "HTML_ENTITY_DECODE" }
            ]
          }
        },
        "Action": { "Block": {} }
      }
    ]
  }
}`,
      "admin-rule-group.json": `{
  "RuleGroup": {
    "Name": "AdminRuleGroup",
    "Id": "admin-rg-789",
    "Scope": "REGIONAL",
    "Capacity": 200,
    "Rules": [
      {
        "Name": "AdminPathProtection",
        "Priority": 1,
        "Statement": {
          "ByteMatchStatement": {
            "FieldToMatch": { "UriPath": {} },
            "PositionalConstraint": "STARTS_WITH",
            "SearchString": "/admin"
          }
        },
        "Action": { "Block": {} }
      }
    ]
  }
}`
    },
    current: {
      "custom-rule-group.json": `{
  "RuleGroup": {
    "Name": "CustomRuleGroup",
    "Id": "rg-12345678-abcd-efgh-ijkl-123456789012",
    "ARN": "arn:aws:wafv2:us-east-1:123456789012:rulegroup/CustomRuleGroup",
    "Scope": "REGIONAL",
    "Capacity": 700,
    "Rules": [
      {
        "Name": "BlockSQLInjection",
        "Priority": 1,
        "Statement": {
          "SqliMatchStatement": {
            "FieldToMatch": { "Body": {} },
            "TextTransformations": [
              { "Type": "URL_DECODE" },
              { "Type": "HTML_ENTITY_DECODE" },
              { "Type": "LOWERCASE" }
            ]
          }
        },
        "Action": { "Block": {} }
      }
    ]
  }
}`,
      "admin-rule-group.json": `{
  "RuleGroup": {
    "Name": "AdminRuleGroup",
    "Id": "admin-rg-789",
    "Scope": "REGIONAL",
    "Capacity": 200,
    "Rules": [
      {
        "Name": "AdminPathProtection",
        "Priority": 1,
        "Statement": {
          "ByteMatchStatement": {
            "FieldToMatch": { "UriPath": {} },
            "PositionalConstraint": "STARTS_WITH",
            "SearchString": "/admin"
          }
        },
        "Action": { "Allow": {} }
      }
    ]
  }
}`
    }
  }
};

const RuleCompareModal: React.FC<RuleCompareModalProps> = ({ selectedBackup, onClose }) => {
  const [activeResource, setActiveResource] = useState<string>("Web ACLs");
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const resources = Object.keys(resourceData);
  const backupId = selectedBackup || '20250112-150430';

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
  }, [activeResource]);

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
    return source[activeFile as keyof typeof source] || '';
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