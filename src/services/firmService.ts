import { LawFirm, LawFirmData, SiteSettings, FirmSubscription, SubscriptionPlanTier, SubscriptionStatus } from '../types';
// import prepackagedFirms from '../../public/firms_data.json';
import { 
  // initialPartners, 
  // initialPracticeAreas, 
  // initialTestimonials, 
  // initialBlogPosts, 
  // initialCaseStudies, 
  // initialContactMessages, 
  initialSiteSettings, 
  // initialOffices 
} from '../data/initialData';
import { getSupabase, getStoredSupabaseConfig, isValidUUID, toValidUUID, formatSupabaseError } from '../lib/supabase';

const STORAGE_KEY_FIRMS = 'aladl_multi_firms_v1';
const STORAGE_KEY_ACTIVE_SLUG = 'aladl_active_firm_slug_v1';
const STORAGE_KEY_DEFAULT_PUBLIC_SLUG = 'aladl_default_public_firm_slug_v1';

export function ensureFirmSubscription(firm: LawFirm): LawFirm {
  if (!firm.status) {
    firm.status = 'active';
  }
  if (!firm.nameAr && firm.data?.settings?.firmNameAr) {
    firm.nameAr = firm.data.settings.firmNameAr;
  }
  if (!firm.nameEn && firm.data?.settings?.firmNameEn) {
    firm.nameEn = firm.data.settings.firmNameEn;
  }
  if (!firm.cityAr && (firm.data as any)?.offices?.[0]?.cityAr) {
    firm.cityAr = (firm.data as any).offices[0].cityAr;
  }
  if (!firm.taglineAr && firm.data?.settings?.sloganAr) {
    firm.taglineAr = firm.data.settings.sloganAr;
  }
  if (!firm.logoUrl && (firm.data?.settings as any)?.customLogoUrl) {
    firm.logoUrl = (firm.data?.settings as any).customLogoUrl;
  }
  const oneYearAhead = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
  if (!firm.subscription) {
    firm.subscription = {
      planTier: 'professional',
      planNameAr: 'الباقة السنوية الاحترافية',
      planNameEn: 'Professional Annual Plan',
      status: 'active',
      isSiteActive: true,
      startDate: firm.createdAt || new Date().toISOString(),
      endDate: oneYearAhead,
      annualFee: 3500,
      currency: 'SAR',
      autoRenew: true,
      paymentStatus: 'paid',
      notes: 'تم تفعيل الاشتراك السنوي والترخيص بالكامل',
    };
  } else {
    // Fill in any missing properties in existing subscription object
    const sub = firm.subscription;
    firm.subscription = {
      planTier: sub.planTier || 'professional',
      planNameAr: sub.planNameAr || 'الباقة السنوية الاحترافية',
      planNameEn: sub.planNameEn || 'Professional Annual Plan',
      status: sub.status || 'active',
      isSiteActive: sub.isSiteActive !== false,
      startDate: sub.startDate || firm.createdAt || new Date().toISOString(),
      endDate: sub.endDate || oneYearAhead,
      annualFee: typeof sub.annualFee === 'number' && !isNaN(sub.annualFee) ? sub.annualFee : 3500,
      currency: sub.currency || 'SAR',
      autoRenew: sub.autoRenew ?? true,
      paymentStatus: sub.paymentStatus || 'paid',
      notes: sub.notes || '',
    };
  }
  return firm;
}

// Initial default seed firms for the multi-tenant SaaS platform
export function createDefaultFirms(): LawFirm[] {
  const oneYearAhead = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
  
  const seed: LawFirm = {
    id: 'seed-firm-001',
    slug: 'aladl',
    nameAr: 'مكتب العدل والإنصاف للمحاماة',
    nameEn: 'Aladl & Equity Law Firm',
    taglineAr: 'نحمي حقوقكم، نصون مستقبلكم',
    taglineEn: 'Protecting your rights, securing your future',
    cityAr: 'الرياض',
    cityEn: 'Riyadh',
    phone: '+966 50 000 0000',
    email: 'info@aladl-law.com',
    licenseNumber: 'L-2024-001',
    adminPassword: 'admin',
    isVerified: true,
    featured: true,
    isDefaultPublic: true,
    themeColor: '#c5a869',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    data: {
      settings: initialSiteSettings,
      partners: [],
      practiceAreas: [],
      caseStudies: [],
      testimonials: [],
      blogPosts: [],
      offices: [],
      messages: []
    },
    subscription: {
      planTier: 'professional',
      planNameAr: 'الباقة السنوية الاحترافية',
      planNameEn: 'Professional Annual Plan',
      status: 'active',
      isSiteActive: true,
      startDate: new Date().toISOString(),
      endDate: oneYearAhead,
      annualFee: 3500,
      currency: 'SAR',
      autoRenew: true,
      paymentStatus: 'paid',
    }
  };

  return [seed];
}

class FirmService {
  private memoryFirms: LawFirm[] = [];
  private isInitialized = false;
  private initPromise: Promise<void> | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initLocal();
      // Only trigger configuration fetch, don't fetch ALL firms yet
      this.initMinimal().catch(() => {});
    }
  }

  public async initMinimal(): Promise<void> {
    if (typeof fetch === 'undefined') return;
    try {
      const res = await fetch('/api/supabase/config');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.config && json.config.url && json.config.anonKey) {
          if (typeof window !== 'undefined') {
            localStorage.setItem('aladl_supabase_config_v1', JSON.stringify(json.config));
          }
        }
      }
    } catch {}
  }

  public initLocal(): void {
    if (this.memoryFirms.length > 0) return;
    try {
      if (typeof window !== 'undefined') {
        const raw = localStorage.getItem(STORAGE_KEY_FIRMS);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            this.memoryFirms = parsed.map((f: LawFirm) => ensureFirmSubscription(f));
          }
        }
      }
    } catch (e) {
      console.warn('Error reading local firms cache', e);
    }

    if (this.memoryFirms.length === 0) {
      this.memoryFirms = createDefaultFirms();
      if (typeof window !== 'undefined') {
        this.saveToLocalCache();
      }
    }
  }

  public async init(): Promise<void> {
    if (this.isInitialized) return Promise.resolve();
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      // 1. Read local cache FIRST for instant UI
      this.initLocal();

      // 2. Fetch full lists only if explicitly requested via init()
      // This is usually called by Admin or Directory components
      try {
        await Promise.allSettled([
          this.fetchFromServer(),
          this.fetchFromSupabase()
        ]);
      } catch (err) {
        console.warn('Full sync in init() partially failed', err);
      }

      this.isInitialized = true;
      this.initPromise = null;
    })();

    return this.initPromise;
  }

  // Fetch a single firm by its slug directly from Supabase
  public async fetchSingleFirmFromSupabase(slug: string): Promise<{ success: boolean; firm?: LawFirm; message?: string }> {
    const config = getStoredSupabaseConfig();
    if (!config.url || !config.anonKey) {
      return { success: false, message: 'Supabase غير مهيأ' };
    }

    try {
      const client = getSupabase();
      const { data, error } = await client
        .from(config.tableName || 'law_firms')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) throw error;
      if (data) {
        const row = data;
        const rawSub = row.subscription || row.data?.subscription;
        const firm: LawFirm = ensureFirmSubscription({
          id: row.id,
          slug: row.slug,
          nameAr: row.name_ar,
          nameEn: row.name_en || '',
          nameTr: row.name_tr || '',
          taglineAr: row.tagline_ar || '',
          taglineEn: row.tagline_en || '',
          cityAr: row.city_ar || '',
          cityEn: row.city_en || '',
          phone: row.phone || '',
          email: row.email || '',
          licenseNumber: row.license_number || '',
          adminPassword: row.admin_password || '123456',
          isVerified: row.is_verified ?? true,
          featured: row.featured ?? false,
          isDefaultPublic: row.is_default_public ?? false,
          themeColor: row.theme_color || '#c5a869',
          createdAt: row.created_at || new Date().toISOString(),
          updatedAt: row.updated_at || new Date().toISOString(),
          data: row.data || {},
          subscription: rawSub,
        });

        // Update in memory and cache
        const idx = this.memoryFirms.findIndex(f => f.slug === slug);
        if (idx >= 0) {
          this.memoryFirms[idx] = firm;
        } else {
          this.memoryFirms.push(firm);
        }
        this.saveToLocalCache();
        return { success: true, firm };
      }
      return { success: false, message: 'المكتب غير موجود سحابياً' };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  }

  private saveToLocalCache(): void {
    if (typeof window === 'undefined') return;
    
    if ((this as any)._saveTimeout) clearTimeout((this as any)._saveTimeout);
    
    (this as any)._saveTimeout = setTimeout(() => {
      try {
        const firmsForStorage = this.memoryFirms.map(firm => {
          const { data, ...rest } = firm;
          return { 
            ...rest,
            hasFullData: !!(data && (data.partners?.length || data.blogPosts?.length))
          };
        });
        localStorage.setItem(STORAGE_KEY_FIRMS, JSON.stringify(firmsForStorage));
        window.dispatchEvent(new CustomEvent('aladl_firms_updated', { detail: this.memoryFirms }));
      } catch (e) {
        console.warn('Failed to save firms to local cache', e);
      }
    }, 1000); // Batched save every 1 second
  }

  // Fetch all firms from the Express backend or static asset fallback
  private async fetchFromServer(): Promise<void> {
    if (typeof fetch === 'undefined') return;
    let fetchedFirms: LawFirm[] = [];

    try {
      const res = await fetch('/api/firms');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          fetchedFirms = json.data;
        }
      }
    } catch (e) {
      // API non-fatal
    }

    // Static public JSON asset fallback (/firms_data.json)
    if (fetchedFirms.length === 0) {
      try {
        const res = await fetch('/firms_data.json');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            fetchedFirms = data;
          }
        }
      } catch (e) {}
    }

    if (fetchedFirms.length > 0) {
      const serverFirms = fetchedFirms.map((f: LawFirm) => ensureFirmSubscription(f));
      // const defaults = createDefaultFirms();
      const combined = [...serverFirms];
      /*
      for (const df of defaults) {
        if (!combined.some(f => f.slug === df.slug)) {
          combined.push(df);
        }
      }
      */
      for (const mf of this.memoryFirms) {
        if (!combined.some(f => f.slug === mf.slug)) {
          combined.push(mf);
        }
      }
      this.memoryFirms = combined;
      this.saveToLocalCache();
    }
  }

  // Fetch from Supabase if configured
  public async fetchFromSupabase(): Promise<{ success: boolean; count?: number; message?: string }> {
    const config = getStoredSupabaseConfig();
    if (!config.url || !config.anonKey) {
      return { success: false, message: 'Supabase غير مهيأ بعد' };
    }

    try {
      const client = getSupabase();
      const tableName = config.tableName || 'law_firms';
      const { data, error } = await client
        .from(tableName)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        return { success: false, message: error.message };
      }

      if (Array.isArray(data) && data.length > 0) {
        const loadedFirms: LawFirm[] = data.map((row: any) => {
          const rawSub = row.subscription || row.data?.subscription;
          const firmObj: LawFirm = {
            id: row.id,
            slug: row.slug,
            nameAr: row.name_ar,
            nameEn: row.name_en || '',
            nameTr: row.name_tr || '',
            taglineAr: row.tagline_ar || '',
            taglineEn: row.tagline_en || '',
            cityAr: row.city_ar || '',
            cityEn: row.city_en || '',
            phone: row.phone || '',
            email: row.email || '',
            licenseNumber: row.license_number || '',
            adminPassword: row.admin_password || '123456',
            isVerified: row.is_verified ?? true,
            featured: row.featured ?? false,
            isDefaultPublic: row.is_default_public ?? false,
            themeColor: row.theme_color || '#c5a869',
            createdAt: row.created_at || new Date().toISOString(),
            updatedAt: row.updated_at || new Date().toISOString(),
            data: row.data || {},
            subscription: rawSub,
          };
          return ensureFirmSubscription(firmObj);
        });

        const combined = [...loadedFirms];
        for (const mf of this.memoryFirms) {
          if (!combined.some(f => f.slug === mf.slug)) {
            combined.push(mf);
          }
        }
        this.memoryFirms = combined;
        this.saveToLocalCache();
        this.pushToServer(combined).catch(() => {});
        return { success: true, count: combined.length, message: `تم جلب ${loadedFirms.length} مكتب من Supabase بنجاح ودمج كافة المكاتب` };
      }

      return { success: true, count: 0, message: 'لا توجد مكاتب بعد في Supabase' };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  }

  // Push all firms to backend server
  public async pushToServer(firmsToPush?: LawFirm[]): Promise<boolean> {
    if (typeof fetch === 'undefined') return false;
    const firms = firmsToPush || this.memoryFirms;
    try {
      const res = await fetch('/api/firms/sync-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firms }),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  // Safely sync sub-tables (partners, practice_areas, blog_posts, testimonials, offices, case_studies, messages) if present
  private async syncSubTables(client: any, firm: LawFirm): Promise<{ [key: string]: number }> {
    const stats: { [key: string]: number } = {};
    try {
      const data = firm.data;
      if (!data) return stats;

      // 1. Partners
      if (Array.isArray(data.partners)) {
        const rows = data.partners.map((p: any, idx: number) => ({
          id: isValidUUID(p.id) ? p.id : toValidUUID(`${firm.slug}_partner_${p.id || idx}`),
          firm_slug: firm.slug,
          name_ar: p.nameAr || p.name || '',
          name_en: p.nameEn || '',
          role_ar: p.roleAr || p.role || '',
          role_en: p.roleEn || '',
          experience_years: p.experienceYears || 10,
          bio_ar: p.bioAr || p.bio || '',
          bio_en: p.bioEn || '',
          image_url: p.imageUrl || '',
          email: p.email || '',
          phone: p.phone || '',
          specializations: Array.isArray(p.specializations) ? p.specializations : [],
          is_senior: !!p.isSenior,
          sort_order: idx,
        }));
        
        if (rows.length > 0) {
          await client.from('partners').upsert(rows, { onConflict: 'id' });
          const validIds = rows.map(r => r.id);
          await client.from('partners').delete().eq('firm_slug', firm.slug).not('id', 'in', validIds);
          stats.partners = rows.length;
        } else {
          await client.from('partners').delete().eq('firm_slug', firm.slug);
        }
      }

      // 2. Practice areas
      if (Array.isArray(data.practiceAreas)) {
        const rows = data.practiceAreas.map((pa: any, idx: number) => ({
          id: isValidUUID(pa.id) ? pa.id : toValidUUID(`${firm.slug}_pa_${pa.id || idx}`),
          firm_slug: firm.slug,
          title_ar: pa.titleAr || pa.title || '',
          title_en: pa.titleEn || '',
          description_ar: pa.descriptionAr || pa.description || '',
          description_en: pa.descriptionEn || '',
          icon_name: pa.iconName || 'Scale',
          features_ar: Array.isArray(pa.featuresAr) ? pa.featuresAr : [],
          features_en: Array.isArray(pa.featuresEn) ? pa.featuresEn : [],
          sort_order: idx,
        }));

        if (rows.length > 0) {
          await client.from('practice_areas').upsert(rows, { onConflict: 'id' });
          const validIds = rows.map(r => r.id);
          await client.from('practice_areas').delete().eq('firm_slug', firm.slug).not('id', 'in', validIds);
          stats.practiceAreas = rows.length;
        } else {
          await client.from('practice_areas').delete().eq('firm_slug', firm.slug);
        }
      }

      // 3. Blog posts
      if (Array.isArray(data.blogPosts)) {
        const rows = data.blogPosts.map((b: any, idx: number) => ({
          id: isValidUUID(b.id) ? b.id : toValidUUID(`${firm.slug}_blog_${b.id || idx}`),
          firm_slug: firm.slug,
          title_ar: b.titleAr || b.title || '',
          title_en: b.titleEn || '',
          content_ar: b.contentAr || b.content || '',
          content_en: b.contentEn || '',
          excerpt_ar: b.excerptAr || '',
          excerpt_en: b.excerptEn || '',
          category: b.category || 'أنظمة وقوانين',
          author_name: b.authorName || '',
          image_url: b.imageUrl || '',
          read_time_minutes: b.readTimeMinutes || 5,
        }));

        if (rows.length > 0) {
          await client.from('blog_posts').upsert(rows, { onConflict: 'id' });
          const validIds = rows.map(r => r.id);
          await client.from('blog_posts').delete().eq('firm_slug', firm.slug).not('id', 'in', validIds);
          stats.blogPosts = rows.length;
        } else {
          await client.from('blog_posts').delete().eq('firm_slug', firm.slug);
        }
      }

      // 4. Testimonials
      if (Array.isArray(data.testimonials)) {
        const rows = data.testimonials.map((t: any, idx: number) => ({
          id: isValidUUID(t.id) ? t.id : toValidUUID(`${firm.slug}_test_${t.id || idx}`),
          firm_slug: firm.slug,
          client_name_ar: t.clientNameAr || t.clientName || '',
          client_name_en: t.clientNameEn || '',
          company_ar: t.companyAr || t.company || '',
          company_en: t.companyEn || '',
          role_ar: t.roleAr || t.role || '',
          role_en: t.roleEn || '',
          comment_ar: t.commentAr || t.comment || '',
          comment_en: t.commentEn || '',
          rating: t.rating || 5,
          image_url: t.imageUrl || '',
        }));

        if (rows.length > 0) {
          await client.from('testimonials').upsert(rows, { onConflict: 'id' });
          const validIds = rows.map(r => r.id);
          await client.from('testimonials').delete().eq('firm_slug', firm.slug).not('id', 'in', validIds);
          stats.testimonials = rows.length;
        } else {
          await client.from('testimonials').delete().eq('firm_slug', firm.slug);
        }
      }

      // 5. Office locations
      if (Array.isArray(data.offices)) {
        const rows = data.offices.map((o: any, idx: number) => ({
          id: isValidUUID(o.id) ? o.id : toValidUUID(`${firm.slug}_office_${o.id || idx}`),
          firm_slug: firm.slug,
          city_ar: o.cityAr || o.city || '',
          city_en: o.cityEn || '',
          country_ar: o.countryAr || 'المملكة العربية السعودية',
          country_en: o.countryEn || 'Saudi Arabia',
          address_ar: o.addressAr || o.address || '',
          address_en: o.addressEn || '',
          phone: o.phone || '',
          email: o.email || '',
          map_embed_url: o.mapEmbedUrl || '',
          is_headquarter: !!o.isHeadquarter,
        }));

        if (rows.length > 0) {
          await client.from('office_locations').upsert(rows, { onConflict: 'id' });
          const validIds = rows.map(r => r.id);
          await client.from('office_locations').delete().eq('firm_slug', firm.slug).not('id', 'in', validIds);
          stats.offices = rows.length;
        } else {
          await client.from('office_locations').delete().eq('firm_slug', firm.slug);
        }
      }

      // 6. Case Studies (New)
      if (Array.isArray(data.caseStudies)) {
        const rows = data.caseStudies.map((cs: any, idx: number) => ({
          id: isValidUUID(cs.id) ? cs.id : toValidUUID(`${firm.slug}_case_${cs.id || idx}`),
          firm_slug: firm.slug,
          title_ar: cs.title || cs.titleAr || '',
          title_en: cs.titleEn || '',
          category_ar: cs.category || cs.categoryAr || '',
          category_en: cs.categoryEn || '',
          summary_ar: cs.summary || cs.summaryAr || '',
          summary_en: cs.summaryEn || '',
          outcome_ar: cs.outcome || cs.outcomeAr || '',
          outcome_en: cs.outcomeEn || '',
          value_sar: typeof cs.value === 'number' ? cs.value : (parseFloat(String(cs.value).replace(/[^0-9.]/g, '')) || 0),
          year: parseInt(String(cs.year)) || new Date().getFullYear(),
        }));

        if (rows.length > 0) {
          await client.from('case_studies').upsert(rows, { onConflict: 'id' });
          const validIds = rows.map(r => r.id);
          await client.from('case_studies').delete().eq('firm_slug', firm.slug).not('id', 'in', validIds);
          stats.caseStudies = rows.length;
        } else {
          await client.from('case_studies').delete().eq('firm_slug', firm.slug);
        }
      }

      // 7. Consultation Inquiries / Messages (New)
      if (Array.isArray(data.messages)) {
        const rows = data.messages.map((m: any, idx: number) => ({
          id: isValidUUID(m.id) ? m.id : toValidUUID(`${firm.slug}_msg_${m.id || idx}`),
          firm_slug: firm.slug,
          full_name: m.fullName || '',
          phone: m.phone || '',
          email: m.email || '',
          company: m.company || '',
          consultation_type: m.consultationType || '',
          preferred_date: m.preferredDate || '',
          is_urgent: !!m.isUrgent,
          message: m.message || '',
          status: m.status || 'new',
        }));

        if (rows.length > 0) {
          await client.from('consultation_inquiries').upsert(rows, { onConflict: 'id' });
          const validIds = rows.map(r => r.id);
          await client.from('consultation_inquiries').delete().eq('firm_slug', firm.slug).not('id', 'in', validIds);
          stats.messages = rows.length;
        } else {
          await client.from('consultation_inquiries').delete().eq('firm_slug', firm.slug);
        }
      }
      // 8. Firm Subscriptions (New)
      if (firm.subscription) {
        const sub = firm.subscription;
        const subRow = {
          id: toValidUUID(`${firm.slug}_sub`),
          firm_slug: firm.slug,
          plan_tier: sub.planTier || 'professional',
          plan_name_ar: sub.planNameAr || 'الباقة السنوية الاحترافية',
          plan_name_en: sub.planNameEn || 'Professional Annual Plan',
          status: sub.status || 'active',
          is_site_active: sub.isSiteActive ?? true,
          start_date: sub.startDate || new Date().toISOString(),
          end_date: sub.endDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          annual_fee: sub.annualFee || 3500,
          currency: sub.currency || 'SAR',
          payment_status: sub.paymentStatus || 'paid',
          auto_renew: sub.autoRenew ?? true,
          notes: sub.notes || '',
        };
        const { error } = await client.from('firm_subscriptions').upsert(subRow, { onConflict: 'id' });
        if (!error) stats.subscriptions = 1;
      }

      // 9. Domain Mappings (New)
      if (firm.customDomain) {
        const domainRow = {
          id: toValidUUID(`${firm.slug}_domain`),
          firm_slug: firm.slug,
          custom_domain: firm.customDomain,
          status: 'active',
          ssl_active: true,
          cname_target: 'custom.aladl.law',
        };
        const { error } = await client.from('domain_mappings').upsert(domainRow, { onConflict: 'custom_domain' });
        if (!error) stats.domains = 1;
      }
    } catch (e) {
      console.warn('Sub-table sync partially failed:', e);
    }
    return stats;
  }

  // Sync a single firm to Supabase with multi-tier error resilience
  public async syncFirmToSupabase(firm: LawFirm): Promise<{ success: boolean; message: string }> {
    const config = getStoredSupabaseConfig();
    if (!config.url || !config.anonKey) {
      return { 
        success: false, 
        message: 'بيانات الربط مع Supabase غير مكتملة. الرجاء إدخال رابط المشروع (Project URL) ومفتاح الـ Anon Key ثم حفظها أولاً.' 
      };
    }

    try {
      const client = getSupabase();
      const tableName = config.tableName || 'law_firms';
      ensureFirmSubscription(firm);

      // Check if firm already exists in Supabase by slug to match its exact existing ID
      let resolvedId: string = isValidUUID(firm.id) ? firm.id : toValidUUID(firm.id || firm.slug);
      let existingRecord: any = null;
      try {
        const { data: existing } = await client
          .from(tableName)
          .select('id, slug')
          .eq('slug', firm.slug)
          .maybeSingle();

        if (existing) {
          existingRecord = existing;
          if (existing.id) {
            resolvedId = String(existing.id);
          }
        }
      } catch {}

      firm.id = resolvedId;

      const fullRecord: Record<string, any> = {
        id: resolvedId,
        slug: firm.slug,
        name_ar: firm.nameAr,
        name_en: firm.nameEn || '',
        city_ar: firm.cityAr || 'الرياض',
        city_en: firm.cityEn || 'Riyadh',
        phone: firm.phone || '',
        email: firm.email || '',
        admin_password: firm.adminPassword || '123456',
        license_number: firm.licenseNumber || '',
        tagline_ar: firm.taglineAr || '',
        theme_color: firm.themeColor || '#c5a869',
        is_verified: firm.isVerified ?? true,
        featured: firm.featured ?? false,
        subscription: firm.subscription || {
          status: "active",
          isSiteActive: true,
          planTier: "professional",
          annualFee: 3500,
          currency: "SAR"
        },
        data: {
          ...firm.data,
          isDefaultPublic: firm.isDefaultPublic ?? (firm.slug === this.getDefaultPublicFirmSlug()),
          subscription: firm.subscription,
        },
        updated_at: new Date().toISOString(),
      };

      let syncSucceeded = false;
      let lastError: any = null;

      // Tier 1: Standard upsert with onConflict: 'slug'
      try {
        const res = await client
          .from(tableName)
          .upsert(fullRecord, { onConflict: 'slug' })
          .select('id, slug')
          .maybeSingle();

        if (!res.error) {
          syncSucceeded = true;
          if (res.data?.id) firm.id = String(res.data.id);
        } else {
          lastError = res.error;
        }
      } catch (e: any) {
        lastError = e;
      }

      // Tier 2: If ON CONFLICT fails (e.g. slug is not a unique index constraint in Postgres),
      // switch to direct Update-if-found or Insert-if-not-found
      if (!syncSucceeded && lastError && (
        lastError.message?.includes('ON CONFLICT') ||
        lastError.message?.includes('unique') ||
        lastError.code === '42P10'
      )) {
        try {
          if (existingRecord) {
            const updateRes = await client
              .from(tableName)
              .update(fullRecord)
              .eq('slug', firm.slug)
              .select('id, slug')
              .maybeSingle();

            if (!updateRes.error) {
              syncSucceeded = true;
            } else {
              lastError = updateRes.error;
            }
          } else {
            const insertRes = await client
              .from(tableName)
              .insert(fullRecord)
              .select('id, slug')
              .maybeSingle();

            if (!insertRes.error) {
              syncSucceeded = true;
              if (insertRes.data?.id) firm.id = String(insertRes.data.id);
            } else {
              lastError = insertRes.error;
            }
          }
        } catch (e: any) {
          lastError = e;
        }
      }

      // Tier 3: If column / schema cache error occurred (user's Supabase table has different or missing columns),
      // strip optional columns down to core fields (everything remains 100% preserved inside the 'data' JSONB column!)
      if (!syncSucceeded && lastError && (
        lastError.message?.includes('column') ||
        lastError.message?.includes('schema cache') ||
        lastError.message?.includes('Could not find')
      )) {
        const coreRecord: Record<string, any> = {
          id: resolvedId,
          slug: firm.slug,
          name_ar: firm.nameAr,
          data: fullRecord.data,
          updated_at: fullRecord.updated_at,
        };

        try {
          // Try upsert on coreRecord
          const coreRes = await client
            .from(tableName)
            .upsert(coreRecord, { onConflict: 'slug' })
            .select('id, slug')
            .maybeSingle();

          if (!coreRes.error) {
            syncSucceeded = true;
            if (coreRes.data?.id) firm.id = String(coreRes.data.id);
          } else {
            lastError = coreRes.error;
            // Also try update/insert with coreRecord
            if (existingRecord) {
              const u = await client.from(tableName).update(coreRecord).eq('slug', firm.slug);
              if (!u.error) syncSucceeded = true;
            } else {
              const i = await client.from(tableName).insert(coreRecord);
              if (!i.error) syncSucceeded = true;
            }
          }
        } catch (e: any) {
          lastError = e;
        }

        // Ultra-minimal tier if even name_ar is missing
        if (!syncSucceeded && lastError && (lastError.message?.includes('column') || lastError.message?.includes('schema cache'))) {
          const ultraMinimal = {
            slug: firm.slug,
            data: fullRecord.data,
          };
          try {
            if (existingRecord) {
              const u = await client.from(tableName).update(ultraMinimal).eq('slug', firm.slug);
              if (!u.error) syncSucceeded = true;
            } else {
              const i = await client.from(tableName).insert(ultraMinimal);
              if (!i.error) syncSucceeded = true;
            }
          } catch (e: any) {
            lastError = e;
          }
        }
      }

      // Tier 4: If UUID syntax error occurred
      if (!syncSucceeded && lastError && (
        lastError.message?.includes('uuid') ||
        lastError.message?.includes('invalid input syntax')
      )) {
        const { id: _, ...noIdRecord } = fullRecord;
        try {
          if (existingRecord) {
            const u = await client.from(tableName).update(noIdRecord).eq('slug', firm.slug);
            if (!u.error) syncSucceeded = true;
            else lastError = u.error;
          } else {
            const i = await client.from(tableName).insert(noIdRecord);
            if (!i.error) syncSucceeded = true;
            else lastError = i.error;
          }
        } catch (e: any) {
          lastError = e;
        }
      }

      if (!syncSucceeded) {
        return { 
          success: false, 
          message: formatSupabaseError(lastError, tableName) 
        };
      }

      this.saveToLocalCache();

      // Safely sync sub-tables if they exist in Supabase (non-blocking)
      const subStats = await this.syncSubTables(client, firm).catch(() => ({}));
      const subMsg = Object.keys(subStats).length > 0 
        ? ` (وتحديث ${Object.values(subStats).reduce((a, b) => a + b, 0)} سجلات تفصيلية)` 
        : '';

      return { 
        success: true, 
        message: `تمت مزامنة ورفع موقع "${firm.nameAr}" وجميع بياناته بنجاح تام إلى Supabase!${subMsg}` 
      };
    } catch (err: any) {
      return { 
        success: false, 
        message: formatSupabaseError(err, config.tableName || 'law_firms') 
      };
    }
  }

  // Sync ALL firms to Supabase
  public async syncAllToSupabase(): Promise<{ success: boolean; message: string; count?: number }> {
    const config = getStoredSupabaseConfig();
    if (!config.url || !config.anonKey) {
      return { 
        success: false, 
        message: 'الرجاء إدخال بيانات الربط مع Supabase (Project URL & Anon Key) أولاً وحفظها.' 
      };
    }

    try {
      const tableName = config.tableName || 'law_firms';
      let successCount = 0;
      let failedCount = 0;
      let lastErrorMessage = '';

      // Sync each firm individually
      for (const firm of this.memoryFirms) {
        const res = await this.syncFirmToSupabase(firm);
        if (res.success) {
          successCount++;
        } else {
          failedCount++;
          lastErrorMessage = res.message;
        }
      }

      // Cleanup deleted firms from Supabase main table
      try {
        const client = getSupabase();
        const activeSlugs = this.memoryFirms.map(f => f.slug);
        if (activeSlugs.length > 0) {
          await client.from(tableName).delete().not('slug', 'in', activeSlugs);
        }
      } catch (e) {
        console.warn('Failed to cleanup old firms from Supabase', e);
      }

      if (successCount === this.memoryFirms.length) {
        this.saveToLocalCache();
        this.pushToServer().catch(() => {});
        return { 
          success: true, 
          count: successCount, 
          message: `✅ تمت مزامنة ورفع كافة بيانات (${successCount}) مواقع ومكاتب قانونية إلى Supabase بنجاح تام!` 
        };
      } else if (successCount > 0) {
        this.saveToLocalCache();
        this.pushToServer().catch(() => {});
        return {
          success: true,
          count: successCount,
          message: `تم رفع (${successCount}) مكاتب بنجاح، بينما تعذر رفع (${failedCount}) مكاتب: ${lastErrorMessage}`,
        };
      } else {
        return {
          success: false,
          count: 0,
          message: lastErrorMessage || `تعذر رفع البيانات إلى جدول ${tableName} في Supabase`,
        };
      }
    } catch (err: any) {
      return { 
        success: false, 
        message: formatSupabaseError(err, config.tableName || 'law_firms') 
      };
    }
  }

  public async syncToSupabase(): Promise<{ success: boolean; message: string; count?: number }> {
    return this.syncAllToSupabase();
  }

  public async syncFromSupabase(): Promise<{ success: boolean; message: string; count?: number }> {
    const config = getStoredSupabaseConfig();
    if (!config.url || !config.anonKey) {
      return { success: false, message: 'الرجاء إدخال بيانات الربط مع Supabase أولاً.' };
    }
    try {
      const client = getSupabase();
      const tableName = config.tableName || 'law_firms';
      const { data, error } = await client.from(tableName).select('*');
      if (error) {
        return { success: false, message: `خطأ من Supabase: ${error.message}` };
      }
      if (data && data.length > 0) {
        const fetchedFirms: LawFirm[] = data.map((row: any) => {
          const rawSub = row.subscription || row.data?.subscription;
          const firmObj: LawFirm = {
            id: row.id,
            slug: row.slug,
            nameAr: row.name_ar,
            nameEn: row.name_en || '',
            cityAr: row.city_ar || '',
            cityEn: row.city_en || '',
            phone: row.phone || '',
            email: row.email || '',
            adminPassword: row.admin_password || '123456',
            isVerified: row.is_verified ?? true,
            featured: row.featured ?? false,
            taglineAr: row.data?.settings?.sloganAr || '',
            taglineEn: row.data?.settings?.sloganEn || '',
            themeColor: row.theme_color || '#c5a869',
            createdAt: row.created_at || new Date().toISOString(),
            updatedAt: row.updated_at || new Date().toISOString(),
            data: row.data,
            subscription: rawSub,
          };
          return ensureFirmSubscription(firmObj);
        });
        for (const ff of fetchedFirms) {
          const idx = this.memoryFirms.findIndex((m) => m.slug === ff.slug);
          if (idx >= 0) {
            this.memoryFirms[idx] = ff;
          } else {
            this.memoryFirms.push(ff);
          }
        }
        this.saveToLocalCache();
        this.pushToServer();
        return { success: true, count: fetchedFirms.length, message: `تم جلب ${fetchedFirms.length} موقع مكتب من Supabase بنجاح!` };
      }
      return { success: true, count: 0, message: 'لم يتم العثور على مكاتب في Supabase.' };
    } catch (e: any) {
      return { success: false, message: e.message || 'فشل الاتصال بـ Supabase' };
    }
  }

  // Public Getters and Modifiers
  public setFirm(firm: LawFirm): void {
    const ensured = ensureFirmSubscription(firm);
    const idx = this.memoryFirms.findIndex(f => f.slug.toLowerCase() === ensured.slug.toLowerCase() || f.id === ensured.id);
    if (idx >= 0) {
      this.memoryFirms[idx] = ensured;
    } else {
      this.memoryFirms.push(ensured);
    }
    this.saveToLocalCache();
  }

  public getAllFirms(): LawFirm[] {
    if (this.memoryFirms.length === 0) {
      this.initLocal();
    }
    return [...this.memoryFirms];
  }

  public getFirmBySlug(slug: string): LawFirm | null {
    if (!slug) return null;
    const cleanSlug = slug.trim().toLowerCase();
    const found = this.memoryFirms.find((f) => f.slug.toLowerCase() === cleanSlug);
    if (found) return { ...found };

    // If requested slug is not in memory yet, return a graceful fallback firm so URL landing works immediately
    return {
      id: toValidUUID(`firm-${cleanSlug}`),
      slug: cleanSlug,
      nameAr: `مكتب المحاماة`,
      nameEn: `Law Firm`,
      cityAr: 'الرياض',
      cityEn: 'Riyadh',
      countryAr: 'المملكة العربية السعودية',
      countryEn: 'Saudi Arabia',
      phone: '+966 11 000 0000',
      email: 'info@lawfirm.com',
      licenseNumber: '',
      adminPassword: '123456',
      isVerified: true,
      featured: false,
      taglineAr: 'استشارات قانونية محترفة',
      taglineEn: 'Professional Legal Consultancy',
      themeColor: '#c5a869',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      data: {
        settings: {
          firmNameAr: `مكتب ${cleanSlug}`,
          firmNameEn: `${cleanSlug} Law Firm`,
          sloganAr: 'استشارات قانونية محترفة',
          sloganEn: 'Professional Legal Consultancy',
          subSloganAr: 'خدمات قانونية متكاملة',
          subSloganEn: 'Comprehensive legal services',
          aboutTextAr: 'نقدم استشارات قانونية متكاملة وموثوقة',
          aboutTextEn: 'We provide comprehensive and reliable legal consultancy',
          addressAr: 'الرياض، المملكة العربية السعودية',
          addressEn: 'Riyadh, Saudi Arabia',
          phone: '+966 11 000 0000',
          emergencyPhone: '+966 50 000 0000',
          email: 'info@lawfirm.com',
          consultationEmail: 'consult@lawfirm.com',
          workingHoursAr: 'الأحد - الخميس: 8:00 صباحاً - 5:00 مساءً',
          workingHoursEn: 'Sun - Thu: 8:00 AM - 5:00 PM',
          stats: {
            yearsExperience: 15,
            casesWon: 500,
            activeClients: 1200,
            successRate: 98,
            recoveredMillionsUSD: 50
          },
          socialLinks: {
            linkedin: 'https://linkedin.com',
            twitter: 'https://twitter.com',
            youtube: 'https://youtube.com'
          }
        },
        partners: [],
        practiceAreas: [],
        caseStudies: [],
        testimonials: [],
        blogPosts: [],
        offices: [],
        messages: []
      },
      subscription: {
        planTier: 'professional',
        planNameAr: 'الباقة السنوية الاحترافية',
        planNameEn: 'Professional Annual Plan',
        status: 'active',
        isSiteActive: true,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 365*24*60*60*1000).toISOString(),
        autoRenew: true,
        paymentStatus: 'paid'
      }
    };
  }

  public getFirmById(id: string): LawFirm | null {
    const found = this.memoryFirms.find((f) => f.id === id);
    return found ? { ...found } : null;
  }

  // Returns the designated single firm displayed on Vercel deployment root domain
  public getDefaultPublicFirmSlug(): string {
    // 1. Check environment variable set in Vercel or Vite (VITE_DEFAULT_FIRM_SLUG)
    try {
      const envSlug = (import.meta.env.VITE_DEFAULT_FIRM_SLUG || '').trim();
      if (envSlug) {
        return envSlug;
      }
    } catch {}

    // 2. Check local platform setting
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY_DEFAULT_PUBLIC_SLUG);
      if (stored) {
        return stored;
      }
    }

    // 3. Check firm marked with isDefaultPublic === true
    const defaultFirm = this.memoryFirms.find((f) => f.isDefaultPublic);
    if (defaultFirm) return defaultFirm.slug;

    const first = this.memoryFirms[0];
    return first ? first.slug : '';
  }

  // Set which law firm is shown to the world on the Vercel root domain
  public async setDefaultPublicFirm(slug: string): Promise<{ success: boolean; message: string }> {
    const target = this.getFirmBySlug(slug);
    if (!target) {
      return { success: false, message: 'المكتب المطلوب غير موجود' };
    }

    this.memoryFirms = this.memoryFirms.map((f) => ({
      ...f,
      isDefaultPublic: f.slug === slug,
    }));

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_DEFAULT_PUBLIC_SLUG, slug);
      localStorage.setItem(STORAGE_KEY_ACTIVE_SLUG, slug);
    }

    this.saveToLocalCache();
    this.pushToServer().catch(() => {});

    // Sync is_default_public flag to central Supabase table
    try {
      const config = getStoredSupabaseConfig();
      if (config.url && config.anonKey) {
        const client = getSupabase();
        const tableName = config.tableName || 'law_firms';
        try {
          const res1 = await client.from(tableName).update({ is_default_public: false }).neq('slug', slug);
          if (res1.error && (res1.error.message.includes('is_default_public') || res1.error.message.includes('schema cache'))) {
            // Column is not present in table schema cache, sync via JSON 'data' field
            await this.syncFirmToSupabase(target);
          } else {
            await client.from(tableName).update({ is_default_public: true }).eq('slug', slug);
          }
        } catch {
          await this.syncFirmToSupabase(target);
        }
      }
    } catch {}

    window.dispatchEvent(new CustomEvent('aladl_default_firm_changed', { detail: { slug } }));
    window.dispatchEvent(new CustomEvent('aladl_active_firm_changed', { detail: { slug } }));

    return { 
      success: true, 
      message: `تم اعتماد مكتب "${target.nameAr}" ليكون هو الواجهة الافتراضية المعروضة للعالم على Vercel بنجاح!` 
    };
  }

  // Active Firm detection from URL or designated default
  public getActiveFirmSlug(): string {
    if (typeof window !== 'undefined') {
      // 1. Explicit URL query param ?firm=xyz takes highest priority (isolated direct client landing)
      const params = new URLSearchParams(window.location.search);
      const urlFirm = params.get('firm');
      if (urlFirm) {
        return urlFirm.trim().toLowerCase();
      }

      // 2. Check stored active firm for admin navigation session
      const stored = localStorage.getItem(STORAGE_KEY_ACTIVE_SLUG);
      if (stored) {
        return stored;
      }
    }

    // 3. World public visitors on root domain Vercel see the default public firm
    return this.getDefaultPublicFirmSlug();
  }

  public setActiveFirmSlug(slug: string, updateUrl = true): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY_ACTIVE_SLUG, slug);

    if (updateUrl) {
      const url = new URL(window.location.href);
      url.searchParams.set('firm', slug);
      window.history.pushState({}, '', url.toString());
    }

    window.dispatchEvent(new CustomEvent('aladl_active_firm_changed', { detail: { slug } }));
  }

  // Save or update an existing law firm
  public async saveFirm(firm: LawFirm): Promise<{ success: boolean; message: string; supabaseStatus?: string }> {
    const index = this.memoryFirms.findIndex((f) => f.id === firm.id || f.slug === firm.slug);
    const updatedFirm: LawFirm = {
      ...firm,
      updatedAt: new Date().toISOString(),
    };

    if (index >= 0) {
      this.memoryFirms[index] = updatedFirm;
    } else {
      this.memoryFirms.push(updatedFirm);
    }

    // 1. Save locally
    this.saveToLocalCache();

    // 2. Push to server
    this.pushToServer();

    // 3. Sync to Supabase in parallel
    const supaRes = await this.syncFirmToSupabase(updatedFirm);

    return {
      success: true,
      message: 'تم حفظ كافة بيانات المكتب بنجاح وتحديث موقعه للزوار!',
      supabaseStatus: supaRes.message,
    };
  }

  // Register a new Law Firm (Self-Service or Super Admin)
  public async createFirm(info: {
    nameAr: string;
    nameEn?: string;
    slug?: string;
    cityAr?: string;
    cityEn?: string;
    countryAr?: string;
    countryEn?: string;
    phone?: string;
    email?: string;
    adminPassword?: string;
    taglineAr?: string;
    licenseNumber?: string;
    themeColor?: string;
  }): Promise<{ success: boolean; firm?: LawFirm; message: string }> {
    // Generate clean unique slug
    let rawSlug = (info.slug || info.nameEn || info.nameAr)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\u0600-\u06FF]+/g, '-')
      .replace(/^-+|-+$/g, '');

    if (!rawSlug) {
      rawSlug = `firm-${Date.now().toString(36)}`;
    }

    // Ensure uniqueness
    let finalSlug = rawSlug;
    let counter = 1;
    while (this.memoryFirms.some((f) => f.slug === finalSlug)) {
      finalSlug = `${rawSlug}-${counter}`;
      counter++;
    }

    const newSettings: SiteSettings = {
      firmNameAr: info.nameAr,
      firmNameEn: info.nameEn || 'Law Firm & Legal Counsel',
      sloganAr: info.taglineAr || 'حلول قانونية واستشارات استراتيجية رائدة',
      sloganEn: 'Strategic Legal Solutions',
      subSloganAr: 'خبرة عريقة في الأنظمة والقوانين',
      subSloganEn: 'Excellence in Legal Practice',
      aboutTextAr: 'نحن مكتب محاماة رائد يضم نخبة من المستشارين القانونيين...',
      aboutTextEn: 'We are a leading law firm with elite legal advisors...',
      phone: info.phone || '+966 11 000 0000',
      emergencyPhone: info.phone || '+966 50 000 0000',
      email: info.email || 'info@lawfirm.com',
      consultationEmail: info.email || 'consult@lawfirm.com',
      addressAr: info.cityAr ? `${info.cityAr}، المملكة العربية السعودية` : 'الرياض، المملكة العربية السعودية',
      addressEn: info.cityEn ? `${info.cityEn}, Saudi Arabia` : 'Riyadh, Saudi Arabia',
      workingHoursAr: 'الأحد - الخميس: 8:00 صباحاً - 5:00 مساءً',
      workingHoursEn: 'Sun - Thu: 8:00 AM - 5:00 PM',
      stats: {
        yearsExperience: 10,
        casesWon: 100,
        activeClients: 500,
        successRate: 95,
        recoveredMillionsUSD: 10
      },
      socialLinks: {
        linkedin: 'https://linkedin.com',
        twitter: 'https://twitter.com',
        youtube: 'https://youtube.com'
      },
      contactPhone: info.phone || '+966 11 000 0000',
      contactEmail: info.email || 'info@lawfirm.com',
      licenseNumber: info.licenseNumber || 'LIC-2025-001',
      adminPassword: info.adminPassword || '123456',
    };

    const cAr = info.countryAr || 'المملكة العربية السعودية';
    const cEn = info.countryEn || 'Saudi Arabia';

    const newFirm: LawFirm = {
      id: toValidUUID(`firm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`),
      slug: finalSlug,
      nameAr: info.nameAr,
      nameEn: info.nameEn || 'Law Firm',
      taglineAr: info.taglineAr || 'حلول قانونية واستشارات استراتيجية رائدة',
      taglineEn: 'Premier Legal Consultancy',
      cityAr: info.cityAr || 'الرياض',
      cityEn: info.cityEn || 'Riyadh',
      countryAr: cAr,
      countryEn: cEn,
      phone: info.phone || '+966 11 000 0000',
      email: info.email || 'info@lawfirm.com',
      licenseNumber: info.licenseNumber || '',
      adminPassword: info.adminPassword || '123456',
      status: 'active',
      isVerified: true,
      featured: false,
      themeColor: info.themeColor || '#c5a869',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      data: {
        settings: newSettings,
        partners: [],
        practiceAreas: [],
        caseStudies: [],
        testimonials: [],
        blogPosts: [],
        offices: [
          {
            id: `off-${Date.now()}`,
            cityAr: info.cityAr || 'الرياض',
            cityEn: info.cityEn || 'Riyadh',
            countryAr: cAr,
            countryEn: cEn,
            addressAr: `المقر الرئيسي، ${info.cityAr || 'الرياض'}`,
            addressEn: `Headquarters, ${info.cityEn || 'Riyadh'}`,
            phone: info.phone || '+966 11 000 0000',
            email: info.email || 'info@lawfirm.com',
            mapEmbedUrl: '',
            isHeadquarter: true,
          }
        ],
        messages: [],
        savedAt: new Date().toISOString(),
      },

      subscription: {
        planTier: 'starter',
        planNameAr: 'الباقة السنوية القياسية للمحامي',
        planNameEn: 'Lawyer Standard Annual Plan',
        status: 'active',
        isSiteActive: true,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        annualFee: 2500,
        currency: 'SAR',
        autoRenew: true,
        paymentStatus: 'paid',
        notes: 'تم تفعيل ترخيص الموقع السنوي للمكتب بنجاح',
      },
    };

    this.memoryFirms.push(newFirm);
    this.saveToLocalCache();
    this.pushToServer();
    this.syncFirmToSupabase(newFirm);

    return {
      success: true,
      firm: newFirm,
      message: `تم إنشاء موقع المكتب القانوني وتفعيله لسنة كاملة بنجاح! الرابط المستقل: ?firm=${finalSlug}`,
    };
  }

  // Toggle firm site activation (Super Admin or Lawyer)
  public async toggleFirmSiteStatus(
    firmIdOrSlug: string,
    activate?: boolean
  ): Promise<{ success: boolean; isSiteActive: boolean; message: string }> {
    const firm = this.memoryFirms.find((f) => f.id === firmIdOrSlug || f.slug === firmIdOrSlug);
    if (!firm) {
      return { success: false, isSiteActive: false, message: 'المكتب المطلوب غير موجود في النظام.' };
    }

    ensureFirmSubscription(firm);
    const newStatus = activate !== undefined ? activate : !firm.subscription!.isSiteActive;
    firm.subscription!.isSiteActive = newStatus;

    if (newStatus && firm.subscription!.status === 'suspended') {
      firm.subscription!.status = 'active';
    } else if (!newStatus) {
      firm.subscription!.status = 'suspended';
    }

    await this.saveFirm(firm);

    return {
      success: true,
      isSiteActive: newStatus,
      message: newStatus
        ? `تم تفعيل موقع مكتب "${firm.nameAr}" بنجاح! الموقع مباشر الآن للزوار.`
        : `تم إيقاف موقع مكتب "${firm.nameAr}" مؤقتاً. سيظهر للزوار إشعار التوقف.`,
    };
  }

  // Extend or renew annual subscription for 1 or more years
  public async renewFirmSubscription(
    firmIdOrSlug: string,
    additionalYears = 1
  ): Promise<{ success: boolean; firm?: LawFirm; message: string }> {
    const firm = this.memoryFirms.find((f) => f.id === firmIdOrSlug || f.slug === firmIdOrSlug);
    if (!firm) {
      return { success: false, message: 'المكتب المطلوب غير موجود.' };
    }

    ensureFirmSubscription(firm);
    const currentEnd = new Date(firm.subscription!.endDate).getTime();
    const baseTime = !isNaN(currentEnd) && currentEnd > Date.now() ? currentEnd : Date.now();
    const newEndDate = new Date(baseTime + additionalYears * 365 * 24 * 60 * 60 * 1000).toISOString();

    firm.subscription!.endDate = newEndDate;
    firm.subscription!.status = 'active';
    firm.subscription!.isSiteActive = true;
    firm.subscription!.paymentStatus = 'paid';

    await this.saveFirm(firm);

    const formattedDate = new Date(newEndDate).toLocaleDateString('ar-SA');
    return {
      success: true,
      firm,
      message: `تم تجديد الاشتراك السنوي لمكتب "${firm.nameAr}" وتفعيل الموقع بنجاح حتى تاريخ ${formattedDate}!`,
    };
  }

  // Update subscription details (plan tier, fees, payment status, dates)
  public async updateFirmSubscription(
    firmIdOrSlug: string,
    updates: Partial<FirmSubscription>
  ): Promise<{ success: boolean; firm?: LawFirm; message: string }> {
    const firm = this.memoryFirms.find((f) => f.id === firmIdOrSlug || f.slug === firmIdOrSlug);
    if (!firm) {
      return { success: false, message: 'المكتب غير موجود.' };
    }

    ensureFirmSubscription(firm);
    firm.subscription = {
      ...firm.subscription!,
      ...updates,
    };

    // If status changed to active, ensure isSiteActive is true
    if (updates.status === 'active' && updates.isSiteActive === undefined) {
      firm.subscription.isSiteActive = true;
    } else if (updates.status === 'suspended' && updates.isSiteActive === undefined) {
      firm.subscription.isSiteActive = false;
    }

    await this.saveFirm(firm);

    return {
      success: true,
      firm,
      message: 'تم تحديث بيانات وخطة الاشتراك السنوي بنجاح!',
    };
  }

  // Check if a firm's public website is currently active
  public isFirmSiteActive(firmSlug: string): {
    isActive: boolean;
    reason?: 'SITE_DEACTIVATED' | 'EXPIRED' | 'SUSPENDED' | 'NOT_FOUND';
    firm?: LawFirm;
    daysRemaining?: number;
  } {
    const firm = this.getFirmBySlug(firmSlug);
    if (!firm) {
      return { isActive: false, reason: 'NOT_FOUND' };
    }

    ensureFirmSubscription(firm);
    const sub = firm.subscription!;

    // 1. Check explicit site active toggle
    if (sub.isSiteActive === false) {
      return { isActive: false, reason: 'SITE_DEACTIVATED', firm, daysRemaining: 0 };
    }

    // 2. Check suspended status
    if (sub.status === 'suspended') {
      return { isActive: false, reason: 'SUSPENDED', firm, daysRemaining: 0 };
    }

    // 3. Check expiration date
    if (sub.endDate) {
      const expiry = new Date(sub.endDate).getTime();
      const now = Date.now();
      const diffDays = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));

      if (!isNaN(expiry) && expiry < now) {
        return { isActive: false, reason: 'EXPIRED', firm, daysRemaining: diffDays };
      }

      return { isActive: true, firm, daysRemaining: Math.max(0, diffDays) };
    }

    return { isActive: true, firm, daysRemaining: 365 };
  }

  // Delete a law firm
  public async deleteFirm(idOrSlug: string): Promise<{ success: boolean; message: string }> {
    if (this.memoryFirms.length <= 1) {
      return { success: false, message: 'لا يمكن حذف المكتب الوحيد المتبقي في المنصة.' };
    }

    const firmToDelete = this.memoryFirms.find((f) => f.id === idOrSlug || f.slug === idOrSlug);
    if (!firmToDelete) {
      return { success: false, message: 'المكتب غير موجود.' };
    }

    this.memoryFirms = this.memoryFirms.filter((f) => f.id !== firmToDelete.id && f.slug !== firmToDelete.slug);

    // If active firm was deleted, fallback to first available firm
    const currentActiveSlug = this.getActiveFirmSlug();
    if (currentActiveSlug === firmToDelete.slug) {
      const nextFirm = this.memoryFirms[0];
      if (nextFirm) {
        this.setActiveFirmSlug(nextFirm.slug, false);
      }
    }

    const currentDefaultSlug = this.getDefaultPublicFirmSlug();
    if (currentDefaultSlug === firmToDelete.slug) {
      const nextFirm = this.memoryFirms[0];
      if (nextFirm) {
        this.setDefaultPublicFirm(nextFirm.slug);
      }
    }

    this.saveToLocalCache();
    
    // 1. Delete from Backend JSON storage
    try {
      if (typeof fetch !== 'undefined') {
        await fetch('/api/firms/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug: firmToDelete.slug }),
        });
      }
    } catch (e) {
      console.warn('Failed to delete firm from backend storage', e);
    }

    // 2. Delete from Supabase if configured
    try {
      const config = getStoredSupabaseConfig();
      if (config.url && config.anonKey) {
        const client = getSupabase();
        await client.from(config.tableName || 'law_firms').delete().eq('slug', firmToDelete.slug);
      }
    } catch {}

    return { success: true, message: `تم حذف مكتب "${firmToDelete.nameAr}" بنجاح.` };
  }

  // Verify Manager credentials for a specific firm
  public verifyManagerCredentials(slug: string, passwordAttempt: string): { success: boolean; firm?: LawFirm; isSuperAdmin?: boolean } {
    // Master Super Admin PIN
    if (passwordAttempt === 'AlAdlAdmin2025' || passwordAttempt === 'AdminRoot2025') {
      const firm = this.getFirmBySlug(slug) || this.memoryFirms[0];
      return { success: true, firm, isSuperAdmin: true };
    }

    const firm = this.getFirmBySlug(slug);
    if (!firm) {
      return { success: false };
    }

    const correctPassword = firm.adminPassword || firm.data.settings.adminPassword || '123456';
    if (passwordAttempt === correctPassword) {
      return { success: true, firm, isSuperAdmin: false };
    }

    return { success: false };
  }
}

export const firmService = new FirmService();
