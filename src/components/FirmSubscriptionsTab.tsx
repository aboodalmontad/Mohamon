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
  Trash2
} from 'lucide-react';
import { LawFirm, FirmSubscription, SubscriptionPlanTier, SubscriptionStatus } from '../types';
import { firmService, ensureFirmSubscription } from '../services/firmService';

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
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  
  // Subscription edit modal state
  const [editingFirm, setEditingFirm] = useState<LawFirm | null>(null);
  const [editForm, setEditForm] = useState<FirmSubscription | null>(null);

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
  const handleOpenEdit = (firm: LawFirm) => {
    const ensured = ensureFirmSubscription({ ...firm });
    setEditingFirm(ensured);
    setEditForm({ ...ensured.subscription! });
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
              onClick={handleSyncAllToSupabase}
              disabled={isSyncingAll}
              className="flex-1 lg:flex-none px-6 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm flex items-center justify-center gap-2 border border-slate-700 transition shadow-xl active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncingAll ? 'animate-spin' : ''}`} />
              <span>{isAr ? 'تحديث البيانات' : 'Refresh Data'}</span>
            </button>
            
            <button
              onClick={handleSyncAllToSupabase}
              disabled={isSyncingAll}
              className="flex-1 lg:flex-none px-6 py-3.5 rounded-2xl bg-gradient-to-br from-[#c5a869] to-[#d4b068] hover:from-[#b59859] hover:to-[#c5a869] text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10 transition active:scale-95 disabled:opacity-50"
            >
              <Database className="w-4 h-4" />
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
          <div className="flex items-center gap-1 p-1.5 bg-slate-950 rounded-2xl border border-slate-800">
            <button
              onClick={() => setViewMode('cards')}
              className={`flex-1 sm:flex-none p-2 rounded-xl transition ${viewMode === 'cards' ? 'bg-amber-500/20 text-amber-400' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex-1 sm:flex-none p-2 rounded-xl transition ${viewMode === 'table' ? 'bg-amber-500/20 text-amber-400' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <List className="w-4 h-4" />
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

      {/* Firm Inventory Grid */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
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
                className="group relative flex flex-col bg-slate-900 rounded-[2.5rem] border border-slate-800 hover:border-[#c5a869]/50 transition-all shadow-xl hover:shadow-amber-500/5 overflow-hidden"
              >
                {/* Visual Status Indicator */}
                <div className={`h-1.5 w-full ${!isSiteActive ? 'bg-rose-500' : isExpired ? 'bg-amber-500' : 'bg-emerald-500'}`} />

                <div className="p-6 sm:p-8 flex-1 flex flex-col gap-6">
                  {/* Header: Identity & Status */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-950 border border-slate-700 text-[#c5a869] font-black text-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform font-serif-title">
                        {firm.nameAr.charAt(0)}
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-lg font-bold text-white font-serif-title leading-tight">{firm.nameAr}</h3>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono font-bold text-[#e5cb8e] bg-slate-950 px-2.5 py-0.5 rounded-md border border-[#c5a869]/30 dir-ltr flex items-center gap-1">
                            <Globe className="w-3 h-3 text-[#c5a869]" />
                            <span>{firmService.getFirmDisplayDomain(firm)}</span>
                          </span>
                          <button onClick={() => handleCopyLink(firm.slug)} className="p-1 text-slate-500 hover:text-amber-400 transition cursor-pointer" title="نسخ الرابط"><Copy className="w-3 h-3" /></button>
                        </div>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      !isSiteActive ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' : 
                      isExpired ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 
                      'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                    }`}>
                      {!isSiteActive ? (isAr ? 'معلق' : 'Suspended') : isExpired ? (isAr ? 'منتهي' : 'Expired') : (isAr ? 'نشط' : 'Live')}
                    </div>
                  </div>

                  {/* Info Matrix */}
                  <div className="grid grid-cols-2 gap-4 p-4 rounded-3xl bg-slate-950/50 border border-slate-800/50">
                    <div className="space-y-1">
                      <span className="text-slate-500 text-[10px] flex items-center gap-1"><MapPin className="w-3 h-3" /> {isAr ? 'المقر' : 'City'}</span>
                      <span className="text-xs text-white font-bold block truncate">{firm.cityAr || '—'}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-500 text-[10px] flex items-center gap-1"><Tag className="w-3 h-3" /> {isAr ? 'العملة المعتمدة' : 'Currency'}</span>
                      <span className="text-xs text-[#e5cb8e] font-bold block truncate">
                        {firm.data?.settings?.currency === 'SYP' ? '🇸🇾 ليرة سورية (SYP)' : '🇺🇸 دولار أمريكي ($ USD)'}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-500 text-[10px] flex items-center gap-1"><Users className="w-3 h-3" /> {isAr ? 'المحامون' : 'Lawyers'}</span>
                      <span className="text-xs text-white font-bold block">{firm.data?.partners?.length || 0}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-500 text-[10px] flex items-center gap-1"><DollarSign className="w-3 h-3" /> {isAr ? 'الرسوم' : 'Fee'}</span>
                      <span className="text-xs text-emerald-400 font-bold block">{(sub.annualFee || 0).toLocaleString()} <span className="text-[10px] opacity-70">SAR</span></span>
                    </div>
                  </div>

                  {/* License Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {isAr ? 'صلاحية الترخيص' : 'License Validity'}</span>
                      <span className={`font-bold ${daysRemaining < 30 ? 'text-rose-400' : 'text-slate-300'}`}>
                        {daysRemaining > 0 ? (isAr ? `${daysRemaining} يوم متبقي` : `${daysRemaining} days left`) : (isAr ? 'منتهي' : 'Expired')}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div className={`h-full transition-all duration-1000 ${daysRemaining < 30 ? 'bg-rose-500' : 'bg-[#c5a869]'}`} style={{ width: `${progressPercent}%` }} />
                    </div>
                  </div>

                  {/* Quick Actions Row */}
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => onSelectFirmToManage(firm.slug)}
                      className="flex-1 px-4 py-3 rounded-2xl bg-[#c5a869] hover:bg-[#b59859] text-slate-950 font-black text-xs transition active:scale-95 shadow-lg shadow-amber-500/10 cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Sliders className="w-4 h-4" />
                      <span>{isAr ? 'إدارة المحتوى' : 'Manage Content'}</span>
                    </button>
                    <button
                      onClick={() => onSwitchToFirm(firm)}
                      className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white transition active:scale-95 border border-slate-700 cursor-pointer"
                      title={isAr ? 'معاينة الموقع' : 'Preview Site'}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>

                  {/* System Controls */}
                  <div className="flex items-center justify-between gap-2 pt-4 border-t border-slate-800/50">
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => handleToggleSiteActive(firm)} className={`p-2 rounded-xl transition cursor-pointer ${isSiteActive ? 'text-slate-500 hover:text-rose-400 hover:bg-rose-400/5' : 'text-emerald-500 bg-emerald-500/10'}`} title={isAr ? 'تعطيل/تفعيل' : 'Toggle Access'}><Power className="w-4 h-4" /></button>
                      <button onClick={() => handleOpenEdit(firm)} className="p-2 rounded-xl text-slate-500 hover:text-white hover:bg-slate-800 transition cursor-pointer" title={isAr ? 'تعديل الباقة' : 'Edit Subscription'}><Settings2 className="w-4 h-4" /></button>
                      <button onClick={() => onOpenPasswordModal(firm)} className="p-2 rounded-xl text-slate-500 hover:text-amber-400 hover:bg-amber-400/5 transition cursor-pointer" title={isAr ? 'تغيير كلمة المرور' : 'Change Password'}><Key className="w-4 h-4" /></button>
                    </div>
                    <button
                      onClick={() => onDeleteFirm(firm)}
                      className="p-2 rounded-xl text-slate-600 hover:text-rose-500 hover:bg-rose-500/5 transition cursor-pointer"
                      title={isAr ? 'حذف المكتب نهائياً' : 'Delete Permanently'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
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
                      <td className="px-6 py-4 font-mono text-emerald-400 font-bold">{(sub.annualFee || 0).toLocaleString()} SAR</td>
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
                          <button onClick={() => onSelectFirmToManage(firm.slug)} className="px-4 py-2 rounded-xl bg-[#c5a869] text-slate-950 text-[11px] font-black hover:bg-[#b59859] transition cursor-pointer">{isAr ? 'إدارة' : 'Manage'}</button>
                          <button onClick={() => onSwitchToFirm(firm)} className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"><ExternalLink className="w-4 h-4" /></button>
                          <button onClick={() => handleOpenEdit(firm)} className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"><Settings2 className="w-4 h-4" /></button>
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

      {/* Subscription Edit Modal */}
      {editingFirm && editForm && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div 
            className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl p-6 text-slate-100 space-y-4 max-h-[90vh] overflow-y-auto"
            dir={isAr ? 'rtl' : 'ltr'}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white font-serif-title">
                  {isAr ? `تعديل اشتراك: ${editingFirm.nameAr}` : `Edit Subscription: ${editingFirm.nameAr}`}
                </h3>
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

            {/* Form Fields */}
            <div className="space-y-4 text-xs">
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
                  <label className="block text-slate-400 mb-1">{isAr ? 'حالة الدفع:' : 'Payment Status:'}</label>
                  <select
                    value={editForm.paymentStatus}
                    onChange={(e) => setEditForm({ ...editForm, paymentStatus: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-amber-400 focus:outline-none"
                  >
                    <option value="paid">{isAr ? 'مدفوع بالكامل' : 'Paid'}</option>
                    <option value="pending">{isAr ? 'معلق / بانتظار السداد' : 'Pending'}</option>
                    <option value="overdue">{isAr ? 'متأخر عن السداد' : 'Overdue'}</option>
                    <option value="waived">{isAr ? 'معفى / تجريبي' : 'Waived'}</option>
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
                  placeholder={isAr ? 'مثال: تم تفعيل الموقع لمدة عام مع باقة التحكيم الدولي...' : 'Optional notes...'}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-amber-400 focus:outline-none resize-none"
                />
              </div>
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
                <span>{isAr ? 'حفظ التعديلات' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
