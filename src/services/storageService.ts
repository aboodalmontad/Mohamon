import { Partner, PracticeArea, Testimonial, BlogPost, CaseStudy, ContactMessage, SiteSettings, OfficeLocation, AuditLog, LawFirm } from '../types';
import { initialPartners, initialPracticeAreas, initialTestimonials, initialBlogPosts, initialCaseStudies, initialContactMessages, initialSiteSettings, initialOffices } from '../data/initialData';
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

// Auto-sync current state to secondary persistence and firmService
const mirrorAllDataToPersistence = () => {
  if (typeof window === 'undefined') return;
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
};

export const storageService = {
  // Init and seed if empty, with Multi-firm resolution
  init: () => {
    if (typeof window === 'undefined') return;

    firmService.init().then(() => {
      const activeSlug = firmService.getActiveFirmSlug();
      const currentFirm = firmService.getFirmBySlug(activeSlug);

      if (currentFirm && currentFirm.data && (currentFirm.data.partners || currentFirm.data.settings)) {
        storageService.loadFirm(currentFirm.slug, false);
      } else {
        storageService.seedInitialData();
        mirrorAllDataToPersistence();
      }
    });

    const hasPartners = !!localStorage.getItem(STORAGE_KEYS.PARTNERS);
    const hasSettings = !!localStorage.getItem(STORAGE_KEYS.SETTINGS);

    if (!hasPartners && !hasSettings) {
      storageService.seedInitialData();
    }
  },

  // Load a specific Law Firm's complete data into active state
  loadFirm: (slug: string, triggerEvent = true) => {
    if (typeof window === 'undefined') return;
    const firm = firmService.getFirmBySlug(slug);
    if (!firm || !firm.data) return;

    const data = firm.data;
    if (data.settings) localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
    if (data.partners) localStorage.setItem(STORAGE_KEYS.PARTNERS, JSON.stringify(data.partners));
    if (data.practiceAreas) localStorage.setItem(STORAGE_KEYS.PRACTICE_AREAS, JSON.stringify(data.practiceAreas));
    if (data.caseStudies) localStorage.setItem(STORAGE_KEYS.CASE_STUDIES, JSON.stringify(data.caseStudies));
    if (data.testimonials) localStorage.setItem(STORAGE_KEYS.TESTIMONIALS, JSON.stringify(data.testimonials));
    if (data.blogPosts) localStorage.setItem(STORAGE_KEYS.BLOG_POSTS, JSON.stringify(data.blogPosts));
    if (data.offices) localStorage.setItem(STORAGE_KEYS.OFFICES, JSON.stringify(data.offices));
    if (data.messages) localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(data.messages));

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

    if (!localStorage.getItem(STORAGE_KEYS.PARTNERS)) {
      localStorage.setItem(STORAGE_KEYS.PARTNERS, JSON.stringify(initialPartners));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PRACTICE_AREAS)) {
      localStorage.setItem(STORAGE_KEYS.PRACTICE_AREAS, JSON.stringify(initialPracticeAreas));
    }
    if (!localStorage.getItem(STORAGE_KEYS.TESTIMONIALS)) {
      localStorage.setItem(STORAGE_KEYS.TESTIMONIALS, JSON.stringify(initialTestimonials));
    }
    if (!localStorage.getItem(STORAGE_KEYS.BLOG_POSTS)) {
      localStorage.setItem(STORAGE_KEYS.BLOG_POSTS, JSON.stringify(initialBlogPosts));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CASE_STUDIES)) {
      localStorage.setItem(STORAGE_KEYS.CASE_STUDIES, JSON.stringify(initialCaseStudies));
    }
    if (!localStorage.getItem(STORAGE_KEYS.MESSAGES)) {
      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(initialContactMessages));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(initialSiteSettings));
    }
    if (!localStorage.getItem(STORAGE_KEYS.OFFICES)) {
      localStorage.setItem(STORAGE_KEYS.OFFICES, JSON.stringify(initialOffices));
    }
  },

  // Partners CRUD
  getPartners: (): Partner[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PARTNERS);
      const parsed = data ? JSON.parse(data) : initialPartners;
      if (!Array.isArray(parsed)) return initialPartners;
      return parsed.map((p: any) => ({
        ...p,
        languages: Array.isArray(p.languages) ? p.languages : ['العربية', 'الإنجليزية'],
        education: Array.isArray(p.education) ? p.education : [],
        name: p.name || '',
        nameEn: p.nameEn || p.name || '',
      }));
    } catch {
      return initialPartners;
    }
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
    localStorage.setItem(STORAGE_KEYS.PARTNERS, JSON.stringify(updated));
    mirrorAllDataToPersistence();
    notifyChange();
    return updated;
  },

  deletePartner: (id: string): Partner[] => {
    const partner = storageService.getPartners().find(p => p.id === id);
    const list = storageService.getPartners().filter(p => p.id !== id);
    const isAssociate = partner?.isPartner === false;
    const label = isAssociate ? 'المحامي / المستشار' : 'الشريك';
    localStorage.setItem(STORAGE_KEYS.PARTNERS, JSON.stringify(list));
    storageService.logAction('DELETE', 'الشركاء والمحامين (Legal Team)', id, `حذف ${label}: ${partner?.name || id}`);
    mirrorAllDataToPersistence();
    notifyChange();
    return list;
  },

  // Practice Areas CRUD
  getPracticeAreas: (): PracticeArea[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PRACTICE_AREAS);
      const parsed = data ? JSON.parse(data) : initialPracticeAreas;
      if (!Array.isArray(parsed)) return initialPracticeAreas;
      return parsed.map((p: any) => ({
        ...p,
        keyServices: Array.isArray(p.keyServices) ? p.keyServices : [],
        keyServicesEn: Array.isArray(p.keyServicesEn) ? p.keyServicesEn : (Array.isArray(p.keyServices) ? p.keyServices : []),
        casesCount: typeof p.casesCount === 'number' ? p.casesCount : 0,
      }));
    } catch {
      return initialPracticeAreas;
    }
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
    localStorage.setItem(STORAGE_KEYS.PRACTICE_AREAS, JSON.stringify(updated));
    mirrorAllDataToPersistence();
    notifyChange();
    return updated;
  },

  deletePracticeArea: (id: string): PracticeArea[] => {
    const item = storageService.getPracticeAreas().find(p => p.id === id);
    const list = storageService.getPracticeAreas().filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PRACTICE_AREAS, JSON.stringify(list));
    storageService.logAction('DELETE', 'الاختصاصات (Practice Areas)', id, `حذف الاختصاص: ${item?.title || id}`);
    mirrorAllDataToPersistence();
    notifyChange();
    return list;
  },

  // Case Studies CRUD
  getCaseStudies: (): CaseStudy[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CASE_STUDIES);
      return data ? JSON.parse(data) : initialCaseStudies;
    } catch {
      return initialCaseStudies;
    }
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
    localStorage.setItem(STORAGE_KEYS.CASE_STUDIES, JSON.stringify(updated));
    mirrorAllDataToPersistence();
    notifyChange();
    return updated;
  },

  deleteCaseStudy: (id: string): CaseStudy[] => {
    const item = storageService.getCaseStudies().find(c => c.id === id);
    const list = storageService.getCaseStudies().filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.CASE_STUDIES, JSON.stringify(list));
    storageService.logAction('DELETE', 'الإنجازات والقضايا (Case Studies)', id, `حذف القضية: ${item?.title || id}`);
    mirrorAllDataToPersistence();
    notifyChange();
    return list;
  },

  // Testimonials CRUD
  getTestimonials: (): Testimonial[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TESTIMONIALS);
      return data ? JSON.parse(data) : initialTestimonials;
    } catch {
      return initialTestimonials;
    }
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
    localStorage.setItem(STORAGE_KEYS.TESTIMONIALS, JSON.stringify(updated));
    mirrorAllDataToPersistence();
    notifyChange();
    return updated;
  },

  deleteTestimonial: (id: string): Testimonial[] => {
    const item = storageService.getTestimonials().find(t => t.id === id);
    const list = storageService.getTestimonials().filter(t => t.id !== id);
    localStorage.setItem(STORAGE_KEYS.TESTIMONIALS, JSON.stringify(list));
    storageService.logAction('DELETE', 'آراء العملاء (Testimonials)', id, `حذف شهادة: ${item?.clientName || id}`);
    mirrorAllDataToPersistence();
    notifyChange();
    return list;
  },

  // Blog Posts CRUD
  getBlogPosts: (): BlogPost[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BLOG_POSTS);
      return data ? JSON.parse(data) : initialBlogPosts;
    } catch {
      return initialBlogPosts;
    }
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
    localStorage.setItem(STORAGE_KEYS.BLOG_POSTS, JSON.stringify(updated));
    mirrorAllDataToPersistence();
    notifyChange();
    return updated;
  },

  deleteBlogPost: (id: string): BlogPost[] => {
    const item = storageService.getBlogPosts().find(b => b.id === id);
    const list = storageService.getBlogPosts().filter(b => b.id !== id);
    localStorage.setItem(STORAGE_KEYS.BLOG_POSTS, JSON.stringify(list));
    storageService.logAction('DELETE', 'المقالات والمدونة (Blog)', id, `حذف المقال: ${item?.title || id}`);
    mirrorAllDataToPersistence();
    notifyChange();
    return list;
  },

  // Offices CRUD
  getOffices: (): OfficeLocation[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.OFFICES);
      return data ? JSON.parse(data) : initialOffices;
    } catch {
      return initialOffices;
    }
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
    localStorage.setItem(STORAGE_KEYS.OFFICES, JSON.stringify(updated));
    mirrorAllDataToPersistence();
    notifyChange();
    return updated;
  },

  deleteOffice: (id: string): OfficeLocation[] => {
    const item = storageService.getOffices().find(o => o.id === id);
    const list = storageService.getOffices().filter(o => o.id !== id);
    localStorage.setItem(STORAGE_KEYS.OFFICES, JSON.stringify(list));
    storageService.logAction('DELETE', 'المقار والفروع (Offices)', id, `حذف المقر: ${item?.cityAr || id}`);
    mirrorAllDataToPersistence();
    notifyChange();
    return list;
  },

  // Contact Inquiries CRUD
  getMessages: (): ContactMessage[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MESSAGES);
      return data ? JSON.parse(data) : initialContactMessages;
    } catch {
      return initialContactMessages;
    }
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
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(updated));
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
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(updated));
    storageService.logAction('STATUS_CHANGE', 'رسائل العملاء (Messages)', id, `تحديث حالة الاستشارة إلى: ${status}`);
    mirrorAllDataToPersistence();
    notifyChange();
    return updated;
  },

  deleteMessage: (id: string): ContactMessage[] => {
    const msg = storageService.getMessages().find(m => m.id === id);
    const list = storageService.getMessages().filter(m => m.id !== id);
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(list));
    storageService.logAction('DELETE', 'رسائل العملاء (Messages)', id, `حذف استشارة الموكل: ${msg?.fullName || id}`);
    mirrorAllDataToPersistence();
    notifyChange();
    return list;
  },

  // Site Settings
  getSettings: (): SiteSettings => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!data) return initialSiteSettings;
      const parsed = JSON.parse(data);
      return {
        ...initialSiteSettings,
        ...parsed,
        stats: {
          ...initialSiteSettings.stats,
          ...(parsed.stats || {}),
        }
      };
    } catch {
      return initialSiteSettings;
    }
  },

  saveSettings: (settings: SiteSettings): SiteSettings => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
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
          localStorage.setItem(STORAGE_KEYS.OFFICES, JSON.stringify(offices));
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
      const updated = [newLog, ...logs.slice(0, 199)]; // Keep last 200 logs
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(updated));
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
        localStorage.setItem(STORAGE_KEYS.PARTNERS, JSON.stringify(data.partners));
        countPartners = data.partners.length;
      }
      if (data.practiceAreas && Array.isArray(data.practiceAreas)) {
        localStorage.setItem(STORAGE_KEYS.PRACTICE_AREAS, JSON.stringify(data.practiceAreas));
        countPractices = data.practiceAreas.length;
      }
      if (data.caseStudies && Array.isArray(data.caseStudies)) {
        localStorage.setItem(STORAGE_KEYS.CASE_STUDIES, JSON.stringify(data.caseStudies));
      }
      if (data.testimonials && Array.isArray(data.testimonials)) {
        localStorage.setItem(STORAGE_KEYS.TESTIMONIALS, JSON.stringify(data.testimonials));
      }
      if (data.blogPosts && Array.isArray(data.blogPosts)) {
        localStorage.setItem(STORAGE_KEYS.BLOG_POSTS, JSON.stringify(data.blogPosts));
        countArticles = data.blogPosts.length;
      }
      if (data.messages && Array.isArray(data.messages)) {
        localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(data.messages));
      }
      if (data.settings && typeof data.settings === 'object') {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
      }
      if (data.offices && Array.isArray(data.offices)) {
        localStorage.setItem(STORAGE_KEYS.OFFICES, JSON.stringify(data.offices));
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
    localStorage.setItem(STORAGE_KEYS.PARTNERS, JSON.stringify(initialPartners));
    localStorage.setItem(STORAGE_KEYS.PRACTICE_AREAS, JSON.stringify(initialPracticeAreas));
    localStorage.setItem(STORAGE_KEYS.CASE_STUDIES, JSON.stringify(initialCaseStudies));
    localStorage.setItem(STORAGE_KEYS.TESTIMONIALS, JSON.stringify(initialTestimonials));
    localStorage.setItem(STORAGE_KEYS.BLOG_POSTS, JSON.stringify(initialBlogPosts));
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(initialContactMessages));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(initialSiteSettings));
    localStorage.setItem(STORAGE_KEYS.OFFICES, JSON.stringify(initialOffices));
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
        savedAt: new Date().toISOString()
      };

      // Save to IndexedDB and ensure localStorage keys are fresh
      await saveSnapshotToIDB(currentSnapshot);

      localStorage.setItem(STORAGE_KEYS.PARTNERS, JSON.stringify(currentSnapshot.partners));
      localStorage.setItem(STORAGE_KEYS.PRACTICE_AREAS, JSON.stringify(currentSnapshot.practiceAreas));
      localStorage.setItem(STORAGE_KEYS.CASE_STUDIES, JSON.stringify(currentSnapshot.caseStudies));
      localStorage.setItem(STORAGE_KEYS.TESTIMONIALS, JSON.stringify(currentSnapshot.testimonials));
      localStorage.setItem(STORAGE_KEYS.BLOG_POSTS, JSON.stringify(currentSnapshot.blogPosts));
      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(currentSnapshot.messages));
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(currentSnapshot.settings));
      localStorage.setItem(STORAGE_KEYS.OFFICES, JSON.stringify(currentSnapshot.offices));

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
