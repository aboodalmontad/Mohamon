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
    <div className="space-y-6" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Top Banner: Subscriptions Overview & Global Supabase Sync */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-amber-950/30 border border-slate-800 shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h2 className="text-lg sm:text-xl font-bold text-white font-serif-title flex items-center gap-2">
              <Building2 className="w-6 h-6 text-[#c5a869]" />
              <span>{isAr ? `إدارة المكاتب والاشتراكات السنوية (${firms.length} مكتب)` : `Law Firms & Subscriptions Directory (${firms.length} Firms)`}</span>
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            {isAr
              ? 'مركز التحكم الشامل بالمكاتب القانونية المسجلة: تتبع سريان الترخيص، تفعيل أو تعليق المواقع فوراً، إدارة المحتوى، ومزامنة كافة البيانات إلى السحاب.'
              : 'Central hub for law firm subscriptions: track licenses, toggle site visibility, manage firm content, and sync with cloud database.'}
          </p>
        </div>

        {/* Global Cloud Sync Action */}
        <button
          onClick={handleSyncAllToSupabase}
          disabled={isSyncingAll}
          className="w-full lg:w-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-[#c5a869] to-[#d4b068] hover:from-[#b59859] hover:to-[#c5a869] text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10 transition cursor-pointer shrink-0"
        >
          <Database className={`w-4 h-4 ${isSyncingAll ? 'animate-spin' : ''}`} />
          <span>
            {isSyncingAll 
              ? (isAr ? 'جارِ المزامنة السحابية...' : 'Syncing Cloud...') 
              : (isAr ? 'مزامنة السحاب (Supabase Sync)' : 'Sync All to Supabase')}
          </span>
        </button>
      </div>

      {/* Subscription KPI Metrics Dashboard */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-xs">
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-md hover:border-slate-700 transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 font-medium">{isAr ? 'إجمالي المكاتب' : 'Total Firms'}</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-[#c5a869]">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-white mb-1">{totalFirms}</div>
          <span className="text-[11px] text-slate-400">{isAr ? 'مكاتب مسجلة بالمنصة' : 'Registered firms'}</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-emerald-500/30 shadow-md hover:border-emerald-500/50 transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 font-medium">{isAr ? 'المواقع المفعلة' : 'Live Sites'}</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mb-1">{activeFirms}</div>
          <span className="text-[11px] text-emerald-400/80">{isAr ? 'متاحة للزوار حالياً' : 'Live for visitors'}</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-rose-500/30 shadow-md hover:border-rose-500/50 transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 font-medium">{isAr ? 'المتوقفة أو المنتهية' : 'Suspended / Expired'}</span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-rose-400 mb-1">{suspendedFirms + expiredFirms}</div>
          <span className="text-[11px] text-rose-400/80">{isAr ? 'تحتاج تفعيل أو تجديد' : 'Requires renewal'}</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-amber-500/30 shadow-md hover:border-amber-500/50 transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 font-medium">{isAr ? 'العائدات السنوية التقديرية' : 'Annual Revenue'}</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-300">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-amber-300 mb-1">
            {totalAnnualRevenueSAR.toLocaleString()} <span className="text-xs font-sans">ر.س</span>
          </div>
          <span className="text-[11px] text-amber-400/80">{isAr ? 'رسوم التراخيص الإجمالية' : 'Annual recurring revenue'}</span>
        </div>
      </div>

      {/* Control & Search Bar Header */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs bg-slate-900/80 p-3 sm:p-4 rounded-2xl border border-slate-800">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 overflow-x-auto max-w-full">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-2 rounded-lg transition font-medium cursor-pointer whitespace-nowrap text-xs ${
              filterStatus === 'all' ? 'bg-[#c5a869] text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            {isAr ? 'الكل' : 'All'} ({firms.length})
          </button>
          <button
            onClick={() => setFilterStatus('active')}
            className={`px-3 py-2 rounded-lg transition font-medium cursor-pointer whitespace-nowrap text-xs ${
              filterStatus === 'active' ? 'bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            {isAr ? 'المفعلة' : 'Active'} ({activeFirms})
          </button>
          <button
            onClick={() => setFilterStatus('suspended')}
            className={`px-3 py-2 rounded-lg transition font-medium cursor-pointer whitespace-nowrap text-xs ${
              filterStatus === 'suspended' ? 'bg-rose-500/20 text-rose-400 font-bold border border-rose-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            {isAr ? 'المتوقفة' : 'Suspended'} ({suspendedFirms})
          </button>
          <button
            onClick={() => setFilterStatus('expired')}
            className={`px-3 py-2 rounded-lg transition font-medium cursor-pointer whitespace-nowrap text-xs ${
              filterStatus === 'expired' ? 'bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            {isAr ? 'المنتهية' : 'Expired'} ({expiredFirms})
          </button>
        </div>

        {/* Search & View Mode Toggle */}
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800 shrink-0">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-2 rounded-lg transition ${viewMode === 'cards' ? 'bg-amber-500/20 text-amber-400 font-bold' : 'text-slate-400 hover:text-white'}`}
              title={isAr ? 'عرض البطاقات الاحترافية' : 'Card View'}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg transition ${viewMode === 'table' ? 'bg-amber-500/20 text-amber-400 font-bold' : 'text-slate-400 hover:text-white'}`}
              title={isAr ? 'عرض الجدول المدمج' : 'Table View'}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 md:w-80">
            <Search className="w-4 h-4 absolute right-3 top-2.5 text-slate-500 rtl:right-3 rtl:left-auto" />
            <input
              type="text"
              placeholder={isAr ? 'بحث باسم المكتب، المدينه، الهاتف، Slug...' : 'Search name, city, phone, slug...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-9 pl-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-amber-400 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* VIEW MODE 1: PROFESSIONAL RESPONSIVE CARDS */}
      {viewMode === 'cards' ? (
        <div className="space-y-4">
          {filteredFirms.map((firm) => {
            const ensured = ensureFirmSubscription({ ...firm });
            const sub = ensured.subscription!;
            const isSiteActive = sub.isSiteActive !== false;
            
            // Remaining days calculation
            const expiryTime = new Date(sub.endDate).getTime();
            const isExpired = !isNaN(expiryTime) && expiryTime < Date.now();
            const daysRemaining = !isNaN(expiryTime) 
              ? Math.ceil((expiryTime - Date.now()) / (1000 * 60 * 60 * 24))
              : 0;

            const formattedStartDate = new Date(sub.startDate).toLocaleDateString(isAr ? 'ar-SA' : 'en-US');
            const formattedEndDate = new Date(sub.endDate).toLocaleDateString(isAr ? 'ar-SA' : 'en-US');

            const isCopied = copiedSlug === firm.slug;
            
            // Progress percentage for license duration (out of 365 days)
            const progressPercent = Math.max(0, Math.min(100, (daysRemaining / 365) * 100));

            return (
              <div
                key={firm.id}
                className={`p-5 sm:p-6 rounded-3xl border transition-all shadow-xl relative overflow-hidden ${
                  !isSiteActive
                    ? 'bg-slate-900/90 border-rose-900/50 hover:border-rose-700/80'
                    : isExpired
                    ? 'bg-slate-900/90 border-amber-900/50 hover:border-amber-700/80'
                    : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Top Accent Line */}
                <div 
                  className={`absolute top-0 right-0 left-0 h-1 ${
                    !isSiteActive 
                      ? 'bg-rose-500' 
                      : isExpired 
                      ? 'bg-amber-500' 
                      : 'bg-gradient-to-r from-[#c5a869] to-emerald-400'
                  }`}
                />

                <div className="flex flex-col space-y-5">
                  {/* Header Row: Firm Avatar, Title, Slug Badge, Status Badges */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start sm:items-center gap-3">
                      {/* Avatar initial */}
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-950 border border-amber-500/30 text-[#c5a869] font-bold text-lg flex items-center justify-center shadow-inner shrink-0 font-serif-title">
                        {firm.nameAr.charAt(0)}
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base sm:text-lg font-bold text-white font-serif-title">
                            {firm.nameAr}
                          </h3>
                          {firm.nameEn && (
                            <span className="text-slate-400 text-xs font-sans">({firm.nameEn})</span>
                          )}
                        </div>

                        {/* Slug Link Button */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleCopyLink(firm.slug)}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-mono bg-slate-950 text-amber-300 border border-slate-800 hover:border-amber-500/40 flex items-center gap-1.5 transition cursor-pointer"
                            title={isAr ? 'نسخ الرابط المباشر للمكتب' : 'Copy Firm Link'}
                          >
                            <span>?firm={firm.slug}</span>
                            {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Status Badges */}
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Plan Tier Badge */}
                      <span className="px-3 py-1 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30 flex items-center gap-1.5 shadow-sm">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{isAr ? sub.planNameAr : sub.planNameEn}</span>
                      </span>

                      {/* Site Active Status Badge */}
                      {isSiteActive && !isExpired ? (
                        <span className="px-3 py-1 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          <span>{isAr ? 'موقع نشط' : 'Live Site'}</span>
                        </span>
                      ) : !isSiteActive ? (
                        <span className="px-3 py-1 rounded-xl text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-rose-500" />
                          <span>{isAr ? 'متوقف مؤقتاً' : 'Suspended'}</span>
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>{isAr ? 'الاشتراك منتهي' : 'Expired'}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Firm Metadata Info Chips Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 text-xs">
                    <div className="space-y-0.5">
                      <span className="text-slate-500 text-[10px] block flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-amber-500/70" /> {isAr ? 'الموقع' : 'Location'}
                      </span>
                      <span className="text-white font-medium truncate block">{firm.cityAr || 'غير محدد'} ({firm.countryAr || '—'})</span>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-slate-500 text-[10px] block flex items-center gap-1">
                        <Phone className="w-3 h-3 text-emerald-500/70" /> {isAr ? 'الهاتف' : 'Phone'}
                      </span>
                      <span className="text-white font-mono select-all truncate block">{firm.phone || '—'}</span>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-slate-500 text-[10px] block flex items-center gap-1">
                        <Mail className="w-3 h-3 text-blue-500/70" /> {isAr ? 'البريد' : 'Email'}
                      </span>
                      <span className="text-white font-mono select-all truncate block" title={firm.email}>{firm.email || '—'}</span>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-slate-500 text-[10px] block flex items-center gap-1">
                        <FileText className="w-3 h-3 text-purple-500/70" /> {isAr ? 'الترخيص' : 'License'}
                      </span>
                      <span className="text-white font-mono truncate block">{firm.licenseNumber || 'غير متاح'}</span>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-slate-500 text-[10px] block flex items-center gap-1">
                        <UserCheck className="w-3 h-3 text-cyan-500/70" /> {isAr ? 'المحامون' : 'Attorneys'}
                      </span>
                      <span className="text-white font-bold block">{firm.data?.partners?.length || 0} {isAr ? 'محامي' : 'attorneys'}</span>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-slate-500 text-[10px] block flex items-center gap-1">
                        <Database className="w-3 h-3 text-amber-500/70" /> {isAr ? 'السجلات' : 'Records'}
                      </span>
                      <span className="text-white font-bold block">{firm.data?.messages?.length || 0} {isAr ? 'رسالة' : 'messages'}</span>
                    </div>
                  </div>

                  {/* Subscription License Bar & Fee details */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-950/40 border border-slate-800/60 text-xs">
                    {/* Dates & Timeline */}
                    <div className="md:col-span-2 space-y-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-amber-400" />
                          <span>{isAr ? 'فترة الاشتراك السنوي:' : 'Subscription Duration:'}</span>
                        </span>
                        <span className="font-mono text-slate-300">
                          {formattedStartDate} — <span className={`font-bold ${isExpired ? 'text-rose-400' : 'text-amber-300'}`}>{formattedEndDate}</span>
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden relative">
                        <div 
                          className={`h-full transition-all duration-500 rounded-full ${
                            daysRemaining < 30 ? 'bg-rose-500' : daysRemaining < 90 ? 'bg-amber-400' : 'bg-emerald-400'
                          }`}
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">{isAr ? 'الأيام المتبقية في الاشتراك:' : 'Days Remaining:'}</span>
                        <span className={`font-bold font-mono ${daysRemaining < 30 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`}>
                          {daysRemaining > 0 
                            ? (isAr ? `${daysRemaining} يوم متبقي` : `${daysRemaining} days left`) 
                            : (isAr ? 'منتهي الصلاحية' : 'Expired')}
                        </span>
                      </div>
                    </div>

                    {/* Annual Fees & Payment Status */}
                    <div className="flex flex-col justify-between space-y-1">
                      <span className="text-slate-400 text-[11px] block">{isAr ? 'الرسوم السنوية:' : 'Annual Fee:'}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold font-mono text-white">
                          {(sub.annualFee ?? 0).toLocaleString()} {sub.currency || 'SAR'}
                        </span>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          sub.paymentStatus === 'paid' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}>
                          {sub.paymentStatus === 'paid' ? (isAr ? 'مدفوع' : 'Paid') : (isAr ? 'معلق' : 'Pending')}
                        </span>
                      </div>
                    </div>

                    {/* Quick +1 Year Renewal Action */}
                    <div className="flex items-center justify-end">
                      <button
                        onClick={() => handleRenewOneYear(firm)}
                        className="w-full md:w-auto px-4 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
                        title={isAr ? 'تمديد الاشتراك لسنة كاملة إضافية' : 'Renew for +1 Year'}
                      >
                        <Plus className="w-4 h-4 text-amber-400" />
                        <span>{isAr ? 'تجديد (+1 سنة)' : 'Renew (+1 Year)'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Notes if present */}
                  {sub.notes && (
                    <div className="text-[11px] text-slate-400 italic bg-slate-950/80 px-4 py-2 rounded-xl border border-slate-800/80">
                      💡 {sub.notes}
                    </div>
                  )}

                  {/* Comprehensive Action Control Toolbar */}
                  <div className="flex flex-wrap items-center justify-between gap-2.5 pt-4 border-t border-slate-800/80">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Manage Content Primary Button */}
                      <button
                        onClick={() => onSelectFirmToManage(firm.slug)}
                        className="px-4 py-2.5 rounded-xl bg-[#c5a869] hover:bg-[#b59859] text-slate-950 font-bold text-xs flex items-center gap-2 transition cursor-pointer shadow-lg"
                      >
                        <Sliders className="w-4 h-4" />
                        <span>{isAr ? 'إدارة محتوى المكتب' : 'Manage Content'}</span>
                      </button>

                      {/* Visit Live Website Button */}
                      <button
                        onClick={() => onSwitchToFirm(firm)}
                        className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-2 transition cursor-pointer border border-slate-700"
                      >
                        <ExternalLink className="w-4 h-4 text-amber-400" />
                        <span>{isAr ? 'تصفح الموقع' : 'Visit Site'}</span>
                      </button>
                    </div>

                    {/* Secondary Actions Row */}
                    <div className="flex items-center gap-2">
                      {/* Toggle Live Visibility Switch */}
                      <button
                        onClick={() => handleToggleSiteActive(firm)}
                        className={`px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer border ${
                          isSiteActive
                            ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20'
                            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                        }`}
                        title={isSiteActive ? (isAr ? 'إيقاف موقع المكتب مؤقتاً' : 'Suspend site') : (isAr ? 'تفعيل موقع المكتب' : 'Activate site')}
                      >
                        <Power className="w-4 h-4" />
                        <span className="hidden sm:inline">
                          {isSiteActive ? (isAr ? 'إيقاف مؤقت' : 'Suspend') : (isAr ? 'تفعيل الموقع' : 'Activate')}
                        </span>
                      </button>

                      {/* Edit Subscription Settings Modal */}
                      <button
                        onClick={() => handleOpenEdit(firm)}
                        className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer border border-slate-700"
                        title={isAr ? 'تعديل بيانات الباقة والرسوم والتواريخ' : 'Edit Plan Details'}
                      >
                        <Settings2 className="w-4 h-4 text-slate-300" />
                      </button>

                      {/* Change Password Modal */}
                      <button
                        onClick={() => onOpenPasswordModal(firm)}
                        className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer border border-slate-700"
                        title={isAr ? 'تغيير كلمة مرور المدير' : 'Change Admin Password'}
                      >
                        <Key className="w-4 h-4 text-amber-400" />
                      </button>

                      {/* Delete Firm Button */}
                      <button
                        onClick={() => onDeleteFirm(firm)}
                        className="p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition cursor-pointer border border-rose-500/30"
                        title={isAr ? 'حذف المكتب بشكل كامل ونهائي' : 'Delete Firm Permanently'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* VIEW MODE 2: COMPACT HIGH-DENSITY TABLE VIEW FOR DESKTOP */
        <div className="bg-slate-900/90 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-3.5">{isAr ? 'المكتب القانوني' : 'Firm'}</th>
                  <th className="p-3.5">{isAr ? 'الرابط (Slug)' : 'Slug'}</th>
                  <th className="p-3.5">{isAr ? 'المدينة' : 'City'}</th>
                  <th className="p-3.5">{isAr ? 'الباقة' : 'Tier'}</th>
                  <th className="p-3.5">{isAr ? 'تاريخ التجديد' : 'Renewal'}</th>
                  <th className="p-3.5">{isAr ? 'الرسوم' : 'Fee'}</th>
                  <th className="p-3.5">{isAr ? 'الحالة' : 'Status'}</th>
                  <th className="p-3.5 text-center">{isAr ? 'الإجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredFirms.map((firm) => {
                  const ensured = ensureFirmSubscription({ ...firm });
                  const sub = ensured.subscription!;
                  const isSiteActive = sub.isSiteActive !== false;
                  const expiryTime = new Date(sub.endDate).getTime();
                  const isExpired = !isNaN(expiryTime) && expiryTime < Date.now();
                  const formattedEndDate = new Date(sub.endDate).toLocaleDateString(isAr ? 'ar-SA' : 'en-US');

                  return (
                    <tr key={firm.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="p-3.5 font-bold text-white">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-slate-800 text-amber-400 font-bold flex items-center justify-center font-serif-title">
                            {firm.nameAr.charAt(0)}
                          </div>
                          <div>
                            <div>{firm.nameAr}</div>
                            {firm.nameEn && <div className="text-[10px] text-slate-400 font-normal">{firm.nameEn}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 font-mono text-amber-300">?firm={firm.slug}</td>
                      <td className="p-3.5 text-slate-300">{firm.cityAr || '—'}</td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-lg text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/20">
                          {sub.planTier || 'Standard'}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-slate-300">{formattedEndDate}</td>
                      <td className="p-3.5 font-mono text-emerald-400 font-bold">
                        {(sub.annualFee || 0).toLocaleString()} {sub.currency || 'SAR'}
                      </td>
                      <td className="p-3.5">
                        {isSiteActive && !isExpired ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            {isAr ? 'نشط' : 'Live'}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                            {isAr ? 'متوقف' : 'Suspended'}
                          </span>
                        )}
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onSelectFirmToManage(firm.slug)}
                            className="px-2.5 py-1 rounded-lg bg-[#c5a869] text-slate-950 text-[11px] font-bold hover:bg-[#b59859] transition"
                          >
                            {isAr ? 'إدارة' : 'Manage'}
                          </button>
                          <button
                            onClick={() => onSwitchToFirm(firm)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                            title={isAr ? 'زيارة الموقع' : 'Visit Site'}
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(firm)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                            title={isAr ? 'تعديل الاشتراك' : 'Edit Plan'}
                          >
                            <Settings2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteFirm(firm)}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400"
                            title={isAr ? 'حذف المكتب' : 'Delete'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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
