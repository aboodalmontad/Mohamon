export * from './types/index';

export type Role = 'admin' | 'user';

export interface Profile {
  id: string;
  full_name: string;
  role: Role;
  phone_verified: boolean;
  subscription_end: string | null;
  created_at: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  is_dirty?: boolean;
}

export interface Case {
  id: string;
  client_id: string;
  title: string;
  description?: string;
  financial_agreement?: number;
  status: 'active' | 'closed' | 'pending';
  created_at: string;
  updated_at: string;
  is_dirty?: boolean;
}

export interface Stage {
  id: string;
  case_id: string;
  court_name: string;
  case_number: string;
  status: string;
  created_at: string;
  updated_at: string;
  is_dirty?: boolean;
}

export interface Session {
  id: string;
  stage_id: string;
  session_date: string;
  reason: string;
  judge_name?: string;
  decision?: string;
  is_postponed: boolean;
  created_at: string;
  updated_at: string;
  is_dirty?: boolean;
}

export interface AdminTask {
  id: string;
  task_name: string;
  due_date: string;
  priority: 'low' | 'medium' | 'high';
  assigned_to?: string;
  location?: string;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
  is_dirty?: boolean;
}

export interface AccountingEntry {
  id: string;
  case_id?: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  entry_date: string;
  created_at: string;
  updated_at: string;
  is_dirty?: boolean;
}

export interface SyncDeletion {
  id: string;
  table_name: string;
  record_id: string;
  deleted_at: string;
}
