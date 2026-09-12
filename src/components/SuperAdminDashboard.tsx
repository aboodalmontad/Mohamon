import React, { useState, useEffect } from 'react';
import { 
  Layout, Building2, Plus, ExternalLink, Key, Trash2, CheckCircle2, 
  Database, RefreshCw, Copy, ShieldAlert, Sparkles, X, 
  Search, ShieldCheck, FileCode, Sliders, Users, MessageSquare,
  Globe2, ArrowUpRight, HelpCircle, Check, AlertCircle, Edit3,
  Calendar, Power
} from 'lucide-react';
import { firmService } from '../services/firmService';
import { LawFirm } from '../types';
import { SupabaseFirmsTab } from './SupabaseFirmsTab';
import { FirmSubscriptionsTab } from './FirmSubscriptionsTab';
import { PlatformSettingsTab } from './PlatformSettingsTab';

interface SuperAdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'ar' | 'en' | 'tr';
  onSelectFirmToManage: (firmSlug: string) => void;
  onOpenCreateModal: () => void;
}

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({
  isOpen,
  onClose,
  lang,
  onSelectFirmToManage,
  onOpenCreateModal,
}) => {
  const isAr = lang === 'ar';
  const [firms, setFirms] = useState<LawFirm[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'firms' | 'subscriptions' | 'supabase' | 'domains' | 'platform'>('subscriptions');
  
  // Feedback
  const [toastMsg, setToastMsg] = useState('');
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('super_admin_auth') === 'true';
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState(false);

  // Edit password modal state
  const [editingFirm, setEditingFirm] = useState<LawFirm | null>(null);
  const [newPassword, setNewPassword] = useState('');

  const refreshFirms = () => {
    setFirms(firmService.getAllFirms());
  };

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      refreshFirms();
    }
  }, [isOpen, isAuthenticated]);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === 'ghost4mohamon') {
      setIsAuthenticated(true);
      sessionStorage.setItem('super_admin_auth', 'true');
    } else {
      setAuthError(true);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl" dir={isAr ? 'rtl' : 'ltr'}>
        <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-md p-8 shadow-2xl relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 rtl:left-4 rtl:right-auto text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-500 via-[#c5a869] to-amber-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/20">
              <ShieldCheck className="w-8 h-8 text-slate-950" />
            </div>
            <h2 className="text-2xl font-serif text-white mb-2">{isAr ? 'إدارة المنصة' : 'Platform Administration'}</h2>
            <p className="text-slate-400 text-sm">
              {isAr ? 'يرجى إدخال كلمة مرور مدير المنصة للمتابعة' : 'Please enter the platform manager password to continue'}
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  setAuthError(false);
                }}
                placeholder={isAr ? 'كلمة المرور' : 'Password'}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-center focus:border-amber-400 focus:outline-none transition-colors"
                autoFocus
              />
              {authError && (
                <p className="text-rose-400 text-xs text-center mt-2 animate-shake">
                  {isAr ? 'كلمة المرور غير صحيحة' : 'Incorrect password'}
                </p>
              )}
            </div>
            
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#c5a869] to-[#ebd397] hover:from-[#b38a38] hover:to-[#c5a869] text-[#181512] font-bold py-3 rounded-xl transition-all"
            >
              {isAr ? 'تسجيل الدخول' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleToggleSiteActive = async (firm: LawFirm) => {
    const isCurrentlyActive = firm.subscription?.isSiteActive !== false;
    const res = await firmService.toggleFirmSiteStatus(firm.id, !isCurrentlyActive);
    if (res.success) {
      // Also ensure status reflects suspension/activation
      const updatedFirm = firmService.getFirmById(firm.id);
      if (updatedFirm) {
        updatedFirm.status = !isCurrentlyActive ? 'active' : 'suspended';
        await firmService.saveFirm(updatedFirm);
      }
      showToast(res.message);
      refreshFirms();
    }
  };

  const handleApproveFirm = async (firm: LawFirm) => {
    firm.status = 'active';
    if (!firm.subscription) {
      // Create default subscription
      firm.subscription = {
        planTier: 'professional',
        planNameAr: 'الباقة الاحترافية',
        planNameEn: 'Professional Plan',
        status: 'active',
        isSiteActive: true,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
        annualFee: 0
      };
    } else {
      firm.subscription.isSiteActive = true;
    }
    
    await firmService.saveFirm(firm);
    showToast(isAr ? 'تمت الموافقة على المكتب بنجاح وتفعيله' : 'Firm approved successfully');
    refreshFirms();
  };

  const filteredFirms = firms.filter((f) => {
    const q = searchQuery.toLowerCase();
    return (
      f.nameAr.toLowerCase().includes(q) ||
      (f.nameEn && f.nameEn.toLowerCase().includes(q)) ||
      f.slug.toLowerCase().includes(q) ||
      (f.cityAr && f.cityAr.toLowerCase().includes(q))
    );
  });

  const getFirmLandingUrl = (slug: string) => {
    const origin = window.location.origin + window.location.pathname;
    return `${origin}?firm=${slug}`;
  };

  const copyFirmLink = (slug: string) => {
    const url = getFirmLandingUrl(slug);
    navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    showToast(isAr ? 'تم نسخ رابط صفحة الهبوط المستقلة' : 'Landing URL copied');
    setTimeout(() => setCopiedSlug(null), 2500);
  };

  const handleDeleteFirm = async (firm: LawFirm) => {
    if (!confirm(isAr ? `هل أنت متأكد من حذف مكتب "${firm.nameAr}"؟ لا يمكن التراجع عن هذا الإجراء.` : `Delete firm ${firm.nameAr}?`)) {
      return;
    }
    const res = await firmService.deleteFirm(firm.id);
    if (res.success) {
      showToast(res.message);
      refreshFirms();
    } else {
      alert(res.message);
    }
  };

  const handleUpdatePassword = async () => {
    if (!editingFirm || !newPassword.trim()) return;
    const updated = {
      ...editingFirm,
      adminPassword: newPassword.trim(),
      data: {
        ...editingFirm.data,
        settings: {
          ...editingFirm.data.settings,
          adminPassword: newPassword.trim(),
        }
      }
    };
    await firmService.saveFirm(updated);
    showToast(isAr ? 'تم تحديث كلمة مرور مدير المكتب بنجاح' : 'Password updated successfully');
    setEditingFirm(null);
    setNewPassword('');
    refreshFirms();
  };

  // Aggregated platform metrics
  const totalFirms = firms.length;
  const totalAttorneys = firms.reduce((acc, f) => acc + (f.data?.partners?.length || 0), 0);
  const totalMessages = firms.reduce((acc, f) => acc + (f.data?.messages?.length || 0), 0);

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
      <div 
        className="relative w-full max-w-6xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl text-slate-100 flex flex-col max-h-[95vh] overflow-hidden my-auto"
        dir={isAr ? 'rtl' : 'ltr'}
      >
        {/* Top Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 via-[#c5a869] to-amber-700 flex items-center justify-center text-slate-950 font-black shadow-lg">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold font-serif-title text-white">
                  {isAr ? 'لوحة تحكم مالك التطبيق والمنصة الرئيسية' : 'Platform Owner Master Console'}
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  SUPER ADMIN
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {isAr 
                  ? 'إدارة شبكة مكاتب المحامين، استخراج روابط صفحات الهبوط المستقلة، والمزامنة السحابية' 
                  : 'Manage client law firms, issue isolated landing pages, and configure Supabase'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenCreateModal}
              className="px-4 py-2 rounded-xl bg-[#c5a869] hover:bg-[#b59859] text-slate-950 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>{isAr ? 'إنشاء وتدشين مكتب جديد' : 'Add New Law Firm'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              title={isAr ? 'إغلاق' : 'Close'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Global Platform Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-4 bg-slate-950/80 border-b border-slate-800 text-xs">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-slate-400 block text-[11px]">{isAr ? 'المكاتب المشتركة' : 'Registered Firms'}</span>
              <span className="text-lg font-bold text-white font-mono">{totalFirms}</span>
            </div>
            <Building2 className="w-5 h-5 text-[#c5a869]" />
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-slate-400 block text-[11px]">{isAr ? 'المحامين والشركاء' : 'Total Attorneys'}</span>
              <span className="text-lg font-bold text-emerald-400 font-mono">{totalAttorneys}</span>
            </div>
            <Users className="w-5 h-5 text-emerald-400" />
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-slate-400 block text-[11px]">{isAr ? 'الاستشارات الواردة' : 'Client Inquiries'}</span>
              <span className="text-lg font-bold text-cyan-400 font-mono">{totalMessages}</span>
            </div>
            <MessageSquare className="w-5 h-5 text-cyan-400" />
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-slate-400 block text-[11px]">{isAr ? 'صفحات الهبوط' : 'White-Label Pages'}</span>
              <span className="text-lg font-bold text-amber-300 font-mono">100% Isolated</span>
            </div>
            <Globe2 className="w-5 h-5 text-amber-400" />
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-800 bg-slate-950 text-xs overflow-x-auto">
          <button
            onClick={() => setActiveTab('subscriptions')}
            className={`pb-3 px-3 font-semibold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'subscriptions'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-4 h-4 text-amber-400" />
            <span>{isAr ? 'الاشتراكات السنوية وتفعيل المواقع' : 'Annual Subscriptions & Activation'}</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber-500/20 text-amber-300 font-bold">{firms.length}</span>
          </button>

          <button
            onClick={() => setActiveTab('firms')}
            className={`pb-3 px-3 font-semibold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'firms'
                ? 'border-[#c5a869] text-[#c5a869]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>{isAr ? 'دليل المكاتب وصفحات الهبوط' : 'Firms Directory'}</span>
          </button>

          <button
            onClick={() => setActiveTab('supabase')}
            className={`pb-3 px-3 font-semibold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'supabase'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-4 h-4 text-emerald-400" />
            <span>{isAr ? 'قاعدة Supabase والمزامنة السحابية' : 'Supabase Cloud Sync'}</span>
          </button>

          
          <button
            onClick={() => setActiveTab('platform')}
            className={`pb-3 px-3 font-semibold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'platform'
                ? 'border-[#c5a869] text-[#c5a869]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layout className="w-4 h-4" />
            <span>{isAr ? 'تصميم المنصة' : 'Platform UI'}</span>
          </button>

          <button
            onClick={() => setActiveTab('domains')}
            className={`pb-3 px-3 font-semibold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'domains'
                ? 'border-blue-400 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe2 className="w-4 h-4 text-blue-400" />
            <span>{isAr ? 'دليل استضافة Vercel وقاعدة Supabase' : 'Vercel & Supabase Guide'}</span>
          </button>
        </div>

        {/* Toast Alert */}
        {toastMsg && (
          <div className="bg-emerald-500 text-slate-950 font-bold px-4 py-2 text-xs text-center flex items-center justify-center gap-2 shadow-md">
            <Check className="w-4 h-4" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* TAB 0: ANNUAL SUBSCRIPTIONS & SITE ACTIVATION */}
          {activeTab === 'subscriptions' && (
            <FirmSubscriptionsTab
              firms={firms}
              lang={lang}
              onFirmsUpdated={refreshFirms}
              showToast={showToast}
            />
          )}


          {/* TAB 4: PLATFORM UI SETTINGS */}
          {activeTab === 'platform' && (
            <PlatformSettingsTab lang={lang} />
          )}

          {/* TAB 1: LAW FIRMS LIST & LANDING PAGES */}
          {activeTab === 'firms' && (
            <div className="space-y-4">
              {/* Search and Action Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 absolute right-3 top-2.5 text-slate-400 rtl:right-3 rtl:left-auto" />
                  <input
                    type="text"
                    placeholder={isAr ? 'بحث بالاسم أو المدينة أو المعرف...' : 'Search firm, city, or slug...'}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pr-9 pl-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-[#c5a869] focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    onClick={refreshFirms}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1.5 transition cursor-pointer"
                    title={isAr ? 'تحديث' : 'Refresh'}
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>{isAr ? 'تحديث' : 'Refresh'}</span>
                  </button>
                </div>
              </div>

              {/* Firms Table / Cards */}
              <div className="grid grid-cols-1 gap-3">
                {filteredFirms.map((firm) => {
                  const landingUrl = getFirmLandingUrl(firm.slug);
                  const isCopied = copiedSlug === firm.slug;
                  const firmAttorneys = firm.data?.partners?.length || 0;
                  const firmMessages = firm.data?.messages?.length || 0;
                  const isFirmLive = firm.subscription?.isSiteActive !== false;

                  return (
                    <div
                      key={firm.id}
                      className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      {/* Firm Details */}
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-bold text-white flex items-center gap-2">
                            <span>{firm.nameAr}</span>
                            {firm.nameEn && <span className="text-slate-400 text-xs font-normal">({firm.nameEn})</span>}
                          </h3>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                            ?firm={firm.slug}
                          </span>
                          {firm.cityAr && (
                            <span className="px-2 py-0.5 rounded text-[10px] bg-[#c5a869]/10 text-[#c5a869] border border-[#c5a869]/20">
                              {firm.cityAr}
                            </span>
                          )}
                          {/* Live / Suspended / Pending badge */}
                          {firm.status === 'pending' ? (
                            <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                              <span>{isAr ? 'قيد المراجعة' : 'Pending'}</span>
                            </span>
                          ) : firm.status === 'suspended' || !isFirmLive ? (
                            <span className="px-2 py-0.5 rounded text-[10px] bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                              <span>{isAr ? 'الموقع متوقف' : 'Suspended'}</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              <span>{isAr ? 'الموقع مفعل' : 'Live'}</span>
                            </span>
                          )}
                        </div>

                        {/* Standalone Landing Link Display */}
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-slate-500 text-[11px]">{isAr ? 'رابط صفحة الهبوط المستقلة:' : 'Landing URL:'}</span>
                          <span className="font-mono text-emerald-400 text-[11px] truncate max-w-xs sm:max-w-md bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                            {landingUrl}
                          </span>
                          <button
                            onClick={() => copyFirmLink(firm.slug)}
                            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-emerald-400 transition cursor-pointer"
                            title={isAr ? 'نسخ الرابط الصافي لإرساله للمحامي' : 'Copy clean landing URL'}
                          >
                            {isCopied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>

                        {/* Stats & Password Info */}
                        <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 pt-1">
                          <span>{isAr ? 'المحامين:' : 'Lawyers:'} <strong className="text-white">{firmAttorneys}</strong></span>
                          <span>{isAr ? 'الاستشارات المستلمة:' : 'Messages:'} <strong className="text-cyan-400">{firmMessages}</strong></span>
                          <span className="flex items-center gap-1">
                            <Key className="w-3 h-3 text-[#c5a869]" />
                            <span>{isAr ? 'كلمة سر مديره:' : 'PIN:'}</span>
                            <strong className="text-[#c5a869] font-mono">{firm.adminPassword || '123456'}</strong>
                          </span>
                        </div>
                      </div>

                      {/* Firm Actions */}
                      <div className="flex flex-wrap items-center gap-2 justify-end border-t md:border-t-0 pt-2 md:pt-0 border-slate-800">
                        {firm.status === 'pending' && (
                          <button
                            onClick={() => handleApproveFirm(firm)}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition cursor-pointer bg-emerald-500 hover:bg-emerald-400 text-slate-950"
                            title={isAr ? 'اعتماد المكتب وتفعيل الاشتراك' : 'Approve firm and activate subscription'}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{isAr ? 'اعتماد المكتب' : 'Approve'}</span>
                          </button>
                        )}
                        
                        {/* Quick Toggle Site Live / Suspended */}
                        {firm.status !== 'pending' && (
                          <button
                            onClick={() => handleToggleSiteActive(firm)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition cursor-pointer ${
                              isFirmLive
                                ? 'bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-300'
                                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                            }`}
                            title={isFirmLive ? (isAr ? 'إيقاف موقع المكتب مؤقتاً' : 'Suspend site') : (isAr ? 'تفعيل موقع المكتب' : 'Activate site')}
                          >
                            <Power className="w-3.5 h-3.5" />
                            <span>{isFirmLive ? (isAr ? 'إيقاف الموقع' : 'Suspend') : (isAr ? 'تفعيل الموقع' : 'Activate')}</span>
                          </button>
                        )}

                        {/* Open Live Pure Landing Page */}
                        <a
                          href={landingUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-1 transition"
                          title={isAr ? 'فتح صفحة الهبوط المستقلة الصافية' : 'Open isolated firm site'}
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>{isAr ? 'معاينة الموقع' : 'Preview'}</span>
                        </a>

                        {/* Manage Firm Content */}
                        <button
                          onClick={() => onSelectFirmToManage(firm.slug)}
                          className="px-3 py-1.5 rounded-lg bg-[#c5a869] hover:bg-[#b59859] text-slate-950 text-xs font-bold flex items-center gap-1 transition cursor-pointer shadow"
                          title={isAr ? 'تعديل محتوى هذا المكتب كمدير له' : 'Edit firm content'}
                        >
                          <Sliders className="w-3.5 h-3.5" />
                          <span>{isAr ? 'إدارة المحتوى' : 'Manage Content'}</span>
                        </button>

                        {/* Change Password */}
                        <button
                          onClick={() => {
                            setEditingFirm(firm);
                            setNewPassword(firm.adminPassword || '123456');
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                          title={isAr ? 'تغيير كلمة مرور المدير' : 'Change password'}
                        >
                          <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                        </button>

                        {/* Delete Firm */}
                        <button
                          onClick={() => handleDeleteFirm(firm)}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition cursor-pointer"
                          title={isAr ? 'حذف المكتب' : 'Delete'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {filteredFirms.length === 0 && (
                  <div className="p-8 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
                    {isAr ? 'لم يتم العثور على مكاتب تطابق بحثك.' : 'No firms matched your search.'}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: SUPABASE INTEGRATION */}
          {activeTab === 'supabase' && (
            <SupabaseFirmsTab
              lang={lang}
              onFirmSwitched={(slug) => {
                refreshFirms();
                showToast(isAr ? `تم تحديث المكتب: ${slug}` : `Firm refreshed: ${slug}`);
              }}
            />
          )}

          {/* TAB 3: VERCEL HOSTING & SUPABASE CENTRAL DATABASE ARCHITECTURE */}
          {activeTab === 'domains' && (
            <div className="space-y-6 max-w-4xl">
              {/* Architecture Blueprint Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-slate-900 border border-blue-500/30 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                    <Globe2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-base">
                      {isAr ? 'معمارية المنصة: واجهة واحدة للعالم + قاعدة بيانات سحابية واحدة لجميع المكاتب' : 'Platform Architecture: Single Public Face on Vercel + Single Supabase Database'}
                    </h4>
                    <span className="text-xs text-blue-300">
                      {isAr ? 'تم ضبط المعمارية بالكامل وفق متطلباتك' : 'Fully configured according to your requirements'}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {isAr
                    ? 'عند رفع الموقع ونشره على استضافة Vercel، تظهر واجهة الموقع للعالم كموقع رسمي لمكتب محاماة واحد ذو هيبة وفخامة (المكتب المحدد كافتراضي). في الوقت نفسه، يتم ربط الموقع بقاعدة بيانات Supabase مركزية واحدة تحتوي على كل مكاتب المنصة واشتراكاتها، وتتيح لك لوحة مدير المنصة هذه التحكم بجميع الاشتراكات والمكاتب وتغيير المكتب المعروض للعالم بضغطة زر واحدة.'
                    : 'When deployed to Vercel, the public interface shows one single prestigious law office to the world. Simultaneously, a single central Supabase database manages all firms, their settings, and annual subscriptions.'}
                </p>
              </div>

              {/* Step by Step Vercel Deployment Guide */}
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="font-bold text-amber-400 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center text-[11px] font-bold">1</span>
                    <span>{isAr ? 'جاهزية ملف Vercel (تم إعداده مسبقاً):' : 'Vercel Config File (Pre-configured):'}</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    {isAr 
                      ? 'تم إنشاء وتضمين ملف vercel.json في جذر المشروع تلقائياً لتوجيه كافة مسارات SPA بسلاسة وبدون أي أخطاء 404.'
                      : 'The vercel.json configuration is already placed in the root directory for seamless SPA routing.'}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="font-bold text-emerald-400 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-400/20 text-emerald-300 flex items-center justify-center text-[11px] font-bold">2</span>
                    <span>{isAr ? 'متغيرات البيئة في Vercel (Environment Variables):' : 'Vercel Environment Variables:'}</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    {isAr
                      ? 'عند استيراد المشروع في Vercel، أضف المتغيرات التالية في قسم Project Settings &rarr; Environment Variables:'
                      : 'In Vercel Settings &rarr; Environment Variables, provide the following keys:'}
                  </p>
                  <div className="space-y-2 font-mono text-[11px]">
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-emerald-400 flex items-center justify-between">
                      <span>VITE_SUPABASE_URL = https://your-project.supabase.co</span>
                      <span className="text-[10px] text-slate-500 font-sans">{isAr ? 'رابط مشروع Supabase' : 'Project URL'}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-emerald-400 flex items-center justify-between">
                      <span>VITE_SUPABASE_ANON_KEY = eyJhbGciOi...</span>
                      <span className="text-[10px] text-slate-500 font-sans">{isAr ? 'مفتاح anon key' : 'Anon key'}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-cyan-300 flex items-center justify-between">
                      <span>VITE_DEFAULT_FIRM_SLUG = nahwi-law</span>
                      <span className="text-[10px] text-slate-500 font-sans">{isAr ? 'المكتب المعروض للعالم على الدومين الرئيسي' : 'Public firm slug'}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="font-bold text-[#c5a869] flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#c5a869]/20 text-[#c5a869] flex items-center justify-center text-[11px] font-bold">3</span>
                    <span>{isAr ? 'التحكم بالمكتب المعروض للعالم:' : 'Switching the Public Face:'}</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    {isAr
                      ? 'من تبويب "الاشتراكات السنوية وتفعيل المواقع" أعلاه، يمكنك في أي وقت النقر على زر "تعيين كواجهة Vercel" بجانب أي مكتب، وسيتم تحديثه فوراً في قاعدة البيانات السحابية المركزية ليصبح هو الواجهة التي يراها العالم عند دخول الرابط الرئيسي.'
                      : 'From the "Annual Subscriptions" tab above, click "Set Public Face" next to any firm to switch which firm is served on the root Vercel domain.'}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="font-bold text-blue-400 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-400/20 text-blue-300 flex items-center justify-center text-[11px] font-bold">4</span>
                    <span>{isAr ? 'الدومين المخصص والروابط المستقلة (White-Label):' : 'Custom Domains & Direct Links:'}</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    {isAr
                      ? 'كل مكتب مسجل في المنصة يمتلك أيضاً رابط صفحة هبوط خاص ومعزول 100% مثل (your-domain.vercel.app?firm=slug) يمكن للمحامي استخدامه في بطاقته الرقمية، أو توجيه CNAME دومينه الخاص إليه.'
                      : 'Every registered firm can also use its isolated direct link (?firm=slug) or map its custom domain via CNAME.'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal for editing manager password */}
        {editingFirm && (
          <div className="fixed inset-0 z-[130] bg-black/80 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl p-5 space-y-4" dir={isAr ? 'rtl' : 'ltr'}>
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white">
                  {isAr ? `تغيير كلمة مرور مكتب: ${editingFirm.nameAr}` : `Update PIN for ${editingFirm.slug}`}
                </h4>
                <button onClick={() => setEditingFirm(null)} className="text-slate-400 hover:text-white">&times;</button>
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">
                  {isAr ? 'كلمة المرور الجديدة لمدير هذا المكتب:' : 'New Manager Password:'}
                </label>
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono focus:border-[#c5a869] focus:outline-none"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setEditingFirm(null)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  onClick={handleUpdatePassword}
                  className="px-4 py-1.5 rounded-lg bg-[#c5a869] text-slate-950 font-bold text-xs"
                >
                  {isAr ? 'حفظ التغيير' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
