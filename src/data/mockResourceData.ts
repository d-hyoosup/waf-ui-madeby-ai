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
      "cpx-global_vehicle_ccs-hmg_net.json": `{
  "Name": "cpx-global_vehicle_ccs-hmg_net",
  "ID": "937532bd-1c4b-4a85-8df0-acf2c7235adf",
  "ARN": "arn:aws:wafv2:us-east-1:443373118041:global/webacl/cpx-global_vehicle_ccs-hmg_net/937532bd-1c4b-4a85-8df0-acf2c7235adf",
  "DefaultAction": {
    "Allow": {}
  },
  "Description": "",
  "Rules": [
    {
      "Name": "ccs-auth_eventBridge-vehicle_Header_x-ccs-auth-eventbridge-secret",
      "Priority": 0,
      "Statement": {
        "AndStatement": {
          "Statements": [
            {
              "ByteMatchStatement": {
                "SearchString": "eventBridge/vehicle",
                "FieldToMatch": {
                  "UriPath": {}
                },
                "TextTransformations": [
                  {
                    "Priority": 0,
                    "Type": "NONE"
                  }
                ],
                "PositionalConstraint": "CONTAINS"
              }
            }
          ]
        }
      },
      "Action": {
        "Block": {}
      },
      "VisibilityConfig": {
        "SampledRequestsEnabled": false,
        "CloudWatchMetricsEnabled": true,
        "MetricName": "ccs-auth_eventBridge-vehicle_Header_x-ccs-auth-eventbridge-secret"
      }
    }
  ]
}`,
      "cpx-global_hmgmobility_com.json": `{
  "Name": "cpx-global_hmgmobility_com",
  "ID": "d8f9c1b2-3a56-4e78-9f01-2b3c4d5e6f7a",
  "DefaultAction": { "Allow": {} },
  "Rules": []
}`,
      "cpx_ext_ccs-hmg_net.json": `{
  "Name": "cpx_ext_ccs-hmg_net",
  "ID": "c1d2e3f4-5678-90ab-cdef-123456789012",
  "DefaultAction": { "Allow": {} },
  "Rules": []
}`,
      "northeast_hmgmobility_com.json": `{
  "Name": "northeast_hmgmobility_com",
  "ID": "ne-12345678-90ab-cdef-1234-567890abcdef",
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
    "Regex pattern": {
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
    "Rule Groups": {
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
      "cpx-global_vehicle_ccs-hmg_net.json": `{
  "Name": "cpx-global_vehicle_ccs-hmg_net",
  "ID": "937532bd-1c4b-4a85-8df0-acf2c7235adf",
  "ARN": "arn:aws:wafv2:us-east-1:443373118041:global/webacl/cpx-global_vehicle_ccs-hmg_net/937532bd-1c4b-4a85-8df0-acf2c7235adf",
  "DefaultAction": {
    "Allow": {}
  },
  "Description": "",
  "Rules": [
    {
      "Name": "ccs-auth_eventBridge-vehicle_Header_x-ccs-auth-eventbridge-secret",
      "Priority": 1,
      "Statement": {
        "AndStatement": {
          "Statements": [
            {
              "ByteMatchStatement": {
                "SearchString": "eventBridge/vehicle",
                "FieldToMatch": {
                  "UriPath": {}
                },
                "TextTransformations": [
                  {
                    "Priority": 0,
                    "Type": "LOWERCASE"
                  }
                ],
                "PositionalConstraint": "CONTAINS"
              }
            }
          ]
        }
      },
      "Action": {
        "Allow": {}
      },
      "VisibilityConfig": {
        "SampledRequestsEnabled": true,
        "CloudWatchMetricsEnabled": true,
        "MetricName": "ccs-auth_eventBridge-vehicle_Header_x-ccs-auth-eventbridge-secret-updated"
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
    "Regex pattern": {
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
    "Rule Groups": {
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

// 현재 적용중인 리소스 데이터
export const mockCurrentResourceData: BackupResources = {
  "Web ACLs": {
    "cpx-global_vehicle_ccs-hmg_net.json": `{
  "Name": "cpx-global_vehicle_ccs-hmg_net",
  "ID": "937532bd-1c4b-4a85-8df0-acf2c7235adf",
  "ARN": "arn:aws:wafv2:us-east-1:443373118041:global/webacl/cpx-global_vehicle_ccs-hmg_net/937532bd-1c4b-4a85-8df0-acf2c7235adf",
  "DefaultAction": {
    "Allow": {}
  },
  "Description": "Updated rule configuration",
  "Rules": [
    {
      "Name": "ccs-auth_eventBridge-vehicle_Header_x-ccs-auth-eventbridge-secret",
      "Priority": 1,
      "Statement": {
        "AndStatement": {
          "Statements": [
            {
              "ByteMatchStatement": {
                "SearchString": "eventBridge/vehicle",
                "FieldToMatch": {
                  "UriPath": {}
                },
                "TextTransformations": [
                  {
                    "Priority": 0,
                    "Type": "LOWERCASE"
                  }
                ],
                "PositionalConstraint": "CONTAINS"
              }
            }
          ]
        }
      },
      "Action": {
        "Allow": {}
      },
      "VisibilityConfig": {
        "SampledRequestsEnabled": true,
        "CloudWatchMetricsEnabled": true,
        "MetricName": "ccs-auth_eventBridge-vehicle_Header_x-ccs-auth-eventbridge-secret-current"
      }
    }
  ]
}`,
    "current-only-webacl.json": `{
  "Name": "current-only-webacl",
  "ID": "current-123456",
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
      "203.0.113.0/24",
      "172.16.0.0/16",
      "172.31.0.0/16"
    ]
  }
}`,
    "blocked-ips.json": `{
  "IPSet": {
    "Name": "BlockedIPs",
    "Addresses": [
      "198.51.100.0/24",
      "203.0.113.100/32",
      "192.0.2.0/24",
      "198.51.101.0/24"
    ]
  }
}`
  },
  "Regex pattern": {
    "user-agent-patterns.json": `{
  "RegexPatternSet": {
    "Name": "UserAgentPatterns",
    "RegularExpressionList": [
      "(?i)(bot|crawl|spider)",
      "badagent.*",
      "scanner.*"
    ]
  }
}`
  },
  "Rule Groups": {
    "security-rule-group.json": `{
  "RuleGroup": {
    "Name": "SecurityRuleGroup",
    "Capacity": 500,
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
      },
      {
        "Name": "PathTraversalProtection",
        "Priority": 3,
        "Action": { "Block": {} }
      }
    ]
  }
}`
  }
};