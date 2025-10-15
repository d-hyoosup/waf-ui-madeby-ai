// src/utils/treeUtils.ts

export interface TreeNodeData {
  id: string;
  label: string;
  children?: TreeNodeData[];
  type?: 'account' | 'region' | 'webacl' | 'ipset' | 'regex' | 'rulegroup';
}

const getNodeType = (part: string): TreeNodeData['type'] => {
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
        parts.forEach((part) => {
            const parentPath = currentPath;
            // --- 💡 수정된 부분: 경로 맨 앞에 '/'를 추가하여 ID를 생성합니다 ---
            currentPath = `${parentPath}/${part}`;
            // --- 💡 수정 끝 ---
            if (!nodeMap.has(currentPath)) {
                const nodeType = getNodeType(part);
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