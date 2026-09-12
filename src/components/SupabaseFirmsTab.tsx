import React, { useState, useEffect } from 'react';
import {
  Database,
  Globe2,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Code2,
  Upload,
  Download,
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { supabaseConfigService, testSupabaseConnection, SUPABASE_SQL_SCHEMA, SUPABASE_QUICK_RLS_FIX_SQL } from '../lib/supabase';
import { firmService } from '../services/firmService';
import { LawFirm, SupabaseConfig, Language } from '../types';

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

  // Law Firms Management (Only for context, list is removed)
  const [firms, setFirms] = useState<LawFirm[]>([]);
  const [activeSlug, setActiveSlug] = useState<string>(firmService.getActiveFirmSlug());

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

  // Copy firm link
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const handleCopyLink = (slug: string) => {
    const url = new URL(window.location.origin + window.location.pathname);
    url.searchParams.set('firm', slug);
    navigator.clipboard.writeText(url.toString());
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2500);
  };

  return (
    <div className="space-y-8">
      {/* Top Banner Alert */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-[#1c1813] to-slate-900 border border-[#c5a869]/40 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[#d4b068] text-[11px] font-bold uppercase tracking-widest mb-1">
              <Globe2 className="w-4 h-4" />
              <span>{isAr ? 'منصة متعددة المكاتب (Multi-Tenant Platform)' : 'Multi-Tenant Legal Platform'}</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-white font-serif-title leading-tight">
              {isAr ? 'فتح قاعدة البيانات والمزامنة السحابية' : 'Cloud Database & Global Sync Center'}
            </h3>
            <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
              {isAr 
                ? 'تحكم مركزي وشامل في ربط المنصة بقاعدة بيانات Supabase العالمية. يمكنك مزامنة مئات المكاتب وتحديث بياناتهم سحابياً بضغطة زر واحدة لتظهر فوراً لعملائهم حول العالم.' 
                : 'Centralized control for linking the platform to global Supabase database. Sync hundreds of firms and update their data to the cloud instantly.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={handlePushAllToSupabase}
              disabled={isSyncingToSupabase || isFetchingFromSupabase}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 text-slate-950 font-black text-sm flex items-center justify-center gap-2.5 transition transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 shadow-xl shadow-emerald-950/40 cursor-pointer"
            >
              {isSyncingToSupabase ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Upload className="w-6 h-6" />}
              <span>{isAr ? 'مزامنة ورفع الكل للسحابة' : 'Global Sync & Upload'}</span>
            </button>

            <button
              onClick={handleFetchFromSupabase}
              disabled={isSyncingToSupabase || isFetchingFromSupabase}
              className="px-6 py-3.5 rounded-2xl bg-slate-950/80 hover:bg-slate-900 text-white font-bold text-sm flex items-center justify-center gap-2.5 border border-slate-700 transition transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 shadow-lg cursor-pointer"
            >
              {isFetchingFromSupabase ? <RefreshCw className="w-5 h-5 animate-spin text-emerald-400" /> : <Download className="w-6 h-6 text-emerald-400" />}
              <span>{isAr ? 'جلب وتحديث البيانات' : 'Pull from Cloud'}</span>
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

      {/* Active Firm Summary for Context (Platform-Level View) */}
      <div className="px-5 py-4 rounded-2xl bg-slate-800 border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm shadow-xl mb-6">
        <div className="flex items-center gap-4">
          <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.6)] animate-pulse" />
          <span className="text-slate-200 font-bold">{isAr ? 'نطاق الإدارة الحالي:' : 'Current Management Scope:'}</span>
          <span className="font-extrabold text-[#c5a869] font-serif-title text-base tracking-tight bg-black/30 px-3 py-1 rounded-lg border border-white/5">
            {firms.find((f) => f.slug === activeSlug)?.nameAr || activeSlug}
          </span>
          <span className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 font-mono text-xs">
            ?firm={activeSlug}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleCopyLink(activeSlug)}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition shadow-sm cursor-pointer"
            title={isAr ? 'نسخ رابط المكتب' : 'Copy link'}
          >
            {copiedSlug === activeSlug ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <a
            href={`/?firm=${activeSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-[#c5a869] border border-slate-800 transition shadow-sm"
            title={isAr ? 'فتح المعاينة' : 'Open Preview'}
          >
            <ExternalLink className="w-3.5 h-3.5" />
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
              type="password"
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
              type="password"
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
    </div>
  );
};
