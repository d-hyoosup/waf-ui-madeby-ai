// src/api/accountService.ts
import apiClient from './apiClient';
import type { PagedResponse, WafManagerAccount, AddAccountRequest } from '../types/api.types';

export const getAccounts = (params: { page: number; pageSize: number; withDeleted?: boolean }): Promise<PagedResponse<WafManagerAccount>> => {
  return apiClient.get('/waf/accounts', { params });
};

export const getAccountById = (accountId: string): Promise<WafManagerAccount> => {
  return apiClient.get(`/waf/accounts/${accountId}`);
};

export const addAccount = (account: AddAccountRequest): Promise<void> => {
  return apiClient.post('/waf/accounts', account);
};

export const deleteAccount = (accountId: string): Promise<void> => {
  return apiClient.delete(`/waf/accounts/${accountId}`);
};