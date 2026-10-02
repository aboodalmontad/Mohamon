import React, { useState } from 'react';
import { 
  Calendar, 
  CheckCircle2, 
  Clock, 
  CreditCard, 
  DollarSign, 
  Edit3, 
  ExternalLink, 
  Plus, 
  Power, 
  RefreshCw, 
  Search, 
  ShieldAlert, 
  ShieldCheck, 
  Sliders, 
  Sparkles, 
  Tag, 
  TrendingUp, 
  X,
  Database,
  Check,
  Users,
  Building2,
  AlertTriangle,
  MapPin,
  Phone,
  Mail,
  FileText,
  UserCheck,
  LayoutGrid,
  List,
  Settings2,
  Key,
  Copy,
  Globe,
  Trash2,
  Receipt,
  Wallet,
  History,
  Coins,
  AlignJustify
} from 'lucide-react';
import { LawFirm, FirmSubscription, SubscriptionPlanTier, SubscriptionStatus } from '../types';
import { firmService, ensureFirmSubscription } from '../services/firmService';
import { platformFinanceService, PaymentMethodType, PlatformTransaction } from '../services/platformFinanceService';

interface FirmSubscriptionsTabProps {
  firms: LawFirm[];
  lang: 'ar' | 'en' | 'tr';
  onFirmsUpdated: () => void;
  showToast: (msg: string) => void;
  onSelectFirmToManage: (firmSlug: string) => void;
  onDeleteFirm: (firm: LawFirm) => void;
  onOpenPasswordModal: (firm: LawFirm) => void;
  onSwitchToFirm: (firm: LawFirm) => void;
}

export const FirmSubscriptionsTab: React.FC<FirmSubscriptionsTabProps> = ({
  firms,
  lang,
  onFirmsUpdated,
  showToast,
  onSelectFirmToManage,
  onDeleteFirm,
  onOpenPasswordModal,
  onSwitchToFirm,
}) => {
  const isAr = lang === 'ar';
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [viewMode, setViewMode] = useState<'records' | 'table'>('records');
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  
  // Subscription edit modal state
  const [editingFirm, setEditingFirm] = useState<LawFirm | null>(null);
  const [editForm, setEditForm] = useState<FirmSubscription | null>(null);
  const [modalTab, setModalTab] = useState<'plan' | 'payment'>('plan');

  // Payment states inside subscription edit modal
  const [payAmount, setPayAmount] = useState<number>(3500);
  const [payCurrency, setPayCurrency] = useState<'SAR' | 'USD' | 'SYP' | 'AED'>('SAR');
  const [payMethod, setPayMethod] = useState<PaymentMethodType>('bank_transfer');
  const [payDate, setPayDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [payInvoiceRef, setPayInvoiceRef] = useState<string>('');
  const [payNotes, setPayNotes] = useState<string>('');
  const [payType, setPayType] = useState<'subscription_renewal' | 'subscription_new' | 'custom_service'>('subscription_renewal');
  const [payExtendOneYear, setPayExtendOneYear] = useState<boolean>(true);
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [firmPaymentHistory, setFirmPaymentHistory] = useState<PlatformTransaction[]>([]);
  const [deleteTxConfirmTarget, setDeleteTxConfirmTarget] = useState<string | null>(null);

  // Add new firm modal state
  const [isAddFirmModalOpen, setIsAddFirmModalOpen] = useState(false);
  const [newFirmForm, setNewFirmForm] = useState({
    nameAr: '',
    nameEn: '',
    slug: '',
    taglineAr: '',
    cityAr: 'الرياض',
    countryAr: 'المملكة العربية السعودية',
    phone: '',
    email: '',
    adminPassword: '123',
    planTier: 'professional' as SubscriptionPlanTier,
    annualFee: 3500,
    currency: 'SAR',
    paymentStatus: 'paid',
    aboutTextAr: '',
    founderName: '',
  });

  // Edit firm full profile modal state
  const [editingProfileFirm, setEditingProfileFirm] = useState<LawFirm | null>(null);
  const [profileForm, setProfileForm] = useState({
    nameAr: '',
    nameEn: '',
    taglineAr: '',
    cityAr: '',
    countryAr: '',
    phone: '',
    email: '',
    aboutTextAr: '',
    currency: 'SAR',
    themeColor: '#c5a869',
    logoUrl: '',
    adminPassword: '',
    status: 'active',
  });

  const handleOpenProfileEdit = (firm: LawFirm) => {
    setEditingProfileFirm(firm);
    setProfileForm({
      nameAr: firm.nameAr || '',
      nameEn: firm.nameEn || '',
      taglineAr: firm.taglineAr || firm.data?.settings?.sloganAr || '',
      cityAr: firm.cityAr || firm.data?.settings?.cityAr || 'الرياض',
      countryAr: firm.countryAr || firm.data?.settings?.countryAr || 'المملكة العربية السعودية',
      phone: firm.phone || firm.data?.settings?.phone || '',
      email: firm.email || firm.data?.settings?.email || '',
      aboutTextAr: firm.data?.settings?.aboutTextAr || '',
      currency: firm.data?.settings?.currency || 'SAR',
      themeColor: firm.themeColor || firm.data?.settings?.primaryColor || '#c5a869',
      logoUrl: firm.logoUrl || firm.data?.settings?.customLogoUrl || '',
      adminPassword: firm.adminPassword || firm.data?.settings?.adminPassword || '123456',
      status: firm.status || 'active',
    });
  };

  const handleSaveProfile = async () => {
    if (!editingProfileFirm) return;
    if (!profileForm.nameAr.trim()) {
      alert(isAr ? 'يرجى إدخال اسم المكتب الرسمي' : 'Please enter firm name');
      return;
    }

    const updated: LawFirm = {
      ...editingProfileFirm,
      nameAr: profileForm.nameAr.trim(),
      nameEn: profileForm.nameEn.trim(),
      taglineAr: profileForm.taglineAr.trim(),
      cityAr: profileForm.cityAr.trim(),
      countryAr: profileForm.countryAr.trim(),
      phone: profileForm.phone.trim(),
      email: profileForm.email.trim(),
      themeColor: profileForm.themeColor,
      logoUrl: profileForm.logoUrl.trim(),
      adminPassword: profileForm.adminPassword.trim(),
      status: profileForm.status as any,
      data: {
        ...editingProfileFirm.data,
        settings: {
          ...editingProfileFirm.data.settings,
          firmNameAr: profileForm.nameAr.trim(),
          firmNameEn: profileForm.nameEn.trim(),
          sloganAr: profileForm.taglineAr.trim(),
          cityAr: profileForm.cityAr.trim(),
          countryAr: profileForm.countryAr.trim(),
          phone: profileForm.phone.trim(),
          email: profileForm.email.trim(),
          aboutTextAr: profileForm.aboutTextAr.trim(),
          currency: profileForm.currency,
          primaryColor: profileForm.themeColor,
          customLogoUrl: profileForm.logoUrl.trim(),
          adminPassword: profileForm.adminPassword.trim(),
        }
      }
    };

    const res = await firmService.saveFirm(updated);
    if (res.success) {
      showToast(isAr ? `✅ تم تحديث بيانات مكتب "${profileForm.nameAr}" بنجاح!` : 'Firm profile updated successfully');
      setEditingProfileFirm(null);
      onFirmsUpdated();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('aladl_firms_updated'));
      }
    } else {
      alert(res.message);
    }
  };

  const handleCreateNewFirm = async () => {
    if (!newFirmForm.nameAr.trim()) {
      alert(isAr ? 'يرجى إدخال اسم المكتب الرسمي بالعربية' : 'Please enter firm name');
      return;
    }

    const res = await firmService.createFirm({
      nameAr: newFirmForm.nameAr.trim(),
      nameEn: newFirmForm.nameEn.trim(),
      slug: newFirmForm.slug.trim(),
      cityAr: newFirmForm.cityAr.trim(),
      countryAr: newFirmForm.countryAr.trim(),
      phone: newFirmForm.phone.trim(),
      email: newFirmForm.email.trim(),
      adminPassword: newFirmForm.adminPassword.trim() || '123456',
      taglineAr: newFirmForm.taglineAr.trim(),
    });

    if (res.success && res.firm) {
      const createdFirm = res.firm;
      createdFirm.subscription = {
        planTier: newFirmForm.planTier,
        planNameAr: newFirmForm.planTier === 'enterprise' ? 'الباقة الماسية الشاملة' : newFirmForm.planTier === 'professional' ? 'الباقة السنوية الاحترافية' : 'الباقة السنوية القياسية',
        planNameEn: newFirmForm.planTier === 'enterprise' ? 'Enterprise Diamond Plan' : newFirmForm.planTier === 'professional' ? 'Professional Plan' : 'Standard Plan',
        status: 'active',
        isSiteActive: true,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        annualFee: Number(newFirmForm.annualFee) || 3500,
        currency: newFirmForm.currency,
        paymentStatus: newFirmForm.paymentStatus as any,
      };
      createdFirm.data.settings.currency = newFirmForm.currency;
      if (newFirmForm.aboutTextAr.trim()) {
        createdFirm.data.settings.aboutTextAr = newFirmForm.aboutTextAr.trim();
      }
      if (newFirmForm.founderName.trim() && createdFirm.data.partners?.[0]) {
        createdFirm.data.partners[0].name = newFirmForm.founderName.trim();
      }

      await firmService.saveFirm(createdFirm);

      if (newFirmForm.paymentStatus === 'paid' && Number(newFirmForm.annualFee) > 0) {
        platformFinanceService.addTransaction({
          firmId: createdFirm.id,
          firmName: createdFirm.nameAr,
          type: 'subscription_new',
          amount: Number(newFirmForm.annualFee),
          currency: newFirmForm.currency as any,
          date: new Date().toISOString().split('T')[0],
          paymentMethod: 'bank_transfer',
          invoiceNumber: `INV-${createdFirm.slug.slice(0, 4).toUpperCase()}-${Date.now().toString().slice(-4)}`,
          status: 'completed',
          notes: `سداد اشتراك جديد للمكتب - ${createdFirm.nameAr}`,
        });
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('aladl_finance_updated'));
        }
      }

      showToast(isAr ? `✅ تم إنشاء المكتب "${createdFirm.nameAr}" بنجاح!` : 'Firm created successfully');
      setIsAddFirmModalOpen(false);
      setNewFirmForm({
        nameAr: '',
        nameEn: '',
        slug: '',
        taglineAr: '',
        cityAr: 'الرياض',
        countryAr: 'المملكة العربية السعودية',
        phone: '',
        email: '',
        adminPassword: '123',
        planTier: 'professional',
        annualFee: 3500,
        currency: 'SAR',
        paymentStatus: 'paid',
        aboutTextAr: '',
        founderName: '',
      });
      onFirmsUpdated();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('aladl_firms_updated'));
      }
    } else {
      alert(res.message);
    }
  };

  // Quick renewal action
  const handleRenewOneYear = async (firm: LawFirm) => {
    const res = await firmService.renewFirmSubscription(firm.id, 1);
    if (res.success) {
      showToast(res.message);
      onFirmsUpdated();
    } else {
      alert(res.message);
    }
  };

  // Quick toggle site active
  const handleToggleSiteActive = async (firm: LawFirm) => {
    const currentStatus = firm.subscription?.isSiteActive ?? true;
    const res = await firmService.toggleFirmSiteStatus(firm.id, !currentStatus);
    if (res.success) {
      showToast(res.message);
      onFirmsUpdated();
    }
  };

  // Sync all to Supabase
  const handleSyncAllToSupabase = async () => {
    setIsSyncingAll(true);
    const res = await firmService.syncAllToSupabase();
    setIsSyncingAll(false);
    showToast(res.message);
    if (res.success) {
      onFirmsUpdated();
    }
  };

  // Copy direct link
  const handleCopyLink = (slug: string) => {
    const url = `${window.location.origin}${window.location.pathname}?firm=${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    showToast(isAr ? `تم نسخ الرابط المباشر للمكتب (${slug})` : `Copied link for ${slug}`);
    setTimeout(() => setCopiedSlug(null), 2500);
  };

  // Open edit modal
  const handleOpenEdit = (firm: LawFirm, initialTab: 'plan' | 'payment' = 'plan') => {
    const ensured = ensureFirmSubscription({ ...firm });
    setEditingFirm(ensured);
    const sub = { ...ensured.subscription! };
    setEditForm(sub);
    setModalTab(initialTab);
    setPayAmount(sub.annualFee || 3500);
    setPayCurrency((sub.currency as any) || 'SAR');
    setPayDate(new Date().toISOString().split('T')[0]);
    setPayInvoiceRef(`INV-SUB-${ensured.slug.slice(0, 4).toUpperCase()}-${Date.now().toString().slice(-5)}`);
    setPayNotes(`سداد اشتراك سنوي - ${ensured.nameAr} (${sub.planNameAr || 'الباقة السنوية'})`);
    setPayMethod('bank_transfer');
    setPayType('subscription_renewal');
    setPayExtendOneYear(true);

    const pastTx = platformFinanceService.getTransactions().filter(
      t => t.firmId === ensured.id || t.firmName === ensured.nameAr || t.firmName === ensured.slug
    );
    setFirmPaymentHistory(pastTx);
  };

  // Save edited subscription
  const handleSaveSubscription = async () => {
    if (!editingFirm || !editForm) return;
    const res = await firmService.updateFirmSubscription(editingFirm.id, editForm);
    if (res.success) {
      showToast(res.message);
      setEditingFirm(null);
      setEditForm(null);
      onFirmsUpdated();
    } else {
      alert(res.message);
    }
  };

  // Process and record payment directly to Platform Finance
  const handleProcessPayment = async () => {
    if (!editingFirm || !editForm) return;
    if (payAmount <= 0) {
      alert(isAr ? 'يرجى إدخال مبلغ صحيح للدفعة' : 'Please enter a valid payment amount');
      return;
    }

    setIsProcessingPayment(true);
    try {
      // 1. Add transaction to Platform Finance Ledger
      const newTx = platformFinanceService.addTransaction({
        firmId: editingFirm.id,
        firmName: editingFirm.nameAr,
        type: payType,
        amount: Number(payAmount),
        currency: payCurrency,
        date: payDate || new Date().toISOString().split('T')[0],
        paymentMethod: payMethod,
        invoiceNumber: payInvoiceRef || `INV-${Date.now().toString().slice(-6)}`,
        status: 'completed',
        notes: payNotes || `سداد اشتراك - ${editingFirm.nameAr}`
      });

      // 2. Compute new end date if extend by 1 year is checked
      let updatedEndDate = editForm.endDate;
      if (payExtendOneYear) {
        const currentEnd = new Date(editForm.endDate).getTime();
        const baseTime = (!isNaN(currentEnd) && currentEnd > Date.now()) ? currentEnd : Date.now();
        updatedEndDate = new Date(baseTime + 365 * 24 * 60 * 60 * 1000).toISOString();
      }

      // 3. Update subscription in editForm
      const updatedSub: FirmSubscription = {
        ...editForm,
        paymentStatus: 'paid',
        status: 'active',
        isSiteActive: true,
        annualFee: Number(payAmount),
        currency: payCurrency,
        endDate: updatedEndDate,
        notes: editForm.notes 
          ? `${editForm.notes}\n[تم سداد ${payAmount} ${payCurrency} بتاريخ ${payDate} برقم إيصال ${payInvoiceRef}]`
          : `[تم سداد ${payAmount} ${payCurrency} بتاريخ ${payDate} برقم إيصال ${payInvoiceRef}]`
      };

      setEditForm(updatedSub);

      // 4. Save to firmService
      await firmService.updateFirmSubscription(editingFirm.id, updatedSub);

      // 5. Notify Platform Finance and Firms listeners in real time
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('aladl_finance_updated'));
        window.dispatchEvent(new CustomEvent('aladl_firms_updated'));
      }

      // Update past transactions list
      setFirmPaymentHistory(prev => [newTx, ...prev]);

      showToast(isAr 
        ? `✅ تم سداد الدفعة بنجاح بمبلغ ${payAmount} ${payCurrency} وترحيل القيد لصفحة محاسبة المنصة وتفعيل المكتب!`
        : `Payment of ${payAmount} ${payCurrency} posted to platform accounting!`
      );

      onFirmsUpdated();
    } catch (err: any) {
      alert(`Error processing payment: ${err.message}`);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Delete past transaction from history
  const handleDeletePastTx = (txId: string) => {
    setDeleteTxConfirmTarget(txId);
  };

  // Calculation of platform subscription stats
  const totalFirms = firms.length;
  const activeFirms = firms.filter((f) => {
    const sub = f.subscription;
    return sub && sub.isSiteActive !== false && sub.status === 'active';
  }).length;

  const suspendedFirms = firms.filter((f) => {
    const sub = f.subscription;
    return sub && (sub.isSiteActive === false || sub.status === 'suspended');
  }).length;

  const expiredFirms = firms.filter((f) => {
    const sub = f.subscription;
    if (!sub || !sub.endDate) return false;
    return new Date(sub.endDate).getTime() < Date.now();
  }).length;

  const totalAnnualRevenueSAR = firms.reduce((acc, f) => {
    const sub = f.subscription;
    if (!sub || !sub.annualFee) return acc;
    const fee = sub.currency === 'USD' ? sub.annualFee * 3.75 : sub.annualFee;
    return acc + fee;
  }, 0);

  // Filtered firms
  const filteredFirms = firms.filter((firm) => {
    const sub = firm.subscription;
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      firm.nameAr.toLowerCase().includes(q) ||
      (firm.nameEn && firm.nameEn.toLowerCase().includes(q)) ||
      firm.slug.toLowerCase().includes(q) ||
      (firm.cityAr && firm.cityAr.toLowerCase().includes(q)) ||
      (firm.phone && firm.phone.toLowerCase().includes(q));

    if (!matchesSearch) return false;

    if (filterStatus === 'all') return true;
    if (filterStatus === 'active') {
      return sub && sub.isSiteActive !== false && sub.status === 'active';
    }
    if (filterStatus === 'suspended') {
      return sub && (sub.isSiteActive === false || sub.status === 'suspended');
    }
    if (filterStatus === 'expired') {
      return sub && sub.endDate && new Date(sub.endDate).getTime() < Date.now();
    }
    return true;
  });

  return (
    <div className="space-y-8" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Premium Banner: Subscriptions Overview */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-[2rem] bg-slate-900 border border-slate-800 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/4 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 shadow-lg">
                <Building2 className="w-6 h-6 text-[#c5a869]" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white font-serif-title tracking-tight">
                {isAr ? `شبكة المكاتب القانونية والاشتراكات` : `Law Firms Network & Subscriptions`}
              </h2>
            </div>
            <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
              {isAr
                ? 'لوحة تحكم مركزية لمراقبة أداء المكاتب، تتبع سريان التراخيص السنوية، وإدارة التواجد الرقمي للمشتركين بفعالية ومصداقية عالية.'
                : 'Centralized control panel for monitoring firm performance, tracking annual licenses, and managing digital presence for all subscribers.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <button
              type="button"
              onClick={() => setIsAddFirmModalOpen(true)}
              className="flex-1 lg:flex-none px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-[#c5a869] hover:from-amber-300 hover:to-amber-500 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 transition active:scale-95 cursor-pointer"
            >
              <Plus className="w-5 h-5 stroke-[3]" />
              <span>{isAr ? 'إضافة مكتب جديد' : 'Add New Firm'}</span>
            </button>

            <button
              onClick={handleSyncAllToSupabase}
              disabled={isSyncingAll}
              className="flex-1 lg:flex-none px-5 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm flex items-center justify-center gap-2 border border-slate-700 transition shadow-xl active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncingAll ? 'animate-spin' : ''}`} />
              <span>{isAr ? 'تحديث البيانات' : 'Refresh Data'}</span>
            </button>
            
            <button
              onClick={handleSyncAllToSupabase}
              disabled={isSyncingAll}
              className="flex-1 lg:flex-none px-5 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm flex items-center justify-center gap-2 border border-slate-700 transition active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <Database className="w-4 h-4 text-[#c5a869]" />
              <span>{isAr ? 'مزامنة السحاب' : 'Cloud Sync'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modern KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[
          { 
            label: isAr ? 'إجمالي المكاتب' : 'Total Firms', 
            val: totalFirms, 
            sub: isAr ? 'مشتركاً بالمنصة' : 'active partners',
            icon: Building2, 
            color: 'amber' 
          },
          { 
            label: isAr ? 'المواقع النشطة' : 'Live Sites', 
            val: activeFirms, 
            sub: isAr ? 'متاحة للجمهور' : 'publicly accessible',
            icon: CheckCircle2, 
            color: 'emerald' 
          },
          { 
            label: isAr ? 'متوقفة / منتهية' : 'Pending Action', 
            val: suspendedFirms + expiredFirms, 
            sub: isAr ? 'تحتاج تدخل إداري' : 'require attention',
            icon: AlertTriangle, 
            color: 'rose' 
          },
          { 
            label: isAr ? 'الإيراد السنوي المتوقع' : 'Projected ARR', 
            val: `${totalAnnualRevenueSAR.toLocaleString()} ر.س`, 
            sub: isAr ? 'عائدات سنوية تقديرية' : 'estimated annual revenue',
            icon: TrendingUp, 
            color: 'blue' 
          }
        ].map((kpi, i) => (
          <div key={i} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-lg hover:border-slate-700 transition-all group">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">{kpi.label}</span>
              <div className={`p-2 rounded-xl bg-${kpi.color}-500/10 border border-${kpi.color}-500/20 text-${kpi.color}-400 group-hover:scale-110 transition-transform`}>
                <kpi.icon className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1 font-mono">{kpi.val}</div>
            <p className="text-[10px] text-slate-500 font-medium">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Advanced Filter & Search Toolbar */}
      <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4 p-4 rounded-3xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'all', label: isAr ? 'جميع المكاتب' : 'All Firms', count: firms.length },
            { id: 'active', label: isAr ? 'نشطة' : 'Active', count: activeFirms },
            { id: 'suspended', label: isAr ? 'متوقفة' : 'Suspended', count: suspendedFirms },
            { id: 'expired', label: isAr ? 'منتهية' : 'Expired', count: expiredFirms },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                filterStatus === tab.id
                  ? 'bg-[#c5a869] text-slate-950 shadow-lg shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${filterStatus === tab.id ? 'bg-slate-950/20' : 'bg-slate-800'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-2xl border border-slate-800">
            <button
              onClick={() => setViewMode('records')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'records' ? 'bg-[#c5a869] text-slate-950 shadow-md shadow-amber-500/20' : 'text-slate-400 hover:text-white'
              }`}
              title={isAr ? 'عرض المكاتب في سجلات تحت بعضها' : 'Stacked Records'}
            >
              <List className="w-4 h-4" />
              <span>{isAr ? 'سجلات تحت بعضها' : 'Stacked Records'}</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'table' ? 'bg-[#c5a869] text-slate-950 shadow-md shadow-amber-500/20' : 'text-slate-400 hover:text-white'
              }`}
              title={isAr ? 'عرض جدول بيانات' : 'Table View'}
            >
              <FileText className="w-4 h-4" />
              <span>{isAr ? 'جدول' : 'Table'}</span>
            </button>
          </div>

          <div className="relative flex-1 sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder={isAr ? 'ابحث عن اسم، مدينة، أو معرف...' : 'Search by name, city, or slug...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-[#c5a869] focus:outline-none transition-all placeholder:text-slate-600"
            />
          </div>
        </div>
      </div>

      {/* Firm Inventory: Records Under Each Other (Single Column Full-Width Stack) */}
      {viewMode === 'records' ? (
        <div className="flex flex-col gap-4">
          {filteredFirms.map((firm) => {
            const ensured = ensureFirmSubscription({ ...firm });
            const sub = ensured.subscription!;
            const isSiteActive = sub.isSiteActive !== false;
            const expiryTime = new Date(sub.endDate).getTime();
            const isExpired = !isNaN(expiryTime) && expiryTime < Date.now();
            const daysRemaining = !isNaN(expiryTime) ? Math.ceil((expiryTime - Date.now()) / (1000 * 60 * 60 * 24)) : 0;
            const progressPercent = Math.max(0, Math.min(100, (daysRemaining / 365) * 100));

            return (
              <div
                key={firm.id}
                className="group relative flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-5 p-5 sm:p-6 bg-slate-900 rounded-3xl border border-slate-800 hover:border-[#c5a869]/70 hover:bg-slate-900/95 transition-all shadow-xl hover:shadow-2xl overflow-hidden"
              >
                {/* Visual Status Indicator Strip */}
                <div className={`absolute top-0 bottom-0 ${isAr ? 'right-0' : 'left-0'} w-1.5 ${!isSiteActive ? 'bg-rose-500' : isExpired ? 'bg-amber-500' : 'bg-emerald-500'}`} />

                {/* Left/Main Identity & Details */}
                <div className="flex items-center gap-4 min-w-[280px] xl:max-w-[340px]">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-950 border border-slate-700 text-[#c5a869] font-black text-xl flex items-center justify-center shadow-lg shrink-0 font-serif-title">
                    {firm.nameAr.charAt(0)}
                  </div>
                  <div className="space-y-1 overflow-hidden">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base sm:text-lg font-bold text-white font-serif-title leading-tight truncate">{firm.nameAr}</h3>
                      <div className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider shrink-0 ${
                        !isSiteActive ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 
                        isExpired ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 
                        'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {!isSiteActive ? (isAr ? 'معلق' : 'Suspended') : isExpired ? (isAr ? 'منتهي' : 'Expired') : (isAr ? 'نشط' : 'Live')}
                      </div>
                    </div>
                    {firm.nameEn && (
                      <div className="text-xs text-slate-400 truncate">{firm.nameEn}</div>
                    )}
                    <div className="flex flex-wrap items-center gap-2 pt-0.5">
                      <span className="text-[11px] font-mono font-bold text-[#e5cb8e] bg-slate-950 px-2 py-0.5 rounded-md border border-[#c5a869]/30 dir-ltr flex items-center gap-1">
                        <Globe className="w-3 h-3 text-[#c5a869]" />
                        <span>{firmService.getFirmDisplayDomain(firm)}</span>
                      </span>
                      <button 
                        onClick={() => handleCopyLink(firm.slug)} 
                        className="p-1 text-slate-400 hover:text-amber-400 transition cursor-pointer" 
                        title={isAr ? 'نسخ الرابط المباشر' : 'Copy link'}
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Plan, Fee & Payment Status */}
                <div className="flex flex-wrap items-center gap-3 sm:gap-6 border-y xl:border-y-0 xl:border-x border-slate-800/80 py-3 xl:py-0 xl:px-6">
                  {/* Plan Tier */}
                  <div className="space-y-1">
                    <span className="text-slate-500 text-[10px] block font-semibold">{isAr ? 'الباقة السنوية' : 'Plan'}</span>
                    <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 text-xs font-bold border border-amber-500/20 inline-block whitespace-nowrap">
                      {isAr ? sub.planNameAr : sub.planNameEn}
                    </span>
                  </div>

                  {/* Fee & Payment Status */}
                  <div className="space-y-1">
                    <span className="text-slate-500 text-[10px] block font-semibold">{isAr ? 'الرسوم وحالة السداد' : 'Fee & Payment'}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-mono font-bold text-white">
                        {(sub.annualFee || 0).toLocaleString()} <span className="text-[10px] text-[#c5a869] font-sans">{sub.currency || 'SAR'}</span>
                      </span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        sub.paymentStatus === 'paid'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : sub.paymentStatus === 'overdue'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {sub.paymentStatus === 'paid' ? (isAr ? 'مدفوع' : 'Paid') : sub.paymentStatus === 'overdue' ? (isAr ? 'متأخر' : 'Overdue') : (isAr ? 'بانتظار السداد' : 'Pending')}
                      </span>
                    </div>
                  </div>

                  {/* Location & Team */}
                  <div className="space-y-1 hidden md:block">
                    <span className="text-slate-500 text-[10px] block font-semibold">{isAr ? 'المدينة والمحامون' : 'City & Lawyers'}</span>
                    <div className="text-xs text-slate-300 flex items-center gap-2">
                      <span>{firm.cityAr || '—'}</span>
                      <span className="text-slate-600">•</span>
                      <span>{firm.data?.partners?.length || 0} {isAr ? 'محامين' : 'lawyers'}</span>
                    </div>
                  </div>
                </div>

                {/* License Progress & Expiry */}
                <div className="min-w-[200px] xl:max-w-[240px] space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>{isAr ? 'صلاحية الترخيص' : 'License'}</span>
                    </span>
                    <span className={`font-bold font-mono ${daysRemaining < 30 ? 'text-rose-400' : 'text-slate-300'}`}>
                      {daysRemaining > 0 ? (isAr ? `${daysRemaining} يوم` : `${daysRemaining}d`) : (isAr ? 'منتهي' : 'Expired')}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div className={`h-full transition-all duration-700 ${daysRemaining < 30 ? 'bg-rose-500' : 'bg-[#c5a869]'}`} style={{ width: `${progressPercent}%` }} />
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono flex items-center justify-between">
                    <span>{isAr ? 'ينتهي في:' : 'Expires:'}</span>
                    <span>{new Date(sub.endDate).toLocaleDateString(isAr ? 'ar-SA' : 'en-US')}</span>
                  </div>
                </div>

                {/* Comprehensive Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 shrink-0 pt-2 xl:pt-0 border-t xl:border-t-0 border-slate-800/80">
                  <button
                    onClick={() => onSelectFirmToManage(firm.slug)}
                    className="px-3.5 py-2.5 rounded-xl bg-[#c5a869] hover:bg-[#b59859] text-slate-950 font-black text-xs transition active:scale-95 shadow-md shadow-amber-500/10 cursor-pointer flex items-center gap-1.5"
                    title={isAr ? 'إدارة المحتوى' : 'Manage Content'}
                  >
                    <Sliders className="w-4 h-4" />
                    <span>{isAr ? 'إدارة المحتوى' : 'Manage'}</span>
                  </button>

                  <button
                    onClick={() => handleOpenEdit(firm, 'payment')}
                    className="px-3.5 py-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 hover:border-emerald-400 font-bold text-xs transition active:scale-95 cursor-pointer flex items-center gap-1.5 shadow-sm"
                    title={isAr ? 'دفع الاشتراك وترحيل القيد لمحاسبة المنصة' : 'Pay & Post to Accounting'}
                  >
                    <CreditCard className="w-4 h-4 text-emerald-400" />
                    <span>{isAr ? 'سداد الاشتراك' : 'Pay'}</span>
                  </button>

                  <button
                    onClick={() => handleOpenProfileEdit(firm)}
                    className="px-3.5 py-2.5 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 text-blue-400 hover:text-blue-300 border border-blue-500/30 hover:border-blue-400 font-bold text-xs transition active:scale-95 cursor-pointer flex items-center gap-1.5 shadow-sm"
                    title={isAr ? 'تعديل كامل بيانات وهوية المكتب' : 'Edit Firm Profile'}
                  >
                    <Edit3 className="w-4 h-4 text-blue-400" />
                    <span>{isAr ? 'تعديل البيانات' : 'Edit'}</span>
                  </button>

                  <button
                    onClick={() => handleOpenEdit(firm, 'plan')}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition active:scale-95 border border-slate-700 cursor-pointer"
                    title={isAr ? 'تعديل الباقة والاشتراك' : 'Edit Plan'}
                  >
                    <Settings2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onSwitchToFirm(firm)}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition active:scale-95 border border-slate-700 cursor-pointer"
                    title={isAr ? 'معاينة الموقع' : 'Preview Site'}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>

                  <button 
                    onClick={() => handleToggleSiteActive(firm)} 
                    className={`p-2.5 rounded-xl transition cursor-pointer border ${isSiteActive ? 'text-slate-400 border-slate-800 hover:text-rose-400 hover:bg-rose-400/10 hover:border-rose-500/30' : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'}`} 
                    title={isAr ? 'تعطيل/تفعيل التواجد الرقمي' : 'Toggle Live Access'}
                  >
                    <Power className="w-4 h-4" />
                  </button>

                  <button 
                    onClick={() => onOpenPasswordModal(firm)} 
                    className="p-2.5 rounded-xl text-slate-400 hover:text-amber-400 bg-slate-800/80 hover:bg-amber-400/10 border border-slate-800 hover:border-amber-400/30 transition cursor-pointer" 
                    title={isAr ? 'تغيير كلمة المرور' : 'Change Password'}
                  >
                    <Key className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onDeleteFirm(firm)}
                    className="p-2.5 rounded-xl text-slate-500 hover:text-rose-400 bg-slate-800/80 hover:bg-rose-500/10 border border-slate-800 hover:border-rose-500/30 transition cursor-pointer"
                    title={isAr ? 'حذف المكتب نهائياً' : 'Delete Permanently'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Enhanced Table View */
        <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-slate-950 text-slate-500 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-5 font-bold uppercase tracking-widest text-[10px]">{isAr ? 'المكتب' : 'Firm'}</th>
                  <th className="px-6 py-5 font-bold uppercase tracking-widest text-[10px]">{isAr ? 'الباقة' : 'Plan'}</th>
                  <th className="px-6 py-5 font-bold uppercase tracking-widest text-[10px]">{isAr ? 'الرسوم' : 'Fees'}</th>
                  <th className="px-6 py-5 font-bold uppercase tracking-widest text-[10px]">{isAr ? 'الحالة' : 'Status'}</th>
                  <th className="px-6 py-5 font-bold uppercase tracking-widest text-[10px]">{isAr ? 'الموعد النهائي' : 'Expiry'}</th>
                  <th className="px-6 py-5 font-bold uppercase tracking-widest text-[10px] text-center">{isAr ? 'التحكم' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filteredFirms.map((firm) => {
                  const sub = firm.subscription!;
                  const isSiteActive = sub.isSiteActive !== false;
                  const expiryTime = new Date(sub.endDate).getTime();
                  const isExpired = !isNaN(expiryTime) && expiryTime < Date.now();

                  return (
                    <tr key={firm.id} className="hover:bg-slate-800/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-[#c5a869] font-serif-title">{firm.nameAr.charAt(0)}</div>
                          <div>
                            <div className="font-bold text-white text-sm">{firm.nameAr}</div>
                            <div className="text-[10px] text-[#c5a869] font-mono font-semibold tracking-tight dir-ltr flex items-center gap-1">
                              <Globe className="w-2.5 h-2.5" />
                              <span>{firmService.getFirmDisplayDomain(firm)}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded-lg bg-amber-500/10 text-amber-500 text-[10px] font-bold border border-amber-500/10">
                          {isAr ? sub.planNameAr : sub.planNameEn}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-emerald-400 font-bold">{(sub.annualFee || 0).toLocaleString()} {sub.currency || 'SAR'}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${isSiteActive && !isExpired ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                          <span className="text-[11px] font-medium text-slate-300">{isSiteActive && !isExpired ? (isAr ? 'نشط' : 'Live') : (isAr ? 'معلق' : 'Suspended')}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-slate-400 text-xs">
                        {new Date(sub.endDate).toLocaleDateString(isAr ? 'ar-SA' : 'en-US')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => onSelectFirmToManage(firm.slug)} className="px-3 py-1.5 rounded-xl bg-[#c5a869] text-slate-950 text-[11px] font-black hover:bg-[#b59859] transition cursor-pointer">{isAr ? 'إدارة' : 'Manage'}</button>
                          <button onClick={() => handleOpenProfileEdit(firm)} className="px-2 py-1.5 rounded-xl bg-blue-500/15 text-blue-400 text-[11px] font-bold hover:bg-blue-500/25 border border-blue-500/30 transition cursor-pointer flex items-center gap-1" title={isAr ? 'تعديل البيانات' : 'Edit'}>
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>{isAr ? 'تعديل' : 'Edit'}</span>
                          </button>
                          <button onClick={() => handleOpenEdit(firm, 'payment')} className="px-2 py-1.5 rounded-xl bg-emerald-500/15 text-emerald-400 text-[11px] font-bold hover:bg-emerald-500/25 border border-emerald-500/30 transition cursor-pointer flex items-center gap-1" title={isAr ? 'سداد الاشتراك' : 'Pay'}>
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>{isAr ? 'سداد' : 'Pay'}</span>
                          </button>
                          <button onClick={() => handleOpenEdit(firm, 'plan')} className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer" title={isAr ? 'تعديل الباقة' : 'Edit Plan'}><Settings2 className="w-4 h-4" /></button>
                          <button onClick={() => onSwitchToFirm(firm)} className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer" title={isAr ? 'معاينة' : 'Preview'}><ExternalLink className="w-4 h-4" /></button>
                          <button onClick={() => onDeleteFirm(firm)} className="p-1.5 rounded-xl bg-slate-800 text-slate-500 hover:text-rose-400 transition cursor-pointer" title={isAr ? 'حذف المكتب' : 'Delete'}><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filteredFirms.length === 0 && (
        <div className="p-12 text-center text-slate-400 text-sm border-2 border-dashed border-slate-800 rounded-3xl space-y-3">
          <Building2 className="w-10 h-10 text-slate-600 mx-auto" />
          <p>{isAr ? 'لم يتم العثور على مكاتب تطابق هذا الفلتر أو البحث.' : 'No firms match this subscription filter or search.'}</p>
        </div>
      )}

      {/* Subscription Edit & Payment Modal */}
      {editingFirm && editForm && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div 
            className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl p-6 text-slate-100 space-y-4 max-h-[92vh] overflow-y-auto"
            dir={isAr ? 'rtl' : 'ltr'}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[#c5a869] flex items-center justify-center font-bold">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-serif-title">
                    {isAr ? `إدارة وسداد اشتراك: ${editingFirm.nameAr}` : `Subscription & Payment: ${editingFirm.nameAr}`}
                  </h3>
                  <div className="text-[11px] text-slate-400 flex items-center gap-2">
                    <span>{editingFirm.slug}.aladl.law</span>
                    <span>•</span>
                    <span className={editForm.paymentStatus === 'paid' ? 'text-emerald-400 font-semibold' : 'text-amber-400 font-semibold'}>
                      {editForm.paymentStatus === 'paid' ? (isAr ? 'مسدد بالكامل' : 'Paid') : (isAr ? 'بانتظار السداد' : 'Pending')}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setEditingFirm(null);
                  setEditForm(null);
                }}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Navigation Tabs: Plan vs Payment */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-2xl border border-slate-800">
              <button
                type="button"
                onClick={() => setModalTab('plan')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 ${
                  modalTab === 'plan'
                    ? 'bg-[#c5a869] text-slate-950 shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sliders className="w-4 h-4" />
                <span>{isAr ? 'تفاصيل وإعدادات الباقة' : 'Plan Settings'}</span>
              </button>

              <button
                type="button"
                onClick={() => setModalTab('payment')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 ${
                  modalTab === 'payment'
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span className="flex items-center gap-1.5">
                  <span>{isAr ? 'سداد الاشتراك وترحيل للمحاسبة' : 'Pay & Post to Accounting'}</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </span>
              </button>
            </div>

            {/* TAB 1: PLAN SETTINGS */}
            {modalTab === 'plan' && (
              <div className="space-y-4 text-xs">
                {/* Quick Payment Banner */}
                <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                      <Wallet className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-white text-xs">{isAr ? 'هل تريد سداد الاشتراك فوراً لهذا المكتب؟' : 'Ready to record payment for this firm?'}</div>
                      <div className="text-[10px] text-emerald-300/80">{isAr ? 'انتقل لتبويب السداد لترحيل القيد فوراً لصفحة محاسبة المنصة' : 'Post payment to Platform Accounting'}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setModalTab('payment')}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition cursor-pointer shrink-0"
                  >
                    {isAr ? 'سداد الآن' : 'Pay Now'}
                  </button>
                </div>

                {/* Plan Tier Selection */}
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">
                    {isAr ? 'مستوى الباقة السنوية (Plan Tier):' : 'Subscription Tier:'}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['starter', 'professional', 'enterprise'] as SubscriptionPlanTier[]).map((tier) => (
                      <button
                        key={tier}
                        type="button"
                        onClick={() => {
                          const tierNames = {
                            starter: { ar: 'الباقة السنوية القياسية', en: 'Standard Annual Plan', fee: 2500 },
                            professional: { ar: 'الباقة السنوية الاحترافية', en: 'Professional Annual Plan', fee: 3500 },
                            enterprise: { ar: 'الباقة الماسية الشاملة', en: 'Enterprise Diamond Plan', fee: 6000 },
                          };
                          setEditForm({
                            ...editForm,
                            planTier: tier,
                            planNameAr: tierNames[tier].ar,
                            planNameEn: tierNames[tier].en,
                            annualFee: editForm.annualFee || tierNames[tier].fee,
                          });
                        }}
                        className={`py-2 px-3 rounded-xl border text-center font-bold capitalize transition cursor-pointer ${
                          editForm.planTier === tier
                            ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {tier}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Plan Name Arabic & English */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">{isAr ? 'اسم الباقة بالعربية:' : 'Plan Name (AR):'}</label>
                    <input
                      type="text"
                      value={editForm.planNameAr}
                      onChange={(e) => setEditForm({ ...editForm, planNameAr: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">{isAr ? 'اسم الباقة بالإنجليزية:' : 'Plan Name (EN):'}</label>
                    <input
                      type="text"
                      value={editForm.planNameEn}
                      onChange={(e) => setEditForm({ ...editForm, planNameEn: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Site Active Switch */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white block">
                      {isAr ? 'تفعيل موقع المحامي للزوار (Site Live Access)' : 'Site Live Access'}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {isAr
                        ? 'عند التعطيل، يظهر للزوار إشعار التوقف المؤقت بدلاً من الموقع'
                        : 'When disabled, visitors will see the suspended notice'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditForm({ ...editForm, isSiteActive: !editForm.isSiteActive })}
                    className={`w-12 h-6 rounded-full transition p-1 cursor-pointer flex items-center ${
                      editForm.isSiteActive ? 'bg-emerald-500 justify-end' : 'bg-slate-700 justify-start'
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full bg-white block shadow-md" />
                  </button>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">{isAr ? 'تاريخ بداية الاشتراك:' : 'Start Date:'}</label>
                    <input
                      type="date"
                      value={editForm.startDate ? editForm.startDate.substring(0, 10) : ''}
                      onChange={(e) => setEditForm({ ...editForm, startDate: new Date(e.target.value).toISOString() })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">{isAr ? 'تاريخ انتهاء الترخيص السنوي:' : 'Expiry Date:'}</label>
                    <input
                      type="date"
                      value={editForm.endDate ? editForm.endDate.substring(0, 10) : ''}
                      onChange={(e) => setEditForm({ ...editForm, endDate: new Date(e.target.value).toISOString() })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Fees and Currency */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">{isAr ? 'الرسوم السنوية:' : 'Annual Fee:'}</label>
                    <input
                      type="number"
                      value={editForm.annualFee}
                      onChange={(e) => setEditForm({ ...editForm, annualFee: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-amber-400 focus:outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">{isAr ? 'العملة:' : 'Currency:'}</label>
                    <select
                      value={editForm.currency}
                      onChange={(e) => setEditForm({ ...editForm, currency: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-amber-400 focus:outline-none"
                    >
                      <option value="SAR">SAR (ريال سعودي)</option>
                      <option value="USD">USD (دولار أمريكي)</option>
                      <option value="AED">AED (درهم إماراتي)</option>
                      <option value="EUR">EUR (يورو)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">{isAr ? 'حالة الدفع الحالية:' : 'Payment Status:'}</label>
                    <select
                      value={editForm.paymentStatus}
                      onChange={(e) => setEditForm({ ...editForm, paymentStatus: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-amber-400 focus:outline-none"
                    >
                      <option value="paid">{isAr ? 'مدفوع بالكامل' : 'Paid'}</option>
                      <option value="pending">{isAr ? 'معلق / بانتظار السداد' : 'Pending'}</option>
                      <option value="overdue">{isAr ? 'متأخر عن السداد' : 'Overdue'}</option>
                      <option value="waived">{isAr ? 'معفى رسمياً' : 'Waived'}</option>
                    </select>
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-slate-400 mb-1">{isAr ? 'حالة الاشتراك العام:' : 'Subscription Status:'}</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value as SubscriptionStatus })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-amber-400 focus:outline-none"
                  >
                    <option value="active">{isAr ? 'نشط (Active)' : 'Active'}</option>
                    <option value="suspended">{isAr ? 'معلق إدارياً (Suspended)' : 'Suspended'}</option>
                    <option value="expired">{isAr ? 'منتهي (Expired)' : 'Expired'}</option>
                    <option value="canceled">{isAr ? 'ملغي (Canceled)' : 'Canceled'}</option>
                  </select>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-slate-400 mb-1">{isAr ? 'ملاحظات الاشتراك والترخيص:' : 'Subscription Notes:'}</label>
                  <textarea
                    rows={2}
                    value={editForm.notes || ''}
                    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                    placeholder={isAr ? 'مثال: تم تفعيل الموقع لمدة عام...' : 'Optional notes...'}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-amber-400 focus:outline-none resize-none"
                  />
                </div>

                {/* Modal Actions */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingFirm(null);
                      setEditForm(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs cursor-pointer"
                  >
                    {isAr ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveSubscription}
                    className="px-5 py-2 rounded-xl bg-[#c5a869] hover:bg-[#b59859] text-slate-950 font-bold text-xs shadow-lg cursor-pointer flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>{isAr ? 'حفظ إعدادات الباقة' : 'Save Plan Changes'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: PAYMENT & POSTING TO PLATFORM FINANCE */}
            {modalTab === 'payment' && (
              <div className="space-y-4 text-xs">
                {/* Notice & Architecture integration explanation */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-emerald-950/40 border border-emerald-500/40 space-y-1.5">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span>{isAr ? 'تسجيل وسداد اشتراك وترحيله لمحاسبة المنصة' : 'Post Payment to Platform Accounting'}</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {isAr
                      ? 'عند تأكيد السداد هنا، سيتم تسجيل هذه الدفعة تلقائياً في صفحة (محاسبة المنصة) ضمن دفتر الواردات، وتحديث الأرباح الصافية، وتفعيل موقع المكتب فوراً كـ (مدفوع بالكامل).'
                      : 'Posting payment here automatically updates the Platform Finance Ledger, increases net income, and marks firm subscription as fully paid.'}
                  </p>
                </div>

                {/* Payment Form Fields */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Amount */}
                    <div>
                      <label className="block text-slate-400 mb-1 font-semibold">{isAr ? 'مبلغ الدفعة المستلم:' : 'Payment Amount:'}</label>
                      <input
                        type="number"
                        value={payAmount}
                        onChange={(e) => setPayAmount(Number(e.target.value))}
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-sm focus:border-emerald-400 focus:outline-none"
                      />
                    </div>

                    {/* Currency */}
                    <div>
                      <label className="block text-slate-400 mb-1 font-semibold">{isAr ? 'عملة السداد:' : 'Payment Currency:'}</label>
                      <select
                        value={payCurrency}
                        onChange={(e) => setPayCurrency(e.target.value as any)}
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:border-emerald-400 focus:outline-none"
                      >
                        <option value="SAR">SAR (ريال سعودي)</option>
                        <option value="USD">USD (دولار أمريكي)</option>
                        <option value="SYP">SYP (ليرة سورية)</option>
                        <option value="AED">AED (درهم إماراتي)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Payment Method */}
                    <div>
                      <label className="block text-slate-400 mb-1 font-semibold">{isAr ? 'طريقة السداد / قناة الدفع:' : 'Payment Method:'}</label>
                      <select
                        value={payMethod}
                        onChange={(e) => setPayMethod(e.target.value as PaymentMethodType)}
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-emerald-400 focus:outline-none"
                      >
                        <option value="bank_transfer">{isAr ? 'حوالة بنكية / مصرفية' : 'Bank Transfer'}</option>
                        <option value="cash">{isAr ? 'نقداً / كاش' : 'Cash'}</option>
                        <option value="syriatel_cash">{isAr ? 'سيرياتيل كاش (Syriatel Cash)' : 'Syriatel Cash'}</option>
                        <option value="al_haram">{isAr ? 'الهرم للحوالات (Al-Haram)' : 'Al-Haram'}</option>
                        <option value="fouad">{isAr ? 'شركة فؤاد للصرافة (Fouad)' : 'Fouad'}</option>
                        <option value="stripe">{isAr ? 'بطاقة ائتمانية / سترايب (Visa/Mastercard)' : 'Stripe / Card'}</option>
                        <option value="paypal">{isAr ? 'بايبال (PayPal)' : 'PayPal'}</option>
                        <option value="usdt_crypto">{isAr ? 'USDT / عملات رقمية' : 'USDT Crypto'}</option>
                        <option value="check">{isAr ? 'شيك مصرفي' : 'Bank Check'}</option>
                        <option value="other">{isAr ? 'طريقة أخرى' : 'Other'}</option>
                      </select>
                    </div>

                    {/* Date */}
                    <div>
                      <label className="block text-slate-400 mb-1 font-semibold">{isAr ? 'تاريخ استلام الدفعة:' : 'Payment Date:'}</label>
                      <input
                        type="date"
                        value={payDate}
                        onChange={(e) => setPayDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-emerald-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Invoice Ref */}
                    <div>
                      <label className="block text-slate-400 mb-1 font-semibold">{isAr ? 'رقم الفاتورة / مرجع الإيصال:' : 'Invoice Ref:'}</label>
                      <input
                        type="text"
                        value={payInvoiceRef}
                        onChange={(e) => setPayInvoiceRef(e.target.value)}
                        placeholder="INV-SUB-2026-001"
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-emerald-400 focus:outline-none font-mono"
                      />
                    </div>

                    {/* Payment Type */}
                    <div>
                      <label className="block text-slate-400 mb-1 font-semibold">{isAr ? 'نوع المعاملة:' : 'Transaction Type:'}</label>
                      <select
                        value={payType}
                        onChange={(e) => setPayType(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-emerald-400 focus:outline-none"
                      >
                        <option value="subscription_renewal">{isAr ? 'تجديد اشتراك سنوي' : 'Subscription Renewal'}</option>
                        <option value="subscription_new">{isAr ? 'سداد اشتراك سنوي جديد' : 'New Subscription'}</option>
                        <option value="custom_service">{isAr ? 'خدمات برمجية وتطوير مخصص' : 'Custom Service'}</option>
                      </select>
                    </div>
                  </div>

                  {/* Payment Notes */}
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">{isAr ? 'ملاحظات الدفعة والإيصال:' : 'Payment Notes:'}</label>
                    <input
                      type="text"
                      value={payNotes}
                      onChange={(e) => setPayNotes(e.target.value)}
                      placeholder={isAr ? 'مثال: سداد اشتراك سنوي عن طريق حوالة بنكية...' : 'Notes...'}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-emerald-400 focus:outline-none"
                    />
                  </div>

                  {/* Extension Checkbox */}
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-200 font-semibold select-none">
                      <input
                        type="checkbox"
                        checked={payExtendOneYear}
                        onChange={(e) => setPayExtendOneYear(e.target.checked)}
                        className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-400 bg-slate-900 border-slate-700"
                      />
                      <span>{isAr ? 'تمديد صلاحية الترخيص السنوي لعام كامل (+365 يوماً) تلقائياً' : 'Auto-extend license expiry by 1 full year'}</span>
                    </label>
                  </div>
                </div>

                {/* Process Payment Button */}
                <button
                  type="button"
                  disabled={isProcessingPayment}
                  onClick={handleProcessPayment}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/20 transition active:scale-95 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <CreditCard className="w-5 h-5 text-slate-950 stroke-[2.5]" />
                  <span>
                    {isProcessingPayment 
                      ? (isAr ? 'جاري ترحيل القيد للمحاسبة...' : 'Processing...') 
                      : (isAr ? `تأكيد دفع (${payAmount.toLocaleString()} ${payCurrency}) وترحيل القيد لمحاسبة المنصة` : `Confirm Payment (${payAmount} ${payCurrency}) & Post to Accounting`)}
                  </span>
                </button>

                {/* Past Payments for this firm */}
                <div className="pt-4 border-t border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                      <History className="w-4 h-4 text-emerald-400" />
                      <span>{isAr ? 'سجل الدفعات المقيدة لهذا المكتب في محاسبة المنصة' : 'Payment History for this Firm'}</span>
                    </h4>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {firmPaymentHistory.length} {isAr ? 'دفعات' : 'payments'}
                    </span>
                  </div>

                  {firmPaymentHistory.length === 0 ? (
                    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-center text-slate-500 text-xs">
                      {isAr ? 'لم تسجل أي دفعات سابقة لهذا المكتب بعد. استخدم النموذج أعلاه لتسجيل أول دفعة.' : 'No previous payment records found for this firm.'}
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {firmPaymentHistory.map((tx) => (
                        <div 
                          key={tx.id}
                          className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs hover:border-slate-700 transition"
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white font-mono">
                                +{tx.amount.toLocaleString()} {tx.currency}
                              </span>
                              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold">
                                {tx.type === 'subscription_renewal' ? (isAr ? 'تجديد سنوي' : 'Renewal') : (isAr ? 'اشتراك' : 'Subscription')}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400 flex items-center gap-2">
                              <span>{tx.date}</span>
                              <span>•</span>
                              <span className="font-mono text-emerald-400/80">{tx.invoiceNumber}</span>
                              {tx.notes && (
                                <>
                                  <span>•</span>
                                  <span className="truncate max-w-[150px]">{tx.notes}</span>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
                              {tx.paymentMethod === 'bank_transfer' ? (isAr ? 'حوالة بنكية' : 'Bank') : tx.paymentMethod}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleDeletePastTx(tx.id)}
                              className="p-1 rounded text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                              title={isAr ? 'حذف القيد' : 'Delete'}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Close modal button */}
                <div className="flex items-center justify-end pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingFirm(null);
                      setEditForm(null);
                    }}
                    className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs cursor-pointer font-bold"
                  >
                    {isAr ? 'إغلاق النافذة' : 'Close'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. ADD NEW LAW FIRM MODAL (إضافة مكتب قانوني جديد)                        */}
      {/* ========================================================================= */}
      {isAddFirmModalOpen && (
        <div className="fixed inset-0 z-[120] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div 
            className="w-full max-w-3xl bg-slate-900 border border-amber-500/50 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 text-slate-100 my-8 max-h-[90vh] overflow-y-auto"
            dir={isAr ? 'rtl' : 'ltr'}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-[#c5a869] text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/20">
                  <Plus className="w-6 h-6 stroke-[3]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white font-serif-title">
                    {isAr ? 'إضافة مكتب قانوني جديد للمنصة' : 'Add New Law Firm to Platform'}
                  </h3>
                  <p className="text-xs text-amber-300/80 font-medium">
                    {isAr ? 'إنشاء موقع وهوية مستقلة وباقة اشتراك حقيقية للمكتب' : 'Create independent landing page, manager access & subscription'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddFirmModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Fields Grid */}
            <div className="space-y-4 text-xs">
              {/* Names */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">
                    {isAr ? 'اسم المكتب الرسمي (بالعربية) *:' : 'Official Firm Name (Arabic) *:'}
                  </label>
                  <input
                    type="text"
                    required
                    value={newFirmForm.nameAr}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNewFirmForm(prev => ({
                        ...prev,
                        nameAr: val,
                        slug: prev.slug ? prev.slug : val.trim().toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]+/g, '-').slice(0, 30)
                      }));
                    }}
                    placeholder={isAr ? 'مثال: شركة العدل والريادة للمحاماة' : 'e.g. Al-Adl Law Firm'}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">
                    {isAr ? 'اسم المكتب بالإنجليزية:' : 'Official Firm Name (English):'}
                  </label>
                  <input
                    type="text"
                    value={newFirmForm.nameEn}
                    onChange={(e) => setNewFirmForm({ ...newFirmForm, nameEn: e.target.value })}
                    placeholder="e.g. Al-Adl & Leadership Law Firm"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none font-sans"
                  />
                </div>
              </div>

              {/* Slug & Tagline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">
                    {isAr ? 'المعرّف الفرعي في الرابط (Slug):' : 'URL Subdomain / Slug:'}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={newFirmForm.slug}
                      onChange={(e) => setNewFirmForm({ ...newFirmForm, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                      placeholder="aladl-law"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-amber-300 font-mono text-xs focus:border-amber-400 focus:outline-none"
                    />
                    <span className="absolute left-3 rtl:left-3 rtl:right-auto top-1/2 -translate-y-1/2 text-[10px] text-slate-500 font-mono">
                      ?firm=slug
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">
                    {isAr ? 'الشعار اللفظي للمكتب:' : 'Firm Slogan / Tagline:'}
                  </label>
                  <input
                    type="text"
                    value={newFirmForm.taglineAr}
                    onChange={(e) => setNewFirmForm({ ...newFirmForm, taglineAr: e.target.value })}
                    placeholder={isAr ? 'مثال: ريادة قانونية وحلول استراتيجية رصينة' : 'Tagline...'}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Founder Attorney, Phone, Email */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">
                    {isAr ? 'اسم المحامي المؤسس:' : 'Founder Attorney:'}
                  </label>
                  <input
                    type="text"
                    value={newFirmForm.founderName}
                    onChange={(e) => setNewFirmForm({ ...newFirmForm, founderName: e.target.value })}
                    placeholder={isAr ? 'مثال: المحامي أحمد النحوي' : 'Attorney name...'}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">
                    {isAr ? 'رقم الهاتف / واتساب:' : 'Phone Number:'}
                  </label>
                  <input
                    type="text"
                    value={newFirmForm.phone}
                    onChange={(e) => setNewFirmForm({ ...newFirmForm, phone: e.target.value })}
                    placeholder="+966 50 123 4567"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">
                    {isAr ? 'البريد الإلكتروني:' : 'Official Email:'}
                  </label>
                  <input
                    type="email"
                    value={newFirmForm.email}
                    onChange={(e) => setNewFirmForm({ ...newFirmForm, email: e.target.value })}
                    placeholder="contact@lawfirm.com"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Location & Admin Password */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">
                    {isAr ? 'المدينة:' : 'City:'}
                  </label>
                  <input
                    type="text"
                    value={newFirmForm.cityAr}
                    onChange={(e) => setNewFirmForm({ ...newFirmForm, cityAr: e.target.value })}
                    placeholder="الرياض"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">
                    {isAr ? 'الدولة:' : 'Country:'}
                  </label>
                  <input
                    type="text"
                    value={newFirmForm.countryAr}
                    onChange={(e) => setNewFirmForm({ ...newFirmForm, countryAr: e.target.value })}
                    placeholder="المملكة العربية السعودية"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">
                    {isAr ? 'كلمة مرور مدير المكتب:' : 'Firm Manager Password:'}
                  </label>
                  <input
                    type="text"
                    value={newFirmForm.adminPassword}
                    onChange={(e) => setNewFirmForm({ ...newFirmForm, adminPassword: e.target.value })}
                    placeholder="123456"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-amber-300 font-mono focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Plan & Subscription Fee */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="font-bold text-amber-400 text-xs flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4" />
                  <span>{isAr ? 'إعدادات باقة الاشتراك والرسوم السنوية' : 'Subscription Plan & Annual Fees'}</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">{isAr ? 'فئة الباقة:' : 'Plan Tier:'}</label>
                    <select
                      value={newFirmForm.planTier}
                      onChange={(e) => {
                        const tier = e.target.value as SubscriptionPlanTier;
                        const defaultFee = tier === 'enterprise' ? 7500 : tier === 'professional' ? 3500 : 1500;
                        setNewFirmForm({ ...newFirmForm, planTier: tier, annualFee: defaultFee });
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold text-xs focus:border-amber-400 focus:outline-none"
                    >
                      <option value="starter">{isAr ? 'الباقة القياسية (Starter)' : 'Standard'}</option>
                      <option value="professional">{isAr ? 'الباقة الاحترافية (Professional)' : 'Professional'}</option>
                      <option value="enterprise">{isAr ? 'الباقة الماسية (Enterprise)' : 'Enterprise'}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">{isAr ? 'الرسوم السنوية:' : 'Annual Fee:'}</label>
                    <input
                      type="number"
                      value={newFirmForm.annualFee}
                      onChange={(e) => setNewFirmForm({ ...newFirmForm, annualFee: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-emerald-400 font-bold font-mono text-xs focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">{isAr ? 'العملة:' : 'Currency:'}</label>
                    <select
                      value={newFirmForm.currency}
                      onChange={(e) => setNewFirmForm({ ...newFirmForm, currency: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:border-amber-400 focus:outline-none"
                    >
                      <option value="SAR">SAR (ريال سعودي)</option>
                      <option value="USD">USD (دولار أمريكي)</option>
                      <option value="SYP">SYP (ليرة سورية)</option>
                      <option value="AED">AED (درهم إماراتي)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">{isAr ? 'حالة السداد الأولية:' : 'Payment Status:'}</label>
                    <select
                      value={newFirmForm.paymentStatus}
                      onChange={(e) => setNewFirmForm({ ...newFirmForm, paymentStatus: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-amber-400 focus:outline-none"
                    >
                      <option value="paid">{isAr ? 'مدفوع بالكامل (ترحيل للمحاسبة)' : 'Paid (Post to Finance)'}</option>
                      <option value="pending">{isAr ? 'مستحق / غير مسدد' : 'Pending'}</option>
                      <option value="waived">{isAr ? 'معفى رسمياً' : 'Waived'}</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* About Text */}
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">
                  {isAr ? 'نبذة تعريفية عن المكتب:' : 'About Firm Text:'}</label>
                <textarea
                  rows={2}
                  value={newFirmForm.aboutTextAr}
                  onChange={(e) => setNewFirmForm({ ...newFirmForm, aboutTextAr: e.target.value })}
                  placeholder={isAr ? 'نبذة مختصرة تظهر في صفحة المكتب...' : 'Short bio...'}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none text-xs"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsAddFirmModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>

              <button
                type="button"
                onClick={handleCreateNewFirm}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-[#c5a869] hover:from-amber-300 hover:to-amber-500 text-slate-950 font-black text-xs shadow-xl shadow-amber-500/20 flex items-center gap-2 transition active:scale-95 cursor-pointer"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>{isAr ? 'حفظ وإنشاء المكتب وتفعيله فوراً' : 'Create & Activate Firm'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. EDIT FULL LAW FIRM PROFILE MODAL (تعديل كامل لبيانات المكتب)           */}
      {/* ========================================================================= */}
      {editingProfileFirm && (
        <div className="fixed inset-0 z-[120] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div 
            className="w-full max-w-3xl bg-slate-900 border border-blue-500/50 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 text-slate-100 my-8 max-h-[90vh] overflow-y-auto"
            dir={isAr ? 'rtl' : 'ltr'}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-blue-500/20 border border-blue-500/40 text-blue-400 flex items-center justify-center font-black shadow-lg">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white font-serif-title">
                    {isAr ? `تعديل بيانات المكتب: ${editingProfileFirm.nameAr}` : `Edit Firm: ${editingProfileFirm.nameAr}`}
                  </h3>
                  <p className="text-xs text-blue-300/80 font-medium">
                    {isAr ? 'تحديث الاسم الرسمي وبيانات الاتصال والكلمة السرية وحالة الاعتماد' : 'Update official details, contact info, manager password & status'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingProfileFirm(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Fields Grid */}
            <div className="space-y-4 text-xs">
              {/* Names */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">
                    {isAr ? 'اسم المكتب الرسمي (بالعربية) *:' : 'Firm Name (Arabic) *:'}
                  </label>
                  <input
                    type="text"
                    required
                    value={profileForm.nameAr}
                    onChange={(e) => setProfileForm({ ...profileForm, nameAr: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-blue-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">
                    {isAr ? 'اسم المكتب بالإنجليزية:' : 'Firm Name (English):'}
                  </label>
                  <input
                    type="text"
                    value={profileForm.nameEn}
                    onChange={(e) => setProfileForm({ ...profileForm, nameEn: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-blue-400 focus:outline-none font-sans"
                  />
                </div>
              </div>

              {/* Slogan & Theme Color */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-slate-300 font-bold mb-1.5">
                    {isAr ? 'الشعار اللفظي:' : 'Slogan / Tagline:'}
                  </label>
                  <input
                    type="text"
                    value={profileForm.taglineAr}
                    onChange={(e) => setProfileForm({ ...profileForm, taglineAr: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-blue-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">
                    {isAr ? 'اللون الرئيسي للثيم:' : 'Theme Color:'}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={profileForm.themeColor}
                      onChange={(e) => setProfileForm({ ...profileForm, themeColor: e.target.value })}
                      className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-700 cursor-pointer p-1"
                    />
                    <input
                      type="text"
                      value={profileForm.themeColor}
                      onChange={(e) => setProfileForm({ ...profileForm, themeColor: e.target.value })}
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:border-blue-400 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Location & Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">{isAr ? 'المدينة:' : 'City:'}</label>
                  <input
                    type="text"
                    value={profileForm.cityAr}
                    onChange={(e) => setProfileForm({ ...profileForm, cityAr: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-blue-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">{isAr ? 'الدولة:' : 'Country:'}</label>
                  <input
                    type="text"
                    value={profileForm.countryAr}
                    onChange={(e) => setProfileForm({ ...profileForm, countryAr: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-blue-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">{isAr ? 'الهاتف:' : 'Phone:'}</label>
                  <input
                    type="text"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono focus:border-blue-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">{isAr ? 'البريد الإلكتروني:' : 'Email:'}</label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono focus:border-blue-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Password, Status, Currency */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">
                    {isAr ? 'كلمة مرور مدير المكتب:' : 'Firm Manager Password:'}
                  </label>
                  <input
                    type="text"
                    value={profileForm.adminPassword}
                    onChange={(e) => setProfileForm({ ...profileForm, adminPassword: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-amber-300 font-mono text-xs focus:border-blue-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">
                    {isAr ? 'حالة نشاط المكتب:' : 'Firm Status:'}
                  </label>
                  <select
                    value={profileForm.status}
                    onChange={(e) => setProfileForm({ ...profileForm, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold text-xs focus:border-blue-400 focus:outline-none"
                  >
                    <option value="active">{isAr ? 'نشط ومعتمد (Active)' : 'Active'}</option>
                    <option value="suspended">{isAr ? 'معلق وموقوف (Suspended)' : 'Suspended'}</option>
                    <option value="pending">{isAr ? 'بانتظار الاعتماد (Pending)' : 'Pending'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">
                    {isAr ? 'العملة المعتمدة:' : 'Currency:'}
                  </label>
                  <select
                    value={profileForm.currency}
                    onChange={(e) => setProfileForm({ ...profileForm, currency: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:border-blue-400 focus:outline-none"
                  >
                    <option value="SAR">SAR (ريال سعودي)</option>
                    <option value="USD">USD (دولار أمريكي)</option>
                    <option value="SYP">SYP (ليرة سورية)</option>
                    <option value="AED">AED (درهم إماراتي)</option>
                  </select>
                </div>
              </div>

              {/* About Text */}
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">
                  {isAr ? 'نبذة تعريفية عن المكتب:' : 'About Firm Text:'}
                </label>
                <textarea
                  rows={3}
                  value={profileForm.aboutTextAr}
                  onChange={(e) => setProfileForm({ ...profileForm, aboutTextAr: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-blue-400 focus:outline-none text-xs"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setEditingProfileFirm(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>

              <button
                type="button"
                onClick={handleSaveProfile}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-bold text-xs shadow-xl shadow-blue-500/20 flex items-center gap-2 transition active:scale-95 cursor-pointer"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>{isAr ? 'حفظ وتطبيق التعديلات فوراً' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Delete Past Payment Transaction Confirmation Modal */}
      {deleteTxConfirmTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md p-6 rounded-3xl bg-slate-900 border border-rose-500/50 shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center mx-auto text-rose-400">
              <Trash2 className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-1">
                {isAr ? 'تأكيد حذف القيد المالي' : 'Confirm Transaction Deletion'}
              </h3>
              <p className="text-xs text-slate-300">
                {isAr 
                  ? 'هل أنت متأكد من حذف هذا القيد المالي نهائياً من سجل المحاسبة؟ لا يمكن التراجع عن هذا الإجراء.'
                  : 'Are you sure you want to permanently delete this payment transaction? This action cannot be undone.'}
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTxConfirmTarget(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (deleteTxConfirmTarget) {
                    platformFinanceService.deleteTransaction(deleteTxConfirmTarget);
                    setFirmPaymentHistory(prev => prev.filter(t => t.id !== deleteTxConfirmTarget));
                    if (typeof window !== 'undefined') {
                      window.dispatchEvent(new CustomEvent('aladl_finance_updated'));
                    }
                    showToast(isAr ? 'تم حذف القيد من سجل المحاسبة' : 'Transaction deleted');
                    setDeleteTxConfirmTarget(null);
                  }
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
