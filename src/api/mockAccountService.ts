// src/api/mockAccountService.ts
import type { PagedResponse, WafManagerAccount, AddAccountRequest } from '../types/api.types';

const mockAccounts: WafManagerAccount[] = [
    { accountId: '123456789012', accountName: 'hmc_manager', email: 'hmc_manager@hyundai.com' },
    { accountId: '987654321098', accountName: 'hae_manager', email: 'hae_manager@hyundai.com' },
];

export const getAccounts = (params: { page: number; pageSize: number; withDeleted?: boolean }): Promise<PagedResponse<WafManagerAccount>> => {
  console.log('Using mock getAccounts', params);
  return new Promise(resolve => setTimeout(() => resolve({
    total: mockAccounts.length,
    content: mockAccounts,
    pagination: { pageNumber: 1, pageSize: 10, sort: { orders: [] } }
  }), 500));
};

export const getAccountById = (accountId: string): Promise<WafManagerAccount> => {
  console.log('Using mock getAccountById', accountId);
  const account = mockAccounts.find(acc => acc.accountId === accountId);
  return new Promise((resolve, reject) => setTimeout(() => {
    if (account) resolve(account);
    else reject({ message: "Account not found" });
  }, 300));
};

export const addAccount = (account: AddAccountRequest): Promise<void> => {
  console.log('Using mock addAccount', account);
  return new Promise(resolve => setTimeout(() => {
    mockAccounts.push({ ...account, email: `${account.accountName}@hyundai.com` });
    resolve();
  }, 500));
};

export const deleteAccount = (accountId: string): Promise<void> => {
  console.log('Using mock deleteAccount', accountId);
  const index = mockAccounts.findIndex(acc => acc.accountId === accountId);
  if (index > -1) {
    mockAccounts.splice(index, 1);
  }
  return new Promise(resolve => setTimeout(resolve, 500));
};