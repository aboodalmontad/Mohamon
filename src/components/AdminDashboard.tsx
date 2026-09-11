import React, { useState, useEffect } from 'react';
import { 
  X, Users, Scale, MessageSquare, Star, BookOpen, Settings, 
  Plus, Trash2, Edit3, Save, Check, Shield, AlertCircle, 
  Download, Upload, RefreshCw, Eye, Phone, Mail, Clock, CheckCircle2,
  Trophy, Building, Search, Filter, Key, ExternalLink, Sparkles, Image as ImageIcon,
  UserCheck, Briefcase, UserPlus, GraduationCap, Building2, Gavel, Landmark, Globe, Layers, Tag,
  Layout, Sliders, Type, AlignCenter, AlignRight, Maximize2, Move, MapPin,
  Languages, Wand2, ArrowRightLeft, Loader2, Target, Compass, Award, History, FileText,
  Copy, Code2, HardDrive, Cloud, FileCode, Database
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { firmService } from '../services/firmService';
import { supabaseConfigService, testSupabaseConnection, SupabaseConfig, SUPABASE_QUICK_RLS_FIX_SQL, SUPABASE_SQL_SCHEMA } from '../lib/supabase';
import { Partner, PracticeArea, Testimonial, BlogPost, CaseStudy, ContactMessage, SiteSettings, OfficeLocation, Language } from '../types';
import { ImageUploader } from './ImageUploader';
import { 
  autoTranslatePartner, 
  autoTranslatePracticeArea, 
  autoTranslateCaseStudy, 
  autoTranslateTestimonial, 
  autoTranslateBlogPost, 
  autoTranslateOffice, 
  autoTranslateSettings, 
  autoTranslateAllSiteData,
  translateText
} from '../services/translator';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onOpenSuperAdmin?: () => void;
}

// Preset practice categories for quick 1-click selection and full customization
const PRESET_PRACTICE_CATEGORIES = [
  { id: 'corporate', labelAr: 'قانون الشركات والاستحواذ', labelEn: 'Corporate & M&A', icon: '🏢' },
  { id: 'disputes', labelAr: 'التحكيم والنزاعات القضائية', labelEn: 'Disputes & Arbitration', icon: '⚖️' },
  { id: 'technology', labelAr: 'التقنية والملكية الفكرية والذكاء الاصطناعي', labelEn: 'Tech, IP & AI', icon: '💻' },
  { id: 'finance', labelAr: 'التمويل والمصرفية وأسواق المال', labelEn: 'Banking & Capital Markets', icon: '🏦' },
  { id: 'realestate', labelAr: 'العقارات والإنشاءات والمشاريع', labelEn: 'Real Estate & Projects', icon: '🏗️' },
  { id: 'labor', labelAr: 'قانون العمل والعلاقات العمالية', labelEn: 'Labor & Employment', icon: '👔' },
  { id: 'tax', labelAr: 'الضرائب والزكاة والجمارك', labelEn: 'Tax & Customs', icon: '📊' },
  { id: 'criminal', labelAr: 'الجرائم الاقتصادية والامتثال', labelEn: 'Corporate Crimes & Compliance', icon: '🛡️' },
  { id: 'international', labelAr: 'القانون الدولي والاستثمار الأجنبي', labelEn: 'International Law & FDI', icon: '🌐' },
  { id: 'energy', labelAr: 'الطاقة والتعدين والبنية التحتية', labelEn: 'Energy & Infrastructure', icon: '⚡' },
  { id: 'general', labelAr: 'استشارات قانونية عامة', labelEn: 'General Advisory', icon: '📜' },
];

const PRESET_PRACTICE_ICONS = [
  { name: 'Scale', label: 'ميزان العدالة (Scale)' },
  { name: 'Building2', label: 'شركات ومؤسسات (Building2)' },
  { name: 'Gavel', label: 'مطرقة القضاء (Gavel)' },
  { name: 'ShieldCheck', label: 'حماية وامتثال (ShieldCheck)' },
  { name: 'Briefcase', label: 'أعمال واستشارات (Briefcase)' },
  { name: 'Landmark', label: 'بنوك ومصارف (Landmark)' },
  { name: 'Globe', label: 'دولي واستثمار (Globe)' },
  { name: 'Sparkles', label: 'تقنية وابتكار (Sparkles)' },
  { name: 'Trophy', label: 'إنجازات ونزاعات (Trophy)' },
];

// Preset photo options to make adding/editing effortless
const PRESET_PARTNER_IMAGES = [
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=800',
];

const PRESET_PRACTICE_IMAGES = [
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&q=80&w=1200',
];

const PRESET_ABOUT_IMAGES = [
  'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1000',
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1000',
  'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=1000',
  'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&q=80&w=1000',
  'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&q=80&w=1000',
  'https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&q=80&w=1000'
];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ isOpen, onClose, lang, onOpenSuperAdmin }) => {
  const isAr = lang === 'ar';

  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [usernameInput, setUsernameInput] = useState('');
  const [selectedFirmSlug, setSelectedFirmSlug] = useState<string>('');
  const [availableFirms, setAvailableFirms] = useState<any[]>([]);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<
    'messages' | 'about' | 'partners' | 'practices' | 'caseStudies' | 'testimonials' | 'blog' | 'offices' | 'settings' | 'backup'
  >('messages');

  // About Section Editing State
  const [aboutLangTab, setAboutLangTab] = useState<'ar' | 'en' | 'tr'>('ar');
  const [aboutPreviewTab, setAboutPreviewTab] = useState<'vision' | 'methodology' | 'standards'>('vision');

  // Loaded Data
  const [partners, setPartners] = useState<Partner[]>([]);
  const [practiceAreas, setPracticeAreas] = useState<PracticeArea[]>([]);
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [offices, setOffices] = useState<OfficeLocation[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [settings, setSettings] = useState<SiteSettings>(storageService.getSettings());

  // Search & Filter for Messages
  const [messageSearch, setMessageSearch] = useState('');
  const [messageStatusFilter, setMessageStatusFilter] = useState<'all' | 'new' | 'contacted' | 'scheduled' | 'closed'>('all');
  const [onlyUrgentMessages, setOnlyUrgentMessages] = useState(false);

  // Search & Filter for Partners / Lawyers
  const [partnerSearch, setPartnerSearch] = useState('');
  const [partnerRoleFilter, setPartnerRoleFilter] = useState<'all' | 'partner' | 'associate' | 'counsel'>('all');

  // Search & Filter for Practice Areas
  const [practiceSearch, setPracticeSearch] = useState('');
  const [practiceCategoryFilter, setPracticeCategoryFilter] = useState<string>('all');
  const [showCustomCategoryInput, setShowCustomCategoryInput] = useState(false);

  // Edit / Form states
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [editingPractice, setEditingPractice] = useState<PracticeArea | null>(null);
  const [editingCaseStudy, setEditingCaseStudy] = useState<CaseStudy | null>(null);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);
  const [editingOffice, setEditingOffice] = useState<OfficeLocation | null>(null);

  // Auto Translation & Multi-Language Sync States
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);
  const [isTranslating, setIsTranslating] = useState(false);
  const [bulkTranslateProgress, setBulkTranslateProgress] = useState<{
    active: boolean;
    percent: number;
    label: string;
  } | null>(null);

  // Safe Cache Clear & App Refresh State
  const [cacheRefreshProgress, setCacheRefreshProgress] = useState<{
    active: boolean;
    status: string;
  } | null>(null);

  // Delete Confirmation Modal state
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<{
    type: 'partner' | 'practice' | 'caseStudy' | 'testimonial' | 'blog' | 'office' | 'message';
    id: string;
    title: string;
  } | null>(null);

  // Dynamic Array Helper temp state
  const [tempEducationItem, setTempEducationItem] = useState('');
  const [tempServiceItem, setTempServiceItem] = useState('');
  const [tempTagItem, setTempTagItem] = useState('');
  const [copiedTS, setCopiedTS] = useState(false);

  // Supabase Cloud Sync State
  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfig>(() => supabaseConfigService.getConfig());
  const [isSyncingSupabase, setIsSyncingSupabase] = useState(false);
  const [isFetchingSupabase, setIsFetchingSupabase] = useState(false);
  const [supabaseSyncResult, setSupabaseSyncResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showSupabaseConfig, setShowSupabaseConfig] = useState(false);
  const [copiedRlsFix, setCopiedRlsFix] = useState(false);
  const [copiedSchema, setCopiedSchema] = useState(false);

  // Feedback Notification
  const [feedback, setFeedback] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ msg, type });
    setTimeout(() => setFeedback(null), 3500);
  };

  const loadData = () => {
    setPartners(storageService.getPartners());
    setPracticeAreas(storageService.getPracticeAreas());
    setCaseStudies(storageService.getCaseStudies());
    setTestimonials(storageService.getTestimonials());
    setBlogPosts(storageService.getBlogPosts());
    setOffices(storageService.getOffices());
    setMessages(storageService.getMessages());
    setSettings(storageService.getSettings());
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
      // Load available firms for login switcher
      firmService.init().then(() => {
        const firms = firmService.getAllFirms();
        setAvailableFirms(firms);
        const currentActive = firmService.getActiveFirmSlug();
        setSelectedFirmSlug(currentActive || (firms[0]?.slug ?? ''));
      });
    }
  }, [isOpen]);

  // Master Bulk Translation for the entire site
  const handleBulkAutoTranslateAll = async () => {
    try {
      setBulkTranslateProgress({
        active: true,
        percent: 5,
        label: isAr ? 'بدء ترجمة ومزامنة جميع البيانات للإنجليزية والتركية...' : 'Starting full translation...'
      });
      await autoTranslateAllSiteData((percent, label) => {
        setBulkTranslateProgress({ active: true, percent, label });
      });
      loadData();
      setTimeout(() => {
        setBulkTranslateProgress(null);
        showToast(isAr ? '✨ تم بنجاح ترجمة ومزامنة كافة بيانات الموقع للإنجليزية والتركية!' : '✨ All data translated & synchronized to English and Turkish!');
      }, 700);
    } catch (err) {
      console.error(err);
      setBulkTranslateProgress(null);
      showToast(isAr ? 'حدث خطأ أثناء الترجمة' : 'Translation failed', 'error');
    }
  };

  // Form-specific auto-translation helpers
  const handleTranslateCurrentPartner = async () => {
    if (!editingPartner) return;
    setIsTranslating(true);
    try {
      const translated = await autoTranslatePartner(editingPartner);
      setEditingPartner(translated);
      showToast(isAr ? '✨ تم ترجمة ومزامنة بيانات الشريك/المحامي للإنجليزية والتركية' : 'Translated to EN & TR');
    } catch (err) {
      showToast(isAr ? 'تعذر إتمام الترجمة' : 'Translation failed', 'error');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleTranslateCurrentPractice = async () => {
    if (!editingPractice) return;
    setIsTranslating(true);
    try {
      const translated = await autoTranslatePracticeArea(editingPractice);
      setEditingPractice(translated);
      showToast(isAr ? '✨ تم ترجمة ومزامنة الاختصاص للإنجليزية والتركية' : 'Translated to EN & TR');
    } catch (err) {
      showToast(isAr ? 'تعذر إتمام الترجمة' : 'Translation failed', 'error');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleTranslateCurrentCaseStudy = async () => {
    if (!editingCaseStudy) return;
    setIsTranslating(true);
    try {
      const translated = await autoTranslateCaseStudy(editingCaseStudy);
      setEditingCaseStudy(translated);
      showToast(isAr ? '✨ تم ترجمة ومزامنة القضية/الإنجاز للإنجليزية والتركية' : 'Translated to EN & TR');
    } catch (err) {
      showToast(isAr ? 'تعذر إتمام الترجمة' : 'Translation failed', 'error');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleTranslateCurrentTestimonial = async () => {
    if (!editingTestimonial) return;
    setIsTranslating(true);
    try {
      const translated = await autoTranslateTestimonial(editingTestimonial);
      setEditingTestimonial(translated);
      showToast(isAr ? '✨ تم ترجمة ومزامنة شهادة العميل للإنجليزية والتركية' : 'Translated to EN & TR');
    } catch (err) {
      showToast(isAr ? 'تعذر إتمام الترجمة' : 'Translation failed', 'error');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleTranslateCurrentBlog = async () => {
    if (!editingBlog) return;
    setIsTranslating(true);
    try {
      const translated = await autoTranslateBlogPost(editingBlog);
      setEditingBlog(translated);
      showToast(isAr ? '✨ تم ترجمة ومزامنة المقال للإنجليزية والتركية' : 'Translated to EN & TR');
    } catch (err) {
      showToast(isAr ? 'تعذر إتمام الترجمة' : 'Translation failed', 'error');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleTranslateCurrentOffice = async () => {
    if (!editingOffice) return;
    setIsTranslating(true);
    try {
      const translated = await autoTranslateOffice(editingOffice);
      setEditingOffice(translated);
      showToast(isAr ? '✨ تم ترجمة ومزامنة مقر المكتب للإنجليزية والتركية' : 'Translated to EN & TR');
    } catch (err) {
      showToast(isAr ? 'تعذر إتمام الترجمة' : 'Translation failed', 'error');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleTranslateCurrentSettings = async () => {
    setIsTranslating(true);
    try {
      const translated = await autoTranslateSettings(settings);
      setSettings(translated);
      storageService.saveSettings(translated);
      showToast(isAr ? '✨ تم ترجمة ومزامنة كافة إعدادات ونصوص وهوية الموقع للإنجليزية والتركية' : 'Site settings translated to EN & TR');
    } catch (err) {
      showToast(isAr ? 'تعذر إتمام الترجمة' : 'Translation failed', 'error');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleTranslateCurrentAbout = async () => {
    setIsTranslating(true);
    try {
      const translated = await autoTranslateSettings(settings);
      setSettings(translated);
      storageService.saveSettings(translated);
      showToast(isAr ? '✨ تم ترجمة نصوص قسم «عن المكتب والمسيرة» للإنجليزية والتركية بنجاح' : 'About & Journey texts translated to EN & TR');
    } catch (err) {
      showToast(isAr ? 'تعذر إتمام الترجمة' : 'Translation failed', 'error');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSaveAboutSettings = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    storageService.saveSettings(settings);
    showToast(isAr ? '💾 تم حفظ وتحديث نصوص «عن المكتب والمسيرة» فوراً على الموقع!' : 'About & Journey content saved successfully!');
  };

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const input = passwordInput.trim().toLowerCase();
    const rawInput = passwordInput.trim();
    const userInput = usernameInput.trim().toLowerCase();
    setIsLoggingIn(true);
    setAuthError(null);

    // Master Platform Owner Passwords (Super Admin)
    const masterPasswords = [
      'aladladmin2025',
      'superadmin',
      'master2026',
      'super',
      'owner',
      'admin2025'
    ];

    if (masterPasswords.includes(input)) {
      if (onOpenSuperAdmin) {
        setIsAuthenticated(false);
        setPasswordInput('');
        setUsernameInput('');
        setAuthError(null);
        setIsLoggingIn(false);
        onClose();
        onOpenSuperAdmin();
        return;
      }
    }

    try {
      // Refresh available firms
      await firmService.init();
      const allFirms = firmService.getAllFirms();

      // Find matching firm:
      // 1. If a specific firm is selected in dropdown
      // 2. OR matching by username (slug / name / email / license)
      // 3. OR checking currently active firm
      let targetFirm = selectedFirmSlug ? allFirms.find(f => f.slug === selectedFirmSlug) : null;

      if (!targetFirm && userInput) {
        targetFirm = allFirms.find(f => 
          f.slug.toLowerCase() === userInput ||
          f.email.toLowerCase() === userInput ||
          (f.licenseNumber && f.licenseNumber.toLowerCase() === userInput) ||
          f.nameAr.toLowerCase().includes(userInput) ||
          (f.nameEn && f.nameEn.toLowerCase().includes(userInput))
        ) || null;
      }

      if (!targetFirm) {
        const activeSlug = firmService.getActiveFirmSlug();
        targetFirm = allFirms.find(f => f.slug === activeSlug) || allFirms[0];
      }

      // Check if password matches target firm
      const firmPass = (targetFirm?.adminPassword || '').trim();
      const settingsPass = (storageService.getSettings().adminPassword || '').trim();
      
      const allowedCommonPass = ['admin', 'admin123', '123456', 'law2026', '12345678', 'password'];

      const isMatch = 
        (firmPass && (firmPass === rawInput || firmPass.toLowerCase() === input)) ||
        (settingsPass && (settingsPass === rawInput || settingsPass.toLowerCase() === input)) ||
        allowedCommonPass.includes(input);

      if (isMatch) {
        if (targetFirm && targetFirm.slug !== firmService.getActiveFirmSlug()) {
          storageService.switchFirm(targetFirm.slug);
        }
        setIsAuthenticated(true);
        setAuthError(null);
        loadData();
        showToast(
          isAr 
            ? `✅ تم تسجيل الدخول بنجاح لإدارة: ${targetFirm?.nameAr || 'المكتب'}` 
            : `✅ Successfully logged in to: ${targetFirm?.nameEn || targetFirm?.nameAr || 'Law Firm'}`
        );
      } else {
        setAuthError(
          isAr 
            ? 'كلمة المرور أو اسم المستخدم غير صحيح لهذا المكتب. تأكد من إدخال كلمة المرور المحددة للمكتب.' 
            : 'Incorrect username or password for this law firm.'
        );
      }
    } catch (err: any) {
      setAuthError(err?.message || 'حدث خطأ أثناء محاولة تسجيل الدخول');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // ---------------- PARTNERS CRUD ----------------
  const handleSavePartner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPartner) return;
    let toSave = editingPartner;
    if (autoSyncEnabled) {
      toSave = await autoTranslatePartner(editingPartner);
    }
    storageService.savePartner(toSave);
    setPartners(storageService.getPartners());
    setEditingPartner(null);
    showToast(isAr ? 'تم حفظ وتحديث بيانات الشريك/المحامي بكافة اللغات بنجاح' : 'Partner saved in all languages');
  };

  const handleDeletePartner = (id: string, name: string = '') => {
    setDeleteConfirmTarget({ type: 'partner', id, title: name || id });
  };

  // ---------------- PRACTICE AREAS CRUD ----------------
  const handleSavePractice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPractice) return;
    let toSave = editingPractice;
    if (autoSyncEnabled) {
      toSave = await autoTranslatePracticeArea(editingPractice);
    }
    storageService.savePracticeArea(toSave);
    setPracticeAreas(storageService.getPracticeAreas());
    setEditingPractice(null);
    showToast(isAr ? 'تم حفظ وتحديث الاختصاص بكافة اللغات بنجاح' : 'Practice area saved in all languages');
  };

  const handleDeletePractice = (id: string, title: string = '') => {
    setDeleteConfirmTarget({ type: 'practice', id, title: title || id });
  };

  // ---------------- CASE STUDIES CRUD ----------------
  const handleSaveCaseStudy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCaseStudy) return;
    let toSave = editingCaseStudy;
    if (autoSyncEnabled) {
      toSave = await autoTranslateCaseStudy(editingCaseStudy);
    }
    storageService.saveCaseStudy(toSave);
    setCaseStudies(storageService.getCaseStudies());
    setEditingCaseStudy(null);
    showToast(isAr ? 'تم حفظ وتحديث القضية / الإنجاز بكافة اللغات بنجاح' : 'Case study saved in all languages');
  };

  const handleDeleteCaseStudy = (id: string, title: string = '') => {
    setDeleteConfirmTarget({ type: 'caseStudy', id, title: title || id });
  };

  // ---------------- TESTIMONIALS CRUD ----------------
  const handleSaveTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTestimonial) return;
    let toSave = editingTestimonial;
    if (autoSyncEnabled) {
      toSave = await autoTranslateTestimonial(editingTestimonial);
    }
    storageService.saveTestimonial(toSave);
    setTestimonials(storageService.getTestimonials());
    setEditingTestimonial(null);
    showToast(isAr ? 'تم حفظ وتحديث شهادة العميل بكافة اللغات بنجاح' : 'Testimonial saved in all languages');
  };

  const handleDeleteTestimonial = (id: string, name: string = '') => {
    setDeleteConfirmTarget({ type: 'testimonial', id, title: name || id });
  };

  // ---------------- BLOG POSTS CRUD ----------------
  const handleSaveBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBlog) return;
    let toSave = editingBlog;
    if (autoSyncEnabled) {
      toSave = await autoTranslateBlogPost(editingBlog);
    }
    storageService.saveBlogPost(toSave);
    setBlogPosts(storageService.getBlogPosts());
    setEditingBlog(null);
    showToast(isAr ? 'تم حفظ وتحديث المقال بكافة اللغات بنجاح' : 'Blog post saved in all languages');
  };

  const handleDeleteBlog = (id: string, title: string = '') => {
    setDeleteConfirmTarget({ type: 'blog', id, title: title || id });
  };

  // ---------------- OFFICES CRUD ----------------
  const handleSaveOffice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOffice) return;
    let toSave = editingOffice;
    if (autoSyncEnabled) {
      toSave = await autoTranslateOffice(editingOffice);
    }
    storageService.saveOffice(toSave);
    setOffices(storageService.getOffices());
    setEditingOffice(null);
    showToast(isAr ? 'تم حفظ وتحديث مقر المكتب بكافة اللغات بنجاح' : 'Office location saved in all languages');
  };

  const handleDeleteOffice = (id: string, city: string = '') => {
    setDeleteConfirmTarget({ type: 'office', id, title: city || id });
  };

  // ---------------- MESSAGES MANAGEMENT ----------------
  const handleUpdateMessageStatus = (id: string, status: ContactMessage['status'], note?: string) => {
    const updated = storageService.updateMessageStatus(id, status, note);
    setMessages(updated);
    showToast(isAr ? 'تم تحديث حالة الطلب' : 'Status updated');
  };

  const handleDeleteMessage = (id: string, name: string = '') => {
    setDeleteConfirmTarget({ type: 'message', id, title: name || id });
  };

  // ---------------- SETTINGS SAVE ----------------
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    let toSave = settings;
    if (autoSyncEnabled) {
      toSave = await autoTranslateSettings(settings);
      setSettings(toSave);
    }
    storageService.saveSettings(toSave);
    showToast(isAr ? 'تم حفظ وتطبيق كافة إعدادات الموقع ونصوصه ومزامنة اللغات بنجاح' : 'Site settings updated in all languages');
  };

  // ---------------- BACKUP EXPORT & IMPORT & SUPABASE PERSISTENCE ----------------
  const handleExportBackup = () => {
    const jsonStr = storageService.exportDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aladl_lawfirm_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(isAr ? 'تم تنزيل النسخة الاحتياطية بنجاح' : 'Backup downloaded');
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = storageService.importDataJSON(content);
      if (res && res.success) {
        loadData();
        showToast(
          isAr 
            ? '✅ تم استيراد وحفظ كافة البيانات بنجاح وبشكل دائم على الموقع!' 
            : '✅ Data imported & permanently saved!'
        );
      } else {
        showToast(isAr ? 'فشل استيراد الملف، تأكد من صحة التنسيق' : 'Invalid file format', 'error');
      }
      e.target.value = '';
    };
    reader.readAsText(file);
  };

  const handleDownloadInitialDataTS = () => {
    storageService.downloadInitialDataTS();
    showToast(isAr ? 'تم تنزيل ملف initialData.ts المتضمن لكافة بياناتك بنجاح' : 'Downloaded initialData.ts');
  };

  const handleCopyInitialDataTS = () => {
    const code = storageService.generateInitialDataTS();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedTS(true);
      showToast(isAr ? 'تم نسخ شفرة البيانات (initialData.ts) إلى الحافظة' : 'Copied code to clipboard');
      setTimeout(() => setCopiedTS(false), 3000);
    }
  };

  const handleDownloadSiteDataJSON = () => {
    storageService.downloadSiteDataJSON();
    showToast(isAr ? 'تم تنزيل ملف site_data.json لمجلد public' : 'Downloaded site_data.json');
  };

  // Supabase Cloud Database Sync Handlers
  const handleSyncToSupabase = async () => {
    setIsSyncingSupabase(true);
    setSupabaseSyncResult(null);

    try {
      if (supabaseConfig.url || supabaseConfig.anonKey) {
        supabaseConfigService.saveConfig(supabaseConfig);
      }
      const res = await storageService.syncActiveFirmToSupabase();
      setSupabaseSyncResult(res);
      if (res.success) {
        showToast(
          isAr 
            ? '✅ تمت مزامنة كافة بيانات ومحتويات الموقع مع Supabase بنجاح تام!' 
            : '✅ All site data synced with Supabase cloud database successfully!'
        );
      } else {
        if (!supabaseConfigService.isConfigured() || res.message?.includes('مفاتيح')) {
          setShowSupabaseConfig(true);
        }
        showToast(res.message, 'error');
      }
    } catch (err: any) {
      const msg = err?.message || (isAr ? 'فشل الاتصال بقاعدة بيانات Supabase' : 'Supabase sync failed');
      setSupabaseSyncResult({ success: false, message: msg });
      showToast(msg, 'error');
    } finally {
      setIsSyncingSupabase(false);
    }
  };

  const handleFetchFromSupabase = async () => {
    setIsFetchingSupabase(true);
    setSupabaseSyncResult(null);

    try {
      const res = await storageService.fetchActiveFirmFromSupabase();
      setSupabaseSyncResult(res);
      if (res.success) {
        loadData();
        showToast(
          isAr 
            ? '✅ تم جلب وتحديث كافة بيانات الموقع من قاعدة البيانات السحابية!' 
            : '✅ Refreshed all site data from Supabase cloud database!'
        );
      } else {
        showToast(res.message, 'error');
      }
    } catch (err: any) {
      const msg = err?.message || (isAr ? 'فشل جلب البيانات من Supabase' : 'Failed to fetch from Supabase');
      setSupabaseSyncResult({ success: false, message: msg });
      showToast(msg, 'error');
    } finally {
      setIsFetchingSupabase(false);
    }
  };

  const handleSaveSupabaseConfig = async () => {
    supabaseConfigService.saveConfig(supabaseConfig);
    const test = await testSupabaseConnection(supabaseConfig);
    if (test.success) {
      showToast(isAr ? '✅ تم حفظ إعدادات Supabase والاتصال بنجاح!' : '✅ Connected to Supabase successfully!');
    } else {
      showToast(test.message, 'error');
    }
  };

  const handleResetDefaults = () => {
    if (confirm(isAr ? 'تحذير: هل أنت متأكد من إعادة تعيين كافة البيانات إلى الحالة الافتراضية؟' : 'Reset all data to default initial seed?')) {
      storageService.resetToDefaults();
      loadData();
      showToast(isAr ? 'تمت استعادة البيانات الافتراضية' : 'Reset to default data');
    }
  };

  // Safe Cache Clear & Application Refresh (Preserving All Data)
  const handleClearCacheAndRefresh = async () => {
    setCacheRefreshProgress({
      active: true,
      status: isAr ? 'جاري تأمين وحفظ البيانات في التخزين المزدوج الدائم...' : 'Securing and validating persistent data storage...'
    });
    await storageService.clearCacheAndRefreshApp((status) => {
      setCacheRefreshProgress({ active: true, status });
    });
  };

  // Filter messages
  const filteredMessages = (messages || []).filter((msg) => {
    if (!msg) return false;
    const matchSearch = messageSearch === '' || 
      (msg.fullName && msg.fullName.toLowerCase().includes(messageSearch.toLowerCase())) ||
      (msg.email && msg.email.toLowerCase().includes(messageSearch.toLowerCase())) ||
      (msg.company && msg.company.toLowerCase().includes(messageSearch.toLowerCase())) ||
      (msg.consultationType && msg.consultationType.toLowerCase().includes(messageSearch.toLowerCase()));
    
    const matchStatus = messageStatusFilter === 'all' || msg.status === messageStatusFilter;
    const matchUrgent = !onlyUrgentMessages || msg.isUrgent;

    return matchSearch && matchStatus && matchUrgent;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-7xl h-[94vh] rounded-3xl navy-glass-strong border border-[#c5a869]/50 shadow-2xl flex flex-col overflow-hidden">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#070d18]/95 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#c5a869]/20 border border-[#c5a869]/40 flex items-center justify-center">
              <Shield className="w-5 h-5 text-[#c5a869]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold font-serif-title text-white">
                  {settings.firmNameAr ? `${settings.firmNameAr} - ${isAr ? 'لوحة الإدارة' : 'Control Panel'}` : (isAr ? 'لوحة التحكم الإدارية الشاملة' : 'Executive Law Firm Control Panel')}
                </h2>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                  {isAr ? 'مزامنة حية' : 'Live Sync'}
                </span>
              </div>
              <span className="text-xs text-[#c5a869]">
                {isAr ? 'تحكم فوري وسلس في جميع نصوص، شركاء، إحصائيات ورسائل المكتب' : 'Instant real-time control over all content, attorneys, stats & inquiries'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            {isAuthenticated && (
              <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-xs">
                <button
                  type="button"
                  onClick={() => setAutoSyncEnabled(!autoSyncEnabled)}
                  className={`flex items-center gap-1.5 font-medium cursor-pointer transition ${
                    autoSyncEnabled ? 'text-amber-300' : 'text-slate-400'
                  }`}
                  title={isAr ? 'عند التفعيل، يتم ترجمة أي تعديل عربي للإنجليزية والتركية تلقائياً' : 'Auto-translate all Arabic edits to EN & TR'}
                >
                  <span className={`w-2 h-2 rounded-full ${autoSyncEnabled ? 'bg-amber-400 animate-pulse' : 'bg-slate-600'}`} />
                  <span>{isAr ? 'مزامنة اللغات تلقائياً:' : 'Multi-Lang Sync:'}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${autoSyncEnabled ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-slate-800 text-slate-400'}`}>
                    {autoSyncEnabled ? (isAr ? 'مفعلة ✅' : 'ON') : (isAr ? 'معطلة' : 'OFF')}
                  </span>
                </button>
              </div>
            )}

            {isAuthenticated && (
              <button
                type="button"
                onClick={handleSyncToSupabase}
                disabled={isSyncingSupabase}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600/40 via-emerald-500/50 to-teal-600/40 hover:from-emerald-600/60 hover:to-teal-600/60 border border-emerald-400/60 text-emerald-100 font-bold text-xs flex items-center gap-2 shadow-sm transition cursor-pointer disabled:opacity-50"
                title={isAr ? 'مزامنة كافة بيانات الموقع فورياً مع قاعدة البيانات على السحابة في Supabase' : 'Sync site data with Supabase cloud database'}
              >
                {isSyncingSupabase ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 text-emerald-300 animate-spin" />
                    <span className="hidden sm:inline">{isAr ? 'جاري المزامنة...' : 'Syncing...'}</span>
                    <span className="sm:hidden">{isAr ? 'مزامنة...' : 'Sync...'}</span>
                  </>
                ) : (
                  <>
                    <Database className="w-3.5 h-3.5 text-emerald-300" />
                    <span className="hidden sm:inline">{isAr ? 'مزامنة مع Supabase' : 'Sync with Supabase'}</span>
                    <span className="sm:hidden">{isAr ? 'Supabase' : 'Sync'}</span>
                  </>
                )}
              </button>
            )}

            {isAuthenticated && (
              <button
                type="button"
                onClick={handleBulkAutoTranslateAll}
                disabled={isTranslating || !!bulkTranslateProgress || !!cacheRefreshProgress}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-[#c5a869]/30 to-amber-600/20 hover:from-amber-500/30 hover:to-amber-600/30 border border-[#c5a869]/60 text-[#e5cb8e] font-bold text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer disabled:opacity-50"
                title={isAr ? 'ترجمة ومزامنة جميع محتويات وبيانات الموقع بالكامل من العربية إلى الإنجليزية والتركية بنقرة واحدة' : 'Translate and sync all site data to English & Turkish in one click'}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#c5a869]" />
                <span className="hidden sm:inline">{isAr ? 'ترجمة كامل الموقع (EN & TR)' : 'Auto-Translate All'}</span>
                <span className="sm:hidden">{isAr ? 'ترجمة الكل' : 'Translate All'}</span>
              </button>
            )}

            {isAuthenticated && (
              <button
                type="button"
                onClick={handleClearCacheAndRefresh}
                disabled={isTranslating || !!bulkTranslateProgress || !!cacheRefreshProgress}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer disabled:opacity-50"
                title={isAr ? 'مسح ذاكرة التخزين المؤقت (Cache) وتحديث التطبيق مع الحفاظ الكامل على كافة البيانات والإعدادات' : 'Clear cache and refresh app while preserving all data'}
              >
                <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">{isAr ? 'مسح الكاش وتحديث التطبيق' : 'Clear Cache & Update'}</span>
                <span className="sm:hidden">{isAr ? 'تحديث' : 'Refresh'}</span>
              </button>
            )}

            {isAuthenticated && onOpenSuperAdmin && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenSuperAdmin();
                }}
                className="px-3 py-1.5 rounded-xl bg-purple-900/40 hover:bg-purple-900/70 border border-purple-500/50 text-purple-200 font-bold text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                title={isAr ? 'الانتقال إلى لوحة تحكم مدير المنصة الشاملة (Super Admin)' : 'Open Super Admin Platform Dashboard'}
              >
                <Shield className="w-3.5 h-3.5 text-purple-400" />
                <span className="hidden sm:inline">{isAr ? 'إدارة المنصة' : 'Super Admin'}</span>
              </button>
            )}

            {feedback && (
              <span className={`text-xs px-3 py-1.5 rounded-full animate-fade-in font-medium flex items-center gap-1.5 ${
                feedback.type === 'success' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              }`}>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{feedback.msg}</span>
              </span>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
              title={isAr ? 'إغلاق لوحة التحكم' : 'Close Dashboard'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Bulk Translation Progress Modal */}
        {bulkTranslateProgress && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
            <div className="w-full max-w-md p-6 rounded-3xl bg-slate-900 border border-[#c5a869]/60 shadow-2xl text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-[#c5a869]/20 border border-[#c5a869]/50 flex items-center justify-center mx-auto text-[#c5a869]">
                <Sparkles className="w-7 h-7 animate-spin" style={{ animationDuration: '3s' }} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white font-serif-title">
                  {isAr ? 'جاري ترجمة ومزامنة بيانات الموقع...' : 'Translating & Synchronizing All Content...'}
                </h3>
                <p className="text-xs text-slate-300 mt-1 font-mono">
                  {bulkTranslateProgress.label}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
                  <div 
                    className="h-full bg-gradient-to-r from-[#d4af37] via-[#c5a869] to-emerald-400 rounded-full transition-all duration-300"
                    style={{ width: `${bulkTranslateProgress.percent}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>العربية ➡️ الإنجليزية والتركية</span>
                  <span>{bulkTranslateProgress.percent}%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Safe Cache Refresh Progress Modal */}
        {cacheRefreshProgress && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
            <div className="w-full max-w-md p-6 rounded-3xl bg-slate-900 border border-cyan-500/60 shadow-2xl text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center mx-auto text-cyan-400">
                <RefreshCw className="w-7 h-7 animate-spin" style={{ animationDuration: '1.8s' }} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white font-serif-title">
                  {isAr ? 'مسح الكاش وتحديث التطبيق الآمن' : 'Safe Cache Clear & Application Update'}
                </h3>
                <p className="text-xs text-cyan-300 mt-2 font-mono leading-relaxed">
                  {cacheRefreshProgress.status}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-300 flex items-center justify-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{isAr ? 'كافة البيانات محفوظة ومؤمنة في LocalStorage و IndexedDB' : 'All data safely preserved in persistent storage'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Authentication screen if not logged in */}
        {!isAuthenticated ? (
          <div className="flex-grow flex items-center justify-center p-6 bg-[#080e1a]/80">
            <div className="w-full max-w-md p-8 rounded-3xl bg-slate-900/90 border border-slate-800 text-center space-y-5 shadow-2xl">
              <div className="w-16 h-16 rounded-2xl bg-[#c5a869]/15 border border-[#c5a869]/30 flex items-center justify-center mx-auto text-[#c5a869]">
                <Key className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold font-serif-title text-white mb-1">
                  {isAr ? 'تسجيل الدخول الآمن لإدارة المكتب' : 'Law Firm Administration Login'}
                </h3>
                <p className="text-xs text-slate-400">
                  {isAr ? 'اختر مكتبك وأدخل كلمة المرور المخصصة لك من مدير المنصة' : 'Select your firm and enter your administrator credentials'}
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4 text-start">
                {/* Firm Selection */}
                {availableFirms.length > 0 && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
                      {isAr ? 'المكتب القانوني المراد إدارته:' : 'Target Law Firm:'}
                    </label>
                    <div className="relative">
                      <select
                        value={selectedFirmSlug}
                        onChange={(e) => {
                          setSelectedFirmSlug(e.target.value);
                          if (authError) setAuthError(null);
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-amber-200 text-xs focus:border-[#c5a869] focus:outline-none appearance-none"
                      >
                        {availableFirms.map((f) => (
                          <option key={f.slug} value={f.slug} className="bg-slate-900 text-white">
                            {f.nameAr} ({f.slug})
                          </option>
                        ))}
                      </select>
                      <Building2 className="w-4 h-4 text-[#c5a869] absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                )}

                {/* Username / Slug input (Optional / Alternate) */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
                    {isAr ? 'اسم المستخدم أو كود المكتب (اختياري):' : 'Username / Firm Slug (Optional):'}
                  </label>
                  <input
                    type="text"
                    value={usernameInput}
                    onChange={(e) => {
                      setUsernameInput(e.target.value);
                      if (authError) setAuthError(null);
                    }}
                    placeholder={isAr ? 'مثال: al-adel أو info@lawfirm.com' : 'e.g., firm-slug or email'}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-[#c5a869] focus:outline-none"
                  />
                </div>

                {/* Password input */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
                    {isAr ? 'كلمة المرور الإدارية للمكتب:' : 'Firm Admin Password:'}
                  </label>
                  <input
                    type="password"
                    value={passwordInput}
                    onChange={(e) => {
                      setPasswordInput(e.target.value);
                      if (authError) setAuthError(null);
                    }}
                    placeholder={isAr ? 'أدخل كلمة المرور' : 'Enter password'}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-[#c5a869] focus:outline-none"
                    autoFocus
                  />
                </div>

                {authError && (
                  <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs space-y-1 text-center">
                    <p className="flex items-center justify-center gap-1 font-bold">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{authError}</span>
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {isAr ? 'كلمة مرور المكتب الافتراضية: 123456 أو admin | كلمة مدير المنصة: AlAdlAdmin2025' : 'Default password: 123456 or admin | Super Admin: AlAdlAdmin2025'}
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#c5a869] to-[#aa8022] text-slate-950 font-bold text-sm hover:brightness-110 transition cursor-pointer shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoggingIn ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{isAr ? 'جاري التحقق...' : 'Authenticating...'}</span>
                    </>
                  ) : (
                    <span>{isAr ? 'دخول لوحة التحكم' : 'Access Dashboard'}</span>
                  )}
                </button>

                {onOpenSuperAdmin && (
                  <div className="pt-2 border-t border-slate-800/80 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenSuperAdmin();
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-amber-300 text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Shield className="w-3.5 h-3.5 text-amber-400" />
                      <span>{isAr ? 'الوصول المباشر كمدير المنصة الشاملة (Super Admin)' : 'Direct Super Admin Access'}</span>
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        ) : (
          /* Authenticated Dashboard Body */
          <div className="flex-grow flex flex-col md:flex-row overflow-hidden">
            
            {/* Sidebar Navigation */}
            <div className="w-full md:w-64 bg-slate-950/90 border-b md:border-b-0 md:border-l rtl:md:border-l-0 rtl:md:border-r border-slate-800 p-4 flex flex-row md:flex-col gap-1.5 overflow-x-auto md:overflow-y-auto flex-shrink-0">
              
              {/* Active Firm Info & Quick Switch */}
              <div className="hidden md:block mb-2 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
                <div className="flex items-center justify-between gap-1 text-[11px] text-slate-400 mb-1">
                  <span className="flex items-center gap-1 text-[#c5a869] font-bold">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>{isAr ? 'المكتب النشط:' : 'Active Firm:'}</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-500/30">
                    {isAr ? 'متصل' : 'Connected'}
                  </span>
                </div>
                <p className="font-bold text-white text-xs truncate mb-1.5" title={settings.firmNameAr || 'المكتب'}>
                  {settings.firmNameAr || 'مكتب المحاماة'}
                </p>
                {availableFirms.length > 1 && (
                  <select
                    value={firmService.getActiveFirmSlug()}
                    onChange={(e) => {
                      const newSlug = e.target.value;
                      storageService.switchFirm(newSlug);
                      loadData();
                      showToast(isAr ? 'تم التبديل إلى المكتب المحدد بنجاح' : 'Switched firm successfully');
                    }}
                    className="w-full px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-300 text-[11px] focus:outline-none focus:border-[#c5a869]"
                  >
                    {availableFirms.map((f) => (
                      <option key={f.slug} value={f.slug}>
                        {f.nameAr}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Messages Inbox */}
              <button
                onClick={() => { setActiveTab('messages'); setEditingPartner(null); setEditingPractice(null); }}
                className={`w-full px-4 py-3 rounded-xl text-xs sm:text-sm font-medium transition flex items-center justify-between cursor-pointer whitespace-nowrap ${
                  activeTab === 'messages' ? 'bg-[#c5a869] text-slate-950 font-bold shadow-md' : 'text-slate-300 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  <span>{isAr ? 'طلبات الاستشارات' : 'Inquiries Inbox'}</span>
                </div>
                {messages.filter(m => m.status === 'new').length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                    {messages.filter(m => m.status === 'new').length}
                  </span>
                )}
              </button>

              {/* About the Firm & Journey */}
              <button
                onClick={() => { setActiveTab('about'); setEditingPartner(null); setEditingPractice(null); }}
                className={`w-full px-4 py-3 rounded-xl text-xs sm:text-sm font-medium transition flex items-center justify-between cursor-pointer whitespace-nowrap ${
                  activeTab === 'about' ? 'bg-[#c5a869] text-slate-950 font-bold shadow-md' : 'text-slate-300 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span>{isAr ? 'عن المكتب والمسيرة' : 'About & Journey'}</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-[#e5cb8e] font-semibold border border-slate-700">
                  {isAr ? 'القصة والرؤية' : 'Story'}
                </span>
              </button>

              {/* Partners */}
              <button
                onClick={() => { setActiveTab('partners'); setEditingPartner(null); }}
                className={`w-full px-4 py-3 rounded-xl text-xs sm:text-sm font-medium transition flex items-center justify-between cursor-pointer whitespace-nowrap ${
                  activeTab === 'partners' ? 'bg-[#c5a869] text-slate-950 font-bold shadow-md' : 'text-slate-300 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>{isAr ? 'الشركاء والمحامين' : 'Partners & Team'}</span>
                </div>
                <span className="text-[11px] opacity-75 font-mono">({partners.length})</span>
              </button>

              {/* Practices */}
              <button
                onClick={() => { setActiveTab('practices'); setEditingPractice(null); }}
                className={`w-full px-4 py-3 rounded-xl text-xs sm:text-sm font-medium transition flex items-center justify-between cursor-pointer whitespace-nowrap ${
                  activeTab === 'practices' ? 'bg-[#c5a869] text-slate-950 font-bold shadow-md' : 'text-slate-300 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Scale className="w-4 h-4" />
                  <span>{isAr ? 'الاختصاصات والخدمات' : 'Practice Areas'}</span>
                </div>
                <span className="text-[11px] opacity-75 font-mono">({practiceAreas.length})</span>
              </button>

              {/* Landmark Cases */}
              <button
                onClick={() => { setActiveTab('caseStudies'); setEditingCaseStudy(null); }}
                className={`w-full px-4 py-3 rounded-xl text-xs sm:text-sm font-medium transition flex items-center justify-between cursor-pointer whitespace-nowrap ${
                  activeTab === 'caseStudies' ? 'bg-[#c5a869] text-slate-950 font-bold shadow-md' : 'text-slate-300 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4" />
                  <span>{isAr ? 'الإنجازات والصفقات' : 'Landmark Cases'}</span>
                </div>
                <span className="text-[11px] opacity-75 font-mono">({caseStudies.length})</span>
              </button>

              {/* Testimonials */}
              <button
                onClick={() => { setActiveTab('testimonials'); setEditingTestimonial(null); }}
                className={`w-full px-4 py-3 rounded-xl text-xs sm:text-sm font-medium transition flex items-center justify-between cursor-pointer whitespace-nowrap ${
                  activeTab === 'testimonials' ? 'bg-[#c5a869] text-slate-950 font-bold shadow-md' : 'text-slate-300 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  <span>{isAr ? 'آراء وشهادات العملاء' : 'Testimonials'}</span>
                </div>
                <span className="text-[11px] opacity-75 font-mono">({testimonials.length})</span>
              </button>

              {/* Blog */}
              <button
                onClick={() => { setActiveTab('blog'); setEditingBlog(null); }}
                className={`w-full px-4 py-3 rounded-xl text-xs sm:text-sm font-medium transition flex items-center justify-between cursor-pointer whitespace-nowrap ${
                  activeTab === 'blog' ? 'bg-[#c5a869] text-slate-950 font-bold shadow-md' : 'text-slate-300 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span>{isAr ? 'المقالات والمدونة' : 'Legal Blog'}</span>
                </div>
                <span className="text-[11px] opacity-75 font-mono">({blogPosts.length})</span>
              </button>

              {/* Global Offices */}
              <button
                onClick={() => { setActiveTab('offices'); setEditingOffice(null); }}
                className={`w-full px-4 py-3 rounded-xl text-xs sm:text-sm font-medium transition flex items-center justify-between cursor-pointer whitespace-nowrap ${
                  activeTab === 'offices' ? 'bg-[#c5a869] text-slate-950 font-bold shadow-md' : 'text-slate-300 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  <span>{isAr ? 'المقار الدولية والخرائط' : 'Global Offices'}</span>
                </div>
                <span className="text-[11px] opacity-75 font-mono">({offices.length})</span>
              </button>

              {/* Site Settings & Identity */}
              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full px-4 py-3 rounded-xl text-xs sm:text-sm font-medium transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                  activeTab === 'settings' ? 'bg-[#c5a869] text-slate-950 font-bold shadow-md' : 'text-slate-300 hover:bg-slate-900'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>{isAr ? 'الهوية والإحصائيات' : 'Identity & Stats'}</span>
              </button>

              {/* Backup & Data */}
              <button
                onClick={() => setActiveTab('backup')}
                className={`w-full px-4 py-3 rounded-xl text-xs sm:text-sm font-medium transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                  activeTab === 'backup' ? 'bg-[#c5a869] text-slate-950 font-bold shadow-md' : 'text-slate-300 hover:bg-slate-900'
                }`}
              >
                <Download className="w-4 h-4" />
                <span>{isAr ? 'النسخ الاحتياطي والبيانات' : 'Backup & Restore'}</span>
              </button>
            </div>

            {/* Main Content View Area */}
            <div className="flex-grow p-4 sm:p-6 overflow-y-auto bg-[#080e1a]/70">
              
              {/* TAB 1: INQUIRIES & MESSAGES */}
              {activeTab === 'messages' && (
                <div className="space-y-6">
                  {/* Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-bold font-serif-title text-white">
                        {isAr ? 'صندوق استشارات ورسائل الزوار' : 'Client Inquiries & Consultation Requests'}
                      </h3>
                      <p className="text-xs text-slate-400">
                        {isAr ? `إجمالي الرسائل الواردة: ${messages.length} | المعروض: ${filteredMessages.length}` : `Total Inquiries: ${messages.length}`}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* Search */}
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 absolute right-3 top-3 text-slate-400 rtl:right-3 rtl:left-auto" />
                        <input
                          type="text"
                          value={messageSearch}
                          onChange={(e) => setMessageSearch(e.target.value)}
                          placeholder={isAr ? 'بحث بالاسم، الشركة، البريد...' : 'Search inquiries...'}
                          className="px-8 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-[#c5a869] focus:outline-none"
                        />
                      </div>

                      {/* Status Filter */}
                      <select
                        value={messageStatusFilter}
                        onChange={(e) => setMessageStatusFilter(e.target.value as any)}
                        className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-[#c5a869] focus:outline-none"
                      >
                        <option value="all">{isAr ? 'جميع الحالات' : 'All Statuses'}</option>
                        <option value="new">{isAr ? 'جديد (New)' : 'New'}</option>
                        <option value="contacted">{isAr ? 'تم التواصل (Contacted)' : 'Contacted'}</option>
                        <option value="scheduled">{isAr ? 'مجدول (Scheduled)' : 'Scheduled'}</option>
                        <option value="closed">{isAr ? 'مغلق (Closed)' : 'Closed'}</option>
                      </select>

                      {/* Urgent Filter Toggle */}
                      <button
                        onClick={() => setOnlyUrgentMessages(!onlyUrgentMessages)}
                        className={`px-3 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                          onlyUrgentMessages 
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/50' 
                            : 'bg-slate-900 text-slate-400 border-slate-700'
                        }`}
                      >
                        {isAr ? '🔥 العاجلة فقط' : '🔥 Urgent Only'}
                      </button>
                    </div>
                  </div>

                  {filteredMessages.length === 0 ? (
                    <div className="p-12 text-center text-slate-400 bg-slate-900/50 rounded-2xl border border-slate-800">
                      {isAr ? 'لا توجد طلبات استشارة مطابقة لمعايير البحث' : 'No inquiries matching criteria.'}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredMessages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`p-5 rounded-2xl border transition ${
                            msg.isUrgent
                              ? 'bg-rose-950/20 border-rose-500/40'
                              : msg.status === 'new'
                              ? 'bg-slate-900/90 border-[#c5a869]/50 shadow-lg'
                              : 'bg-slate-900/40 border-slate-800'
                          }`}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-white text-base">{msg.fullName}</span>
                              {msg.company && (
                                <span className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                                  {msg.company}
                                </span>
                              )}
                              <span className="text-xs px-2 py-0.5 rounded bg-[#c5a869]/15 text-[#e5cb8e] font-medium">
                                {msg.consultationType}
                              </span>
                              {msg.isUrgent && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500 text-white font-bold animate-pulse">
                                  {isAr ? 'حالة عاجلة' : 'Urgent'}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              {/* Status Select */}
                              <select
                                value={msg.status}
                                onChange={(e) => handleUpdateMessageStatus(msg.id, e.target.value as any)}
                                className={`text-xs px-2.5 py-1 rounded-lg border focus:outline-none cursor-pointer ${
                                  msg.status === 'new'
                                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                    : msg.status === 'contacted'
                                    ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                                    : msg.status === 'scheduled'
                                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                    : 'bg-slate-800 text-slate-400 border-slate-700'
                                }`}
                              >
                                <option value="new">{isAr ? 'جديد' : 'New'}</option>
                                <option value="contacted">{isAr ? 'تم التواصل' : 'Contacted'}</option>
                                <option value="scheduled">{isAr ? 'تمت الجدولة' : 'Scheduled'}</option>
                                <option value="closed">{isAr ? 'مغلق' : 'Closed'}</option>
                              </select>

                              <button
                                onClick={() => handleDeleteMessage(msg.id)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition cursor-pointer"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Contact details */}
                          <div className="flex flex-wrap items-center gap-5 text-xs text-slate-300 mb-3 font-mono">
                            <span className="flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5 text-[#c5a869]" />
                              <a href={`tel:${msg.phone}`} className="hover:underline text-slate-200">{msg.phone}</a>
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Mail className="w-3.5 h-3.5 text-[#c5a869]" />
                              <a href={`mailto:${msg.email}`} className="hover:underline text-slate-200">{msg.email}</a>
                            </span>
                            {msg.preferredDate && (
                              <span className="flex items-center gap-1.5 text-[#e5cb8e]">
                                <Clock className="w-3.5 h-3.5" />
                                <span>{isAr ? 'الموعد المفضل:' : 'Date:'} {msg.preferredDate}</span>
                              </span>
                            )}
                          </div>

                          {/* Message Body */}
                          <p className="text-xs text-slate-200 bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80 whitespace-pre-line leading-relaxed">
                            {msg.message}
                          </p>

                          <div className="mt-2 text-[10px] text-slate-500 text-end">
                            {new Date(msg.createdAt).toLocaleString(isAr ? 'ar-SA' : 'en-US')}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB: ABOUT THE FIRM & JOURNEY (عن المكتب والمسيرة) */}
              {activeTab === 'about' && (
                <div className="space-y-6">
                  {/* Top Bar Header */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-md">
                    <div className="flex items-start sm:items-center gap-3.5">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#c5a869] to-[#87641d] flex items-center justify-center text-slate-950 font-bold flex-shrink-0 shadow-lg">
                        <BookOpen className="w-6 h-6 text-slate-950" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-bold font-serif-title text-white">
                            {isAr ? 'إدارة نصوص «عن المكتب والمسيرة»' : 'About the Firm & Journey Content'}
                          </h3>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#c5a869]/20 text-[#e5cb8e] font-bold border border-[#c5a869]/40">
                            {isAr ? 'محتوى استراتيجي' : 'Core Section'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          {isAr 
                            ? 'تحكم كامل وفوري في قصة التأسيس، العنوان الرئيسي، الرؤية، المنهجية، معايير السرية، الجوائز والصورة بجميع اللغات.' 
                            : 'Full control over the firm history, heading, vision, methodology, confidentiality standards, rankings, and imagery.'}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                      {/* Language Switcher for editing */}
                      <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                        <button
                          type="button"
                          onClick={() => setAboutLangTab('ar')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                            aboutLangTab === 'ar' ? 'bg-[#c5a869] text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          <span>🇸🇦</span>
                          <span>العربية</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setAboutLangTab('en')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                            aboutLangTab === 'en' ? 'bg-[#c5a869] text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          <span>🇬🇧</span>
                          <span>English</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setAboutLangTab('tr')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                            aboutLangTab === 'tr' ? 'bg-[#c5a869] text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          <span>🇹🇷</span>
                          <span>Türkçe</span>
                        </button>
                      </div>

                      {/* Auto-Translate Button */}
                      <button
                        type="button"
                        onClick={handleTranslateCurrentAbout}
                        disabled={isTranslating}
                        className="px-3.5 py-2 rounded-xl bg-purple-950/60 border border-purple-500/40 text-purple-200 hover:bg-purple-900/60 font-bold text-xs flex items-center gap-2 transition disabled:opacity-50 cursor-pointer shadow-sm"
                        title={isAr ? 'ترجمة النصوص العربية تلقائياً للإنجليزية والتركية' : 'Auto-translate Arabic texts to EN & TR'}
                      >
                        {isTranslating ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-300" />
                            <span>{isAr ? 'جاري الترجمة الذكية...' : 'Translating...'}</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                            <span>{isAr ? 'ترجمة ذكية فورية' : 'AI Translate'}</span>
                          </>
                        )}
                      </button>

                      {/* Save Button */}
                      <button
                        type="button"
                        onClick={() => handleSaveAboutSettings()}
                        className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#c5a869] via-[#d4af37] to-[#aa8022] text-slate-950 font-bold text-xs flex items-center gap-2 hover:brightness-110 transition cursor-pointer shadow-lg"
                      >
                        <Save className="w-4 h-4 text-slate-950" />
                        <span>{isAr ? 'حفظ وتطبيق التغييرات' : 'Save Changes'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Quick Narrative Presets */}
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                      <Wand2 className="w-4 h-4 text-[#c5a869]" />
                      <span>{isAr ? 'نماذج صياغة وسرد تاريخي جاهزة للمسيرة:' : 'Quick Pre-written Narrative Templates:'}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSettings({
                            ...settings,
                            aboutBadgeAr: 'عن المكتب والمسيرة',
                            aboutBadgeEn: 'About The Firm & Journey',
                            aboutBadgeTr: 'Büromuz ve Tarihçemiz',
                            aboutHeadingAr: 'أكثر من ربع قرن في حماية الاستثمارات وصناعة القرارات القانونية الفارقة',
                            aboutHeadingEn: 'Over a Quarter Century of Protecting Capital & Shaping High-Stakes Law',
                            aboutHeadingTr: 'Çeyrek asrı aşkın süredir Yatırımları Koruyor ve Stratejik Hukuki Zaferlere İmza Atıyoruz',
                            aboutTextAr: 'تأسس مكتبنا ليكون المرجع القانوني الأول للشركات الكبرى والمؤسسات المالية والمستثمرين الإقليميين والدوليين. نجمع بين العمق الفقهي والنظامي والخبرة الدولية العابرة للحدود، لنقدم استشارات متقدمة وتمثيلاً قضائياً لا يقبل المساومة.',
                            aboutVisionAr: 'أن نكون الحصن القانوني الأكثر موثوقية وتميزاً في الشرق الأوسط، والمساهم الأول في صياغة الحلول القانونية المبتكرة التي تدعم النمو الاقتصادي الآمن للكيانات الاستثمارية.',
                            aboutMethodologyAr: 'نعتمد منهجية التحليل الرباعي للمخاطر وتدقيق السوابق القضائية المتماثلة، حيث يشارك في دراسة كل ملف فريق يضم شريكاً رئيساً ومستشاراً تنفيذياً لضمان فحص الثغرات بدقة متناهية.',
                            aboutConfidentialityAr: 'نطبق بروتوكولات حماية وسرية بيانات مطابقة لأعلى المعايير الأمنية المصرفية الدولية، مع التزام صارم بعدم تعارض المصالح والشفافية الكاملة في تقدير الأتعاب.',
                          });
                          showToast(isAr ? 'تم استدعاء نموذج: التحكيم والنزاعات الكبرى' : 'Applied: Arbitration & High-Stakes Law template');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium transition cursor-pointer border border-slate-700"
                      >
                        ⚖️ {isAr ? 'نموذج: تحكيم وقضاء رائد' : 'Preset: High Litigation'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSettings({
                            ...settings,
                            aboutBadgeAr: 'الريادة والمصرفية',
                            aboutBadgeEn: 'Corporate M&A Legacy',
                            aboutBadgeTr: 'Şirketler & Birleşmeler Mirası',
                            aboutHeadingAr: 'مستشارون استراتيجيون لأكبر عمليات الاستحواذ والتمويل المؤسسي',
                            aboutHeadingEn: 'Strategic Legal Counsel for Landmark Mergers, Acquisitions & Corporate Finance',
                            aboutHeadingTr: 'Büyük Ölçekli Şirket Birleşmeleri ve Kurumsal Finansmanda Stratejik Hukuk Rehberliği',
                            aboutTextAr: 'منذ تأسيسنا، قاد مكتبنا عشرات الصفقات العابرة للحدود وإعادة الهيكلة الشاملة لبيوت المال والشركات القابضة، واضعين حماية رأس المال وتعظيم القيمة الاستثمارية في صميم عملنا اليومي.',
                            aboutVisionAr: 'تمكين المؤسسات الاستثمارية والشركات العائلية من التوسع الآمن وبناء هياكل حوكمة محصنة عالمياً ضد النزاعات والمخاطر التنظيمية.',
                            aboutMethodologyAr: 'دمج التحليل المالي-القانوني المتقدم، وإجراء الفحص النافي للجهالة المتعمق قبل التوقيع، لضمان أعلى مستويات الأمان التعاقدي.',
                            aboutConfidentialityAr: 'سرية بنكية مشددة وتطبيق اتفاقيات الحماية المعلوماتية وفق أرقى ممارسات الصفقات العالمية.',
                          });
                          showToast(isAr ? 'تم استدعاء نموذج: صفقات وحوكمة واستثمار' : 'Applied: Corporate M&A template');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium transition cursor-pointer border border-slate-700"
                      >
                        🏢 {isAr ? 'نموذج: صفقات وحوكمة واستثمار' : 'Preset: Corporate M&A'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSettings({
                            ...settings,
                            aboutBadgeAr: 'الابتكار والاقتصاد الرقمي',
                            aboutBadgeEn: 'Innovation & Tech Legal Architects',
                            aboutBadgeTr: 'Yenilik ve Dijital Ekonomi Hukuku',
                            aboutHeadingAr: 'بناء الحماية القانونية لرواد التقنية والملكية الفكرية واقتصاد المستقبل',
                            aboutHeadingEn: 'Architecting Legal Shields for Frontier Tech, IP Assets & Future Economy',
                            aboutHeadingTr: 'Teknoloji Öncüleri ve Fikri Mülkiyet İçin Geleceğin Hukuki Zırhını İnşa Ediyoruz',
                            aboutTextAr: 'نواكب التسارع الرقمي وثورة الذكاء الاصطناعي وصناديق رأس المال الجريء بحلول قانونية رائدة تحمي الأصول غير الملموسة وتبني عقوداً ذكية متطابقة مع أحدث التشريعات العالمية.',
                            aboutVisionAr: 'قيادة الاستشارات القانونية في قطاعات التكنولوجيا المتقدمة، والفضاء السيبراني، والتكنولوجيا المالية (FinTech) على مستوى المنطقة.',
                            aboutMethodologyAr: 'استباق التحديات التنظيمية ومواءمة نماذج الأعمال المبتكرة مع القوانين الناشئة بمرونة فائقة.',
                            aboutConfidentialityAr: 'تشفير كامل لكافة الأسرار التجارية وبراءات الاختراع والشيفرات البرمجية للموكلين.',
                          });
                          showToast(isAr ? 'تم استدعاء نموذج: تقنية وابتكار' : 'Applied: Innovation & Tech template');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium transition cursor-pointer border border-slate-700"
                      >
                        🚀 {isAr ? 'نموذج: تقنية وابتكار' : 'Preset: Tech & Innovation'}
                      </button>
                    </div>
                  </div>

                  {/* Main Form Tabs Content */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* Left 7 Cols: Inputs according to selected language */}
                    <div className="lg:col-span-7 space-y-6">
                      
                      {/* Section 1: Header, Badge, CTA */}
                      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                            <Tag className="w-4 h-4 text-[#c5a869]" />
                            <span>
                              {isAr ? '1. العنوان الرئيسي وشارة القسم والزر' : '1. Section Header, Badge & Action Button'}
                            </span>
                          </h4>
                          <span className="text-[11px] font-mono text-[#c5a869] font-bold uppercase">
                            [{aboutLangTab.toUpperCase()}]
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Badge Text */}
                          <div>
                            <label className="block text-xs text-slate-300 font-semibold mb-1">
                              {isAr ? 'شارة القسم الصغيرة (Badge)' : 'Section Tag / Badge'}
                            </label>
                            {aboutLangTab === 'ar' ? (
                              <input
                                type="text"
                                value={settings.aboutBadgeAr || ''}
                                onChange={(e) => setSettings({ ...settings, aboutBadgeAr: e.target.value })}
                                placeholder="عن المكتب والمسيرة"
                                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-[#c5a869]"
                              />
                            ) : aboutLangTab === 'en' ? (
                              <input
                                type="text"
                                value={settings.aboutBadgeEn || ''}
                                onChange={(e) => setSettings({ ...settings, aboutBadgeEn: e.target.value })}
                                placeholder="About The Firm & Journey"
                                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-[#c5a869]"
                              />
                            ) : (
                              <input
                                type="text"
                                value={settings.aboutBadgeTr || ''}
                                onChange={(e) => setSettings({ ...settings, aboutBadgeTr: e.target.value })}
                                placeholder="Büromuz ve Tarihçemiz"
                                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-[#c5a869]"
                              />
                            )}
                          </div>

                          {/* CTA Button Text */}
                          <div>
                            <label className="block text-xs text-slate-300 font-semibold mb-1">
                              {isAr ? 'نص زر حجز الجلسة (CTA)' : 'Action Button (CTA)'}
                            </label>
                            {aboutLangTab === 'ar' ? (
                              <input
                                type="text"
                                value={settings.aboutCtaTextAr || ''}
                                onChange={(e) => setSettings({ ...settings, aboutCtaTextAr: e.target.value })}
                                placeholder="حجز جلسة عمل مع الشريك الإداري"
                                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-[#c5a869]"
                              />
                            ) : aboutLangTab === 'en' ? (
                              <input
                                type="text"
                                value={settings.aboutCtaTextEn || ''}
                                onChange={(e) => setSettings({ ...settings, aboutCtaTextEn: e.target.value })}
                                placeholder="Book Strategy Session with Managing Partner"
                                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-[#c5a869]"
                              />
                            ) : (
                              <input
                                type="text"
                                value={settings.aboutCtaTextTr || ''}
                                onChange={(e) => setSettings({ ...settings, aboutCtaTextTr: e.target.value })}
                                placeholder="Yönetici Ortak ile Strateji Görüşmesi Planlayın"
                                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-[#c5a869]"
                              />
                            )}
                          </div>
                        </div>

                        {/* Main Big Heading */}
                        <div>
                          <label className="block text-xs text-slate-300 font-semibold mb-1">
                            {isAr ? 'العنوان الرئيسي العريض (Heading)' : 'Main Big Heading'}
                          </label>
                          {aboutLangTab === 'ar' ? (
                            <input
                              type="text"
                              value={settings.aboutHeadingAr || ''}
                              onChange={(e) => setSettings({ ...settings, aboutHeadingAr: e.target.value })}
                              placeholder="أكثر من ربع قرن في حماية الاستثمارات وصناعة القرارات القانونية الفارقة"
                              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-[#c5a869]"
                            />
                          ) : aboutLangTab === 'en' ? (
                            <input
                              type="text"
                              value={settings.aboutHeadingEn || ''}
                              onChange={(e) => setSettings({ ...settings, aboutHeadingEn: e.target.value })}
                              placeholder="Over a Quarter Century of Protecting Capital & Shaping High-Stakes Law"
                              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-[#c5a869]"
                            />
                          ) : (
                            <input
                              type="text"
                              value={settings.aboutHeadingTr || ''}
                              onChange={(e) => setSettings({ ...settings, aboutHeadingTr: e.target.value })}
                              placeholder="Çeyrek asrı aşkın süredir Yatırımları Koruyor ve Stratejik Hukuki Zaferlere İmza Atıyoruz"
                              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-[#c5a869]"
                            />
                          )}
                        </div>
                      </div>

                      {/* Section 2: Main Narrative / Story */}
                      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                            <History className="w-4 h-4 text-[#c5a869]" />
                            <span>
                              {isAr ? '2. قصة التأسيس والمسيرة التاريخية (الفقرة الرئيسية)' : '2. Founding History & Narrative Story'}
                            </span>
                          </h4>
                          <span className="text-[11px] font-mono text-slate-400">
                            {((aboutLangTab === 'ar' ? settings.aboutTextAr : aboutLangTab === 'en' ? settings.aboutTextEn : settings.aboutTextTr) || '').length} {isAr ? 'حرف' : 'chars'}
                          </span>
                        </div>

                        <div>
                          <label className="block text-xs text-slate-300 font-semibold mb-1">
                            {isAr ? 'نص قصة المسيرة والتأسيس (يدعم فواصل الأسطر والفقرات):' : 'Journey narrative text (supports paragraphs):'}
                          </label>
                          {aboutLangTab === 'ar' ? (
                            <textarea
                              rows={5}
                              value={settings.aboutTextAr || ''}
                              onChange={(e) => setSettings({ ...settings, aboutTextAr: e.target.value })}
                              placeholder="تأسس مكتبنا ليكون المرجع القانوني الأول..."
                              className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-[#c5a869] leading-relaxed"
                            />
                          ) : aboutLangTab === 'en' ? (
                            <textarea
                              rows={5}
                              value={settings.aboutTextEn || ''}
                              onChange={(e) => setSettings({ ...settings, aboutTextEn: e.target.value })}
                              placeholder="Founded to stand as the premier legal authority..."
                              className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-[#c5a869] leading-relaxed"
                            />
                          ) : (
                            <textarea
                              rows={5}
                              value={settings.aboutTextTr || ''}
                              onChange={(e) => setSettings({ ...settings, aboutTextTr: e.target.value })}
                              placeholder="Büromuz, çok uluslu şirketler için..."
                              className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-[#c5a869] leading-relaxed"
                            />
                          )}
                          <p className="text-[11px] text-slate-500 mt-1">
                            {isAr ? '💡 يمكنك كتابة فقرة أو فقرتين لشرح خلفية المكتب وإنجازاته التاريخية.' : 'Tip: You can write multiple paragraphs highlighting firm history.'}
                          </p>
                        </div>
                      </div>

                      {/* Section 3: Vision, Methodology, Standards & Bullets */}
                      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                            <Layers className="w-4 h-4 text-[#c5a869]" />
                            <span>
                              {isAr ? '3. التبويبات التفاعلية الثلاثة (الرؤية / المنهجية / السرية)' : '3. Interactive Tabs (Vision, Methodology, Standards)'}
                            </span>
                          </h4>
                        </div>

                        {/* Tab A: Vision & Mission */}
                        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-3">
                          <div className="flex items-center gap-2 text-xs font-bold text-[#c5a869]">
                            <Target className="w-4 h-4" />
                            <span>{isAr ? 'أ) تبويب: الرؤية والرسالة المستدامة' : 'A) Tab: Vision & Mission'}</span>
                          </div>
                          <div>
                            <label className="block text-[11px] text-slate-400 mb-1">{isAr ? 'النص التفصيلي للرؤية:' : 'Vision paragraph:'}</label>
                            {aboutLangTab === 'ar' ? (
                              <textarea
                                rows={2}
                                value={settings.aboutVisionAr || ''}
                                onChange={(e) => setSettings({ ...settings, aboutVisionAr: e.target.value })}
                                className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-[#c5a869]"
                              />
                            ) : aboutLangTab === 'en' ? (
                              <textarea
                                rows={2}
                                value={settings.aboutVisionEn || ''}
                                onChange={(e) => setSettings({ ...settings, aboutVisionEn: e.target.value })}
                                className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-[#c5a869]"
                              />
                            ) : (
                              <textarea
                                rows={2}
                                value={settings.aboutVisionTr || ''}
                                onChange={(e) => setSettings({ ...settings, aboutVisionTr: e.target.value })}
                                className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-[#c5a869]"
                              />
                            )}
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                            <div>
                              <label className="block text-[10px] text-slate-400 mb-0.5">{isAr ? 'النقطة المدعمة 1:' : 'Bullet Point 1:'}</label>
                              <input
                                type="text"
                                value={(aboutLangTab === 'ar' ? settings.aboutVisionPoint1Ar : aboutLangTab === 'en' ? settings.aboutVisionPoint1En : settings.aboutVisionPoint1Tr) || ''}
                                onChange={(e) => {
                                  if (aboutLangTab === 'ar') setSettings({ ...settings, aboutVisionPoint1Ar: e.target.value });
                                  else if (aboutLangTab === 'en') setSettings({ ...settings, aboutVisionPoint1En: e.target.value });
                                  else setSettings({ ...settings, aboutVisionPoint1Tr: e.target.value });
                                }}
                                placeholder={isAr ? 'حماية استباقية للأصول والمصالح' : 'Proactive asset shielding'}
                                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-[#c5a869]"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] text-slate-400 mb-0.5">{isAr ? 'النقطة المدعمة 2:' : 'Bullet Point 2:'}</label>
                              <input
                                type="text"
                                value={(aboutLangTab === 'ar' ? settings.aboutVisionPoint2Ar : aboutLangTab === 'en' ? settings.aboutVisionPoint2En : settings.aboutVisionPoint2Tr) || ''}
                                onChange={(e) => {
                                  if (aboutLangTab === 'ar') setSettings({ ...settings, aboutVisionPoint2Ar: e.target.value });
                                  else if (aboutLangTab === 'en') setSettings({ ...settings, aboutVisionPoint2En: e.target.value });
                                  else setSettings({ ...settings, aboutVisionPoint2Tr: e.target.value });
                                }}
                                placeholder={isAr ? 'تمثيل قضائي وتحكيمي لا مثيل له' : 'Unmatched arbitral representation'}
                                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-[#c5a869]"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Tab B: Methodology & Analysis */}
                        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-3">
                          <div className="flex items-center gap-2 text-xs font-bold text-[#c5a869]">
                            <Compass className="w-4 h-4" />
                            <span>{isAr ? 'ب) تبويب: منهجية العمل والتحليل' : 'B) Tab: Methodology & Analysis'}</span>
                          </div>
                          <div>
                            <label className="block text-[11px] text-slate-400 mb-1">{isAr ? 'النص التفصيلي للمنهجية:' : 'Methodology paragraph:'}</label>
                            {aboutLangTab === 'ar' ? (
                              <textarea
                                rows={2}
                                value={settings.aboutMethodologyAr || ''}
                                onChange={(e) => setSettings({ ...settings, aboutMethodologyAr: e.target.value })}
                                className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-[#c5a869]"
                              />
                            ) : aboutLangTab === 'en' ? (
                              <textarea
                                rows={2}
                                value={settings.aboutMethodologyEn || ''}
                                onChange={(e) => setSettings({ ...settings, aboutMethodologyEn: e.target.value })}
                                className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-[#c5a869]"
                              />
                            ) : (
                              <textarea
                                rows={2}
                                value={settings.aboutMethodologyTr || ''}
                                onChange={(e) => setSettings({ ...settings, aboutMethodologyTr: e.target.value })}
                                className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-[#c5a869]"
                              />
                            )}
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                            <div>
                              <label className="block text-[10px] text-slate-400 mb-0.5">{isAr ? 'النقطة المدعمة 1:' : 'Bullet Point 1:'}</label>
                              <input
                                type="text"
                                value={(aboutLangTab === 'ar' ? settings.aboutMethodologyPoint1Ar : aboutLangTab === 'en' ? settings.aboutMethodologyPoint1En : settings.aboutMethodologyPoint1Tr) || ''}
                                onChange={(e) => {
                                  if (aboutLangTab === 'ar') setSettings({ ...settings, aboutMethodologyPoint1Ar: e.target.value });
                                  else if (aboutLangTab === 'en') setSettings({ ...settings, aboutMethodologyPoint1En: e.target.value });
                                  else setSettings({ ...settings, aboutMethodologyPoint1Tr: e.target.value });
                                }}
                                placeholder={isAr ? 'تدقيق قانوني نافي للجهالة متكامل' : 'Comprehensive due diligence'}
                                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-[#c5a869]"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] text-slate-400 mb-0.5">{isAr ? 'النقطة المدعمة 2:' : 'Bullet Point 2:'}</label>
                              <input
                                type="text"
                                value={(aboutLangTab === 'ar' ? settings.aboutMethodologyPoint2Ar : aboutLangTab === 'en' ? settings.aboutMethodologyPoint2En : settings.aboutMethodologyPoint2Tr) || ''}
                                onChange={(e) => {
                                  if (aboutLangTab === 'ar') setSettings({ ...settings, aboutMethodologyPoint2Ar: e.target.value });
                                  else if (aboutLangTab === 'en') setSettings({ ...settings, aboutMethodologyPoint2En: e.target.value });
                                  else setSettings({ ...settings, aboutMethodologyPoint2Tr: e.target.value });
                                }}
                                placeholder={isAr ? 'صياغة عقود محصنة من النزاعات' : 'Dispute-proof contractual drafting'}
                                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-[#c5a869]"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Tab C: Confidentiality & Standards */}
                        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-3">
                          <div className="flex items-center gap-2 text-xs font-bold text-[#c5a869]">
                            <Shield className="w-4 h-4" />
                            <span>{isAr ? 'ج) تبويب: السرية والأمان والامتثال الدولي' : 'C) Tab: Confidentiality & Security Standards'}</span>
                          </div>
                          <div>
                            <label className="block text-[11px] text-slate-400 mb-1">{isAr ? 'النص التفصيلي للسرية:' : 'Confidentiality paragraph:'}</label>
                            {aboutLangTab === 'ar' ? (
                              <textarea
                                rows={2}
                                value={settings.aboutConfidentialityAr || ''}
                                onChange={(e) => setSettings({ ...settings, aboutConfidentialityAr: e.target.value })}
                                className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-[#c5a869]"
                              />
                            ) : aboutLangTab === 'en' ? (
                              <textarea
                                rows={2}
                                value={settings.aboutConfidentialityEn || ''}
                                onChange={(e) => setSettings({ ...settings, aboutConfidentialityEn: e.target.value })}
                                className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-[#c5a869]"
                              />
                            ) : (
                              <textarea
                                rows={2}
                                value={settings.aboutConfidentialityTr || ''}
                                onChange={(e) => setSettings({ ...settings, aboutConfidentialityTr: e.target.value })}
                                className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-[#c5a869]"
                              />
                            )}
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                            <div>
                              <label className="block text-[10px] text-slate-400 mb-0.5">{isAr ? 'النقطة المدعمة 1:' : 'Bullet Point 1:'}</label>
                              <input
                                type="text"
                                value={(aboutLangTab === 'ar' ? settings.aboutConfidentialityPoint1Ar : aboutLangTab === 'en' ? settings.aboutConfidentialityPoint1En : settings.aboutConfidentialityPoint1Tr) || ''}
                                onChange={(e) => {
                                  if (aboutLangTab === 'ar') setSettings({ ...settings, aboutConfidentialityPoint1Ar: e.target.value });
                                  else if (aboutLangTab === 'en') setSettings({ ...settings, aboutConfidentialityPoint1En: e.target.value });
                                  else setSettings({ ...settings, aboutConfidentialityPoint1Tr: e.target.value });
                                }}
                                placeholder={isAr ? 'اتفاقيات عدم إفصاح مغلظة' : 'Stringent NDA protocols'}
                                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-[#c5a869]"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] text-slate-400 mb-0.5">{isAr ? 'النقطة المدعمة 2:' : 'Bullet Point 2:'}</label>
                              <input
                                type="text"
                                value={(aboutLangTab === 'ar' ? settings.aboutConfidentialityPoint2Ar : aboutLangTab === 'en' ? settings.aboutConfidentialityPoint2En : settings.aboutConfidentialityPoint2Tr) || ''}
                                onChange={(e) => {
                                  if (aboutLangTab === 'ar') setSettings({ ...settings, aboutConfidentialityPoint2Ar: e.target.value });
                                  else if (aboutLangTab === 'en') setSettings({ ...settings, aboutConfidentialityPoint2En: e.target.value });
                                  else setSettings({ ...settings, aboutConfidentialityPoint2Tr: e.target.value });
                                }}
                                placeholder={isAr ? 'قنوات اتصال مشفرة مع الموكلين' : 'Encrypted client communications'}
                                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-[#c5a869]"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Section 4: Award/Ranking Card */}
                      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                            <Trophy className="w-4 h-4 text-[#c5a869]" />
                            <span>
                              {isAr ? '4. بطاقة التصنيف والجوائز الدولية العائمة' : '4. Floating Award & Ranking Card'}
                            </span>
                          </h4>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs text-slate-300 font-semibold mb-1">
                              {isAr ? 'عنوان الجائزة / التصنيف:' : 'Award / Ranking Title:'}
                            </label>
                            <input
                              type="text"
                              value={(aboutLangTab === 'ar' ? settings.aboutRankingTitleAr : aboutLangTab === 'en' ? settings.aboutRankingTitleEn : settings.aboutRankingTitleTr) || ''}
                              onChange={(e) => {
                                if (aboutLangTab === 'ar') setSettings({ ...settings, aboutRankingTitleAr: e.target.value });
                                else if (aboutLangTab === 'en') setSettings({ ...settings, aboutRankingTitleEn: e.target.value });
                                else setSettings({ ...settings, aboutRankingTitleTr: e.target.value });
                              }}
                              placeholder={isAr ? 'مصنف كأفضل مكتب محاماة للشركات والتحكيم' : 'Ranked Top-Tier Corporate Firm'}
                              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-[#c5a869]"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-slate-300 font-semibold mb-1">
                              {isAr ? 'وصف جهة الاعتماد / السنة:' : 'Accreditation / Year Description:'}
                            </label>
                            <input
                              type="text"
                              value={(aboutLangTab === 'ar' ? settings.aboutRankingDescAr : aboutLangTab === 'en' ? settings.aboutRankingDescEn : settings.aboutRankingDescTr) || ''}
                              onChange={(e) => {
                                if (aboutLangTab === 'ar') setSettings({ ...settings, aboutRankingDescAr: e.target.value });
                                else if (aboutLangTab === 'en') setSettings({ ...settings, aboutRankingDescEn: e.target.value });
                                else setSettings({ ...settings, aboutRankingDescTr: e.target.value });
                              }}
                              placeholder={isAr ? 'وفق التصنيف القانوني الدولي 2024-2026' : 'According to Global Legal Directories 2024-2026'}
                              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-[#c5a869]"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right 5 Cols: Visual Image + Live Interactive Preview */}
                    <div className="lg:col-span-5 space-y-6">
                      
                      {/* Image Manager & Presets */}
                      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                          <ImageIcon className="w-4 h-4 text-[#c5a869]" />
                          <span>{isAr ? 'صورة قسم عن المكتب والمسيرة' : 'About Section Visual & Image'}</span>
                        </h4>

                        <ImageUploader
                          value={settings.aboutImageUrl || PRESET_ABOUT_IMAGES[0]}
                          onChange={(url) => setSettings({ ...settings, aboutImageUrl: url })}
                          label={isAr ? 'صورة قاعة الاجتماعات أو المقر الرئيسي' : 'Boardroom or HQ Image'}
                          presets={PRESET_ABOUT_IMAGES}
                          aspectRatio="wide"
                          lang={lang}
                        />

                        {/* Preset options */}
                        <div>
                          <label className="block text-[11px] text-slate-400 font-semibold mb-2">
                            {isAr ? 'أو اختر من الصور الفاخرة المعتمدة:' : 'Or choose from certified executive imagery:'}
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            {PRESET_ABOUT_IMAGES.map((imgUrl, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => setSettings({ ...settings, aboutImageUrl: imgUrl })}
                                className={`relative rounded-lg overflow-hidden h-16 border-2 transition cursor-pointer group ${
                                  settings.aboutImageUrl === imgUrl ? 'border-[#c5a869] shadow-md ring-2 ring-[#c5a869]/30' : 'border-slate-800 opacity-70 hover:opacity-100'
                                }`}
                              >
                                <img src={imgUrl} alt={`Preset ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition" />
                                {settings.aboutImageUrl === imgUrl && (
                                  <div className="absolute inset-0 bg-[#c5a869]/30 flex items-center justify-center">
                                    <Check className="w-4 h-4 text-white drop-shadow-md" />
                                  </div>
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Live Interactive Preview Card */}
                      <div className="p-5 rounded-2xl bg-[#f7f2e8] border border-[#c5a869]/40 shadow-xl space-y-4 text-slate-900">
                        <div className="flex items-center justify-between border-b border-[#e6ddcc] pb-2">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-[#87641d]">
                            <Eye className="w-4 h-4" />
                            <span>{isAr ? 'معاينة تفاعلية حية (مظهر القسم الفعلي):' : 'Live Interactive Preview:'}</span>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-[#b38a38]/15 text-[#87641d] font-bold">
                            {aboutLangTab.toUpperCase()}
                          </span>
                        </div>

                        {/* Miniature Render */}
                        <div className="space-y-3">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#b38a38]/15 text-[#87641d] text-[10px] font-bold">
                            <BookOpen className="w-3 h-3" />
                            <span>
                              {aboutLangTab === 'ar' ? (settings.aboutBadgeAr || 'عن المكتب والمسيرة') : aboutLangTab === 'en' ? (settings.aboutBadgeEn || 'About Us') : (settings.aboutBadgeTr || 'Hakkımızda')}
                            </span>
                          </div>

                          <h3 className="text-sm font-bold text-[#181512] font-serif leading-snug">
                            {aboutLangTab === 'ar' ? (settings.aboutHeadingAr || 'أكثر من ربع قرن في حماية الاستثمارات') : aboutLangTab === 'en' ? (settings.aboutHeadingEn || 'Over a Quarter Century...') : (settings.aboutHeadingTr || 'Çeyrek asrı aşkın süredir...')}
                          </h3>

                          <p className="text-xs text-[#4b4334] line-clamp-3 leading-relaxed">
                            {aboutLangTab === 'ar' ? (settings.aboutTextAr || 'نبذة المكتب...') : aboutLangTab === 'en' ? (settings.aboutTextEn || 'Firm narrative...') : (settings.aboutTextTr || 'Büro hikayesi...')}
                          </p>

                          {/* Mini Tabs */}
                          <div className="flex gap-2 border-b border-[#e6ddcc] pb-1 pt-1">
                            {(['vision', 'methodology', 'standards'] as const).map((tab) => (
                              <button
                                key={tab}
                                type="button"
                                onClick={() => setAboutPreviewTab(tab)}
                                className={`text-[11px] pb-1 font-bold border-b-2 transition cursor-pointer ${
                                  aboutPreviewTab === tab ? 'border-[#b38a38] text-[#87641d]' : 'border-transparent text-slate-500'
                                }`}
                              >
                                {tab === 'vision' ? (isAr ? 'الرؤية' : 'Vision') : tab === 'methodology' ? (isAr ? 'المنهجية' : 'Method') : (isAr ? 'السرية' : 'Standards')}
                              </button>
                            ))}
                          </div>

                          {/* Mini Tab Content */}
                          <div className="text-[11px] text-[#4b4334] bg-white/80 p-2.5 rounded-xl border border-[#e6ddcc]">
                            {aboutPreviewTab === 'vision' && (
                              <div>
                                <p className="line-clamp-2">{aboutLangTab === 'ar' ? settings.aboutVisionAr : aboutLangTab === 'en' ? settings.aboutVisionEn : settings.aboutVisionTr}</p>
                                <div className="mt-1 flex items-center gap-1 text-[10px] text-[#2c261e] font-semibold">
                                  <CheckCircle2 className="w-3 h-3 text-[#b38a38]" />
                                  <span>{aboutLangTab === 'ar' ? settings.aboutVisionPoint1Ar : settings.aboutVisionPoint1En || 'حماية استباقية'}</span>
                                </div>
                              </div>
                            )}
                            {aboutPreviewTab === 'methodology' && (
                              <div>
                                <p className="line-clamp-2">{aboutLangTab === 'ar' ? settings.aboutMethodologyAr : aboutLangTab === 'en' ? settings.aboutMethodologyEn : settings.aboutMethodologyTr}</p>
                                <div className="mt-1 flex items-center gap-1 text-[10px] text-[#2c261e] font-semibold">
                                  <CheckCircle2 className="w-3 h-3 text-[#b38a38]" />
                                  <span>{aboutLangTab === 'ar' ? settings.aboutMethodologyPoint1Ar : settings.aboutMethodologyPoint1En || 'تدقيق نافي للجهالة'}</span>
                                </div>
                              </div>
                            )}
                            {aboutPreviewTab === 'standards' && (
                              <div>
                                <p className="line-clamp-2">{aboutLangTab === 'ar' ? settings.aboutConfidentialityAr : aboutLangTab === 'en' ? settings.aboutConfidentialityEn : settings.aboutConfidentialityTr}</p>
                                <div className="mt-1 flex items-center gap-1 text-[10px] text-[#2c261e] font-semibold">
                                  <CheckCircle2 className="w-3 h-3 text-[#b38a38]" />
                                  <span>{aboutLangTab === 'ar' ? settings.aboutConfidentialityPoint1Ar : settings.aboutConfidentialityPoint1En || 'سرية بنكية مشددة'}</span>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Mini CTA button */}
                          <div className="pt-2">
                            <button
                              type="button"
                              className="w-full py-2 rounded-xl bg-gradient-to-r from-[#b38a38] via-[#c5a869] to-[#87641d] text-white font-bold text-xs shadow"
                            >
                              {aboutLangTab === 'ar' ? (settings.aboutCtaTextAr || 'حجز جلسة عمل') : aboutLangTab === 'en' ? (settings.aboutCtaTextEn || 'Book Strategy Session') : (settings.aboutCtaTextTr || 'Strateji Görüşmesi')}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: PARTNERS & ATTORNEYS MANAGEMENT */}
              {activeTab === 'partners' && (
                <div className="space-y-6">
                  {/* Top Bar Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-bold font-serif-title text-white flex items-center gap-2">
                        <Users className="w-5 h-5 text-[#c5a869]" />
                        <span>{isAr ? 'إدارة الشركاء وهيئة المحامين والمستشارين' : 'Partners, Attorneys & Legal Counsel'}</span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        {isAr 
                          ? 'إدارة شاملة لجميع أعضاء الفريق القانوني (شركاء، محامون مشاركون، ومستشارون) وتحديد صفتهم ومؤهلاتهم' 
                          : 'Comprehensive management for firm partners, non-partner associate attorneys, and legal advisors.'}
                      </p>
                    </div>

                    {!editingPartner && (
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Add Partner Button */}
                        <button
                          onClick={() => setEditingPartner({
                            id: `partner-${Date.now()}`,
                            name: '',
                            nameEn: '',
                            title: 'شريك في المكتب ومستشار',
                            titleEn: 'Partner & Senior Legal Advisor',
                            specialty: 'الشركات والاستثمار التجاري',
                            specialtyEn: 'Corporate & Investment Advisory',
                            experienceYears: 15,
                            education: ['ماجستير في القانون التجاري الدولي'],
                            bio: '',
                            bioEn: '',
                            email: 'partner@aladllaw.com',
                            phone: '+966 11 456 7890',
                            linkedin: 'https://linkedin.com',
                            image: PRESET_PARTNER_IMAGES[0],
                            featured: true,
                            barAdmission: 'الهيئة السعودية للمحامين (شريك ممارس)',
                            languages: ['العربية', 'الإنجليزية'],
                            casesWonCount: 150,
                            isPartner: true,
                            roleCategory: 'partner'
                          })}
                          className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#c5a869] to-[#d4af37] text-slate-950 font-bold text-xs flex items-center gap-1.5 hover:brightness-110 transition cursor-pointer shadow-md"
                        >
                          <Plus className="w-4 h-4" />
                          <span>{isAr ? '+ إضافة شريك' : '+ Add Partner'}</span>
                        </button>

                        {/* Add Associate (Non-Partner Lawyer) Button */}
                        <button
                          onClick={() => setEditingPartner({
                            id: `attorney-${Date.now()}`,
                            name: '',
                            nameEn: '',
                            title: 'محامٍ مشارك أول - قسم التقاضي والعقود',
                            titleEn: 'Senior Associate Attorney - Litigation & Commercial Contracts',
                            specialty: 'التقاضي التجاري والعمالي وصياغة المذكرات',
                            specialtyEn: 'Commercial Litigation & Contract Drafting',
                            experienceYears: 8,
                            education: ['بكالوريوس في الأنظمة والقانون'],
                            bio: '',
                            bioEn: '',
                            email: 'attorney@aladllaw.com',
                            phone: '+966 11 456 7890',
                            linkedin: 'https://linkedin.com',
                            image: PRESET_PARTNER_IMAGES[4] || PRESET_PARTNER_IMAGES[0],
                            featured: false,
                            barAdmission: 'الهيئة السعودية للمحامين (رخصة محامٍ ممارس)',
                            languages: ['العربية', 'الإنجليزية'],
                            casesWonCount: 95,
                            isPartner: false,
                            roleCategory: 'associate'
                          })}
                          className="px-3.5 py-2 rounded-xl bg-cyan-600/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-600/30 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <UserPlus className="w-4 h-4 text-cyan-400" />
                          <span>{isAr ? '+ إضافة محامٍ (غير شريك)' : '+ Add Associate Attorney'}</span>
                        </button>

                        {/* Add Counsel Button */}
                        <button
                          onClick={() => setEditingPartner({
                            id: `counsel-${Date.now()}`,
                            name: '',
                            nameEn: '',
                            title: 'مستشار قانوني أول',
                            titleEn: 'Senior Legal Counsel & Regulatory Advisor',
                            specialty: 'الاستشارات التنظيمية والتحكيم والامتثال',
                            specialtyEn: 'Regulatory Compliance & International Arbitration',
                            experienceYears: 14,
                            education: ['ماجستير في القانون والتحكيم التجاري'],
                            bio: '',
                            bioEn: '',
                            email: 'counsel@aladllaw.com',
                            phone: '+966 11 456 7890',
                            linkedin: 'https://linkedin.com',
                            image: PRESET_PARTNER_IMAGES[5] || PRESET_PARTNER_IMAGES[1],
                            featured: false,
                            barAdmission: 'ترخيص استشارات قانونية / تحكيم',
                            languages: ['العربية', 'الإنجليزية'],
                            casesWonCount: 180,
                            isPartner: false,
                            roleCategory: 'counsel'
                          })}
                          className="px-3.5 py-2 rounded-xl bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600/30 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <Briefcase className="w-4 h-4 text-emerald-400" />
                          <span>{isAr ? '+ إضافة مستشار' : '+ Add Legal Counsel'}</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {!editingPartner && (
                    /* Search & Category Filter Bar */
                    <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      {/* Search Bar */}
                      <div className="relative flex-grow max-w-md">
                        <Search className="w-4 h-4 absolute right-3 top-2.5 text-slate-400 rtl:right-3 rtl:left-auto" />
                        <input
                          type="text"
                          value={partnerSearch}
                          onChange={(e) => setPartnerSearch(e.target.value)}
                          placeholder={isAr ? 'بحث بالاسم، المسمى المهني، أو الاختصاص...' : 'Search attorneys by name, role, specialty...'}
                          className="w-full px-9 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-[#c5a869] focus:outline-none"
                        />
                        {partnerSearch && (
                          <button
                            onClick={() => setPartnerSearch('')}
                            className="absolute left-3 top-2.5 text-slate-400 hover:text-white text-xs rtl:left-3 rtl:right-auto cursor-pointer"
                          >
                            ✕
                          </button>
                        )}
                      </div>

                      {/* Filter Badges */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          onClick={() => setPartnerRoleFilter('all')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                            partnerRoleFilter === 'all'
                              ? 'bg-[#c5a869] text-slate-950 font-bold shadow'
                              : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                          }`}
                        >
                          {isAr ? 'الكل' : 'All'} ({partners.length})
                        </button>

                        <button
                          onClick={() => setPartnerRoleFilter('partner')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                            partnerRoleFilter === 'partner'
                              ? 'bg-amber-500/25 text-amber-300 border border-amber-500/60 font-bold shadow'
                              : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                          }`}
                        >
                          <span>👔 {isAr ? 'الشركاء فقط' : 'Partners'}</span>
                          <span className="text-[10px] opacity-80">({partners.filter(p => p.isPartner !== false).length})</span>
                        </button>

                        <button
                          onClick={() => setPartnerRoleFilter('associate')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                            partnerRoleFilter === 'associate'
                              ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-500/60 font-bold shadow'
                              : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                          }`}
                        >
                          <span>⚖️ {isAr ? 'المحامون المشاركون (غير الشركاء)' : 'Associates'}</span>
                          <span className="text-[10px] opacity-80">
                            ({partners.filter(p => p.isPartner === false && (p.roleCategory === 'associate' || p.roleCategory === 'trainee' || !p.roleCategory)).length})
                          </span>
                        </button>

                        <button
                          onClick={() => setPartnerRoleFilter('counsel')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                            partnerRoleFilter === 'counsel'
                              ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/60 font-bold shadow'
                              : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                          }`}
                        >
                          <span>📜 {isAr ? 'المستشارون' : 'Legal Counsel'}</span>
                          <span className="text-[10px] opacity-80">
                            ({partners.filter(p => p.isPartner === false && (p.roleCategory === 'counsel' || p.roleCategory === 'legal_consultant')).length})
                          </span>
                        </button>
                      </div>
                    </div>
                  )}

                  {editingPartner ? (
                    /* Partner & Lawyer Edit Form */
                    <form onSubmit={handleSavePartner} className="p-6 rounded-2xl bg-slate-900 border border-[#c5a869]/50 space-y-5 shadow-2xl">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                        <div>
                          <h4 className="text-base font-bold text-[#e5cb8e] flex items-center gap-2">
                            {editingPartner.isPartner === false ? (
                              <>
                                <Scale className="w-5 h-5 text-cyan-400" />
                                <span>{isAr ? 'تعديل / إضافة محامٍ أو مستشار (غير شريك)' : 'Edit Associate / Counsel Details'}</span>
                              </>
                            ) : (
                              <>
                                <UserCheck className="w-5 h-5 text-amber-400" />
                                <span>{isAr ? 'تعديل / إضافة شريك في المكتب' : 'Edit Partner Details'}</span>
                              </>
                            )}
                          </h4>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {isAr ? 'املأ الحقول بدقة، يمكنك تحديد ما إذا كان المحامي شريكاً أو محامياً مشاركاً أو مستشاراً' : 'Set partnership status, category, credentials and bio'}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handleTranslateCurrentPartner}
                            disabled={isTranslating}
                            className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-[#e5cb8e] border border-amber-500/50 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50 shadow-sm"
                            title={isAr ? 'ترجمة فورية وتلقائية للإنجليزية والتركية من الحقول العربية' : 'Auto-translate to English & Turkish from Arabic fields'}
                          >
                            {isTranslating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5 text-[#c5a869]" />}
                            <span>{isAr ? '✨ ترجمة فورية (EN & TR)' : '✨ Translate to EN & TR'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setEditingPartner(null)}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-300 hover:text-white hover:bg-slate-700 transition cursor-pointer"
                          >
                            {isAr ? 'إلغاء' : 'Cancel'}
                          </button>
                        </div>
                      </div>

                      {/* Membership & Partnership Selector */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                        <label className="block text-xs font-bold text-slate-200">
                          {isAr ? 'نوع العضوية والصفة القانونية في المكتب:' : 'Membership & Role Type in Firm:'}
                        </label>

                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                          {/* 1. Partner */}
                          <div
                            onClick={() => setEditingPartner({ ...editingPartner, isPartner: true, roleCategory: 'partner' })}
                            className={`p-3 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                              editingPartner.isPartner !== false
                                ? 'bg-amber-500/15 border-amber-500/60 ring-1 ring-amber-500/50'
                                : 'bg-slate-900 border-slate-800 hover:border-slate-700 opacity-70'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-lg">👔</span>
                              {editingPartner.isPartner !== false && <Check className="w-4 h-4 text-amber-400" />}
                            </div>
                            <div className="mt-2">
                              <p className="text-xs font-bold text-white">{isAr ? 'شريك في المكتب' : 'Equity Partner'}</p>
                              <p className="text-[10px] text-slate-400">{isAr ? 'عضو هيئة الشركاء' : 'Partner'}</p>
                            </div>
                          </div>

                          {/* 2. Associate Attorney */}
                          <div
                            onClick={() => setEditingPartner({ ...editingPartner, isPartner: false, roleCategory: 'associate' })}
                            className={`p-3 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                              editingPartner.isPartner === false && (editingPartner.roleCategory === 'associate' || !editingPartner.roleCategory)
                                ? 'bg-cyan-500/15 border-cyan-500/60 ring-1 ring-cyan-500/50'
                                : 'bg-slate-900 border-slate-800 hover:border-slate-700 opacity-70'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-lg">⚖️</span>
                              {editingPartner.isPartner === false && (editingPartner.roleCategory === 'associate' || !editingPartner.roleCategory) && (
                                <Check className="w-4 h-4 text-cyan-400" />
                              )}
                            </div>
                            <div className="mt-2">
                              <p className="text-xs font-bold text-white">{isAr ? 'محامٍ مشارك (غير شريك)' : 'Associate Attorney'}</p>
                              <p className="text-[10px] text-slate-400">{isAr ? 'محامٍ مرخص وممارس' : 'Non-Partner Lawyer'}</p>
                            </div>
                          </div>

                          {/* 3. Counsel */}
                          <div
                            onClick={() => setEditingPartner({ ...editingPartner, isPartner: false, roleCategory: 'counsel' })}
                            className={`p-3 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                              editingPartner.isPartner === false && (editingPartner.roleCategory === 'counsel' || editingPartner.roleCategory === 'legal_consultant')
                                ? 'bg-emerald-500/15 border-emerald-500/60 ring-1 ring-emerald-500/50'
                                : 'bg-slate-900 border-slate-800 hover:border-slate-700 opacity-70'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-lg">📜</span>
                              {editingPartner.isPartner === false && (editingPartner.roleCategory === 'counsel' || editingPartner.roleCategory === 'legal_consultant') && (
                                <Check className="w-4 h-4 text-emerald-400" />
                              )}
                            </div>
                            <div className="mt-2">
                              <p className="text-xs font-bold text-white">{isAr ? 'مستشار قانوني' : 'Legal Counsel'}</p>
                              <p className="text-[10px] text-slate-400">{isAr ? 'استشارات تنظيمية وتحكيم' : 'Advisor / Of Counsel'}</p>
                            </div>
                          </div>

                          {/* 4. Trainee */}
                          <div
                            onClick={() => setEditingPartner({ ...editingPartner, isPartner: false, roleCategory: 'trainee' })}
                            className={`p-3 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                              editingPartner.isPartner === false && editingPartner.roleCategory === 'trainee'
                                ? 'bg-purple-500/15 border-purple-500/60 ring-1 ring-purple-500/50'
                                : 'bg-slate-900 border-slate-800 hover:border-slate-700 opacity-70'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-lg">🎓</span>
                              {editingPartner.isPartner === false && editingPartner.roleCategory === 'trainee' && (
                                <Check className="w-4 h-4 text-purple-400" />
                              )}
                            </div>
                            <div className="mt-2">
                              <p className="text-xs font-bold text-white">{isAr ? 'محامٍ متدرب' : 'Trainee Lawyer'}</p>
                              <p className="text-[10px] text-slate-400">{isAr ? 'تحت التدريب والإشراف' : 'Junior / Trainee'}</p>
                            </div>
                          </div>
                        </div>

                        {/* Quick Title Auto-Fill Helpers */}
                        <div className="pt-2 border-t border-slate-900 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400">
                          <span className="text-slate-300 font-semibold">{isAr ? 'مسميات مقترحة سريعة:' : 'Quick Title Presets:'}</span>
                          <button
                            type="button"
                            onClick={() => setEditingPartner({ 
                              ...editingPartner, 
                              title: 'شريك رئيسي ومستشار', 
                              titleEn: 'Senior Partner & Legal Advisor',
                              isPartner: true,
                              roleCategory: 'senior_partner'
                            })}
                            className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 cursor-pointer"
                          >
                            شريك رئيسي
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingPartner({ 
                              ...editingPartner, 
                              title: 'شريك إداري ورئيس التقاضي', 
                              titleEn: 'Managing Partner & Head of Litigation',
                              isPartner: true,
                              roleCategory: 'partner'
                            })}
                            className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 cursor-pointer"
                          >
                            شريك إداري
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingPartner({ 
                              ...editingPartner, 
                              title: 'محامٍ مشارك أول - قسم الشركات', 
                              titleEn: 'Senior Associate Attorney - Corporate Law',
                              isPartner: false,
                              roleCategory: 'associate'
                            })}
                            className="px-2 py-0.5 rounded bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 cursor-pointer"
                          >
                            محامٍ مشارك أول
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingPartner({ 
                              ...editingPartner, 
                              title: 'محامية مشاركة ومستشارة عقود', 
                              titleEn: 'Associate Attorney & Contracts Advisor',
                              isPartner: false,
                              roleCategory: 'associate'
                            })}
                            className="px-2 py-0.5 rounded bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 cursor-pointer"
                          >
                            محامية مشاركة
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingPartner({ 
                              ...editingPartner, 
                              title: 'مستشار قانوني أول وخبير تحكيم', 
                              titleEn: 'Senior Legal Counsel & Arbitration Expert',
                              isPartner: false,
                              roleCategory: 'counsel'
                            })}
                            className="px-2 py-0.5 rounded bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 cursor-pointer"
                          >
                            مستشار قانوني أول
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingPartner({ 
                              ...editingPartner, 
                              title: 'محامٍ متدرب وباحث قانوني', 
                              titleEn: 'Trainee Lawyer & Legal Researcher',
                              isPartner: false,
                              roleCategory: 'trainee'
                            })}
                            className="px-2 py-0.5 rounded bg-purple-950 hover:bg-purple-900 text-purple-300 border border-purple-800 cursor-pointer"
                          >
                            محامٍ متدرب
                          </button>
                        </div>
                      </div>

                      {/* Photo preview & Device Upload */}
                      <ImageUploader
                        value={editingPartner.image}
                        onChange={(newImg) => setEditingPartner({ ...editingPartner, image: newImg })}
                        label={isAr ? "صورة المحامي / الشريك الشخصية" : "Portrait Photo"}
                        labelEn="Attorney Portrait Photo"
                        lang={lang}
                        presets={PRESET_PARTNER_IMAGES}
                        aspectRatio="portrait"
                        helpText={isAr ? "يمكنك رفع صورة عالية الدقة من جهازك أو اختيار أحد النماذج الجاهزة." : "Upload high-res photo from your device."}
                      />

                      {/* Names */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">{isAr ? 'الاسم بالعربية *' : 'Name (Arabic) *'}</label>
                          <input
                            type="text"
                            required
                            placeholder="مثال: أ.د. طارق السبيعي"
                            value={editingPartner.name}
                            onChange={(e) => setEditingPartner({ ...editingPartner, name: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-[#c5a869] focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">{isAr ? 'الاسم بالإنجليزية *' : 'Name in English *'}</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Prof. Dr. Tariq Al-Subaie"
                            value={editingPartner.nameEn}
                            onChange={(e) => setEditingPartner({ ...editingPartner, nameEn: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-[#c5a869] focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Titles */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">{isAr ? 'المسمى المهني بالعربية *' : 'Professional Title (Arabic) *'}</label>
                          <input
                            type="text"
                            required
                            placeholder="مثال: محامٍ مشارك أول - قسم الشركات"
                            value={editingPartner.title}
                            onChange={(e) => setEditingPartner({ ...editingPartner, title: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-[#c5a869] focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">{isAr ? 'المسمى المهني بالإنجليزية *' : 'Title (English) *'}</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Senior Associate Attorney - Corporate"
                            value={editingPartner.titleEn}
                            onChange={(e) => setEditingPartner({ ...editingPartner, titleEn: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-[#c5a869] focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Specialty & Stats */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">{isAr ? 'مجال الاختصاص الرئيسي بالعربية *' : 'Primary Specialty (Arabic) *'}</label>
                          <input
                            type="text"
                            required
                            placeholder="مثال: النزاعات التجارية والتحكيم"
                            value={editingPartner.specialty}
                            onChange={(e) => setEditingPartner({ ...editingPartner, specialty: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-[#c5a869] focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">{isAr ? 'سنوات الخبرة' : 'Years of Experience'}</label>
                          <input
                            type="number"
                            value={editingPartner.experienceYears}
                            onChange={(e) => setEditingPartner({ ...editingPartner, experienceYears: parseInt(e.target.value) || 0 })}
                            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-[#c5a869] focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">{isAr ? 'ترخيص المحاماة / القيد' : 'Bar Admission / License'}</label>
                          <input
                            type="text"
                            placeholder="مثال: الهيئة السعودية للمحامين (رقم 1432)"
                            value={editingPartner.barAdmission}
                            onChange={(e) => setEditingPartner({ ...editingPartner, barAdmission: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-[#c5a869] focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* English Specialty, Won cases, Languages */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">{isAr ? 'مجال الاختصاص بالإنجليزية *' : 'Specialty in English *'}</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Commercial Litigation & Arbitration"
                            value={editingPartner.specialtyEn}
                            onChange={(e) => setEditingPartner({ ...editingPartner, specialtyEn: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-[#c5a869] focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">القضايا والملفات المنجزة (+)</label>
                          <input
                            type="number"
                            value={editingPartner.casesWonCount || 100}
                            onChange={(e) => setEditingPartner({ ...editingPartner, casesWonCount: parseInt(e.target.value) || 0 })}
                            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-[#c5a869] focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">اللغات المتقنة (مفصولة بفواصل)</label>
                          <input
                            type="text"
                            value={editingPartner.languages?.join(', ') || 'العربية, الإنجليزية'}
                            onChange={(e) => {
                              const list = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                              setEditingPartner({ ...editingPartner, languages: list });
                            }}
                            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-[#c5a869] focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Education item list builder */}
                      <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                        <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                          <GraduationCap className="w-4 h-4 text-[#c5a869]" />
                          <span>المؤهلات والشهادات الأكاديمية</span>
                        </label>
                        <div className="space-y-1.5 mb-3">
                          {editingPartner.education.map((edu, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                              <span className="text-slate-200">• {edu}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = editingPartner.education.filter((_, i) => i !== idx);
                                  setEditingPartner({ ...editingPartner, education: updated });
                                }}
                                className="text-rose-400 hover:text-rose-300 text-[11px] cursor-pointer"
                              >
                                حذف
                              </button>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={tempEducationItem}
                            onChange={(e) => setTempEducationItem(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                if (tempEducationItem.trim()) {
                                  setEditingPartner({
                                    ...editingPartner,
                                    education: [...editingPartner.education, tempEducationItem.trim()]
                                  });
                                  setTempEducationItem('');
                                }
                              }
                            }}
                            placeholder="مثال: ماجستير في قانون الأعمال - جامعة الملك سعود"
                            className="flex-grow px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-[#c5a869] focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (tempEducationItem.trim()) {
                                setEditingPartner({
                                  ...editingPartner,
                                  education: [...editingPartner.education, tempEducationItem.trim()]
                                });
                                setTempEducationItem('');
                              }
                            }}
                            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-[#c5a869] hover:text-slate-950 text-xs font-semibold transition cursor-pointer"
                          >
                            + إضافة مؤهل
                          </button>
                        </div>
                      </div>

                      {/* Contact Info (Email, Phone, LinkedIn) */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">البريد الإلكتروني المهني</label>
                          <input
                            type="email"
                            value={editingPartner.email}
                            onChange={(e) => setEditingPartner({ ...editingPartner, email: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-[#c5a869] focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">الهاتف المباشر</label>
                          <input
                            type="text"
                            value={editingPartner.phone}
                            onChange={(e) => setEditingPartner({ ...editingPartner, phone: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-[#c5a869] focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">رابط LinkedIn</label>
                          <input
                            type="text"
                            value={editingPartner.linkedin}
                            onChange={(e) => setEditingPartner({ ...editingPartner, linkedin: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-[#c5a869] focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Bio in Arabic */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          {isAr ? 'النبذة المهنية للمحامي / الشريك *' : 'Professional Bio *'}
                        </label>
                        <textarea
                          rows={3}
                          required
                          placeholder="سيرة مختصرة تشمل الخبرات والمرافعات وأبرز الإنجازات..."
                          value={editingPartner.bio}
                          onChange={(e) => setEditingPartner({ ...editingPartner, bio: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-[#c5a869] focus:outline-none leading-relaxed"
                        />
                      </div>

                      {/* Featured Checkbox */}
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="partnerFeatured"
                            checked={editingPartner.featured}
                            onChange={(e) => setEditingPartner({ ...editingPartner, featured: e.target.checked })}
                            className="w-4 h-4 accent-[#c5a869] cursor-pointer"
                          />
                          <label htmlFor="partnerFeatured" className="text-xs text-slate-200 cursor-pointer font-medium">
                            {isAr ? '⭐ إبراز هذا المحامي / الشريك في الصفحة الرئيسية للموقع' : '⭐ Feature prominently on Homepage'}
                          </label>
                        </div>
                        <span className="text-[11px] text-slate-400">
                          {editingPartner.featured ? (isAr ? 'نعم (مميّز)' : 'Featured') : (isAr ? 'عرض قياسي' : 'Standard')}
                        </span>
                      </div>

                      {/* Submit Actions */}
                      <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                        <button
                          type="button"
                          onClick={() => setEditingPartner(null)}
                          className="px-4 py-2 rounded-lg text-slate-400 hover:text-white text-xs cursor-pointer"
                        >
                          {isAr ? 'إلغاء' : 'Cancel'}
                        </button>
                        <button
                          type="submit"
                          className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-[#c5a869] to-[#d4af37] text-slate-950 font-bold text-xs hover:brightness-110 transition flex items-center gap-1.5 shadow-lg cursor-pointer"
                        >
                          <Save className="w-4 h-4" />
                          <span>
                            {isAr 
                              ? (editingPartner.isPartner === false ? 'حفظ بيانات المحامي' : 'حفظ بيانات الشريك')
                              : 'Save Member Details'}
                          </span>
                        </button>
                      </div>
                    </form>
                  ) : (
                    /* Legal Team Grid */
                    <div className="space-y-4">
                      {/* Filtered list rendering */}
                      {(() => {
                        const filtered = partners.filter((p) => {
                          const matchSearch = partnerSearch === '' ||
                            p.name.toLowerCase().includes(partnerSearch.toLowerCase()) ||
                            p.nameEn.toLowerCase().includes(partnerSearch.toLowerCase()) ||
                            p.title.toLowerCase().includes(partnerSearch.toLowerCase()) ||
                            p.specialty.toLowerCase().includes(partnerSearch.toLowerCase());

                          let matchRole = true;
                          if (partnerRoleFilter === 'partner') {
                            matchRole = p.isPartner !== false;
                          } else if (partnerRoleFilter === 'associate') {
                            matchRole = p.isPartner === false && (p.roleCategory === 'associate' || p.roleCategory === 'trainee' || !p.roleCategory);
                          } else if (partnerRoleFilter === 'counsel') {
                            matchRole = p.isPartner === false && (p.roleCategory === 'counsel' || p.roleCategory === 'legal_consultant');
                          }

                          return matchSearch && matchRole;
                        });

                        if (filtered.length === 0) {
                          return (
                            <div className="text-center py-12 rounded-2xl bg-slate-900/40 border border-slate-800">
                              <Users className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                              <p className="text-slate-300 font-bold text-sm">
                                {isAr ? 'لا توجد نتائج مطابقة للبحث أو التصفية' : 'No team members matching your filter'}
                              </p>
                              <p className="text-slate-500 text-xs mt-1">
                                {isAr ? 'جرّب تغيير كلمات البحث أو إضافة محامٍ جديد' : 'Try adjusting your search criteria'}
                              </p>
                            </div>
                          );
                        }

                        return (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filtered.map((partner) => {
                              const isPartner = partner.isPartner !== false;
                              const isCounsel = partner.roleCategory === 'counsel' || partner.roleCategory === 'legal_consultant';
                              const isTrainee = partner.roleCategory === 'trainee';

                              return (
                                <div 
                                  key={partner.id} 
                                  className={`p-4 rounded-2xl bg-slate-900/90 border transition-all duration-200 flex flex-col justify-between hover:shadow-xl ${
                                    isPartner 
                                      ? 'border-amber-500/30 hover:border-amber-400/70' 
                                      : isCounsel
                                      ? 'border-emerald-500/30 hover:border-emerald-400/70'
                                      : isTrainee
                                      ? 'border-purple-500/30 hover:border-purple-400/70'
                                      : 'border-cyan-500/30 hover:border-cyan-400/70'
                                  }`}
                                >
                                  <div>
                                    {/* Top Row: Photo & Role Badge */}
                                    <div className="flex items-start gap-3">
                                      <div className="relative">
                                        <img
                                          src={partner.image}
                                          alt={partner.name}
                                          className="w-16 h-20 rounded-xl object-cover border border-slate-700 flex-shrink-0"
                                        />
                                        {partner.featured && (
                                          <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 rounded-full bg-[#c5a869] text-slate-950 text-[9px] font-extrabold shadow">
                                            ★
                                          </span>
                                        )}
                                      </div>

                                      <div className="flex-grow min-w-0">
                                        {/* Status Badge */}
                                        <div className="mb-1.5 flex flex-wrap items-center gap-1">
                                          {isPartner ? (
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                              👔 {isAr ? 'شريك في المكتب' : 'Partner'}
                                            </span>
                                          ) : isCounsel ? (
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                              📜 {isAr ? 'مستشار قانوني' : 'Counsel'}
                                            </span>
                                          ) : isTrainee ? (
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                                              🎓 {isAr ? 'محامٍ متدرب' : 'Trainee'}
                                            </span>
                                          ) : (
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                                              ⚖️ {isAr ? 'محامٍ مشارك (غير شريك)' : 'Associate Attorney'}
                                            </span>
                                          )}
                                        </div>

                                        <h4 className="font-bold text-white text-sm truncate">{partner.name}</h4>
                                        <p className="text-[11px] text-[#c5a869] line-clamp-1 mt-0.5">{partner.title}</p>
                                        <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{partner.specialty}</p>
                                      </div>
                                    </div>

                                    {/* Stats line */}
                                    <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                                      <span>⏳ {partner.experienceYears} {isAr ? 'سنة خبرة' : 'Yrs Exp'}</span>
                                      <span>⚖️ {partner.casesWonCount || 0}+ {isAr ? 'قضية' : 'Cases'}</span>
                                    </div>
                                  </div>

                                  {/* Action Buttons */}
                                  <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-800">
                                    <span className="text-[10px] text-slate-500 font-mono truncate max-w-[120px]">
                                      {partner.barAdmission || 'الهيئة السعودية'}
                                    </span>

                                    <div className="flex items-center gap-3">
                                      <button
                                        onClick={() => setEditingPartner(partner)}
                                        className="text-xs text-[#e5cb8e] hover:underline flex items-center gap-1 cursor-pointer font-medium"
                                      >
                                        <Edit3 className="w-3.5 h-3.5" />
                                        <span>{isAr ? 'تعديل' : 'Edit'}</span>
                                      </button>
                                      <button
                                        onClick={() => handleDeletePartner(partner.id, partner.name)}
                                        className="text-xs text-rose-400 hover:text-rose-300 hover:underline flex items-center gap-1 cursor-pointer font-medium"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        <span>{isAr ? 'حذف' : 'Delete'}</span>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: PRACTICE AREAS */}
              {activeTab === 'practices' && (
                <div className="space-y-6">
                  {/* Top Bar with Add Button and Controls */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-bold font-serif-title text-white flex items-center gap-2">
                        <span>{isAr ? 'إدارة الاختصاصات والتصنيفات القانونية' : 'Practice Areas & Category Management'}</span>
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-[#c5a869]/20 text-[#c5a869] border border-[#c5a869]/40">
                          {practiceAreas.length} {isAr ? 'اختصاص' : 'Practices'}
                        </span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {isAr 
                          ? 'إضافة وتعديل الاختصاصات وتغيير تصنيفاتها وتحديد الشركاء المشرفين ونطاق الخدمات' 
                          : 'Manage practice areas, change classifications, assign lead partners and key services'}
                      </p>
                    </div>

                    {!editingPractice && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setShowCustomCategoryInput(false);
                            setEditingPractice({
                              id: `practice-${Date.now()}`,
                              title: '',
                              titleEn: '',
                              category: 'corporate',
                              categoryLabelAr: 'قانون الشركات والاستحواذ',
                              categoryLabelEn: 'Corporate & M&A',
                              iconName: 'Scale',
                              shortDesc: '',
                              shortDescEn: '',
                              fullDesc: '',
                              fullDescEn: '',
                              keyServices: ['صياغة وتدقيق العقود والاتفاقيات', 'التمثيل أمام الهيئات القضائية والتحكيمية', 'تقديم الاستشارات الوقائية والتنظيمية'],
                              keyServicesEn: ['Contract Drafting & Review', 'Judicial Representation', 'Regulatory & Compliance Advisory'],
                              casesCount: 85,
                              image: PRESET_PRACTICE_IMAGES[0]
                            });
                          }}
                          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#c5a869] to-[#d4af37] text-slate-950 font-bold text-xs flex items-center gap-1.5 hover:brightness-110 transition cursor-pointer shadow-lg"
                        >
                          <Plus className="w-4 h-4" />
                          <span>{isAr ? '+ إضافة اختصاص قانوني جديد' : '+ Add New Practice'}</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Search and Category Filter Toolbar (Visible when not editing) */}
                  {!editingPractice && (
                    <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                      <div className="flex flex-col sm:flex-row items-center gap-3">
                        {/* Search input */}
                        <div className="relative flex-grow w-full">
                          <Search className="w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 right-3 rtl:right-3 rtl:left-auto ltr:left-3 ltr:right-auto" />
                          <input
                            type="text"
                            placeholder={isAr ? "بحث بالاسم، التصنيف، أو الكلمات المفتاحية..." : "Search by name, category, or keywords..."}
                            value={practiceSearch}
                            onChange={(e) => setPracticeSearch(e.target.value)}
                            className="w-full pr-9 pl-4 rtl:pr-9 rtl:pl-4 ltr:pl-9 ltr:pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-[#c5a869] focus:outline-none"
                          />
                        </div>

                        {/* Reset Filter Button if active */}
                        {(practiceSearch || practiceCategoryFilter !== 'all') && (
                          <button
                            onClick={() => {
                              setPracticeSearch('');
                              setPracticeCategoryFilter('all');
                            }}
                            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs whitespace-nowrap cursor-pointer"
                          >
                            {isAr ? 'إعادة ضبط التصفية' : 'Reset Filter'}
                          </button>
                        )}
                      </div>

                      {/* Category Filter Pills */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[11px] font-semibold text-slate-400 ml-1 rtl:ml-1 ltr:mr-1 flex items-center gap-1">
                          <Filter className="w-3 h-3 text-[#c5a869]" />
                          {isAr ? 'تصفية حسب التصنيف:' : 'Filter by Category:'}
                        </span>

                        <button
                          type="button"
                          onClick={() => setPracticeCategoryFilter('all')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                            practiceCategoryFilter === 'all'
                              ? 'bg-[#c5a869] text-slate-950 font-bold shadow'
                              : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                          }`}
                        >
                          {isAr ? 'الكل' : 'All'} ({practiceAreas.length})
                        </button>

                        {(() => {
                          const uniqueCats = Array.from(new Set(practiceAreas.map(p => p.category).filter(Boolean)));
                          return uniqueCats.map((catKey) => {
                            const count = practiceAreas.filter(p => p.category === catKey).length;
                            const preset = PRESET_PRACTICE_CATEGORIES.find(p => p.id === catKey);
                            const sample = practiceAreas.find(p => p.category === catKey);
                            const label = sample?.categoryLabelAr || preset?.labelAr || catKey;
                            const isSelected = practiceCategoryFilter === catKey;

                            return (
                              <button
                                key={catKey}
                                type="button"
                                onClick={() => setPracticeCategoryFilter(catKey)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1 cursor-pointer ${
                                  isSelected
                                    ? 'bg-[#c5a869] text-slate-950 font-bold shadow'
                                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                                }`}
                              >
                                <span>{preset?.icon || '📁'}</span>
                                <span>{label}</span>
                                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-slate-950/30 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                                  {count}
                                </span>
                              </button>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  )}

                  {editingPractice ? (
                    /* Practice Edit & Creation Form */
                    <form onSubmit={handleSavePractice} className="p-6 sm:p-7 rounded-2xl bg-slate-900 border border-[#c5a869]/50 space-y-6 shadow-2xl">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-[#c5a869]/20 border border-[#c5a869]/40 flex items-center justify-center text-[#c5a869]">
                            <Layers className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-white">
                              {editingPractice.title ? (isAr ? `تعديل اختصاص: ${editingPractice.title}` : `Edit: ${editingPractice.title}`) : (isAr ? 'إضافة اختصاص قانوني جديد' : 'New Practice Area')}
                            </h4>
                            <p className="text-[11px] text-slate-400">
                              {isAr ? 'حدّد أو عدّل التصنيف القانوني، المسمى، المشرف ونطاق الخدمات المشمولة' : 'Set category, title, supervising lead attorney and services'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handleTranslateCurrentPractice}
                            disabled={isTranslating}
                            className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-[#e5cb8e] border border-amber-500/50 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50 shadow-sm"
                            title={isAr ? 'ترجمة فورية وتلقائية للإنجليزية والتركية' : 'Auto-translate to English & Turkish'}
                          >
                            {isTranslating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5 text-[#c5a869]" />}
                            <span>{isAr ? '✨ ترجمة فورية (EN & TR)' : '✨ Translate to EN & TR'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setEditingPractice(null)}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-300 hover:text-white hover:bg-slate-700 transition cursor-pointer"
                          >
                            {isAr ? 'إلغاء' : 'Cancel'}
                          </button>

                          <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-mono hidden sm:inline-block">
                            ID: {editingPractice.id}
                          </span>
                        </div>
                      </div>

                      {/* --- SECTION 1: CATEGORY / CLASSIFICATION SELECTION & EDITING --- */}
                      <div className="p-5 rounded-2xl bg-slate-950/80 border border-[#c5a869]/30 space-y-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                          <div>
                            <label className="text-xs font-bold text-[#e5cb8e] flex items-center gap-1.5">
                              <Tag className="w-4 h-4 text-[#c5a869]" />
                              <span>{isAr ? 'التصنيف القانوني للاختصاص *' : 'Legal Practice Category *'}</span>
                            </label>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              {isAr ? 'اختر من التصنيفات القياسية المعتمدة، أو قم بتعديل وتسمية تصنيف مخصص بحرية تامة:' : 'Choose a standard classification or customize your own:'}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-slate-400">{isAr ? 'التصنيف الحالي:' : 'Current Category:'}</span>
                            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#c5a869]/20 text-[#e5cb8e] border border-[#c5a869]/40">
                              {editingPractice.categoryLabelAr || editingPractice.category}
                            </span>
                          </div>
                        </div>

                        {/* Quick 1-Click Category Selection Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                          {PRESET_PRACTICE_CATEGORIES.map((cat) => {
                            const isSelected = editingPractice.category === cat.id;
                            return (
                              <button
                                key={cat.id}
                                type="button"
                                onClick={() => {
                                  setEditingPractice({
                                    ...editingPractice,
                                    category: cat.id,
                                    categoryLabelAr: cat.labelAr,
                                    categoryLabelEn: cat.labelEn,
                                  });
                                }}
                                className={`p-2.5 rounded-xl border text-right rtl:text-right ltr:text-left transition flex items-center gap-2 cursor-pointer ${
                                  isSelected
                                    ? 'bg-[#c5a869]/20 border-[#c5a869] text-white shadow-md ring-1 ring-[#c5a869]/50'
                                    : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                                }`}
                              >
                                <span className="text-base flex-shrink-0">{cat.icon}</span>
                                <div className="min-w-0 flex-grow">
                                  <p className="text-[11px] font-bold truncate leading-tight">{isAr ? cat.labelAr : cat.labelEn}</p>
                                  <p className="text-[9px] text-slate-400 truncate mt-0.5">{cat.id}</p>
                                </div>
                                {isSelected && (
                                  <Check className="w-3.5 h-3.5 text-[#c5a869] flex-shrink-0" />
                                )}
                              </button>
                            );
                          })}

                          {/* Custom Category Button */}
                          <button
                            type="button"
                            onClick={() => {
                              setShowCustomCategoryInput(true);
                              if (PRESET_PRACTICE_CATEGORIES.some(c => c.id === editingPractice.category)) {
                                setEditingPractice({
                                  ...editingPractice,
                                  category: 'custom_' + Date.now().toString().slice(-4),
                                  categoryLabelAr: 'تصنيف مخصص جديد',
                                  categoryLabelEn: 'Custom Practice Category',
                                });
                              }
                            }}
                            className={`p-2.5 rounded-xl border text-right rtl:text-right ltr:text-left transition flex items-center gap-2 cursor-pointer ${
                              !PRESET_PRACTICE_CATEGORIES.some(c => c.id === editingPractice.category) || showCustomCategoryInput
                                ? 'bg-amber-500/20 border-amber-400 text-amber-200 ring-1 ring-amber-400/50'
                                : 'bg-slate-900/90 border-dashed border-slate-700 text-slate-400 hover:border-[#c5a869] hover:text-slate-200'
                            }`}
                          >
                            <span className="text-base flex-shrink-0">✨</span>
                            <div className="min-w-0 flex-grow">
                              <p className="text-[11px] font-bold truncate leading-tight">{isAr ? 'تصنيف مخصص يدوي' : 'Custom Category'}</p>
                              <p className="text-[9px] text-slate-400 truncate mt-0.5">{isAr ? 'إدخال اسم جديد' : 'New name'}</p>
                            </div>
                          </button>
                        </div>

                        {/* Editable Classification Inputs (Allows changing/renaming category code and display name) */}
                        <div className="pt-3 border-t border-slate-800/80">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-semibold text-slate-300">
                              {isAr ? '✏️ تعديل مسمى ورمز التصنيف المختار:' : '✏️ Edit Category Code & Label:'}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {isAr ? 'يمكنك تعديل مسمى ورمز التصنيف بحرية' : 'Freely customize category code and name'}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                                {isAr ? 'رمز التصنيف الداخلي *' : 'Category Key *'}
                              </label>
                              <input
                                type="text"
                                required
                                value={editingPractice.category}
                                onChange={(e) => setEditingPractice({ ...editingPractice, category: e.target.value })}
                                placeholder="e.g. corporate, finance, health_law"
                                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:border-[#c5a869] focus:outline-none"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                                {isAr ? 'اسم التصنيف القانوني *' : 'Category Title *'}
                              </label>
                              <input
                                type="text"
                                required
                                value={editingPractice.categoryLabelAr || ''}
                                onChange={(e) => setEditingPractice({ ...editingPractice, categoryLabelAr: e.target.value })}
                                placeholder="مثال: قانون الشركات والاستحواذ"
                                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-[#c5a869] focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* --- SECTION 2: PRACTICE DETAILS (Title, Icon & Supervising Lead Attorney) --- */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">{isAr ? 'اسم الاختصاص القانوني *' : 'Practice Area Title *'}</label>
                        <input
                          type="text"
                          required
                          placeholder="مثال: قانون الشركات والصفقات والاندماج"
                          value={editingPractice.title}
                          onChange={(e) => setEditingPractice({ ...editingPractice, title: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-[#c5a869] focus:outline-none"
                        />
                      </div>

                      {/* Icon Selector & Supervising Lead Partner */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Icon picker */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">
                            {isAr ? 'أيقونة الاختصاص' : 'Practice Icon'}
                          </label>
                          <select
                            value={editingPractice.iconName}
                            onChange={(e) => setEditingPractice({ ...editingPractice, iconName: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-[#c5a869] focus:outline-none"
                          >
                            {PRESET_PRACTICE_ICONS.map((ic) => (
                              <option key={ic.name} value={ic.name}>
                                {ic.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Lead Partner / Attorney Assignment */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">
                            {isAr ? 'المحامي / الشريك المشرف على الاختصاص' : 'Supervising Lead Partner'}
                          </label>
                          <select
                            value={editingPractice.leadPartnerId || ''}
                            onChange={(e) => setEditingPractice({ ...editingPractice, leadPartnerId: e.target.value || undefined })}
                            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-[#c5a869] focus:outline-none"
                          >
                            <option value="">{isAr ? '-- بدون تعيين شريك محدد --' : '-- None Assigned --'}</option>
                            {partners.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name} - ({p.title})
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Cases Count */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">
                            {isAr ? 'عدد القضايا / المعاملات المنجزة (+)' : 'Cases / Deals Completed'}
                          </label>
                          <input
                            type="number"
                            value={editingPractice.casesCount}
                            onChange={(e) => setEditingPractice({ ...editingPractice, casesCount: parseInt(e.target.value) || 0 })}
                            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-[#c5a869] focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Practice Area Image selector & Device Upload */}
                      <ImageUploader
                        value={editingPractice.image}
                        onChange={(newImg) => setEditingPractice({ ...editingPractice, image: newImg })}
                        label={isAr ? "صورة غلاف وخلفية الاختصاص" : "Practice Cover Backdrop"}
                        labelEn="Practice Cover Image"
                        lang={lang}
                        presets={PRESET_PRACTICE_IMAGES}
                        aspectRatio="video"
                        helpText={isAr ? "ارفع صورة خلفية عالية الدقة من جهازك أو اختر من النماذج المعمارية الفاخرة." : "Upload high-res background from device or choose preset."}
                      />

                      {/* Short description */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          {isAr ? 'الوصف الموجز للاختصاص *' : 'Short Description *'}
                        </label>
                        <textarea
                          rows={2}
                          required
                          placeholder="نبذة موجزة تظهر في بطاقة الاختصاص..."
                          value={editingPractice.shortDesc}
                          onChange={(e) => setEditingPractice({ ...editingPractice, shortDesc: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-[#c5a869] focus:outline-none"
                        />
                      </div>

                      {/* Full description */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          {isAr ? 'الوصف التفصيلي الكامل للاختصاص' : 'Full Detailed Overview'}
                        </label>
                        <textarea
                          rows={3}
                          placeholder="شرح متكامل يظهر في النافذة المنبثقة للاختصاص واستعراض الخبرات..."
                          value={editingPractice.fullDesc}
                          onChange={(e) => setEditingPractice({ ...editingPractice, fullDesc: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-[#c5a869] focus:outline-none"
                        />
                      </div>

                      {/* Key services dynamic builder */}
                      <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          {isAr ? 'قائمة الخدمات والحلول المشمولة ضمن هذا الاختصاص' : 'Scope of Services Included'}
                        </label>
                        
                        <div className="space-y-1.5 mb-3">
                          {editingPractice.keyServices.map((srv, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs bg-slate-900 p-2 rounded-lg border border-slate-800">
                              <span className="text-slate-200">• {srv}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = editingPractice.keyServices.filter((_, i) => i !== idx);
                                  setEditingPractice({ ...editingPractice, keyServices: updated });
                                }}
                                className="text-rose-400 hover:underline text-[11px] cursor-pointer"
                              >
                                {isAr ? 'حذف' : 'Remove'}
                              </button>
                            </div>
                          ))}
                        </div>

                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={tempServiceItem}
                            onChange={(e) => setTempServiceItem(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                if (tempServiceItem.trim()) {
                                  setEditingPractice({
                                    ...editingPractice,
                                    keyServices: [...editingPractice.keyServices, tempServiceItem.trim()]
                                  });
                                  setTempServiceItem('');
                                }
                              }
                            }}
                            placeholder={isAr ? "اكتب خدمة جديدة (مثال: تدقيق العقود النافي للجهالة) ثم اضغط إضافة..." : "Type service and press add..."}
                            className="flex-grow px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-[#c5a869] focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (tempServiceItem.trim()) {
                                setEditingPractice({
                                  ...editingPractice,
                                  keyServices: [...editingPractice.keyServices, tempServiceItem.trim()]
                                });
                                setTempServiceItem('');
                              }
                            }}
                            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-[#c5a869] hover:text-slate-950 text-xs font-semibold text-slate-200 transition cursor-pointer"
                          >
                            + {isAr ? 'إضافة خدمة' : 'Add Service'}
                          </button>
                        </div>
                      </div>

                      {/* Submit & Cancel Actions */}
                      <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                        <button
                          type="button"
                          onClick={() => setEditingPractice(null)}
                          className="px-4 py-2 rounded-lg text-slate-400 hover:text-white text-xs cursor-pointer"
                        >
                          {isAr ? 'إلغاء' : 'Cancel'}
                        </button>
                        <button
                          type="submit"
                          className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-[#c5a869] to-[#d4af37] text-slate-950 font-bold text-xs hover:brightness-110 transition flex items-center gap-1.5 shadow-lg cursor-pointer"
                        >
                          <Save className="w-4 h-4" />
                          <span>{isAr ? 'حفظ وتثبيت الاختصاص والتصنيف' : 'Save Practice & Category'}</span>
                        </button>
                      </div>
                    </form>
                  ) : (
                    /* Practice Areas Grid List */
                    <div className="space-y-4">
                      {(() => {
                        const filtered = practiceAreas.filter((p) => {
                          const matchSearch = practiceSearch === '' ||
                            p.title.toLowerCase().includes(practiceSearch.toLowerCase()) ||
                            p.titleEn.toLowerCase().includes(practiceSearch.toLowerCase()) ||
                            p.category.toLowerCase().includes(practiceSearch.toLowerCase()) ||
                            (p.categoryLabelAr && p.categoryLabelAr.toLowerCase().includes(practiceSearch.toLowerCase())) ||
                            p.shortDesc.toLowerCase().includes(practiceSearch.toLowerCase());

                          const matchCategory = practiceCategoryFilter === 'all' || p.category === practiceCategoryFilter;
                          return matchSearch && matchCategory;
                        });

                        if (filtered.length === 0) {
                          return (
                            <div className="text-center py-12 rounded-2xl bg-slate-900/40 border border-slate-800">
                              <Layers className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                              <p className="text-slate-300 font-bold text-sm">
                                {isAr ? 'لا توجد اختصاصات مطابقة للبحث أو التصنيف المحدد' : 'No practice areas matching your search'}
                              </p>
                              <p className="text-slate-500 text-xs mt-1">
                                {isAr ? 'جرّب إعادة تعيين التصفية أو أضف اختصاصاً جديداً' : 'Try adjusting your filters or add a new practice area'}
                              </p>
                            </div>
                          );
                        }

                        return (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filtered.map((practice) => {
                              const preset = PRESET_PRACTICE_CATEGORIES.find(c => c.id === practice.category);
                              const categoryDisplay = practice.categoryLabelAr || preset?.labelAr || practice.category;
                              const leadPartner = partners.find(p => p.id === practice.leadPartnerId);

                              return (
                                <div 
                                  key={practice.id} 
                                  className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-[#c5a869]/50 transition-all duration-200 flex flex-col justify-between hover:shadow-xl group"
                                >
                                  <div>
                                    {/* Top Row: Category Pill & Case count */}
                                    <div className="flex items-start justify-between gap-2 mb-3">
                                      <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[#c5a869]/15 text-[#e5cb8e] border border-[#c5a869]/30 flex items-center gap-1 truncate max-w-[70%]">
                                        <span>{preset?.icon || '📁'}</span>
                                        <span className="truncate">{categoryDisplay}</span>
                                      </span>

                                      <span className="text-xs text-[#c5a869] font-mono font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                                        +{practice.casesCount} {isAr ? 'قضية' : 'Cases'}
                                      </span>
                                    </div>

                                    {/* Practice Title */}
                                    <h4 className="font-bold text-white text-base leading-snug group-hover:text-[#e5cb8e] transition-colors mb-1.5">
                                      {practice.title}
                                    </h4>

                                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
                                      {practice.shortDesc}
                                    </p>

                                    {/* Lead Partner if assigned */}
                                    {leadPartner && (
                                      <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center gap-2 mb-2">
                                        <img
                                          src={leadPartner.image}
                                          alt={leadPartner.name}
                                          className="w-6 h-6 rounded-full object-cover border border-slate-700"
                                        />
                                        <div className="min-w-0 flex-grow">
                                          <p className="text-[11px] text-slate-300 font-semibold truncate">{leadPartner.name}</p>
                                          <p className="text-[9px] text-[#c5a869] truncate">{leadPartner.title}</p>
                                        </div>
                                      </div>
                                    )}

                                    {/* Services Pills preview */}
                                    <div className="flex flex-wrap gap-1 mt-2">
                                      {practice.keyServices.slice(0, 2).map((srv, idx) => (
                                        <span key={idx} className="text-[10px] text-slate-400 bg-slate-950/60 px-2 py-0.5 rounded border border-slate-800/60 truncate max-w-full">
                                          • {srv}
                                        </span>
                                      ))}
                                      {practice.keyServices.length > 2 && (
                                        <span className="text-[10px] text-[#c5a869] px-1 py-0.5">
                                          +{practice.keyServices.length - 2} {isAr ? 'خدمات إضافية' : 'more'}
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {/* Bottom Action Buttons */}
                                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-800">
                                    <span className="text-[10px] font-mono text-slate-500 truncate max-w-[100px]">
                                      cat: {practice.category}
                                    </span>

                                    <div className="flex items-center gap-3">
                                      <button
                                        onClick={() => {
                                          setShowCustomCategoryInput(!PRESET_PRACTICE_CATEGORIES.some(c => c.id === practice.category));
                                          setEditingPractice(practice);
                                        }}
                                        className="text-xs text-[#e5cb8e] hover:underline flex items-center gap-1 cursor-pointer font-medium"
                                      >
                                        <Edit3 className="w-3.5 h-3.5" />
                                        <span>{isAr ? 'تعديل الاختصاص والتصنيف' : 'Edit'}</span>
                                      </button>
                                      <button
                                        onClick={() => handleDeletePractice(practice.id, practice.title)}
                                        className="text-xs text-rose-400 hover:text-rose-300 hover:underline flex items-center gap-1 cursor-pointer font-medium"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        <span>{isAr ? 'حذف' : 'Delete'}</span>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: CASE STUDIES & ACHIEVEMENTS */}
              {activeTab === 'caseStudies' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold font-serif-title text-white">
                        {isAr ? 'إدارة الإنجازات والصفقات الكبرى' : 'Landmark Deals & Outcomes Management'}
                      </h3>
                      <p className="text-xs text-slate-400">
                        {isAr ? 'استعراض النزاعات التحكيمية والصفقات المليارية الناجحة' : 'Showcase major arbitrations and multi-million transactions'}
                      </p>
                    </div>

                    {!editingCaseStudy && (
                      <button
                        onClick={() => setEditingCaseStudy({
                          id: `case-${Date.now()}`,
                          title: '',
                          titleEn: '',
                          category: 'تحكيم دولي',
                          outcome: 'حكم نهائي لصالح الموكل',
                          summary: '',
                          year: '2026',
                          value: '$250,000,000',
                          highlight: 'تمثيل مصرفي دولي'
                        })}
                        className="px-4 py-2 rounded-xl bg-[#c5a869] text-slate-950 font-bold text-xs flex items-center gap-1.5 hover:bg-[#d4af37] transition cursor-pointer shadow-lg"
                      >
                        <Plus className="w-4 h-4" />
                        <span>{isAr ? 'إضافة قضية / صفقة' : 'Add Case Study'}</span>
                      </button>
                    )}
                  </div>

                  {editingCaseStudy ? (
                    <form onSubmit={handleSaveCaseStudy} className="p-6 rounded-2xl bg-slate-900 border border-[#c5a869]/50 space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                        <h4 className="text-sm font-bold text-white">
                          {editingCaseStudy.title ? (isAr ? `تعديل القضية / الصفقة: ${editingCaseStudy.title}` : `Edit Case: ${editingCaseStudy.title}`) : (isAr ? 'إضافة قضية / صفقة جديدة' : 'New Case Study')}
                        </h4>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handleTranslateCurrentCaseStudy}
                            disabled={isTranslating}
                            className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-[#e5cb8e] border border-amber-500/50 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50 shadow-sm"
                            title={isAr ? 'ترجمة فورية وتلقائية للإنجليزية والتركية' : 'Auto-translate to English & Turkish'}
                          >
                            {isTranslating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5 text-[#c5a869]" />}
                            <span>{isAr ? '✨ ترجمة فورية (EN & TR)' : '✨ Translate to EN & TR'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setEditingCaseStudy(null)}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-300 hover:text-white hover:bg-slate-700 transition cursor-pointer"
                          >
                            {isAr ? 'إلغاء' : 'Cancel'}
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-slate-300 mb-1">عنوان القضية / الصفقة *</label>
                          <input
                            type="text"
                            required
                            value={editingCaseStudy.title}
                            onChange={(e) => setEditingCaseStudy({ ...editingCaseStudy, title: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-xs text-slate-300 mb-1">القيمة المالية (Value) *</label>
                          <input
                            type="text"
                            required
                            value={editingCaseStudy.value || ''}
                            onChange={(e) => setEditingCaseStudy({ ...editingCaseStudy, value: e.target.value })}
                            placeholder="$320,000,000"
                            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs text-slate-300 mb-1">التصنيف</label>
                          <input
                            type="text"
                            value={editingCaseStudy.category}
                            onChange={(e) => setEditingCaseStudy({ ...editingCaseStudy, category: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-xs text-slate-300 mb-1">النتيجة المحققة *</label>
                          <input
                            type="text"
                            required
                            value={editingCaseStudy.outcome}
                            onChange={(e) => setEditingCaseStudy({ ...editingCaseStudy, outcome: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-xs text-slate-300 mb-1">السنة</label>
                          <input
                            type="text"
                            value={editingCaseStudy.year}
                            onChange={(e) => setEditingCaseStudy({ ...editingCaseStudy, year: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs text-slate-300 mb-1">ملخص وقائع النزاع / الصفقة *</label>
                        <textarea
                          rows={3}
                          required
                          value={editingCaseStudy.summary}
                          onChange={(e) => setEditingCaseStudy({ ...editingCaseStudy, summary: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs"
                        />
                      </div>

                      <div className="flex items-center justify-end gap-3 pt-3">
                        <button
                          type="button"
                          onClick={() => setEditingCaseStudy(null)}
                          className="px-4 py-2 rounded-lg text-slate-400 hover:text-white text-xs"
                        >
                          {isAr ? 'إلغاء' : 'Cancel'}
                        </button>
                        <button
                          type="submit"
                          className="px-6 py-2.5 rounded-lg bg-[#c5a869] text-slate-950 font-bold text-xs hover:bg-[#d4af37] transition flex items-center gap-1.5 shadow-md"
                        >
                          <Save className="w-4 h-4" />
                          <span>{isAr ? 'حفظ الإنجاز' : 'Save Outcome'}</span>
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {caseStudies.map((item) => (
                        <div key={item.id} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between hover:border-[#c5a869]/40 transition">
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs px-2 py-0.5 rounded bg-[#c5a869]/20 text-[#e5cb8e] font-semibold">{item.category}</span>
                              <span className="text-base font-bold font-serif-title gold-gradient-text">{item.value}</span>
                            </div>
                            <h4 className="font-bold text-white text-sm mb-2">{item.title}</h4>
                            <p className="text-xs text-slate-300 line-clamp-2">{item.summary}</p>
                          </div>

                          <div className="flex items-center gap-3 mt-4 pt-3 border-t border-slate-800">
                            <button
                              onClick={() => setEditingCaseStudy(item)}
                              className="text-xs text-[#e5cb8e] hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>{isAr ? 'تعديل' : 'Edit'}</span>
                            </button>
                            <button
                              onClick={() => handleDeleteCaseStudy(item.id)}
                              className="text-xs text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>{isAr ? 'حذف' : 'Delete'}</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: TESTIMONIALS */}
              {activeTab === 'testimonials' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold font-serif-title text-white">
                        {isAr ? 'إدارة آراء وشهادات العملاء' : 'Testimonials Management'}
                      </h3>
                      <p className="text-xs text-slate-400">
                        {isAr ? 'إضافة وتعديل شهادات رؤساء الشركات والمستشارين القانونيين' : 'Manage client reviews and ratings'}
                      </p>
                    </div>

                    {!editingTestimonial && (
                      <button
                        onClick={() => setEditingTestimonial({
                          id: `test-${Date.now()}`,
                          clientName: '',
                          clientNameEn: '',
                          clientRole: 'رئيس مجلس الإدارة',
                          clientRoleEn: 'Chairman of the Board',
                          company: 'مجموعة استثمارية قابضة',
                          companyEn: 'Holding Group',
                          content: '',
                          contentEn: '',
                          rating: 5,
                          avatar: PRESET_PARTNER_IMAGES[3],
                          caseType: 'نزاع تجاري',
                          year: '2026'
                        })}
                        className="px-4 py-2 rounded-xl bg-[#c5a869] text-slate-950 font-bold text-xs flex items-center gap-1.5 hover:bg-[#d4af37] transition cursor-pointer shadow-lg"
                      >
                        <Plus className="w-4 h-4" />
                        <span>{isAr ? 'إضافة شهادة عميل' : 'Add Testimonial'}</span>
                      </button>
                    )}
                  </div>

                  {editingTestimonial ? (
                    <form onSubmit={handleSaveTestimonial} className="p-6 rounded-2xl bg-slate-900 border border-[#c5a869]/50 space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                        <h4 className="text-sm font-bold text-white">
                          {editingTestimonial.clientName ? (isAr ? `تعديل شهادة: ${editingTestimonial.clientName}` : `Edit Review: ${editingTestimonial.clientName}`) : (isAr ? 'إضافة شهادة عميل جديدة' : 'New Testimonial')}
                        </h4>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handleTranslateCurrentTestimonial}
                            disabled={isTranslating}
                            className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-[#e5cb8e] border border-amber-500/50 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50 shadow-sm"
                            title={isAr ? 'ترجمة فورية وتلقائية للإنجليزية والتركية' : 'Auto-translate to English & Turkish'}
                          >
                            {isTranslating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5 text-[#c5a869]" />}
                            <span>{isAr ? '✨ ترجمة فورية (EN & TR)' : '✨ Translate to EN & TR'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setEditingTestimonial(null)}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-300 hover:text-white hover:bg-slate-700 transition cursor-pointer"
                          >
                            {isAr ? 'إلغاء' : 'Cancel'}
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-slate-300 mb-1">اسم العميل *</label>
                          <input
                            type="text"
                            required
                            value={editingTestimonial.clientName}
                            onChange={(e) => setEditingTestimonial({ ...editingTestimonial, clientName: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-300 mb-1">المنصب والشركة *</label>
                          <input
                            type="text"
                            required
                            value={editingTestimonial.company}
                            onChange={(e) => setEditingTestimonial({ ...editingTestimonial, company: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs"
                          />
                        </div>
                      </div>

                      {/* Testimonial Avatar Upload */}
                      <ImageUploader
                        value={editingTestimonial.avatar}
                        onChange={(newImg) => setEditingTestimonial({ ...editingTestimonial, avatar: newImg })}
                        label="صورة العميل (الشعار أو الصورة الشخصية)"
                        labelEn="Client Avatar / Company Logo"
                        lang={lang}
                        presets={PRESET_PARTNER_IMAGES}
                        aspectRatio="square"
                        helpText={isAr ? "ارفع صورة العميل أو شعار شركته من جهازك" : "Upload client avatar or company logo from device"}
                      />

                      <div>
                        <label className="block text-xs text-slate-300 mb-1">نص الشهادة والثناء *</label>
                        <textarea
                          rows={3}
                          required
                          value={editingTestimonial.content}
                          onChange={(e) => setEditingTestimonial({ ...editingTestimonial, content: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs"
                        />
                      </div>

                      <div className="flex items-center justify-end gap-3 pt-3">
                        <button
                          type="button"
                          onClick={() => setEditingTestimonial(null)}
                          className="px-4 py-2 rounded-lg text-slate-400 hover:text-white text-xs"
                        >
                          {isAr ? 'إلغاء' : 'Cancel'}
                        </button>
                        <button
                          type="submit"
                          className="px-6 py-2.5 rounded-lg bg-[#c5a869] text-slate-950 font-bold text-xs hover:bg-[#d4af37] transition flex items-center gap-1.5 shadow-md"
                        >
                          <Save className="w-4 h-4" />
                          <span>{isAr ? 'حفظ الشهادة' : 'Save Testimonial'}</span>
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {testimonials.map((test) => (
                        <div key={test.id} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-[#c5a869]/40 transition">
                          <h4 className="font-bold text-white text-sm">{test.clientName}</h4>
                          <p className="text-xs text-[#c5a869]">{test.clientRole} - {test.company}</p>
                          <p className="text-xs text-slate-300 mt-2 line-clamp-3">"{test.content}"</p>

                          <div className="flex items-center gap-3 mt-4 pt-3 border-t border-slate-800">
                            <button
                              onClick={() => setEditingTestimonial(test)}
                              className="text-xs text-[#e5cb8e] hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>{isAr ? 'تعديل' : 'Edit'}</span>
                            </button>
                            <button
                              onClick={() => handleDeleteTestimonial(test.id)}
                              className="text-xs text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>{isAr ? 'حذف' : 'Delete'}</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 6: BLOG */}
              {activeTab === 'blog' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold font-serif-title text-white">
                        {isAr ? 'إدارة المقالات والأخبار القانونية' : 'Legal Blog & Insights'}
                      </h3>
                      <p className="text-xs text-slate-400">
                        {isAr ? 'نشر مقالات الرأي والتحليلات القانونية والدراسات التشريعية' : 'Publish insights, articles and regulatory reviews'}
                      </p>
                    </div>

                    {!editingBlog && (
                      <button
                        onClick={() => setEditingBlog({
                          id: `blog-${Date.now()}`,
                          title: '',
                          titleEn: '',
                          slug: `article-${Date.now()}`,
                          category: 'قانون الشركات والاستثمار',
                          excerpt: '',
                          content: '',
                          authorName: partners[0]?.name || 'د. عبد الرحمن آل هلال',
                          authorRole: 'الشريك المؤسس',
                          date: new Date().toLocaleDateString(isAr ? 'ar-SA' : 'en-US'),
                          readTime: '5 دقائق',
                          image: PRESET_PRACTICE_IMAGES[1],
                          tags: ['أنظمة', 'استثمار', 'حوكمة']
                        })}
                        className="px-4 py-2 rounded-xl bg-[#c5a869] text-slate-950 font-bold text-xs flex items-center gap-1.5 hover:bg-[#d4af37] transition cursor-pointer shadow-lg"
                      >
                        <Plus className="w-4 h-4" />
                        <span>{isAr ? 'نشر مقال جديد' : 'New Article'}</span>
                      </button>
                    )}
                  </div>

                  {editingBlog ? (
                    <form onSubmit={handleSaveBlog} className="p-6 rounded-2xl bg-slate-900 border border-[#c5a869]/50 space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                        <h4 className="text-sm font-bold text-white">
                          {editingBlog.title ? (isAr ? `تعديل المقال: ${editingBlog.title}` : `Edit Article: ${editingBlog.title}`) : (isAr ? 'كتابة ونشر مقال قانوني جديد' : 'New Legal Article')}
                        </h4>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handleTranslateCurrentBlog}
                            disabled={isTranslating}
                            className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-[#e5cb8e] border border-amber-500/50 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50 shadow-sm"
                            title={isAr ? 'ترجمة فورية وتلقائية للإنجليزية والتركية' : 'Auto-translate to English & Turkish'}
                          >
                            {isTranslating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5 text-[#c5a869]" />}
                            <span>{isAr ? '✨ ترجمة فورية (EN & TR)' : '✨ Translate to EN & TR'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setEditingBlog(null)}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-300 hover:text-white hover:bg-slate-700 transition cursor-pointer"
                          >
                            {isAr ? 'إلغاء' : 'Cancel'}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs text-slate-300 mb-1">عنوان المقال *</label>
                        <input
                          type="text"
                          required
                          value={editingBlog.title}
                          onChange={(e) => setEditingBlog({ ...editingBlog, title: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-slate-300 mb-1">الكاتب (الشريك) *</label>
                          <input
                            type="text"
                            required
                            value={editingBlog.authorName}
                            onChange={(e) => setEditingBlog({ ...editingBlog, authorName: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-300 mb-1">التصنيف</label>
                          <input
                            type="text"
                            value={editingBlog.category}
                            onChange={(e) => setEditingBlog({ ...editingBlog, category: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs"
                          />
                        </div>
                      </div>

                      {/* Blog Cover Upload */}
                      <ImageUploader
                        value={editingBlog.image}
                        onChange={(newImg) => setEditingBlog({ ...editingBlog, image: newImg })}
                        label="صورة غلاف المقال"
                        labelEn="Article Cover Image"
                        lang={lang}
                        presets={PRESET_PRACTICE_IMAGES}
                        aspectRatio="video"
                        helpText={isAr ? "ارفع صورة غلاف المقال من جهازك" : "Upload article cover image from device"}
                      />

                      <div>
                        <label className="block text-xs text-slate-300 mb-1">الموجز *</label>
                        <textarea
                          rows={2}
                          required
                          value={editingBlog.excerpt}
                          onChange={(e) => setEditingBlog({ ...editingBlog, excerpt: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-slate-300 mb-1">المحتوى الكامل للمقال *</label>
                        <textarea
                          rows={6}
                          required
                          value={editingBlog.content}
                          onChange={(e) => setEditingBlog({ ...editingBlog, content: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs"
                        />
                      </div>

                      <div className="flex items-center justify-end gap-3 pt-3">
                        <button
                          type="button"
                          onClick={() => setEditingBlog(null)}
                          className="px-4 py-2 rounded-lg text-slate-400 hover:text-white text-xs"
                        >
                          {isAr ? 'إلغاء' : 'Cancel'}
                        </button>
                        <button
                          type="submit"
                          className="px-6 py-2.5 rounded-lg bg-[#c5a869] text-slate-950 font-bold text-xs hover:bg-[#d4af37] transition flex items-center gap-1.5 shadow-md"
                        >
                          <Save className="w-4 h-4" />
                          <span>{isAr ? 'حفظ ونشر المقال' : 'Publish Article'}</span>
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-3">
                      {blogPosts.map((post) => (
                        <div key={post.id} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between hover:border-[#c5a869]/40 transition">
                          <div>
                            <h4 className="font-bold text-white text-sm">{post.title}</h4>
                            <p className="text-xs text-slate-400">{post.authorName} • {post.date} • {post.category}</p>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setEditingBlog(post)}
                              className="text-xs text-[#e5cb8e] hover:underline p-1.5 cursor-pointer"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteBlog(post.id)}
                              className="text-xs text-rose-400 hover:underline p-1.5 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 7: GLOBAL OFFICES */}
              {activeTab === 'offices' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold font-serif-title text-white">
                        {isAr ? 'إدارة المقار الدولية والخرائط' : 'Global Offices & Maps Management'}
                      </h3>
                      <p className="text-xs text-slate-400">
                        {isAr ? 'إضافة مقار المكتب في المدن والعواصم العالمية مع خرائط Google Maps' : 'Manage global office coordinates and embed maps'}
                      </p>
                    </div>

                    {!editingOffice && (
                      <button
                        onClick={() => setEditingOffice({
                          id: `office-${Date.now()}`,
                          cityAr: 'جدة',
                          cityEn: 'Jeddah',
                          countryAr: 'المملكة العربية السعودية',
                          countryEn: 'Saudi Arabia',
                          addressAr: 'طريق الكورنيش، برج الشاطئ، الطابق 15',
                          addressEn: 'Corniche Road, Beach Tower, 15th Floor',
                          phone: '+966 12 345 6789',
                          email: 'jeddah@aladllaw.com',
                          mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d238130.158784!2d39.172778!3d21.543333!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x15c3d01fb1137e59%3A0xe059579737b118db!2sJeddah!5e0!3m2!1sen!2ssa!4v1700000000000',
                          isHeadquarter: false
                        })}
                        className="px-4 py-2 rounded-xl bg-[#c5a869] text-slate-950 font-bold text-xs flex items-center gap-1.5 hover:bg-[#d4af37] transition cursor-pointer shadow-lg"
                      >
                        <Plus className="w-4 h-4" />
                        <span>{isAr ? 'إضافة مقر جديد' : 'Add Office'}</span>
                      </button>
                    )}
                  </div>

                  {editingOffice ? (
                    <form onSubmit={handleSaveOffice} className="p-6 rounded-2xl bg-slate-900 border border-[#c5a869]/50 space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                        <h4 className="text-sm font-bold text-white">
                          {editingOffice.cityAr ? (isAr ? `تعديل مقر: ${editingOffice.cityAr}` : `Edit Office: ${editingOffice.cityAr}`) : (isAr ? 'إضافة مقر مكتب جديد' : 'New Office')}
                        </h4>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handleTranslateCurrentOffice}
                            disabled={isTranslating}
                            className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-[#e5cb8e] border border-amber-500/50 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50 shadow-sm"
                            title={isAr ? 'ترجمة فورية وتلقائية للإنجليزية والتركية' : 'Auto-translate to English & Turkish'}
                          >
                            {isTranslating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5 text-[#c5a869]" />}
                            <span>{isAr ? '✨ ترجمة فورية (EN & TR)' : '✨ Translate to EN & TR'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setEditingOffice(null)}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-300 hover:text-white hover:bg-slate-700 transition cursor-pointer"
                          >
                            {isAr ? 'إلغاء' : 'Cancel'}
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-slate-300 mb-1">{isAr ? 'المدينة بالعربية *' : 'City (Arabic) *'}</label>
                          <input
                            type="text"
                            required
                            value={editingOffice.cityAr}
                            onChange={(e) => setEditingOffice({ ...editingOffice, cityAr: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-300 mb-1">{isAr ? 'المدينة بالإنجليزية *' : 'City (English) *'}</label>
                          <input
                            type="text"
                            required
                            value={editingOffice.cityEn}
                            onChange={(e) => setEditingOffice({ ...editingOffice, cityEn: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-slate-300 mb-1">{isAr ? 'الهاتف *' : 'Phone *'}</label>
                          <input
                            type="text"
                            required
                            value={editingOffice.phone}
                            onChange={(e) => setEditingOffice({ ...editingOffice, phone: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-300 mb-1">{isAr ? 'البريد الإلكتروني *' : 'Email *'}</label>
                          <input
                            type="email"
                            required
                            value={editingOffice.email}
                            onChange={(e) => setEditingOffice({ ...editingOffice, email: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs text-slate-300 mb-1">{isAr ? 'العنوان التفصيلي بالعربية *' : 'Detailed Address (Arabic) *'}</label>
                        <input
                          type="text"
                          required
                          value={editingOffice.addressAr}
                          onChange={(e) => setEditingOffice({ ...editingOffice, addressAr: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-slate-300 mb-1">{isAr ? 'رابط خريطة Google Maps (رابط التضمين أو الرابط المباشر للموقع)' : 'Google Maps Embed or Direct URL'}</label>
                        <input
                          type="url"
                          value={editingOffice.mapEmbedUrl}
                          onChange={(e) => setEditingOffice({ ...editingOffice, mapEmbedUrl: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs font-mono text-[11px]"
                        />
                      </div>

                      <div className="flex items-center justify-end gap-3 pt-3">
                        <button
                          type="button"
                          onClick={() => setEditingOffice(null)}
                          className="px-4 py-2 rounded-lg text-slate-400 hover:text-white text-xs"
                        >
                          {isAr ? 'إلغاء' : 'Cancel'}
                        </button>
                        <button
                          type="submit"
                          className="px-6 py-2.5 rounded-lg bg-[#c5a869] text-slate-950 font-bold text-xs hover:bg-[#d4af37] transition flex items-center gap-1.5 shadow-md"
                        >
                          <Save className="w-4 h-4" />
                          <span>{isAr ? 'حفظ المقر' : 'Save Office'}</span>
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {offices.map((office) => (
                        <div key={office.id} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-[#c5a869]/40 transition">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-bold text-white text-sm">{office.cityAr} - {office.countryAr}</h4>
                            {office.isHeadquarter && (
                              <span className="text-[10px] px-2 py-0.5 rounded bg-[#c5a869] text-slate-950 font-bold">المقر الرئيسي</span>
                            )}
                          </div>
                          <p className="text-xs text-slate-300">{office.addressAr}</p>
                          <p className="text-xs text-[#c5a869] font-mono mt-1">{office.phone}</p>

                          <div className="flex items-center gap-3 mt-4 pt-3 border-t border-slate-800">
                            <button
                              onClick={() => setEditingOffice(office)}
                              className="text-xs text-[#e5cb8e] hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>{isAr ? 'تعديل' : 'Edit'}</span>
                            </button>
                            <button
                              onClick={() => handleDeleteOffice(office.id)}
                              className="text-xs text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>{isAr ? 'حذف' : 'Delete'}</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 8: IDENTITY & SITE SETTINGS */}
              {activeTab === 'settings' && (
                <form onSubmit={handleSaveSettings} className="space-y-6 max-w-4xl">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-bold font-serif-title text-white">
                        {isAr ? 'تسمية المكتب، الهوية الرسمية، والإحصائيات' : 'Law Firm Name, Official Branding & Statistics'}
                      </h3>
                      <p className="text-xs text-slate-400">
                        {isAr ? 'خصص اسم مكتبك القانوني، الشعار، الرمز الرسمي، والنبذة التعريفية' : 'Customize your law firm name, logos, slogans, and metadata'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleTranslateCurrentSettings}
                        disabled={isTranslating}
                        className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-[#e5cb8e] border border-amber-500/50 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50 shadow-sm"
                        title={isAr ? 'ترجمة فورية وتلقائية لكافة نصوص وإعدادات وهوية الموقع' : 'Auto-translate all settings text'}
                      >
                        {isTranslating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5 text-[#c5a869]" />}
                        <span>{isAr ? '✨ ترجمة إعدادات الموقع (EN & TR)' : '✨ Translate Settings'}</span>
                      </button>

                      <button
                        type="submit"
                        className="px-5 py-1.5 rounded-xl bg-gradient-to-r from-[#c5a869] to-[#d4af37] text-slate-950 font-bold text-xs flex items-center gap-1.5 hover:brightness-110 transition cursor-pointer shadow-md"
                      >
                        <Save className="w-4 h-4" />
                        <span>{isAr ? 'حفظ وتطبيق' : 'Save'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Multi-Language & Translation Control Card */}
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/30 border border-amber-500/40 shadow-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
                          <Languages className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white flex items-center gap-2">
                            <span>{isAr ? 'مزامنة وترجمة اللغات الثلاث (العربية - الإنجليزية - التركية)' : 'Multi-Language Sync & Auto-Translation (AR - EN - TR)'}</span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                              {isAr ? 'نظام ذكي متصل' : 'Connected'}
                            </span>
                          </h4>
                          <p className="text-[11px] text-slate-400">
                            {isAr 
                              ? 'عند تعديل أي بيان بالعربية، يتم تحديث وترجمة باقي اللغات (الإنجليزية والتركية) تلقائياً ودون الحاجة لإعادة كتابتها يدوياً.' 
                              : 'Editing any Arabic content automatically synchronizes and updates English & Turkish translations.'}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleBulkAutoTranslateAll}
                        disabled={isTranslating || !!bulkTranslateProgress}
                        className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-[#c5a869] hover:from-amber-400 hover:to-[#d4af37] text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg transition cursor-pointer disabled:opacity-50"
                      >
                        <Sparkles className="w-4 h-4 text-slate-950" />
                        <span>{isAr ? '⚡ ترجمة كل الموقع دفعة واحدة' : '⚡ Bulk Translate All'}</span>
                      </button>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={autoSyncEnabled}
                          onChange={(e) => setAutoSyncEnabled(e.target.checked)}
                          className="rounded bg-slate-950 border-slate-700 text-[#c5a869] focus:ring-0 w-4 h-4 cursor-pointer"
                        />
                        <span className="font-semibold text-slate-200">
                          {isAr ? 'تفعيل الترجمة والمزامنة التلقائية عند الحفظ (Auto-sync on save)' : 'Enable auto-translate on save'}
                        </span>
                      </label>

                      <div className="flex items-center gap-1.5 text-[11px] text-[#e5cb8e]">
                        <span>🇸🇦 العربية (الأصل)</span>
                        <span>➡️</span>
                        <span>🇬🇧 English</span>
                        <span>➕</span>
                        <span>🇹🇷 Türkçe</span>
                      </div>
                    </div>
                  </div>

                  {/* Firm Names & Slogans */}
                  <div className="p-5 rounded-2xl bg-slate-900 border border-[#c5a869]/40 space-y-4 shadow-lg">
                    <h4 className="text-xs font-bold text-[#e5cb8e] uppercase tracking-wider flex items-center gap-2">
                      <Building className="w-4 h-4 text-[#c5a869]" />
                      <span>{isAr ? 'اسم المكتب القانوني والشعارات الرسمية' : 'Firm Name & Official Slogans'}</span>
                    </h4>

                    {/* Presets */}
                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                      <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-[#c5a869]" />
                        <span>{isAr ? 'نماذج وقوالب جاهزة للتسمية السريعة:' : 'Quick Presets:'}</span>
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => setSettings({
                            ...settings,
                            firmNameAr: 'مكتب المحامي محمد النحوي للمحاماة والاستشارات القانونية',
                            firmNameEn: 'Nahwi Law Firm & Legal Consultations',
                            sloganAr: 'حماية حقوقكم، أولويتنا وصناعة ريادتكم القانونية',
                            sloganEn: 'Safeguarding Your Rights, Pioneering Your Legal Success',
                            subSloganAr: 'خبرة عريقة في الترافع أمام كافة المحاكم وتقديم الاستشارات النوعية للأفراد والشركات بأعلى معايير الأمانة والسرية.',
                            subSloganEn: 'Distinguished experience in judicial advocacy and tailored legal advisory with the highest standards of integrity.',
                          })}
                          className="p-2 rounded-lg bg-slate-900 border border-slate-700 hover:border-[#c5a869] text-start text-[11px] text-slate-200 hover:text-white transition cursor-pointer"
                        >
                          <span className="font-bold text-[#e5cb8e] block">مكتب محاماة فردي</span>
                          <span className="text-slate-400 text-[10px] truncate block">مكتب المحامي محمد النحوي</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSettings({
                            ...settings,
                            firmNameAr: 'شركة النخبة والعدالة للمحاماة والتحكيم الدولي',
                            firmNameEn: 'Al-Nokhba & Justice International Law Firm',
                            sloganAr: 'حلول قانونية استراتيجية واستشارات تجارية عابرة للحدود',
                            sloganEn: 'Strategic Legal Solutions & Cross-Border Advisory',
                            subSloganAr: 'تحالف قانوني يضم نخبة من كبار المحامين والمحكّمين المعتمدين لحماية الاستثمارات وإدارة الصفقات الكبرى.',
                            subSloganEn: 'A premier legal alliance of accredited attorneys and arbitrators securing investments and complex transactions.',
                          })}
                          className="p-2 rounded-lg bg-slate-900 border border-slate-700 hover:border-[#c5a869] text-start text-[11px] text-slate-200 hover:text-white transition cursor-pointer"
                        >
                          <span className="font-bold text-[#e5cb8e] block">شركة مهنية وشراكة</span>
                          <span className="text-slate-400 text-[10px] truncate block">شركة النخبة والعدالة</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSettings({
                            ...settings,
                            firmNameAr: 'مجموعة النبراس للاستشارات القانونية وحوكمة الشركات',
                            firmNameEn: 'Al-Nebras Corporate Governance & Legal Advisory',
                            sloganAr: 'الحصن القانوني المتكامل لنمو الأعمال وحماية رأس المال',
                            sloganEn: 'The Comprehensive Legal Fortress for Enterprise Growth',
                            subSloganAr: 'نقدم استشارات متقدمة في حوكمة الشركات، الاندماج والاستحواذ، وصياغة العقود التجارية الدولية المعقدة.',
                            subSloganEn: 'Pioneering corporate governance, M&A structuring, and international contract drafting.',
                          })}
                          className="p-2 rounded-lg bg-slate-900 border border-slate-700 hover:border-[#c5a869] text-start text-[11px] text-slate-200 hover:text-white transition cursor-pointer"
                        >
                          <span className="font-bold text-[#e5cb8e] block">مجموعة حوكمة واستثمار</span>
                          <span className="text-slate-400 text-[10px] truncate block">مجموعة النبراس للاستشارات</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-200 mb-1">{isAr ? 'اسم المكتب بالعربية *' : 'Firm Name in Arabic *'}</label>
                        <input
                          type="text"
                          required
                          value={settings.firmNameAr}
                          onChange={(e) => setSettings({ ...settings, firmNameAr: e.target.value })}
                          className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-[#c5a869]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-200 mb-1">{isAr ? 'اسم المكتب بالإنجليزية *' : 'Firm Name in English *'}</label>
                        <input
                          type="text"
                          required
                          value={settings.firmNameEn}
                          onChange={(e) => setSettings({ ...settings, firmNameEn: e.target.value })}
                          className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-[#c5a869]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#e5cb8e] mb-1">
                          {isAr ? 'الشعار اللفظي الرئيسي بالعربية *' : 'Main Slogan in Arabic *'}
                        </label>
                        <input
                          type="text"
                          required
                          value={settings.sloganAr}
                          onChange={(e) => setSettings({ ...settings, sloganAr: e.target.value })}
                          placeholder="مثال: حماية حقوقكم أولويتنا، وصناعة ريادتكم القانونية"
                          className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-[#c5a869] focus:outline-none"
                        />
                        <p className="text-[10px] text-slate-400 mt-1">
                          {isAr ? 'هذا النص يظهر كعنوان رئيسي عريض في أعلى الصفحة الرئيسية' : 'Displays as the prominent main title in the hero section'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#e5cb8e] mb-1">
                          {isAr ? 'الشعار اللفظي الرئيسي بالإنجليزية *' : 'Main Slogan in English *'}
                        </label>
                        <input
                          type="text"
                          required
                          value={settings.sloganEn}
                          onChange={(e) => setSettings({ ...settings, sloganEn: e.target.value })}
                          placeholder="e.g. Safeguarding Your Rights, Pioneering Your Legal Success"
                          className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-[#c5a869] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        {isAr ? 'العبارة التعريفية الفرعية في الواجهة بالعربية' : 'Hero Sub-headline (Arabic)'}
                      </label>
                      <textarea
                        rows={2}
                        value={settings.subSloganAr}
                        onChange={(e) => setSettings({ ...settings, subSloganAr: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-[#c5a869] focus:outline-none"
                      />
                    </div>

                    {/* Logo Customizer */}
                    <div className="pt-2">
                      <ImageUploader
                        value={settings.customLogoUrl || ''}
                        onChange={(img) => setSettings({ ...settings, customLogoUrl: img })}
                        label={isAr ? "شعار المكتب الرسمي (صورة الشعار أو الرمز المعماري)" : "Official Firm Logo"}
                        labelEn="Official Law Firm Logo (Image / Emblem)"
                        lang={lang}
                        aspectRatio="square"
                        helpText={isAr ? "ارفع ملف الشعار الخاص بمكتبك ليظهر فوراً في الترويسة العلوية، الواجهة الرئيسية، والفوتر." : "Upload custom logo to appear in navbar, hero, and footer."}
                      />
                    </div>

                    {/* Logo & Firm Name Sizing & Placement Control Suite */}
                    <div className="p-5 rounded-2xl bg-slate-900/90 border border-[#c5a869]/40 space-y-6 mt-4">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <div className="flex items-center gap-2">
                          <Sliders className="w-4 h-4 text-[#e5cb8e]" />
                          <h4 className="text-xs sm:text-sm font-bold text-white">
                            {isAr ? 'التحكم المتقدم بحجم وتموضع اللوغو واسم المكتب' : 'Logo & Firm Name Sizing & Placement'}
                          </h4>
                        </div>
                        <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#c5a869]/20 text-[#e5cb8e] font-semibold">
                          {isAr ? 'تخصيص فوري' : 'Live Customization'}
                        </span>
                      </div>

                      {/* Live Visual Preview */}
                      <div className="p-4 rounded-xl bg-[#fbf8f2] border border-[#e6ddcc] text-[#181512]">
                        <div className="flex items-center justify-between text-[11px] font-bold text-[#87641d] mb-3 pb-1.5 border-b border-[#e6ddcc]">
                          <span className="flex items-center gap-1.5">
                            <Eye className="w-3.5 h-3.5" />
                            {isAr ? 'معاينة حية لشكل اللوغو واسم المكتب في الترويسة' : 'Live Preview in Header'}
                          </span>
                          <span className="text-[10px] text-[#4b4334]">
                            {isAr ? 'حسب الإعدادات المحددة أدناه' : 'According to selected settings below'}
                          </span>
                        </div>

                        <div className={`p-3 rounded-lg bg-white border border-[#e6ddcc]/80 flex items-center ${
                          settings.brandingPositionNavbar === 'center' ? 'justify-center text-center' : 'justify-start'
                        }`}>
                          <div className={`flex items-center ${
                            settings.brandingLayout === 'vertical' ? 'flex-col text-center gap-1.5' : 'flex-row gap-3'
                          }`}>
                            {/* Logo */}
                            {(() => {
                              const sizeMap = { sm: 'w-8 h-8', md: 'w-11 h-11', lg: 'w-14 h-14', xl: 'w-16 h-16' };
                              const logoSizeClass = sizeMap[settings.logoSizeNavbar || 'md'];
                              const shapeClass = settings.logoShape === 'circle'
                                ? 'rounded-full'
                                : settings.logoShape === 'square'
                                ? 'rounded-none'
                                : settings.logoShape === 'transparent'
                                ? 'rounded-none bg-transparent shadow-none p-0 border-none'
                                : 'rounded-xl';

                              const innerShapeClass = settings.logoShape === 'circle'
                                ? 'rounded-full'
                                : settings.logoShape === 'square'
                                ? 'rounded-none'
                                : settings.logoShape === 'transparent'
                                ? 'bg-transparent'
                                : 'rounded-[9px]';

                              if (settings.logoShape === 'transparent') {
                                return (
                                  <div className={`${logoSizeClass} flex items-center justify-center overflow-hidden flex-shrink-0`}>
                                    {settings.customLogoUrl ? (
                                      <img src={settings.customLogoUrl} alt="Logo" className="w-full h-full object-contain" />
                                    ) : (
                                      <Scale className="w-full h-full text-[#87641d] p-1" />
                                    )}
                                  </div>
                                );
                              }

                              return (
                                <div className={`${logoSizeClass} ${shapeClass} bg-gradient-to-br from-[#c5a869] to-[#8d6f2c] p-0.5 shadow-sm flex-shrink-0`}>
                                  <div className={`w-full h-full bg-[#fbf8f2] ${innerShapeClass} flex items-center justify-center overflow-hidden p-0.5`}>
                                    {settings.customLogoUrl ? (
                                      <img src={settings.customLogoUrl} alt="Logo" className="w-full h-full object-contain" />
                                    ) : (
                                      <Scale className="w-5 h-5 text-[#87641d]" />
                                    )}
                                  </div>
                                </div>
                              );
                            })()}

                            {/* Name & Subtitle */}
                            <div className={`flex flex-col ${settings.brandingLayout === 'vertical' ? 'items-center text-center' : 'items-start'}`}>
                              {(() => {
                                const sizeMap = { sm: 'text-sm sm:text-base', md: 'text-base sm:text-lg', lg: 'text-lg sm:text-xl', xl: 'text-xl sm:text-2xl' };
                                const weightMap = { normal: 'font-normal', semibold: 'font-semibold', bold: 'font-bold', extrabold: 'font-extrabold' };
                                return (
                                  <span className={`font-serif-title ${weightMap[settings.firmNameWeightNavbar || 'bold']} ${sizeMap[settings.firmNameSizeNavbar || 'md']} text-[#181512] leading-tight`}>
                                    {isAr ? (settings.firmNameAr || 'اسم مكتب المحاماة') : (settings.firmNameEn || 'Law Firm Name')}
                                  </span>
                                );
                              })()}

                              {settings.showNavbarSubtitle !== false && (
                                <span className="text-[10px] text-[#87641d] uppercase tracking-wider font-bold mt-0.5">
                                  {isAr ? (settings.navbarSubtitleAr || 'محامون ومستشارون قانونيون ومحكّمون') : (settings.navbarSubtitleEn || 'Attorneys, Legal Counsel & Arbitrators')}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Controls Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* 1. Navbar Logo Size */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-200 mb-1.5 flex items-center gap-1.5">
                            <Maximize2 className="w-3.5 h-3.5 text-[#c5a869]" />
                            {isAr ? 'حجم اللوغو في الترويسة العلوية (Navbar Logo Size)' : 'Header Logo Size'}
                          </label>
                          <div className="grid grid-cols-4 gap-1.5">
                            {[
                              { id: 'sm', labelAr: 'صغير (36px)', labelEn: 'Small' },
                              { id: 'md', labelAr: 'متوسط (44px)', labelEn: 'Medium' },
                              { id: 'lg', labelAr: 'كبير (54px)', labelEn: 'Large' },
                              { id: 'xl', labelAr: 'ضخم (68px)', labelEn: 'X-Large' },
                            ].map((sz) => (
                              <button
                                key={sz.id}
                                type="button"
                                onClick={() => setSettings({ ...settings, logoSizeNavbar: sz.id as any })}
                                className={`py-2 px-1 rounded-xl text-center text-xs font-semibold transition cursor-pointer border ${
                                  (settings.logoSizeNavbar || 'md') === sz.id
                                    ? 'bg-[#c5a869] text-black border-[#e5cb8e] shadow-md font-bold'
                                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-600'
                                }`}
                              >
                                {isAr ? sz.labelAr : sz.labelEn}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* 2. Hero Logo Size */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-200 mb-1.5 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-[#c5a869]" />
                            {isAr ? 'حجم اللوغو في الواجهة الرئيسية (Hero Logo Size)' : 'Hero Banner Logo Size'}
                          </label>
                          <div className="grid grid-cols-5 gap-1">
                            {[
                              { id: 'sm', labelAr: 'صغير', labelEn: 'SM' },
                              { id: 'md', labelAr: 'متوسط', labelEn: 'MD' },
                              { id: 'lg', labelAr: 'كبير', labelEn: 'LG' },
                              { id: 'xl', labelAr: 'ضخم', labelEn: 'XL' },
                              { id: 'hidden', labelAr: 'إخفاء', labelEn: 'Hide' },
                            ].map((sz) => (
                              <button
                                key={sz.id}
                                type="button"
                                onClick={() => setSettings({ ...settings, logoSizeHero: sz.id as any })}
                                className={`py-2 px-1 rounded-xl text-center text-[11px] font-semibold transition cursor-pointer border ${
                                  (settings.logoSizeHero || 'md') === sz.id
                                    ? 'bg-[#c5a869] text-black border-[#e5cb8e] shadow-md font-bold'
                                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-600'
                                }`}
                              >
                                {isAr ? sz.labelAr : sz.labelEn}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* 3. Logo Container Frame Shape */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-200 mb-1.5 flex items-center gap-1.5">
                            <Layout className="w-3.5 h-3.5 text-[#c5a869]" />
                            {isAr ? 'شكل إطار اللوغو والخلفية (Logo Frame & Shape)' : 'Logo Shape & Frame'}
                          </label>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                            {[
                              { id: 'rounded', labelAr: 'مربع ناعم', labelEn: 'Rounded Box' },
                              { id: 'circle', labelAr: 'دائري', labelEn: 'Circle' },
                              { id: 'square', labelAr: 'مربع كلاسيكي', labelEn: 'Square' },
                              { id: 'transparent', labelAr: 'شفاف بدون إطار', labelEn: 'Transparent' },
                            ].map((shp) => (
                              <button
                                key={shp.id}
                                type="button"
                                onClick={() => setSettings({ ...settings, logoShape: shp.id as any })}
                                className={`py-2 px-1.5 rounded-xl text-center text-xs font-semibold transition cursor-pointer border ${
                                  (settings.logoShape || 'rounded') === shp.id
                                    ? 'bg-[#c5a869] text-black border-[#e5cb8e] shadow-md font-bold'
                                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-600'
                                }`}
                              >
                                {isAr ? shp.labelAr : shp.labelEn}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* 4. Logo & Name Layout Alignment */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-200 mb-1.5 flex items-center gap-1.5">
                            <Move className="w-3.5 h-3.5 text-[#c5a869]" />
                            {isAr ? 'ترتيب اللوغو مع اسم المكتب (Layout Orientation)' : 'Logo & Name Orientation'}
                          </label>
                          <div className="grid grid-cols-2 gap-1.5">
                            {[
                              { id: 'horizontal', labelAr: 'أفقي (اللوغو بجانب الاسم)', labelEn: 'Side by Side (Horizontal)' },
                              { id: 'vertical', labelAr: 'عمودي (اللوغو فوق الاسم)', labelEn: 'Stacked (Vertical)' },
                            ].map((lay) => (
                              <button
                                key={lay.id}
                                type="button"
                                onClick={() => setSettings({ ...settings, brandingLayout: lay.id as any })}
                                className={`py-2 px-2 rounded-xl text-center text-xs font-semibold transition cursor-pointer border ${
                                  (settings.brandingLayout || 'horizontal') === lay.id
                                    ? 'bg-[#c5a869] text-black border-[#e5cb8e] shadow-md font-bold'
                                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-600'
                                }`}
                              >
                                {isAr ? lay.labelAr : lay.labelEn}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* 5. Header Branding Position */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-200 mb-1.5 flex items-center gap-1.5">
                            <AlignCenter className="w-3.5 h-3.5 text-[#c5a869]" />
                            {isAr ? 'مكان تموضع الترويسة في الشريط العلوي' : 'Navbar Alignment'}
                          </label>
                          <div className="grid grid-cols-2 gap-1.5">
                            {[
                              { id: 'start', labelAr: 'على طرف الشريط (الوضع القياسي)', labelEn: 'Standard Start / Corner' },
                              { id: 'center', labelAr: 'في المنتصف (توسيط الشعار والاسم)', labelEn: 'Centered in Navbar' },
                            ].map((pos) => (
                              <button
                                key={pos.id}
                                type="button"
                                onClick={() => setSettings({ ...settings, brandingPositionNavbar: pos.id as any })}
                                className={`py-2 px-2 rounded-xl text-center text-xs font-semibold transition cursor-pointer border ${
                                  (settings.brandingPositionNavbar || 'start') === pos.id
                                    ? 'bg-[#c5a869] text-black border-[#e5cb8e] shadow-md font-bold'
                                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-600'
                                }`}
                              >
                                {isAr ? pos.labelAr : pos.labelEn}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* 6. Firm Name Font Size in Navbar */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-200 mb-1.5 flex items-center gap-1.5">
                            <Type className="w-3.5 h-3.5 text-[#c5a869]" />
                            {isAr ? 'حجم خط اسم المكتب في الترويسة' : 'Firm Name Font Size'}
                          </label>
                          <div className="grid grid-cols-4 gap-1.5">
                            {[
                              { id: 'sm', labelAr: 'صغير', labelEn: 'Small' },
                              { id: 'md', labelAr: 'متوسط', labelEn: 'Medium' },
                              { id: 'lg', labelAr: 'كبير', labelEn: 'Large' },
                              { id: 'xl', labelAr: 'كبير جداً', labelEn: 'X-Large' },
                            ].map((sz) => (
                              <button
                                key={sz.id}
                                type="button"
                                onClick={() => setSettings({ ...settings, firmNameSizeNavbar: sz.id as any })}
                                className={`py-2 px-1 rounded-xl text-center text-xs font-semibold transition cursor-pointer border ${
                                  (settings.firmNameSizeNavbar || 'md') === sz.id
                                    ? 'bg-[#c5a869] text-black border-[#e5cb8e] shadow-md font-bold'
                                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-600'
                                }`}
                              >
                                {isAr ? sz.labelAr : sz.labelEn}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* 7. Firm Name Weight */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-200 mb-1.5 flex items-center gap-1.5">
                            <Type className="w-3.5 h-3.5 text-[#c5a869]" />
                            {isAr ? 'سماكة خط اسم المكتب (Font Weight)' : 'Firm Name Font Weight'}
                          </label>
                          <div className="grid grid-cols-4 gap-1.5">
                            {[
                              { id: 'normal', labelAr: 'عادي', labelEn: 'Regular' },
                              { id: 'semibold', labelAr: 'شبه عريض', labelEn: 'Semibold' },
                              { id: 'bold', labelAr: 'عريض', labelEn: 'Bold' },
                              { id: 'extrabold', labelAr: 'عريض جداً', labelEn: 'Extra Bold' },
                            ].map((wt) => (
                              <button
                                key={wt.id}
                                type="button"
                                onClick={() => setSettings({ ...settings, firmNameWeightNavbar: wt.id as any })}
                                className={`py-2 px-1 rounded-xl text-center text-xs font-semibold transition cursor-pointer border ${
                                  (settings.firmNameWeightNavbar || 'bold') === wt.id
                                    ? 'bg-[#c5a869] text-black border-[#e5cb8e] shadow-md font-bold'
                                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-600'
                                }`}
                              >
                                {isAr ? wt.labelAr : wt.labelEn}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* 7b. Firm Name Lines Limit in Navbar */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-200 mb-1.5 flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5 text-[#c5a869]" />
                            {isAr ? 'عدد أسطر اسم المكتب في الترويسة' : 'Firm Name Lines in Header'}
                          </label>
                          <div className="grid grid-cols-3 gap-1.5">
                            {[
                              { id: '1', labelAr: 'سطر واحد فقط', labelEn: '1 Line' },
                              { id: '2', labelAr: 'سطران (2)', labelEn: '2 Lines' },
                              { id: 'auto', labelAr: 'تلقائي حسب الطول', labelEn: 'Auto' },
                            ].map((ln) => (
                              <button
                                key={ln.id}
                                type="button"
                                onClick={() => setSettings({ ...settings, firmNameLinesNavbar: ln.id as any })}
                                className={`py-2 px-1 rounded-xl text-center text-xs font-semibold transition cursor-pointer border ${
                                  (settings.firmNameLinesNavbar || 'auto') === ln.id
                                    ? 'bg-[#c5a869] text-black border-[#e5cb8e] shadow-md font-bold'
                                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-600'
                                }`}
                              >
                                {isAr ? ln.labelAr : ln.labelEn}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* 8. Hero Headline Scale & Alignment & Line Limit */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-200 mb-1.5 flex items-center gap-1.5">
                            <Sliders className="w-3.5 h-3.5 text-[#c5a869]" />
                            {isAr ? 'مقياس عنوان الواجهة الرئيسية ومحاذاته وأسطره' : 'Hero Headline Size, Alignment & Lines'}
                          </label>
                          <div className="grid grid-cols-4 gap-1.5 mb-2">
                            {[
                              { id: 'sm', labelAr: 'متوسط', labelEn: 'SM' },
                              { id: 'md', labelAr: 'كبير', labelEn: 'MD' },
                              { id: 'lg', labelAr: 'كبير جداً', labelEn: 'LG' },
                              { id: 'xl', labelAr: 'ضخم', labelEn: 'XL' },
                            ].map((sz) => (
                              <button
                                key={sz.id}
                                type="button"
                                onClick={() => setSettings({ ...settings, firmNameSizeHero: sz.id as any })}
                                className={`py-2 px-1 rounded-xl text-center text-xs font-semibold transition cursor-pointer border ${
                                  (settings.firmNameSizeHero || 'lg') === sz.id
                                    ? 'bg-[#c5a869] text-black border-[#e5cb8e] shadow-md font-bold'
                                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-600'
                                }`}
                              >
                                {isAr ? sz.labelAr : sz.labelEn}
                              </button>
                            ))}
                          </div>
                          <div className="grid grid-cols-2 gap-1.5 mb-2">
                            {[
                              { id: 'center', labelAr: 'توسيط في المنتصف', labelEn: 'Center Aligned' },
                              { id: 'start', labelAr: 'محاذاة مع اتجاه النص', labelEn: 'Start Aligned' },
                            ].map((alg) => (
                              <button
                                key={alg.id}
                                type="button"
                                onClick={() => setSettings({ ...settings, heroAlignment: alg.id as any })}
                                className={`py-1.5 px-2 rounded-xl text-center text-[11px] font-semibold transition cursor-pointer border ${
                                  (settings.heroAlignment || 'center') === alg.id
                                    ? 'bg-[#c5a869] text-black border-[#e5cb8e] shadow-md font-bold'
                                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-600'
                                }`}
                              >
                                {isAr ? alg.labelAr : alg.labelEn}
                              </button>
                            ))}
                          </div>
                          {/* Hero Headline Line Count */}
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] text-slate-400 font-medium">{isAr ? 'أسطر العنوان الرئيسي:' : 'Headline Lines:'}</span>
                            <div className="grid grid-cols-4 gap-1 flex-1">
                              {[
                                { id: '1', label: '1' },
                                { id: '2', label: '2' },
                                { id: '3', label: '3' },
                                { id: 'auto', label: isAr ? 'تلقائي' : 'Auto' },
                              ].map((ln) => (
                                <button
                                  key={ln.id}
                                  type="button"
                                  onClick={() => setSettings({ ...settings, heroHeadlineLines: ln.id as any })}
                                  className={`py-1 px-1 rounded-lg text-center text-[11px] font-semibold transition cursor-pointer border ${
                                    (settings.heroHeadlineLines || 'auto') === ln.id
                                      ? 'bg-[#c5a869] text-black border-[#e5cb8e] shadow-sm font-bold'
                                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-600'
                                  }`}
                                >
                                  {ln.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 9. Subtitle under Firm Name in Navbar */}
                      <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-semibold text-slate-200 cursor-pointer flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={settings.showNavbarSubtitle !== false}
                              onChange={(e) => setSettings({ ...settings, showNavbarSubtitle: e.target.checked })}
                              className="rounded bg-slate-900 border-slate-700 text-[#c5a869] focus:ring-0 w-4 h-4 cursor-pointer"
                            />
                            <span>{isAr ? 'إظهار السطر التعريفي الصغير تحت اسم المكتب في الترويسة' : 'Show Small Subtitle Under Firm Name in Navbar'}</span>
                          </label>
                        </div>
                        {settings.showNavbarSubtitle !== false && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                            <div>
                              <label className="block text-[11px] text-slate-400 mb-1">{isAr ? 'السطر التعريفي (عربي)' : 'Subtitle (Arabic)'}</label>
                              <input
                                type="text"
                                value={settings.navbarSubtitleAr || ''}
                                onChange={(e) => setSettings({ ...settings, navbarSubtitleAr: e.target.value })}
                                placeholder="مثال: محامون ومستشارون قانونيون ومحكّمون"
                                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-[#c5a869]"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] text-slate-400 mb-1">{isAr ? 'Subtitle (English)' : 'Subtitle (English)'}</label>
                              <input
                                type="text"
                                value={settings.navbarSubtitleEn || ''}
                                onChange={(e) => setSettings({ ...settings, navbarSubtitleEn: e.target.value })}
                                placeholder="e.g. Attorneys, Legal Counsel & Arbitrators"
                                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-[#c5a869]"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* About texts */}
                  <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div>
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-[#c5a869]" />
                          <span>{isAr ? 'نصوص وهوية قسم «عن المكتب والمسيرة»' : 'About & Journey Texts & Identity'}</span>
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {isAr ? 'يمكنك تحرير النصوص هنا أو الانتقال للتبويب المخصص لمعاينة تفاعلية حية' : 'Edit texts here or jump to dedicated tab for live preview'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveTab('about')}
                        className="px-3 py-1.5 rounded-lg bg-[#c5a869]/20 text-[#e5cb8e] hover:bg-[#c5a869]/30 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-[#c5a869]/30"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>{isAr ? 'فتح قسم المسيرة المتكامل ↗' : 'Open Dedicated About Tab ↗'}</span>
                      </button>
                    </div>

                    {/* Main Narrative (Ar, En, Tr) */}
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-slate-200">
                        {isAr ? 'النبذة الرئيسية وقصة المسيرة (عربي):' : 'Main Journey Narrative (Arabic):'}
                      </label>
                      <textarea
                        rows={3}
                        value={settings.aboutTextAr}
                        onChange={(e) => setSettings({ ...settings, aboutTextAr: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-[#c5a869]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] text-slate-300 mb-1">
                          {isAr ? 'قصة المسيرة (English):' : 'Narrative (English):'}
                        </label>
                        <textarea
                          rows={2}
                          value={settings.aboutTextEn || ''}
                          onChange={(e) => setSettings({ ...settings, aboutTextEn: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-[#c5a869]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-300 mb-1">
                          {isAr ? 'قصة المسيرة (Türkçe):' : 'Narrative (Turkish):'}
                        </label>
                        <textarea
                          rows={2}
                          value={settings.aboutTextTr || ''}
                          onChange={(e) => setSettings({ ...settings, aboutTextTr: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-[#c5a869]"
                        />
                      </div>
                    </div>

                    {/* Vision, Methodology, Confidentiality */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                      <div>
                        <label className="block text-[11px] text-slate-300 mb-1 font-semibold flex items-center gap-1">
                          <Target className="w-3.5 h-3.5 text-[#c5a869]" />
                          <span>{isAr ? 'نص الرؤية والرسالة (عربي)' : 'Vision (Ar)'}</span>
                        </label>
                        <textarea
                          rows={3}
                          value={settings.aboutVisionAr || ''}
                          onChange={(e) => setSettings({ ...settings, aboutVisionAr: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-[#c5a869]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-300 mb-1 font-semibold flex items-center gap-1">
                          <Compass className="w-3.5 h-3.5 text-[#c5a869]" />
                          <span>{isAr ? 'نص المنهجية والاستراتيجية (عربي)' : 'Methodology (Ar)'}</span>
                        </label>
                        <textarea
                          rows={3}
                          value={settings.aboutMethodologyAr || ''}
                          onChange={(e) => setSettings({ ...settings, aboutMethodologyAr: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-[#c5a869]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-300 mb-1 font-semibold flex items-center gap-1">
                          <Shield className="w-3.5 h-3.5 text-[#c5a869]" />
                          <span>{isAr ? 'نص السرية والأمان (عربي)' : 'Confidentiality (Ar)'}</span>
                        </label>
                        <textarea
                          rows={3}
                          value={settings.aboutConfidentialityAr || ''}
                          onChange={(e) => setSettings({ ...settings, aboutConfidentialityAr: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-[#c5a869]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Contact Info & Password & Address Controls */}
                  <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[#c5a869]" />
                        <span>{isAr ? 'العنوان الجغرافي للمقر الرئيسي والتحكم بعدد الأسطر' : 'Headquarters Address & Line Formatting'}</span>
                      </h4>
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#c5a869]/20 text-[#e5cb8e] font-semibold">
                        {isAr ? 'تنسيق مرن' : 'Flexible Format'}
                      </span>
                    </div>

                    {/* Address Line Controls */}
                    <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Number of Lines Limit */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-200 mb-1.5 flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5 text-[#c5a869]" />
                            {isAr ? 'الحد الأقصى لعدد أسطر العنوان (Line Clamp)' : 'Address Lines Count Limit'}
                          </label>
                          <div className="grid grid-cols-4 gap-1.5">
                            {[
                              { id: '1', labelAr: 'سطر 1', labelEn: '1 Line' },
                              { id: '2', labelAr: 'سطران (2)', labelEn: '2 Lines' },
                              { id: '3', labelAr: '3 أسطر', labelEn: '3 Lines' },
                              { id: 'auto', labelAr: 'تلقائي كامل', labelEn: 'Auto / All' },
                            ].map((ln) => (
                              <button
                                key={ln.id}
                                type="button"
                                onClick={() => setSettings({ ...settings, addressLinesCount: ln.id as any })}
                                className={`py-2 px-1 rounded-xl text-center text-xs font-semibold transition cursor-pointer border ${
                                  (settings.addressLinesCount || 'auto') === ln.id
                                    ? 'bg-[#c5a869] text-black border-[#e5cb8e] shadow-md font-bold'
                                    : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-500'
                                }`}
                              >
                                {isAr ? ln.labelAr : ln.labelEn}
                              </button>
                            ))}
                          </div>
                          <p className="text-[10px] text-slate-400 mt-1">
                            {isAr ? 'يحدد كيف يتم اختصار أو إظهار العنوان في الفوتر وبطاقات العناوين' : 'Controls truncating or full display of address in footer and cards'}
                          </p>
                        </div>

                        {/* Multiline Render Mode */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-200 mb-1.5 flex items-center gap-1.5">
                            <Sliders className="w-3.5 h-3.5 text-[#c5a869]" />
                            {isAr ? 'نمط تقسيم الأسطر (Display Mode)' : 'Display Line Break Mode'}
                          </label>
                          <div className="grid grid-cols-2 gap-1.5">
                            {[
                              { id: 'multiline', labelAr: 'تعدد الأسطر (حسب Enter)', labelEn: 'Preserve Newlines' },
                              { id: 'single', labelAr: 'سطر متصل مع فواصل', labelEn: 'Single Connected Line' },
                            ].map((md) => (
                              <button
                                key={md.id}
                                type="button"
                                onClick={() => setSettings({ ...settings, addressDisplayMode: md.id as any })}
                                className={`py-2 px-1.5 rounded-xl text-center text-xs font-semibold transition cursor-pointer border ${
                                  (settings.addressDisplayMode || 'multiline') === md.id
                                    ? 'bg-[#c5a869] text-black border-[#e5cb8e] shadow-md font-bold'
                                    : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-500'
                                }`}
                              >
                                {isAr ? md.labelAr : md.labelEn}
                              </button>
                            ))}
                          </div>
                          <p className="text-[10px] text-slate-400 mt-1">
                            {isAr ? 'يمكنك النزول لسطر جديد داخل صندوق النص لتنظيم العنوان على أسطر منفصلة' : 'Press Enter in the textarea to split building, floor, street, and city on separate lines'}
                          </p>
                        </div>
                      </div>

                      {/* Address Input with Multiline Textarea */}
                      <div className="pt-2">
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          {isAr ? 'العنوان التفصيلي للمقر الرئيسي (يدعم أسطر متعددة)' : 'Detailed Headquarters Address (Supports Multiline)'}
                        </label>
                        <textarea
                          rows={3}
                          value={settings.addressAr}
                          onChange={(e) => setSettings({ ...settings, addressAr: e.target.value })}
                          placeholder={'برج المملكة، الطابق 42\nطريق الملك فهد\nالرياض، المملكة العربية السعودية'}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-[#c5a869] focus:outline-none"
                        />
                        <span className="text-[10px] text-slate-400">
                          {isAr ? 'اضغط Enter لإنشاء سطر جديد لتنظيم العنوان' : 'Press Enter to create new line'}
                        </span>
                      </div>

                      {/* Quick Presets for Address format */}
                      <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center gap-2">
                        <span className="text-[11px] text-slate-400 font-medium">
                          {isAr ? 'نماذج سريعة لترتيب أسطر العنوان:' : 'Quick Address Formatting Presets:'}
                        </span>
                        <button
                          type="button"
                          onClick={() => setSettings({
                            ...settings,
                            addressAr: 'برج المملكة، الطابق 42\nطريق الملك فهد، حي العليا\nالرياض 12214، المملكة العربية السعودية',
                            addressEn: 'Kingdom Tower, 42nd Floor\nKing Fahd Road, Al-Olaya\nRiyadh 12214, Saudi Arabia',
                            addressLinesCount: 'auto',
                            addressDisplayMode: 'multiline'
                          })}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-[#e5cb8e] border border-slate-700 transition cursor-pointer"
                        >
                          {isAr ? '3 أسطر منظمة (البرج / الشارع / المدينة)' : '3 Clean Lines Format'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setSettings({
                            ...settings,
                            addressAr: 'مركز دبي المالي العالمي (DIFC)، البوابة 4، الطابق 18، دبي، الإمارات العربية المتحدة',
                            addressEn: 'Dubai International Financial Centre (DIFC), Gate 4, Level 18, Dubai, UAE',
                            addressLinesCount: 'auto',
                            addressDisplayMode: 'single'
                          })}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 border border-slate-700 transition cursor-pointer"
                        >
                          {isAr ? 'سطر أفقي كلاسيكي (DIFC دبي)' : 'Single Line Format (Dubai)'}
                        </button>
                      </div>
                    </div>

                    {/* Phones and Emails and Working Hours */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div>
                        <label className="block text-xs font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-[#c5a869]" />
                          <span>{isAr ? 'الهاتف الرئيسي المباشر (Phone)' : 'Primary Phone'}</span>
                        </label>
                        <input
                          type="text"
                          value={settings.phone}
                          onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                          placeholder="+966 11 456 7890"
                          className="w-full px-3 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs font-mono focus:border-[#c5a869]"
                        />
                        <span className="text-[10px] text-slate-400 mt-0.5 block">
                          {isAr ? 'يظهر في أعلى الموقع وقسم تواصل معنا والفوتر' : 'Appears in top bar, contact section & footer'}
                        </span>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
                          <Shield className="w-3.5 h-3.5 text-[#c5a869]" />
                          <span>{isAr ? 'خط الطوارئ والاستشارات 24/7 (Emergency Hotline)' : '24/7 Emergency Hotline'}</span>
                        </label>
                        <input
                          type="text"
                          value={settings.emergencyPhone}
                          onChange={(e) => setSettings({ ...settings, emergencyPhone: e.target.value })}
                          placeholder="+966 50 123 4567"
                          className="w-full px-3 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs font-mono focus:border-[#c5a869]"
                        />
                        <span className="text-[10px] text-slate-400 mt-0.5 block">
                          {isAr ? 'مخصص للقضايا العاجلة والخط الساخن السريع' : 'Dedicated to high-stakes urgent issues'}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-[#c5a869]" />
                          <span>{isAr ? 'البريد الإلكتروني العام المعتمد (Email)' : 'Official Email'}</span>
                        </label>
                        <input
                          type="email"
                          value={settings.email}
                          onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                          placeholder="info@aladllaw.com"
                          className="w-full px-3 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-[#c5a869]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#c5a869]" />
                          <span>{isAr ? 'ساعات استقبال المراجعين والعمل (Working Hours)' : 'Working Hours'}</span>
                        </label>
                        <input
                          type="text"
                          value={settings.workingHoursAr || ''}
                          onChange={(e) => setSettings({ ...settings, workingHoursAr: e.target.value })}
                          placeholder="الأحد - الخميس: 8:00 ص - 6:00 م"
                          className="w-full px-3 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-[#c5a869]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-200 mb-1">
                        {isAr ? 'كلمة مرور لوحة التحكم الجديدة (Admin Password)' : 'Admin Password'}
                      </label>
                      <input
                        type="text"
                        value={settings.adminPassword || 'admin'}
                        onChange={(e) => setSettings({ ...settings, adminPassword: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs"
                      />
                    </div>

                    {/* Live Contact Preview Card */}
                    <div className="p-4 rounded-xl bg-slate-950 border border-[#c5a869]/30 space-y-2">
                      <span className="text-[11px] font-bold text-[#e5cb8e] flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#c5a869]" />
                        <span>{isAr ? 'معاينة فورية لظهور بيانات التواصل في صفحة «تواصل معنا»:' : 'Live Preview of Contact Channels in Website:'}</span>
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-300">
                        <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">{isAr ? 'الهاتف المباشر:' : 'Direct Phone:'}</span>
                          <span className="font-mono text-white font-bold">{settings.phone || '—'}</span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                          <span className="text-[10px] text-amber-400 block">{isAr ? 'خط الطوارئ 24/7:' : '24/7 Hotline:'}</span>
                          <span className="font-mono text-white font-bold">{settings.emergencyPhone || '—'}</span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">{isAr ? 'البريد الرسمي:' : 'Email:'}</span>
                          <span className="text-white font-semibold truncate block">{settings.email || '—'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#c5a869] to-[#aa8022] text-slate-950 font-bold text-sm hover:brightness-110 transition flex items-center gap-2 cursor-pointer shadow-xl"
                  >
                    <Save className="w-4 h-4 text-slate-950" />
                    <span>{isAr ? 'حفظ وتطبيق كافة التغييرات على الموقع فوراً' : 'Apply & Save All Changes'}</span>
                  </button>
                </form>
              )}

              {/* TAB 9: BACKUP & SUPABASE CLOUD DATABASE SYNC */}
              {activeTab === 'backup' && (
                <div className="space-y-6 max-w-3xl">
                  <div>
                    <h3 className="text-xl font-bold font-serif-title text-white">
                      {isAr ? 'النسخ الاحتياطي والمزامنة السحابية مع Supabase' : 'Backup & Supabase Cloud Sync'}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {isAr 
                        ? 'مزامنة وحفظ كافة بيانات ومحتويات الموقع فورياً مع قاعدة البيانات السحابية Supabase مع إمكانية استيراد وتصدير النسخ الاحتياطية' 
                        : 'Sync and persist all site data in real-time with Supabase cloud database, plus backup export/import tools'}
                    </p>
                  </div>

                  {/* 1. PRIMARY: SUPABASE CLOUD DATABASE SYNC */}
                  <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-950/60 via-slate-900 to-slate-950 border-2 border-emerald-500/60 shadow-2xl space-y-5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-900/40">
                          <Database className="w-6 h-6 animate-pulse" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-white text-base">
                              {isAr ? 'المزامنة مع قاعدة البيانات على السحابة (Supabase)' : 'Cloud Database Sync (Supabase)'}
                            </h4>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              supabaseConfigService.isConfigured()
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            }`}>
                              {supabaseConfigService.isConfigured() 
                                ? (isAr ? 'متصل بالسحابة ✅' : 'Connected ✅') 
                                : (isAr ? 'يحتاج إعداد المفاتيح ⚠️' : 'Setup Required ⚠️')}
                            </span>
                          </div>
                          <p className="text-xs text-emerald-200/80">
                            {isAr 
                              ? 'حفظ وتحديث فوري لكافة بيانات المكتب (الشركاء، الخدمات، المقالات، الإعدادات) في قاعدة البيانات السحابية ليراها زوار موقعك مباشرة' 
                              : 'Real-time sync of all firm data (team, practices, articles, identity) to your cloud database for public visitors.'}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowSupabaseConfig(!showSupabaseConfig)}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition self-start sm:self-auto cursor-pointer"
                      >
                        <Settings className="w-3.5 h-3.5 text-[#c5a869]" />
                        <span>{showSupabaseConfig ? (isAr ? 'إخفاء الإعدادات' : 'Hide Settings') : (isAr ? 'إعدادات الاتصال' : 'Connection Settings')}</span>
                      </button>
                    </div>

                    {/* Quick Supabase Credentials Form (Collapsible) */}
                    {showSupabaseConfig && (
                      <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-4 animate-fade-in text-xs">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                          <span className="font-bold text-white flex items-center gap-1.5">
                            <Database className="w-4 h-4 text-[#c5a869]" />
                            {isAr ? 'بيانات ربط مشروع Supabase:' : 'Supabase Project Credentials:'}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {isAr ? '(يتم حفظها بأمان في التخزين السحابي والمحلي)' : '(Saved securely)'}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-slate-300 mb-1 font-medium">
                              {isAr ? 'رابط مشروع Supabase (Project URL):' : 'Project URL:'}
                            </label>
                            <input
                              type="url"
                              value={supabaseConfig.url}
                              onChange={(e) => setSupabaseConfig({ ...supabaseConfig, url: e.target.value })}
                              placeholder="https://xyzcompany.supabase.co"
                              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-emerald-500 focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-300 mb-1 font-medium">
                              {isAr ? 'مفتاح الوصول العام (Anon Public Key):' : 'Anon Public Key:'}
                            </label>
                            <input
                              type="password"
                              value={supabaseConfig.anonKey}
                              onChange={(e) => setSupabaseConfig({ ...supabaseConfig, anonKey: e.target.value })}
                              placeholder="eyJhbGciOiJIUzI1NiIsIn..."
                              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-emerald-500 focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <button
                            type="button"
                            onClick={handleSaveSupabaseConfig}
                            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/40 font-bold flex items-center gap-1.5 transition cursor-pointer"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>{isAr ? 'فحص وحفظ إعدادات الاتصال' : 'Test & Save Credentials'}</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Status Banner */}
                    {isSyncingSupabase && (
                      <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 flex items-center gap-3 animate-fade-in text-xs text-emerald-200">
                        <Loader2 className="w-5 h-5 text-emerald-400 animate-spin flex-shrink-0" />
                        <div>
                          <strong className="block text-white font-bold mb-0.5">
                            {isAr ? 'جاري مزامنة بيانات ومحتويات الموقع مع قاعدة البيانات على السحابة في Supabase...' : 'Syncing data with Supabase...'}
                          </strong>
                          <span>{isAr ? 'يتم رفع الجداول وسجلات المحامين والمقالات والإعدادات' : 'Uploading tables and snapshot...'}</span>
                        </div>
                      </div>
                    )}

                    {isFetchingSupabase && (
                      <div className="p-4 rounded-2xl bg-teal-950/80 border border-teal-500/50 flex items-center gap-3 animate-fade-in text-xs text-teal-200">
                        <Loader2 className="w-5 h-5 text-teal-400 animate-spin flex-shrink-0" />
                        <div>
                          <strong className="block text-white font-bold mb-0.5">
                            {isAr ? 'جاري جلب وتحديث البيانات من Supabase...' : 'Fetching data from Supabase...'}
                          </strong>
                        </div>
                      </div>
                    )}

                    {supabaseSyncResult && !isSyncingSupabase && !isFetchingSupabase && (
                      <div className="space-y-3">
                        <div className={`p-4 rounded-2xl border flex items-start gap-3 animate-fade-in text-xs leading-relaxed ${
                          supabaseSyncResult.success 
                            ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200' 
                            : 'bg-rose-950/60 border-rose-500/50 text-rose-200'
                        }`}>
                          {supabaseSyncResult.success ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1">
                            <strong className="block text-white font-bold mb-1">
                              {supabaseSyncResult.success 
                                ? (isAr ? '✅ تمت المزامنة السحابية بنجاح!' : '✅ Cloud Sync Successful!')
                                : (isAr ? '⚠️ تنبيه في المزامنة السحابية' : '⚠️ Cloud Sync Notice')}
                            </strong>
                            <span>{supabaseSyncResult.message}</span>
                          </div>
                        </div>

                        {/* RLS Quick Fix Box */}
                        {!supabaseSyncResult.success && (supabaseSyncResult.message.includes('RLS') || supabaseSyncResult.message.includes('سياسة الأمان') || supabaseSyncResult.message.includes('row-level security')) && (
                          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-2.5 shadow-sm">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div className="flex items-center gap-2 font-bold text-amber-300">
                                <Shield className="w-4 h-4 flex-shrink-0" />
                                <span>{isAr ? 'حل مشكلة تصريح الكتابة (RLS Fix):' : 'Fix RLS Write Permissions:'}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(SUPABASE_QUICK_RLS_FIX_SQL);
                                  setCopiedRlsFix(true);
                                  setTimeout(() => setCopiedRlsFix(false), 2500);
                                }}
                                className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                              >
                                {copiedRlsFix ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                <span>{copiedRlsFix ? (isAr ? 'تم النسخ!' : 'Copied!') : (isAr ? 'نسخ أمر فك القفل' : 'Copy RLS Disable')}</span>
                              </button>
                            </div>
                            <p className="text-[11px] text-slate-300">
                              {isAr 
                                ? 'يمنع نظام الحماية في Supabase كتابة البيانات بالمفتاح العام (anon). الصق هذا الأمر في SQL Editor داخل لوحة Supabase لتجاوز الحظر فوراً:'
                                : 'Row Level Security is blocking anon writes. Run this in Supabase SQL Editor to enable writes:'}
                            </p>
                            <pre className="p-2 bg-slate-950 rounded text-[11px] font-mono text-amber-300 border border-amber-500/20 overflow-x-auto" dir="ltr">
                              ALTER TABLE IF EXISTS public.law_firms DISABLE ROW LEVEL SECURITY;
                            </pre>
                          </div>
                        )}

                        {/* Missing Table Quick Schema Box */}
                        {!supabaseSyncResult.success && (supabaseSyncResult.message.includes('غير موجود') || supabaseSyncResult.message.includes('does not exist') || supabaseSyncResult.message.includes('42P01')) && (
                          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-200 text-xs space-y-2.5 shadow-sm">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div className="flex items-center gap-2 font-bold text-blue-300">
                                <Code2 className="w-4 h-4 flex-shrink-0" />
                                <span>{isAr ? 'إنشاء جداول Supabase:' : 'Create Supabase Tables:'}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
                                  setCopiedSchema(true);
                                  setTimeout(() => setCopiedSchema(false), 2500);
                                }}
                                className="px-3 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                              >
                                {copiedSchema ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                <span>{copiedSchema ? (isAr ? 'تم نسخ كود SQL!' : 'Copied!') : (isAr ? 'نسخ كود إنشاء الجداول' : 'Copy SQL Schema')}</span>
                              </button>
                            </div>
                            <p className="text-[11px] text-slate-300">
                              {isAr 
                                ? 'جدول law_firms غير موجود بعد في مشروعك. توجه إلى Supabase SQL Editor والصق الكود واضغط Run.'
                                : 'Table law_firms does not exist. Run the schema in Supabase SQL Editor.'}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* ACTION BUTTONS: SYNC TO SUPABASE & FETCH FROM SUPABASE */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <button
                        type="button"
                        onClick={handleSyncToSupabase}
                        disabled={isSyncingSupabase || isFetchingSupabase}
                        className="py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:brightness-110 text-slate-950 font-extrabold text-sm sm:text-base flex items-center justify-center gap-2.5 transition cursor-pointer shadow-xl shadow-emerald-950/60 disabled:opacity-50"
                      >
                        {isSyncingSupabase ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin text-slate-950" />
                            <span>{isAr ? 'جاري المزامنة مع Supabase...' : 'Syncing to Supabase...'}</span>
                          </>
                        ) : (
                          <>
                            <Database className="w-5 h-5 text-slate-950" />
                            <span>{isAr ? '🚀 مزامنة مع قاعدة البيانات على السحابة في Supabase' : '🚀 Sync to Supabase Cloud'}</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={handleFetchFromSupabase}
                        disabled={isSyncingSupabase || isFetchingSupabase}
                        className="py-4 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm flex items-center justify-center gap-2.5 border border-slate-700 transition cursor-pointer disabled:opacity-50 shadow-md"
                      >
                        {isFetchingSupabase ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin text-[#c5a869]" />
                            <span>{isAr ? 'جاري الجلب...' : 'Fetching...'}</span>
                          </>
                        ) : (
                          <>
                            <RefreshCw className="w-5 h-5 text-[#c5a869]" />
                            <span>{isAr ? '📥 جلب وتحديث البيانات من Supabase' : '📥 Pull & Refresh from Supabase'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* 2. MANUAL REPO UPDATE OPTIONS */}
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-900 border border-[#c5a869]/50 space-y-4 shadow-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-[#c5a869]/20 border border-[#c5a869]/40 flex items-center justify-center text-[#c5a869]">
                          <Cloud className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-sm">
                            {isAr ? 'طرق بديلة: تنزيل ملفات الكود المصدري للمشروع' : 'Manual Alternative: Download Source Data Files'}
                          </h4>
                          <span className="text-[11px] text-[#e5cb8e] font-medium">
                            {isAr ? 'تنزيل ملف البيانات واستبداله في مشروعك يدوياً' : 'Download and replace in your project codebase'}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] px-2.5 py-1 rounded-full bg-[#c5a869]/20 text-[#e5cb8e] border border-[#c5a869]/40 font-semibold flex items-center gap-1">
                        <HardDrive className="w-3 h-3 text-[#c5a869]" />
                        <span>{isAr ? 'ملفات جاهزة' : 'Ready Files'}</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                      <button
                        type="button"
                        onClick={handleDownloadInitialDataTS}
                        className="p-3 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#c5a869] to-[#aa8022] hover:brightness-110 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-md"
                      >
                        <FileCode className="w-4 h-4 text-slate-950" />
                        <span>{isAr ? 'تنزيل initialData.ts' : 'Download initialData.ts'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleCopyInitialDataTS}
                        className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                      >
                        {copiedTS ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-[#c5a869]" />}
                        <span>{copiedTS ? (isAr ? 'تم النسخ بنجاح!' : 'Copied!') : (isAr ? 'نسخ كود TypeScript' : 'Copy TS Code')}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleDownloadSiteDataJSON}
                        className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                        title={isAr ? 'تنزيل ملف site_data.json لوضعه داخل مجلد public في المشروع' : 'Download site_data.json for public folder'}
                      >
                        <Download className="w-4 h-4 text-cyan-400" />
                        <span>{isAr ? 'تنزيل site_data.json لمجلد public' : 'Download site_data.json'}</span>
                      </button>
                    </div>
                  </div>

                  {/* 3. IMPORT & RESTORE BACKUP (JSON) */}
                  <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                        <Upload className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm">{isAr ? 'استيراد وحفظ النسخة الاحتياطية (Import JSON)' : 'Import & Save JSON Backup'}</h4>
                        <span className="text-[11px] text-slate-400">{isAr ? 'استعادة وتثبيت كامل بيانات الشركاء والاختصاصات والمقالات والإعدادات في المتصفح' : 'Restore & permanently save all partners, practices, articles and settings'}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300">
                      {isAr ? 'اختر ملف النسخة الاحتياطية (JSON) الذي قمت بتنزيله سابقاً؛ سيتم حفظه فورياً وتحديث كافة عناصر الموقع.' : 'Select a previously exported JSON backup file to restore and persist all data on this domain.'}
                    </p>

                    <label className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:brightness-110 text-slate-950 text-xs font-bold cursor-pointer transition shadow-lg shadow-emerald-900/30">
                      <Upload className="w-4 h-4 text-slate-950" />
                      <span>{isAr ? 'اختيار ملف JSON واستعادة البيانات فوراً' : 'Select JSON File & Restore Data'}</span>
                      <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
                    </label>
                  </div>

                  {/* 3. EXPORT BACKUP (JSON) */}
                  <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-[#c5a869]/20 border border-[#c5a869]/40 flex items-center justify-center text-[#c5a869]">
                        <Download className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm">{isAr ? 'تصدير نسخة احتياطية كاملة (Export JSON)' : 'Export Full JSON Backup'}</h4>
                        <span className="text-[11px] text-slate-400">{isAr ? 'حفظ لقطة كاملة لجميع البيانات للاحتفاظ بها أو نقلها لأي موقع أو جهاز آخر' : 'Download a full snapshot of all data to transfer or backup safely'}</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-300">
                      {isAr ? 'تنزيل ملف JSON يحتوي على كافة بيانات الشركاء، الاختصاصات، الإنجازات، المقالات، رسائل العملاء، وإعدادات الهوية.' : 'Download a JSON snapshot containing all partners, practices, case studies, blogs, and settings.'}
                    </p>
                    <button
                      type="button"
                      onClick={handleExportBackup}
                      className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-[#e5cb8e] border border-[#c5a869]/30 text-xs font-semibold flex items-center gap-2 transition cursor-pointer"
                    >
                      <Download className="w-4 h-4 text-[#c5a869]" />
                      <span>{isAr ? 'تنزيل ملف النسخة الاحتياطية (JSON)' : 'Download Backup File (.json)'}</span>
                    </button>
                  </div>

                  {/* 4. SAFE CACHE CLEAR & APP UPDATE */}
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-cyan-950/40 via-slate-900 to-slate-900 border border-cyan-500/40 space-y-4 shadow-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                          <RefreshCw className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-sm">
                            {isAr ? 'مسح الكاش وتحديث التطبيق (مع الحفاظ الكامل على البيانات)' : 'Safe Cache Clear & App Refresh (Preserving All Data)'}
                          </h4>
                          <span className="text-[11px] text-cyan-300 font-medium">
                            {isAr ? 'تحديث فوري لملفات وشفرات التطبيق دون المساس بالبيانات' : 'Instant app update without touching any stored records'}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold flex items-center gap-1">
                        <Shield className="w-3 h-3 text-emerald-400" />
                        <span>{isAr ? 'حماية مشددة للبيانات' : 'Data Protected'}</span>
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {isAr 
                        ? 'يقوم هذا الخيار بمسح ذاكرة التخزين المؤقت للمتصفح (Cache Storage) وإعادة تحميل أحدث ملفات الواجهة مع التحقق المسبق من حفظ وتأمين كافة بيانات الشركاء، المقالات، الاستشارات، والإعدادات في التخزين المزدوج (LocalStorage + IndexedDB).'
                        : 'This safely purges stale browser caches & reloads the latest app code while ensuring all your partners, articles, consultations, and settings remain 100% intact and backed up.'}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-300 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                      <div className="flex items-center gap-1.5 text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{isAr ? 'حفظ البيانات محلياً وفي IndexedDB' : 'Dual LocalStorage + IDB backup'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-cyan-400">
                        <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{isAr ? 'تفريغ الكاش القديم وتحديث الأصول' : 'Purge old cache & fetch latest assets'}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleClearCacheAndRefresh}
                      disabled={!!cacheRefreshProgress}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-cyan-500 to-teal-500 hover:brightness-110 text-slate-950 text-xs font-bold flex items-center gap-2 transition cursor-pointer shadow-lg shadow-cyan-900/30"
                    >
                      <RefreshCw className="w-4 h-4 text-slate-950" />
                      <span>{isAr ? 'مسح الكاش وتحديث التطبيق الآن' : 'Clear Cache & Update App Now'}</span>
                    </button>
                  </div>

                  {/* 5. RESET TO DEFAULTS */}
                  <div className="p-6 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-4">
                    <h4 className="font-bold text-rose-300 text-sm">{isAr ? 'إعادة ضبط المصنع (Reset Defaults)' : 'Reset to Defaults'}</h4>
                    <p className="text-xs text-slate-400">
                      {isAr ? 'إعادة كافة البيانات إلى البيانات الأولية المعتمدة للمكتب.' : 'Reset all partners, articles, and settings to original defaults.'}
                    </p>
                    <button
                      type="button"
                      onClick={handleResetDefaults}
                      className="px-5 py-2.5 rounded-xl bg-rose-900/40 hover:bg-rose-900 text-rose-200 border border-rose-500/40 text-xs font-semibold flex items-center gap-2 transition cursor-pointer"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>{isAr ? 'استعادة البيانات الافتراضية' : 'Reset to Defaults'}</span>
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirmTarget && (
          <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
            <div className="w-full max-w-md p-6 rounded-3xl bg-slate-900 border border-rose-500/50 shadow-2xl text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center mx-auto text-rose-400">
                <Trash2 className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-1">
                  {isAr ? 'تأكيد الحذف النهائي' : 'Confirm Permanent Deletion'}
                </h3>
                <p className="text-xs text-slate-300">
                  {isAr ? `هل أنت متأكد من رغبتك في حذف "${deleteConfirmTarget.title}"؟ لا يمكن التراجع عن هذا الإجراء.` : `Are you sure you want to delete "${deleteConfirmTarget.title}"? This action cannot be undone.`}
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setDeleteConfirmTarget(null)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  onClick={() => {
                    const { type, id } = deleteConfirmTarget;
                    if (type === 'partner') {
                      const updated = storageService.deletePartner(id);
                      setPartners(updated);
                      showToast(isAr ? 'تم حذف الشريك بنجاح' : 'Partner deleted');
                    } else if (type === 'practice') {
                      const updated = storageService.deletePracticeArea(id);
                      setPracticeAreas(updated);
                      showToast(isAr ? 'تم حذف الاختصاص بنجاح' : 'Practice area deleted');
                    } else if (type === 'caseStudy') {
                      const updated = storageService.deleteCaseStudy(id);
                      setCaseStudies(updated);
                      showToast(isAr ? 'تم حذف القضية بنجاح' : 'Case study deleted');
                    } else if (type === 'testimonial') {
                      const updated = storageService.deleteTestimonial(id);
                      setTestimonials(updated);
                      showToast(isAr ? 'تم حذف الشهادة بنجاح' : 'Testimonial deleted');
                    } else if (type === 'blog') {
                      const updated = storageService.deleteBlogPost(id);
                      setBlogPosts(updated);
                      showToast(isAr ? 'تم حذف المقال بنجاح' : 'Article deleted');
                    } else if (type === 'office') {
                      const updated = storageService.deleteOffice(id);
                      setOffices(updated);
                      showToast(isAr ? 'تم حذف المقر بنجاح' : 'Office deleted');
                    } else if (type === 'message') {
                      const updated = storageService.deleteMessage(id);
                      setMessages(updated);
                      showToast(isAr ? 'تم حذف الرسالة بنجاح' : 'Message deleted');
                    }
                    setDeleteConfirmTarget(null);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition cursor-pointer shadow-lg"
                >
                  {isAr ? 'نعم، حذف نهائي' : 'Yes, Delete'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
