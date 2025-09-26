// src/data/mockResourceData.ts

export interface ResourceFiles {
  [fileName: string]: string;
}

export interface BackupResources {
  [resourceType: string]: ResourceFiles;
}

export interface BackupResourceData {
  [backupId: string]: BackupResources;
}

// 백업별 리소스 데이터
export const mockBackupResourceData: BackupResourceData = {
  "20250112-150430": {
    "Web ACLs": {
      "cpx-global_vehicle_ccs-hmg_net.json": `{\n  "Name": "cpx-global_vehicle_ccs-hmg_net",\n  "Priority": 0,\n  "Action": {\n    "Block": {}\n  }\n}`,
      "backup-only-file.json": `{\n  "Name": "This file only exists in the backup"\n}`
    },
    "IP Sets": {
      "allowed-ips.json": `{\n  "Addresses": [\n    "192.168.1.0/24",\n    "10.0.0.0/8"\n  ]\n}`
    },
    "Regex pattern": {},
    "Rule Groups": {}
  },
  "20241223-112030": {
    "Web ACLs": {
      "cpx-global_vehicle_ccs-hmg_net.json": `{\n  "Name": "cpx-global_vehicle_ccs-hmg_net",\n  "Priority": 10,\n  "Action": {\n    "Block": {}\n  }\n}`
    },
    "IP Sets": {},
    "Regex pattern": {},
    "Rule Groups": {}
  },
  "20250912-150430": {
      "Web ACLs": {
        "cpx-global_vehicle_ccs-hmg_net.json": `{\n  "Name": "cpx-global_vehicle_ccs-hmg_net",\n  "Priority": 5,\n  "Action": {\n    "Allow": {}\n  }\n}`,
        "current-only-file.json": `{\n  "Name": "This file only exists in the current rules"\n}`
      },
      "IP Sets": {
        "allowed-ips.json": `{\n  "Addresses": [\n    "192.168.1.0/24",\n    "0.0.0.0/8",\n    "172.16.0.0/16"\n  ]\n}`
      },
      "Regex pattern": {
         "new-regex.json": `{\n  "Name": "A new regex pattern set"\n}`
      },
      "Rule Groups": {}
  }
};

// 현재 적용중인 리소스 데이터
export const mockCurrentResourceData: BackupResources = {
  "Web ACLs": {
    "cpx-global_vehicle_ccs-hmg_net.json": `{\n  "Name": "cpx-global_vehicle_ccs-hmg_net",\n  "Priority": 5,\n  "Action": {\n    "Allow": {}\n  }\n}`,
    "current-only-file.json": `{\n  "Name": "This file only exists in the current rules"\n}`
  },
  "IP Sets": {
    "allowed-ips.json": `{\n  "Addresses": [\n    "192.168.1.0/24",\n    "10.0.0.0/8",\n    "172.16.0.0/16"\n  ]\n}`
  },
  "Regex pattern": {
     "new-regex.json": `{\n  "Name": "A new regex pattern set"\n}`
  },
  "Rule Groups": {}
};