import {
  User,
  Party,
  Item,
  Transaction,
  TransactionItem,
  BnplLimit,
  TallySyncLog,
} from "@shared/schema";

export interface DashboardData {
  openPayables: {
    total: number;
    count: number;
  };
  openReceivables: {
    total: number;
    count: number;
  };
  recentTransactions: Transaction[];
  receivablesAgeing: {
    current: number;
    days1to30: number;
    days31to60: number;
    days60plus: number;
  };
  payablesAgeing: {
    current: number;
    days1to30: number;
    days31to60: number;
    days60plus: number;
  };
  purchaseBnplLimits: BnplLimit[];
  salesBnplLimits: BnplLimit[];
  recentSyncLog?: TallySyncLog;
  pendingSyncs: {
    invoices: number;
    payments: number;
    receipts: number;
  };
}

export interface PeriodFilterOption {
  label: string;
  value: string;
  days?: number;
}

export interface TransactionTypeOption {
  label: string;
  value: string;
}

export interface StatusOption {
  label: string;
  value: string;
  color: string;
}

export interface PartyOption {
  label: string;
  value: number;
}

export interface FilterParams {
  period?: string;
  type?: string;
  status?: string;
  partyId?: number;
}
