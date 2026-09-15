import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SupabaseConfig } from '../types';
export type { SupabaseConfig };

/**
 * Checks if a string is a valid RFC4122 UUID
 */
export function isValidUUID(str?: string | null): boolean {
  if (!str || typeof str !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str.trim());
}

/**
 * Deterministically converts any string or arbitrary ID into a valid RFC4122 v4-compliant UUID.
 * This guarantees that Supabase/PostgreSQL will accept the value whether the target column
 * is typed as `uuid`, `text`, or `varchar`, preventing "invalid input syntax for type uuid" errors.
 */
export function toValidUUID(input: string): string {
  if (isValidUUID(input)) {
    return input.trim().toLowerCase();
  }

  // Generate deterministic 32-bit hashes
  let h1 = 0xdeadbeef;
  let h2 = 0x41c64e6d;
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);

  const hex1 = (h1 >>> 0).toString(16).padStart(8, '0');
  const hex2 = (h2 >>> 0).toString(16).padStart(8, '0');
  const hex3 = ((h1 ^ h2) >>> 0).toString(16).padStart(8, '0');
  const hex4 = ((h1 + h2) >>> 0).toString(16).padStart(8, '0');

  const p1 = hex1.slice(0, 8);
  const p2 = hex2.slice(0, 4);
  const p3 = '4' + hex3.slice(1, 4); // UUID v4 format
  const p4 = 'a' + hex4.slice(1, 4); // variant 1 format
  const p5 = (hex2 + hex1).slice(0, 12);

  return `${p1}-${p2}-${p3}-${p4}-${p5}`.toLowerCase();
}

const STORAGE_KEY_SUPABASE = 'aladl_supabase_config_v1';

export function getStoredSupabaseConfig(): SupabaseConfig {
  const defaultUrl = 'https://wtfmpgyiiwhmwmitckxr.supabase.co';
  const defaultKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0Zm1wZ3lpaXdobXdtaXRja3hyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0NjUxNTMsImV4cCI6MjEwNDA0MTE1M30.GyAlgdrv6N9-eN12vfKX_MYj12PILCIBXFONaRsuaqI';

  if (typeof window === 'undefined') {
    return {
      url: import.meta.env.VITE_SUPABASE_URL || defaultUrl,
      anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || defaultKey,
      tableName: 'law_firms',
      isConnected: true,
    };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY_SUPABASE);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        url: parsed.url || import.meta.env.VITE_SUPABASE_URL || defaultUrl,
        anonKey: parsed.anonKey || import.meta.env.VITE_SUPABASE_ANON_KEY || defaultKey,
        tableName: parsed.tableName || 'law_firms',
        isConnected: parsed.isConnected ?? true,
        lastTestedAt: parsed.lastTestedAt,
      };
    }
  } catch (e) {
    console.warn('Failed to read Supabase config from localStorage', e);
  }

  return {
    url: import.meta.env.VITE_SUPABASE_URL || defaultUrl,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || defaultKey,
    tableName: 'law_firms',
    isConnected: true,
  };
}

export function saveStoredSupabaseConfig(config: SupabaseConfig): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_SUPABASE, JSON.stringify(config));
    // Also save to server backend so config persists across refreshes and devices
    fetch('/api/supabase/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    }).catch(() => {});

    // Trigger re-init of supabase instance
    initSupabaseClient();
    window.dispatchEvent(new CustomEvent('aladl_supabase_config_changed', { detail: config }));
  } catch (e) {
    console.error('Failed to save Supabase config', e);
  }
}

// Background pull from server config if localStorage is empty
if (typeof window !== 'undefined') {
  setTimeout(() => {
    try {
      const current = getStoredSupabaseConfig();
      if (!current.url || !current.anonKey) {
        fetch('/api/supabase/config')
          .then((res) => res.json())
          .then((data) => {
            if (data?.success && data?.config?.url && data?.config?.anonKey) {
              saveStoredSupabaseConfig(data.config);
            }
          })
          .catch(() => {});
      }
    } catch {}
  }, 100);
}

let activeClient: SupabaseClient | null = null;

export function initSupabaseClient(): SupabaseClient {
  const config = getStoredSupabaseConfig();
  const url = config.url.trim() || 'https://placeholder.supabase.co';
  const anonKey = config.anonKey.trim() || 'placeholder';

  activeClient = createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });

  return activeClient;
}

export const supabase: SupabaseClient = initSupabaseClient();

export function getSupabase(): SupabaseClient {
  if (!activeClient) {
    return initSupabaseClient();
  }
  return activeClient;
}

/**
 * Format any Supabase / PostgreSQL error into clear Arabic instructions
 */
export function formatSupabaseError(error: any, tableName: string = 'law_firms'): string {
  if (!error) return 'حدث خطأ غير معروف أثناء الاتصال بقاعدة البيانات';
  const msg = typeof error === 'string' ? error : (error.message || error.error_description || JSON.stringify(error));
  const code = error.code || '';

  // RLS (Row Level Security) violation
  if (msg.includes('row-level security') || msg.includes('violates row-level security policy') || code === '42501') {
    return `⚠️ تم رفض حفظ البيانات بسبب سياسة الأمان (RLS) في Supabase!
السبب: جدول "${tableName}" مفعل عليه RLS بدون إذن كتابة لمفتاح Anon.
الحل الفوري: انسخ وشغل أمر إلغاء القفل في SQL Editor داخل Supabase:
ALTER TABLE public.${tableName} DISABLE ROW LEVEL SECURITY;`;
  }

  // Table does not exist
  if (msg.includes('relation') && (msg.includes('does not exist') || code === '42P01')) {
    return `⚠️ جدول "${tableName}" غير موجود في قاعدة بيانات Supabase بعد!
الحل: اضغط على زر "عرض كود SQL" وانسخ الكود ثم الصقه وشغله في Supabase SQL Editor.`;
  }

  // Unique constraint / on conflict error
  if (msg.includes('ON CONFLICT') || msg.includes('unique or exclusion constraint') || code === '42P10') {
    return `⚠️ الجدول لا يحتوي على قيد فريد (Unique constraint) على حقل slug.
جاري استخدام طريقة التحديث والإدخال البديلة تلقائياً.`;
  }

  // Missing column
  if (msg.includes('column') || msg.includes('schema cache') || msg.includes('Could not find')) {
    return `⚠️ نقص في بعض أعمدة جدول "${tableName}" في Supabase: (${msg}).
تم الحفظ بالوضع المتوافق مع الأعمدة المتاحة وداخل حقل data الرئيسي.`;
  }

  // Invalid key / credentials
  if (msg.includes('Invalid API key') || msg.includes('JWT') || code === 'PGRST301') {
    return `⚠️ مفتاح الـ Anon Key أو رابط المشروع غير صحيح. الرجاء نسخهما بدقة من لوحة تحكم Supabase (Project Settings -> API).`;
  }

  // Network or CORS
  if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
    return `⚠️ تعذر الوصول إلى خادم Supabase. تأكد من رابط المشروع واتصال الإنترنت.`;
  }

  return `خطأ في Supabase: ${msg}${code ? ` (رمز: ${code})` : ''}`;
}

export const SUPABASE_QUICK_RLS_FIX_SQL = `-- سكريبت فك قفل الحماية (RLS) للسماح بمزامنة ورفع البيانات فوراً من التطبيق
ALTER TABLE IF EXISTS public.law_firms DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.partners DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.practice_areas DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.case_studies DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.testimonials DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.blog_posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.office_locations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.consultation_inquiries DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.firm_subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.domain_mappings DISABLE ROW LEVEL SECURITY;
`;

export async function testSupabaseConnection(overrideConfig?: Partial<SupabaseConfig>): Promise<{
  success: boolean;
  message: string;
  count?: number;
}> {
  const current = getStoredSupabaseConfig();
  const url = (overrideConfig?.url ?? current.url).trim();
  const anonKey = (overrideConfig?.anonKey ?? current.anonKey).trim();
  const tableName = (overrideConfig?.tableName ?? current.tableName ?? 'law_firms').trim();

  if (!url || !anonKey) {
    return {
      success: false,
      message: 'الرجاء إدخال رابط المشروع (Project URL) ومفتاح الـ Anon Key الخاص بـ Supabase أولاً.',
    };
  }

  try {
    const tempClient = createClient(url, anonKey);
    const { data, error, count } = await tempClient
      .from(tableName)
      .select('id', { count: 'exact', head: true });

    if (error) {
      if (error.code === '42P01' || error.message.includes('relation') || error.message.includes('does not exist')) {
        return {
          success: false,
          message: `تم الاتصال بـ Supabase بنجاح، ولكن الجدول "${tableName}" غير موجود بعد. انسخ كود SQL بالأسفل وشغله في SQL Editor لإنشائه فوراً.`,
        };
      }
      return {
        success: false,
        message: `خطأ في الاتصال: ${error.message} (رمز الخطأ: ${error.code || 'غير محدد'})`,
      };
    }

    return {
      success: true,
      message: `تم الاتصال بقاعدة بيانات Supabase بنجاح تام! تم العثور على جدول "${tableName}".`,
      count: count ?? 0,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `فشل الاتصال: ${err.message || 'تعذر الوصول إلى خادم Supabase'}`,
    };
  }
}

export const SUPABASE_SQL_SCHEMA = `-- =========================================================================
-- سكريبت بناء قاعدة بيانات المنصة ومواقع المحامين الكاملة على Supabase
-- شغّل هذا السكريبت في لوحة تحكم Supabase:
-- Supabase Dashboard -> SQL Editor -> New Query -> Run
-- =========================================================================

-- تفعيل إضافات توليد المعرفات الفريدة
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- دالة لتحديث تاريخ التعديل updated_at تلقائياً
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- -------------------------------------------------------------------------
-- 1. جدول المكاتب القانونية الرئيسي (Law Firms)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.law_firms (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  slug TEXT UNIQUE NOT NULL,
  name_ar TEXT NOT NULL,
  name_en TEXT,
  city_ar TEXT DEFAULT 'الرياض',
  city_en TEXT DEFAULT 'Riyadh',
  phone TEXT,
  email TEXT,
  admin_password TEXT NOT NULL DEFAULT '123456',
  license_number TEXT,
  tagline_ar TEXT,
  theme_color TEXT DEFAULT '#c5a869',
  is_verified BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  subscription JSONB DEFAULT '{"status": "active", "isSiteActive": true, "planTier": "professional", "annualFee": 3500, "currency": "SAR"}'::jsonb,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- تحديث الأعمدة إذا كان الجدول موجوداً مسبقاً
ALTER TABLE public.law_firms ADD COLUMN IF NOT EXISTS subscription JSONB DEFAULT '{"status": "active", "isSiteActive": true, "planTier": "professional", "annualFee": 3500, "currency": "SAR"}'::jsonb;
ALTER TABLE public.law_firms ADD COLUMN IF NOT EXISTS city_en TEXT DEFAULT 'Riyadh';
ALTER TABLE public.law_firms ADD COLUMN IF NOT EXISTS license_number TEXT;
ALTER TABLE public.law_firms ADD COLUMN IF NOT EXISTS tagline_ar TEXT;
ALTER TABLE public.law_firms ADD COLUMN IF NOT EXISTS theme_color TEXT DEFAULT '#c5a869';

-- الفهارس السريعة
CREATE INDEX IF NOT EXISTS idx_law_firms_slug ON public.law_firms(slug);
CREATE INDEX IF NOT EXISTS idx_law_firms_city ON public.law_firms(city_ar);
CREATE INDEX IF NOT EXISTS idx_law_firms_featured ON public.law_firms(featured);

-- مشغّل التحديث التلقائي
DROP TRIGGER IF EXISTS trigger_law_firms_updated_at ON public.law_firms;
CREATE TRIGGER trigger_law_firms_updated_at
BEFORE UPDATE ON public.law_firms
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- -------------------------------------------------------------------------
-- 2. جدول طلبات الاستشارات وحجوزات الموكلين (Consultation Inquiries)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.consultation_inquiries (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  firm_slug TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  company TEXT,
  consultation_type TEXT,
  preferred_date TEXT,
  is_urgent BOOLEAN DEFAULT false,
  message TEXT,
  status TEXT DEFAULT 'new', -- new, in_progress, completed, archived
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inquiries_firm_slug ON public.consultation_inquiries(firm_slug);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON public.consultation_inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON public.consultation_inquiries(created_at DESC);

DROP TRIGGER IF EXISTS trigger_inquiries_updated_at ON public.consultation_inquiries;
CREATE TRIGGER trigger_inquiries_updated_at
BEFORE UPDATE ON public.consultation_inquiries
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- -------------------------------------------------------------------------
-- 3. جدول اشتراكات وتراخيص المكاتب (Firm Subscriptions & Licenses)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.firm_subscriptions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  firm_slug TEXT NOT NULL,
  plan_tier TEXT DEFAULT 'professional', -- starter, professional, enterprise
  plan_name_ar TEXT DEFAULT 'الباقة السنوية الاحترافية',
  plan_name_en TEXT DEFAULT 'Professional Annual Plan',
  status TEXT DEFAULT 'active', -- active, expired, suspended, pending
  is_site_active BOOLEAN DEFAULT true,
  start_date TIMESTAMPTZ DEFAULT NOW(),
  end_date TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '1 year'),
  annual_fee NUMERIC DEFAULT 3500,
  currency TEXT DEFAULT 'SAR',
  payment_status TEXT DEFAULT 'paid', -- paid, pending, failed, refunded
  auto_renew BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_firm_subs_slug ON public.firm_subscriptions(firm_slug);
CREATE INDEX IF NOT EXISTS idx_firm_subs_status ON public.firm_subscriptions(status);

-- -------------------------------------------------------------------------
-- 4. جدول المحامين والشركاء (Partners & Attorneys)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.partners (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  firm_slug TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  name_en TEXT,
  role_ar TEXT NOT NULL,
  role_en TEXT,
  experience_years INTEGER DEFAULT 10,
  bio_ar TEXT,
  bio_en TEXT,
  image_url TEXT,
  email TEXT,
  phone TEXT,
  specializations TEXT[] DEFAULT '{}',
  is_senior BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_partners_firm_slug ON public.partners(firm_slug);

-- -------------------------------------------------------------------------
-- 5. جدول مجالات الممارسة والتخصصات (Practice Areas)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.practice_areas (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  firm_slug TEXT NOT NULL,
  title_ar TEXT NOT NULL,
  title_en TEXT,
  description_ar TEXT,
  description_en TEXT,
  icon_name TEXT DEFAULT 'Scale',
  features_ar TEXT[] DEFAULT '{}',
  features_en TEXT[] DEFAULT '{}',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_practice_areas_firm_slug ON public.practice_areas(firm_slug);

-- -------------------------------------------------------------------------
-- 6. جدول القضايا والصفقات المنجزة (Case Studies)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.case_studies (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  firm_slug TEXT NOT NULL,
  title_ar TEXT NOT NULL,
  title_en TEXT,
  category_ar TEXT,
  category_en TEXT,
  summary_ar TEXT,
  summary_en TEXT,
  outcome_ar TEXT,
  outcome_en TEXT,
  value_sar NUMERIC,
  year INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_case_studies_firm_slug ON public.case_studies(firm_slug);

-- -------------------------------------------------------------------------
-- 7. جدول آراء وتقييمات الموكلين (Testimonials)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.testimonials (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  firm_slug TEXT NOT NULL,
  client_name_ar TEXT NOT NULL,
  client_name_en TEXT,
  client_role_ar TEXT,
  client_role_en TEXT,
  company TEXT,
  rating INTEGER DEFAULT 5,
  comment_ar TEXT NOT NULL,
  comment_en TEXT,
  is_featured BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_testimonials_firm_slug ON public.testimonials(firm_slug);

-- -------------------------------------------------------------------------
-- 8. جدول المقالات والأبحاث القانونية (Blog Posts)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  firm_slug TEXT NOT NULL,
  title_ar TEXT NOT NULL,
  title_en TEXT,
  excerpt_ar TEXT,
  excerpt_en TEXT,
  content_ar TEXT,
  content_en TEXT,
  category TEXT DEFAULT 'أنظمة وقوانين',
  author_name TEXT,
  image_url TEXT,
  read_time_minutes INTEGER DEFAULT 5,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blog_posts_firm_slug ON public.blog_posts(firm_slug);

-- -------------------------------------------------------------------------
-- 9. جدول الفروع ومواقع المكاتب (Office Locations)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.office_locations (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  firm_slug TEXT NOT NULL,
  city_ar TEXT NOT NULL,
  city_en TEXT,
  country_ar TEXT DEFAULT 'المملكة العربية السعودية',
  country_en TEXT DEFAULT 'Saudi Arabia',
  address_ar TEXT NOT NULL,
  address_en TEXT,
  phone TEXT,
  email TEXT,
  map_embed_url TEXT,
  is_headquarter BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_office_locations_firm_slug ON public.office_locations(firm_slug);

-- -------------------------------------------------------------------------
-- 10. جدول ربط النطاقات الخاصة والدومينات (Domain Mappings)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.domain_mappings (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  firm_slug TEXT NOT NULL,
  custom_domain TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'active', -- pending, active, failed
  ssl_active BOOLEAN DEFAULT true,
  cname_target TEXT DEFAULT 'custom.aladl.law',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_domain_mappings_domain ON public.domain_mappings(custom_domain);

-- -------------------------------------------------------------------------
-- 11. إعدادات الأمان وسياسات الوصول (Row Level Security - RLS)
-- -------------------------------------------------------------------------
ALTER TABLE public.law_firms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultation_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.firm_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.office_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.domain_mappings ENABLE ROW LEVEL SECURITY;

-- سياسات القراءة العامة (Public Select): تمكين أي زائر من تصفح مواقع المكاتب
DROP POLICY IF EXISTS "Public select on law_firms" ON public.law_firms;
CREATE POLICY "Public select on law_firms" ON public.law_firms FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public select on partners" ON public.partners;
CREATE POLICY "Public select on partners" ON public.partners FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public select on practice_areas" ON public.practice_areas;
CREATE POLICY "Public select on practice_areas" ON public.practice_areas FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public select on case_studies" ON public.case_studies;
CREATE POLICY "Public select on case_studies" ON public.case_studies FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public select on testimonials" ON public.testimonials;
CREATE POLICY "Public select on testimonials" ON public.testimonials FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public select on blog_posts" ON public.blog_posts;
CREATE POLICY "Public select on blog_posts" ON public.blog_posts FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public select on office_locations" ON public.office_locations;
CREATE POLICY "Public select on office_locations" ON public.office_locations FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public select on domain_mappings" ON public.domain_mappings;
CREATE POLICY "Public select on domain_mappings" ON public.domain_mappings FOR SELECT TO anon, authenticated USING (true);

-- سياسات الإدخال والتعديل لمدراء المكاتب والتطبيق (Full Access for Anon / Auth)
DROP POLICY IF EXISTS "Allow all for law_firms" ON public.law_firms;
CREATE POLICY "Allow all for law_firms" ON public.law_firms FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for consultation_inquiries" ON public.consultation_inquiries;
CREATE POLICY "Allow all for consultation_inquiries" ON public.consultation_inquiries FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for firm_subscriptions" ON public.firm_subscriptions;
CREATE POLICY "Allow all for firm_subscriptions" ON public.firm_subscriptions FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for partners" ON public.partners;
CREATE POLICY "Allow all for partners" ON public.partners FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for practice_areas" ON public.practice_areas;
CREATE POLICY "Allow all for practice_areas" ON public.practice_areas FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for case_studies" ON public.case_studies;
CREATE POLICY "Allow all for case_studies" ON public.case_studies FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for testimonials" ON public.testimonials;
CREATE POLICY "Allow all for testimonials" ON public.testimonials FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for blog_posts" ON public.blog_posts;
CREATE POLICY "Allow all for blog_posts" ON public.blog_posts FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for office_locations" ON public.office_locations;
CREATE POLICY "Allow all for office_locations" ON public.office_locations FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for domain_mappings" ON public.domain_mappings;
CREATE POLICY "Allow all for domain_mappings" ON public.domain_mappings FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- -------------------------------------------------------------------------
-- 12. تفعيل المزامنة المباشرة (Supabase Realtime)
-- -------------------------------------------------------------------------
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.law_firms;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.consultation_inquiries;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- -------------------------------------------------------------------------
-- 13. البيانات الأولية (تترك فارغة لتعبئتها من قبل المستخدم)
-- -------------------------------------------------------------------------
`;

export const supabaseConfigService = {
  getConfig: getStoredSupabaseConfig,
  saveConfig: saveStoredSupabaseConfig,
  isConfigured: (): boolean => {
    const c = getStoredSupabaseConfig();
    return !!(c.url && c.anonKey && c.url.trim().length > 0 && c.anonKey.trim().length > 0);
  },
};
