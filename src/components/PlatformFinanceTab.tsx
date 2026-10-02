import React, { useState, useMemo } from 'react';
import { 
  DollarSign, TrendingUp, TrendingDown, Wallet, CreditCard, 
  ArrowUpRight, ArrowDownRight, Plus, Trash2, Edit3, 
  Calendar, Building2, Download, Search, Filter, 
  FileText, CheckCircle2, Clock, AlertTriangle, PieChart, 
  BarChart3, ShieldCheck, RefreshCw, Layers, Sparkles,
  Receipt, Landmark, Coins, ArrowRightLeft, HelpCircle, Check, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LawFirm } from '../types';
import { 
  platformFinanceService, 
  PlatformExpense, 
  PlatformTransaction, 
  ExpenseCategory, 
  PaymentMethodType 
} from '../services/platformFinanceService';

interface PlatformFinanceTabProps {
  firms: LawFirm[];
  isAr: boolean;
  onRefreshFirms?: () => void;
}

export const PlatformFinanceTab: React.FC<PlatformFinanceTabProps> = ({
  firms,
  isAr,
  onRefreshFirms
}) => {
  // Navigation inside Finance
  const [subTab, setSubTab] = useState<'journal' | 'overview' | 'revenue' | 'expenses' | 'statement'>('journal');
  
  // Service states
  const [expenses, setExpenses] = useState<PlatformExpense[]>(() => platformFinanceService.getExpenses());
  const [transactions, setTransactions] = useState<PlatformTransaction[]>(() => platformFinanceService.getTransactions());
  const [config, setConfig] = useState(() => platformFinanceService.getConfig());
  const [toastMsg, setToastMsg] = useState('');

  // Modals
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<PlatformExpense | null>(null);
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<PlatformTransaction | null>(null);
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  // Delete confirmation modal state
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<{
    type: 'expense' | 'transaction';
    id: string;
    title: string;
    amount?: number;
    currency?: string;
  } | null>(null);

  // Search & Filter
  const [journalFilter, setJournalFilter] = useState<'all' | 'revenue' | 'expense'>('all');
  const [journalSearch, setJournalSearch] = useState('');
  const [expenseSearch, setExpenseSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [txSearch, setTxSearch] = useState('');

  // Form states for Expense
  const [newExpense, setNewExpense] = useState<{
    titleAr: string;
    category: ExpenseCategory;
    amount: number;
    currency: 'USD' | 'SYP' | 'SAR';
    date: string;
    paymentMethod: PaymentMethodType;
    recipient: string;
    invoiceRef: string;
    notes: string;
  }>({
    titleAr: '',
    category: 'servers',
    amount: 50,
    currency: 'USD',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'bank_transfer',
    recipient: '',
    invoiceRef: '',
    notes: ''
  });

  // Form states for Revenue Transaction
  const [newTx, setNewTx] = useState<{
    firmId: string;
    firmName: string;
    type: 'subscription_new' | 'subscription_renewal' | 'custom_service' | 'domain_addon' | 'other';
    amount: number;
    currency: 'USD' | 'SYP' | 'SAR';
    date: string;
    paymentMethod: PaymentMethodType;
    invoiceNumber: string;
    notes: string;
  }>({
    firmId: '',
    firmName: '',
    type: 'subscription_new',
    amount: 350,
    currency: 'USD',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'syriatel_cash',
    invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
    notes: ''
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const refreshData = () => {
    setExpenses(platformFinanceService.getExpenses());
    setTransactions(platformFinanceService.getTransactions());
    setConfig(platformFinanceService.getConfig());
  };

  React.useEffect(() => {
    refreshData();
    const handleFinanceUpdated = () => refreshData();
    window.addEventListener('aladl_finance_updated', handleFinanceUpdated);
    window.addEventListener('aladl_firms_updated', handleFinanceUpdated);
    return () => {
      window.removeEventListener('aladl_finance_updated', handleFinanceUpdated);
      window.removeEventListener('aladl_firms_updated', handleFinanceUpdated);
    };
  }, [firms]);

  // -------------------------------------------------------------
  // FINANCIAL CALCULATIONS & INTELLIGENCE ENGINE (STRICTLY REAL DATA)
  // -------------------------------------------------------------
  const analytics = useMemo(() => {
    const reportingCur = config.reportingCurrency;
    const usdToSyp = config.usdToSypRate || 15000;

    // 1. Calculate Real Collected Revenue directly from Real Transactions in the General Ledger
    let totalRevenueUSD = 0;
    let completedTxCount = 0;
    let firmSubscriptionsTotalUSD = 0;
    let manualTxTotalUSD = 0;

    transactions.forEach(tx => {
      if (tx.status === 'completed' || !tx.status) {
        const valUSD = platformFinanceService.convertToUSD(tx.amount, tx.currency);
        totalRevenueUSD += valUSD;
        completedTxCount++;
        if (tx.type === 'subscription_new' || tx.type === 'subscription_renewal') {
          firmSubscriptionsTotalUSD += valUSD;
        } else {
          manualTxTotalUSD += valUSD;
        }
      }
    });

    // 2. Calculate Subscriptions status and contracted value across firms
    let contractedSubscriptionsTotalUSD = 0;
    let firmPendingAmountUSD = 0;
    let firmPaidCount = 0;
    let firmWaivedCount = 0;
    let firmPendingCount = 0;

    const planStats: Record<string, { count: number; revenueUSD: number; labelAr: string; labelEn: string }> = {
      starter: { count: 0, revenueUSD: 0, labelAr: 'الباقة القياسية (Starter)', labelEn: 'Standard Starter' },
      basic: { count: 0, revenueUSD: 0, labelAr: 'الباقة الأساسية (Basic)', labelEn: 'Basic Plan' },
      professional: { count: 0, revenueUSD: 0, labelAr: 'الباقة الاحترافية (Professional)', labelEn: 'Professional' },
      enterprise: { count: 0, revenueUSD: 0, labelAr: 'الباقة الماسية والمؤسسات (Enterprise)', labelEn: 'Enterprise' },
      custom: { count: 0, revenueUSD: 0, labelAr: 'باقة مخصصة (Custom)', labelEn: 'Custom Plan' },
    };

    firms.forEach(firm => {
      const sub = firm.subscription;
      const annualFee = typeof sub?.annualFee === 'number' ? sub.annualFee : 0;
      const feeCur = sub?.currency || 'SAR';
      const feeUSD = platformFinanceService.convertToUSD(annualFee, feeCur);

      const planKey = (sub?.planTier as string) || 'professional';
      if (!planStats[planKey]) {
        planStats[planKey] = { count: 0, revenueUSD: 0, labelAr: sub?.planNameAr || planKey, labelEn: sub?.planNameEn || planKey };
      }
      planStats[planKey].count++;

      if (sub?.paymentStatus === 'paid') {
        contractedSubscriptionsTotalUSD += feeUSD;
        firmPaidCount++;
        planStats[planKey].revenueUSD += feeUSD;
      } else if (sub?.paymentStatus === 'waived') {
        firmWaivedCount++;
      } else {
        firmPendingCount++;
        firmPendingAmountUSD += feeUSD;
      }
    });

    // 3. Calculate Real Operating Expenses (from actual entered expenses in the journal)
    let totalExpensesUSD = 0;
    const expenseByCategory: Record<ExpenseCategory, number> = {
      servers: 0,
      marketing: 0,
      domains: 0,
      salaries: 0,
      development: 0,
      maintenance: 0,
      legal_banking: 0,
      other: 0,
    };

    expenses.forEach(exp => {
      const expUSD = platformFinanceService.convertToUSD(exp.amount, exp.currency);
      totalExpensesUSD += expUSD;
      if (expenseByCategory[exp.category] !== undefined) {
        expenseByCategory[exp.category] += expUSD;
      } else {
        expenseByCategory.other += expUSD;
      }
    });

    // Determine highest expense category dynamically
    const sortedCategories = (Object.keys(expenseByCategory) as ExpenseCategory[])
      .filter(cat => expenseByCategory[cat] > 0)
      .sort((a, b) => expenseByCategory[b] - expenseByCategory[a]);
    const majorCategory = sortedCategories.length > 0 ? sortedCategories[0] : null;

    // 4. Net Profit & Financial KPIs
    const netProfitUSD = totalRevenueUSD - totalExpensesUSD;
    const profitMargin = totalRevenueUSD > 0 ? (netProfitUSD / totalRevenueUSD) * 100 : 0;
    const activeFirmsCount = firms.filter(f => f.status === 'active' || f.subscription?.isSiteActive !== false).length;
    const arpuUSD = activeFirmsCount > 0 ? totalRevenueUSD / activeFirmsCount : 0;
    const mrrUSD = totalRevenueUSD / 12;
    const arrUSD = totalRevenueUSD;

    // Converted to Selected Display Currency
    const isSYP = reportingCur === 'SYP';
    const mult = isSYP ? usdToSyp : 1;
    const currencyLabel = isSYP ? 'ل.س' : '$';

    return {
      totalRevenueUSD,
      totalRevenueDisplay: totalRevenueUSD * mult,
      completedTxCount,
      firmSubscriptionsTotalUSD,
      contractedSubscriptionsTotalUSD,
      firmPendingAmountUSD,
      manualTxTotalUSD,
      totalExpensesUSD,
      totalExpensesDisplay: totalExpensesUSD * mult,
      netProfitUSD,
      netProfitDisplay: netProfitUSD * mult,
      profitMargin,
      arpuUSD,
      arpuDisplay: arpuUSD * mult,
      mrrUSD,
      mrrDisplay: mrrUSD * mult,
      arrUSD,
      arrDisplay: arrUSD * mult,
      planStats,
      expenseByCategory,
      majorCategory,
      firmPaidCount,
      firmWaivedCount,
      firmPendingCount,
      currencyLabel,
      isSYP,
      mult,
      annualTargetProgress: Math.min(100, (totalRevenueUSD / (config.annualTargetUSD || 36000)) * 100),
      monthlyTargetProgress: Math.min(100, (mrrUSD / (config.monthlyTargetUSD || 3000)) * 100),
    };
  }, [firms, expenses, transactions, config]);

  // Handle Add Expense
  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.titleAr.trim() || newExpense.amount <= 0) {
      showToast(isAr ? 'يرجى إدخال اسم المصروف والمبلغ بشكل صحيح' : 'Please provide valid expense title and amount');
      return;
    }

    platformFinanceService.addExpense({
      titleAr: newExpense.titleAr,
      titleEn: newExpense.titleAr,
      category: newExpense.category,
      amount: Number(newExpense.amount),
      currency: newExpense.currency,
      date: newExpense.date,
      paymentMethod: newExpense.paymentMethod,
      recipient: newExpense.recipient,
      invoiceRef: newExpense.invoiceRef,
      notes: newExpense.notes,
    });

    refreshData();
    setIsAddExpenseOpen(false);
    setNewExpense({
      titleAr: '',
      category: 'servers',
      amount: 50,
      currency: 'USD',
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'bank_transfer',
      recipient: '',
      invoiceRef: '',
      notes: ''
    });
    showToast(isAr ? 'تم تسجيل بند المصروف بنجاح' : 'Expense recorded successfully');
  };

  // Handle Add Transaction
  const handleCreateTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTx.firmName.trim() || newTx.amount <= 0) {
      showToast(isAr ? 'يرجى إدخال اسم المكتب/الجهة والمبلغ بشكل صحيح' : 'Please provide valid firm name and amount');
      return;
    }

    platformFinanceService.addTransaction({
      firmId: newTx.firmId || undefined,
      firmName: newTx.firmName,
      type: newTx.type,
      amount: Number(newTx.amount),
      currency: newTx.currency,
      date: newTx.date,
      paymentMethod: newTx.paymentMethod,
      invoiceNumber: newTx.invoiceNumber,
      status: 'completed',
      notes: newTx.notes,
    });

    refreshData();
    setIsAddTxOpen(false);
    showToast(isAr ? 'تم تقييد دفعة الإيراد بنجاح' : 'Revenue transaction recorded');
  };

  // Handle Edit Expense
  const handleSaveEditExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExpense || !editingExpense.titleAr.trim() || editingExpense.amount <= 0) {
      showToast(isAr ? 'يرجى إدخال بيانات المصروف بشكل صحيح' : 'Please provide valid expense data');
      return;
    }

    platformFinanceService.updateExpense(editingExpense.id, {
      titleAr: editingExpense.titleAr,
      titleEn: editingExpense.titleAr,
      category: editingExpense.category,
      amount: Number(editingExpense.amount),
      currency: editingExpense.currency,
      date: editingExpense.date,
      paymentMethod: editingExpense.paymentMethod,
      recipient: editingExpense.recipient,
      invoiceRef: editingExpense.invoiceRef,
      notes: editingExpense.notes,
    });

    refreshData();
    setEditingExpense(null);
    showToast(isAr ? 'تم حفظ تعديلات المصروف بنجاح' : 'Expense updated successfully');
  };

  // Handle Edit Transaction
  const handleSaveEditTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTx || !editingTx.firmName.trim() || editingTx.amount <= 0) {
      showToast(isAr ? 'يرجى إدخال بيانات القيد بشكل صحيح' : 'Please provide valid transaction data');
      return;
    }

    platformFinanceService.updateTransaction(editingTx.id, {
      firmName: editingTx.firmName,
      type: editingTx.type,
      amount: Number(editingTx.amount),
      currency: editingTx.currency,
      date: editingTx.date,
      paymentMethod: editingTx.paymentMethod,
      invoiceNumber: editingTx.invoiceNumber,
      status: editingTx.status,
      notes: editingTx.notes,
    });

    refreshData();
    setEditingTx(null);
    showToast(isAr ? 'تم حفظ تعديل القيد المالي بنجاح' : 'Transaction updated successfully');
  };

  const handleDeleteExpense = (id: string) => {
    const target = expenses.find(e => e.id === id);
    setDeleteConfirmTarget({
      type: 'expense',
      id,
      title: target?.titleAr || (isAr ? 'مصروف المنصة' : 'Platform Expense'),
      amount: target?.amount,
      currency: target?.currency
    });
  };

  const handleDeleteTransaction = (id: string) => {
    const target = transactions.find(t => t.id === id);
    setDeleteConfirmTarget({
      type: 'transaction',
      id,
      title: target?.firmName || target?.invoiceNumber || (isAr ? 'قيد محاسبي وارد' : 'Accounting Transaction'),
      amount: target?.amount,
      currency: target?.currency
    });
  };

  // Category Translation Helpers
  const getCategoryLabel = (cat: ExpenseCategory) => {
    const labels: Record<ExpenseCategory, string> = {
      servers: isAr ? 'خوادم واستضافة سحابية' : 'Servers & Cloud',
      marketing: isAr ? 'تسويق وإعلانات' : 'Marketing & Ads',
      domains: isAr ? 'نطاقات وشهادات أمان' : 'Domains & SSL',
      salaries: isAr ? 'رواتب ومكافآت' : 'Salaries & Staff',
      development: isAr ? 'تطوير وبرمجة' : 'Development',
      maintenance: isAr ? 'صيانة ودعم فني' : 'Maintenance',
      legal_banking: isAr ? 'رسوم قانونية وبنكية' : 'Legal & Banking',
      other: isAr ? 'مصاريف تشغيلية عامة' : 'General Operating',
    };
    return labels[cat] || cat;
  };

  const getPaymentMethodLabel = (pm: PaymentMethodType) => {
    const labels: Record<PaymentMethodType, string> = {
      syriatel_cash: isAr ? 'سيريتل كاش (Syriatel Cash)' : 'Syriatel Cash',
      al_haram: isAr ? 'حوالة الهرم' : 'Al-Haram Transfer',
      fouad: isAr ? 'حوالة الفؤاد' : 'Fouad Transfer',
      bank_transfer: isAr ? 'تحويل بنكي' : 'Bank Transfer',
      cash: isAr ? 'نقداً (كاش)' : 'Cash',
      stripe: isAr ? 'بطاقة ائتمانية / Stripe' : 'Credit Card / Stripe',
      usdt_crypto: isAr ? 'USDT / عملات رقمية' : 'USDT Crypto',
      paypal: isAr ? 'PayPal' : 'PayPal',
      check: isAr ? 'شيك بنكي' : 'Check',
      other: isAr ? 'طريقة أخرى' : 'Other',
    };
    return labels[pm] || pm;
  };

  // Export to CSV
  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,\uFEFF';
    csvContent += 'النوع,البيان / الجهة,المبلغ,العملة,التاريخ,طريقة الدفع,رقم المرجع\n';

    // Add Inflows
    firms.forEach(f => {
      const sub = f.subscription;
      csvContent += `"إيراد اشتراك","${f.nameAr || f.slug}","${sub?.annualFee || 0}","${sub?.currency || 'SAR'}","${sub?.startDate?.split('T')[0] || ''}","${sub?.paymentStatus || ''}","${sub?.planNameAr || ''}"\n`;
    });

    transactions.forEach(t => {
      csvContent += `"إيراد إضافي","${t.firmName}","${t.amount}","${t.currency}","${t.date}","${t.paymentMethod}","${t.invoiceNumber || ''}"\n`;
    });

    // Add Expenses
    expenses.forEach(e => {
      csvContent += `"مصروف تشغيلي","${e.titleAr}","-${e.amount}","${e.currency}","${e.date}","${e.paymentMethod}","${e.invoiceRef || ''}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `aladl_platform_financial_statement_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(isAr ? 'تم تصدير كشف الحساب المالي بصيغة CSV بنجاح' : 'Financial statement exported');
  };

  const formatNumber = (num: number, decimals: number = 0) => {
    return Number(num || 0).toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  return (
    <div className="space-y-6 text-slate-100" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] bg-emerald-500 text-slate-950 font-bold px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border border-emerald-400"
          >
            <CheckCircle2 className="w-5 h-5 text-slate-950" />
            <span>{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOP HEADER & CONTROLS */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/30 border border-[#c5a869]/40 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 via-[#c5a869] to-amber-700 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20">
              <Landmark className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">
                  {isAr ? 'محاسبة المنصة والذكاء المالي للمشتركين' : 'Platform Accounting & Financial Intelligence'}
                </h2>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                  PRO SUITE
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#d4af37] font-medium mt-0.5">
                {isAr 
                  ? 'إدارة متكاملة لكافة واردات الاشتراكات، المصاريف التشغيلية، ومؤشرات الأرباح والنمو'
                  : 'Complete ledger for subscriptions revenue, operating expenses, and cashflow intelligence'}
              </p>
            </div>
          </div>

          {/* Quick Action Buttons & Currency Selector */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Currency Switcher Toggle */}
            <div className="bg-slate-950 p-1 rounded-2xl border border-slate-800 flex items-center gap-1 shadow-inner">
              <button
                type="button"
                onClick={() => {
                  const updated = platformFinanceService.updateConfig({ reportingCurrency: 'USD' });
                  setConfig(updated);
                  showToast(isAr ? 'تم تحويل العرض إلى الدولار الأمريكي ($)' : 'Switched display to USD');
                }}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-1.5 ${
                  config.reportingCurrency === 'USD'
                    ? 'bg-amber-400 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>🇺🇸</span>
                <span>USD ($)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  const updated = platformFinanceService.updateConfig({ reportingCurrency: 'SYP' });
                  setConfig(updated);
                  showToast(isAr ? 'تم تحويل العرض إلى الليرة السورية (ل.س)' : 'Switched display to SYP');
                }}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-1.5 ${
                  config.reportingCurrency === 'SYP'
                    ? 'bg-amber-400 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>🇸🇾</span>
                <span>ليرة سورية (SYP)</span>
              </button>
            </div>

            {/* Config Exchange Rate */}
            <button
              type="button"
              onClick={() => setIsConfigOpen(true)}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              title={isAr ? 'إعدادات الصرف والأهداف' : 'Configure Exchange Rate & Targets'}
            >
              <Coins className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">{isAr ? 'سعر الصرف' : 'Rate'}: {Number(config.usdToSypRate).toLocaleString()} ل.س</span>
            </button>

            {/* Export CSV Button */}
            <button
              type="button"
              onClick={handleExportCSV}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>{isAr ? 'تصدير كشف الحساب' : 'Export CSV'}</span>
            </button>
          </div>
        </div>

        {/* FINANCIAL SUMMARY METRIC CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {/* CARD 1: TOTAL REVENUE */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>{isAr ? 'إجمالي الواردات والإيرادات' : 'Total Revenue & Inflow'}</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                {analytics.completedTxCount} {isAr ? 'قيد إيراد مسدد' : 'Completed'}
              </span>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
                {formatNumber(analytics.totalRevenueDisplay)} {analytics.currencyLabel}
              </div>
              {analytics.isSYP && (
                <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                  ≈ ${formatNumber(analytics.totalRevenueUSD, 2)} USD
                </div>
              )}
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span>{isAr ? 'عدد القيود المقبوضة:' : 'Collected Inflows:'}</span>
              <span className="font-bold text-emerald-400 font-mono">
                {analytics.completedTxCount} {isAr ? 'قيد مالي' : 'Entries'}
              </span>
            </div>
          </div>

          {/* CARD 2: TOTAL EXPENSES */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-rose-950/40 via-slate-900 to-slate-900 border border-rose-500/30 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                <TrendingDown className="w-4 h-4 text-rose-400" />
                <span>{isAr ? 'المصاريف والنفقات التشغيلية' : 'Operating Expenses'}</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold">
                {expenses.length} {isAr ? 'بند مصروف' : 'Entries'}
              </span>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-black text-rose-300 font-mono tracking-tight">
                {formatNumber(analytics.totalExpensesDisplay)} {analytics.currencyLabel}
              </div>
              {analytics.isSYP && (
                <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                  ≈ ${formatNumber(analytics.totalExpensesUSD, 2)} USD
                </div>
              )}
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span>{isAr ? 'أكبر بند نفقات:' : 'Major Cost:'}</span>
              <span className="font-bold text-rose-300 truncate max-w-[120px]">
                {analytics.majorCategory ? getCategoryLabel(analytics.majorCategory) : (isAr ? 'لا توجد مصاريف' : 'None')}
              </span>
            </div>
          </div>

          {/* CARD 3: NET PROFIT */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-900 border border-[#c5a869]/50 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#e5cb8e] flex items-center gap-1.5">
                <Wallet className="w-4 h-4 text-[#c5a869]" />
                <span>{isAr ? 'صافي الأرباح (Net Profit)' : 'Net Profit'}</span>
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                analytics.netProfitUSD >= 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
              }`}>
                {formatNumber(analytics.profitMargin, 1)}% {isAr ? 'هامش ربح' : 'Margin'}
              </span>
            </div>
            <div className="mt-3">
              <div className={`text-2xl sm:text-3xl font-black font-mono tracking-tight ${
                analytics.netProfitUSD >= 0 ? 'text-amber-300' : 'text-rose-400'
              }`}>
                {formatNumber(analytics.netProfitDisplay)} {analytics.currencyLabel}
              </div>
              {analytics.isSYP && (
                <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                  ≈ ${formatNumber(analytics.netProfitUSD, 2)} USD
                </div>
              )}
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span>{isAr ? 'متوسط الإيراد للمكتب (ARPU):' : 'ARPU:'}</span>
              <span className="font-bold text-amber-300 font-mono">
                {formatNumber(analytics.arpuDisplay)} {analytics.currencyLabel}
              </span>
            </div>
          </div>

          {/* CARD 4: ANNUAL TARGET & RUN-RATE */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-950/40 via-slate-900 to-slate-900 border border-blue-500/30 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-blue-400" />
                <span>{isAr ? 'الهدف المالي ومعدل الإنجاز' : 'Target & Run-Rate'}</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold">
                {formatNumber(analytics.annualTargetProgress, 1)}%
              </span>
            </div>
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-slate-300 mb-1 font-semibold">
                <span>{isAr ? 'المحقق من الهدف السنوي' : 'Annual Target:'}</span>
                <span className="text-blue-300 font-mono font-bold">
                  {formatNumber(config.annualTargetUSD * analytics.mult)} {analytics.currencyLabel}
                </span>
              </div>
              {/* Progress Bar */}
              <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-400 transition-all duration-500 shadow-sm"
                  style={{ width: `${analytics.annualTargetProgress}%` }}
                />
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span>{isAr ? 'الإيراد السنوي المتوقع (ARR):' : 'Projected ARR:'}</span>
              <span className="font-bold text-blue-300 font-mono">
                {formatNumber(analytics.arrDisplay)} {analytics.currencyLabel}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* INTERNAL SUB-NAVIGATION TABS */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        {/* TAB 0: MASTER GENERAL JOURNAL TABLE (جدول كافة الواردات والمصروفات) */}
        <button
          type="button"
          onClick={() => setSubTab('journal')}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition cursor-pointer flex items-center gap-2 border ${
            subTab === 'journal'
              ? 'bg-gradient-to-r from-emerald-500/20 via-amber-500/15 to-emerald-600/10 text-emerald-300 border-emerald-400 shadow-md ring-1 ring-emerald-400/40'
              : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Receipt className="w-4 h-4 text-emerald-400" />
          <span>{isAr ? '📋 جدول كافة القيود (الواردات والمصروفات)' : 'Master Journal & Entries'}</span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold">
            {expenses.length + transactions.length + firms.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('overview')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition cursor-pointer flex items-center gap-2 border ${
            subTab === 'overview'
              ? 'bg-gradient-to-r from-amber-500/20 to-amber-600/10 text-amber-300 border-[#c5a869] shadow-md'
              : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800'
          }`}
        >
          <PieChart className="w-4 h-4" />
          <span>{isAr ? 'تحليل المشتركين والنمو' : 'Subscriber Analytics'}</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('revenue')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition cursor-pointer flex items-center gap-2 border ${
            subTab === 'revenue'
              ? 'bg-gradient-to-r from-emerald-500/20 to-emerald-600/10 text-emerald-300 border-emerald-500 shadow-md'
              : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <span>{isAr ? 'الواردات والاشتراكات' : 'Revenues'}</span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono">
            {firms.length + transactions.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('expenses')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition cursor-pointer flex items-center gap-2 border ${
            subTab === 'expenses'
              ? 'bg-gradient-to-r from-rose-500/20 to-rose-600/10 text-rose-300 border-rose-500 shadow-md'
              : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800'
          }`}
        >
          <TrendingDown className="w-4 h-4 text-rose-400" />
          <span>{isAr ? 'المصروفات والنفقات' : 'Expenses'}</span>
          <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-mono">
            {expenses.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('statement')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition cursor-pointer flex items-center gap-2 border ${
            subTab === 'statement'
              ? 'bg-gradient-to-r from-blue-500/20 to-blue-600/10 text-blue-300 border-blue-500 shadow-md'
              : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>{isAr ? 'قائمة الدخل والأرباح (P&L)' : 'Income Statement'}</span>
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 0. MASTER GENERAL JOURNAL TABLE (جدول كافة الواردات والمصروفات) */}
      {/* ------------------------------------------------------------- */}
      {subTab === 'journal' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Filter Tabs (All / Revenues / Expenses) */}
            <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setJournalFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  journalFilter === 'all'
                    ? 'bg-amber-400 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>{isAr ? 'كافة القيود' : 'All Entries'}</span>
                <span className="px-1.5 py-0.2 rounded-full bg-black/20 text-[10px] font-mono">
                  {expenses.length + transactions.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setJournalFilter('revenue')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  journalFilter === 'revenue'
                    ? 'bg-emerald-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-emerald-400'
                }`}
              >
                <span>{isAr ? 'الواردات (الإيرادات)' : 'Inflows'}</span>
                <span className="px-1.5 py-0.2 rounded-full bg-black/20 text-[10px] font-mono">
                  {transactions.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setJournalFilter('expense')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  journalFilter === 'expense'
                    ? 'bg-rose-500 text-white shadow'
                    : 'text-slate-400 hover:text-rose-400'
                }`}
              >
                <span>{isAr ? 'المصروفات (النفقات)' : 'Outflows'}</span>
                <span className="px-1.5 py-0.2 rounded-full bg-black/20 text-[10px] font-mono">
                  {expenses.length}
                </span>
              </button>
            </div>

            {/* Search and Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 flex-1 max-w-xl justify-end">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 rtl:right-3 rtl:left-auto top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={journalSearch}
                  onChange={(e) => setJournalSearch(e.target.value)}
                  placeholder={isAr ? 'بحث في القيود، المكاتب، الفواتير...' : 'Search journal entries...'}
                  className="w-full pr-9 pl-4 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
                />
              </div>

              <button
                type="button"
                onClick={() => setIsAddTxOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-lg shadow-emerald-500/20 active:scale-95"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>{isAr ? 'إضافة قيد إيراد' : 'Add Revenue'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsAddExpenseOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-lg shadow-rose-500/20 active:scale-95"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>{isAr ? 'إضافة قيد مصروف' : 'Add Expense'}</span>
              </button>
            </div>
          </div>

          {/* Master Unified Table */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-start">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3.5 px-4 text-start">{isAr ? 'نوع القيد والتاريخ' : 'Type & Date'}</th>
                    <th className="py-3.5 px-4 text-start">{isAr ? 'البيان / المكتب / المستفيد' : 'Description / Firm'}</th>
                    <th className="py-3.5 px-4 text-start">{isAr ? 'التصنيف' : 'Category'}</th>
                    <th className="py-3.5 px-4 text-start">{isAr ? 'المبلغ الأصلي' : 'Original Amount'}</th>
                    <th className="py-3.5 px-4 text-start">{isAr ? `القيمة المعروضة (${analytics.currencyLabel})` : 'Converted Val'}</th>
                    <th className="py-3.5 px-4 text-start">{isAr ? 'طريقة السداد' : 'Payment Method'}</th>
                    <th className="py-3.5 px-4 text-start">{isAr ? 'رقم الإيصال / السند' : 'Invoice Ref'}</th>
                    <th className="py-3.5 px-4 text-center">{isAr ? 'الحالة' : 'Status'}</th>
                    <th className="py-3.5 px-4 text-center">{isAr ? 'الإجراءات' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {/* Generate Combined Ledger List */}
                  {(() => {
                    const combinedList: Array<{
                      id: string;
                      kind: 'revenue' | 'expense';
                      date: string;
                      title: string;
                      subtitle?: string;
                      categoryLabel: string;
                      amount: number;
                      currency: string;
                      displayVal: number;
                      paymentMethod: PaymentMethodType;
                      invoiceRef?: string;
                      status: string;
                      notes?: string;
                      rawExp?: PlatformExpense;
                      rawTx?: PlatformTransaction;
                    }> = [];

                    // 1. Transactions (Revenues)
                    transactions.forEach(t => {
                      const valUSD = platformFinanceService.convertToUSD(t.amount, t.currency);
                      combinedList.push({
                        id: t.id,
                        kind: 'revenue',
                        date: t.date || t.createdAt?.split('T')[0] || '',
                        title: t.firmName,
                        subtitle: t.type === 'subscription_new' ? (isAr ? 'سداد اشتراك جديد' : 'New Subscription') : t.type === 'subscription_renewal' ? (isAr ? 'تجديد اشتراك سنوي' : 'Renewal') : (isAr ? 'خدمات إضافية' : 'Custom'),
                        categoryLabel: isAr ? 'اشتراك / وارد' : 'Subscription Inflow',
                        amount: t.amount,
                        currency: t.currency,
                        displayVal: valUSD * analytics.mult,
                        paymentMethod: t.paymentMethod,
                        invoiceRef: t.invoiceNumber || 'INV-DIR',
                        status: t.status || 'completed',
                        notes: t.notes,
                        rawTx: t
                      });
                    });

                    // 2. Expenses
                    expenses.forEach(e => {
                      const valUSD = platformFinanceService.convertToUSD(e.amount, e.currency);
                      combinedList.push({
                        id: e.id,
                        kind: 'expense',
                        date: e.date || e.createdAt?.split('T')[0] || '',
                        title: e.titleAr,
                        subtitle: e.recipient ? `${isAr ? 'المستلم:' : 'To:'} ${e.recipient}` : undefined,
                        categoryLabel: getCategoryLabel(e.category),
                        amount: e.amount,
                        currency: e.currency,
                        displayVal: -(valUSD * analytics.mult),
                        paymentMethod: e.paymentMethod,
                        invoiceRef: e.invoiceRef || 'EXP-REF',
                        status: 'completed',
                        notes: e.notes,
                        rawExp: e
                      });
                    });

                    // Sort chronologically (newest first)
                    combinedList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

                    // Filter
                    const filtered = combinedList.filter(item => {
                      if (journalFilter === 'revenue' && item.kind !== 'revenue') return false;
                      if (journalFilter === 'expense' && item.kind !== 'expense') return false;
                      if (journalSearch.trim()) {
                        const q = journalSearch.toLowerCase();
                        const match = item.title.toLowerCase().includes(q) ||
                          (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
                          (item.invoiceRef && item.invoiceRef.toLowerCase().includes(q)) ||
                          (item.categoryLabel && item.categoryLabel.toLowerCase().includes(q)) ||
                          (item.notes && item.notes.toLowerCase().includes(q));
                        if (!match) return false;
                      }
                      return true;
                    });

                    if (filtered.length === 0) {
                      return (
                        <tr>
                          <td colSpan={9} className="py-12 text-center text-slate-500 text-xs">
                            <Receipt className="w-8 h-8 mx-auto mb-2 text-slate-600 opacity-50" />
                            <div>{isAr ? 'لا توجد قيود محاسبية مطابقة للبحث أو الفلتر المحدد' : 'No matching journal records found'}</div>
                          </td>
                        </tr>
                      );
                    }

                    return filtered.map((entry) => (
                      <tr key={`${entry.kind}-${entry.id}`} className="hover:bg-slate-800/40 transition-colors">
                        {/* Kind & Date */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black flex items-center gap-1 shrink-0 ${
                              entry.kind === 'revenue'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            }`}>
                              {entry.kind === 'revenue' ? (
                                <>
                                  <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                                  <span>{isAr ? 'وارد / إيراد' : 'Inflow'}</span>
                                </>
                              ) : (
                                <>
                                  <ArrowDownRight className="w-3 h-3 text-rose-400" />
                                  <span>{isAr ? 'مصروف' : 'Outflow'}</span>
                                </>
                              )}
                            </span>
                            <span className="font-mono text-slate-400 text-[11px]">{entry.date}</span>
                          </div>
                        </td>

                        {/* Description / Firm */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-white max-w-[220px] truncate">{entry.title}</div>
                          {entry.subtitle && (
                            <div className="text-[10px] text-slate-400 truncate max-w-[200px]">{entry.subtitle}</div>
                          )}
                          {entry.notes && (
                            <div className="text-[10px] text-amber-300/80 truncate max-w-[200px]">{entry.notes}</div>
                          )}
                        </td>

                        {/* Category */}
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[10px]">
                            {entry.categoryLabel}
                          </span>
                        </td>

                        {/* Original Amount */}
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-300">
                          {entry.kind === 'revenue' ? '+' : '-'}{formatNumber(entry.amount)} {entry.currency}
                        </td>

                        {/* Converted Amount */}
                        <td className={`py-3.5 px-4 font-mono font-black text-sm ${
                          entry.kind === 'revenue' ? 'text-emerald-400' : 'text-rose-400'
                        }`}>
                          {entry.kind === 'revenue' ? '+' : ''}{formatNumber(entry.displayVal)} {analytics.currencyLabel}
                        </td>

                        {/* Payment Method */}
                        <td className="py-3.5 px-4 text-slate-300">
                          <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px]">
                            {getPaymentMethodLabel(entry.paymentMethod)}
                          </span>
                        </td>

                        {/* Invoice Ref */}
                        <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                          {entry.invoiceRef}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                            {isAr ? 'مكتمل ومسدد' : 'Completed'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                if (entry.kind === 'revenue' && entry.rawTx) {
                                  setEditingTx({ ...entry.rawTx });
                                } else if (entry.kind === 'expense' && entry.rawExp) {
                                  setEditingExpense({ ...entry.rawExp });
                                }
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-amber-400/10 transition cursor-pointer border border-transparent hover:border-amber-400/30"
                              title={isAr ? 'تعديل القيد' : 'Edit Entry'}
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                if (entry.kind === 'revenue') {
                                  handleDeleteTransaction(entry.id);
                                } else {
                                  handleDeleteExpense(entry.id);
                                }
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 transition cursor-pointer border border-transparent hover:border-rose-400/30"
                              title={isAr ? 'حذف القيد' : 'Delete Entry'}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 1. OVERVIEW & SUBSCRIBER INTELLIGENCE TAB                     */}
      {/* ------------------------------------------------------------- */}
      {subTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* PLAN REVENUE DISTRIBUTION */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-400" />
                  <span>{isAr ? 'توزيع المشتركين حسب الباقات' : 'Plan Distribution & Share'}</span>
                </h3>
                <span className="text-xs text-slate-400">{firms.length} {isAr ? 'مكتب' : 'Firms'}</span>
              </div>

              <div className="space-y-3">
                {Object.entries(analytics.planStats).map(([key, stat]) => {
                  if (stat.count === 0 && firms.length > 0) return null;
                  const sharePct = analytics.totalRevenueUSD > 0 ? (stat.revenueUSD / analytics.totalRevenueUSD) * 100 : 0;
                  return (
                    <div key={key} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="text-xs font-bold text-slate-200">
                          {isAr ? stat.labelAr : stat.labelEn}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {stat.count} {isAr ? 'مكاتب مشتركة' : 'Subscribers'}
                        </div>
                      </div>
                      <div className="text-end">
                        <div className="text-sm font-bold text-amber-400 font-mono">
                          {formatNumber(stat.revenueUSD * analytics.mult)} {analytics.currencyLabel}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {formatNumber(sharePct, 1)}% {isAr ? 'من الدخل' : 'Share'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* EXPENSE BREAKDOWN BY CATEGORY */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-rose-400" />
                  <span>{isAr ? 'هيكل المصاريف وتوزيع التكاليف' : 'Cost Structure Breakdown'}</span>
                </h3>
                <span className="text-xs text-rose-400 font-mono font-bold">
                  {formatNumber(analytics.totalExpensesDisplay)} {analytics.currencyLabel}
                </span>
              </div>

              <div className="space-y-3">
                {analytics.totalExpensesUSD === 0 ? (
                  <div className="p-6 rounded-2xl bg-slate-950/60 border border-slate-800 text-center text-xs text-slate-400 space-y-1">
                    <p className="font-bold text-slate-300">{isAr ? 'لا توجد مصاريف تشغيلية مدخلة' : 'No Operating Expenses'}</p>
                    <p className="text-[10px]">{isAr ? 'أي بند مصروف يتم إضافته في دفتر القيود سيظهر توزيعه هنا فوراً' : 'Expenses recorded in the journal will appear here'}</p>
                  </div>
                ) : (
                  (Object.keys(analytics.expenseByCategory) as ExpenseCategory[]).map(cat => {
                    const valUSD = analytics.expenseByCategory[cat];
                    if (valUSD <= 0) return null;
                    const pct = analytics.totalExpensesUSD > 0 ? (valUSD / analytics.totalExpensesUSD) * 100 : 0;

                    return (
                      <div key={cat} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-300 font-medium">{getCategoryLabel(cat)}</span>
                          <span className="text-rose-300 font-mono font-bold">
                            {formatNumber(valUSD * analytics.mult)} {analytics.currencyLabel} ({formatNumber(pct, 1)}%)
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-rose-500 rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* SUBSCRIPTION STATUS & RECOVERY */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>{isAr ? 'صحة الاشتراكات والتحصيل' : 'Subscription Health & Collection'}</span>
                </h3>
                <span className="text-xs text-emerald-400 font-bold">
                  {firms.length > 0 ? `${Math.round((analytics.firmPaidCount / firms.length) * 100)}% ${isAr ? 'مسدد' : 'Paid'}` : '100%'}
                </span>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <div>
                      <div className="text-xs font-bold text-white">{isAr ? 'اشتراكات مسددة بالكامل' : 'Paid Subscriptions'}</div>
                      <div className="text-[10px] text-emerald-300/80">{isAr ? 'تحصيل مكتمل ونظامي' : 'Healthy Active'}</div>
                    </div>
                  </div>
                  <span className="text-base font-bold text-emerald-400 font-mono">{analytics.firmPaidCount}</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Clock className="w-5 h-5 text-amber-400" />
                    <div>
                      <div className="text-xs font-bold text-white">{isAr ? 'اشتراكات مستحقة / قيد التحصيل' : 'Pending Collections'}</div>
                      <div className="text-[10px] text-amber-300/80">{isAr ? `إجمالي مستحق: ${formatNumber(analytics.firmPendingAmountUSD * analytics.mult)} ${analytics.currencyLabel}` : 'Active Pending Payment'}</div>
                    </div>
                  </div>
                  <span className="text-base font-bold text-amber-400 font-mono">{analytics.firmPendingCount}</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-5 h-5 text-blue-400" />
                    <div>
                      <div className="text-xs font-bold text-white">{isAr ? 'اشتراكات معفاة رسمياً' : 'Waived Subscriptions'}</div>
                      <div className="text-[10px] text-blue-300/80">{isAr ? 'ترخيص رسمي معفى من الرسوم' : 'Officially Waived'}</div>
                    </div>
                  </div>
                  <span className="text-base font-bold text-blue-400 font-mono">{analytics.firmWaivedCount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. REVENUE & INFLOWS LEDGER TAB                               */}
      {/* ------------------------------------------------------------- */}
      {subTab === 'revenue' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 p-4 rounded-2xl border border-slate-800">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 rtl:right-3 rtl:left-auto top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={txSearch}
                onChange={(e) => setTxSearch(e.target.value)}
                placeholder={isAr ? 'بحث في المكاتب، الدفعات، أو أرقام الفواتير...' : 'Search invoices or firms...'}
                className="w-full pr-9 pl-4 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsAddTxOpen(true)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-lg shadow-emerald-500/20"
              >
                <Plus className="w-4 h-4 text-slate-950 stroke-[3]" />
                <span>{isAr ? 'تسجيل إيراد / دفعة جديدة' : 'Record Revenue'}</span>
              </button>
            </div>
          </div>

          {/* Revenue List Table */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-start">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3.5 px-4 text-start">{isAr ? 'المكتب / الجهة' : 'Firm'}</th>
                    <th className="py-3.5 px-4 text-start">{isAr ? 'نوع الإيراد والباقة' : 'Type / Plan'}</th>
                    <th className="py-3.5 px-4 text-start">{isAr ? 'المبلغ الأصلي' : 'Amount'}</th>
                    <th className="py-3.5 px-4 text-start">{isAr ? `القيمة المعروضة (${analytics.currencyLabel})` : 'Converted'}</th>
                    <th className="py-3.5 px-4 text-start">{isAr ? 'طريقة السداد' : 'Payment Method'}</th>
                    <th className="py-3.5 px-4 text-start">{isAr ? 'التاريخ والفاتورة' : 'Date / Ref'}</th>
                    <th className="py-3.5 px-4 text-center">{isAr ? 'الحالة' : 'Status'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {/* Active Firm Subscriptions Ledger Entries */}
                  {firms
                    .filter(f => !txSearch || f.nameAr?.includes(txSearch) || f.slug?.includes(txSearch))
                    .map(firm => {
                      const sub = firm.subscription;
                      const fee = typeof sub?.annualFee === 'number' ? sub.annualFee : 0;
                      const cur = sub?.currency || 'SAR';
                      const feeUSD = platformFinanceService.convertToUSD(fee, cur);
                      const displayVal = feeUSD * analytics.mult;

                      return (
                        <tr key={firm.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-[#c5a869]/20 border border-[#c5a869]/40 flex items-center justify-center text-[#c5a869] font-bold">
                                <Building2 className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="font-bold text-white text-xs">{firm.nameAr || firm.nameEn || firm.slug}</div>
                                <div className="text-[10px] text-slate-400 font-mono">{firm.slug}.aladl.law</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-amber-300 font-semibold border border-slate-700 inline-block">
                              {sub?.planNameAr || 'اشتراك سنوي'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-300">
                            {formatNumber(fee)} {cur}
                          </td>
                          <td className="py-3.5 px-4 font-mono font-black text-emerald-400 text-sm">
                            +{formatNumber(displayVal)} {analytics.currencyLabel}
                          </td>
                          <td className="py-3.5 px-4 text-slate-300">
                            {sub?.paymentStatus === 'paid' ? (isAr ? 'سداد مكتمل' : 'Paid in full') : sub?.paymentStatus === 'waived' ? (isAr ? 'ترخيص معفى' : 'Waived') : (isAr ? 'قيد التحصيل' : 'Pending')}
                          </td>
                          <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                            {sub?.startDate?.split('T')[0] || '2026-01-01'}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              sub?.paymentStatus === 'paid'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : sub?.paymentStatus === 'waived'
                                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            }`}>
                              {sub?.paymentStatus === 'paid' ? (isAr ? 'مسدد' : 'Paid') : sub?.paymentStatus === 'waived' ? (isAr ? 'معفى رسمياً' : 'Waived') : (isAr ? 'مستحق' : 'Pending')}
                            </span>
                          </td>
                        </tr>
                      );
                    })}

                  {/* Manual Extra Transactions */}
                  {transactions
                    .filter(t => !txSearch || t.firmName.includes(txSearch) || t.invoiceNumber?.includes(txSearch))
                    .map(tx => {
                      const valUSD = platformFinanceService.convertToUSD(tx.amount, tx.currency);
                      const displayVal = valUSD * analytics.mult;

                      return (
                        <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors bg-emerald-950/10">
                          <td className="py-3.5 px-4 font-bold text-white">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-emerald-400" />
                              <span>{tx.firmName}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 font-semibold border border-emerald-500/20">
                              {isAr ? 'خدمة إضافية / تجديد' : 'Add-on Service'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-300">
                            {formatNumber(tx.amount)} {tx.currency}
                          </td>
                          <td className="py-3.5 px-4 font-mono font-black text-emerald-400 text-sm">
                            +{formatNumber(displayVal)} {analytics.currencyLabel}
                          </td>
                          <td className="py-3.5 px-4 text-slate-300">
                            {getPaymentMethodLabel(tx.paymentMethod)}
                          </td>
                          <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                            <div>{tx.date}</div>
                            <div className="text-emerald-400/80">{tx.invoiceNumber}</div>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => handleDeleteTransaction(tx.id)}
                              className="text-slate-500 hover:text-rose-400 p-1 rounded-lg transition"
                              title={isAr ? 'حذف القيد' : 'Delete'}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. OPERATING EXPENSES TAB                                     */}
      {/* ------------------------------------------------------------- */}
      {subTab === 'expenses' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 p-4 rounded-2xl border border-slate-800">
            <div className="flex flex-wrap items-center gap-2 flex-1">
              <div className="relative flex-1 min-w-[200px] max-w-xs">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 rtl:right-3 rtl:left-auto top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={expenseSearch}
                  onChange={(e) => setExpenseSearch(e.target.value)}
                  placeholder={isAr ? 'بحث في المصاريف والنفقات...' : 'Search expenses...'}
                  className="w-full pr-9 pl-4 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:border-rose-400 focus:outline-none"
                />
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-300 focus:border-rose-400 focus:outline-none cursor-pointer"
              >
                <option value="all">{isAr ? 'كافة بنود المصاريف' : 'All Categories'}</option>
                <option value="servers">{isAr ? 'خوادم واستضافة' : 'Servers'}</option>
                <option value="marketing">{isAr ? 'تسويق وإعلانات' : 'Marketing'}</option>
                <option value="domains">{isAr ? 'نطاقات وحماية SSL' : 'Domains'}</option>
                <option value="salaries">{isAr ? 'رواتب ومكافآت' : 'Salaries'}</option>
                <option value="maintenance">{isAr ? 'صيانة ودعم' : 'Maintenance'}</option>
                <option value="other">{isAr ? 'أخرى' : 'Other'}</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsAddExpenseOpen(true)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-lg shadow-rose-500/20"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>{isAr ? 'إضافة مصروف جديد' : 'Add Expense'}</span>
              </button>
            </div>
          </div>

          {/* Expenses List Table */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-start">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3.5 px-4 text-start">{isAr ? 'بيان المصروف' : 'Expense Title'}</th>
                    <th className="py-3.5 px-4 text-start">{isAr ? 'التصنيف' : 'Category'}</th>
                    <th className="py-3.5 px-4 text-start">{isAr ? 'المبلغ الأصلي' : 'Original Amount'}</th>
                    <th className="py-3.5 px-4 text-start">{isAr ? `القيمة المعروضة (${analytics.currencyLabel})` : 'Converted'}</th>
                    <th className="py-3.5 px-4 text-start">{isAr ? 'طريقة الدفع والجهة المستلمة' : 'Payment / Recipient'}</th>
                    <th className="py-3.5 px-4 text-start">{isAr ? 'التاريخ والرقم المرجعي' : 'Date / Ref'}</th>
                    <th className="py-3.5 px-4 text-center">{isAr ? 'إجراءات' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {expenses
                    .filter(e => selectedCategory === 'all' || e.category === selectedCategory)
                    .filter(e => !expenseSearch || e.titleAr.includes(expenseSearch) || e.recipient?.includes(expenseSearch))
                    .map(exp => {
                      const valUSD = platformFinanceService.convertToUSD(exp.amount, exp.currency);
                      const displayVal = valUSD * analytics.mult;

                      return (
                        <tr key={exp.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-white text-xs">{exp.titleAr}</div>
                            {exp.notes && <div className="text-[10px] text-slate-400 mt-0.5">{exp.notes}</div>}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-300 font-semibold border border-rose-500/20 inline-block">
                              {getCategoryLabel(exp.category)}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-300">
                            {formatNumber(exp.amount)} {exp.currency}
                          </td>
                          <td className="py-3.5 px-4 font-mono font-black text-rose-400 text-sm">
                            -{formatNumber(displayVal)} {analytics.currencyLabel}
                          </td>
                          <td className="py-3.5 px-4 text-slate-300">
                            <div>{getPaymentMethodLabel(exp.paymentMethod)}</div>
                            {exp.recipient && <div className="text-[10px] text-slate-400 font-medium">{exp.recipient}</div>}
                          </td>
                          <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                            <div>{exp.date}</div>
                            {exp.invoiceRef && <div className="text-slate-500">{exp.invoiceRef}</div>}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => handleDeleteExpense(exp.id)}
                              className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg transition"
                              title={isAr ? 'حذف المصروف' : 'Delete'}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 4. STATEMENT OF PROFIT & LOSS (P&L) TAB                       */}
      {/* ------------------------------------------------------------- */}
      {subTab === 'statement' && (
        <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6 max-w-4xl mx-auto">
          {/* Statement Header */}
          <div className="text-center border-b border-slate-800 pb-6 space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center mx-auto shadow-lg">
              <Landmark className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-white">
              {isAr ? 'قائمة الأرباح والخسائر للمنصة (P&L Financial Statement)' : 'Platform Profit & Loss Statement'}
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              {isAr ? 'الفترة المالية: السنة الحالية حتى تاريخ اليوم' : 'Period: Year-to-Date'} | {new Date().toLocaleDateString('ar-SA')}
            </p>
          </div>

          {/* Statement Table */}
          <div className="space-y-4">
            {/* 1. REVENUES */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm font-black text-emerald-400 uppercase tracking-wider border-b border-emerald-500/30 pb-1">
                <span>1. {isAr ? 'الإيرادات التشغيلية والواردات (Total Revenues)' : 'Operating Revenues'}</span>
                <span className="font-mono">+{formatNumber(analytics.totalRevenueDisplay)} {analytics.currencyLabel}</span>
              </div>
              <div className="pr-4 rtl:pr-4 rtl:pl-0 pl-4 space-y-1.5 text-xs text-slate-300">
                <div className="flex items-center justify-between">
                  <span>• {isAr ? 'إيرادات اشتراكات مكاتب المحاماة السنوية' : 'Annual Law Firm Subscriptions'}</span>
                  <span className="font-mono text-white">+{formatNumber(analytics.firmSubscriptionsTotalUSD * analytics.mult)} {analytics.currencyLabel}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>• {isAr ? 'إيرادات الخدمات المخصصة والتجديدات الإضافية' : 'Custom Services & Add-ons'}</span>
                  <span className="font-mono text-white">+{formatNumber(analytics.manualTxTotalUSD * analytics.mult)} {analytics.currencyLabel}</span>
                </div>
              </div>
            </div>

            {/* 2. OPERATING EXPENSES */}
            <div className="space-y-2 pt-4">
              <div className="flex items-center justify-between text-sm font-black text-rose-400 uppercase tracking-wider border-b border-rose-500/30 pb-1">
                <span>2. {isAr ? 'المصاريف والنفقات التشغيلية (Operating Expenses)' : 'Operating Expenses'}</span>
                <span className="font-mono">-{formatNumber(analytics.totalExpensesDisplay)} {analytics.currencyLabel}</span>
              </div>
              <div className="pr-4 rtl:pr-4 rtl:pl-0 pl-4 space-y-1.5 text-xs text-slate-300">
                {(Object.keys(analytics.expenseByCategory) as ExpenseCategory[]).map(cat => {
                  const amtUSD = analytics.expenseByCategory[cat];
                  if (amtUSD <= 0) return null;
                  return (
                    <div key={cat} className="flex items-center justify-between">
                      <span>• {getCategoryLabel(cat)}</span>
                      <span className="font-mono text-rose-300">-{formatNumber(amtUSD * analytics.mult)} {analytics.currencyLabel}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. NET OPERATING INCOME (BOTTOM LINE) */}
            <div className="pt-6 border-t-2 border-slate-700">
              <div className="p-4 rounded-2xl bg-slate-950 border border-[#c5a869] flex items-center justify-between">
                <div>
                  <div className="text-base font-black text-white">{isAr ? 'صافي أرباح المنصة (Net Operating Profit)' : 'Net Operating Profit'}</div>
                  <div className="text-xs text-[#c5a869] font-medium">{isAr ? 'هامش الربح الصافي:' : 'Net Margin:'} {formatNumber(analytics.profitMargin, 1)}%</div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-amber-300 font-mono">
                  {formatNumber(analytics.netProfitDisplay)} {analytics.currencyLabel}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={handleExportCSV}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition border border-slate-700"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>{isAr ? 'تحميل التقرير المالي (CSV)' : 'Download P&L Statement'}</span>
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: ADD EXPENSE                                            */}
      {/* ------------------------------------------------------------- */}
      {isAddExpenseOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" dir={isAr ? 'rtl' : 'ltr'}>
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
                  <Plus className="w-4 h-4 stroke-[3]" />
                </div>
                <h3 className="text-base font-bold text-white">
                  {isAr ? 'تسجيل بند مصروف جديد' : 'Record New Expense'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddExpenseOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  {isAr ? 'بيان المصروف *' : 'Expense Description *'}
                </label>
                <input
                  type="text"
                  required
                  value={newExpense.titleAr}
                  onChange={(e) => setNewExpense({ ...newExpense, titleAr: e.target.value })}
                  placeholder={isAr ? 'مثال: اشتراك خوادم، تجديد دومين، إعلانات' : 'e.g. Server hosting, domain renewal'}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-rose-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    {isAr ? 'المبلغ *' : 'Amount *'}
                  </label>
                  <input
                    type="number"
                    min="0.1"
                    step="any"
                    required
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({ ...newExpense, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono font-bold focus:border-rose-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    {isAr ? 'العملة *' : 'Currency *'}
                  </label>
                  <select
                    value={newExpense.currency}
                    onChange={(e) => setNewExpense({ ...newExpense, currency: e.target.value as any })}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-rose-400 focus:outline-none cursor-pointer"
                  >
                    <option value="USD">🇺🇸 دولار أمريكي ($ USD)</option>
                    <option value="SYP">🇸🇾 ليرة سورية (SYP)</option>
                    <option value="SAR">🇸🇦 ريال سعودي (SAR)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    {isAr ? 'التصنيف *' : 'Category *'}
                  </label>
                  <select
                    value={newExpense.category}
                    onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value as any })}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-rose-400 focus:outline-none cursor-pointer"
                  >
                    <option value="servers">خوادم واستضافة سحابية</option>
                    <option value="marketing">تسويق وإعلانات</option>
                    <option value="domains">نطاقات ودومينات</option>
                    <option value="salaries">رواتب ومكافآت</option>
                    <option value="maintenance">صيانة ودعم فني</option>
                    <option value="development">تطوير وبرمجة</option>
                    <option value="legal_banking">رسوم قانونية وبنكية</option>
                    <option value="other">مصاريف أخرى</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    {isAr ? 'طريقة الدفع *' : 'Payment Method *'}
                  </label>
                  <select
                    value={newExpense.paymentMethod}
                    onChange={(e) => setNewExpense({ ...newExpense, paymentMethod: e.target.value as any })}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-rose-400 focus:outline-none cursor-pointer"
                  >
                    <option value="syriatel_cash">سيريتل كاش</option>
                    <option value="al_haram">حوالة الهرم</option>
                    <option value="fouad">حوالة الفؤاد</option>
                    <option value="bank_transfer">تحويل بنكي</option>
                    <option value="cash">نقداً (كاش)</option>
                    <option value="stripe">بطاقة ائتمان / Stripe</option>
                    <option value="usdt_crypto">USDT كريبتو</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    {isAr ? 'الجهة المستلمة' : 'Recipient'}
                  </label>
                  <input
                    type="text"
                    value={newExpense.recipient}
                    onChange={(e) => setNewExpense({ ...newExpense, recipient: e.target.value })}
                    placeholder="مثال: Vercel, Meta, موظف..."
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-rose-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    {isAr ? 'تاريخ المصروف' : 'Date'}
                  </label>
                  <input
                    type="date"
                    value={newExpense.date}
                    onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-rose-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  {isAr ? 'ملاحظات إضافية' : 'Notes'}
                </label>
                <input
                  type="text"
                  value={newExpense.notes}
                  onChange={(e) => setNewExpense({ ...newExpense, notes: e.target.value })}
                  placeholder="ملاحظات توثيقية..."
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-rose-400 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddExpenseOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold cursor-pointer"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 text-white font-bold cursor-pointer shadow-lg shadow-rose-500/30"
                >
                  {isAr ? 'حفظ المصروف' : 'Save Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: ADD REVENUE TRANSACTION                                */}
      {/* ------------------------------------------------------------- */}
      {isAddTxOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" dir={isAr ? 'rtl' : 'ltr'}>
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Receipt className="w-4 h-4 stroke-[3]" />
                </div>
                <h3 className="text-base font-bold text-white">
                  {isAr ? 'تسجيل إيراد / سند قبض جديد' : 'Record Revenue Transaction'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddTxOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTransaction} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  {isAr ? 'اسم المكتب أو العميل *' : 'Firm / Client Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={newTx.firmName}
                  onChange={(e) => setNewTx({ ...newTx, firmName: e.target.value })}
                  placeholder="مثال: مكتب النحوي للمحاماة، أو عميل خدمة..."
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-emerald-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    {isAr ? 'المبلغ *' : 'Amount *'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newTx.amount}
                    onChange={(e) => setNewTx({ ...newTx, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono font-bold focus:border-emerald-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    {isAr ? 'العملة *' : 'Currency *'}
                  </label>
                  <select
                    value={newTx.currency}
                    onChange={(e) => setNewTx({ ...newTx, currency: e.target.value as any })}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-emerald-400 focus:outline-none cursor-pointer"
                  >
                    <option value="USD">🇺🇸 دولار أمريكي ($ USD)</option>
                    <option value="SYP">🇸🇾 ليرة سورية (SYP)</option>
                    <option value="SAR">🇸🇦 ريال سعودي (SAR)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    {isAr ? 'طريقة التحصيل *' : 'Payment Method *'}
                  </label>
                  <select
                    value={newTx.paymentMethod}
                    onChange={(e) => setNewTx({ ...newTx, paymentMethod: e.target.value as any })}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-emerald-400 focus:outline-none cursor-pointer"
                  >
                    <option value="syriatel_cash">سيريتل كاش</option>
                    <option value="al_haram">حوالة الهرم</option>
                    <option value="fouad">حوالة الفؤاد</option>
                    <option value="bank_transfer">تحويل بنكي</option>
                    <option value="cash">نقداً (كاش)</option>
                    <option value="stripe">بطاقة ائتمان / Stripe</option>
                    <option value="usdt_crypto">USDT كريبتو</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    {isAr ? 'رقم الإيصال / الفاتورة' : 'Invoice Ref'}
                  </label>
                  <input
                    type="text"
                    value={newTx.invoiceNumber}
                    onChange={(e) => setNewTx({ ...newTx, invoiceNumber: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:border-emerald-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddTxOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold cursor-pointer"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-slate-950 font-bold cursor-pointer shadow-lg shadow-emerald-500/30"
                >
                  {isAr ? 'تسجيل الإيراد' : 'Save Revenue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: EDIT REVENUE TRANSACTION                               */}
      {/* ------------------------------------------------------------- */}
      {editingTx && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" dir={isAr ? 'rtl' : 'ltr'}>
          <div className="bg-slate-900 border border-amber-500/50 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center">
                  <Edit3 className="w-4 h-4 stroke-[3]" />
                </div>
                <h3 className="text-base font-bold text-white">
                  {isAr ? 'تعديل قيد الإيراد / الدفعة' : 'Edit Revenue Transaction'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingTx(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditTransaction} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  {isAr ? 'اسم المكتب أو العميل *' : 'Firm / Client Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={editingTx.firmName}
                  onChange={(e) => setEditingTx({ ...editingTx, firmName: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    {isAr ? 'المبلغ *' : 'Amount *'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={editingTx.amount}
                    onChange={(e) => setEditingTx({ ...editingTx, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono font-bold focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    {isAr ? 'العملة *' : 'Currency *'}
                  </label>
                  <select
                    value={editingTx.currency}
                    onChange={(e) => setEditingTx({ ...editingTx, currency: e.target.value as any })}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-400 focus:outline-none cursor-pointer"
                  >
                    <option value="USD">🇺🇸 دولار أمريكي ($ USD)</option>
                    <option value="SYP">🇸🇾 ليرة سورية (SYP)</option>
                    <option value="SAR">🇸🇦 ريال سعودي (SAR)</option>
                    <option value="AED">🇦🇪 درهم إماراتي (AED)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    {isAr ? 'طريقة التحصيل' : 'Payment Method'}
                  </label>
                  <select
                    value={editingTx.paymentMethod}
                    onChange={(e) => setEditingTx({ ...editingTx, paymentMethod: e.target.value as any })}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-400 focus:outline-none cursor-pointer"
                  >
                    <option value="bank_transfer">تحويل بنكي</option>
                    <option value="cash">نقداً (كاش)</option>
                    <option value="syriatel_cash">سيريتل كاش</option>
                    <option value="al_haram">حوالة الهرم</option>
                    <option value="fouad">حوالة الفؤاد</option>
                    <option value="stripe">بطاقة ائتمان / Stripe</option>
                    <option value="usdt_crypto">USDT كريبتو</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    {isAr ? 'رقم الإيصال / الفاتورة' : 'Invoice Ref'}
                  </label>
                  <input
                    type="text"
                    value={editingTx.invoiceNumber || ''}
                    onChange={(e) => setEditingTx({ ...editingTx, invoiceNumber: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    {isAr ? 'تاريخ الدفعة' : 'Date'}
                  </label>
                  <input
                    type="date"
                    value={editingTx.date}
                    onChange={(e) => setEditingTx({ ...editingTx, date: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    {isAr ? 'نوع الإيراد' : 'Type'}
                  </label>
                  <select
                    value={editingTx.type}
                    onChange={(e) => setEditingTx({ ...editingTx, type: e.target.value as any })}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-400 focus:outline-none"
                  >
                    <option value="subscription_new">سداد اشتراك جديد</option>
                    <option value="subscription_renewal">تجديد اشتراك سنوي</option>
                    <option value="custom_service">خدمات وتطوير مخصص</option>
                    <option value="other">إيراد آخر</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  {isAr ? 'ملاحظات القيد' : 'Notes'}
                </label>
                <input
                  type="text"
                  value={editingTx.notes || ''}
                  onChange={(e) => setEditingTx({ ...editingTx, notes: e.target.value })}
                  placeholder="ملاحظات توثيقية..."
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingTx(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold cursor-pointer"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold cursor-pointer shadow-lg shadow-amber-400/30"
                >
                  {isAr ? 'حفظ تعديلات القيد' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: EDIT EXPENSE ENTRY                                     */}
      {/* ------------------------------------------------------------- */}
      {editingExpense && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" dir={isAr ? 'rtl' : 'ltr'}>
          <div className="bg-slate-900 border border-rose-500/50 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
                  <Edit3 className="w-4 h-4 stroke-[3]" />
                </div>
                <h3 className="text-base font-bold text-white">
                  {isAr ? 'تعديل قيد المصروف' : 'Edit Expense'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingExpense(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditExpense} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  {isAr ? 'عنوان وبند المصروف *' : 'Expense Title *'}
                </label>
                <input
                  type="text"
                  required
                  value={editingExpense.titleAr}
                  onChange={(e) => setEditingExpense({ ...editingExpense, titleAr: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-rose-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    {isAr ? 'المبلغ *' : 'Amount *'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={editingExpense.amount}
                    onChange={(e) => setEditingExpense({ ...editingExpense, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono font-bold focus:border-rose-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    {isAr ? 'العملة *' : 'Currency *'}
                  </label>
                  <select
                    value={editingExpense.currency}
                    onChange={(e) => setEditingExpense({ ...editingExpense, currency: e.target.value as any })}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-rose-400 focus:outline-none cursor-pointer"
                  >
                    <option value="USD">🇺🇸 دولار أمريكي ($ USD)</option>
                    <option value="SYP">🇸🇾 ليرة سورية (SYP)</option>
                    <option value="SAR">🇸🇦 ريال سعودي (SAR)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    {isAr ? 'التصنيف *' : 'Category *'}
                  </label>
                  <select
                    value={editingExpense.category}
                    onChange={(e) => setEditingExpense({ ...editingExpense, category: e.target.value as ExpenseCategory })}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-rose-400 focus:outline-none cursor-pointer"
                  >
                    <option value="servers">خوادم واستضافة سحابية</option>
                    <option value="marketing">تسويق وإعلانات</option>
                    <option value="domains">نطاقات وشهادات أمان</option>
                    <option value="salaries">رواتب ومكافآت</option>
                    <option value="development">تطوير وبرمجة</option>
                    <option value="maintenance">صيانة ودعم فني</option>
                    <option value="legal_banking">رسوم قانونية وبنكية</option>
                    <option value="other">مصاريف تشغيلية عامة</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    {isAr ? 'طريقة الدفع *' : 'Payment Method *'}
                  </label>
                  <select
                    value={editingExpense.paymentMethod}
                    onChange={(e) => setEditingExpense({ ...editingExpense, paymentMethod: e.target.value as any })}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-rose-400 focus:outline-none cursor-pointer"
                  >
                    <option value="bank_transfer">تحويل بنكي</option>
                    <option value="cash">نقداً (كاش)</option>
                    <option value="syriatel_cash">سيريتل كاش</option>
                    <option value="al_haram">حوالة الهرم</option>
                    <option value="fouad">حوالة الفؤاد</option>
                    <option value="stripe">بطاقة ائتمان / Stripe</option>
                    <option value="usdt_crypto">USDT كريبتو</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    {isAr ? 'الجهة المستلمة' : 'Recipient'}
                  </label>
                  <input
                    type="text"
                    value={editingExpense.recipient || ''}
                    onChange={(e) => setEditingExpense({ ...editingExpense, recipient: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-rose-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    {isAr ? 'تاريخ المصروف' : 'Date'}
                  </label>
                  <input
                    type="date"
                    value={editingExpense.date}
                    onChange={(e) => setEditingExpense({ ...editingExpense, date: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-rose-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  {isAr ? 'رقم الإيصال / الفاتورة' : 'Invoice Ref'}
                </label>
                <input
                  type="text"
                  value={editingExpense.invoiceRef || ''}
                  onChange={(e) => setEditingExpense({ ...editingExpense, invoiceRef: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-rose-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  {isAr ? 'ملاحظات إضافية' : 'Notes'}
                </label>
                <input
                  type="text"
                  value={editingExpense.notes || ''}
                  onChange={(e) => setEditingExpense({ ...editingExpense, notes: e.target.value })}
                  placeholder="ملاحظات توثيقية..."
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-rose-400 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingExpense(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold cursor-pointer"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 text-white font-bold cursor-pointer shadow-lg shadow-rose-500/30"
                >
                  {isAr ? 'حفظ تعديلات المصروف' : 'Save Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: EXCHANGE RATE & FINANCIAL CONFIG                      */}
      {/* ------------------------------------------------------------- */}
      {isConfigOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" dir={isAr ? 'rtl' : 'ltr'}>
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center">
                  <Coins className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-white">
                  {isAr ? 'إعدادات أسعار الصرف والأهداف المالية' : 'Financial Settings & Targets'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsConfigOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  {isAr ? 'سعر صرف الليرة السورية مقابل 1 دولار (SYP / USD) *' : 'SYP per 1 USD Rate *'}
                </label>
                <input
                  type="number"
                  value={config.usdToSypRate}
                  onChange={(e) => setConfig({ ...config, usdToSypRate: parseFloat(e.target.value) || 15000 })}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono font-bold focus:border-amber-400 focus:outline-none"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  {isAr ? 'يتم استخدامه في التحويل الفوري بين الليرة السورية والدولار لكافة التقارير' : 'Used for dynamic currency calculation'}
                </p>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  {isAr ? 'الهدف المالي السنوي للمنصة ($ USD)' : 'Annual Revenue Target ($ USD)'}
                </label>
                <input
                  type="number"
                  value={config.annualTargetUSD}
                  onChange={(e) => setConfig({ ...config, annualTargetUSD: parseFloat(e.target.value) || 36000 })}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono font-bold focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsConfigOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold cursor-pointer"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    platformFinanceService.updateConfig(config);
                    refreshData();
                    setIsConfigOpen(false);
                    showToast(isAr ? 'تم حفظ إعدادات الصرف والأهداف' : 'Settings saved');
                  }}
                  className="px-6 py-2.5 rounded-xl bg-amber-400 text-slate-950 font-bold cursor-pointer shadow-lg shadow-amber-400/20"
                >
                  {isAr ? 'حفظ التعديلات' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {deleteConfirmTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md p-6 rounded-3xl bg-slate-900 border border-rose-500/50 shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center mx-auto text-rose-400">
              <Trash2 className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-1">
                {isAr ? 'تأكيد حذف القيد المحاسبي' : 'Confirm Entry Deletion'}
              </h3>
              <p className="text-xs text-slate-300">
                {isAr 
                  ? `هل أنت متأكد من رغبتك في حذف "${deleteConfirmTarget.title}" ${deleteConfirmTarget.amount ? `بمبلغ (${deleteConfirmTarget.amount} ${deleteConfirmTarget.currency})` : ''} نهائياً من سجلات المحاسبة؟`
                  : `Are you sure you want to permanently delete "${deleteConfirmTarget.title}" ${deleteConfirmTarget.amount ? `(${deleteConfirmTarget.amount} ${deleteConfirmTarget.currency})` : ''}?`}
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmTarget(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (deleteConfirmTarget.type === 'expense') {
                    platformFinanceService.deleteExpense(deleteConfirmTarget.id);
                    refreshData();
                    showToast(isAr ? 'تم حذف بند المصروف' : 'Expense deleted');
                  } else {
                    platformFinanceService.deleteTransaction(deleteConfirmTarget.id);
                    refreshData();
                    showToast(isAr ? 'تم حذف القيد المالي' : 'Transaction deleted');
                  }
                  setDeleteConfirmTarget(null);
                }}
                className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition cursor-pointer shadow-lg shadow-rose-600/30"
              >
                {isAr ? 'نعم، حذف نهائي' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
