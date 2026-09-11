import React, { useState, useEffect } from 'react';
import {
  Database,
  Globe2,
  Building2,
  PlusCircle,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  KeyRound,
  Trash2,
  CheckCircle2,
  Code2,
  Upload,
  Download,
  Search,
  Sparkles,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { supabaseConfigService, testSupabaseConnection, SUPABASE_SQL_SCHEMA, SUPABASE_QUICK_RLS_FIX_SQL } from '../lib/supabase';
import { firmService } from '../services/firmService';
import { storageService } from '../services/storageService';
import { LawFirm, SupabaseConfig, Language } from '../types';
import { COUNTRIES_LIST } from '../data/countries';

interface SupabaseFirmsTabProps {
  lang: Language;
  onFirmSwitched?: (slug: string) => void;
}

export const SupabaseFirmsTab: React.FC<SupabaseFirmsTabProps> = ({ lang, onFirmSwitched }) => {
  const isAr = lang === 'ar';

  // Supabase connection state
  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfig>(supabaseConfigService.getConfig());
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{
    tested: boolean;
    connected: boolean;
    message: string;
  }>({
    tested: false,
    connected: supabaseConfigService.isConfigured(),
    message: supabaseConfigService.isConfigured() ? 'المفاتيح مدخلة في النظام' : 'لم يتم إدخال مفاتيح Supabase بعد',
  });

  // Sync operations state
  const [isSyncingToSupabase, setIsSyncingToSupabase] = useState(false);
  const [isFetchingFromSupabase, setIsFetchingFromSupabase] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Schema copy
  const [copiedSchema, setCopiedSchema] = useState(false);
  const [showSchemaBox, setShowSchemaBox] = useState(false);
  const [copiedColumnFix, setCopiedColumnFix] = useState(false);
  const [copiedRlsFix, setCopiedRlsFix] = useState(false);

  // Law Firms Management
  const [firms, setFirms] = useState<LawFirm[]>([]);
  const [activeSlug, setActiveSlug] = useState<string>(firmService.getActiveFirmSlug());
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  // New Firm creation modal/form
  const [showAddModal, setShowAddModal] = useState(false);
  const [newNameAr, setNewNameAr] = useState('');
  const [newNameEn, setNewNameEn] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [newCityAr, setNewCityAr] = useState('');
  const [newCountryAr, setNewCountryAr] = useState('المملكة العربية السعودية');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('123456');
  const [newTaglineAr, setNewTaglineAr] = useState('');
  const [isSubmittingNew, setIsSubmittingNew] = useState(false);

  // Custom Delete Confirmation Modal state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [firmToDelete, setFirmToDelete] = useState<{ slug: string; nameAr: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const refreshFirms = () => {
    const list = firmService.getAllFirms();
    setFirms(list);
    setActiveSlug(firmService.getActiveFirmSlug());
  };

  useEffect(() => {
    refreshFirms();
  }, []);

  // Save Supabase credentials
  const handleSaveSupabaseConfig = (e: React.FormEvent) => {
    e.preventDefault();
    supabaseConfigService.saveConfig(supabaseConfig);
    setSyncFeedback({
      type: 'success',
      msg: 'تم حفظ إعدادات Supabase بنجاح!',
    });
    setTimeout(() => setSyncFeedback(null), 3000);
  };

  // Test Supabase connection
  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    setSyncFeedback(null);
    try {
      const result = await testSupabaseConnection(supabaseConfig);
      setConnectionStatus({
        tested: true,
        connected: result.success,
        message: result.message,
      });
      setSyncFeedback({
        type: result.success ? 'success' : 'error',
        msg: result.message,
      });
    } catch (err: any) {
      setConnectionStatus({
        tested: true,
        connected: false,
        message: err.message || 'فشل الاتصال بقاعدة البيانات',
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  // Push all firms to Supabase
  const handlePushAllToSupabase = async () => {
    setIsSyncingToSupabase(true);
    setSyncFeedback(null);
    try {
      // Auto-save configuration if user entered values in inputs
      if (supabaseConfig.url || supabaseConfig.anonKey) {
        supabaseConfigService.saveConfig(supabaseConfig);
      }
      const res = await firmService.syncToSupabase();
      if (res.success) {
        setSyncFeedback({
          type: 'success',
          msg: res.message || 'تمت مزامنة ورفع كافة المكاتب إلى Supabase بنجاح!',
        });
        refreshFirms();
      } else {
        setSyncFeedback({
          type: 'error',
          msg: res.message || 'تعذر المزامنة مع Supabase. تأكد من تشغيل كود SQL في لوحة Supabase.',
        });
      }
    } catch (err: any) {
      setSyncFeedback({
        type: 'error',
        msg: err.message || 'حدث خطأ في المزامنة',
      });
    } finally {
      setIsSyncingToSupabase(false);
    }
  };

  // Fetch all firms from Supabase
  const handleFetchFromSupabase = async () => {
    setIsFetchingFromSupabase(true);
    setSyncFeedback(null);
    try {
      if (supabaseConfig.url || supabaseConfig.anonKey) {
        supabaseConfigService.saveConfig(supabaseConfig);
      }
      const res = await firmService.syncFromSupabase();
      if (res.success) {
        refreshFirms();
        setSyncFeedback({
          type: 'success',
          msg: res.message || 'تم جلب وتحديث المكاتب من Supabase بنجاح!',
        });
      } else {
        setSyncFeedback({
          type: 'error',
          msg: res.message || 'فشل جلب البيانات من Supabase',
        });
      }
    } catch (err: any) {
      setSyncFeedback({
        type: 'error',
        msg: err.message || 'حدث خطأ أثناء جلب البيانات',
      });
    } finally {
      setIsFetchingFromSupabase(false);
    }
  };

  // Copy SQL schema
  const handleCopySchema = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 2500);
  };

  // Copy 1-line column update SQL for existing databases
  const handleCopyColumnFix = () => {
    navigator.clipboard.writeText('ALTER TABLE public.law_firms ADD COLUMN IF NOT EXISTS is_default_public BOOLEAN DEFAULT false;');
    setCopiedColumnFix(true);
    setTimeout(() => setCopiedColumnFix(false), 2500);
  };

  // Copy quick RLS disable command to allow immediate anon writes
  const handleCopyRlsFix = () => {
    navigator.clipboard.writeText(SUPABASE_QUICK_RLS_FIX_SQL);
    setCopiedRlsFix(true);
    setTimeout(() => setCopiedRlsFix(false), 2500);
  };

  // Switch active firm to edit
  const handleSwitchFirm = (slug: string) => {
    storageService.switchFirm(slug);
    setActiveSlug(slug);
    refreshFirms();
    if (onFirmSwitched) {
      onFirmSwitched(slug);
    }
    setSyncFeedback({
      type: 'success',
      msg: `تم التبديل إلى مكتب [${slug}] بنجاح! يمكنك الآن تعديل بياناته وأقسامه في التبويبات الأخرى.`,
    });
    setTimeout(() => setSyncFeedback(null), 4000);
  };

  // Copy firm link
  const handleCopyLink = (slug: string) => {
    const url = new URL(window.location.origin + window.location.pathname);
    url.searchParams.set('firm', slug);
    navigator.clipboard.writeText(url.toString());
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2500);
  };

  // Delete firm - step 1: show confirm modal
  const handleDeleteFirm = (slug: string, nameAr: string) => {
    if (slug === 'al-adl') {
      setSyncFeedback({ type: 'error', msg: 'لا يمكن حذف المكتب الافتراضي للمنصة.' });
      return;
    }
    setFirmToDelete({ slug, nameAr });
    setShowDeleteConfirm(true);
  };

  // Delete firm - step 2: actual execution
  const performDeleteFirm = async () => {
    if (!firmToDelete) return;
    
    setIsDeleting(true);
    try {
      const res = await firmService.deleteFirm(firmToDelete.slug);
      if (res.success) {
        setSyncFeedback({ type: 'success', msg: res.message });
        refreshFirms();
      } else {
        setSyncFeedback({ type: 'error', msg: res.message });
      }
    } catch (err: any) {
      setSyncFeedback({ type: 'error', msg: err.message || 'حدث خطأ أثناء الحذف' });
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      setFirmToDelete(null);
    }
  };

  // Create new firm
  const handleCreateNewFirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNameAr.trim()) return;

    setIsSubmittingNew(true);
    try {
      const selectedCountryObj = COUNTRIES_LIST.find(c => c.ar === newCountryAr) || { ar: 'المملكة العربية السعودية', en: 'Saudi Arabia' };
      const res = await firmService.createFirm({
        nameAr: newNameAr.trim(),
        nameEn: newNameEn.trim(),
        slug: newSlug.trim() || undefined,
        cityAr: newCityAr.trim() || 'الرياض',
        countryAr: selectedCountryObj.ar,
        countryEn: selectedCountryObj.en,
        phone: newPhone.trim(),
        email: newEmail.trim(),
        adminPassword: newPassword.trim() || '123456',
        taglineAr: newTaglineAr.trim(),
      });

      if (res.success && res.firm) {
        refreshFirms();
        setShowAddModal(false);
        setNewNameAr('');
        setNewNameEn('');
        setNewSlug('');
        setNewCityAr('');
        setNewPhone('');
        setNewEmail('');
        setSyncFeedback({
          type: 'success',
          msg: `تم تسجيل مكتب "${res.firm.nameAr}" بنجاح وتوفير موقعه فوراً!`,
        });
      } else {
        setSyncFeedback({
          type: 'error',
          msg: res.message || 'فشل في إنشاء المكتب',
        });
      }
    } catch (err: any) {
      setSyncFeedback({
        type: 'error',
        msg: err.message || 'حدث خطأ غير متوقع',
      });
    } finally {
      setIsSubmittingNew(false);
    }
  };

  const filteredFirms = firms.filter(
    (f) =>
      (f.nameAr || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.nameEn || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.slug || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.cityAr || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Top Banner Alert */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-[#1c1813] to-slate-900 border border-[#c5a869]/40 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#d4b068] text-xs font-bold mb-1">
              <Globe2 className="w-4 h-4" />
              <span>منصة متعددة المكاتب القانونية (Multi-Tenant Legal Platform)</span>
            </div>
            <h3 className="text-xl font-bold text-white font-serif-title">
              إدارة شبكة المكاتب وقاعدة بيانات Supabase السحابية
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
              يمكّنك هذا القسم من ربط المنصة بقاعدة بيانات Supabase لخدمة مئات المكاتب القانونية، بحيث يمتلك كل مكتب موقعه المستقل وبياناته ولوحة تحكمه الخاصة، مع حفظ التعديلات سحابياً لتظهر للزوار حول العالم.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#b38a38] to-[#87641d] hover:brightness-110 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>إضافة مكتب قانوني جديد</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sync Feedback Toast Banner */}
      {syncFeedback && (
        <div className="space-y-3">
          <div
            className={`p-4 rounded-xl text-xs font-medium flex items-center gap-2.5 transition-all shadow-md ${
              syncFeedback.type === 'success'
                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/50'
                : 'bg-rose-950/80 text-rose-300 border border-rose-500/50'
            }`}
          >
            {syncFeedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            )}
            <span className="leading-relaxed">{syncFeedback.msg}</span>
          </div>

          {/* Actionable Solution: RLS Fix Box */}
          {syncFeedback.type === 'error' && (syncFeedback.msg.includes('RLS') || syncFeedback.msg.includes('سياسة الأمان') || syncFeedback.msg.includes('row-level security')) && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-3 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 font-bold text-amber-300">
                  <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                  <span>الحل الفوري لمشكلة صلاحيات الرفع (RLS):</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyRlsFix}
                  className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold flex items-center gap-1.5 transition shrink-0 cursor-pointer self-start sm:self-auto"
                >
                  {copiedRlsFix ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedRlsFix ? 'تم نسخ أمر فك القفل!' : 'نسخ أمر فك القفل (RLS Disable)'}</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                قاعدة بيانات Supabase مفعّل عليها نظام الحماية (Row Level Security) ويمنع الكتابة بالمفتاح العام (anon). قم بنسخ الأمر أدناه وتشغيله في <strong>SQL Editor</strong> داخل Supabase لفك الحظر فوراً:
              </p>
              <pre className="p-2.5 bg-slate-950 rounded-lg text-[11px] font-mono text-amber-300 border border-amber-500/20 overflow-x-auto" dir="ltr">
                ALTER TABLE IF EXISTS public.law_firms DISABLE ROW LEVEL SECURITY;
              </pre>
            </div>
          )}

          {/* Actionable Solution: Missing Table Schema Box */}
          {syncFeedback.type === 'error' && (syncFeedback.msg.includes('غير موجود') || syncFeedback.msg.includes('does not exist') || syncFeedback.msg.includes('42P01')) && (
            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-200 text-xs space-y-3 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 font-bold text-blue-300">
                  <Code2 className="w-4 h-4 flex-shrink-0" />
                  <span>جدول law_firms غير منشأ بعد في مشروعك:</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopySchema}
                  className="px-3 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 text-xs font-semibold flex items-center gap-1.5 transition shrink-0 cursor-pointer self-start sm:self-auto"
                >
                  {copiedSchema ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSchema ? 'تم نسخ كود الجداول!' : 'نسخ كود SQL لإنشاء الجداول'}</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                توجه إلى Supabase Dashboard &gt; <strong>SQL Editor</strong> &gt; <strong>New Query</strong>، الصق الكود واضغط <strong>Run</strong>، ثم أعد الضغط على زر المزامنة هنا.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Active Firm Highlight Badge */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-400">أنت تدير وتعدل حالياً بيانات موقع:</span>
          <span className="font-bold text-[#d4b068] text-sm font-serif-title">
            {firms.find((f) => f.slug === activeSlug)?.nameAr || activeSlug}
          </span>
          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[11px]">
            ?firm={activeSlug}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleCopyLink(activeSlug)}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copiedSlug === activeSlug ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>نسخ رابط هذا المكتب</span>
          </button>
          <a
            href={`/?firm=${activeSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#d4b068]" />
            <span>عرض موقع المكتب</span>
          </a>
        </div>
      </div>

      {/* SECTION 1: SUPABASE CONFIGURATION & SYNC */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white font-serif-title">
                إعدادات الربط مع قاعدة بيانات Supabase
              </h4>
              <p className="text-xs text-slate-400">
                ربط سحابي فوري لحفظ بيانات كافة المكاتب ومزامنتها في جدول PostgreSQL المركزي
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border ${
                connectionStatus.connected
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${connectionStatus.connected ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              <span>{connectionStatus.connected ? 'متصل بـ Supabase' : 'غير متصل'}</span>
            </span>
          </div>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSaveSupabaseConfig} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              رابط المشروع (Supabase Project URL)
            </label>
            <input
              type="url"
              placeholder="https://your-project.supabase.co"
              value={supabaseConfig.url}
              onChange={(e) => setSupabaseConfig({ ...supabaseConfig, url: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono focus:border-[#c5a869] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              المفتاح العام (Supabase Anon Key)
            </label>
            <input
              type="text"
              placeholder="eyJhbGciOiJIUzI1NiIsIn..."
              value={supabaseConfig.anonKey}
              onChange={(e) => setSupabaseConfig({ ...supabaseConfig, anonKey: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono focus:border-[#c5a869] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              اسم جدول المكاتب (Table Name)
            </label>
            <input
              type="text"
              placeholder="law_firms"
              value={supabaseConfig.tableName || 'law_firms'}
              onChange={(e) => setSupabaseConfig({ ...supabaseConfig, tableName: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono focus:border-[#c5a869] focus:outline-none"
            />
          </div>

          <div className="md:col-span-3 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                حفظ بيانات الاتصال
              </button>

              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTestingConnection}
                className="px-4 py-2 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/40 border border-emerald-500/50 text-emerald-200 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isTestingConnection ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />}
                <span>اختبار وفحص الاتصال بقاعدة البيانات</span>
              </button>

              <button
                type="button"
                onClick={() => setShowSchemaBox(!showSchemaBox)}
                className="px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Code2 className="w-3.5 h-3.5 text-[#c5a869]" />
                <span>{showSchemaBox ? 'إخفاء كود SQL' : 'عرض كود SQL لإنشاء جداول Supabase'}</span>
              </button>
            </div>

            {/* Supabase Push / Pull Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePushAllToSupabase}
                disabled={isSyncingToSupabase}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 text-slate-950 text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isSyncingToSupabase ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                <span>رفع ومزامنة كافة المكاتب إلى Supabase</span>
              </button>

              <button
                type="button"
                onClick={handleFetchFromSupabase}
                disabled={isFetchingFromSupabase}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isFetchingFromSupabase ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                <span>جلب وتحديث من Supabase</span>
              </button>
            </div>
          </div>
        </form>

        {/* SQL Schema Box */}
        {showSchemaBox && (
          <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                <Code2 className="w-4 h-4" />
                <span>كود SQL جاهز لإنشاء الجداول في Supabase SQL Editor:</span>
              </div>
              <button
                type="button"
                onClick={handleCopySchema}
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedSchema ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSchema ? 'تم نسخ كود SQL!' : 'نسخ كود SQL'}</span>
              </button>
            </div>
            <pre className="p-3 rounded-lg bg-black text-slate-300 text-[11px] font-mono overflow-x-auto max-h-48 border border-slate-800" dir="ltr">
              {SUPABASE_SQL_SCHEMA}
            </pre>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              طريقة الاستخدام: انسخ الكود أعلاه، ثم توجه إلى لوحة تحكم مشروعك في Supabase، اضغط على <strong>SQL Editor</strong>، ثم <strong>New query</strong> والصق الكود واضغط <strong>Run</strong>.
            </p>

            {/* Quick 1-line schema update notice for existing tables */}
            <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <span className="font-bold flex items-center gap-1.5 text-amber-300 text-[11px]">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>تحديث جدول law_firms الموجود مسبقاً (إضافة عمود الواجهة الافتراضية):</span>
                </span>
                <p className="text-[10px] text-slate-300 font-mono bg-slate-950 p-1.5 rounded border border-slate-800 break-all" dir="ltr">
                  ALTER TABLE public.law_firms ADD COLUMN IF NOT EXISTS is_default_public BOOLEAN DEFAULT false;
                </p>
              </div>
              <button
                type="button"
                onClick={handleCopyColumnFix}
                className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold flex items-center gap-1.5 transition shrink-0 cursor-pointer"
              >
                {copiedColumnFix ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedColumnFix ? 'تم النسخ!' : 'نسخ أمر التحديث'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: LAW FIRMS DIRECTORY LIST */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div>
            <h4 className="text-base font-bold text-white font-serif-title">
              شبكة وقائمة المكاتب القانونية المسجلة ({firms.length} مكتب)
            </h4>
            <p className="text-xs text-slate-400">
              يمكنك التبديل فوراً لإدارة وتعديل أي مكتب، أو مشاركة رابطه المباشر المستقل
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute right-3 top-3 text-slate-400 rtl:right-3 rtl:left-auto" />
            <input
              type="text"
              placeholder="ابحث بالاسم أو الرابط أو المدينة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-9 pl-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:border-[#c5a869] focus:outline-none"
            />
          </div>
        </div>

        {/* Table of Firms */}
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-semibold">
              <tr>
                <th className="p-3">المكتب القانوني</th>
                <th className="p-3">المعرف (Slug)</th>
                <th className="p-3">المدينة</th>
                <th className="p-3">التواصل</th>
                <th className="p-3">كلمة مرور المدير</th>
                <th className="p-3">الحالة</th>
                <th className="p-3 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredFirms.map((firm) => {
                const isActive = firm.slug === activeSlug;
                const isCopied = copiedSlug === firm.slug;

                return (
                  <tr
                    key={firm.id}
                    className={`transition-colors ${
                      isActive ? 'bg-[#c5a869]/10' : 'hover:bg-slate-800/50'
                    }`}
                  >
                    {/* Name & Badge */}
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 text-[#d4b068] font-bold flex items-center justify-center font-serif-title">
                          {firm.nameAr.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <span>{firm.nameAr}</span>
                            {isActive && (
                              <span className="px-1.5 py-0.2 rounded bg-[#c5a869] text-slate-950 text-[10px] font-bold">
                                النشط حالياً
                              </span>
                            )}
                          </div>
                          {firm.nameEn && <span className="text-[10px] text-slate-400">{firm.nameEn}</span>}
                        </div>
                      </div>
                    </td>

                    {/* Slug */}
                    <td className="p-3 font-mono text-slate-300">
                      <span className="bg-slate-950 px-2 py-1 rounded border border-slate-800">
                        {firm.slug}
                      </span>
                    </td>

                    {/* City */}
                    <td className="p-3 text-slate-300">{firm.cityAr || 'غير محدد'}</td>

                    {/* Contact */}
                    <td className="p-3 text-slate-300">
                      <div className="space-y-0.5">
                        {firm.phone && <div dir="ltr">{firm.phone}</div>}
                        {firm.email && <div className="text-[10px] text-slate-400">{firm.email}</div>}
                      </div>
                    </td>

                    {/* Password */}
                    <td className="p-3 font-mono text-amber-300">
                      <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        {firm.adminPassword || '123456'}
                      </span>
                    </td>

                    {/* Verification */}
                    <td className="p-3">
                      {firm.isVerified ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                          <ShieldCheck className="w-3 h-3" />
                          <span>معتمد</span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">قيد المراجعة</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-3">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Switch to edit this firm */}
                        {!isActive ? (
                          <button
                            type="button"
                            onClick={() => handleSwitchFirm(firm.slug)}
                            className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-[#b38a38] to-[#87641d] hover:brightness-110 text-white font-bold text-[11px] transition-all cursor-pointer"
                            title="الانتقال لإدارة وتعديل بيانات هذا المكتب"
                          >
                            تعديل هذا المكتب
                          </button>
                        ) : (
                          <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 text-[11px]">
                            يتم تعديله الآن
                          </span>
                        )}

                        {/* Copy Link */}
                        <button
                          type="button"
                          onClick={() => handleCopyLink(firm.slug)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                          title="نسخ رابط المكتب"
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>

                        {/* Visit Site */}
                        <a
                          href={`/?firm=${firm.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                          title="زيارة موقع المكتب المستقل"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>

                        {/* Delete firm */}
                        {firm.slug !== 'al-adl' && (
                          <button
                            type="button"
                            onClick={() => handleDeleteFirm(firm.slug, firm.nameAr)}
                            className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-400 border border-rose-900 transition-colors cursor-pointer"
                            title="حذف المكتب"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE NEW LAW FIRM MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-xl p-6 rounded-3xl bg-slate-900 border border-[#c5a869]/60 shadow-2xl text-right space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-white font-bold font-serif-title text-base">
                <Building2 className="w-5 h-5 text-[#d4b068]" />
                <span>إضافة وتسجيل مكتب قانوني جديد على المنصة</span>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNewFirm} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    اسم المكتب بالعربية <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: مكتب الأستاذ فهد السبيعي"
                    value={newNameAr}
                    onChange={(e) => {
                      setNewNameAr(e.target.value);
                      if (!newSlug) {
                        setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]+/g, '-').slice(0, 30));
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:border-[#c5a869] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    اسم المكتب بالإنجليزية
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Fahad Al-Subaie Law"
                    value={newNameEn}
                    onChange={(e) => setNewNameEn(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:border-[#c5a869] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    معرف الرابط (Slug) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="fahad-law"
                    value={newSlug}
                    onChange={(e) => setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '-'))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono focus:border-[#c5a869] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    المدينة
                  </label>
                  <input
                    type="text"
                    placeholder="الرياض"
                    value={newCityAr}
                    onChange={(e) => setNewCityAr(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:border-[#c5a869] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    الدولة التي يعمل فيها
                  </label>
                  <select
                    value={newCountryAr}
                    onChange={(e) => setNewCountryAr(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:border-[#c5a869] focus:outline-none"
                  >
                    {COUNTRIES_LIST.map((c) => (
                      <option key={c.ar} value={c.ar}>{c.ar}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    رقم الهاتف / واتساب
                  </label>
                  <input
                    type="text"
                    placeholder="+966 50 000 0000"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:border-[#c5a869] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    البريد الإلكتروني
                  </label>
                  <input
                    type="email"
                    placeholder="info@subaielaw.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:border-[#c5a869] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    كلمة مرور مدير المكتب للوحة التحكم <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="123456"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono focus:border-[#c5a869] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    شعار / نبذة سريعة
                  </label>
                  <input
                    type="text"
                    placeholder="مكتب محاماة واستشارات قانونية"
                    value={newTaglineAr}
                    onChange={(e) => setNewTaglineAr(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:border-[#c5a869] focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingNew}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#b38a38] to-[#87641d] hover:brightness-110 text-white text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingNew ? 'جارٍ الإنشاء...' : 'إنشاء وتفعيل المكتب فوراً'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CUSTOM DELETE CONFIRMATION MODAL */}
      {showDeleteConfirm && firmToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md p-8 rounded-3xl bg-slate-900 border border-rose-500/30 shadow-2xl text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto text-rose-500">
              <AlertTriangle className="w-10 h-10 animate-bounce" />
            </div>
            
            <div className="space-y-2">
              <h4 className="text-xl font-bold text-white font-serif-title">
                هل أنت متأكد من حذف هذا المكتب؟
              </h4>
              <p className="text-sm text-slate-400 leading-relaxed px-4">
                أنت على وشك حذف مكتب <span className="text-rose-400 font-bold">"{firmToDelete.nameAr}"</span> نهائياً. سيتم إزالة كافة البيانات المرتبطة به من السحاب والملفات المحلية. لا يمكن التراجع عن هذا الإجراء.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="flex-1 px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-bold transition-colors disabled:opacity-50"
              >
                إلغاء، العودة للخلف
              </button>
              <button
                type="button"
                onClick={performDeleteFirm}
                disabled={isDeleting}
                className="flex-1 px-4 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-700 hover:brightness-110 text-white text-sm font-bold shadow-lg shadow-rose-900/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isDeleting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                <span>تأكيد الحذف النهائي</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
