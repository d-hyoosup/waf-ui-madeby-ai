// src/utils/treeUtils.ts

// --- 타입 정의 ---
export interface TreeNodeData {
  id: string;
  label: string;
  children?: TreeNodeData[];
  type?: 'account' | 'region' | 'webacl' | 'ipset' | 'regex' | 'rulegroup';
}

// --- 헬퍼 함수 ---
const getNodeType = (part: string, index: number): TreeNodeData['type'] => {
    if (part.match(/^\d{12}$/)) return 'account';
    if (part.includes('Global') || part.includes('ap-') || part.includes('us-')) return 'region';
    if (part.includes('WebACL')) return 'webacl';
    if (part.includes('IP Sets')) return 'ipset';
    if (part.includes('Regex')) return 'regex';
    if (part.includes('Rule groups')) return 'rulegroup';
    return undefined;
};

export const convertPathsToTreeData = (paths: string[]): TreeNodeData[] => {
    const tree: TreeNodeData[] = [];
    const nodeMap = new Map<string, TreeNodeData>();
    paths.forEach((path) => {
        const parts = path.split('/').filter(p => p);
        let currentPath = '';
        parts.forEach((part, index) => {
            const parentPath = currentPath;
            currentPath = currentPath ? `${currentPath}/${part}` : part;
            if (!nodeMap.has(currentPath)) {
                const nodeType = getNodeType(part, index);
                const node: TreeNodeData = { id: currentPath, label: part, type: nodeType, children: [] };
                nodeMap.set(currentPath, node);
                if (parentPath) {
                    const parent = nodeMap.get(parentPath);
                    if (parent) parent.children!.push(node);
                } else {
                    tree.push(node);
                }
            }
        });
    });
    return tree;
};