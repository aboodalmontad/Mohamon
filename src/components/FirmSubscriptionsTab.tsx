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
  Globe
} from 'lucide-react';
import { LawFirm, FirmSubscription, SubscriptionPlanTier, SubscriptionStatus } from '../types';
import { firmService, ensureFirmSubscription } from '../services/firmService';

interface FirmSubscriptionsTabProps {
  firms: LawFirm[];
  lang: 'ar' | 'en' | 'tr';
  onFirmsUpdated: () => void;
  showToast: (msg: string) => void;
}

export const FirmSubscriptionsTab: React.FC<FirmSubscriptionsTabProps> = ({
  firms,
  lang,
  onFirmsUpdated,
  showToast,
}) => {
  const isAr = lang === 'ar';
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  
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

  // Set firm as the single public face on Vercel deployment
  const handleSetDefaultPublic = async (firm: LawFirm) => {
    const confirmMsg = isAr 
      ? `هل تريد تعيين مكتب "${firm.nameAr}" ليكون هو الواجهة الافتراضية الوحيدة المعروضة للعالم على استضافة Vercel؟` 
      : `Set "${firm.nameAr}" as the public facing firm on Vercel root URL?`;
    if (!confirm(confirmMsg)) return;

    const res = await firmService.setDefaultPublicFirm(firm.slug);
    showToast(res.message);
    onFirmsUpdated();
  };

  const defaultPublicSlug = firmService.getDefaultPublicFirmSlug();
  const defaultPublicFirm = firms.find((f) => f.slug === defaultPublicSlug) || firms[0];

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
    // approximate currency normalization if USD -> 3.75 SAR
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
      firm.slug.toLowerCase().includes(q);

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
    <div className="space-y-6">
      {/* Top Banner: Subscriptions Overview & Global Supabase Sync */}
      <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-950 border border-amber-500/20 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-400" />
              <span>{isAr ? 'نظام الاشتراكات السنوية وتفعيل مواقع المحامين' : 'Annual Subscriptions & Lawyer Site Activation'}</span>
            </h2>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            {isAr
              ? 'تحكم كامل في تفعيل أو إيقاف موقع كل مكتب محاماة، متابعة فترات التراخيص السنوية، ورصد الإيرادات، مع مزامنة كافة التحديثات فوراً إلى قاعدة البيانات السحابية Supabase.'
              : 'Manage annual subscriptions, toggle live website access per firm, track expirations, and sync all data to Supabase cloud.'}
          </p>
        </div>

        {/* Global Cloud Sync Action */}
        <button
          onClick={handleSyncAllToSupabase}
          disabled={isSyncingAll}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 disabled:opacity-50 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition cursor-pointer shrink-0"
        >
          <Database className={`w-4 h-4 ${isSyncingAll ? 'animate-spin' : ''}`} />
          <span>
            {isSyncingAll 
              ? (isAr ? 'جارِ المزامنة السحابية...' : 'Syncing...') 
              : (isAr ? 'مزامنة كافة المكاتب والاشتراكات إلى Supabase' : 'Sync All to Cloud')}
          </span>
        </button>
      </div>

      {/* Vercel Public Facing Firm Highlight Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/40 via-slate-900 to-slate-950 border border-blue-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold shrink-0">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <div className="text-slate-400 text-[11px] flex items-center gap-1.5">
              <span>{isAr ? 'المكتب المعروض للعالم على استضافة Vercel (الرئيسي):' : 'Active Public Firm on Vercel Root URL:'}</span>
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            </div>
            <div className="text-white font-bold text-sm sm:text-base flex items-center gap-2 mt-0.5">
              <span>{defaultPublicFirm?.nameAr || 'المستشار أحمد النحوي'}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 font-mono border border-blue-500/30">
                slug: {defaultPublicFirm?.slug || 'nahwi-law'}
              </span>
            </div>
          </div>
        </div>
        <div className="text-slate-400 text-[11px] max-w-sm leading-relaxed sm:text-left rtl:sm:text-right">
          {isAr
            ? 'هذا المكتب هو الوحيد الذي يظهر للزوار العاديين حول العالم عند فتح رابط استضافة Vercel مباشرة. يمكنك تحويل الواجهة لأي مكتب آخر بضغطة زر واحدة أدناه.'
            : 'This is the single firm displayed on the root domain to the world. You can switch the public face to any other firm with one click below.'}
        </div>
      </div>

      {/* Subscription KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
          <div className="flex items-center justify-between mb-1">
            <span className="text-slate-400">{isAr ? 'إجمالي المكاتب' : 'Total Firms'}</span>
            <Building2 className="w-4 h-4 text-[#c5a869]" />
          </div>
          <div className="text-xl font-bold font-mono text-white">{totalFirms}</div>
          <span className="text-[10px] text-slate-500">{isAr ? 'مكاتب مسجلة بالمنصة' : 'Registered firms'}</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-emerald-500/20">
          <div className="flex items-center justify-between mb-1">
            <span className="text-slate-400">{isAr ? 'المواقع النشطة والمفعلة' : 'Active Live Sites'}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400">{activeFirms}</div>
          <span className="text-[10px] text-emerald-500/80">{isAr ? 'تعمل ومتاحة للزوار الآن' : 'Live for visitors'}</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-rose-500/20">
          <div className="flex items-center justify-between mb-1">
            <span className="text-slate-400">{isAr ? 'المواقع المتوقفة أو المنتهية' : 'Suspended / Expired'}</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-xl font-bold font-mono text-rose-400">{suspendedFirms + expiredFirms}</div>
          <span className="text-[10px] text-rose-400/80">{isAr ? 'يظهر للزوار إشعار التوقف' : 'Showing suspended notice'}</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-amber-500/20">
          <div className="flex items-center justify-between mb-1">
            <span className="text-slate-400">{isAr ? 'قيمة الاشتراكات السنوية' : 'Est. Annual Value'}</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold font-mono text-amber-300">
            {totalAnnualRevenueSAR.toLocaleString()} <span className="text-xs font-sans">ر.س</span>
          </div>
          <span className="text-[10px] text-amber-500/80">{isAr ? 'عائدات سنوية تقديرية' : 'Annual recurring revenue'}</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        {/* Status Filters */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-lg transition font-medium cursor-pointer whitespace-nowrap ${
              filterStatus === 'all' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            {isAr ? 'كافة المكاتب' : 'All'} ({firms.length})
          </button>
          <button
            onClick={() => setFilterStatus('active')}
            className={`px-3 py-1.5 rounded-lg transition font-medium cursor-pointer whitespace-nowrap ${
              filterStatus === 'active' ? 'bg-emerald-500/20 text-emerald-400 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            {isAr ? 'المفعلة' : 'Active'} ({activeFirms})
          </button>
          <button
            onClick={() => setFilterStatus('suspended')}
            className={`px-3 py-1.5 rounded-lg transition font-medium cursor-pointer whitespace-nowrap ${
              filterStatus === 'suspended' ? 'bg-rose-500/20 text-rose-400 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            {isAr ? 'المتوقفة مؤقتاً' : 'Suspended'} ({suspendedFirms})
          </button>
          <button
            onClick={() => setFilterStatus('expired')}
            className={`px-3 py-1.5 rounded-lg transition font-medium cursor-pointer whitespace-nowrap ${
              filterStatus === 'expired' ? 'bg-amber-500/20 text-amber-400 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            {isAr ? 'المنتهية' : 'Expired'} ({expiredFirms})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute right-3 top-2.5 text-slate-500 rtl:right-3 rtl:left-auto" />
          <input
            type="text"
            placeholder={isAr ? 'بحث باسم المكتب أو الرابط...' : 'Search firm or slug...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-9 pl-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-amber-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Firm Subscriptions List */}
      <div className="space-y-3">
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

          const landingUrl = `${window.location.origin}${window.location.pathname}?firm=${firm.slug}`;

          return (
            <div
              key={firm.id}
              className={`p-4 sm:p-5 rounded-2xl border transition ${
                !isSiteActive
                  ? 'bg-rose-950/10 border-rose-900/40 hover:border-rose-700/60'
                  : isExpired
                  ? 'bg-amber-950/10 border-amber-900/40 hover:border-amber-700/60'
                  : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Firm & Plan Info */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                      <span>{firm.nameAr}</span>
                      {firm.nameEn && (
                        <span className="text-slate-400 text-xs font-normal">({firm.nameEn})</span>
                      )}
                    </h3>

                    {/* Slug tag */}
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900 text-amber-300 border border-slate-800">
                      ?firm={firm.slug}
                    </span>

                    {/* Plan Tier Badge */}
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      <span>{isAr ? sub.planNameAr : sub.planNameEn}</span>
                    </span>

                    {/* Site Status Badge */}
                    {isSiteActive && !isExpired ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>{isAr ? 'موقع نشط ومفعل' : 'Live Website'}</span>
                      </span>
                    ) : !isSiteActive ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                        <span>{isAr ? 'الموقع متوقف مؤقتاً' : 'Site Suspended'}</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>{isAr ? 'الاشتراك منتهي الصلاحية' : 'Subscription Expired'}</span>
                      </span>
                    )}

                    {/* Vercel Public Facing Indicator Badge */}
                    {(firm.slug === defaultPublicSlug || firm.isDefaultPublic) && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40 flex items-center gap-1 shadow-sm">
                        <Globe className="w-3 h-3 text-blue-400" />
                        <span>{isAr ? 'الواجهة المعروضة للعالم على Vercel' : 'Vercel Public Portal'}</span>
                      </span>
                    )}
                  </div>

                  {/* Subscription dates & fees */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-400 pt-1">
                    <div>
                      <span className="text-slate-500 block text-[11px]">{isAr ? 'تاريخ البدء:' : 'Start Date:'}</span>
                      <span className="font-mono text-slate-200">{formattedStartDate}</span>
                    </div>

                    <div>
                      <span className="text-slate-500 block text-[11px]">{isAr ? 'تاريخ التجديد السنوي:' : 'Renewal Date:'}</span>
                      <span className={`font-mono font-bold ${isExpired ? 'text-rose-400' : 'text-amber-300'}`}>
                        {formattedEndDate}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-500 block text-[11px]">{isAr ? 'المتبقي في الاشتراك:' : 'Remaining:'}</span>
                      <span className={`font-semibold ${daysRemaining < 30 ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {daysRemaining > 0 
                          ? (isAr ? `${daysRemaining} يوم` : `${daysRemaining} days`) 
                          : (isAr ? 'منتهي الصلاحية' : 'Expired')}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-500 block text-[11px]">{isAr ? 'الرسوم السنوية:' : 'Annual Fee:'}</span>
                      <span className="font-mono font-bold text-white">
                        {(sub.annualFee ?? 0).toLocaleString()} {sub.currency || 'SAR'}
                      </span>
                      <span className={`mr-1 px-1.5 py-0.2 rounded text-[9px] font-semibold ${
                        sub.paymentStatus === 'paid' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                      }`}>
                        {sub.paymentStatus === 'paid' ? (isAr ? 'مدفوع' : 'Paid') : (isAr ? 'معلق' : 'Pending')}
                      </span>
                    </div>
                  </div>

                  {/* Notes if any */}
                  {sub.notes && (
                    <p className="text-[11px] text-slate-500 italic bg-slate-900/60 px-3 py-1 rounded-lg border border-slate-800 inline-block">
                      {sub.notes}
                    </p>
                  )}
                </div>

                {/* Control Actions */}
                <div className="flex flex-wrap items-center gap-2 justify-end pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                  {/* Master Site Activation Switch Button */}
                  <button
                    onClick={() => handleToggleSiteActive(firm)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow ${
                      isSiteActive
                        ? 'bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-300'
                        : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                    }`}
                    title={isSiteActive ? (isAr ? 'إيقاف موقع المحامي مؤقتاً' : 'Suspend site') : (isAr ? 'تفعيل موقع المحامي فوراً' : 'Activate site')}
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>
                      {isSiteActive
                        ? (isAr ? 'إيقاف الموقع مؤقتاً' : 'Suspend Site')
                        : (isAr ? 'تفعيل موقع المحامي' : 'Activate Site')}
                    </span>
                  </button>

                  {/* Switch Vercel Public Facing Firm */}
                  {firm.slug !== defaultPublicSlug && !firm.isDefaultPublic ? (
                    <button
                      onClick={() => handleSetDefaultPublic(firm)}
                      className="px-3 py-2 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/40 text-blue-300 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                      title={isAr ? 'تعيين هذا المكتب ليكون واجهة الموقع العامة المعروضة على استضافة Vercel' : 'Set as public facing portal on Vercel'}
                    >
                      <Globe className="w-3.5 h-3.5 text-blue-400" />
                      <span>{isAr ? 'تعيين كواجهة Vercel' : 'Set Public Face'}</span>
                    </button>
                  ) : (
                    <span className="px-3 py-2 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5" />
                      <span>{isAr ? 'الواجهة الرئيسية' : 'Public Face'}</span>
                    </span>
                  )}

                  {/* Quick +1 Year Renewal */}
                  <button
                    onClick={() => handleRenewOneYear(firm)}
                    className="px-3.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                    title={isAr ? 'تمديد وتجديد الاشتراك لسنة كاملة إضافية' : 'Extend subscription by +1 year'}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isAr ? '+1 سنة تجديد' : '+1 Year Renew'}</span>
                  </button>

                  {/* Edit Full Subscription Settings */}
                  <button
                    onClick={() => handleOpenEdit(firm)}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                    title={isAr ? 'تعديل بيانات الباقة والرسوم والتواريخ' : 'Edit subscription'}
                  >
                    <Sliders className="w-3.5 h-3.5 text-[#c5a869]" />
                    <span>{isAr ? 'تعديل الباقة' : 'Edit Plan'}</span>
                  </button>

                  {/* Preview Firm Landing Site */}
                  <a
                    href={landingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition"
                    title={isAr ? 'معاينة الموقع المستقل' : 'Preview isolated site'}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          );
        })}

        {filteredFirms.length === 0 && (
          <div className="p-8 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-2xl">
            {isAr ? 'لم يتم العثور على مكاتب تطابق هذا الفلتر.' : 'No firms match this subscription filter.'}
          </div>
        )}
      </div>

      {/* Subscription Edit Modal */}
      {editingFirm && editForm && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div 
            className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 text-slate-100 space-y-4 max-h-[90vh] overflow-y-auto"
            dir={isAr ? 'rtl' : 'ltr'}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">
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
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg cursor-pointer flex items-center gap-1.5"
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
