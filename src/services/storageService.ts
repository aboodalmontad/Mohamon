import { Partner, PracticeArea, Testimonial, BlogPost, CaseStudy, ContactMessage, SiteSettings, PlatformSettings, OfficeLocation, AuditLog, LawFirm } from '../types';
import { initialPlatformSettings, initialPartners, initialPracticeAreas, initialTestimonials, initialBlogPosts, initialCaseStudies, initialContactMessages, initialSiteSettings, initialOffices } from '../data/initialData';
import { firmService } from './firmService';
import { getSupabase, getStoredSupabaseConfig, isValidUUID, toValidUUID } from '../lib/supabase';

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

// Debounced version of mirrorAllDataToPersistence to avoid rapid-fire heavy snapshots
let mirrorTimeout: any = null;
const mirrorAllDataToPersistence = () => {
  if (typeof window === 'undefined') return;
  
  if (mirrorTimeout) clearTimeout(mirrorTimeout);
  
  mirrorTimeout = setTimeout(() => {
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

      // Also mirror to active firm inside firmService
      const activeSlug = firmService.getActiveFirmSlug();
      const firm = firmService.getFirmBySlug(activeSlug);
      if (firm) {
        firm.data = {
          settings: snapshot.settings,
          partners: snapshot.partners,
          practiceAreas: snapshot.practiceAreas,
          caseStudies: snapshot.caseStudies,
          testimonials: snapshot.testimonials,
          blogPosts: snapshot.blogPosts,
          offices: snapshot.offices,
          messages: snapshot.messages,
          savedAt: snapshot.savedAt,
        };
        firm.nameAr = snapshot.settings.firmNameAr || firm.nameAr;
        firm.nameEn = snapshot.settings.firmNameEn || firm.nameEn;
        firm.phone = snapshot.settings.phone || firm.phone;
        firm.email = snapshot.settings.email || firm.email;
        firm.themeColor = snapshot.settings.primaryColor || firm.themeColor || '#c5a869';
        firmService.saveFirm(firm).catch(() => {});
      }
    } catch (e) {
      console.warn('Failed to mirror data snapshot', e);
    }
  }, 1000); // Wait 1 second of inactivity before saving snapshot
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

// Internal helper to get data from cache or localStorage (fallback)
const getFromCache = (key: keyof typeof MEMORY_CACHE, storageKey: string, defaultValue: any) => {
  if (MEMORY_CACHE[key]) return MEMORY_CACHE[key];
  
  try {
    const localData = localStorage.getItem(storageKey);
    if (localData) {
      const parsed = JSON.parse(localData);
      MEMORY_CACHE[key] = parsed;
      return parsed;
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
  // Init and seed if empty, with Multi-firm resolution
  init: async () => {
    if (typeof window === 'undefined') return;

    // Load from IndexedDB FIRST
    const snapshot = await getSnapshotFromIDB();
    if (snapshot) {
      MEMORY_CACHE.partners = snapshot.partners;
      MEMORY_CACHE.practiceAreas = snapshot.practiceAreas;
      MEMORY_CACHE.caseStudies = snapshot.caseStudies;
      MEMORY_CACHE.testimonials = snapshot.testimonials;
      MEMORY_CACHE.blogPosts = snapshot.blogPosts;
      MEMORY_CACHE.messages = snapshot.messages;
      MEMORY_CACHE.settings = snapshot.settings;
      MEMORY_CACHE.offices = snapshot.offices;
      console.log('Successfully hydrated storage cache from IndexedDB');
    }

    await firmService.init();
    const activeSlug = firmService.getActiveFirmSlug();
    const currentFirm = firmService.getFirmBySlug(activeSlug);

    if (currentFirm && currentFirm.data && (currentFirm.data.partners || currentFirm.data.settings)) {
      storageService.loadFirm(currentFirm.slug, false);
    } else if (!snapshot) {
      storageService.seedInitialData();
      mirrorAllDataToPersistence();
    }

    notifyChange();
  },

  // Load a specific Law Firm's complete data into active state
  loadFirm: (slug: string, triggerEvent = true) => {
    if (typeof window === 'undefined') return;
    const firm = firmService.getFirmBySlug(slug);
    
    if (!firm) return;
    
    // Construct a baseline settings object from firm root data 
    // to prevent ever showing a dummy firm while loading
    const fallbackSettings = {
      ...initialSiteSettings,
      firmNameAr: firm.nameAr,
      firmNameEn: firm.nameEn || '',
      firmNameTr: firm.nameTr || '',
      sloganAr: firm.taglineAr || '',
      sloganEn: firm.taglineEn || '',
      phone: firm.phone || '',
      email: firm.email || '',
      primaryColor: firm.themeColor || '#c5a869',
      logoUrl: firm.logoUrl || ''
    };

    // If we have firm data, update cache. 
    if (firm && firm.data) {
      const data = firm.data;
      
      // Update Memory Cache - force override to prevent bleeding from previous firm
      MEMORY_CACHE.settings = data.settings || fallbackSettings;
      MEMORY_CACHE.partners = data.partners || [];
      MEMORY_CACHE.practiceAreas = data.practiceAreas || [];
      MEMORY_CACHE.caseStudies = data.caseStudies || [];
      MEMORY_CACHE.testimonials = data.testimonials || [];
      MEMORY_CACHE.blogPosts = data.blogPosts || [];
      MEMORY_CACHE.offices = data.offices || [];
      MEMORY_CACHE.messages = data.messages || [];
  
      try {
        safeLocalStorageSet(STORAGE_KEYS.SETTINGS, JSON.stringify(MEMORY_CACHE.settings));
        safeLocalStorageSet(STORAGE_KEYS.PARTNERS, JSON.stringify(MEMORY_CACHE.partners));
        safeLocalStorageSet(STORAGE_KEYS.PRACTICE_AREAS, JSON.stringify(MEMORY_CACHE.practiceAreas));
        safeLocalStorageSet(STORAGE_KEYS.CASE_STUDIES, JSON.stringify(MEMORY_CACHE.caseStudies));
        safeLocalStorageSet(STORAGE_KEYS.TESTIMONIALS, JSON.stringify(MEMORY_CACHE.testimonials));
        safeLocalStorageSet(STORAGE_KEYS.BLOG_POSTS, JSON.stringify(MEMORY_CACHE.blogPosts));
        safeLocalStorageSet(STORAGE_KEYS.OFFICES, JSON.stringify(MEMORY_CACHE.offices));
        safeLocalStorageSet(STORAGE_KEYS.MESSAGES, JSON.stringify(MEMORY_CACHE.messages));
      } catch (e) {
        console.error('Failed to load firm data to localStorage due to quota', e);
      }
    } else {
      // Firm has no data yet, populate with safe fallbacks instead of dummy seed
      MEMORY_CACHE.settings = fallbackSettings;
      MEMORY_CACHE.partners = [];
      MEMORY_CACHE.practiceAreas = [];
      MEMORY_CACHE.caseStudies = [];
      MEMORY_CACHE.testimonials = [];
      MEMORY_CACHE.blogPosts = [];
      MEMORY_CACHE.offices = [];
      MEMORY_CACHE.messages = [];
      
      try {
        safeLocalStorageSet(STORAGE_KEYS.SETTINGS, JSON.stringify(MEMORY_CACHE.settings));
        safeLocalStorageSet(STORAGE_KEYS.PARTNERS, "[]");
        safeLocalStorageSet(STORAGE_KEYS.PRACTICE_AREAS, "[]");
        safeLocalStorageSet(STORAGE_KEYS.CASE_STUDIES, "[]");
        safeLocalStorageSet(STORAGE_KEYS.TESTIMONIALS, "[]");
        safeLocalStorageSet(STORAGE_KEYS.BLOG_POSTS, "[]");
        safeLocalStorageSet(STORAGE_KEYS.OFFICES, "[]");
        safeLocalStorageSet(STORAGE_KEYS.MESSAGES, "[]");
      } catch (e) {}
    }

    firmService.setActiveFirmSlug(firm.slug, false);

    if (triggerEvent) {
      notifyChange();
    }
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
    safeLocalStorageSet(STORAGE_KEYS.PARTNERS, JSON.stringify(updated));
    mirrorAllDataToPersistence();
    notifyChange();
    return updated;
  },

  deletePartner: (id: string): Partner[] => {
    const partner = storageService.getPartners().find(p => p.id === id);
    const list = storageService.getPartners().filter(p => p.id !== id);
    const isAssociate = partner?.isPartner === false;
    const label = isAssociate ? 'المحامي / المستشار' : 'الشريك';
    
    MEMORY_CACHE.partners = list;
    safeLocalStorageSet(STORAGE_KEYS.PARTNERS, JSON.stringify(list));
    storageService.logAction('DELETE', 'الشركاء والمحامين (Legal Team)', id, `حذف ${label}: ${partner?.name || id}`);
    mirrorAllDataToPersistence();
    notifyChange();
    return list;
  },

  // Practice Areas CRUD
  getPracticeAreas: (): PracticeArea[] => {
    const list = getFromCache('practiceAreas', STORAGE_KEYS.PRACTICE_AREAS, initialPracticeAreas);
    if (!Array.isArray(list)) return initialPracticeAreas;
    return list.map((p: any) => ({
      ...p,
      keyServices: Array.isArray(p.keyServices) ? p.keyServices : [],
      keyServicesEn: Array.isArray(p.keyServicesEn) ? p.keyServicesEn : (Array.isArray(p.keyServices) ? p.keyServices : []),
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
    safeLocalStorageSet(STORAGE_KEYS.PRACTICE_AREAS, JSON.stringify(updated));
    mirrorAllDataToPersistence();
    notifyChange();
    return updated;
  },

  deletePracticeArea: (id: string): PracticeArea[] => {
    const item = storageService.getPracticeAreas().find(p => p.id === id);
    const list = storageService.getPracticeAreas().filter(p => p.id !== id);
    
    MEMORY_CACHE.practiceAreas = list;
    safeLocalStorageSet(STORAGE_KEYS.PRACTICE_AREAS, JSON.stringify(list));
    storageService.logAction('DELETE', 'الاختصاصات (Practice Areas)', id, `حذف الاختصاص: ${item?.title || id}`);
    mirrorAllDataToPersistence();
    notifyChange();
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
    safeLocalStorageSet(STORAGE_KEYS.CASE_STUDIES, JSON.stringify(updated));
    mirrorAllDataToPersistence();
    notifyChange();
    return updated;
  },

  deleteCaseStudy: (id: string): CaseStudy[] => {
    const item = storageService.getCaseStudies().find(c => c.id === id);
    const list = storageService.getCaseStudies().filter(c => c.id !== id);
    
    MEMORY_CACHE.caseStudies = list;
    safeLocalStorageSet(STORAGE_KEYS.CASE_STUDIES, JSON.stringify(list));
    storageService.logAction('DELETE', 'الإنجازات والقضايا (Case Studies)', id, `حذف القضية: ${item?.title || id}`);
    mirrorAllDataToPersistence();
    notifyChange();
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
    safeLocalStorageSet(STORAGE_KEYS.TESTIMONIALS, JSON.stringify(updated));
    mirrorAllDataToPersistence();
    notifyChange();
    return updated;
  },

  deleteTestimonial: (id: string): Testimonial[] => {
    const item = storageService.getTestimonials().find(t => t.id === id);
    const list = storageService.getTestimonials().filter(t => t.id !== id);
    
    MEMORY_CACHE.testimonials = list;
    safeLocalStorageSet(STORAGE_KEYS.TESTIMONIALS, JSON.stringify(list));
    storageService.logAction('DELETE', 'آراء العملاء (Testimonials)', id, `حذف شهادة: ${item?.clientName || id}`);
    mirrorAllDataToPersistence();
    notifyChange();
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
    safeLocalStorageSet(STORAGE_KEYS.BLOG_POSTS, JSON.stringify(updated));
    mirrorAllDataToPersistence();
    notifyChange();
    return updated;
  },

  deleteBlogPost: (id: string): BlogPost[] => {
    const item = storageService.getBlogPosts().find(b => b.id === id);
    const list = storageService.getBlogPosts().filter(b => b.id !== id);
    
    MEMORY_CACHE.blogPosts = list;
    safeLocalStorageSet(STORAGE_KEYS.BLOG_POSTS, JSON.stringify(list));
    storageService.logAction('DELETE', 'المقالات والمدونة (Blog)', id, `حذف المقال: ${item?.title || id}`);
    mirrorAllDataToPersistence();
    notifyChange();
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
    safeLocalStorageSet(STORAGE_KEYS.OFFICES, JSON.stringify(updated));
    mirrorAllDataToPersistence();
    notifyChange();
    return updated;
  },

  deleteOffice: (id: string): OfficeLocation[] => {
    const item = storageService.getOffices().find(o => o.id === id);
    const list = storageService.getOffices().filter(o => o.id !== id);
    
    MEMORY_CACHE.offices = list;
    safeLocalStorageSet(STORAGE_KEYS.OFFICES, JSON.stringify(list));
    storageService.logAction('DELETE', 'المقار والفروع (Offices)', id, `حذف المقر: ${item?.cityAr || id}`);
    mirrorAllDataToPersistence();
    notifyChange();
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
    safeLocalStorageSet(STORAGE_KEYS.MESSAGES, JSON.stringify(updated));
    mirrorAllDataToPersistence();
    notifyChange();

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
    safeLocalStorageSet(STORAGE_KEYS.MESSAGES, JSON.stringify(updated));
    storageService.logAction('STATUS_CHANGE', 'رسائل العملاء (Messages)', id, `تحديث حالة الاستشارة إلى: ${status}`);
    mirrorAllDataToPersistence();
    notifyChange();
    return updated;
  },

  deleteMessage: (id: string): ContactMessage[] => {
    const msg = storageService.getMessages().find(m => m.id === id);
    const list = storageService.getMessages().filter(m => m.id !== id);
    safeLocalStorageSet(STORAGE_KEYS.MESSAGES, JSON.stringify(list));
    storageService.logAction('DELETE', 'رسائل العملاء (Messages)', id, `حذف استشارة الموكل: ${msg?.fullName || id}`);
    mirrorAllDataToPersistence();
    notifyChange();
    return list;
  },

  // Site Settings

  getPlatformSettings: (): PlatformSettings => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PLATFORM_SETTINGS);
      if (data) return JSON.parse(data);
    } catch {}
    return { ...initialPlatformSettings };
  },

  savePlatformSettings: (settings: PlatformSettings) => {
    try {
      safeLocalStorageSet(STORAGE_KEYS.PLATFORM_SETTINGS, JSON.stringify(settings));
      notifyChange();
    } catch (e) {
      console.warn('Failed to save platform settings', e);
    }
  },

  getSettings: (): SiteSettings => {
    return getFromCache('settings', STORAGE_KEYS.SETTINGS, initialSiteSettings);
  },

  saveSettings: (settings: SiteSettings): SiteSettings => {
    MEMORY_CACHE.settings = settings;
    safeLocalStorageSet(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    storageService.logAction('UPDATE', 'إعدادات الموقع (Settings)', 'site-settings', `تحديث إعدادات واسم المكتب: ${settings.firmNameAr}`);
    
    // Automatically keep the Headquarters office in sync with settings
    try {
      const offices = storageService.getOffices();
      if (Array.isArray(offices) && offices.length > 0) {
        const hqIndex = offices.findIndex(o => o.isHeadquarter) !== -1 ? offices.findIndex(o => o.isHeadquarter) : 0;
        if (hqIndex >= 0 && offices[hqIndex]) {
          offices[hqIndex] = {
            ...offices[hqIndex],
            phone: settings.phone || offices[hqIndex].phone,
            email: settings.email || offices[hqIndex].email,
            addressAr: settings.addressAr || offices[hqIndex].addressAr,
            addressEn: settings.addressEn || offices[hqIndex].addressEn,
            addressTr: settings.addressTr || offices[hqIndex].addressTr,
          };
          safeLocalStorageSet(STORAGE_KEYS.OFFICES, JSON.stringify(offices));
        }
      }
    } catch (e) {
      console.warn('Could not auto-sync HQ office with settings', e);
    }

    mirrorAllDataToPersistence();
    notifyChange();
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
  // Preserves 100% of user data, backs it up to IndexedDB, clears runtime browser caches, and refreshes the application.
  clearCacheAndRefreshApp: async (onStatus?: (msg: string) => void) => {
    try {
      if (onStatus) onStatus('جاري تأمين وحفظ البيانات في التخزين الدائم...');
      
      // Step 1: Snapshot and preserve all data
      const currentSnapshot = {
        partners: storageService.getPartners(),
        practiceAreas: storageService.getPracticeAreas(),
        caseStudies: storageService.getCaseStudies(),
        testimonials: storageService.getTestimonials(),
        blogPosts: storageService.getBlogPosts(),
        messages: storageService.getMessages(),
        settings: storageService.getSettings(),
        offices: storageService.getOffices(),
        auditLogs: storageService.getAuditLogs(),
        platformSettings: storageService.getPlatformSettings(),
        savedAt: new Date().toISOString()
      };

      // Save to IndexedDB and ensure localStorage keys are fresh
      await saveSnapshotToIDB(currentSnapshot);

      try {
        safeLocalStorageSet(STORAGE_KEYS.PARTNERS, JSON.stringify(currentSnapshot.partners));
        safeLocalStorageSet(STORAGE_KEYS.PRACTICE_AREAS, JSON.stringify(currentSnapshot.practiceAreas));
        safeLocalStorageSet(STORAGE_KEYS.CASE_STUDIES, JSON.stringify(currentSnapshot.caseStudies));
        safeLocalStorageSet(STORAGE_KEYS.TESTIMONIALS, JSON.stringify(currentSnapshot.testimonials));
        safeLocalStorageSet(STORAGE_KEYS.BLOG_POSTS, JSON.stringify(currentSnapshot.blogPosts));
        safeLocalStorageSet(STORAGE_KEYS.MESSAGES, JSON.stringify(currentSnapshot.messages));
        safeLocalStorageSet(STORAGE_KEYS.SETTINGS, JSON.stringify(currentSnapshot.settings));
        safeLocalStorageSet(STORAGE_KEYS.OFFICES, JSON.stringify(currentSnapshot.offices));
        safeLocalStorageSet(STORAGE_KEYS.PLATFORM_SETTINGS, JSON.stringify(currentSnapshot.platformSettings));
      } catch (e) {
        console.warn('Cache refresh data restoration partially failed due to quota', e);
      }

      if (onStatus) onStatus('جاري مسح ملفات الذاكرة المؤقتة (Cache Storage)...');

      // Step 2: Clear Service Worker caches if available
      if (typeof window !== 'undefined' && 'caches' in window) {
        try {
          const cacheKeys = await window.caches.keys();
          await Promise.all(cacheKeys.map(key => window.caches.delete(key)));
        } catch (e) {
          console.warn('Cache storage cleanup non-critical error:', e);
        }
      }

      // Step 3: Unregister obsolete service workers if any
      if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
        try {
          const registrations = await navigator.serviceWorker.getRegistrations();
          for (const registration of registrations) {
            await registration.unregister();
          }
        } catch (e) {
          console.warn('Service worker unregister error:', e);
        }
      }

      // Step 4: Clear session-level ephemeral data
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.clear();
      }

      // Step 5: Log audit entry
      storageService.logAction('STATUS_CHANGE', 'تحديث النظام والكاش', 'system-cache', 'تم مسح ذاكرة التخزين المؤقت وتحديث التطبيق مع الحفاظ الكامل على كافة البيانات');

      if (onStatus) onStatus('تم تأمين البيانات بنجاح! جاري تحديث التطبيق الآن...');

      // Step 6: Hard reload the page
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          window.location.reload();
        }
      }, 600);

      return true;
    } catch (err) {
      console.error('Error during safe cache refresh:', err);
      // Fallback reload
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
      return false;
    }
  }
};
