export type ExpenseCategory = 
  | 'servers' 
  | 'marketing' 
  | 'domains' 
  | 'salaries' 
  | 'development' 
  | 'maintenance' 
  | 'legal_banking' 
  | 'other';

export type PaymentMethodType = 
  | 'cash' 
  | 'bank_transfer' 
  | 'syriatel_cash' 
  | 'al_haram' 
  | 'fouad' 
  | 'stripe' 
  | 'usdt_crypto' 
  | 'paypal' 
  | 'check' 
  | 'other';

export interface PlatformExpense {
  id: string;
  titleAr: string;
  titleEn: string;
  category: ExpenseCategory;
  amount: number;
  currency: 'USD' | 'SYP' | 'SAR' | 'AED';
  date: string;
  paymentMethod: PaymentMethodType;
  recipient?: string;
  invoiceRef?: string;
  notes?: string;
  createdAt: string;
}

export interface PlatformTransaction {
  id: string;
  firmId?: string;
  firmName: string;
  type: 'subscription_new' | 'subscription_renewal' | 'custom_service' | 'domain_addon' | 'storage_addon' | 'consultation_fee' | 'other';
  amount: number;
  currency: 'USD' | 'SYP' | 'SAR' | 'AED';
  date: string;
  paymentMethod: PaymentMethodType;
  invoiceNumber?: string;
  status: 'completed' | 'pending' | 'cancelled';
  notes?: string;
  createdAt: string;
}

export interface PlatformFinanceConfig {
  reportingCurrency: 'USD' | 'SYP';
  usdToSypRate: number; // e.g. 15000 SYP per 1 USD
  sarToUsdRate: number; // e.g. 0.27
  monthlyTargetUSD: number;
  annualTargetUSD: number;
}

const STORAGE_KEY_EXPENSES = 'aladl_platform_expenses_v1';
const STORAGE_KEY_TRANSACTIONS = 'aladl_platform_transactions_v1';
const STORAGE_KEY_CONFIG = 'aladl_platform_finance_config_v1';

const initialExpenses: PlatformExpense[] = [
  {
    id: 'exp-1',
    titleAr: 'اشتراك خوادم واستضافة سحابية عالية الأداء (Vercel Enterprise & Supabase Pro)',
    titleEn: 'Cloud Infrastructure & DB Hosting (Vercel & Supabase)',
    category: 'servers',
    amount: 120,
    currency: 'USD',
    date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    paymentMethod: 'stripe',
    recipient: 'Supabase / Vercel Inc.',
    invoiceRef: 'INV-2026-CLOUD-01',
    notes: 'تغطية البنية التحتية للخوادم وقواعد البيانات السحابية لكافة المكاتب',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'exp-2',
    titleAr: 'تجديد حزمة النطاقات وحماية شهادات الأمان SSL وحماية Cloudflare',
    titleEn: 'Domains Renewal & SSL Security',
    category: 'domains',
    amount: 65,
    currency: 'USD',
    date: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    paymentMethod: 'bank_transfer',
    recipient: 'Cloudflare Inc & Namecheap',
    invoiceRef: 'INV-CF-8849',
    notes: 'حماية وتأمين الدومينات والنطاقات الخاصة بالمكاتب',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'exp-3',
    titleAr: 'حملات تسويقية وإعلانات موجهة لنقابات المحامين والمكاتب القانونية',
    titleEn: 'Targeted Legal SaaS Marketing Campaigns',
    category: 'marketing',
    amount: 250,
    currency: 'USD',
    date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    paymentMethod: 'cash',
    recipient: 'Meta Ads & Google Ads Agency',
    invoiceRef: 'MKT-2026-08',
    notes: 'حملة استقطاب المكاتب والشركات الحقوقية في دمشق وحلب والمحافظات',
    createdAt: new Date().toISOString(),
  }
];

const initialConfig: PlatformFinanceConfig = {
  reportingCurrency: 'USD',
  usdToSypRate: 15000,
  sarToUsdRate: 0.267,
  monthlyTargetUSD: 3000,
  annualTargetUSD: 36000,
};

class PlatformFinanceService {
  private expenses: PlatformExpense[] = [];
  private transactions: PlatformTransaction[] = [];
  private config: PlatformFinanceConfig = initialConfig;

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    if (typeof window === 'undefined') return;

    try {
      const storedExp = localStorage.getItem(STORAGE_KEY_EXPENSES);
      if (storedExp) {
        this.expenses = JSON.parse(storedExp);
      } else {
        this.expenses = initialExpenses;
        this.saveExpenses();
      }

      const storedTx = localStorage.getItem(STORAGE_KEY_TRANSACTIONS);
      if (storedTx) {
        this.transactions = JSON.parse(storedTx);
      } else {
        this.transactions = [];
      }

      const storedCfg = localStorage.getItem(STORAGE_KEY_CONFIG);
      if (storedCfg) {
        this.config = { ...initialConfig, ...JSON.parse(storedCfg) };
      } else {
        this.config = initialConfig;
        this.saveConfig();
      }
    } catch (e) {
      console.error('Error loading finance data:', e);
      this.expenses = initialExpenses;
      this.config = initialConfig;
    }
  }

  private saveExpenses() {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_EXPENSES, JSON.stringify(this.expenses));
    }
  }

  private saveTransactions() {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(this.transactions));
    }
  }

  private saveConfig() {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(this.config));
    }
  }

  // --- Expenses Methods ---
  public getExpenses(): PlatformExpense[] {
    return [...this.expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  public addExpense(expense: Omit<PlatformExpense, 'id' | 'createdAt'>): PlatformExpense {
    const newExp: PlatformExpense = {
      ...expense,
      id: `exp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      createdAt: new Date().toISOString(),
    };
    this.expenses.unshift(newExp);
    this.saveExpenses();
    return newExp;
  }

  public updateExpense(id: string, updates: Partial<PlatformExpense>): boolean {
    const idx = this.expenses.findIndex(e => e.id === id);
    if (idx !== -1) {
      this.expenses[idx] = { ...this.expenses[idx], ...updates };
      this.saveExpenses();
      return true;
    }
    return false;
  }

  public deleteExpense(id: string): boolean {
    const prevLen = this.expenses.length;
    this.expenses = this.expenses.filter(e => e.id !== id);
    if (this.expenses.length !== prevLen) {
      this.saveExpenses();
      return true;
    }
    return false;
  }

  // --- Transactions / Revenue Ledger Methods ---
  public getTransactions(): PlatformTransaction[] {
    return [...this.transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  public addTransaction(tx: Omit<PlatformTransaction, 'id' | 'createdAt'>): PlatformTransaction {
    const newTx: PlatformTransaction = {
      ...tx,
      id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      createdAt: new Date().toISOString(),
    };
    this.transactions.unshift(newTx);
    this.saveTransactions();
    return newTx;
  }

  public deleteTransaction(id: string): boolean {
    const prevLen = this.transactions.length;
    this.transactions = this.transactions.filter(t => t.id !== id);
    if (this.transactions.length !== prevLen) {
      this.saveTransactions();
      return true;
    }
    return false;
  }

  // --- Config Methods ---
  public getConfig(): PlatformFinanceConfig {
    return { ...this.config };
  }

  public updateConfig(updates: Partial<PlatformFinanceConfig>): PlatformFinanceConfig {
    this.config = { ...this.config, ...updates };
    this.saveConfig();
    return { ...this.config };
  }

  // --- Currency Conversion Helpers ---
  public convertToUSD(amount: number, fromCurrency: string): number {
    if (fromCurrency === 'USD' || fromCurrency === '$') return amount;
    if (fromCurrency === 'SYP' || fromCurrency === 'ل.س') {
      const rate = this.config.usdToSypRate || 15000;
      return amount / rate;
    }
    if (fromCurrency === 'SAR' || fromCurrency === 'ر.س') {
      return amount * (this.config.sarToUsdRate || 0.267);
    }
    if (fromCurrency === 'AED' || fromCurrency === 'د.إ') {
      return amount * 0.272;
    }
    return amount;
  }

  public convertFromUSD(amountUSD: number, toCurrency: 'USD' | 'SYP'): number {
    if (toCurrency === 'USD') return amountUSD;
    return amountUSD * (this.config.usdToSypRate || 15000);
  }
}

export const platformFinanceService = new PlatformFinanceService();
