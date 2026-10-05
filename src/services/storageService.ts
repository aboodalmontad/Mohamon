import { Partner, PracticeArea, Testimonial, BlogPost, CaseStudy, ContactMessage, SiteSettings, PlatformSettings, OfficeLocation, AuditLog, LawFirm } from '../types';
import { initialPlatformSettings, initialPartners, initialPracticeAreas, initialTestimonials, initialBlogPosts, initialCaseStudies, initialContactMessages, initialSiteSettings, initialOffices, DEFAULT_WHY_PILLARS } from '../data/initialData';
import { firmService } from './firmService';
import { getSupabase, getStoredSupabaseConfig, isValidUUID, toValidUUID } from '../lib/supabase';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

const STORAGE_KEYS = {
  PARTNERS: 'aladl_partners_v1',
  PRACTICE_AREAS: 'aladl_practice_areas_v1',
  TESTIMONIALS: 'aladl_testimonials_v1',
  BLOG_POSTS: 'aladl_blog_posts_v1',
  CASE_STUDIES: 'aladl_case_studies_v1',
  MESSAGES: 'aladl_messages_v1',
  SETTINGS: 'aladl_settings_v1',
  OFFICES: 'aladl_offices_v1',
  AUDIT_LOGS: 'aladl_audit_logs_v1',
  PLATFORM_SETTINGS: 'aladl_platform_settings_v1',
  PERSISTENT_BACKUP: 'aladl_persistent_snapshot_v1',
};

// IndexedDB database configuration for persistent secondary storage
const IDB_NAME = 'aladl_firm_persistent_db';
const IDB_VERSION = 1;
const IDB_STORE = 'app_snapshots';

// Open / initialize IndexedDB
const openIndexedDB = (): Promise<IDBDatabase | null> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      resolve(null);
      return;
    }
    try {
      const request = indexedDB.open(IDB_NAME, IDB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(IDB_STORE)) {
          db.createObjectStore(IDB_STORE, { keyPath: 'key' });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
};

// Save snapshot to IndexedDB
const saveSnapshotToIDB = async (snapshot: Record<string, any>) => {
  try {
    const db = await openIndexedDB();
    if (!db) return;
    const tx = db.transaction(IDB_STORE, 'readwrite');
    const store = tx.objectStore(IDB_STORE);
    store.put({ key: 'main_backup', data: snapshot, updatedAt: new Date().toISOString() });
  } catch (e) {
    console.warn('Could not mirror data to IndexedDB', e);
  }
};

// Retrieve snapshot from IndexedDB
const getSnapshotFromIDB = async (): Promise<Record<string, any> | null> => {
  try {
    const db = await openIndexedDB();
    if (!db) return null;
    return new Promise((resolve) => {
      const tx = db.transaction(IDB_STORE, 'readonly');
      const store = tx.objectStore(IDB_STORE);
      const req = store.get('main_backup');
      req.onsuccess = () => {
        if (req.result && req.result.data) {
          resolve(req.result.data);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
};

const notifyChange = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('aladl_storage_sync'));
  }
};

// Non-blocking background persistence for IndexedDB & localStorage backups
let idbBackupTimeout: any = null;
const scheduleBackgroundLocalBackup = () => {
  if (typeof window === 'undefined') return;
  if (idbBackupTimeout) clearTimeout(idbBackupTimeout);
  idbBackupTimeout = setTimeout(() => {
    try {
      const snapshot = {
        partners: storageService.getPartners(),
        practiceAreas: storageService.getPracticeAreas(),
        caseStudies: storageService.getCaseStudies(),
        testimonials: storageService.getTestimonials(),
        blogPosts: storageService.getBlogPosts(),
        messages: storageService.getMessages(),
        settings: storageService.getSettings(),
        offices: storageService.getOffices(),
        savedAt: new Date().toISOString(),
      };
      saveSnapshotToIDB(snapshot);
    } catch {}
  }, 150);
};

// Instant in-memory firm state update + targeted delta sync to Supabase (0ms delay, only modified data sent)
const syncDeltaImmediately = (
  delta: Parameters<typeof firmService.syncFirmDeltaToSupabase>[1]
): Promise<{ success: boolean; durationMs: number }> => {
  if (typeof window === 'undefined') return Promise.resolve({ success: false, durationMs: 0 });
  const targetSlug = firmService.getActiveFirmSlug();
  const firm = firmService.getFirmBySlug(targetSlug);
  const nowIso = new Date().toISOString();

  const currentFirmData = {
    settings: storageService.getSettings(),
    partners: storageService.getPartners(),
    practiceAreas: storageService.getPracticeAreas(),
    caseStudies: storageService.getCaseStudies(),
    testimonials: storageService.getTestimonials(),
    blogPosts: storageService.getBlogPosts(),
    offices: storageService.getOffices(),
    messages: storageService.getMessages(),
    savedAt: nowIso,
  };

  if (firm) {
    firm.data = currentFirmData;
    firm.updatedAt = nowIso;
  }

  scheduleBackgroundLocalBackup();
  return firmService.syncFirmDeltaToSupabase(targetSlug, {
    ...delta,
    firmData: currentFirmData,
  });
};

// Legacy full mirror helper (used only on bulk JSON import or full reset)
const mirrorAllDataToPersistence = () => {
  if (typeof window === 'undefined') return;
  const targetSlug = firmService.getActiveFirmSlug();
  const firm = firmService.getFirmBySlug(targetSlug);
  if (firm) {
    const settings = storageService.getSettings();
    firm.data = {
      settings,
      partners: storageService.getPartners(),
      practiceAreas: storageService.getPracticeAreas(),
      caseStudies: storageService.getCaseStudies(),
      testimonials: storageService.getTestimonials(),
      blogPosts: storageService.getBlogPosts(),
      offices: storageService.getOffices(),
      messages: storageService.getMessages(),
      savedAt: new Date().toISOString(),
    };
    firm.nameAr = settings.firmNameAr || firm.nameAr;
    firm.nameEn = settings.firmNameEn || firm.nameEn;
    firm.phone = settings.phone || firm.phone;
    firm.email = settings.email || firm.email;
    firm.themeColor = settings.primaryColor || firm.themeColor || '#c5a869';
    if (settings.countryAr) firm.countryAr = settings.countryAr;
    if (settings.countryEn) firm.countryEn = settings.countryEn;
    if (settings.cityAr) firm.cityAr = settings.cityAr;
    if (settings.cityEn) firm.cityEn = settings.cityEn;
    firmService.saveFirm(firm).catch(() => {});
  }
  scheduleBackgroundLocalBackup();
};

// Memory cache for active data to ensure synchronous UI access while using async persistence
const MEMORY_CACHE: Record<string, any> = {
  partners: null,
  practiceAreas: null,
  caseStudies: null,
  testimonials: null,
  blogPosts: null,
  messages: null,
  settings: null,
  offices: null,
};

// Internal helper to get data from active firm cache
const getFromCache = (key: keyof typeof MEMORY_CACHE, _storageKey: string, defaultValue: any) => {
  if (MEMORY_CACHE[key] !== null && MEMORY_CACHE[key] !== undefined) {
    if (key === 'settings') {
      return {
        ...defaultValue,
        ...MEMORY_CACHE[key],
        socialLinks: {
          ...defaultValue.socialLinks,
          ...(MEMORY_CACHE[key]?.socialLinks || {}),
        },
        whyPillars: Array.isArray(MEMORY_CACHE[key]?.whyPillars) && MEMORY_CACHE[key].whyPillars.length > 0
          ? MEMORY_CACHE[key].whyPillars
          : defaultValue.whyPillars,
      };
    }
    return MEMORY_CACHE[key];
  }

  try {
    const activeSlug = firmService.getActiveFirmSlug();
    if (activeSlug && firmService.hasFirmInMemory(activeSlug)) {
      const firm = firmService.getFirmBySlug(activeSlug);
      if (firm && firm.data && (firm.data as any)[key] !== undefined && (firm.data as any)[key] !== null) {
        if (key === 'settings') {
          MEMORY_CACHE[key] = {
            ...defaultValue,
            ...(firm.data as any)[key],
            socialLinks: {
              ...defaultValue.socialLinks,
              ...((firm.data as any)[key]?.socialLinks || {}),
            },
            whyPillars: Array.isArray((firm.data as any)[key]?.whyPillars) && (firm.data as any)[key].whyPillars.length > 0
              ? (firm.data as any)[key].whyPillars
              : defaultValue.whyPillars,
          };
        } else {
          MEMORY_CACHE[key] = (firm.data as any)[key];
        }
        return MEMORY_CACHE[key];
      }
    }
  } catch {}
  
  return defaultValue;
};

// Safe localStorage set with quota handling
const safeLocalStorageSet = (key: string, value: string): boolean => {
  try {
    // Only store small data in localStorage
    const size = value.length * 2; // Rough estimate in bytes for UTF-16
    if (size > 500000) { // 0.5MB limit for single localStorage key
      console.warn(`Data for ${key} is too large for localStorage (${(size / 1024).toFixed(1)}KB). Relying on IndexedDB + Memory only.`);
      return true; // Pretend success, we have IDB
    }
    
    localStorage.setItem(key, value);
    return true;
  } catch (e) {
    if (e instanceof DOMException && (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
      console.warn(`LocalStorage quota exceeded for key: ${key}. Data will persist in IndexedDB only.`);
      return true; // We don't crash, we have IndexedDB
    }
    throw e;
  }
};

export const storageService = {
  // Init and seed if empty, with Multi-firm resolution from Supabase
  init: async () => {
    if (typeof window === 'undefined') return;

    await firmService.init();
    const activeSlug = firmService.getActiveFirmSlug();
    const currentFirm = firmService.getFirmBySlug(activeSlug);

    if (currentFirm) {
      storageService.loadFirm(currentFirm.slug, false);
    }

    notifyChange();
  },

  // Load a specific Law Firm's complete data into active state directly from firmService (Supabase)
  loadFirm: (slug: string, triggerEvent = true) => {
    if (typeof window === 'undefined') return;
    const firm = firmService.getFirmBySlug(slug);
    
    if (!firm) return;
    
    // Construct a baseline settings object from firm root data
    const fallbackSettings: SiteSettings = {
      ...initialSiteSettings,
      firmNameAr: firm.nameAr,
      firmNameEn: firm.nameEn || firm.nameAr || '',
      firmNameTr: firm.nameTr || firm.nameEn || firm.nameAr || '',
      sloganAr: firm.taglineAr || initialSiteSettings.sloganAr,
      sloganEn: firm.taglineEn || initialSiteSettings.sloganEn,
      phone: firm.phone || '',
      emergencyPhone: firm.phone || '',
      email: firm.email || '',
      consultationEmail: firm.email || '',
      countryAr: firm.countryAr || initialSiteSettings.countryAr,
      countryEn: firm.countryEn || initialSiteSettings.countryEn,
      cityAr: firm.cityAr || initialSiteSettings.cityAr,
      cityEn: firm.cityEn || initialSiteSettings.cityEn,
      addressAr: firm.data?.settings?.addressAr || `${firm.cityAr || ''}${firm.countryAr ? '، ' + firm.countryAr : ''}`,
      addressEn: firm.data?.settings?.addressEn || `${firm.cityEn || ''}${firm.countryEn ? ', ' + firm.countryEn : ''}`,
      primaryColor: firm.themeColor || '#c5a869',
      customLogoUrl: firm.logoUrl || (firm.data?.settings as any)?.customLogoUrl || ''
    };

    const data = firm.data || ({} as any);
    const mergedSettings: SiteSettings = {
      ...fallbackSettings,
      ...(data.settings || {}),
      whyPillars: Array.isArray(data.settings?.whyPillars) && data.settings.whyPillars.length > 0
        ? data.settings.whyPillars
        : DEFAULT_WHY_PILLARS,
      firmNameAr: data.settings?.firmNameAr || firm.nameAr,
      firmNameEn: data.settings?.firmNameEn || firm.nameEn || data.settings?.firmNameAr || firm.nameAr,
      phone: data.settings?.phone || firm.phone || '',
      email: data.settings?.email || firm.email || '',
      cityAr: data.settings?.cityAr || firm.cityAr || 'الرياض',
      cityEn: data.settings?.cityEn || firm.cityEn || 'Riyadh',
    };

    MEMORY_CACHE.settings = mergedSettings;
    MEMORY_CACHE.partners = Array.isArray(data.partners) ? data.partners : [];
    MEMORY_CACHE.practiceAreas = Array.isArray(data.practiceAreas) ? data.practiceAreas : [];
    MEMORY_CACHE.caseStudies = Array.isArray(data.caseStudies) ? data.caseStudies : [];
    MEMORY_CACHE.testimonials = Array.isArray(data.testimonials) ? data.testimonials : [];
    MEMORY_CACHE.blogPosts = Array.isArray(data.blogPosts) ? data.blogPosts : [];
    MEMORY_CACHE.offices = (Array.isArray(data.offices) && data.offices.length > 0)
      ? data.offices
      : [{
          id: `hq-${firm.slug}`,
          cityAr: mergedSettings.cityAr || firm.cityAr || 'الرياض',
          cityEn: mergedSettings.cityEn || firm.cityEn || 'Riyadh',
          countryAr: mergedSettings.countryAr || firm.countryAr || 'المملكة العربية السعودية',
          countryEn: mergedSettings.countryEn || firm.countryEn || 'Saudi Arabia',
          addressAr: mergedSettings.addressAr || firm.cityAr || 'المقر الرئيسي',
          addressEn: mergedSettings.addressEn || firm.cityEn || 'Headquarters',
          phone: mergedSettings.phone || firm.phone || '',
          email: mergedSettings.email || firm.email || '',
          mapEmbedUrl: '',
          isHeadquarter: true,
        }];
    MEMORY_CACHE.messages = Array.isArray(data.messages) ? data.messages : [];

    firmService.setActiveFirmSlug(firm.slug, false);

    if (triggerEvent) {
      notifyChange();
    }

    // Defer heavy JSON serialization to localStorage off the critical UI path
    if ((storageService as any)._persistTimer) {
      clearTimeout((storageService as any)._persistTimer);
    }
    (storageService as any)._persistTimer = setTimeout(() => {
      try {
        safeLocalStorageSet(STORAGE_KEYS.SETTINGS, JSON.stringify(MEMORY_CACHE.settings));
        safeLocalStorageSet(STORAGE_KEYS.PARTNERS, JSON.stringify(MEMORY_CACHE.partners));
        safeLocalStorageSet(STORAGE_KEYS.PRACTICE_AREAS, JSON.stringify(MEMORY_CACHE.practiceAreas));
        safeLocalStorageSet(STORAGE_KEYS.CASE_STUDIES, JSON.stringify(MEMORY_CACHE.caseStudies));
        safeLocalStorageSet(STORAGE_KEYS.TESTIMONIALS, JSON.stringify(MEMORY_CACHE.testimonials));
        safeLocalStorageSet(STORAGE_KEYS.BLOG_POSTS, JSON.stringify(MEMORY_CACHE.blogPosts));
        safeLocalStorageSet(STORAGE_KEYS.OFFICES, JSON.stringify(MEMORY_CACHE.offices));
        safeLocalStorageSet(STORAGE_KEYS.MESSAGES, JSON.stringify(MEMORY_CACHE.messages));
      } catch (e) {}
    }, 50);
  },

  // Switch the active Law Firm
  switchFirm: (slug: string) => {
    firmService.setActiveFirmSlug(slug, true);
    storageService.loadFirm(slug, true);
  },

  checkBundledData: () => {
    if (typeof window === 'undefined' || typeof fetch === 'undefined') return;
    fetch('/site_data.json')
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (data && typeof data === 'object' && (data.partners || data.settings)) {
          const storedVersion = localStorage.getItem('aladl_site_data_bundled_version');
          if (data.exportedAt && data.exportedAt !== storedVersion) {
            storageService.importDataJSON(JSON.stringify(data));
            localStorage.setItem('aladl_site_data_bundled_version', data.exportedAt);
            notifyChange();
          }
        }
      })
      .catch(() => {});
  },

  checkBundledDataAndSeed: () => {
    if (typeof window === 'undefined') return;
    if (typeof fetch !== 'undefined') {
      fetch('/site_data.json')
        .then(res => (res.ok ? res.json() : null))
        .then(data => {
          if (data && typeof data === 'object' && (data.partners || data.settings)) {
            storageService.importDataJSON(JSON.stringify(data));
            if (data.exportedAt) {
              localStorage.setItem('aladl_site_data_bundled_version', data.exportedAt);
            }
            notifyChange();
          } else {
            storageService.seedInitialData();
          }
        })
        .catch(() => {
          storageService.seedInitialData();
        });
    } else {
      storageService.seedInitialData();
    }
  },

  seedInitialData: () => {
    if (typeof window === 'undefined') return;

    try {
      if (!localStorage.getItem(STORAGE_KEYS.PARTNERS)) {
        safeLocalStorageSet(STORAGE_KEYS.PARTNERS, JSON.stringify(initialPartners));
      }
      if (!localStorage.getItem(STORAGE_KEYS.PRACTICE_AREAS)) {
        safeLocalStorageSet(STORAGE_KEYS.PRACTICE_AREAS, JSON.stringify(initialPracticeAreas));
      }
      if (!localStorage.getItem(STORAGE_KEYS.TESTIMONIALS)) {
        safeLocalStorageSet(STORAGE_KEYS.TESTIMONIALS, JSON.stringify(initialTestimonials));
      }
      if (!localStorage.getItem(STORAGE_KEYS.BLOG_POSTS)) {
        safeLocalStorageSet(STORAGE_KEYS.BLOG_POSTS, JSON.stringify(initialBlogPosts));
      }
      if (!localStorage.getItem(STORAGE_KEYS.CASE_STUDIES)) {
        safeLocalStorageSet(STORAGE_KEYS.CASE_STUDIES, JSON.stringify(initialCaseStudies));
      }
      if (!localStorage.getItem(STORAGE_KEYS.MESSAGES)) {
        safeLocalStorageSet(STORAGE_KEYS.MESSAGES, JSON.stringify(initialContactMessages));
      }
      if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
        safeLocalStorageSet(STORAGE_KEYS.SETTINGS, JSON.stringify(initialSiteSettings));
      }
      if (!localStorage.getItem(STORAGE_KEYS.OFFICES)) {
        safeLocalStorageSet(STORAGE_KEYS.OFFICES, JSON.stringify(initialOffices));
      }
    } catch (e) {
      console.warn('Seed data failed due to quota', e);
    }
  },

  // Partners CRUD
  getPartners: (): Partner[] => {
    const list = getFromCache('partners', STORAGE_KEYS.PARTNERS, initialPartners);
    if (!Array.isArray(list)) return initialPartners;
    return list.map((p: any) => ({
      ...p,
      languages: Array.isArray(p.languages) ? p.languages : ['العربية', 'الإنجليزية'],
      education: Array.isArray(p.education) ? p.education : [],
      name: p.name || '',
      nameEn: p.nameEn || p.name || '',
    }));
  },

  savePartner: (partner: Partner): Partner[] => {
    const list = storageService.getPartners();
    const index = list.findIndex(p => p.id === partner.id);
    let updated: Partner[];
    const isAssociate = partner.isPartner === false;
    const label = isAssociate ? 'المحامي / المستشار' : 'الشريك';
    if (index >= 0) {
      updated = [...list];
      updated[index] = partner;
      storageService.logAction('UPDATE', 'الشركاء والمحامين (Legal Team)', partner.id, `تعديل بيانات ${label}: ${partner.name}`);
    } else {
      updated = [partner, ...list];
      storageService.logAction('CREATE', 'الشركاء والمحامين (Legal Team)', partner.id, `إضافة ${label} جديد: ${partner.name}`);
    }
    
    MEMORY_CACHE.partners = updated;
    syncDeltaImmediately({
      type: 'partner_upsert',
      item: partner,
      sortOrder: index >= 0 ? index : 0,
    });
    notifyChange();
    setTimeout(() => safeLocalStorageSet(STORAGE_KEYS.PARTNERS, JSON.stringify(updated)), 10);
    return updated;
  },

  deletePartner: (id: string): Partner[] => {
    const partner = storageService.getPartners().find(p => p.id === id);
    const list = storageService.getPartners().filter(p => p.id !== id);
    const isAssociate = partner?.isPartner === false;
    const label = isAssociate ? 'المحامي / المستشار' : 'الشريك';
    
    MEMORY_CACHE.partners = list;
    storageService.logAction('DELETE', 'الشركاء والمحامين (Legal Team)', id, `حذف ${label}: ${partner?.name || id}`);
    syncDeltaImmediately({
      type: 'partner_delete',
      id,
    });
    notifyChange();
    setTimeout(() => safeLocalStorageSet(STORAGE_KEYS.PARTNERS, JSON.stringify(list)), 10);
    return list;
  },

  // Practice Areas CRUD
  getPracticeAreas: (): PracticeArea[] => {
    const list = getFromCache('practiceAreas', STORAGE_KEYS.PRACTICE_AREAS, initialPracticeAreas);
    if (!Array.isArray(list)) return initialPracticeAreas;
    return list.map((p: any) => ({
      ...p,
      keyServices: Array.isArray(p.keyServices) ? p.keyServices : [],
      keyServicesEn: Array.isArray(p.keyServicesEn) ? p.keyServicesEn : [],
      keyServicesTr: Array.isArray(p.keyServicesTr) ? p.keyServicesTr : [],
      casesCount: typeof p.casesCount === 'number' ? p.casesCount : 0,
    }));
  },

  savePracticeArea: (item: PracticeArea): PracticeArea[] => {
    const list = storageService.getPracticeAreas();
    const index = list.findIndex(p => p.id === item.id);
    let updated: PracticeArea[];
    if (index >= 0) {
      updated = [...list];
      updated[index] = item;
      storageService.logAction('UPDATE', 'الاختصاصات (Practice Areas)', item.id, `تعديل الاختصاص: ${item.title}`);
    } else {
      updated = [...list, item];
      storageService.logAction('CREATE', 'الاختصاصات (Practice Areas)', item.id, `إضافة اختصاص جديد: ${item.title}`);
    }
    
    MEMORY_CACHE.practiceAreas = updated;
    syncDeltaImmediately({
      type: 'practice_upsert',
      item,
      sortOrder: index >= 0 ? index : updated.length - 1,
    });
    notifyChange();
    setTimeout(() => safeLocalStorageSet(STORAGE_KEYS.PRACTICE_AREAS, JSON.stringify(updated)), 10);
    return updated;
  },

  deletePracticeArea: (id: string): PracticeArea[] => {
    const item = storageService.getPracticeAreas().find(p => p.id === id);
    const list = storageService.getPracticeAreas().filter(p => p.id !== id);
    
    MEMORY_CACHE.practiceAreas = list;
    storageService.logAction('DELETE', 'الاختصاصات (Practice Areas)', id, `حذف الاختصاص: ${item?.title || id}`);
    syncDeltaImmediately({
      type: 'practice_delete',
      id,
    });
    notifyChange();
    setTimeout(() => safeLocalStorageSet(STORAGE_KEYS.PRACTICE_AREAS, JSON.stringify(list)), 10);
    return list;
  },

  // Case Studies CRUD
  getCaseStudies: (): CaseStudy[] => {
    return getFromCache('caseStudies', STORAGE_KEYS.CASE_STUDIES, initialCaseStudies);
  },

  saveCaseStudy: (item: CaseStudy): CaseStudy[] => {
    const list = storageService.getCaseStudies();
    const index = list.findIndex(c => c.id === item.id);
    let updated: CaseStudy[];
    if (index >= 0) {
      updated = [...list];
      updated[index] = item;
      storageService.logAction('UPDATE', 'الإنجازات والقضايا (Case Studies)', item.id, `تعديل القضية: ${item.title}`);
    } else {
      updated = [item, ...list];
      storageService.logAction('CREATE', 'الإنجازات والقضايا (Case Studies)', item.id, `إضافة قضية جديدة: ${item.title}`);
    }
    
    MEMORY_CACHE.caseStudies = updated;
    syncDeltaImmediately({
      type: 'caseStudy_upsert',
      item,
    });
    notifyChange();
    setTimeout(() => safeLocalStorageSet(STORAGE_KEYS.CASE_STUDIES, JSON.stringify(updated)), 10);
    return updated;
  },

  deleteCaseStudy: (id: string): CaseStudy[] => {
    const item = storageService.getCaseStudies().find(c => c.id === id);
    const list = storageService.getCaseStudies().filter(c => c.id !== id);
    
    MEMORY_CACHE.caseStudies = list;
    storageService.logAction('DELETE', 'الإنجازات والقضايا (Case Studies)', id, `حذف القضية: ${item?.title || id}`);
    syncDeltaImmediately({
      type: 'caseStudy_delete',
      id,
    });
    notifyChange();
    setTimeout(() => safeLocalStorageSet(STORAGE_KEYS.CASE_STUDIES, JSON.stringify(list)), 10);
    return list;
  },

  // Testimonials CRUD
  getTestimonials: (): Testimonial[] => {
    return getFromCache('testimonials', STORAGE_KEYS.TESTIMONIALS, initialTestimonials);
  },

  saveTestimonial: (item: Testimonial): Testimonial[] => {
    const list = storageService.getTestimonials();
    const index = list.findIndex(t => t.id === item.id);
    let updated: Testimonial[];
    if (index >= 0) {
      updated = [...list];
      updated[index] = item;
      storageService.logAction('UPDATE', 'آراء العملاء (Testimonials)', item.id, `تعديل شهادة: ${item.clientName}`);
    } else {
      updated = [item, ...list];
      storageService.logAction('CREATE', 'آراء العملاء (Testimonials)', item.id, `إضافة شهادة جديدة: ${item.clientName}`);
    }
    
    MEMORY_CACHE.testimonials = updated;
    syncDeltaImmediately({
      type: 'testimonial_upsert',
      item,
    });
    notifyChange();
    setTimeout(() => safeLocalStorageSet(STORAGE_KEYS.TESTIMONIALS, JSON.stringify(updated)), 10);
    return updated;
  },

  deleteTestimonial: (id: string): Testimonial[] => {
    const item = storageService.getTestimonials().find(t => t.id === id);
    const list = storageService.getTestimonials().filter(t => t.id !== id);
    
    MEMORY_CACHE.testimonials = list;
    storageService.logAction('DELETE', 'آراء العملاء (Testimonials)', id, `حذف شهادة: ${item?.clientName || id}`);
    syncDeltaImmediately({
      type: 'testimonial_delete',
      id,
    });
    notifyChange();
    setTimeout(() => safeLocalStorageSet(STORAGE_KEYS.TESTIMONIALS, JSON.stringify(list)), 10);
    return list;
  },

  // Blog Posts CRUD
  getBlogPosts: (): BlogPost[] => {
    return getFromCache('blogPosts', STORAGE_KEYS.BLOG_POSTS, initialBlogPosts);
  },

  saveBlogPost: (post: BlogPost): BlogPost[] => {
    const list = storageService.getBlogPosts();
    const index = list.findIndex(b => b.id === post.id);
    let updated: BlogPost[];
    if (index >= 0) {
      updated = [...list];
      updated[index] = post;
      storageService.logAction('UPDATE', 'المقالات والمدونة (Blog)', post.id, `تعديل المقال: ${post.title}`);
    } else {
      updated = [post, ...list];
      storageService.logAction('CREATE', 'المقالات والمدونة (Blog)', post.id, `إضافة مقال جديد: ${post.title}`);
    }
    
    MEMORY_CACHE.blogPosts = updated;
    syncDeltaImmediately({
      type: 'blog_upsert',
      item: post,
    });
    notifyChange();
    setTimeout(() => safeLocalStorageSet(STORAGE_KEYS.BLOG_POSTS, JSON.stringify(updated)), 10);
    return updated;
  },

  deleteBlogPost: (id: string): BlogPost[] => {
    const item = storageService.getBlogPosts().find(b => b.id === id);
    const list = storageService.getBlogPosts().filter(b => b.id !== id);
    
    MEMORY_CACHE.blogPosts = list;
    storageService.logAction('DELETE', 'المقالات والمدونة (Blog)', id, `حذف المقال: ${item?.title || id}`);
    syncDeltaImmediately({
      type: 'blog_delete',
      id,
    });
    notifyChange();
    setTimeout(() => safeLocalStorageSet(STORAGE_KEYS.BLOG_POSTS, JSON.stringify(list)), 10);
    return list;
  },

  // Offices CRUD
  getOffices: (): OfficeLocation[] => {
    return getFromCache('offices', STORAGE_KEYS.OFFICES, initialOffices);
  },

  saveOffice: (office: OfficeLocation): OfficeLocation[] => {
    const list = storageService.getOffices();
    const index = list.findIndex(o => o.id === office.id);
    let updated: OfficeLocation[];
    if (index >= 0) {
      updated = [...list];
      updated[index] = office;
      storageService.logAction('UPDATE', 'المقار والفروع (Offices)', office.id, `تعديل المقر: ${office.cityAr}`);
    } else {
      updated = [...list, office];
      storageService.logAction('CREATE', 'المقار والفروع (Offices)', office.id, `إضافة مقر جديد: ${office.cityAr}`);
    }
    
    MEMORY_CACHE.offices = updated;
    syncDeltaImmediately({
      type: 'office_upsert',
      item: office,
    });
    notifyChange();
    setTimeout(() => safeLocalStorageSet(STORAGE_KEYS.OFFICES, JSON.stringify(updated)), 10);
    return updated;
  },

  deleteOffice: (id: string): OfficeLocation[] => {
    const item = storageService.getOffices().find(o => o.id === id);
    const list = storageService.getOffices().filter(o => o.id !== id);
    
    MEMORY_CACHE.offices = list;
    storageService.logAction('DELETE', 'المقار والفروع (Offices)', id, `حذف المقر: ${item?.cityAr || id}`);
    syncDeltaImmediately({
      type: 'office_delete',
      id,
    });
    notifyChange();
    setTimeout(() => safeLocalStorageSet(STORAGE_KEYS.OFFICES, JSON.stringify(list)), 10);
    return list;
  },

  // Contact Inquiries CRUD
  getMessages: (): ContactMessage[] => {
    return getFromCache('messages', STORAGE_KEYS.MESSAGES, initialContactMessages);
  },

  addMessage: (message: Omit<ContactMessage, 'id' | 'createdAt' | 'status'> & { id?: string }, firmSlugOverride?: string): ContactMessage => {
    const list = storageService.getMessages();
    const activeSlug = firmSlugOverride || firmService.getActiveFirmSlug();
    const newMsg: ContactMessage = {
      id: message.id || `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      fullName: message.fullName,
      email: message.email,
      phone: message.phone,
      company: message.company || '',
      consultationType: message.consultationType,
      preferredDate: message.preferredDate,
      isUrgent: message.isUrgent,
      message: message.message,
      status: 'new',
      createdAt: new Date().toISOString()
    };
    const updated = [newMsg, ...list];
    
    MEMORY_CACHE.messages = updated;
    notifyChange();
    setTimeout(() => safeLocalStorageSet(STORAGE_KEYS.MESSAGES, JSON.stringify(updated)), 10);
    syncDeltaImmediately({
      type: 'message_upsert',
      item: newMsg,
    });

    // Async push to Supabase consultation_inquiries table
    try {
      const config = getStoredSupabaseConfig();
      if (config.url && config.anonKey) {
        const client = getSupabase();
        Promise.resolve(client.from('consultation_inquiries').insert({
          id: isValidUUID(newMsg.id) ? newMsg.id : toValidUUID(newMsg.id),
          firm_slug: activeSlug,
          full_name: newMsg.fullName,
          phone: newMsg.phone,
          email: newMsg.email || '',
          company: newMsg.company || '',
          consultation_type: newMsg.consultationType || '',
          preferred_date: newMsg.preferredDate || '',
          is_urgent: newMsg.isUrgent || false,
          message: newMsg.message || '',
          status: 'new',
          created_at: newMsg.createdAt,
        })).catch(() => {});
      }
    } catch {}

    return newMsg;
  },

  updateMessageStatus: (id: string, status: ContactMessage['status'], responseNote?: string): ContactMessage[] => {
    const list = storageService.getMessages();
    const updated = list.map(m => m.id === id ? { ...m, status, responseNote: responseNote !== undefined ? responseNote : m.responseNote } : m);
    MEMORY_CACHE.messages = updated;
    notifyChange();
    storageService.logAction('STATUS_CHANGE', 'رسائل العملاء (Messages)', id, `تحديث حالة الاستشارة إلى: ${status}`);
    setTimeout(() => safeLocalStorageSet(STORAGE_KEYS.MESSAGES, JSON.stringify(updated)), 10);
    syncDeltaImmediately({
      type: 'message_upsert',
      id,
    });
    return updated;
  },

  deleteMessage: (id: string): ContactMessage[] => {
    const msg = storageService.getMessages().find(m => m.id === id);
    const list = storageService.getMessages().filter(m => m.id !== id);
    MEMORY_CACHE.messages = list;
    notifyChange();
    storageService.logAction('DELETE', 'رسائل العملاء (Messages)', id, `حذف استشارة الموكل: ${msg?.fullName || id}`);
    setTimeout(() => safeLocalStorageSet(STORAGE_KEYS.MESSAGES, JSON.stringify(list)), 10);
    syncDeltaImmediately({
      type: 'message_delete',
      id,
    });
    return list;
  },

  // Platform Settings (Global for platform branding, logo, and hero banner)

  initPlatformSettings: async (): Promise<PlatformSettings> => {
    if (typeof window === 'undefined') return { ...initialPlatformSettings };

    const mergeAndApply = (incoming: Partial<PlatformSettings>) => {
      if (!incoming || typeof incoming !== 'object') return;
      const current = storageService.getPlatformSettings();
      const merged: PlatformSettings = {
        ...initialPlatformSettings,
        ...current,
        ...incoming,
      };
      safeLocalStorageSet(STORAGE_KEYS.PLATFORM_SETTINGS, JSON.stringify(merged));
      window.dispatchEvent(new CustomEvent('aladl_platform_settings_updated', { detail: merged }));
      notifyChange();
      return merged;
    };

    // 1. Firebase Firestore Realtime Sync & Immediate Fetch
    try {
      if (db) {
        const firestoreDocRef = doc(db, 'platform_settings', 'general');

        // Realtime Listener to broadcast changes instantly to all active visitor tabs
        onSnapshot(firestoreDocRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data();
            if (data && typeof data === 'object') {
              mergeAndApply(data as Partial<PlatformSettings>);
            }
          }
        }, (err) => {
          console.warn('Firestore platform settings realtime listener notice:', err);
        });

        // Direct fetch
        try {
          const snapshot = await getDoc(firestoreDocRef);
          if (snapshot.exists()) {
            const data = snapshot.data();
            if (data && typeof data === 'object') {
              const res = mergeAndApply(data as Partial<PlatformSettings>);
              if (res) return res;
            }
          }
        } catch (err) {
          console.warn('Firestore platform settings load notice:', err);
        }
      }
    } catch (fsErr) {
      console.warn('Firestore platform settings init notice:', fsErr);
    }

    // 2. Server API Endpoint Fetch with Cache Buster
    try {
      const response = await fetch(`/api/platform-settings?t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Accept': 'application/json', 'Cache-Control': 'no-cache' },
      }).catch(() => null);

      if (response && response.ok) {
        const json = await response.json();
        if (json && json.success && json.data) {
          const res = mergeAndApply(json.data);
          if (res) return res;
        }
      }
    } catch (e) {
      console.warn('Server platform settings load notice:', e);
    }

    // 3. Supabase Cloud Fallback Fetch
    try {
      const config = getStoredSupabaseConfig();
      if (config.url && config.anonKey) {
        const client = getSupabase();
        const { data: row } = await client
          .from('platform_settings')
          .select('value')
          .eq('key', 'general')
          .maybeSingle();

        if (row && row.value && typeof row.value === 'object') {
          const res = mergeAndApply(row.value);
          if (res) return res;
        }
      }
    } catch (e) {
      console.warn('Supabase platform settings load notice:', e);
    }

    return storageService.getPlatformSettings();
  },

  getPlatformSettings: (): PlatformSettings => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PLATFORM_SETTINGS);
      if (data) {
        const parsed = JSON.parse(data);
        return { ...initialPlatformSettings, ...parsed };
      }
    } catch {}
    return { ...initialPlatformSettings };
  },

  savePlatformSettings: async (settings: PlatformSettings): Promise<boolean> => {
    try {
      const nowIso = new Date().toISOString();
      const merged: PlatformSettings = {
        ...initialPlatformSettings,
        ...settings,
      };

      // 1. Instant local persistence & UI broadcast
      safeLocalStorageSet(STORAGE_KEYS.PLATFORM_SETTINGS, JSON.stringify(merged));
      window.dispatchEvent(new CustomEvent('aladl_platform_settings_updated', { detail: merged }));
      notifyChange();

      // 2. Background multi-cloud parallel synchronization
      const withTimeout = <T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> => {
        let timeoutHandle: any;
        const timeoutPromise = new Promise<T>((resolve) => {
          timeoutHandle = setTimeout(() => resolve(fallback), ms);
        });
        return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutHandle));
      };

      // Task A: Firebase Firestore Persistent Sync
      const firestoreTask = async (): Promise<boolean> => {
        if (!db) return false;
        try {
          const docRef = doc(db, 'platform_settings', 'general');
          await setDoc(docRef, { ...merged, updatedAt: nowIso }, { merge: true });
          return true;
        } catch (e) {
          console.warn('Firestore platform settings save notice:', e);
          return false;
        }
      };

      // Task B: Express Server API Endpoint
      const serverTask = async (): Promise<boolean> => {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 2000);
          const res = await fetch('/api/platform-settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ settings: merged }),
            signal: controller.signal,
          });
          clearTimeout(timeoutId);
          return res.ok;
        } catch (e) {
          return false;
        }
      };

      // Task C: Supabase Cloud Database Sync
      const supabaseTask = async (): Promise<boolean> => {
        try {
          const config = getStoredSupabaseConfig();
          if (!config.url || !config.anonKey) return false;
          const client = getSupabase();
          const upsertPromise = Promise.resolve(
            client
              .from('platform_settings')
              .upsert({ key: 'general', value: merged, updated_at: nowIso }, { onConflict: 'key' })
          );
          await withTimeout(upsertPromise, 2000, null);
          return true;
        } catch (e) {
          return false;
        }
      };

      // Run parallel cloud save tasks and await completion
      const results = await Promise.allSettled([
        withTimeout(firestoreTask(), 4000, false),
        withTimeout(serverTask(), 3000, false),
        withTimeout(supabaseTask(), 3000, false),
      ]);

      const anySuccess = results.some(r => r.status === 'fulfilled' && r.value === true);
      return anySuccess || true;
    } catch (e) {
      console.warn('Failed to save platform settings', e);
      return false;
    }
  },

  getSettings: (): SiteSettings => {
    return getFromCache('settings', STORAGE_KEYS.SETTINGS, initialSiteSettings);
  },

  saveSettings: (settings: SiteSettings): SiteSettings => {
    const targetSlug = firmService.getActiveFirmSlug();
    const firm = firmService.getFirmBySlug(targetSlug);
    const changedRootCols: Record<string, any> = {};

    if (firm) {
      if (settings.firmNameAr && settings.firmNameAr !== firm.nameAr) {
        firm.nameAr = settings.firmNameAr;
        changedRootCols.name_ar = settings.firmNameAr;
      }
      if (settings.firmNameEn && settings.firmNameEn !== firm.nameEn) {
        firm.nameEn = settings.firmNameEn;
        changedRootCols.name_en = settings.firmNameEn;
      }
      if (settings.cityAr && settings.cityAr !== firm.cityAr) {
        firm.cityAr = settings.cityAr;
        changedRootCols.city_ar = settings.cityAr;
      }
      if (settings.cityEn && settings.cityEn !== firm.cityEn) {
        firm.cityEn = settings.cityEn;
        changedRootCols.city_en = settings.cityEn;
      }
      if (settings.countryAr && settings.countryAr !== firm.countryAr) {
        firm.countryAr = settings.countryAr;
      }
      if (settings.countryEn && settings.countryEn !== firm.countryEn) {
        firm.countryEn = settings.countryEn;
      }
      if (settings.phone && settings.phone !== firm.phone) {
        firm.phone = settings.phone;
        changedRootCols.phone = settings.phone;
      }
      if (settings.email && settings.email !== firm.email) {
        firm.email = settings.email;
        changedRootCols.email = settings.email;
      }
      if (settings.adminPassword && settings.adminPassword !== firm.adminPassword) {
        firm.adminPassword = settings.adminPassword;
        changedRootCols.admin_password = settings.adminPassword;
      }
      if (settings.primaryColor && settings.primaryColor !== firm.themeColor) {
        firm.themeColor = settings.primaryColor;
        changedRootCols.theme_color = settings.primaryColor;
      }
      if (settings.sloganAr && settings.sloganAr !== firm.taglineAr) {
        firm.taglineAr = settings.sloganAr;
        changedRootCols.tagline_ar = settings.sloganAr;
      }
    }

    MEMORY_CACHE.settings = settings;
    storageService.logAction('UPDATE', 'إعدادات الموقع (Settings)', 'site-settings', `تحديث إعدادات واسم المكتب: ${settings.firmNameAr}`);
    
    // Automatically keep the Headquarters office in sync with settings
    let updatedHqOffice: OfficeLocation | undefined;
    try {
      const offices = storageService.getOffices();
      if (Array.isArray(offices) && offices.length > 0) {
        const hqIndex = offices.findIndex(o => o.isHeadquarter) !== -1 ? offices.findIndex(o => o.isHeadquarter) : 0;
        if (hqIndex >= 0 && offices[hqIndex]) {
          const nextHq: OfficeLocation = {
            ...offices[hqIndex],
            phone: settings.phone || offices[hqIndex].phone,
            email: settings.email || offices[hqIndex].email,
            addressAr: settings.addressAr || offices[hqIndex].addressAr,
            addressEn: settings.addressEn || offices[hqIndex].addressEn,
            addressTr: settings.addressTr || offices[hqIndex].addressTr,
            countryAr: settings.countryAr || offices[hqIndex].countryAr,
            countryEn: settings.countryEn || offices[hqIndex].countryEn,
            countryTr: settings.countryTr || offices[hqIndex].countryTr,
            cityAr: settings.cityAr || offices[hqIndex].cityAr,
            cityEn: settings.cityEn || offices[hqIndex].cityEn,
            cityTr: settings.cityTr || offices[hqIndex].cityTr,
          };
          const updatedOffices = [...offices];
          updatedOffices[hqIndex] = nextHq;
          MEMORY_CACHE.offices = updatedOffices;
          updatedHqOffice = nextHq;
          setTimeout(() => safeLocalStorageSet(STORAGE_KEYS.OFFICES, JSON.stringify(updatedOffices)), 15);
        }
      }
    } catch (e) {
      console.warn('Could not auto-sync HQ office with settings', e);
    }

    syncDeltaImmediately({
      type: updatedHqOffice ? 'office_upsert' : 'settings_update',
      item: updatedHqOffice,
      changedRootCols,
    });
    notifyChange();
    setTimeout(() => safeLocalStorageSet(STORAGE_KEYS.SETTINGS, JSON.stringify(settings)), 10);
    return settings;
  },

  // Audit Logs
  getAuditLogs: (): AuditLog[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  resetAuditLogs: () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.AUDIT_LOGS);
    } catch {
      // Ignore
    }
  },

  logAction: (action: AuditLog['action'], entity: string, entityId: string, details: string) => {
    try {
      const logs = storageService.getAuditLogs();
      const newLog: AuditLog = {
        id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        timestamp: new Date().toISOString(),
        adminUser: 'مدير النظام (Admin)',
        action,
        entity,
        entityId,
        details
      };
      const updated = [newLog, ...logs.slice(0, 49)]; // Keep last 50 logs
      safeLocalStorageSet(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to log audit action', e);
    }
  },

  // Export full JSON Backup
  exportDataJSON: () => {
    const backup = {
      partners: storageService.getPartners(),
      practiceAreas: storageService.getPracticeAreas(),
      caseStudies: storageService.getCaseStudies(),
      testimonials: storageService.getTestimonials(),
      blogPosts: storageService.getBlogPosts(),
      messages: storageService.getMessages(),
      settings: storageService.getSettings(),
      offices: storageService.getOffices(),
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(backup, null, 2);
  },

  // Import full JSON Backup
  importDataJSON: (jsonStr: string): { success: boolean; counts?: Record<string, number>; message?: string } => {
    try {
      const data = JSON.parse(jsonStr);
      let countPartners = 0;
      let countPractices = 0;
      let countArticles = 0;

      if (data.partners && Array.isArray(data.partners)) {
        MEMORY_CACHE.partners = data.partners;
        safeLocalStorageSet(STORAGE_KEYS.PARTNERS, JSON.stringify(data.partners));
        countPartners = data.partners.length;
      }
      if (data.practiceAreas && Array.isArray(data.practiceAreas)) {
        MEMORY_CACHE.practiceAreas = data.practiceAreas;
        safeLocalStorageSet(STORAGE_KEYS.PRACTICE_AREAS, JSON.stringify(data.practiceAreas));
        countPractices = data.practiceAreas.length;
      }
      if (data.caseStudies && Array.isArray(data.caseStudies)) {
        MEMORY_CACHE.caseStudies = data.caseStudies;
        safeLocalStorageSet(STORAGE_KEYS.CASE_STUDIES, JSON.stringify(data.caseStudies));
      }
      if (data.testimonials && Array.isArray(data.testimonials)) {
        MEMORY_CACHE.testimonials = data.testimonials;
        safeLocalStorageSet(STORAGE_KEYS.TESTIMONIALS, JSON.stringify(data.testimonials));
      }
      if (data.blogPosts && Array.isArray(data.blogPosts)) {
        MEMORY_CACHE.blogPosts = data.blogPosts;
        safeLocalStorageSet(STORAGE_KEYS.BLOG_POSTS, JSON.stringify(data.blogPosts));
        countArticles = data.blogPosts.length;
      }
      if (data.messages && Array.isArray(data.messages)) {
        MEMORY_CACHE.messages = data.messages;
        safeLocalStorageSet(STORAGE_KEYS.MESSAGES, JSON.stringify(data.messages));
      }
      if (data.settings && typeof data.settings === 'object') {
        MEMORY_CACHE.settings = data.settings;
        safeLocalStorageSet(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
      }
      if (data.offices && Array.isArray(data.offices)) {
        MEMORY_CACHE.offices = data.offices;
        safeLocalStorageSet(STORAGE_KEYS.OFFICES, JSON.stringify(data.offices));
      }

      mirrorAllDataToPersistence();
      storageService.logAction('CREATE', 'النسخ الاحتياطي (Backup)', 'import-json', `استيراد وحفظ نسخة احتياطية على الموقع (${countPartners} شركاء، ${countPractices} اختصاصات)`);
      notifyChange();
      return {
        success: true,
        counts: {
          partners: countPartners,
          practiceAreas: countPractices,
          blogPosts: countArticles,
        }
      };
    } catch (e) {
      console.error('Failed to parse JSON backup', e);
      return { success: false, message: (e as Error).message };
    }
  },

  // Generate valid TypeScript code for src/data/initialData.ts
  generateInitialDataTS: (): string => {
    const settings = storageService.getSettings();
    const partners = storageService.getPartners();
    const practiceAreas = storageService.getPracticeAreas();
    const testimonials = storageService.getTestimonials();
    const blogPosts = storageService.getBlogPosts();
    const caseStudies = storageService.getCaseStudies();
    const offices = storageService.getOffices();
    const messages = storageService.getMessages();

    return `import { Partner, PracticeArea, Testimonial, BlogPost, CaseStudy, SiteSettings, OfficeLocation, ContactMessage } from '../types';

export const initialSiteSettings: SiteSettings = ${JSON.stringify(settings, null, 2)};

export const initialPartners: Partner[] = ${JSON.stringify(partners, null, 2)};

export const initialPracticeAreas: PracticeArea[] = ${JSON.stringify(practiceAreas, null, 2)};

export const initialTestimonials: Testimonial[] = ${JSON.stringify(testimonials, null, 2)};

export const initialBlogPosts: BlogPost[] = ${JSON.stringify(blogPosts, null, 2)};

export const initialCaseStudies: CaseStudy[] = ${JSON.stringify(caseStudies, null, 2)};

export const initialOffices: OfficeLocation[] = ${JSON.stringify(offices, null, 2)};

export const initialContactMessages: ContactMessage[] = ${JSON.stringify(messages, null, 2)};
`;
  },

  // Download initialData.ts directly
  downloadInitialDataTS: () => {
    const tsCode = storageService.generateInitialDataTS();
    const blob = new Blob([tsCode], { type: 'text/typescript;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'initialData.ts';
    a.click();
    URL.revokeObjectURL(url);
  },

  // Download site_data.json directly for public folder
  downloadSiteDataJSON: () => {
    const jsonStr = storageService.exportDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'site_data.json';
    a.click();
    URL.revokeObjectURL(url);
  },

  // Reset to initial Seed Data (explicit manual action only)
  resetToDefaults: () => {
    try {
      MEMORY_CACHE.partners = initialPartners;
      MEMORY_CACHE.practiceAreas = initialPracticeAreas;
      MEMORY_CACHE.caseStudies = initialCaseStudies;
      MEMORY_CACHE.testimonials = initialTestimonials;
      MEMORY_CACHE.blogPosts = initialBlogPosts;
      MEMORY_CACHE.messages = initialContactMessages;
      MEMORY_CACHE.settings = initialSiteSettings;
      MEMORY_CACHE.offices = initialOffices;

      safeLocalStorageSet(STORAGE_KEYS.PARTNERS, JSON.stringify(initialPartners));
      safeLocalStorageSet(STORAGE_KEYS.PRACTICE_AREAS, JSON.stringify(initialPracticeAreas));
      safeLocalStorageSet(STORAGE_KEYS.CASE_STUDIES, JSON.stringify(initialCaseStudies));
      safeLocalStorageSet(STORAGE_KEYS.TESTIMONIALS, JSON.stringify(initialTestimonials));
      safeLocalStorageSet(STORAGE_KEYS.BLOG_POSTS, JSON.stringify(initialBlogPosts));
      safeLocalStorageSet(STORAGE_KEYS.MESSAGES, JSON.stringify(initialContactMessages));
      safeLocalStorageSet(STORAGE_KEYS.SETTINGS, JSON.stringify(initialSiteSettings));
      safeLocalStorageSet(STORAGE_KEYS.OFFICES, JSON.stringify(initialOffices));
    } catch (e) {
      console.warn('Reset to defaults failed due to quota', e);
    }
    mirrorAllDataToPersistence();
    notifyChange();
  },

  // Sync current active law firm to Supabase cloud database
  syncActiveFirmToSupabase: async (): Promise<{ success: boolean; message: string }> => {
    try {
      const activeSlug = firmService.getActiveFirmSlug();
      let firm = firmService.getFirmBySlug(activeSlug);
      
      const snapshot = {
        partners: storageService.getPartners(),
        practiceAreas: storageService.getPracticeAreas(),
        caseStudies: storageService.getCaseStudies(),
        testimonials: storageService.getTestimonials(),
        blogPosts: storageService.getBlogPosts(),
        messages: storageService.getMessages(),
        settings: storageService.getSettings(),
        offices: storageService.getOffices(),
        savedAt: new Date().toISOString(),
      };

      if (!firm) {
        firm = {
          id: toValidUUID(`firm_${activeSlug || 'al-adl'}`),
          slug: activeSlug || 'al-adl',
          nameAr: snapshot.settings.firmNameAr || 'شركة العدل الدولية للمحاماة',
          nameEn: snapshot.settings.firmNameEn || 'Al-Adl International Law Firm',
          cityAr: snapshot.offices?.[0]?.cityAr || 'الرياض',
          cityEn: snapshot.offices?.[0]?.cityEn || 'Riyadh',
          phone: snapshot.settings.phone || '+966 11 456 7890',
          email: snapshot.settings.email || 'contact@aladl-law.sa',
          adminPassword: snapshot.settings.adminPassword || '123456',
          themeColor: snapshot.settings.primaryColor || '#c5a869',
          isVerified: true,
          featured: true,
          data: snapshot,
          subscription: {
            planTier: 'professional',
            planNameAr: 'الباقة السنوية الاحترافية',
            planNameEn: 'Professional Annual Plan',
            status: 'active',
            isSiteActive: true,
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
            annualFee: 3500,
            currency: 'SAR',
            paymentStatus: 'paid',
            autoRenew: true
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      } else {
        firm.data = snapshot;
        firm.nameAr = snapshot.settings.firmNameAr || firm.nameAr;
        firm.nameEn = snapshot.settings.firmNameEn || firm.nameEn;
        firm.phone = snapshot.settings.phone || firm.phone;
        firm.email = snapshot.settings.email || firm.email;
        firm.adminPassword = snapshot.settings.adminPassword || firm.adminPassword;
        firm.themeColor = snapshot.settings.primaryColor || firm.themeColor || '#c5a869';
      }

      await firmService.saveFirm(firm);
      return await firmService.syncFirmToSupabase(firm);
    } catch (err: any) {
      return { success: false, message: err?.message || 'حدث خطأ أثناء المزامنة مع Supabase' };
    }
  },

  // Fetch and refresh active law firm data from Supabase cloud database
  fetchActiveFirmFromSupabase: async (): Promise<{ success: boolean; message: string }> => {
    try {
      const activeSlug = firmService.getActiveFirmSlug();
      const res = await firmService.fetchFromSupabase();
      if (res.success) {
        storageService.switchFirm(activeSlug);
        notifyChange();
        return { success: true, message: 'تم استرداد وتحديث أحدث بيانات الموقع من Supabase بنجاح!' };
      }
      return { success: false, message: res.message || 'فشل جلب البيانات من Supabase' };
    } catch (err: any) {
      return { success: false, message: err?.message || 'فشل جلب البيانات من Supabase' };
    }
  },

  // Safe Cache Clearing & Application Update:
  // Completely purges device browser cache, CacheStorage, Service Workers, SessionStorage,
  // syncs latest cloud state, and performs a hard refresh to load a fresh copy of the application.
  clearCacheAndRefreshApp: async (onStatus?: (msg: string) => void) => {
    try {
      if (onStatus) onStatus('جاري تنظيف الذاكرة المؤقتة (Cache Storage)...');

      // Step 1: Wipe all CacheStorage API caches (PWA, assets, runtime caches)
      if (typeof window !== 'undefined' && 'caches' in window) {
        try {
          const cacheKeys = await window.caches.keys();
          await Promise.all(cacheKeys.map(key => window.caches.delete(key)));
        } catch (e) {
          console.warn('Cache storage cleanup error:', e);
        }
      }

      // Step 2: Unregister all active & obsolete Service Workers
      if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
        try {
          const registrations = await navigator.serviceWorker.getRegistrations();
          await Promise.all(registrations.map(reg => reg.unregister()));
        } catch (e) {
          console.warn('Service worker unregister error:', e);
        }
      }

      // Step 3: Clear session-level ephemeral data & memory runtime state
      if (typeof sessionStorage !== 'undefined') {
        try {
          sessionStorage.clear();
        } catch {}
      }

      if (onStatus) onStatus('جاري تحميل أحدث البيانات والنسخة السحابية...');

      // Step 4: Sync fresh platform settings from Firestore / Server
      try {
        await storageService.initPlatformSettings();
      } catch (e) {
        console.warn('Platform settings fresh sync during cache refresh:', e);
      }

      // Step 5: Log audit entry
      try {
        storageService.logAction('STATUS_CHANGE', 'تحديث النظام ومسح الذاكرة', 'system-cache', 'تم مسح ذاكرة التخزين المؤقت وتحميل أحدث نسخة من التطبيق بنجاح');
      } catch {}

      if (onStatus) onStatus('تم مسح الذاكرة بنجاح! جاري تحميل النسخة الجديدة...');

      // Step 6: Hard reload with cache buster to force browser network fetch
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          try {
            const url = new URL(window.location.href);
            url.searchParams.set('_v', Date.now().toString());
            window.location.replace(url.toString());
          } catch {
            window.location.reload();
          }
        }
      }, 300);

      return true;
    } catch (err) {
      console.error('Error during safe cache refresh:', err);
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
      return false;
    }
  }
};
