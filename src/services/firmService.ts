import { LawFirm, LawFirmData, SiteSettings, FirmSubscription, SubscriptionPlanTier, SubscriptionStatus } from '../types';
import prepackagedFirms from '../../public/firms_data.json';
import { 
  initialSiteSettings, 
} from '../data/initialData';
import { getSupabase, getStoredSupabaseConfig, isValidUUID, toValidUUID, formatSupabaseError } from '../lib/supabase';

const STORAGE_KEY_FIRMS = 'aladl_multi_firms_v2';
const STORAGE_KEY_ACTIVE_SLUG = 'aladl_active_firm_slug_v1';
const STORAGE_KEY_DEFAULT_PUBLIC_SLUG = 'aladl_default_public_firm_slug_v1';

// IndexedDB for ultra-fast full firm caching (including high-res base64 images)
const FIRMS_IDB_NAME = 'aladl_firms_full_cache_v2';
const FIRMS_IDB_STORE = 'firms_list';

function openFirmsIDB(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      resolve(null);
      return;
    }
    try {
      const req = indexedDB.open(FIRMS_IDB_NAME, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(FIRMS_IDB_STORE)) {
          db.createObjectStore(FIRMS_IDB_STORE, { keyPath: 'key' });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function saveFirmsToIDB(firms: LawFirm[]): Promise<void> {
  try {
    const db = await openFirmsIDB();
    if (!db) return;
    const tx = db.transaction(FIRMS_IDB_STORE, 'readwrite');
    tx.objectStore(FIRMS_IDB_STORE).put({ key: 'all_firms', firms, updatedAt: Date.now() });
  } catch {}
}

async function getFirmsFromIDB(): Promise<LawFirm[] | null> {
  try {
    const db = await openFirmsIDB();
    if (!db) return null;
    return new Promise((resolve) => {
      const tx = db.transaction(FIRMS_IDB_STORE, 'readonly');
      const req = tx.objectStore(FIRMS_IDB_STORE).get('all_firms');
      req.onsuccess = () => {
        if (req.result && Array.isArray(req.result.firms) && req.result.firms.length > 0) {
          resolve(req.result.firms);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

// Strip only huge base64 strings (>120KB) for localStorage so all compressed firm images & data fit in localStorage for 0ms synchronous startup
function stripLargeBase64ForLocalStorage(obj: any): any {
  if (!obj) return obj;
  if (typeof obj === 'string') {
    if (obj.length > 120000 && obj.startsWith('data:')) {
      return '';
    }
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(stripLargeBase64ForLocalStorage);
  }
  if (typeof obj === 'object') {
    const copy: Record<string, any> = {};
    for (const k of Object.keys(obj)) {
      copy[k] = stripLargeBase64ForLocalStorage(obj[k]);
    }
    return copy;
  }
  return obj;
}

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

// Initial default seed firms for the multi-tenant SaaS platform (0ms instant load)
export function createDefaultFirms(): LawFirm[] {
  if (Array.isArray(prepackagedFirms) && prepackagedFirms.length > 0) {
    return (prepackagedFirms as unknown as LawFirm[]).map((f) => ensureFirmSubscription({ ...f }));
  }
  return [];
}

class FirmService {
  private memoryFirms: LawFirm[] = [];
  private isInitialized = false;
  private initPromise: Promise<void> | null = null;
  private realtimeSetup = false;
  private lastSupabaseFetchBySlug: Map<string, number> = new Map();

  constructor() {
    if (typeof window !== 'undefined') {
      this.initLocal();
      this.initMinimal().catch(() => {});
      this.initRealtimeSubscription();

      window.addEventListener('aladl_supabase_config_changed', () => {
        this.isInitialized = false;
        this.realtimeSetup = false;
        this.initRealtimeSubscription();
        this.init().then(() => {
          window.dispatchEvent(new CustomEvent('aladl_firms_updated', { detail: this.memoryFirms }));
        });
      });
    }
  }

  private initRealtimeSubscription(): void {
    if (typeof window === 'undefined' || this.realtimeSetup) return;
    const config = getStoredSupabaseConfig();
    if (!config.url || !config.anonKey) return;

    try {
      this.realtimeSetup = true;
      const client = getSupabase();
      const tableName = config.tableName || 'law_firms';
      client
        .channel('public:law_firms_global_sync')
        .on('postgres_changes', { event: '*', schema: 'public', table: tableName }, () => {
          this.fetchFromSupabase().catch(() => {});
        })
        .subscribe();
    } catch {
      this.realtimeSetup = false;
    }
  }

  private mapSupabaseRowToFirm(row: any): LawFirm {
    const rawSub = row.subscription || row.data?.subscription;
    const rowData = row.data || {};
    const existingSettings = rowData.settings || {};

    const normalizedSettings: SiteSettings = {
      ...initialSiteSettings,
      ...existingSettings,
      firmNameAr: existingSettings.firmNameAr || row.name_ar || 'مكتب محاماة',
      firmNameEn: existingSettings.firmNameEn || row.name_en || existingSettings.firmNameAr || row.name_ar || 'Law Firm',
      sloganAr: existingSettings.sloganAr || row.tagline_ar || initialSiteSettings.sloganAr,
      sloganEn: existingSettings.sloganEn || row.tagline_en || initialSiteSettings.sloganEn,
      phone: existingSettings.phone || row.phone || '',
      email: existingSettings.email || row.email || '',
      cityAr: existingSettings.cityAr || row.city_ar || 'الرياض',
      cityEn: existingSettings.cityEn || row.city_en || 'Riyadh',
      countryAr: existingSettings.countryAr || row.country_ar || 'المملكة العربية السعودية',
      countryEn: existingSettings.countryEn || row.country_en || 'Saudi Arabia',
      primaryColor: existingSettings.primaryColor || row.theme_color || '#c5a869',
      customLogoUrl: existingSettings.customLogoUrl || existingSettings.logoUrl || row.logo_url || rowData.logoUrl || '',
      adminPassword: row.admin_password || existingSettings.adminPassword || '123456',
    };

    const firmObj: LawFirm = {
      id: row.id,
      slug: row.slug,
      nameAr: row.name_ar || normalizedSettings.firmNameAr,
      nameEn: row.name_en || normalizedSettings.firmNameEn || '',
      nameTr: row.name_tr || existingSettings.firmNameTr || '',
      taglineAr: row.tagline_ar || normalizedSettings.sloganAr || '',
      taglineEn: row.tagline_en || normalizedSettings.sloganEn || '',
      cityAr: row.city_ar || normalizedSettings.cityAr || '',
      cityEn: row.city_en || normalizedSettings.cityEn || '',
      countryAr: row.country_ar || normalizedSettings.countryAr || 'المملكة العربية السعودية',
      countryEn: row.country_en || normalizedSettings.countryEn || 'Saudi Arabia',
      phone: row.phone || normalizedSettings.phone || '',
      email: row.email || normalizedSettings.email || '',
      logoUrl: normalizedSettings.customLogoUrl || '',
      licenseNumber: row.license_number || existingSettings.licenseNumber || '',
      adminPassword: row.admin_password || existingSettings.adminPassword || '123456',
      status: rawSub?.isSiteActive === false || rawSub?.status === 'suspended' ? 'suspended' : 'active',
      isVerified: row.is_verified ?? true,
      featured: row.featured ?? false,
      isDefaultPublic: row.is_default_public ?? rowData.isDefaultPublic ?? false,
      customDomain: row.custom_domain || rowData.customDomain || '',
      themeColor: row.theme_color || normalizedSettings.primaryColor || '#c5a869',
      createdAt: row.created_at || new Date().toISOString(),
      updatedAt: row.updated_at || new Date().toISOString(),
      data: {
        ...rowData,
        settings: normalizedSettings,
        partners: Array.isArray(rowData.partners) ? rowData.partners : [],
        practiceAreas: Array.isArray(rowData.practiceAreas) ? rowData.practiceAreas : [],
        caseStudies: Array.isArray(rowData.caseStudies) ? rowData.caseStudies : [],
        testimonials: Array.isArray(rowData.testimonials) ? rowData.testimonials : [],
        blogPosts: Array.isArray(rowData.blogPosts) ? rowData.blogPosts : [],
        offices: Array.isArray(rowData.offices) ? rowData.offices : [],
        messages: Array.isArray(rowData.messages) ? rowData.messages : [],
      },
      subscription: rawSub,
    };

    return ensureFirmSubscription(firmObj);
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
    // Start with prepackaged firms in 0ms so every firm is immediately available in RAM
    this.memoryFirms = createDefaultFirms();

    try {
      if (typeof window !== 'undefined') {
        // Remove legacy v1 cache that had stripped images
        try { localStorage.removeItem('aladl_multi_firms_v1'); } catch {}

        const raw = localStorage.getItem(STORAGE_KEY_FIRMS);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            this.mergeFirmsIntoMemory(parsed);
          }
        }
      }
    } catch (e) {
      console.warn('Error reading local firms cache', e);
    }
  }

  // Merge incoming firms with existing memoryFirms, preserving full data/images if incoming is partial
  private mergeFirmsIntoMemory(incoming: LawFirm[]): void {
    const mergedMap = new Map<string, LawFirm>();
    for (const mf of this.memoryFirms) {
      mergedMap.set(mf.slug.toLowerCase(), mf);
    }
    for (const rawFirm of incoming) {
      const firm = ensureFirmSubscription(rawFirm);
      const key = firm.slug.toLowerCase();
      const existing = mergedMap.get(key);
      if (existing) {
        const hasIncomingData = firm.data && (firm.data.partners?.length || firm.data.practiceAreas?.length || firm.data.offices?.length || firm.data.settings);
        mergedMap.set(key, {
          ...existing,
          ...firm,
          data: hasIncomingData ? firm.data : (existing.data || firm.data || {} as any),
        });
      } else {
        mergedMap.set(key, firm);
      }
    }
    this.memoryFirms = Array.from(mergedMap.values());
  }

  public async init(): Promise<void> {
    if (this.isInitialized) return Promise.resolve();
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      // 1. Read local cache FIRST for instant 0ms UI
      this.initLocal();

      // 2. Hydrate full firm data + high-res images from IndexedDB (~5ms)
      try {
        const idbFirms = await getFirmsFromIDB();
        if (idbFirms && idbFirms.length > 0) {
          this.mergeFirmsIntoMemory(idbFirms);
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('aladl_firms_updated', { detail: this.memoryFirms }));
          }
        }
      } catch {}

      // 3. Prioritize fetching directly from Supabase so all visitors around the world see the exact live database state
      try {
        const supaRes = await this.fetchFromSupabase();
        if (!supaRes.success || !supaRes.count) {
          await this.fetchFromServer();
        }
      } catch (err) {
        await this.fetchFromServer().catch(() => {});
      }

      this.isInitialized = true;
      this.initPromise = null;
    })();

    return this.initPromise;
  }

  private isFirmFullyHydrated(firm?: LawFirm | null): boolean {
    if (!firm || !firm.nameAr) return false;
    // If firm has custom partners, ensure images weren't stripped by an older cache version
    if (Array.isArray(firm.data?.partners) && firm.data!.partners.length > 0) {
      const firstPartner = firm.data!.partners[0] as any;
      if (firstPartner && firstPartner.image === '') {
        return false;
      }
      return true;
    }
    return !!(firm.data && (firm.data.settings || (firm as any).hasFullData !== undefined));
  }

  // Ultra-fast single firm loader: renders immediately from memory/IDB (0ms) AND refreshes live from Supabase
  public async fetchSingleFirmFast(slug: string): Promise<{ success: boolean; firm?: LawFirm }> {
    const cleanSlug = slug.trim().toLowerCase();
    const now = Date.now();
    const lastFetch = this.lastSupabaseFetchBySlug.get(cleanSlug) || 0;

    // 1. Check if memory already has full hydrated data (0ms)
    const memFirm = this.memoryFirms.find(f => f.slug.toLowerCase() === cleanSlug);
    if (this.isFirmFullyHydrated(memFirm)) {
      // Refresh live from Supabase in background if not fetched in last 3 seconds
      if (now - lastFetch > 3000) {
        this.fetchSingleFirmFromSupabase(cleanSlug).catch(() => {});
      }
      return { success: true, firm: memFirm };
    }

    // 2. Check IndexedDB (~5ms)
    try {
      const idbFirms = await getFirmsFromIDB();
      if (idbFirms) {
        const idbFirm = idbFirms.find(f => f.slug?.toLowerCase() === cleanSlug);
        if (this.isFirmFullyHydrated(idbFirm)) {
          this.mergeFirmsIntoMemory([idbFirm!]);
          if (now - lastFetch > 3000) {
            this.fetchSingleFirmFromSupabase(cleanSlug).catch(() => {});
          }
          return { success: true, firm: ensureFirmSubscription(idbFirm!) };
        }
      }
    } catch {}

    // 3. Fetch directly from Supabase first so every visitor globally gets the authoritative firm data
    const supaRes = await this.fetchSingleFirmFromSupabase(cleanSlug);
    if (supaRes.success && supaRes.firm) {
      return supaRes;
    }

    return this.fetchSingleFirmFromServer(cleanSlug);
  }

  // Fetch a single firm from local Express server (/api/firms/:slug) in ~10ms
  public async fetchSingleFirmFromServer(slug: string): Promise<{ success: boolean; firm?: LawFirm }> {
    if (typeof fetch === 'undefined') return { success: false };
    try {
      const res = await fetch(`/api/firms/${encodeURIComponent(slug)}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const firm = ensureFirmSubscription(json.data);
          this.mergeFirmsIntoMemory([firm]);
          this.saveToLocalCache(false);
          return { success: true, firm };
        }
      }
    } catch {}
    return { success: false };
  }

  // Fetch a single firm by its slug directly from Supabase
  public async fetchSingleFirmFromSupabase(slug: string): Promise<{ success: boolean; firm?: LawFirm; message?: string }> {
    const config = getStoredSupabaseConfig();
    if (!config.url || !config.anonKey) {
      return { success: false, message: 'Supabase غير مهيأ' };
    }

    const cleanSlug = slug.trim();
    this.lastSupabaseFetchBySlug.set(cleanSlug.toLowerCase(), Date.now());

    try {
      const client = getSupabase();
      const tableName = config.tableName || 'law_firms';
      let { data, error } = await client
        .from(tableName)
        .select('*')
        .ilike('slug', cleanSlug)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        const firm = this.mapSupabaseRowToFirm(data);

        // Replace or insert in memoryFirms
        const idx = this.memoryFirms.findIndex(f => f.slug.toLowerCase() === firm.slug.toLowerCase());
        if (idx >= 0) {
          this.memoryFirms[idx] = firm;
        } else {
          this.memoryFirms.push(firm);
        }

        this.saveToLocalCache(false);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('aladl_firm_data_synced', { detail: { slug: firm.slug, firm } }));
        }
        return { success: true, firm };
      }
      return { success: false, message: 'المكتب غير موجود سحابياً' };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  }

  private saveToLocalCache(syncToCloud = false): void {
    if (typeof window === 'undefined') return;
    
    // Immediately notify UI listeners in 0ms
    window.dispatchEvent(new CustomEvent('aladl_firms_updated', { detail: this.memoryFirms }));

    if ((this as any)._saveTimeout) clearTimeout((this as any)._saveTimeout);
    
    (this as any)._saveTimeout = setTimeout(async () => {
      try {
        // 1. Save FULL firms (including all base64 images & data) to IndexedDB
        saveFirmsToIDB(this.memoryFirms).catch(() => {});

        // 2. Save lightweight firms WITH text data (settings, partners, practiceAreas, offices, blogPosts) to localStorage for 0ms synchronous startup
        const firmsForStorage = this.memoryFirms.map(firm => {
          firm.customDomain = '';
          return { 
            ...firm,
            customDomain: '',
            data: stripLargeBase64ForLocalStorage(firm.data),
            hasFullData: !!(firm.data && (firm.data.partners?.length || firm.data.blogPosts?.length || firm.data.offices?.length))
          };
        });
        try {
          localStorage.setItem(STORAGE_KEY_FIRMS, JSON.stringify(firmsForStorage));
        } catch {
          // Fallback if localStorage is completely full
          const minimalFirms = this.memoryFirms.map(({ data, ...rest }) => ({ ...rest, customDomain: '' }));
          try {
            localStorage.setItem(STORAGE_KEY_FIRMS, JSON.stringify(minimalFirms));
          } catch {}
        }

        // Only push to cloud if explicitly triggered by an admin edit
        if (syncToCloud) {
          this.syncAllToSupabase().catch(e => console.warn('Supabase sync failed', e));
        }
      } catch (e) {
        console.warn('Failed to save firms to local cache', e);
      }
    }, 150);
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
      this.mergeFirmsIntoMemory(fetchedFirms);
      this.saveToLocalCache(false);
    }
  }

  // Fetch all firms directly from Supabase (Primary Global Source of Truth)
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
        const now = Date.now();
        const loadedFirms: LawFirm[] = data.map((row: any) => {
          const mapped = this.mapSupabaseRowToFirm(row);
          this.lastSupabaseFetchBySlug.set(mapped.slug.toLowerCase(), now);
          return mapped;
        });

        // Replace memoryFirms with the authoritative list from Supabase so all visitors globally see the exact same firms and data
        this.memoryFirms = loadedFirms;
        this.saveToLocalCache(false);
        this.pushToServer(loadedFirms).catch(() => {});

        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('aladl_firms_updated', { detail: this.memoryFirms }));
        }

        return { success: true, count: this.memoryFirms.length, message: `تم جلب ${loadedFirms.length} مكتب من Supabase بنجاح` };
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

  // Safely sync sub-tables in parallel without blocking
  private async syncSubTables(client: any, firm: LawFirm): Promise<{ [key: string]: number }> {
    const stats: { [key: string]: number } = {};
    try {
      const data = firm.data;
      if (!data) return stats;

      const subPromises: Promise<any>[] = [];

      // 1. Partners
      if (Array.isArray(data.partners) && data.partners.length > 0) {
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
        subPromises.push(
          client.from('partners').upsert(rows, { onConflict: 'id' }).then((res: any) => {
            if (!res.error) stats.partners = rows.length;
          }).catch(() => {})
        );
      }

      // 2. Practice areas
      if (Array.isArray(data.practiceAreas) && data.practiceAreas.length > 0) {
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
        subPromises.push(
          client.from('practice_areas').upsert(rows, { onConflict: 'id' }).then((res: any) => {
            if (!res.error) stats.practiceAreas = rows.length;
          }).catch(() => {})
        );
      }

      // 3. Blog posts
      if (Array.isArray(data.blogPosts) && data.blogPosts.length > 0) {
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
        subPromises.push(
          client.from('blog_posts').upsert(rows, { onConflict: 'id' }).then((res: any) => {
            if (!res.error) stats.blogPosts = rows.length;
          }).catch(() => {})
        );
      }

      // 4. Testimonials
      if (Array.isArray(data.testimonials) && data.testimonials.length > 0) {
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
        subPromises.push(
          client.from('testimonials').upsert(rows, { onConflict: 'id' }).then((res: any) => {
            if (!res.error) stats.testimonials = rows.length;
          }).catch(() => {})
        );
      }

      // 5. Office locations
      if (Array.isArray(data.offices) && data.offices.length > 0) {
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
        subPromises.push(
          client.from('office_locations').upsert(rows, { onConflict: 'id' }).then((res: any) => {
            if (!res.error) stats.offices = rows.length;
          }).catch(() => {})
        );
      }

      // 6. Case Studies
      if (Array.isArray(data.caseStudies) && data.caseStudies.length > 0) {
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
        subPromises.push(
          client.from('case_studies').upsert(rows, { onConflict: 'id' }).then((res: any) => {
            if (!res.error) stats.caseStudies = rows.length;
          }).catch(() => {})
        );
      }

      // 7. Subscriptions
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
        subPromises.push(
          client.from('firm_subscriptions').upsert(subRow, { onConflict: 'id' }).then((res: any) => {
            if (!res.error) stats.subscriptions = 1;
          }).catch(() => {})
        );
      }

      // 8. Custom Domains
      if (firm.customDomain) {
        const domainRow = {
          id: toValidUUID(`${firm.slug}_domain`),
          firm_slug: firm.slug,
          custom_domain: firm.customDomain,
          status: 'active',
          ssl_active: true,
          cname_target: 'custom.aladl.law',
        };
        subPromises.push(
          client.from('domain_mappings').upsert(domainRow, { onConflict: 'custom_domain' }).then((res: any) => {
            if (!res.error) stats.domains = 1;
          }).catch(() => {})
        );
      }

      // Execute all sub-tables in parallel with timeout safety
      await Promise.allSettled(subPromises);
    } catch (e) {
      console.warn('Sub-table fast sync caught non-blocking issue:', e);
    }
    return stats;
  }

  // Ultra-fast targeted delta sync: saves ONLY the specific edit (partner, practiceArea, caseStudy, testimonial, blog, office, message, or settings) immediately to Supabase
  public async syncFirmDeltaToSupabase(
    slug: string,
    delta: {
      type:
        | 'partner_upsert'
        | 'partner_delete'
        | 'practice_upsert'
        | 'practice_delete'
        | 'caseStudy_upsert'
        | 'caseStudy_delete'
        | 'testimonial_upsert'
        | 'testimonial_delete'
        | 'blog_upsert'
        | 'blog_delete'
        | 'office_upsert'
        | 'office_delete'
        | 'message_upsert'
        | 'message_delete'
        | 'settings_update';
      item?: any;
      id?: string;
      sortOrder?: number;
      changedRootCols?: Record<string, any>;
    }
  ): Promise<{ success: boolean; durationMs: number }> {
    const startTime = performance.now();
    const cleanSlug = (slug || this.getActiveFirmSlug()).trim().toLowerCase();
    const firm = this.memoryFirms.find((f) => f.slug.toLowerCase() === cleanSlug);
    if (!firm) {
      return { success: false, durationMs: 0 };
    }

    const nowIso = new Date().toISOString();
    firm.updatedAt = nowIso;
    if (firm.data) {
      firm.data.savedAt = nowIso;
    }

    // Defer local cache write off the critical path
    this.saveToLocalCache(false);

    const config = getStoredSupabaseConfig();
    if (!config.url || !config.anonKey) {
      return { success: false, durationMs: 0 };
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('aladl_cloud_sync_status', { detail: { status: 'saving', slug: firm.slug, type: delta.type } }));
    }

    try {
      const client = getSupabase();
      const tableName = config.tableName || 'law_firms';

      // 1. Build minimal law_firms update payload (ONLY changed root columns + updated data JSONB)
      const updatePayload: Record<string, any> = {
        data: {
          ...firm.data,
          customDomain: firm.customDomain || null,
          isDefaultPublic: firm.isDefaultPublic ?? (firm.slug === this.getDefaultPublicFirmSlug()),
          subscription: firm.subscription,
        },
        updated_at: nowIso,
      };

      if (delta.changedRootCols) {
        Object.assign(updatePayload, delta.changedRootCols);
      }

      // 2. Build targeted single-row sub-table operation (ONLY for the edited item!)
      let subTablePromise: Promise<any> = Promise.resolve();
      const p = delta.item;

      if (delta.type === 'partner_upsert' && p) {
        const partnerRow = {
          id: isValidUUID(p.id) ? p.id : toValidUUID(`${firm.slug}_partner_${p.id}`),
          firm_slug: firm.slug,
          name_ar: p.nameAr || p.name || '',
          name_en: p.nameEn || p.name || '',
          role_ar: p.roleAr || p.title || p.role || '',
          role_en: p.roleEn || p.titleEn || '',
          experience_years: p.experienceYears ?? 10,
          bio_ar: p.bioAr || p.bio || '',
          bio_en: p.bioEn || '',
          image_url: p.imageUrl || p.image || '',
          email: p.email || '',
          phone: p.phone || '',
          specializations: Array.isArray(p.specializations) ? p.specializations : (p.specialty ? [p.specialty] : []),
          is_senior: p.isPartner !== false,
          sort_order: delta.sortOrder ?? 0,
        };
        subTablePromise = Promise.resolve(client.from('partners').upsert(partnerRow, { onConflict: 'id' })).catch(() => {});
      } else if (delta.type === 'partner_delete' && delta.id) {
        const targetId = isValidUUID(delta.id) ? delta.id : toValidUUID(`${firm.slug}_partner_${delta.id}`);
        subTablePromise = Promise.resolve(client.from('partners').delete().eq('id', targetId)).catch(() => {});
      } else if (delta.type === 'practice_upsert' && p) {
        const paRow = {
          id: isValidUUID(p.id) ? p.id : toValidUUID(`${firm.slug}_pa_${p.id}`),
          firm_slug: firm.slug,
          title_ar: p.titleAr || p.title || '',
          title_en: p.titleEn || '',
          description_ar: p.shortDesc || p.descriptionAr || p.description || '',
          description_en: p.shortDescEn || p.descriptionEn || '',
          icon_name: p.iconName || 'Scale',
          features_ar: Array.isArray(p.keyServices) ? p.keyServices : (Array.isArray(p.featuresAr) ? p.featuresAr : []),
          features_en: Array.isArray(p.keyServicesEn) ? p.keyServicesEn : (Array.isArray(p.featuresEn) ? p.featuresEn : []),
          sort_order: delta.sortOrder ?? 0,
        };
        subTablePromise = Promise.resolve(client.from('practice_areas').upsert(paRow, { onConflict: 'id' })).catch(() => {});
      } else if (delta.type === 'practice_delete' && delta.id) {
        const targetId = isValidUUID(delta.id) ? delta.id : toValidUUID(`${firm.slug}_pa_${delta.id}`);
        subTablePromise = Promise.resolve(client.from('practice_areas').delete().eq('id', targetId)).catch(() => {});
      } else if (delta.type === 'caseStudy_upsert' && p) {
        const csRow = {
          id: isValidUUID(p.id) ? p.id : toValidUUID(`${firm.slug}_case_${p.id}`),
          firm_slug: firm.slug,
          title_ar: p.title || p.titleAr || '',
          title_en: p.titleEn || '',
          category_ar: p.category || p.categoryAr || '',
          category_en: p.categoryEn || '',
          summary_ar: p.summary || p.summaryAr || '',
          summary_en: p.summaryEn || '',
          outcome_ar: p.outcome || p.outcomeAr || '',
          outcome_en: p.outcomeEn || '',
          value_sar: typeof p.value === 'number' ? p.value : (parseFloat(String(p.value || 0).replace(/[^0-9.]/g, '')) || 0),
          year: parseInt(String(p.year)) || new Date().getFullYear(),
        };
        subTablePromise = Promise.resolve(client.from('case_studies').upsert(csRow, { onConflict: 'id' })).catch(() => {});
      } else if (delta.type === 'caseStudy_delete' && delta.id) {
        const targetId = isValidUUID(delta.id) ? delta.id : toValidUUID(`${firm.slug}_case_${delta.id}`);
        subTablePromise = Promise.resolve(client.from('case_studies').delete().eq('id', targetId)).catch(() => {});
      } else if (delta.type === 'testimonial_upsert' && p) {
        const testRow = {
          id: isValidUUID(p.id) ? p.id : toValidUUID(`${firm.slug}_test_${p.id}`),
          firm_slug: firm.slug,
          client_name_ar: p.clientNameAr || p.clientName || '',
          client_name_en: p.clientNameEn || '',
          company_ar: p.companyAr || p.company || '',
          company_en: p.companyEn || '',
          role_ar: p.clientRole || p.roleAr || p.role || '',
          role_en: p.clientRoleEn || p.roleEn || '',
          comment_ar: p.content || p.commentAr || p.comment || '',
          comment_en: p.contentEn || p.commentEn || '',
          rating: p.rating || 5,
          image_url: p.imageUrl || p.avatar || '',
        };
        subTablePromise = Promise.resolve(client.from('testimonials').upsert(testRow, { onConflict: 'id' })).catch(() => {});
      } else if (delta.type === 'testimonial_delete' && delta.id) {
        const targetId = isValidUUID(delta.id) ? delta.id : toValidUUID(`${firm.slug}_test_${delta.id}`);
        subTablePromise = Promise.resolve(client.from('testimonials').delete().eq('id', targetId)).catch(() => {});
      } else if (delta.type === 'blog_upsert' && p) {
        const blogRow = {
          id: isValidUUID(p.id) ? p.id : toValidUUID(`${firm.slug}_blog_${p.id}`),
          firm_slug: firm.slug,
          title_ar: p.titleAr || p.title || '',
          title_en: p.titleEn || '',
          content_ar: p.contentAr || p.content || '',
          content_en: p.contentEn || '',
          excerpt_ar: p.excerptAr || p.excerpt || '',
          excerpt_en: p.excerptEn || '',
          category: p.category || 'أنظمة وقوانين',
          author_name: p.author || p.authorName || '',
          image_url: p.image || p.imageUrl || '',
          read_time_minutes: parseInt(String(p.readTime || 5)) || 5,
        };
        subTablePromise = Promise.resolve(client.from('blog_posts').upsert(blogRow, { onConflict: 'id' })).catch(() => {});
      } else if (delta.type === 'blog_delete' && delta.id) {
        const targetId = isValidUUID(delta.id) ? delta.id : toValidUUID(`${firm.slug}_blog_${delta.id}`);
        subTablePromise = Promise.resolve(client.from('blog_posts').delete().eq('id', targetId)).catch(() => {});
      } else if (delta.type === 'office_upsert' && p) {
        const officeRow = {
          id: isValidUUID(p.id) ? p.id : toValidUUID(`${firm.slug}_office_${p.id}`),
          firm_slug: firm.slug,
          city_ar: p.cityAr || p.city || '',
          city_en: p.cityEn || '',
          country_ar: p.countryAr || 'المملكة العربية السعودية',
          country_en: p.countryEn || 'Saudi Arabia',
          address_ar: p.addressAr || p.address || '',
          address_en: p.addressEn || '',
          phone: p.phone || '',
          email: p.email || '',
          map_embed_url: p.mapEmbedUrl || '',
          is_headquarter: !!p.isHeadquarter,
        };
        subTablePromise = Promise.resolve(client.from('office_locations').upsert(officeRow, { onConflict: 'id' })).catch(() => {});
      } else if (delta.type === 'office_delete' && delta.id) {
        const targetId = isValidUUID(delta.id) ? delta.id : toValidUUID(`${firm.slug}_office_${delta.id}`);
        subTablePromise = Promise.resolve(client.from('office_locations').delete().eq('id', targetId)).catch(() => {});
      }

      // 3. Execute direct single-row update on law_firms + targeted single-row sub-table update in parallel
      const [mainRes] = await Promise.all([
        client.from(tableName).update(updatePayload).eq('slug', firm.slug),
        subTablePromise,
      ]);

      // Fallback if firm wasn't in law_firms yet
      if (mainRes.error) {
        await client.from(tableName).upsert({
          id: isValidUUID(firm.id) ? firm.id : toValidUUID(firm.id || firm.slug),
          slug: firm.slug,
          name_ar: firm.nameAr,
          ...updatePayload,
        }, { onConflict: 'slug' });
      }

      const elapsed = Math.round(performance.now() - startTime);
      this.lastSupabaseFetchBySlug.set(firm.slug.toLowerCase(), Date.now());

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('aladl_cloud_sync_status', { detail: { status: 'saved', slug: firm.slug, durationMs: elapsed, type: delta.type } }));
      }

      return { success: true, durationMs: elapsed };
    } catch {
      const elapsed = Math.round(performance.now() - startTime);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('aladl_cloud_sync_status', { detail: { status: 'error', slug: firm.slug, durationMs: elapsed } }));
      }
      return { success: false, durationMs: elapsed };
    }
  }

  // Sync a single firm to Supabase with direct fast upsert (matching exact Supabase law_firms schema)
  public async syncFirmToSupabase(firm: LawFirm, syncAllSubTables = false): Promise<{ success: boolean; message: string }> {
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

      const resolvedId: string = isValidUUID(firm.id) ? firm.id : toValidUUID(firm.id || firm.slug);
      firm.id = resolvedId;

      // Exact schema columns of law_firms in Supabase (avoiding non-existent country_ar / custom_domain top-level columns so Tier 1 succeeds on the first try in ~80ms!)
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
        is_default_public: firm.isDefaultPublic ?? (firm.slug === this.getDefaultPublicFirmSlug()),
        subscription: firm.subscription || {
          status: "active",
          isSiteActive: true,
          planTier: "professional",
          annualFee: 3500,
          currency: "SAR"
        },
        data: {
          ...firm.data,
          countryAr: firm.countryAr || firm.data?.settings?.countryAr || 'المملكة العربية السعودية',
          countryEn: firm.countryEn || firm.data?.settings?.countryEn || 'Saudi Arabia',
          customDomain: firm.customDomain || null,
          isDefaultPublic: firm.isDefaultPublic ?? (firm.slug === this.getDefaultPublicFirmSlug()),
          subscription: firm.subscription,
        },
        updated_at: new Date().toISOString(),
      };

      let syncSucceeded = false;
      let lastError: any = null;

      // Tier 1: Fast direct upsert with onConflict: 'slug' (completes in ~80ms!)
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

      // Tier 2: Direct update by slug if upsert had a conflict on id
      if (!syncSucceeded) {
        const { id: _omitId, ...updateFields } = fullRecord;
        try {
          const updateRes = await client
            .from(tableName)
            .update(updateFields)
            .eq('slug', firm.slug)
            .select('id, slug')
            .maybeSingle();

          if (!updateRes.error && updateRes.data) {
            syncSucceeded = true;
            if (updateRes.data.id) firm.id = String(updateRes.data.id);
          } else if (updateRes.error) {
            lastError = updateRes.error;
          }
        } catch (e: any) {
          lastError = e;
        }
      }

      // Tier 3: Minimal core columns fallback
      if (!syncSucceeded && lastError) {
        const coreRecord: Record<string, any> = {
          slug: firm.slug,
          name_ar: firm.nameAr,
          data: fullRecord.data,
          updated_at: fullRecord.updated_at,
        };
        try {
          const coreRes = await client.from(tableName).upsert(coreRecord, { onConflict: 'slug' });
          if (!coreRes.error) {
            syncSucceeded = true;
          } else {
            const u = await client.from(tableName).update(coreRecord).eq('slug', firm.slug);
            if (!u.error) syncSucceeded = true;
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

      this.saveToLocalCache(false);

      // Run sub-table sync in background without blocking the user response unless explicitly requested
      if (syncAllSubTables) {
        this.syncSubTables(client, firm).catch(() => {});
      }

      return { 
        success: true, 
        message: `تم حفظ وتحديث بيانات مكتب "${firm.nameAr}" في قاعدة البيانات السحابية فوراً!` 
      };
    } catch (err: any) {
      return { 
        success: false, 
        message: formatSupabaseError(err, config.tableName || 'law_firms') 
      };
    }
  }

  // Sync ALL firms to Supabase at lightning speed with bulk batching
  public async syncAllToSupabase(): Promise<{ success: boolean; message: string; count?: number; durationMs?: number }> {
    const startTime = performance.now();
    const config = getStoredSupabaseConfig();
    if (!config.url || !config.anonKey) {
      return { 
        success: false, 
        message: 'الرجاء إدخال بيانات الربط مع Supabase (Project URL & Anon Key) أولاً وحفظها.' 
      };
    }

    try {
      const client = getSupabase();
      const tableName = config.tableName || 'law_firms';

      // 1. Prepare bulk records for all firms matching exact law_firms schema
      const bulkRecords = this.memoryFirms.map((firm) => {
        ensureFirmSubscription(firm);
        const resolvedId = isValidUUID(firm.id) ? firm.id : toValidUUID(firm.id || firm.slug);
        return {
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
          is_default_public: firm.isDefaultPublic ?? (firm.slug === this.getDefaultPublicFirmSlug()),
          subscription: firm.subscription || {
            status: "active",
            isSiteActive: true,
            planTier: "professional",
            annualFee: 3500,
            currency: "SAR"
          },
          data: {
            ...firm.data,
            countryAr: firm.countryAr || firm.data?.settings?.countryAr || 'المملكة العربية السعودية',
            countryEn: firm.countryEn || firm.data?.settings?.countryEn || 'Saudi Arabia',
            customDomain: firm.customDomain || null,
            isDefaultPublic: firm.isDefaultPublic ?? (firm.slug === this.getDefaultPublicFirmSlug()),
            subscription: firm.subscription,
          },
          updated_at: new Date().toISOString(),
        };
      });

      // 2. High-speed single bulk upsert
      let bulkSucceeded = false;
      try {
        const { error: bulkErr } = await client
          .from(tableName)
          .upsert(bulkRecords, { onConflict: 'slug' });

        if (!bulkErr) {
          bulkSucceeded = true;
        }
      } catch {}

      // 3. Fallback to parallel individual upserts if bulk failed
      if (!bulkSucceeded) {
        const parallelResults = await Promise.allSettled(
          this.memoryFirms.map(firm => this.syncFirmToSupabase(firm))
        );
        const successCount = parallelResults.filter(r => r.status === 'fulfilled' && r.value.success).length;
        if (successCount === 0) {
          const firstErr = parallelResults.find(r => r.status === 'fulfilled' && !r.value.success);
          const errMsg = firstErr && firstErr.status === 'fulfilled' ? firstErr.value.message : 'فشلت المزامنة';
          return { success: false, message: errMsg };
        }
      }

      // 4. Non-blocking parallel sync of sub-tables
      Promise.allSettled(this.memoryFirms.map(f => this.syncSubTables(client, f))).catch(() => {});

      // 5. Cleanup deleted firms in background
      try {
        const activeSlugs = this.memoryFirms.map(f => f.slug);
        if (activeSlugs.length > 0) {
          Promise.resolve(client.from(tableName).delete().not('slug', 'in', activeSlugs)).catch(() => {});
        }
      } catch {}

      this.saveToLocalCache();
      this.pushToServer().catch(() => {});

      const elapsed = Math.round(performance.now() - startTime);
      const secondsFormatted = (elapsed / 1000).toFixed(2);

      return { 
        success: true, 
        count: this.memoryFirms.length, 
        durationMs: elapsed,
        message: `⚡️ تمت المزامنة السحابية الفائقة لكافة (${this.memoryFirms.length}) مكاتب خلال ${secondsFormatted} ثانية بنجاح!` 
      };
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
            customDomain: row.custom_domain || row.data?.customDomain || '',
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
        
        // Save to cache and immediately dispatch event so UI updates instantly with newly fetched data
        this.saveToLocalCache();
        if (typeof window !== 'undefined') {
           window.dispatchEvent(new CustomEvent('aladl_firms_updated', { detail: this.memoryFirms }));
        }

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

  public cleanDomain(domain: string): string {
    if (!domain) return '';
    let cleaned = domain.trim().toLowerCase();
    // Remove protocol http:// or https://
    cleaned = cleaned.replace(/^https?:\/\//i, '');
    // Remove trailing slashes and paths
    cleaned = cleaned.split('/')[0];
    // Remove port numbers e.g. :3000
    cleaned = cleaned.split(':')[0];
    return cleaned;
  }

  public getFirmByDomain(hostOrDomain: string): LawFirm | undefined {
    const target = this.cleanDomain(hostOrDomain);
    if (!target) return undefined;
    const targetWithoutWww = target.replace(/^www\./i, '');
    
    return this.getAllFirms().find(f => {
      if (!f.customDomain) return false;
      const firmDom = this.cleanDomain(f.customDomain);
      const firmDomWithoutWww = firmDom.replace(/^www\./i, '');
      return firmDom === target || firmDomWithoutWww === targetWithoutWww;
    });
  }

  /**
   * Get concise official domain representation for a firm
   * e.g. "nahwi.mohamoon.sa" or custom domain "nahwi-law.com"
   */
  public getFirmDisplayDomain(firmOrSlug?: LawFirm | string | null): string {
    if (!firmOrSlug) {
      const activeSlug = this.getActiveFirmSlug();
      const activeFirm = this.getFirmBySlug(activeSlug);
      if (activeFirm?.customDomain) return this.cleanDomain(activeFirm.customDomain);
      return `${activeSlug || 'firm'}.mohamoon.sa`;
    }

    let firm: LawFirm | undefined;
    if (typeof firmOrSlug === 'string') {
      firm = this.getFirmBySlug(firmOrSlug);
    } else {
      firm = firmOrSlug;
    }

    if (firm?.customDomain) {
      return this.cleanDomain(firm.customDomain);
    }

    const slug = typeof firmOrSlug === 'string' ? firmOrSlug : firm?.slug || 'firm';
    return `${slug}.mohamoon.sa`;
  }

  public async updateFirmCustomDomain(
    slug: string, 
    domain: string
  ): Promise<{ success: boolean; message: string; domain?: string }> {
    const firm = this.getFirmBySlug(slug);
    if (!firm) {
      return { success: false, message: 'المكتب المطلوب غير موجود.' };
    }

    const cleaned = this.cleanDomain(domain);
    
    // If clearing domain
    if (!cleaned) {
      firm.customDomain = '';
      this.setFirm(firm);
      this.saveToLocalCache();
      this.pushToServer();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('aladl_firms_updated', { detail: this.memoryFirms }));
      }
      // Sync in background to Supabase
      this.syncFirmToSupabase(firm).catch(() => {});
      return { success: true, message: 'تم إزالة ربط الدومين بنجاح.', domain: '' };
    }

    // Validate domain format (standard domain syntax)
    const domainRegex = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$/i;
    if (!domainRegex.test(cleaned)) {
      return { 
        success: false, 
        message: 'صيغة الدومين غير صحيحة. مثال صحيح: mylawfirm.com أو www.nahwi-law.sa' 
      };
    }

    // Check if domain is already taken by another firm
    const existingFirmWithDomain = this.getFirmByDomain(cleaned);
    if (existingFirmWithDomain && existingFirmWithDomain.slug.toLowerCase() !== slug.toLowerCase()) {
      return { 
        success: false, 
        message: `الدومين (${cleaned}) مربوط بالفعل بمكتب آخر (${existingFirmWithDomain.nameAr}).` 
      };
    }

    firm.customDomain = cleaned;
    this.setFirm(firm);
    this.saveToLocalCache();
    this.pushToServer();

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('aladl_firms_updated', { detail: this.memoryFirms }));
    }

    // Sync to Supabase
    try {
      await this.syncFirmToSupabase(firm);
    } catch (e) {
      console.warn('Custom domain sync to Supabase encountered an error:', e);
    }

    return { 
      success: true, 
      message: `تم ربط الدومين (${cleaned}) بالمكتب بنجاح وتحديث إعدادات التوجيه!`, 
      domain: cleaned 
    };
  }

  public hasFirmInMemory(slug: string): boolean {
    if (!slug) return false;
    const cleanSlug = slug.trim().toLowerCase();
    return this.memoryFirms.some((f) => f.slug.toLowerCase() === cleanSlug);
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

  // Save or update an existing law firm immediately to Supabase
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

    // 1. Defer local cache and server sync to background so Supabase save is immediate
    this.saveToLocalCache(false);

    // 2. Sync only the updated firm to Supabase immediately
    const supaRes = await this.syncFirmToSupabase(updatedFirm, false);

    return {
      success: true,
      message: 'تم حفظ التعديلات في قاعدة البيانات السحابية فوراً!',
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

    const cAr = info.countryAr || 'المملكة العربية السعودية';
    const cEn = info.countryEn || 'Saudi Arabia';
    const cityAr = info.cityAr || 'الرياض';
    const cityEn = info.cityEn || 'Riyadh';

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
      countryAr: cAr,
      countryEn: cEn,
      cityAr: cityAr,
      cityEn: cityEn,
      addressAr: `${cityAr}، ${cAr}`,
      addressEn: `${cityEn}, ${cEn}`,
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

    const newFirm: LawFirm = {
      id: toValidUUID(`firm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`),
      slug: finalSlug,
      nameAr: info.nameAr,
      nameEn: info.nameEn || 'Law Firm',
      taglineAr: info.taglineAr || 'حلول قانونية واستشارات استراتيجية رائدة',
      taglineEn: 'Premier Legal Consultancy',
      cityAr: cityAr,
      cityEn: cityEn,
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
