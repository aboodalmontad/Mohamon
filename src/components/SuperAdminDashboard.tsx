import React, { useState, useEffect } from 'react';
import { 
  Layout, Building2, Plus, ExternalLink, Key, Trash2, CheckCircle2, 
  Database, RefreshCw, Copy, ShieldAlert, Sparkles, X, 
  Search, ShieldCheck, FileCode, Sliders, Users, MessageSquare,
  Globe2, ArrowUpRight, HelpCircle, Check, AlertCircle, Edit3,
  Calendar, Power, Download, FileJson, Archive
} from 'lucide-react';
import { motion } from 'motion/react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
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
  const [activeTab, setActiveTab] = useState<'firms' | 'supabase' | 'domains' | 'platform' | 'backup'>('firms');
  
  // Feedback
  const [toastMsg, setToastMsg] = useState('');
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState(false);

  // Edit password modal state
  const [editingFirm, setEditingFirm] = useState<LawFirm | null>(null);
  const [newPassword, setNewPassword] = useState('');

  // Delete firm confirmation modal state
  const [deletingFirmTarget, setDeletingFirmTarget] = useState<LawFirm | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const refreshFirms = () => {
    setFirms(firmService.getAllFirms());
  };

  const handleSwitchToFirm = (firm: LawFirm) => {
    onSelectFirmToManage(firm.slug);
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      setIsAuthenticated(false);
      setPasswordInput('');
      setAuthError(false);
      refreshFirms();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === 'ghost4mohamon') {
      setIsAuthenticated(true);
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
                <p className="text-rose-400 text-xs text-center mt-2">
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

  const handleDeleteFirm = (firm: LawFirm) => {
    setDeletingFirmTarget(firm);
  };

  const confirmDeleteFirmAction = async () => {
    if (!deletingFirmTarget) return;
    setIsDeleting(true);
    const res = await firmService.deleteFirm(deletingFirmTarget.id);
    setIsDeleting(false);
    if (res.success) {
      showToast(res.message);
      setDeletingFirmTarget(null);
      refreshFirms();
    } else {
      showToast(`❌ ${res.message}`);
      setDeletingFirmTarget(null);
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

  const handleDownloadAllFirmsBackup = async () => {
    try {
      const allFirms = firmService.getAllFirms();
      if (allFirms.length === 0) {
        showToast(isAr ? 'لا توجد مكاتب لتصديرها' : 'No firms to export');
        return;
      }

      const zip = new JSZip();
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
      const folderName = `platform_backup_${timestamp}`;
      const folder = zip.folder(folderName);

      if (!folder) throw new Error('Could not create folder in ZIP');

      allFirms.forEach((firm) => {
        // Ensure we are exporting the full firm object including 'data'
        const firmJson = JSON.stringify(firm, null, 2);
        const fileName = `${firm.slug}.json`;
        folder.file(fileName, firmJson);
      });

      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `mohamon_platform_full_backup_${timestamp}.zip`);
      showToast(isAr ? 'تم بدء تحميل النسخة الاحتياطية الشاملة لكافة المكاتب' : 'Platform full backup started');
    } catch (err: any) {
      console.error('Backup error:', err);
      showToast(isAr ? 'فشل إنشاء النسخة الاحتياطية الشاملة' : 'Failed to create platform backup');
    }
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
                <h1 className="text-xl font-bold font-serif-title text-white">
                  {isAr ? 'إدارة المنصة الرئيسية' : 'Platform Owner Master Console'}
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  PLATFORM MANAGER
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {isAr 
                  ? 'إدارة شبكة المكاتب، الاشتراكات، وقاعدة البيانات السحابية' 
                  : 'Manage client law firms, subscriptions, and Supabase cloud database'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenCreateModal}
              className="px-5 py-2.5 rounded-xl bg-[#c5a869] hover:bg-[#b59859] text-slate-950 font-bold text-sm flex items-center gap-2 transition cursor-pointer shadow-lg active:scale-95"
            >
              <Plus className="w-5 h-5" />
              <span>{isAr ? 'إنشاء مكتب جديد' : 'Add New Law Firm'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer border border-transparent hover:border-slate-700"
              title={isAr ? 'إغلاق' : 'Close'}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Global Platform Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-950/80 border-b border-slate-800">
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between shadow-inner">
            <div>
              <span className="text-slate-400 block text-[11px] mb-0.5">{isAr ? 'المكاتب المسجلة' : 'Registered Firms'}</span>
              <span className="text-xl font-bold text-white font-mono">{totalFirms}</span>
            </div>
            <Building2 className="w-6 h-6 text-[#c5a869]" />
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between shadow-inner">
            <div>
              <span className="text-slate-400 block text-[11px] mb-0.5">{isAr ? 'إجمالي المحامين' : 'Total Attorneys'}</span>
              <span className="text-xl font-bold text-emerald-400 font-mono">{totalAttorneys}</span>
            </div>
            <Users className="w-6 h-6 text-emerald-400" />
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between shadow-inner">
            <div>
              <span className="text-slate-400 block text-[11px] mb-0.5">{isAr ? 'الاستشارات' : 'Inquiries'}</span>
              <span className="text-xl font-bold text-cyan-400 font-mono">{totalMessages}</span>
            </div>
            <MessageSquare className="w-6 h-6 text-cyan-400" />
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between shadow-inner">
            <div>
              <span className="text-slate-400 block text-[11px] mb-0.5">{isAr ? 'الاستضافة' : 'Hosting'}</span>
              <span className="text-sm font-bold text-amber-300 font-mono">Vercel Edge</span>
            </div>
            <Globe2 className="w-6 h-6 text-amber-400" />
          </div>
        </div>

        {/* Section Label Header */}
        <div className="px-6 py-2 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            {isAr ? 'أقسام لوحة التحكم المركزية' : 'Platform Master Control Sections'}
          </h3>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-600 font-bold">
            <Sliders className="w-3 h-3" />
            <span>V4.2.0-STABLE</span>
          </div>
        </div>

        {/* Navigation Tabs - ENHANCED FOR MAXIMUM CLARITY */}
        <div className="flex items-center gap-1.5 px-4 pt-3 border-b border-slate-700 bg-slate-800 overflow-x-auto no-scrollbar scroll-smooth">
          <button
            onClick={() => setActiveTab('firms')}
            className={`pb-3 px-6 pt-1 font-bold text-sm transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer relative group ${
              activeTab === 'firms'
                ? 'text-amber-400 bg-amber-400/10 rounded-t-xl'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className={`p-1.5 rounded-lg transition-colors ${activeTab === 'firms' ? 'bg-amber-400/20' : 'bg-slate-800 group-hover:bg-slate-700'}`}>
              <Building2 className="w-5 h-5" />
            </div>
            <span className="text-base">{isAr ? 'إدارة المكاتب والاشتراكات' : 'Manage Firms & Subscriptions'}</span>
            {activeTab === 'firms' && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1.5 bg-amber-400 rounded-t-full shadow-[0_-2px_10px_rgba(251,191,36,0.5)]" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('supabase')}
            className={`pb-3 px-6 pt-1 font-bold text-sm transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer relative group ${
              activeTab === 'supabase'
                ? 'text-emerald-400 bg-emerald-400/10 rounded-t-xl'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className={`p-1.5 rounded-lg transition-colors ${activeTab === 'supabase' ? 'bg-emerald-400/20' : 'bg-slate-800 group-hover:bg-slate-700'}`}>
              <Database className="w-5 h-5" />
            </div>
            <span className="text-base">{isAr ? 'فتح قاعدة البيانات والمزامنة' : 'Database & Sync'}</span>
            {activeTab === 'supabase' && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1.5 bg-emerald-400 rounded-t-full shadow-[0_-2px_10px_rgba(52,211,153,0.5)]" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('platform')}
            className={`pb-3 px-6 pt-1 font-bold text-sm transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer relative group ${
              activeTab === 'platform'
                ? 'text-blue-400 bg-blue-400/10 rounded-t-xl'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className={`p-1.5 rounded-lg transition-colors ${activeTab === 'platform' ? 'bg-blue-400/20' : 'bg-slate-800 group-hover:bg-slate-700'}`}>
              <Layout className="w-5 h-5" />
            </div>
            <span className="text-base">{isAr ? 'تصميم المنصة' : 'Platform UI'}</span>
            {activeTab === 'platform' && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1.5 bg-blue-400 rounded-t-full shadow-[0_-2px_10px_rgba(96,165,250,0.5)]" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('domains')}
            className={`pb-3 px-6 pt-1 font-bold text-sm transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer relative group ${
              activeTab === 'domains'
                ? 'text-purple-400 bg-purple-400/10 rounded-t-xl'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className={`p-1.5 rounded-lg transition-colors ${activeTab === 'domains' ? 'bg-purple-400/20' : 'bg-slate-800 group-hover:bg-slate-700'}`}>
              <Globe2 className="w-5 h-5" />
            </div>
            <span className="text-base">{isAr ? 'الدعم والربط' : 'Support & Integration'}</span>
            {activeTab === 'domains' && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1.5 bg-purple-400 rounded-t-full shadow-[0_-2px_10px_rgba(192,132,252,0.5)]" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`pb-3 px-6 pt-1 font-bold text-sm transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer relative group ${
              activeTab === 'backup'
                ? 'text-rose-400 bg-rose-400/10 rounded-t-xl'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className={`p-1.5 rounded-lg transition-colors ${activeTab === 'backup' ? 'bg-rose-400/20' : 'bg-slate-800 group-hover:bg-slate-700'}`}>
              <Archive className="w-5 h-5" />
            </div>
            <span className="text-base">{isAr ? 'النسخ الاحتياطي الشامل' : 'Full Backup'}</span>
            {activeTab === 'backup' && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1.5 bg-rose-400 rounded-t-full shadow-[0_-2px_10px_rgba(244,63,94,0.5)]" />
            )}
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
          {/* TAB 0: FIRMS MANAGEMENT & SUBSCRIPTIONS */}
          {activeTab === 'firms' && (
            <FirmSubscriptionsTab
              firms={firms}
              lang={lang}
              onFirmsUpdated={refreshFirms}
              showToast={showToast}
              onSelectFirmToManage={onSelectFirmToManage}
              onDeleteFirm={handleDeleteFirm}
              onOpenPasswordModal={(firm) => {
                setEditingFirm(firm);
                setNewPassword(firm.adminPassword || '123456');
              }}
              onSwitchToFirm={handleSwitchToFirm}
            />
          )}

          {/* TAB 4: PLATFORM UI SETTINGS */}
          {activeTab === 'platform' && (
            <PlatformSettingsTab lang={lang} />
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
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="font-bold text-blue-400 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-400/20 text-blue-300 flex items-center justify-center text-[11px] font-bold">3</span>
                    <span>{isAr ? 'الدومين المخصص والروابط المستقلة (White-Label):' : 'Custom Domains & Direct Links:'}</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    {isAr
                      ? 'كل مكتب مسجل في المنصة يمتلك رابط صفحة هبوط خاص ومعزول 100% مثل (your-domain.vercel.app?firm=slug) يمكن للمحامي استخدامه في بطاقته الرقمية، أو توجيه CNAME دومينه الخاص إليه.'
                      : 'Every registered firm can use its isolated direct link (?firm=slug) or map its custom domain via CNAME.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PLATFORM-WIDE BACKUP */}
          {activeTab === 'backup' && (
            <div className="space-y-6 max-w-4xl">
              <div className="p-8 rounded-3xl bg-gradient-to-br from-rose-950/40 via-slate-900 to-slate-950 border border-rose-500/30 shadow-2xl space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />
                
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shadow-lg">
                        <Archive className="w-8 h-8" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white font-serif-title">
                          {isAr ? 'النسخ الاحتياطي الشامل للمنصة' : 'Platform-Wide Full Backup'}
                        </h3>
                        <p className="text-xs text-rose-300 font-medium">
                          {isAr ? 'تنزيل نسخة مضغوطة تحتوي على بيانات كافة المكاتب المسجلة' : 'Download a ZIP archive containing JSON data for every registered firm'}
                        </p>
                      </div>
                    </div>
                    
                    <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
                      {isAr 
                        ? 'هذه الميزة تتيح لك كمدير للمنصة الحصول على لقطة كاملة (Snapshot) لكل محتويات المنصة. سيتم إنشاء ملف JSON مستقل لكل مكتب محاماة يحتوي على الشركاء، الخدمات، المقالات، الإعدادات، والرسائل، ثم جمعها جميعاً في ملف ZIP واحد للتنزيل بضغطة زر.' 
                        : 'This feature allows you to export a complete snapshot of all firms. A separate JSON file will be created for each firm containing all its content, and bundled into a single ZIP file for easy download.'}
                    </p>
                  </div>

                  <button
                    onClick={handleDownloadAllFirmsBackup}
                    className="px-8 py-5 rounded-2xl bg-gradient-to-r from-rose-500 via-rose-600 to-rose-700 hover:brightness-110 text-white font-black text-base flex items-center justify-center gap-3 transition transform hover:scale-[1.02] active:scale-95 shadow-xl shadow-rose-950/40 cursor-pointer"
                  >
                    <Download className="w-6 h-6" />
                    <span>{isAr ? 'تنزيل النسخة الاحتياطية الآن' : 'Download Full Backup Now'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800/60">
                  <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
                      <Building2 className="w-4 h-4" />
                      <span>{isAr ? 'نطاق التصدير' : 'Export Scope'}</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {isAr ? `سيتم تصدير عدد ${firms.length} مكتب محاماة مسجل حالياً.` : `Exporting data for all ${firms.length} registered firms.`}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
                      <FileJson className="w-4 h-4" />
                      <span>{isAr ? 'صيغة البيانات' : 'Data Format'}</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {isAr ? 'ملفات JSON مستقلة لكل مكتب مع كافة الصور والنصوص.' : 'Isolated JSON files per firm with all assets and content.'}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
                      <ShieldCheck className="w-4 h-4" />
                      <span>{isAr ? 'الأمان' : 'Security'}</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {isAr ? 'تنزيل مباشر وآمن لبيانات المكاتب للاحتفاظ بها خارجياً.' : 'Secure direct download for external long-term retention.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Warning Notice */}
              <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-amber-300">{isAr ? 'تنبيه لمدير المنصة' : 'Important Manager Notice'}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {isAr 
                      ? 'هذه النسخة تحتوي على البيانات الحساسة للمكاتب وكلمات مرور المديرين. يرجى الاحتفاظ بها في مكان آمن وعدم مشاركتها مع أطراف غير مصرح لها. يفضل إجراء هذا النسخ بشكل دوري (أسبوعي أو شهري).' 
                      : 'This backup contains sensitive data and manager passwords. Keep it secure and do not share with unauthorized parties. Regular weekly/monthly backups are recommended.'}
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

        {/* Modal for confirming firm deletion */}
        {deletingFirmTarget && (
          <div className="fixed inset-0 z-[150] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
            <div 
              className="w-full max-w-md bg-slate-950 border border-rose-900/80 rounded-3xl p-6 shadow-2xl space-y-5 relative overflow-hidden text-slate-100" 
              dir={isAr ? 'rtl' : 'ltr'}
            >
              <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500" />
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center shrink-0 shadow-lg shadow-rose-500/10">
                  <ShieldAlert className="w-6 h-6 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white font-serif-title">
                    {isAr ? 'تأكيد الحذف النهائي للمكتب' : 'Confirm Permanent Law Firm Deletion'}
                  </h3>
                  <p className="text-xs text-rose-300/90 font-medium">
                    {isAr ? 'تحذير هام: هذا الإجراء نهائي ولا يمكن التراجع عنه!' : 'Critical Warning: This action is permanent and cannot be undone!'}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/90 border border-rose-900/50 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">{isAr ? 'اسم المكتب:' : 'Firm Name:'}</span>
                  <span className="font-bold text-white font-serif-title">{deletingFirmTarget.nameAr}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">{isAr ? 'الرابط المباشر:' : 'Slug:'}</span>
                  <span className="font-mono text-amber-300">?firm={deletingFirmTarget.slug}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">{isAr ? 'عدد المحامين الشركاء:' : 'Attorneys:'}</span>
                  <span className="font-mono text-white">{deletingFirmTarget.data?.partners?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">{isAr ? 'عدد الرسائل والاستشارات:' : 'Inquiries:'}</span>
                  <span className="font-mono text-white">{deletingFirmTarget.data?.messages?.length || 0}</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                {isAr
                  ? 'سيتم مسح كافة البيانات والمستندات والاستشارات والاشتراكات السنوية الخاصة بهذا المكتب نهائياً من الذاكرة وقاعدة البيانات السحابية (Supabase).'
                  : 'All associated data, partner profiles, inquiries, and subscriptions will be permanently erased.'}
              </p>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setDeletingFirmTarget(null)}
                  disabled={isDeleting}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer"
                >
                  {isAr ? 'إلغاء الأمر' : 'Cancel'}
                </button>

                <button
                  onClick={confirmDeleteFirmAction}
                  disabled={isDeleting}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-rose-900/30 transition cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>
                    {isDeleting
                      ? (isAr ? 'جارِ الحذف...' : 'Deleting...')
                      : (isAr ? 'نعم، تأكيد الحذف النهائي' : 'Yes, Delete Permanently')}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
