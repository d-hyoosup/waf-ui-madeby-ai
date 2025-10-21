// src/api/accountService.ts
import apiClient from './apiClient';
import type { PagedResponse, WafManagerAccount, AddAccountRequest } from '../types/api.types'; // WafManagerAccountVO, RequestAddAccountDto

// GET /api/v1/waf/accounts
export const getAccounts = (params: { page: number; pageSize: number; withDeleted?: boolean }): Promise<PagedResponse<WafManagerAccount>> => {
  // Response data matches PagedResponse<WafManagerAccount> after apiClient extracts 'data'
  return apiClient.get('/waf/accounts', { params });
};

// GET /api/v1/waf/accounts/{accountId}
export const getAccountById = (accountId: string): Promise<WafManagerAccount> => {
  // Response data matches WafManagerAccount after apiClient extracts 'data'
  return apiClient.get(`/waf/accounts/${accountId}`);
};

// POST /api/v1/waf/accounts
export const addAccount = (account: AddAccountRequest): Promise<void> => {
  // Response data is null after apiClient extracts 'data', compatible with void
  return apiClient.post('/waf/accounts', account);
};

// DELETE /api/v1/waf/accounts/{accountId}
export const deleteAccount = (accountId: string): Promise<void> => {
  // Response data is null after apiClient extracts 'data', compatible with void
  return apiClient.delete(`/waf/accounts/${accountId}`);
};