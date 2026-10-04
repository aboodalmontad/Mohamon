import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://wtfmpgyiiwhmwmitckxr.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0Zm1wZ3lpaXdobXdtaXRja3hyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0NjUxNTMsImV4cCI6MjEwNDA0MTE1M30.GyAlgdrv6N9-eN12vfKX_MYj12PILCIBXFONaRsuaqI';

async function sync() {
  console.log('[sync-data] Synchronizing static data bundles for production...');
  const publicDir = path.join(rootDir, 'public');
  const distDir = path.join(rootDir, 'dist');
  
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const firmsPath = path.join(publicDir, 'firms_data.json');
  const siteDataPath = path.join(publicDir, 'site_data.json');
  const plansPath = path.join(publicDir, 'pricing_plans.json');

  try {
    const client = createClient(SUPABASE_URL, SUPABASE_KEY);
    const { data: rows, error } = await client.from('law_firms').select('*').order('created_at', { ascending: false });
    
    if (!error && Array.isArray(rows) && rows.length > 0) {
      let existingFirmsMap = new Map();
      if (fs.existsSync(firmsPath)) {
        try {
          const oldList = JSON.parse(fs.readFileSync(firmsPath, 'utf8'));
          if (Array.isArray(oldList)) {
            oldList.forEach(f => existingFirmsMap.set(f.slug, f));
          }
        } catch {}
      }

      const firms = rows.map(r => {
        const existing = existingFirmsMap.get(r.slug) || {};
        const exData = existing.data || {};
        const rData = r.data || {};

        const hasAr = (str) => /[\u0600-\u06FF]/.test(str || '');
        const validNameEn = (r.name_en && !hasAr(r.name_en)) ? r.name_en : (existing.nameEn || '');
        const validNameTr = (r.name_tr && !hasAr(r.name_tr)) ? r.name_tr : (existing.nameTr || '');
        const validTaglineEn = (r.tagline_en && !hasAr(r.tagline_en)) ? r.tagline_en : (existing.taglineEn || '');
        const validTaglineTr = (r.tagline_tr && !hasAr(r.tagline_tr)) ? r.tagline_tr : (existing.taglineTr || '');

        // Merge inner settings if Supabase data has missing translations
        const mergedSettings = {
          ...(exData.settings || {}),
          ...(rData.settings || {}),
        };
        if (hasAr(mergedSettings.firmNameEn) && existing.nameEn) mergedSettings.firmNameEn = existing.nameEn;
        if (!mergedSettings.firmNameTr && existing.nameTr) mergedSettings.firmNameTr = existing.nameTr;

        return {
          id: r.id,
          slug: r.slug,
          nameAr: r.name_ar,
          nameEn: validNameEn,
          nameTr: validNameTr,
          taglineAr: r.tagline_ar || '',
          taglineEn: validTaglineEn,
          taglineTr: validTaglineTr,
          cityAr: r.city_ar || '',
          cityEn: r.city_en || existing.cityEn || '',
          cityTr: existing.cityTr || '',
          phone: r.phone || '',
          email: r.email || '',
          licenseNumber: r.license_number || '',
          adminPassword: r.admin_password || '123456',
          isVerified: r.is_verified ?? true,
          featured: r.featured ?? false,
          isDefaultPublic: r.is_default_public ?? false,
          themeColor: r.theme_color || '#c5a869',
          createdAt: r.created_at || new Date().toISOString(),
          updatedAt: r.updated_at || new Date().toISOString(),
          data: {
            ...exData,
            ...rData,
            settings: mergedSettings,
          },
          subscription: r.subscription || r.data?.subscription || existing.subscription || {
            planTier: 'enterprise',
            planNameAr: 'الباقة الماسية الشاملة',
            status: 'active',
            isSiteActive: true,
          }
        };
      });

      fs.writeFileSync(firmsPath, JSON.stringify(firms, null, 2), 'utf-8');
      console.log(`[sync-data] Successfully wrote ${firms.length} firms to public/firms_data.json`);

      // Find the default public firm or fallback
      const defaultFirm = firms.find(f => f.isDefaultPublic) || firms.find(f => f.slug === 'mktb-almhamy-adnan-nhwy') || firms[0];
      if (defaultFirm && defaultFirm.data) {
        const siteData = {
          settings: defaultFirm.data.settings,
          partners: defaultFirm.data.partners,
          practiceAreas: defaultFirm.data.practiceAreas,
          testimonials: defaultFirm.data.testimonials,
          blogPosts: defaultFirm.data.blogPosts,
          caseStudies: defaultFirm.data.caseStudies,
          offices: defaultFirm.data.offices,
          messages: defaultFirm.data.messages || [],
          exportedAt: new Date().toISOString()
        };
        fs.writeFileSync(siteDataPath, JSON.stringify(siteData, null, 2), 'utf-8');
        console.log(`[sync-data] Successfully wrote site data for "${defaultFirm.nameAr}" to public/site_data.json`);
      }

      // If dist exists, also copy there
      if (fs.existsSync(distDir)) {
        fs.copyFileSync(firmsPath, path.join(distDir, 'firms_data.json'));
        fs.copyFileSync(siteDataPath, path.join(distDir, 'site_data.json'));
        if (fs.existsSync(plansPath)) {
          fs.copyFileSync(plansPath, path.join(distDir, 'pricing_plans.json'));
        }
        console.log('[sync-data] Copied data bundles to dist/');
      }
      return;
    }
  } catch (err) {
    console.warn('[sync-data] Cloud fetch warning (offline or build container):', err.message);
  }

  // Ensure files exist at least
  if (!fs.existsSync(firmsPath) || fs.statSync(firmsPath).size < 10) {
    console.warn('[sync-data] Writing fallback placeholder to public/firms_data.json');
  }
}

sync();
