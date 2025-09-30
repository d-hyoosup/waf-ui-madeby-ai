// src/components/TreeView.tsx
import React, { useState } from 'react';
import '../styles/TreeStyles.css';
import type { TreeNodeData } from '../../utils/treeUtils.ts'; // 수정: 타입 임포트

// --- 인터페이스 정의 ---
interface TreeNodeProps {
  node: TreeNodeData;
  level: number;
  checkedPaths: Set<string>;
  expandedPaths: Set<string>;
  onCheckChange: (nodeId: string, checked: boolean) => void;
  onExpandChange: (nodeId: string, expanded: boolean) => void;
  isReadOnly: boolean;
}

export interface TreeViewProps {
  data: TreeNodeData[];
  onSelectionChange: (selectedIds: string[]) => void;
  selectedPaths: string[];
  isReadOnly: boolean;
}

// --- TreeNode 컴포넌트 ---
const TreeNode: React.FC<TreeNodeProps> = ({
  node,
  level,
  checkedPaths,
  expandedPaths,
  onCheckChange,
  onExpandChange,
  isReadOnly,
}) => {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expandedPaths.has(node.id);
  const isChecked = checkedPaths.has(node.id);

  const handleToggleExpand = () => {
    if (hasChildren) {
      onExpandChange(node.id, !isExpanded);
    }
  };

  const handleCheckChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onCheckChange(node.id, e.target.checked);
  };

  const getNodeIcon = () => {
    switch (node.type) {
      case 'account': return '👤';
      case 'region': return '🌍';
      case 'webacl': return '🛡️';
      case 'ipset': return '📋';
      case 'regex': return '🔤';
      case 'rulegroup': return '📦';
      default: return hasChildren ? (isExpanded ? '📂' : '📁') : '📄';
    }
  };

  return (
    <>
      <div className={`tree-node level-${level}`}>
        <div className="tree-node-content">
          {hasChildren && (
            <button
              className={`expand-button ${isExpanded ? 'expanded' : ''}`}
              onClick={handleToggleExpand}
              aria-expanded={isExpanded}
            >
              <svg width="12" height="12" viewBox="0 0 12 12">
                <path
                  d="M4.5 2.5L8 6L4.5 9.5"
                  stroke="currentColor" strokeWidth="1.5"
                  strokeLinecap="round" strokeLinejoin="round"
                  fill="none"
                />
              </svg>
            </button>
          )}
          <div className="tree-node-checkbox">
            <input
              type="checkbox"
              id={`tree-${node.id}`}
              checked={isChecked}
              onChange={handleCheckChange}
              disabled={isReadOnly}
            />
          </div>
          <span className="tree-node-icon">{getNodeIcon()}</span>
          <label htmlFor={`tree-${node.id}`} className="tree-node-label">
            {node.label}
          </label>
        </div>
      </div>
      {hasChildren && isExpanded && (
        <div className="tree-children">
          {node.children!.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              level={level + 1}
              checkedPaths={checkedPaths}
              expandedPaths={expandedPaths}
              onCheckChange={onCheckChange}
              onExpandChange={onExpandChange}
              isReadOnly={isReadOnly}
            />
          ))}
        </div>
      )}
    </>
  );
};

// --- TreeView 컴포넌트 (메인) ---
const TreeView: React.FC<TreeViewProps> = ({ data, onSelectionChange, selectedPaths, isReadOnly }) => {
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(() => new Set(data.map(node => node.id)));

  const handleCheckChange = (nodeId: string, checked: boolean) => {
    const newCheckedSet = new Set(selectedPaths);
    if (checked) {
      newCheckedSet.add(nodeId);
    } else {
      newCheckedSet.delete(nodeId);
    }
    onSelectionChange(Array.from(newCheckedSet));
  };

  const handleExpandChange = (nodeId: string, expanded: boolean) => {
    const newExpanded = new Set(expandedPaths);
    if (expanded) newExpanded.add(nodeId);
    else newExpanded.delete(nodeId);
    setExpandedPaths(newExpanded);
  };

  const checkedPathsSet = new Set(selectedPaths);

  return (
    <div className="tree-view">
      {data.map((node) => (
        <TreeNode
          key={node.id}
          node={node}
          level={0}
          checkedPaths={checkedPathsSet}
          expandedPaths={expandedPaths}
          onCheckChange={handleCheckChange}
          onExpandChange={handleExpandChange}
          isReadOnly={isReadOnly}
        />
      ))}
    </div>
  );
};

export default TreeView;