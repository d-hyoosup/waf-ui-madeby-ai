// src/api/index.ts
import * as accountService from './accountService';
import * as settingService from './settingService';
import * as backupService from './backupService';
import * as mockAccountService from './mockAccountService';
import * as mockSettingService from './mockSettingService';
import * as mockBackupService from './mockBackupService';

const isMock = import.meta.env.VITE_API_MODE === 'mock';

export const AccountService = isMock ? mockAccountService : accountService;
export const SettingService = isMock ? mockSettingService : settingService;
export const BackupService = isMock ? mockBackupService : backupService;