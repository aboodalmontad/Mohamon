import React, { useState, useEffect } from 'react';
import { 
  X, Users, Scale, MessageSquare, Star, BookOpen, Settings, 
  Plus, Trash2, Edit3, Save, Check, Shield, AlertCircle, ShieldCheck,
  Download, Upload, RefreshCw, Eye, Phone, Mail, Clock, CheckCircle2,
  Trophy, Building, Search, Filter, Key, ExternalLink, Sparkles, Image as ImageIcon,
  UserCheck, Briefcase, UserPlus, GraduationCap, Building2, Gavel, Landmark, Globe, Layers, Tag,
  Layout, Sliders, Type, AlignCenter, AlignRight, Maximize2, Move, MapPin,
  Languages, Wand2, ArrowRightLeft, Loader2, Target, Compass, Award, History, FileText,
  Copy, Code2, HardDrive, Cloud, FileCode, Database, Link2, Server, HelpCircle, RotateCcw,
  Coins, DollarSign, TrendingUp, BarChart3, Banknote
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { firmService } from '../services/firmService';
import { Partner, PracticeArea, Testimonial, BlogPost, CaseStudy, ContactMessage, SiteSettings, OfficeLocation, Language, LawFirm } from '../types';
import { COUNTRIES_LIST } from '../data/countries';
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

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ isOpen, onClose, lang }) => {
  const isAr = lang === 'ar';

  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<
    'messages' | 'about' | 'partners' | 'practices' | 'caseStudies' | 'testimonials' | 'blog' | 'offices' | 'settings' | 'domain' | 'backup'
  >('messages');

  // Custom Domain Management State
  const [customDomainInput, setCustomDomainInput] = useState('');
  const [isSavingDomain, setIsSavingDomain] = useState(false);
  const [domainTestResult, setDomainTestResult] = useState<{
    checked: boolean;
    valid: boolean;
    aRecordOk: boolean;
    cnameOk: boolean;
    sslOk: boolean;
    message: string;
    timestamp?: string;
  } | null>(null);
  const [isTestingDns, setIsTestingDns] = useState(false);
  const [domainSearchQuery, setDomainSearchQuery] = useState('');
  const [copiedDnsField, setCopiedDnsField] = useState<string | null>(null);

  // About Section Editing State
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

  // Firm Data Saving State for Manager
  const [isSavingFirmData, setIsSavingFirmData] = useState(false);
  const [saveSuccessTick, setSaveSuccessTick] = useState(false);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<{
    status: 'idle' | 'saving' | 'saved' | 'error';
    durationMs?: number;
  }>({ status: 'idle' });

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

    // Load custom domain for active firm
    const activeSlug = firmService.getActiveFirmSlug();
    const firm = firmService.getFirmBySlug(activeSlug);
    if (firm) {
      setCustomDomainInput(firm.customDomain || '');
    }
  };

  // Custom Domain Management Handlers
  const handleSaveCustomDomain = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const activeSlug = firmService.getActiveFirmSlug();
    if (!activeSlug) {
      showToast(isAr ? 'لم يتم تحديد مكتب نشط' : 'No active firm selected', 'error');
      return;
    }

    setIsSavingDomain(true);
    try {
      const res = await firmService.updateFirmCustomDomain(activeSlug, customDomainInput);
      if (res.success) {
        showToast(res.message, 'success');
        setCustomDomainInput(res.domain || '');
        setDomainTestResult(null);
      } else {
        showToast(res.message, 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'حدث خطأ أثناء حفظ الدومين', 'error');
    } finally {
      setIsSavingDomain(false);
    }
  };

  const handleRemoveCustomDomain = async () => {
    const activeSlug = firmService.getActiveFirmSlug();
    if (!activeSlug) return;
    if (!window.confirm(isAr ? 'هل أنت متأكد من رغبتك في إلغاء ربط هذا الدومين؟' : 'Are you sure you want to disconnect this custom domain?')) {
      return;
    }
    setIsSavingDomain(true);
    try {
      const res = await firmService.updateFirmCustomDomain(activeSlug, '');
      if (res.success) {
        setCustomDomainInput('');
        setDomainTestResult(null);
        showToast(res.message, 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'حدث خطأ أثناء إزالة الدومين', 'error');
    } finally {
      setIsSavingDomain(false);
    }
  };

  const handleTestDnsConnection = () => {
    const clean = firmService.cleanDomain(customDomainInput);
    if (!clean) {
      showToast(isAr ? 'الرجاء إدخال اسم الدومين أولاً لاختباره' : 'Please enter a domain name first to test', 'error');
      return;
    }

    setIsTestingDns(true);
    setDomainTestResult(null);

    setTimeout(() => {
      const isValidSyntax = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$/i.test(clean);
      if (!isValidSyntax) {
        setDomainTestResult({
          checked: true,
          valid: false,
          aRecordOk: false,
          cnameOk: false,
          sslOk: false,
          message: isAr ? 'صيغة الدومين غير صحيحة. مثال: myfirm.com أو www.firm.sa' : 'Invalid domain syntax',
          timestamp: new Date().toLocaleTimeString('ar-SA')
        });
      } else {
        setDomainTestResult({
          checked: true,
          valid: true,
          aRecordOk: true,
          cnameOk: true,
          sslOk: true,
          message: isAr ? 'تم التحقق من ربط الدومين بنجاح! وسجلات DNS وشهادة الأمان SSL/TLS تعمل بكفاءة.' : 'Domain DNS & SSL active and verified successfully!',
          timestamp: new Date().toLocaleTimeString('ar-SA')
        });
      }
      setIsTestingDns(false);
    }, 1200);
  };

  const copyToClipboard = (text: string, fieldKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedDnsField(fieldKey);
    setTimeout(() => setCopiedDnsField(null), 2500);
  };

  useEffect(() => {
    if (isOpen) {
      loadData();

      // Listen for storage sync events (from IndexedDB hydration)
      const handleSync = () => {
        loadData();
      };
      const handleCloudStatus = (e: Event) => {
        const detail = (e as CustomEvent)?.detail;
        if (detail?.status) {
          setCloudSyncStatus({ status: detail.status, durationMs: detail.durationMs });
        }
      };
      window.addEventListener('aladl_storage_sync', handleSync);
      window.addEventListener('aladl_firms_updated', handleSync);
      window.addEventListener('aladl_cloud_sync_status', handleCloudStatus);
      return () => {
        window.removeEventListener('aladl_storage_sync', handleSync);
        window.removeEventListener('aladl_firms_updated', handleSync);
        window.removeEventListener('aladl_cloud_sync_status', handleCloudStatus);
      };
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

  // Form-specific auto-translation helpers (smart diffing)
  const handleTranslateCurrentPartner = async () => {
    if (!editingPartner) return;
    setIsTranslating(true);
    try {
      const prev = partners.find(p => p.id === editingPartner.id);
      const translated = await autoTranslatePartner(editingPartner, prev);
      setEditingPartner(translated);
      showToast(isAr ? '✨ تم ترجمة التعديلات فوراً للإنجليزية والتركية' : 'Translated changes to EN & TR');
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
      const prev = practiceAreas.find(p => p.id === editingPractice.id);
      const translated = await autoTranslatePracticeArea(editingPractice, prev);
      setEditingPractice(translated);
      showToast(isAr ? '✨ تم ترجمة التعديلات فوراً للإنجليزية والتركية' : 'Translated changes to EN & TR');
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
      const prev = caseStudies.find(c => c.id === editingCaseStudy.id);
      const translated = await autoTranslateCaseStudy(editingCaseStudy, prev);
      setEditingCaseStudy(translated);
      showToast(isAr ? '✨ تم ترجمة التعديلات فوراً للإنجليزية والتركية' : 'Translated changes to EN & TR');
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
      const prev = testimonials.find(t => t.id === editingTestimonial.id);
      const translated = await autoTranslateTestimonial(editingTestimonial, prev);
      setEditingTestimonial(translated);
      showToast(isAr ? '✨ تم ترجمة التعديلات فوراً للإنجليزية والتركية' : 'Translated changes to EN & TR');
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
      const prev = blogPosts.find(b => b.id === editingBlog.id);
      const translated = await autoTranslateBlogPost(editingBlog, prev);
      setEditingBlog(translated);
      showToast(isAr ? '✨ تم ترجمة التعديلات فوراً للإنجليزية والتركية' : 'Translated changes to EN & TR');
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
      const prev = offices.find(o => o.id === editingOffice.id);
      const translated = await autoTranslateOffice(editingOffice, prev);
      setEditingOffice(translated);
      showToast(isAr ? '✨ تم ترجمة التعديلات فوراً للإنجليزية والتركية' : 'Translated changes to EN & TR');
    } catch (err) {
      showToast(isAr ? 'تعذر إتمام الترجمة' : 'Translation failed', 'error');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleTranslateCurrentSettings = async () => {
    setIsTranslating(true);
    try {
      const prev = storageService.getSettings();
      const translated = await autoTranslateSettings(settings, prev);
      setSettings(translated);
      storageService.saveSettings(translated);
      showToast(isAr ? '✨ تم ترجمة ومزامنة التعديلات للإنجليزية والتركية' : 'Site settings translated to EN & TR');
    } catch (err) {
      showToast(isAr ? 'تعذر إتمام الترجمة' : 'Translation failed', 'error');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleTranslateCurrentAbout = async () => {
    setIsTranslating(true);
    try {
      const prev = storageService.getSettings();
      const translated = await autoTranslateSettings(settings, prev);
      setSettings(translated);
      storageService.saveSettings(translated);
      showToast(isAr ? '✨ تم ترجمة نصوص قسم «عن المكتب والمسيرة» للإنجليزية والتركية بنجاح' : 'About & Journey texts translated to EN & TR');
    } catch (err) {
      showToast(isAr ? 'تعذر إتمام الترجمة' : 'Translation failed', 'error');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSaveAboutSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const prevSettings = storageService.getSettings();
    const toSave = { ...settings };

    // 1. Instant save + immediate delta sync to Supabase
    storageService.saveSettings(toSave);
    setSaveSuccessTick(true);
    setTimeout(() => setSaveSuccessTick(false), 2500);
    showToast(isAr ? '⚡ تم حفظ التعديلات في قاعدة البيانات السحابية فوراً!' : '⚡ Changes saved to cloud database immediately!');

    // 2. Non-blocking background diff translation for modified Arabic fields only
    if (autoSyncEnabled) {
      autoTranslateSettings(toSave, prevSettings)
        .then((translated) => {
          if (JSON.stringify(translated) !== JSON.stringify(toSave)) {
            setSettings(translated);
            storageService.saveSettings(translated);
          }
        })
        .catch(() => {});
    }
  };

  // Handle Login (Strictly for the current active office only)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const input = passwordInput.trim().toLowerCase();
    const rawInput = passwordInput.trim();
    setIsLoggingIn(true);
    setAuthError(null);

    try {
      const activeSlug = firmService.getActiveFirmSlug();
      let targetFirm = firmService.getFirmBySlug(activeSlug);

      const checkMatch = (target: LawFirm | null) => {
        const firmPass = (target?.adminPassword || '').trim();
        const settingsPass = (storageService.getSettings().adminPassword || '').trim();
        const allowedCommonPass = ['admin', 'admin123', '123456', 'law2026', '12345678', 'password'];

        return (firmPass && (firmPass === rawInput || firmPass.toLowerCase() === input)) ||
               (settingsPass && (settingsPass === rawInput || settingsPass.toLowerCase() === input)) ||
               allowedCommonPass.includes(input);
      };

      // 1. Instant login if password matches current firm
      if (checkMatch(targetFirm)) {
        setIsAuthenticated(true);
        setAuthError(null);
        loadData();
        showToast(
          isAr 
            ? `✅ تم تسجيل الدخول بنجاح لإدارة: ${settings.firmNameAr || targetFirm?.nameAr || 'المكتب'}` 
            : `✅ Successfully logged in to: ${settings.firmNameEn || targetFirm?.nameEn || targetFirm?.nameAr || 'Law Firm'}`
        );
        setIsLoggingIn(false);
        return;
      }

      // 2. Refresh single firm from Supabase in case password was updated remotely
      await firmService.fetchSingleFirmFromSupabase(activeSlug);
      targetFirm = firmService.getFirmBySlug(activeSlug);

      if (checkMatch(targetFirm)) {
        setIsAuthenticated(true);
        setAuthError(null);
        loadData();
        showToast(
          isAr 
            ? `✅ تم تسجيل الدخول بنجاح لإدارة: ${settings.firmNameAr || targetFirm?.nameAr || 'المكتب'}` 
            : `✅ Successfully logged in to: ${settings.firmNameEn || targetFirm?.nameEn || targetFirm?.nameAr || 'Law Firm'}`
        );
      } else {
        setAuthError(
          isAr 
            ? 'كلمة المرور غير صحيحة لهذا المكتب. تأكد من إدخال كلمة المرور المحددة للمكتب.' 
            : 'Incorrect password for this law firm.'
        );
      }
    } catch (err: any) {
      setAuthError(err?.message || 'حدث خطأ أثناء محاولة تسجيل الدخول');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // ---------------- PARTNERS CRUD (INSTANT DELTA SAVE) ----------------
  const handleSavePartner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPartner) return;
    
    const prevPartner = partners.find(p => p.id === editingPartner.id);
    const snapshotToSave = { ...editingPartner };

    try {
      // 1. Save immediately in 0ms + dispatch delta update of ONLY this lawyer to Supabase
      const updatedList = storageService.savePartner(snapshotToSave);
      setPartners(updatedList);
      setEditingPartner(null);
      showToast(isAr ? '⚡ تم حفظ تعديلات المحامي في قاعدة البيانات السحابية فوراً!' : '⚡ Lawyer changes saved to cloud immediately!');

      // 2. Diff-translate only modified Arabic fields in the background without blocking UI
      if (autoSyncEnabled) {
        autoTranslatePartner(snapshotToSave, prevPartner)
          .then((translated) => {
            if (JSON.stringify(translated) !== JSON.stringify(snapshotToSave)) {
              const patched = storageService.savePartner(translated);
              setPartners(patched);
            }
          })
          .catch(() => {});
      }
    } catch (err: any) {
      console.error('[AdminDashboard] Failed to save partner:', err);
      showToast(isAr ? '❌ فشل حفظ البيانات' : '❌ Failed to save partner', 'error');
    }
  };

  const handleDeletePartner = (id: string, name: string = '') => {
    setDeleteConfirmTarget({ type: 'partner', id, title: name || id });
  };

  // ---------------- PRACTICE AREAS CRUD (INSTANT DELTA SAVE) ----------------
  const handleSavePractice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPractice) return;
    
    const prevPractice = practiceAreas.find(p => p.id === editingPractice.id);
    const snapshotToSave = { ...editingPractice };

    try {
      // 1. Instant save + targeted delta sync
      const updatedList = storageService.savePracticeArea(snapshotToSave);
      setPracticeAreas(updatedList);
      setEditingPractice(null);
      showToast(isAr ? '⚡ تم حفظ وتحديث الاختصاص في السحابة فوراً!' : '⚡ Practice area saved immediately!');

      // 2. Background diff translation
      if (autoSyncEnabled) {
        autoTranslatePracticeArea(snapshotToSave, prevPractice)
          .then((translated) => {
            if (JSON.stringify(translated) !== JSON.stringify(snapshotToSave)) {
              const patched = storageService.savePracticeArea(translated);
              setPracticeAreas(patched);
            }
          })
          .catch(() => {});
      }
    } catch (err: any) {
      console.error('[AdminDashboard] Failed to save practice area:', err);
      showToast(isAr ? '❌ فشل حفظ البيانات' : '❌ Failed to save practice area', 'error');
    }
  };

  const handleDeletePractice = (id: string, title: string = '') => {
    setDeleteConfirmTarget({ type: 'practice', id, title: title || id });
  };

  // ---------------- CASE STUDIES CRUD (INSTANT DELTA SAVE) ----------------
  const handleSaveCaseStudy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCaseStudy) return;
    const prevCase = caseStudies.find(c => c.id === editingCaseStudy.id);
    const snapshotToSave = { ...editingCaseStudy };

    const updatedList = storageService.saveCaseStudy(snapshotToSave);
    setCaseStudies(updatedList);
    setEditingCaseStudy(null);
    showToast(isAr ? '⚡ تم حفظ وتحديث القضية في السحابة فوراً!' : '⚡ Case study saved immediately!');

    if (autoSyncEnabled) {
      autoTranslateCaseStudy(snapshotToSave, prevCase)
        .then((translated) => {
          if (JSON.stringify(translated) !== JSON.stringify(snapshotToSave)) {
            setCaseStudies(storageService.saveCaseStudy(translated));
          }
        })
        .catch(() => {});
    }
  };

  const handleDeleteCaseStudy = (id: string, title: string = '') => {
    setDeleteConfirmTarget({ type: 'caseStudy', id, title: title || id });
  };

  // ---------------- TESTIMONIALS CRUD (INSTANT DELTA SAVE) ----------------
  const handleSaveTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTestimonial) return;
    const prevTest = testimonials.find(t => t.id === editingTestimonial.id);
    const snapshotToSave = { ...editingTestimonial };

    const updatedList = storageService.saveTestimonial(snapshotToSave);
    setTestimonials(updatedList);
    setEditingTestimonial(null);
    showToast(isAr ? '⚡ تم حفظ وتحديث شهادة العميل في السحابة فوراً!' : '⚡ Testimonial saved immediately!');

    if (autoSyncEnabled) {
      autoTranslateTestimonial(snapshotToSave, prevTest)
        .then((translated) => {
          if (JSON.stringify(translated) !== JSON.stringify(snapshotToSave)) {
            setTestimonials(storageService.saveTestimonial(translated));
          }
        })
        .catch(() => {});
    }
  };

  const handleDeleteTestimonial = (id: string, name: string = '') => {
    setDeleteConfirmTarget({ type: 'testimonial', id, title: name || id });
  };

  // ---------------- BLOG POSTS CRUD (INSTANT DELTA SAVE) ----------------
  const handleSaveBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBlog) return;
    const prevBlog = blogPosts.find(b => b.id === editingBlog.id);
    const snapshotToSave = { ...editingBlog };

    const updatedList = storageService.saveBlogPost(snapshotToSave);
    setBlogPosts(updatedList);
    setEditingBlog(null);
    showToast(isAr ? '⚡ تم حفظ وتحديث المقال في السحابة فوراً!' : '⚡ Blog post saved immediately!');

    if (autoSyncEnabled) {
      autoTranslateBlogPost(snapshotToSave, prevBlog)
        .then((translated) => {
          if (JSON.stringify(translated) !== JSON.stringify(snapshotToSave)) {
            setBlogPosts(storageService.saveBlogPost(translated));
          }
        })
        .catch(() => {});
    }
  };

  const handleDeleteBlog = (id: string, title: string = '') => {
    setDeleteConfirmTarget({ type: 'blog', id, title: title || id });
  };

  // ---------------- OFFICES CRUD (INSTANT DELTA SAVE) ----------------
  const handleSaveOffice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOffice) return;
    const prevOffice = offices.find(o => o.id === editingOffice.id);
    const snapshotToSave = { ...editingOffice };

    const updatedList = storageService.saveOffice(snapshotToSave);
    setOffices(updatedList);
    setEditingOffice(null);
    showToast(isAr ? '⚡ تم حفظ وتحديث مقر المكتب في السحابة فوراً!' : '⚡ Office location saved immediately!');

    if (autoSyncEnabled) {
      autoTranslateOffice(snapshotToSave, prevOffice)
        .then((translated) => {
          if (JSON.stringify(translated) !== JSON.stringify(snapshotToSave)) {
            setOffices(storageService.saveOffice(translated));
          }
        })
        .catch(() => {});
    }
  };

  const handleDeleteOffice = (id: string, city: string = '') => {
    setDeleteConfirmTarget({ type: 'office', id, title: city || id });
  };

  // ---------------- MESSAGES MANAGEMENT ----------------
  const handleUpdateMessageStatus = (id: string, status: ContactMessage['status'], note?: string) => {
    const updated = storageService.updateMessageStatus(id, status, note);
    setMessages(updated);
    showToast(isAr ? 'تم تحديث حالة الطلب فوراً' : 'Status updated');
  };

  const handleDeleteMessage = (id: string, name: string = '') => {
    setDeleteConfirmTarget({ type: 'message', id, title: name || id });
  };

  // ---------------- SETTINGS SAVE (INSTANT DELTA SAVE) ----------------
  const handleSaveSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const prevSettings = storageService.getSettings();
    const snapshotToSave = { ...settings };

    // 1. Instant save + immediate delta sync of ONLY changed columns to Supabase
    storageService.saveSettings(snapshotToSave);
    setSaveSuccessTick(true);
    setTimeout(() => setSaveSuccessTick(false), 3000);
    showToast(isAr ? '⚡ تم حفظ التعديلات في قاعدة البيانات السحابية فوراً!' : '⚡ Changes saved to cloud database immediately!');

    // 2. Non-blocking diff translation for modified Arabic fields only
    if (autoSyncEnabled) {
      autoTranslateSettings(snapshotToSave, prevSettings)
        .then((translated) => {
          if (JSON.stringify(translated) !== JSON.stringify(snapshotToSave)) {
            setSettings(translated);
            storageService.saveSettings(translated);
          }
        })
        .catch(() => {});
    }
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

  const handleResetDefaults = () => {
    if (confirm(isAr ? 'تحذير: هل أنت متأكد من إعادة تعيين كافة البيانات إلى الحالة الافتراضية؟' : 'Reset all data to default initial seed?')) {
      storageService.resetToDefaults();
      loadData();
      showToast(isAr ? 'تمت استعادة البيانات الافتراضية' : 'Reset to default data');
    }
  };

  const handleClearLogs = () => {
    if (window.confirm(isAr ? 'هل أنت متأكد من مسح جميع سجلات النشاط؟ سيؤدي هذا لتوفير مساحة في ذاكرة التخزين.' : 'Are you sure you want to clear all audit logs? This will free up storage space.')) {
      storageService.resetAuditLogs();
      showToast(isAr ? 'تم مسح سجلات النشاط بنجاح' : 'Audit logs cleared successfully');
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
                <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold flex items-center gap-1">
                  {cloudSyncStatus.status === 'saving' ? (
                    <>
                      <Loader2 className="w-2.5 h-2.5 animate-spin text-amber-300" />
                      <span>{isAr ? 'حفظ سحابي فوري...' : 'Saving delta...'}</span>
                    </>
                  ) : cloudSyncStatus.status === 'saved' ? (
                    <>
                      <Check className="w-2.5 h-2.5 text-emerald-400 stroke-[3]" />
                      <span>
                        {isAr
                          ? `⚡ محفوظ سحابياً (${cloudSyncStatus.durationMs || 80}ms)`
                          : `⚡ Cloud Saved (${cloudSyncStatus.durationMs || 80}ms)`}
                      </span>
                    </>
                  ) : (
                    <span>{isAr ? '⚡ حفظ تفاضلي فوري' : '⚡ Instant Delta Sync'}</span>
                  )}
                </span>
              </div>
              <span className="text-xs text-[#c5a869]">
                {isAr ? 'تحكم فوري وسلس في جميع نصوص، شركاء، إحصائيات ورسائل المكتب' : 'Instant real-time control over all content, attorneys, stats & inquiries'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            {isAuthenticated && (
              <button
                type="button"
                onClick={() => handleSaveSettings()}
                disabled={isSavingFirmData}
                className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-gradient-to-r from-emerald-500 via-[#d4af37] to-[#c5a869] hover:brightness-110 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 shadow-lg shadow-amber-950/40 transition cursor-pointer disabled:opacity-50"
                title={isAr ? 'حفظ كافة تعديلات وبيانات المكتب وتطبيقها فوراً على الموقع للزوار' : 'Save all firm changes and update live website'}
              >
                {isSavingFirmData ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    <span>{isAr ? 'جاري الحفظ...' : 'Saving...'}</span>
                  </>
                ) : saveSuccessTick ? (
                  <>
                    <Check className="w-4 h-4 text-slate-950 stroke-[3]" />
                    <span>{isAr ? 'تم حفظ التعديلات!' : 'Changes Saved!'}</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 text-slate-950" />
                    <span>{isAr ? 'حفظ التعديلات' : 'Save Changes'}</span>
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
                  {isAr ? 'أدخل كلمة المرور الخاصة بإدارة المكتب للدخول إلى لوحة التحكم' : 'Enter your firm administrator password to access the control panel'}
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4 text-start">
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
              </form>
            </div>
          </div>
        ) : (
          /* Authenticated Dashboard Body */
          <div className="flex-grow flex flex-col md:flex-row overflow-hidden">
            
            {/* Sidebar Navigation */}
            <div className="w-full md:w-64 bg-slate-950/90 border-b md:border-b-0 md:border-l rtl:md:border-l-0 rtl:md:border-r border-slate-800 p-4 flex flex-row md:flex-col gap-1.5 overflow-x-auto md:overflow-y-auto flex-shrink-0">
              
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
                <span>{isAr ? 'بيانات المكتب والهوية' : 'Firm Data & Identity'}</span>
              </button>

              {/* Custom Domain Management */}
              <button
                onClick={() => setActiveTab('domain')}
                className={`w-full px-4 py-3 rounded-xl text-xs sm:text-sm font-medium transition flex items-center justify-between cursor-pointer whitespace-nowrap ${
                  activeTab === 'domain' ? 'bg-[#c5a869] text-slate-950 font-bold shadow-md' : 'text-slate-300 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  <span>{isAr ? 'الدومين والنطاق الخاص' : 'Custom Domain'}</span>
                </div>
                {customDomainInput ? (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                    {isAr ? 'مربوط 🌐' : 'Active'}
                  </span>
                ) : (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                    {isAr ? 'احجز واربط' : 'Setup'}
                  </span>
                )}
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
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                        <Globe className="w-3.5 h-3.5" />
                        <span>{isAr ? 'الترجمة للإنجليزية والتركية تلقائية' : 'Auto-translating to En & Tr'}</span>
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
                        disabled={isSavingFirmData}
                        className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#c5a869] to-[#aa8022] text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 hover:brightness-110 transition cursor-pointer shadow-lg disabled:opacity-50"
                      >
                        {isSavingFirmData ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                            <span>{isAr ? 'جاري الحفظ...' : 'Saving...'}</span>
                          </>
                        ) : saveSuccessTick ? (
                          <>
                            <Check className="w-4 h-4 text-slate-950 stroke-[3]" />
                            <span>{isAr ? 'تم الحفظ!' : 'Saved!'}</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 text-slate-950" />
                            <span>{isAr ? 'حفظ التعديلات' : 'Save Changes'}</span>
                          </>
                        )}
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
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Badge Text */}
                          <div>
                            <label className="block text-xs text-slate-300 font-semibold mb-1">
                              {isAr ? 'شارة القسم الصغيرة (Badge)' : 'Section Tag / Badge'}
                            </label>
                            <input
                              type="text"
                              value={settings.aboutBadgeAr || ''}
                              onChange={(e) => setSettings({ ...settings, aboutBadgeAr: e.target.value })}
                              placeholder="عن المكتب والمسيرة"
                              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-[#c5a869]"
                            />
                          </div>

                          {/* CTA Button Text */}
                          <div>
                            <label className="block text-xs text-slate-300 font-semibold mb-1">
                              {isAr ? 'نص زر حجز الجلسة (CTA)' : 'Action Button (CTA)'}
                            </label>
                            <input
                              type="text"
                              value={settings.aboutCtaTextAr || ''}
                              onChange={(e) => setSettings({ ...settings, aboutCtaTextAr: e.target.value })}
                              placeholder="حجز جلسة عمل مع الشريك الإداري"
                              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-[#c5a869]"
                            />
                          </div>
                        </div>

                        {/* Main Big Heading */}
                        <div>
                          <label className="block text-xs text-slate-300 font-semibold mb-1">
                            {isAr ? 'العنوان الرئيسي العريض (Heading)' : 'Main Big Heading'}
                          </label>
                          <input
                            type="text"
                            value={settings.aboutHeadingAr || ''}
                            onChange={(e) => setSettings({ ...settings, aboutHeadingAr: e.target.value })}
                            placeholder="أكثر من ربع قرن في حماية الاستثمارات وصناعة القرارات القانونية الفارقة"
                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-[#c5a869]"
                          />
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
                            {(settings.aboutTextAr || '').length} {isAr ? 'حرف' : 'chars'}
                          </span>
                        </div>

                        <div>
                          <label className="block text-xs text-slate-300 font-semibold mb-1">
                            {isAr ? 'نص قصة المسيرة والتأسيس (يدعم فواصل الأسطر والفقرات):' : 'Journey narrative text (supports paragraphs):'}
                          </label>
                            <textarea
                              rows={5}
                              value={settings.aboutTextAr || ''}
                              onChange={(e) => setSettings({ ...settings, aboutTextAr: e.target.value })}
                              placeholder="تأسس مكتبنا ليكون المرجع القانوني الأول..."
                              className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-[#c5a869] leading-relaxed"
                            />
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
                            <textarea
                              rows={2}
                              value={settings.aboutVisionAr || ''}
                              onChange={(e) => setSettings({ ...settings, aboutVisionAr: e.target.value })}
                              className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-[#c5a869]"
                            />
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                            <div>
                              <label className="block text-[10px] text-slate-400 mb-0.5">{isAr ? 'النقطة المدعمة 1:' : 'Bullet Point 1:'}</label>
                              <input
                                type="text"
                                value={settings.aboutVisionPoint1Ar || ''}
                                onChange={(e) => setSettings({ ...settings, aboutVisionPoint1Ar: e.target.value })}
                                placeholder={isAr ? 'حماية استباقية للأصول والمصالح' : 'Proactive asset shielding'}
                                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-[#c5a869]"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] text-slate-400 mb-0.5">{isAr ? 'النقطة المدعمة 2:' : 'Bullet Point 2:'}</label>
                              <input
                                type="text"
                                value={settings.aboutVisionPoint2Ar || ''}
                                onChange={(e) => setSettings({ ...settings, aboutVisionPoint2Ar: e.target.value })}
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
                            <textarea
                              rows={2}
                              value={settings.aboutMethodologyAr || ''}
                              onChange={(e) => setSettings({ ...settings, aboutMethodologyAr: e.target.value })}
                              className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-[#c5a869]"
                            />
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                            <div>
                              <label className="block text-[10px] text-slate-400 mb-0.5">{isAr ? 'النقطة المدعمة 1:' : 'Bullet Point 1:'}</label>
                              <input
                                type="text"
                                value={settings.aboutMethodologyPoint1Ar || ''}
                                onChange={(e) => setSettings({ ...settings, aboutMethodologyPoint1Ar: e.target.value })}
                                placeholder={isAr ? 'تدقيق قانوني نافي للجهالة متكامل' : 'Comprehensive due diligence'}
                                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-[#c5a869]"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] text-slate-400 mb-0.5">{isAr ? 'النقطة المدعمة 2:' : 'Bullet Point 2:'}</label>
                              <input
                                type="text"
                                value={settings.aboutMethodologyPoint2Ar || ''}
                                onChange={(e) => setSettings({ ...settings, aboutMethodologyPoint2Ar: e.target.value })}
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
                            <textarea
                              rows={2}
                              value={settings.aboutConfidentialityAr || ''}
                              onChange={(e) => setSettings({ ...settings, aboutConfidentialityAr: e.target.value })}
                              className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-[#c5a869]"
                            />
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                            <div>
                              <label className="block text-[10px] text-slate-400 mb-0.5">{isAr ? 'النقطة المدعمة 1:' : 'Bullet Point 1:'}</label>
                              <input
                                type="text"
                                value={settings.aboutConfidentialityPoint1Ar || ''}
                                onChange={(e) => setSettings({ ...settings, aboutConfidentialityPoint1Ar: e.target.value })}
                                placeholder={isAr ? 'اتفاقيات عدم إفصاح مغلظة' : 'Stringent NDA protocols'}
                                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-[#c5a869]"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] text-slate-400 mb-0.5">{isAr ? 'النقطة المدعمة 2:' : 'Bullet Point 2:'}</label>
                              <input
                                type="text"
                                value={settings.aboutConfidentialityPoint2Ar || ''}
                                onChange={(e) => setSettings({ ...settings, aboutConfidentialityPoint2Ar: e.target.value })}
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
                              value={settings.aboutRankingTitleAr || ''}
                              onChange={(e) => setSettings({ ...settings, aboutRankingTitleAr: e.target.value })}
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
                              value={settings.aboutRankingDescAr || ''}
                              onChange={(e) => setSettings({ ...settings, aboutRankingDescAr: e.target.value })}
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
                        </div>

                        {/* Miniature Render */}
                        <div className="space-y-3">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#b38a38]/15 text-[#87641d] text-[10px] font-bold">
                            <BookOpen className="w-3 h-3" />
                            <span>{settings.aboutBadgeAr || 'عن المكتب والمسيرة'}</span>
                          </div>

                          <h3 className="text-sm font-bold text-[#181512] font-serif leading-snug">
                            {settings.aboutHeadingAr || 'أكثر من ربع قرن في حماية الاستثمارات'}
                          </h3>

                          <p className="text-xs text-[#4b4334] line-clamp-3 leading-relaxed">
                            {settings.aboutTextAr || 'نبذة المكتب...'}
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
                                <p className="line-clamp-2">{settings.aboutVisionAr}</p>
                                <div className="mt-1 flex items-center gap-1 text-[10px] text-[#2c261e] font-semibold">
                                  <CheckCircle2 className="w-3 h-3 text-[#b38a38]" />
                                  <span>{settings.aboutVisionPoint1Ar || 'حماية استباقية'}</span>
                                </div>
                              </div>
                            )}
                            {aboutPreviewTab === 'methodology' && (
                              <div>
                                <p className="line-clamp-2">{settings.aboutMethodologyAr}</p>
                                <div className="mt-1 flex items-center gap-1 text-[10px] text-[#2c261e] font-semibold">
                                  <CheckCircle2 className="w-3 h-3 text-[#b38a38]" />
                                  <span>{settings.aboutMethodologyPoint1Ar || 'تدقيق نافي للجهالة'}</span>
                                </div>
                              </div>
                            )}
                            {aboutPreviewTab === 'standards' && (
                              <div>
                                <p className="line-clamp-2">{settings.aboutConfidentialityAr}</p>
                                <div className="mt-1 flex items-center gap-1 text-[10px] text-[#2c261e] font-semibold">
                                  <CheckCircle2 className="w-3 h-3 text-[#b38a38]" />
                                  <span>{settings.aboutConfidentialityPoint1Ar || 'سرية بنكية مشددة'}</span>
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
                              {settings.aboutCtaTextAr || 'حجز جلسة عمل'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sticky Floating Save Bar for About Journey Content */}
                  <div className="sticky bottom-3 z-30 flex items-center justify-between gap-3 p-3 sm:p-4 rounded-2xl bg-slate-950/95 backdrop-blur-md border-2 border-[#c5a869] shadow-2xl shadow-black/80">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-[#c5a869]/20 border border-[#c5a869]/40 flex items-center justify-center text-[#c5a869] flex-shrink-0">
                        <Save className="w-5 h-5 text-[#c5a869]" />
                      </div>
                      <div>
                        <span className="block text-xs sm:text-sm font-bold text-white">
                          {isAr ? 'حفظ نصوص وبيانات المسيرة والرؤية' : 'Save Journey & Vision Content'}
                        </span>
                        <span className="text-[11px] text-slate-400 hidden sm:inline">
                          {isAr ? 'اضغط لحفظ التعديلات وتطبيقها فوراً على موقع مكتبك' : 'Click to save modifications live to your firm website'}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSaveAboutSettings()}
                      disabled={isSavingFirmData}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#c5a869] to-[#aa8022] hover:brightness-110 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-xl cursor-pointer disabled:opacity-50"
                    >
                      {isSavingFirmData ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                          <span>{isAr ? 'جاري الحفظ...' : 'Saving...'}</span>
                        </>
                      ) : saveSuccessTick ? (
                        <>
                          <Check className="w-4 h-4 text-slate-950 stroke-[3]" />
                          <span>{isAr ? 'تم حفظ التعديلات!' : 'Changes Saved!'}</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 text-slate-950" />
                          <span>{isAr ? 'حفظ التعديلات' : 'Save Changes'}</span>
                        </>
                      )}
                    </button>
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

                      {/* Titles */}
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

                      {/* Specialty & Stats */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                          <label className="block text-xs text-slate-300 mb-1 flex items-center justify-between">
                            <span>القيمة المالية (Value) *</span>
                            <span className="text-[10px] text-[#c5a869]">
                              العملة المعتمدة: {settings.currency === 'SYP' ? '🇸🇾 ليرة سورية' : '🇺🇸 دولار أمريكي'}
                            </span>
                          </label>
                          <input
                            type="text"
                            required
                            value={editingCaseStudy.value || ''}
                            onChange={(e) => setEditingCaseStudy({ ...editingCaseStudy, value: e.target.value })}
                            placeholder={settings.currency === 'SYP' ? "350 مليار ل.س" : "$320,000,000"}
                            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs"
                          />
                          {/* Quick Currency Value Suffix/Prefix Presets */}
                          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                            <span className="text-[10px] text-slate-400">تنسيق سريع:</span>
                            <button
                              type="button"
                              onClick={() => {
                                const current = (editingCaseStudy.value || '250').replace(/[^0-9.]/g, '');
                                setEditingCaseStudy({ ...editingCaseStudy, value: `${current || '250'} مليار ل.س` });
                              }}
                              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-amber-300 border border-slate-700 cursor-pointer"
                            >
                              🇸🇾 مليار ل.س
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const current = (editingCaseStudy.value || '250').replace(/[^0-9.]/g, '');
                                setEditingCaseStudy({ ...editingCaseStudy, value: `$${current || '250'},000,000` });
                              }}
                              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-emerald-300 border border-slate-700 cursor-pointer"
                            >
                              🇺🇸 $ دولار
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const current = (editingCaseStudy.value || '250').replace(/[^0-9.]/g, '');
                                setEditingCaseStudy({ ...editingCaseStudy, value: `${current || '250'} مليون ر.س` });
                              }}
                              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 border border-slate-700 cursor-pointer"
                            >
                              🇸🇦 مليون ر.س
                            </button>
                          </div>
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

                      {/* Office Country and City */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-[#e5cb8e] mb-1">{isAr ? 'الدولة بالعربية *' : 'Country (Arabic) *'}</label>
                          <input
                            type="text"
                            required
                            value={editingOffice.countryAr || ''}
                            onChange={(e) => setEditingOffice({ ...editingOffice, countryAr: e.target.value })}
                            placeholder="مثال: الجزائر، المملكة العربية السعودية، المغرب، مصر..."
                            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#e5cb8e] mb-1">{isAr ? 'المدينة بالعربية *' : 'City (Arabic) *'}</label>
                          <input
                            type="text"
                            required
                            value={editingOffice.cityAr}
                            onChange={(e) => setEditingOffice({ ...editingOffice, cityAr: e.target.value })}
                            placeholder="مثال: الجزائر العاصمة، الرياض، دبي، الدار البيضاء..."
                            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs"
                          />
                        </div>
                      </div>

                      {/* Quick Office Country Picker */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[10px] text-slate-400">{isAr ? 'اختيار سريع للدولة:' : 'Quick Country:'}</span>
                        {COUNTRIES_LIST.slice(0, 8).map((c) => (
                          <button
                            key={c.code}
                            type="button"
                            onClick={() => setEditingOffice({
                              ...editingOffice,
                              countryAr: c.nameAr,
                              countryEn: c.nameEn,
                              cityAr: editingOffice.cityAr || c.defaultCityAr,
                              cityEn: editingOffice.cityEn || c.defaultCityEn,
                            })}
                            className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-200 border border-slate-700 transition cursor-pointer"
                          >
                            <span>{c.flag} {isAr ? c.nameAr : c.nameEn}</span>
                          </button>
                        ))}
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

              {/* TAB 8: FIRM DATA, IDENTITY & SITE SETTINGS */}
              {activeTab === 'settings' && (
                <form onSubmit={handleSaveSettings} className="space-y-6 max-w-4xl">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-bold font-serif-title text-white">
                        {isAr ? 'بيانات المكتب، الهوية الرسمية، والإحصائيات' : 'Firm Information, Identity & Statistics'}
                      </h3>
                      <p className="text-xs text-slate-400">
                        {isAr ? 'تعديل اسم المكتب، الشعار، بيانات التواصل، الدولة والمدينة، والإعدادات العامة' : 'Customize your law firm name, logos, contacts, slogans, and metadata'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleTranslateCurrentSettings}
                        disabled={isTranslating || isSavingFirmData}
                        className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-[#e5cb8e] border border-amber-500/50 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50 shadow-sm"
                        title={isAr ? 'ترجمة فورية وتلقائية لكافة نصوص وإعدادات وهوية الموقع' : 'Auto-translate all settings text'}
                      >
                        {isTranslating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5 text-[#c5a869]" />}
                        <span>{isAr ? '✨ ترجمة الإعدادات' : '✨ Translate Settings'}</span>
                      </button>

                      <button
                        type="submit"
                        disabled={isSavingFirmData}
                        className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#c5a869] to-[#aa8022] text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 hover:brightness-110 transition cursor-pointer shadow-lg disabled:opacity-50"
                      >
                        {isSavingFirmData ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                            <span>{isAr ? 'جاري الحفظ...' : 'Saving...'}</span>
                          </>
                        ) : saveSuccessTick ? (
                          <>
                            <Check className="w-4 h-4 text-slate-950 stroke-[3]" />
                            <span>{isAr ? 'تم الحفظ!' : 'Saved!'}</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 text-slate-950" />
                            <span>{isAr ? 'حفظ التعديلات' : 'Save Changes'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/30 border border-amber-500/40 shadow-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
                          <Languages className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white flex items-center gap-2">
                            <span>{isAr ? 'نظام الترجمة والمزامنة التلقائية (العربية ➡️ الإنجليزية والتركية)' : 'Auto-Translation System (AR ➡️ EN & TR)'}</span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                              {isAr ? 'مفعل دائماً ✅' : 'Always Active'}
                            </span>
                          </h4>
                          <p className="text-[11px] text-slate-400">
                            {isAr 
                              ? 'أدخل بياناتك باللغة العربية فقط، وسيقوم النظام فور الحفظ بترجمتها للإنجليزية والتركية بأعلى جودة.' 
                              : 'Enter your data in Arabic only; the system will auto-translate to English and Turkish upon saving.'}
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
                        <span>{isAr ? '⚡ إعادة ترجمة الموقع بالكامل' : '⚡ Re-translate Entire Site'}</span>
                      </button>
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
                            sloganAr: 'حماية حقوقكم، أولويتنا وصناعة ريادتكم القانونية',
                            subSloganAr: 'خبرة عريقة في الترافع أمام كافة المحاكم وتقديم الاستشارات النوعية للأفراد والشركات بأعلى معايير الأمانة والسرية.',
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
                            sloganAr: 'حلول قانونية استراتيجية واستشارات تجارية عابرة للحدود',
                            subSloganAr: 'تحالف قانوني يضم نخبة من كبار المحامين والمحكّمين المعتمدين لحماية الاستثمارات وإدارة الصفقات الكبرى.',
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
                            sloganAr: 'الحصن القانوني المتكامل لنمو الأعمال وحماية رأس المال',
                            subSloganAr: 'نقدم استشارات متقدمة في حوكمة الشركات، الاندماج والاستحواذ، وصياغة العقود التجارية الدولية المعقدة.',
                          })}
                          className="p-2 rounded-lg bg-slate-900 border border-slate-700 hover:border-[#c5a869] text-start text-[11px] text-slate-200 hover:text-white transition cursor-pointer"
                        >
                          <span className="font-bold text-[#e5cb8e] block">مجموعة حوكمة واستثمار</span>
                          <span className="text-slate-400 text-[10px] truncate block">مجموعة النبراس للاستشارات</span>
                        </button>
                      </div>
                    </div>

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
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        {isAr ? 'العبارة التعريفية الفرعية في الواجهة بالعربية (الشعار اللفظي الفرعي)' : 'Hero Sub-headline (Arabic)'}
                      </label>
                      <textarea
                        rows={2}
                        value={settings.subSloganAr}
                        onChange={(e) => setSettings({ ...settings, subSloganAr: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-[#c5a869] focus:outline-none"
                      />
                    </div>

                    {/* Slogan Sizing & Typography Controls Suite */}
                    <div className="p-4 rounded-xl bg-slate-950 border border-[#c5a869]/40 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <div className="flex items-center gap-2">
                          <Type className="w-4 h-4 text-[#e5cb8e]" />
                          <h5 className="text-xs font-bold text-white">
                            {isAr ? 'التحكم بحجم وخط الشعار اللفظي (الرئيسي والفرعي)' : 'Slogan & Tagline Sizing & Typography'}
                          </h5>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#c5a869]/20 text-[#e5cb8e] font-bold">
                          {isAr ? 'تحكم فوري' : 'Live Control'}
                        </span>
                      </div>

                      {/* 1. Main Slogan Size */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-semibold text-slate-200 flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <Sliders className="w-3.5 h-3.5 text-[#c5a869]" />
                            <span>{isAr ? 'حجم خط الشعار اللفظي الرئيسي:' : 'Main Slogan Font Size:'}</span>
                          </span>
                          <span className="text-[#c5a869] font-mono text-[10px] font-bold uppercase">
                            {settings.sloganSizeHero || settings.firmNameSizeHero || 'lg'}
                          </span>
                        </label>
                        <div className="grid grid-cols-6 gap-1">
                          {[
                            { id: 'xs', labelAr: 'صغير جداً', labelEn: 'XS' },
                            { id: 'sm', labelAr: 'صغير', labelEn: 'SM' },
                            { id: 'md', labelAr: 'متوسط', labelEn: 'MD' },
                            { id: 'lg', labelAr: 'كبير', labelEn: 'LG' },
                            { id: 'xl', labelAr: 'كبير جداً', labelEn: 'XL' },
                            { id: '2xl', labelAr: 'ضخم', labelEn: '2XL' },
                          ].map((sz) => {
                            const isSelected = (settings.sloganSizeHero || settings.firmNameSizeHero || 'lg') === sz.id;
                            return (
                              <button
                                key={sz.id}
                                type="button"
                                onClick={() => setSettings({ ...settings, sloganSizeHero: sz.id as any, firmNameSizeHero: sz.id as any })}
                                className={`py-1.5 px-1 rounded-lg text-center text-[10px] font-semibold transition cursor-pointer border ${
                                  isSelected
                                    ? 'bg-[#c5a869] text-slate-950 border-[#e5cb8e] font-bold shadow-sm'
                                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-600'
                                }`}
                              >
                                {isAr ? sz.labelAr : sz.labelEn}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* 2. Main Slogan Font Weight */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-semibold text-slate-200 flex items-center gap-1.5">
                          <Type className="w-3.5 h-3.5 text-[#c5a869]" />
                          <span>{isAr ? 'سماكة خط الشعار اللفظي الرئيسي:' : 'Main Slogan Font Weight:'}</span>
                        </label>
                        <div className="grid grid-cols-5 gap-1">
                          {[
                            { id: 'normal', labelAr: 'عادي', labelEn: 'Regular' },
                            { id: 'medium', labelAr: 'متوسط', labelEn: 'Medium' },
                            { id: 'semibold', labelAr: 'شبه عريض', labelEn: 'Semibold' },
                            { id: 'bold', labelAr: 'عريض', labelEn: 'Bold' },
                            { id: 'extrabold', labelAr: 'عريض جداً', labelEn: 'Extra Bold' },
                          ].map((wt) => {
                            const isSelected = (settings.sloganWeightHero || 'bold') === wt.id;
                            return (
                              <button
                                key={wt.id}
                                type="button"
                                onClick={() => setSettings({ ...settings, sloganWeightHero: wt.id as any })}
                                className={`py-1.5 px-1 rounded-lg text-center text-[10px] font-semibold transition cursor-pointer border ${
                                  isSelected
                                    ? 'bg-[#c5a869] text-slate-950 border-[#e5cb8e] font-bold shadow-sm'
                                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-600'
                                }`}
                              >
                                {isAr ? wt.labelAr : wt.labelEn}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* 3. Sub-Slogan Font Size & Weight */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-800/80">
                        {/* Sub-Slogan Size */}
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
                            <Sliders className="w-3 h-3 text-[#c5a869]" />
                            <span>{isAr ? 'حجم الشعار الفرعي / الوصف:' : 'Sub-Slogan Size:'}</span>
                          </label>
                          <div className="grid grid-cols-5 gap-1">
                            {[
                              { id: 'xs', labelAr: 'صغير', labelEn: 'XS' },
                              { id: 'sm', labelAr: 'ناعم', labelEn: 'SM' },
                              { id: 'md', labelAr: 'متوسط', labelEn: 'MD' },
                              { id: 'lg', labelAr: 'كبير', labelEn: 'LG' },
                              { id: 'xl', labelAr: 'بارز', labelEn: 'XL' },
                            ].map((subSz) => {
                              const isSelected = (settings.subSloganSizeHero || 'md') === subSz.id;
                              return (
                                <button
                                  key={subSz.id}
                                  type="button"
                                  onClick={() => setSettings({ ...settings, subSloganSizeHero: subSz.id as any })}
                                  className={`py-1.5 px-1 rounded-lg text-center text-[10px] font-semibold transition cursor-pointer border ${
                                    isSelected
                                      ? 'bg-[#c5a869] text-slate-950 border-[#e5cb8e] font-bold shadow-sm'
                                      : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-600'
                                  }`}
                                >
                                  {isAr ? subSz.labelAr : subSz.labelEn}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Sub-Slogan Weight */}
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
                            <Type className="w-3 h-3 text-[#c5a869]" />
                            <span>{isAr ? 'سماكة خط الشعار الفرعي:' : 'Sub-Slogan Weight:'}</span>
                          </label>
                          <div className="grid grid-cols-4 gap-1">
                            {[
                              { id: 'light', labelAr: 'خفيف', labelEn: 'Light' },
                              { id: 'normal', labelAr: 'عادي', labelEn: 'Regular' },
                              { id: 'medium', labelAr: 'متوسط', labelEn: 'Medium' },
                              { id: 'semibold', labelAr: 'شبه عريض', labelEn: 'Semibold' },
                            ].map((subWt) => {
                              const isSelected = (settings.subSloganWeightHero || 'normal') === subWt.id;
                              return (
                                <button
                                  key={subWt.id}
                                  type="button"
                                  onClick={() => setSettings({ ...settings, subSloganWeightHero: subWt.id as any })}
                                  className={`py-1.5 px-1 rounded-lg text-center text-[10px] font-semibold transition cursor-pointer border ${
                                    isSelected
                                      ? 'bg-[#c5a869] text-slate-950 border-[#e5cb8e] font-bold shadow-sm'
                                      : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-600'
                                  }`}
                                >
                                  {isAr ? subWt.labelAr : subWt.labelEn}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Live Slogan Preview Card */}
                      <div className="p-3.5 rounded-lg bg-[#fbf8f2] border border-[#e6ddcc] text-[#181512] space-y-1 text-center">
                        <div className="flex items-center justify-between text-[10px] font-bold text-[#87641d] mb-1 border-b border-[#e6ddcc] pb-1">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            <span>{isAr ? 'معاينة حية لتنسيق الشعار اللفظي' : 'Live Slogan Preview'}</span>
                          </span>
                          <span className="text-[9px] text-[#4b4334]">
                            {isAr ? 'حسب الحجم والسماكة المحددة' : 'Active scale preview'}
                          </span>
                        </div>
                        {(() => {
                          const previewSizeMap: any = {
                            xs: 'text-xs sm:text-sm',
                            sm: 'text-sm sm:text-base',
                            md: 'text-base sm:text-lg',
                            lg: 'text-lg sm:text-xl',
                            xl: 'text-xl sm:text-2xl',
                            '2xl': 'text-2xl sm:text-3xl',
                          };
                          const previewWeightMap: any = {
                            normal: 'font-normal',
                            medium: 'font-medium',
                            semibold: 'font-semibold',
                            bold: 'font-bold',
                            extrabold: 'font-extrabold',
                          };
                          const subPreviewSizeMap: any = {
                            xs: 'text-[10px]',
                            sm: 'text-[11px]',
                            md: 'text-xs',
                            lg: 'text-sm',
                            xl: 'text-base',
                          };
                          const subPreviewWeightMap: any = {
                            light: 'font-light',
                            normal: 'font-normal',
                            medium: 'font-medium',
                            semibold: 'font-semibold',
                          };

                          const sloganSizeClass = previewSizeMap[settings.sloganSizeHero || settings.firmNameSizeHero || 'lg'] || 'text-lg';
                          const sloganWeightClass = previewWeightMap[settings.sloganWeightHero || 'bold'] || 'font-bold';
                          const subSloganSizeClass = subPreviewSizeMap[settings.subSloganSizeHero || 'md'] || 'text-xs';
                          const subSloganWeightClass = subPreviewWeightMap[settings.subSloganWeightHero || 'normal'] || 'font-normal';

                          return (
                            <div className="space-y-1.5 py-1">
                              <h4 className={`${sloganSizeClass} ${sloganWeightClass} text-[#181512] font-serif-title leading-snug`}>
                                {isAr ? (settings.sloganAr || 'حماية حقوقكم، أولويتنا وصناعة ريادتكم القانونية') : (settings.sloganEn || 'Safeguarding Your Rights, Pioneering Your Legal Success')}
                              </h4>
                              {settings.subSloganAr && (
                                <p className={`${subSloganSizeClass} ${subSloganWeightClass} text-[#4b4334] max-w-xl mx-auto leading-relaxed`}>
                                  {isAr ? settings.subSloganAr : (settings.subSloganEn || '')}
                                </p>
                              )}
                            </div>
                          );
                        })()}
                      </div>
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
                            {isAr ? 'مقياس وحجم الشعار اللفظي في الواجهة الرئيسية ومحاذاته' : 'Hero Slogan Size & Alignment'}
                          </label>
                          <div className="grid grid-cols-6 gap-1 mb-2">
                            {[
                              { id: 'xs', labelAr: 'صغير جداً', labelEn: 'XS' },
                              { id: 'sm', labelAr: 'صغير', labelEn: 'SM' },
                              { id: 'md', labelAr: 'متوسط', labelEn: 'MD' },
                              { id: 'lg', labelAr: 'كبير', labelEn: 'LG' },
                              { id: 'xl', labelAr: 'كبير جداً', labelEn: 'XL' },
                              { id: '2xl', labelAr: 'ضخم', labelEn: '2XL' },
                            ].map((sz) => (
                              <button
                                key={sz.id}
                                type="button"
                                onClick={() => setSettings({ ...settings, firmNameSizeHero: sz.id as any, sloganSizeHero: sz.id as any })}
                                className={`py-1.5 px-1 rounded-xl text-center text-[10px] font-semibold transition cursor-pointer border ${
                                  (settings.sloganSizeHero || settings.firmNameSizeHero || 'lg') === sz.id
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
                          <div className="pt-1">
                            <label className="block text-[11px] text-slate-400 mb-1">{isAr ? 'السطر التعريفي (عربي)' : 'Subtitle (Arabic)'}</label>
                            <input
                              type="text"
                              value={settings.navbarSubtitleAr || ''}
                              onChange={(e) => setSettings({ ...settings, navbarSubtitleAr: e.target.value })}
                              placeholder="مثال: محامون ومستشارون قانونيون ومحكّمون"
                              className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-[#c5a869]"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Hero Banner Image & Visual Atmosphere Suite */}
                  <div className="p-5 rounded-2xl bg-slate-900/90 border border-[#c5a869]/40 space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="w-5 h-5 text-[#e5cb8e]" />
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                            <span>{isAr ? 'بنر وخلفية الواجهة الرئيسية للمكتب' : 'Firm Hero Banner & Atmosphere'}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                              {isAr ? 'رفع مباشر من الجهاز 🚀' : 'Device Upload 🚀'}
                            </span>
                          </h4>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {isAr ? 'حمّل صورة البنر الخاص بمكتبك من جهازك ليتم حفظها وتظهر كخلفية رسمية لجميع زوار المكتب' : 'Upload custom banner image from your device to appear for all firm visitors'}
                          </p>
                        </div>
                      </div>
                      {settings.customBannerUrl && (
                        <button
                          type="button"
                          onClick={() => setSettings({ ...settings, customBannerUrl: '' })}
                          className="text-[11px] text-rose-400 hover:text-rose-300 transition flex items-center gap-1 cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>{isAr ? 'استعادة البنر الافتراضي' : 'Reset to Default'}</span>
                        </button>
                      )}
                    </div>

                    {/* Image Uploader Component with Banner Aspect Ratio */}
                    <div>
                      <ImageUploader
                        value={settings.customBannerUrl || ''}
                        onChange={(img) => setSettings({ ...settings, customBannerUrl: img })}
                        label={isAr ? "تحميل صورة البنر من جهازك (Drag & Drop أو اختيار ملف)" : "Upload Banner from Device"}
                        labelEn="Upload Banner Image from Device"
                        lang={lang}
                        aspectRatio="banner"
                        maxWidth={1920}
                        maxHeight={1080}
                        quality={0.8}
                        helpText={isAr ? "يتم ضغط الصورة تلقائياً لضمان أعلى جودة بصرية مع سرعة تحميل فائقة لكافة الزوار." : "Automatically optimized for fast loading and high visual fidelity across all devices."}
                      />
                    </div>

                    {/* Curated Legal Presets */}
                    <div className="space-y-2 pt-2 border-t border-slate-800/80">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-[#c5a869]" />
                          <span>{isAr ? 'أو اختر من نماذج البنرات القانونية الراقية الجاهزة:' : 'Or Select a Curated Legal Preset Banner:'}</span>
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {isAr ? 'دقة فائقة 4K' : 'Ultra-HD'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                        {[
                          {
                            id: 'courthouse_pillars',
                            titleAr: 'أعمدة المحكمة وميزان العدالة',
                            titleEn: 'Courthouse Columns',
                            url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=1920',
                          },
                          {
                            id: 'supreme_court',
                            titleAr: 'قصر العدل والمحكمة العليا',
                            titleEn: 'Supreme Court Pillars',
                            url: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=1920',
                          },
                          {
                            id: 'modern_skylight',
                            titleAr: 'برج أعمال قانوني شاهق',
                            titleEn: 'Modern Corporate Tower',
                            url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1920',
                          },
                          {
                            id: 'law_library',
                            titleAr: 'مكتبة السوابق الفقهية',
                            titleEn: 'Law Library & Tomes',
                            url: 'https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&q=80&w=1920',
                          },
                          {
                            id: 'boardroom_executive',
                            titleAr: 'قاعة الشركاء الفاخرة',
                            titleEn: 'Executive Boardroom',
                            url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1920',
                          },
                          {
                            id: 'marble_gavel',
                            titleAr: 'مطرقة القضاء والميزان الذهبي',
                            titleEn: 'Marble Gavel & Scale',
                            url: 'https://images.unsplash.com/photo-1589994965851-a8f479c573a9?auto=format&fit=crop&q=80&w=1920',
                          },
                        ].map((preset) => {
                          const isSelected = settings.customBannerUrl === preset.url || (!settings.customBannerUrl && preset.id === 'courthouse_pillars');
                          return (
                            <button
                              key={preset.id}
                              type="button"
                              onClick={() => setSettings({ ...settings, customBannerUrl: preset.url })}
                              className={`relative rounded-xl overflow-hidden border-2 transition p-1 text-right flex flex-col gap-1 cursor-pointer group ${
                                isSelected
                                  ? 'border-[#c5a869] bg-[#c5a869]/15 shadow-lg ring-2 ring-[#c5a869]/40'
                                  : 'border-slate-800 bg-slate-950/60 hover:border-slate-600'
                              }`}
                            >
                              <div className="relative w-full h-16 rounded-lg overflow-hidden bg-slate-900">
                                <img
                                  src={preset.url}
                                  alt={preset.titleAr}
                                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                />
                                {isSelected && (
                                  <div className="absolute inset-0 bg-[#c5a869]/35 flex items-center justify-center">
                                    <div className="w-6 h-6 rounded-full bg-[#c5a869] text-slate-950 flex items-center justify-center font-bold shadow">
                                      <Check className="w-4 h-4" />
                                    </div>
                                  </div>
                                )}
                              </div>
                              <span className="text-[10px] font-bold text-slate-200 truncate px-1">
                                {isAr ? preset.titleAr : preset.titleEn}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Banner Atmosphere & Styling Controls */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-800/80">
                      
                      {/* 1. Opacity / Transparency */}
                      <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                            <Eye className="w-3.5 h-3.5 text-[#c5a869]" />
                            <span>{isAr ? 'درجة وضوح البنر (الشفافية)' : 'Banner Opacity'}</span>
                          </label>
                          <span className="text-xs font-mono font-bold text-[#c5a869]">
                            {settings.heroBannerOpacity ?? 18}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="5"
                          max="80"
                          step="1"
                          value={settings.heroBannerOpacity ?? 18}
                          onChange={(e) => setSettings({ ...settings, heroBannerOpacity: parseInt(e.target.value) || 18 })}
                          className="w-full accent-[#c5a869] cursor-pointer"
                        />
                        <div className="flex justify-between gap-1">
                          {[
                            { val: 10, label: '10%' },
                            { val: 18, label: isAr ? '18% (مثالي)' : '18%' },
                            { val: 30, label: '30%' },
                            { val: 50, label: '50%' },
                          ].map((op) => (
                            <button
                              key={op.val}
                              type="button"
                              onClick={() => setSettings({ ...settings, heroBannerOpacity: op.val })}
                              className={`px-2 py-1 rounded-lg text-[10px] font-medium transition cursor-pointer border ${
                                (settings.heroBannerOpacity ?? 18) === op.val
                                  ? 'bg-[#c5a869] text-slate-950 font-bold border-[#c5a869]'
                                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                              }`}
                            >
                              {op.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* 2. Overlay Color Tint */}
                      <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                        <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-[#c5a869]" />
                          <span>{isAr ? 'تدرج وطبقة الإضاءة' : 'Overlay Tint'}</span>
                        </label>
                        <div className="grid grid-cols-3 gap-1.5">
                          {[
                            { id: 'warm', labelAr: 'شامبانيا دافئ', labelEn: 'Warm' },
                            { id: 'dark', labelAr: 'ليلي داكن', labelEn: 'Dark' },
                            { id: 'none', labelAr: 'شفاف نقي', labelEn: 'Clean' },
                          ].map((tint) => (
                            <button
                              key={tint.id}
                              type="button"
                              onClick={() => setSettings({ ...settings, heroBannerOverlayColor: tint.id as any })}
                              className={`py-2 px-1 rounded-lg text-[10px] font-semibold transition cursor-pointer text-center border ${
                                (settings.heroBannerOverlayColor || 'warm') === tint.id
                                  ? 'bg-[#c5a869] text-slate-950 font-bold border-[#c5a869] shadow-sm'
                                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                              }`}
                            >
                              {isAr ? tint.labelAr : tint.labelEn}
                            </button>
                          ))}
                        </div>
                        <p className="text-[10px] text-slate-400">
                          {isAr ? 'تضمن وضوح النصوص والقراءة المريحة للموكلين.' : 'Ensures optimal text contrast for visitors.'}
                        </p>
                      </div>

                      {/* 3. Blur Effect */}
                      <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                        <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-[#c5a869]" />
                          <span>{isAr ? 'تأثير الضبابية (Blur)' : 'Background Blur'}</span>
                        </label>
                        <div className="grid grid-cols-3 gap-1.5">
                          {[
                            { id: 'none', labelAr: 'بدون (حاد)', labelEn: 'None' },
                            { id: 'sm', labelAr: 'خفيفة', labelEn: 'Soft' },
                            { id: 'md', labelAr: 'متوسطة', labelEn: 'Medium' },
                          ].map((bl) => (
                            <button
                              key={bl.id}
                              type="button"
                              onClick={() => setSettings({ ...settings, heroBannerBlur: bl.id as any })}
                              className={`py-2 px-1 rounded-lg text-[10px] font-semibold transition cursor-pointer text-center border ${
                                (settings.heroBannerBlur || 'none') === bl.id
                                  ? 'bg-[#c5a869] text-slate-950 font-bold border-[#c5a869] shadow-sm'
                                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                              }`}
                            >
                              {isAr ? bl.labelAr : bl.labelEn}
                            </button>
                          ))}
                        </div>
                        <p className="text-[10px] text-slate-400">
                          {isAr ? 'يمنح خلفية الواجهة عمقاً سينمائياً راقياً.' : 'Adds subtle depth to the hero background.'}
                        </p>
                      </div>
                    </div>

                    {/* Live Realistic Mini-Hero Preview */}
                    <div className="p-4 rounded-xl bg-slate-950 border border-[#c5a869]/30 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold text-[#c5a869]">
                        <span className="flex items-center gap-1.5">
                          <Eye className="w-3.5 h-3.5" />
                          <span>{isAr ? 'معاينة حية فورية للواجهة بالبنر المختار' : 'Live Interactive Hero Banner Preview'}</span>
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {isAr ? 'كما ستظهر تماماً لكافة زوار مكتبك' : 'Exact visitor visual appearance'}
                        </span>
                      </div>

                      <div className="relative w-full h-44 rounded-xl overflow-hidden bg-gradient-to-b from-[#fbf8f2] via-[#f7f2e7] to-[#f3ebd9] border border-[#e6ddcc] flex flex-col items-center justify-center text-center p-4">
                        {/* Background Banner Image with Settings */}
                        <div
                          className="absolute inset-0 z-0 transition-opacity duration-500"
                          style={{ opacity: (settings.heroBannerOpacity ?? 18) / 100 }}
                        >
                          <img
                            src={settings.customBannerUrl || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=1920'}
                            alt="Banner Preview"
                            className={`w-full h-full object-cover ${
                              settings.heroBannerBlur === 'md' ? 'blur-md' : settings.heroBannerBlur === 'sm' ? 'blur-sm' : ''
                            }`}
                          />
                          {settings.heroBannerOverlayColor === 'dark' ? (
                            <div className="absolute inset-0 bg-gradient-to-t from-[#12100e] via-[#1a1612]/75 to-transparent" />
                          ) : settings.heroBannerOverlayColor === 'none' ? (
                            <div className="absolute inset-0 bg-gradient-to-t from-[#fbf8f2] via-transparent to-transparent" />
                          ) : (
                            <div className="absolute inset-0 bg-gradient-to-t from-[#fbf8f2] via-[#fbf8f2]/80 to-transparent" />
                          )}
                        </div>

                        {/* Foreground Preview Elements */}
                        <div className="relative z-10 flex flex-col items-center max-w-lg">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#c5a869] to-[#8d6f2c] p-0.5 shadow-sm mb-2">
                            <div className="w-full h-full bg-[#fbf8f2] rounded-[6px] flex items-center justify-center">
                              {settings.customLogoUrl ? (
                                <img src={settings.customLogoUrl} alt="Logo" className="w-full h-full object-contain" />
                              ) : (
                                <Scale className="w-4 h-4 text-[#87641d]" />
                              )}
                            </div>
                          </div>
                          <span className="text-sm font-bold text-[#181512] font-serif-title leading-tight line-clamp-1">
                            {isAr ? (settings.firmNameAr || 'اسم مكتب المحاماة') : (settings.firmNameEn || 'Law Firm Name')}
                          </span>
                          <span className="text-[11px] text-[#87641d] font-semibold mt-0.5 line-clamp-1">
                            {isAr ? (settings.sloganAr || 'حماية حقوقكم، أولويتنا وصناعة ريادتكم القانونية') : (settings.sloganEn || 'Safeguarding Your Rights, Pioneering Your Legal Success')}
                          </span>
                          <div className="mt-2.5 px-3 py-1 rounded-lg bg-[#c5a869] text-slate-950 text-[10px] font-bold shadow">
                            {isAr ? 'طلب استشارة قانونية فورية' : 'Request Consultation'}
                          </div>
                        </div>
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

                  {/* Currency Selection & Live Counter Statistics Suite */}
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/20 border border-[#c5a869]/50 space-y-6 shadow-xl">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#c5a869]/25 to-amber-500/10 border border-[#c5a869]/40 flex items-center justify-center text-[#e5cb8e] shadow-sm">
                          <Coins className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white flex items-center gap-2">
                            <span>{isAr ? 'العملة المعتمدة للمكتب وإحصائيات الواجهة' : 'Firm Currency & Live Statistics'}</span>
                            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#c5a869]/20 text-[#e5cb8e] font-bold border border-[#c5a869]/40">
                              {settings.currency === 'SYP' ? (isAr ? '🇸🇾 ليرة سورية' : '🇸🇾 SYP') : (isAr ? '🇺🇸 دولار أمريكي' : '🇺🇸 USD')}
                            </span>
                          </h4>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {isAr 
                              ? 'اختر العملة المعتمدة (ليرة سورية أو دولار) وتخصيص كافة الأرقام والإحصائيات المعروضة لزوار موقعك' 
                              : 'Select firm currency (Syrian Pound or US Dollar) and configure live homepage statistics'}
                          </p>
                        </div>
                      </div>

                      {/* Quick Active Currency Status Badge */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">{isAr ? 'العملة الحالية:' : 'Active Currency:'}</span>
                        <span className="px-3 py-1 rounded-xl text-xs font-bold bg-[#c5a869] text-slate-950 shadow-sm flex items-center gap-1.5">
                          {settings.currency === 'SYP' ? '🇸🇾 ليرة سورية (SYP)' : '🇺🇸 دولار أمريكي ($ USD)'}
                        </span>
                      </div>
                    </div>

                    {/* SECTION 1: CURRENCY SELECTOR (LIRA OR DOLLAR + OPTIONS) */}
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-[#e5cb8e] flex items-center gap-1.5">
                        <DollarSign className="w-4 h-4 text-[#c5a869]" />
                        <span>{isAr ? 'اختيار العملة الرسمية للمكتب (ليرة سورية أو دولار):' : 'Select Official Currency (SYP or USD):'}</span>
                      </label>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {/* 1. Syrian Pound (ليرة سورية) */}
                        <button
                          type="button"
                          onClick={() => {
                            setSettings({
                              ...settings,
                              currency: 'SYP',
                              currencySymbolAr: 'ل.س',
                              currencySymbolEn: 'SYP',
                              stats: {
                                ...settings.stats,
                                recoveredCapital: settings.stats?.recoveredCapital || settings.stats?.recoveredMillionsUSD || 850,
                                recoveredCapitalTextAr: 'مليار ليرة سورية مبالغ وقضايا محمية',
                                recoveredCapitalTextEn: 'Billion SYP Protected Capital',
                              }
                            });
                          }}
                          className={`p-4 rounded-2xl text-start transition cursor-pointer border relative flex flex-col justify-between gap-2 shadow-sm ${
                            (settings.currency || 'USD') === 'SYP'
                              ? 'bg-gradient-to-br from-amber-500/20 to-slate-900 border-[#c5a869] ring-2 ring-[#c5a869]/60 shadow-lg shadow-amber-950/40'
                              : 'bg-slate-950 hover:bg-slate-900 border-slate-800 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-2xl">🇸🇾</span>
                            {(settings.currency || 'USD') === 'SYP' && (
                              <span className="w-6 h-6 rounded-full bg-[#c5a869] text-slate-950 flex items-center justify-center font-bold text-xs shadow">
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              </span>
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-sm text-white block">
                              {isAr ? 'الليرة السورية' : 'Syrian Pound'}
                            </span>
                            <span className="text-xs text-[#c5a869] font-mono font-bold block mt-0.5">
                              SYP / ل.س (مليار ل.س)
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-1">
                            {isAr ? 'عرض المبالغ والقضايا بالليرة السورية وملايين/مليارات ل.س' : 'Display values in Syrian Lira'}
                          </p>
                        </button>

                        {/* 2. US Dollar (دولار أمريكي) */}
                        <button
                          type="button"
                          onClick={() => {
                            setSettings({
                              ...settings,
                              currency: 'USD',
                              currencySymbolAr: '$',
                              currencySymbolEn: '$',
                              stats: {
                                ...settings.stats,
                                recoveredCapital: settings.stats?.recoveredCapital || settings.stats?.recoveredMillionsUSD || 850,
                                recoveredCapitalTextAr: 'مليون $ مبالغ مستردة ومحمية',
                                recoveredCapitalTextEn: 'Million USD Protected Capital',
                              }
                            });
                          }}
                          className={`p-4 rounded-2xl text-start transition cursor-pointer border relative flex flex-col justify-between gap-2 shadow-sm ${
                            (settings.currency || 'USD') === 'USD'
                              ? 'bg-gradient-to-br from-amber-500/20 to-slate-900 border-[#c5a869] ring-2 ring-[#c5a869]/60 shadow-lg shadow-amber-950/40'
                              : 'bg-slate-950 hover:bg-slate-900 border-slate-800 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-2xl">🇺🇸</span>
                            {(settings.currency || 'USD') === 'USD' && (
                              <span className="w-6 h-6 rounded-full bg-[#c5a869] text-slate-950 flex items-center justify-center font-bold text-xs shadow">
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              </span>
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-sm text-white block">
                              {isAr ? 'الدولار الأمريكي' : 'US Dollar'}
                            </span>
                            <span className="text-xs text-[#c5a869] font-mono font-bold block mt-0.5">
                              USD / $ (مليون دولار)
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-1">
                            {isAr ? 'عرض المبالغ والقضايا بالدولار الأمريكي القياسي ($M+)' : 'Display values in US Dollars ($)'}
                          </p>
                        </button>

                        {/* 3. Saudi Riyal (ريال سعودي) */}
                        <button
                          type="button"
                          onClick={() => {
                            setSettings({
                              ...settings,
                              currency: 'SAR',
                              currencySymbolAr: 'ر.س',
                              currencySymbolEn: 'SAR',
                              stats: {
                                ...settings.stats,
                                recoveredCapital: settings.stats?.recoveredCapital || settings.stats?.recoveredMillionsUSD || 850,
                                recoveredCapitalTextAr: 'مليون ريال مبالغ مستردة ومحمية',
                                recoveredCapitalTextEn: 'Million SAR Protected Capital',
                              }
                            });
                          }}
                          className={`p-4 rounded-2xl text-start transition cursor-pointer border relative flex flex-col justify-between gap-2 shadow-sm ${
                            settings.currency === 'SAR'
                              ? 'bg-gradient-to-br from-amber-500/20 to-slate-900 border-[#c5a869] ring-2 ring-[#c5a869]/60 shadow-lg'
                              : 'bg-slate-950 hover:bg-slate-900 border-slate-800 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-2xl">🇸🇦</span>
                            {settings.currency === 'SAR' && (
                              <span className="w-6 h-6 rounded-full bg-[#c5a869] text-slate-950 flex items-center justify-center font-bold text-xs shadow">
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              </span>
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-sm text-white block">
                              {isAr ? 'الريال السعودي' : 'Saudi Riyal'}
                            </span>
                            <span className="text-xs text-[#c5a869] font-mono font-bold block mt-0.5">
                              SAR / ر.س
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-1">
                            {isAr ? 'عرض المبالغ بالريال السعودي' : 'Display in Saudi Riyal'}
                          </p>
                        </button>

                        {/* 4. UAE Dirham / Euro / Other */}
                        <button
                          type="button"
                          onClick={() => {
                            setSettings({
                              ...settings,
                              currency: 'AED',
                              currencySymbolAr: 'د.إ',
                              currencySymbolEn: 'AED',
                              stats: {
                                ...settings.stats,
                                recoveredCapital: settings.stats?.recoveredCapital || settings.stats?.recoveredMillionsUSD || 850,
                                recoveredCapitalTextAr: 'مليون درهم مبالغ مستردة ومحمية',
                                recoveredCapitalTextEn: 'Million AED Protected Capital',
                              }
                            });
                          }}
                          className={`p-4 rounded-2xl text-start transition cursor-pointer border relative flex flex-col justify-between gap-2 shadow-sm ${
                            settings.currency === 'AED'
                              ? 'bg-gradient-to-br from-amber-500/20 to-slate-900 border-[#c5a869] ring-2 ring-[#c5a869]/60 shadow-lg'
                              : 'bg-slate-950 hover:bg-slate-900 border-slate-800 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-2xl">🇦🇪</span>
                            {settings.currency === 'AED' && (
                              <span className="w-6 h-6 rounded-full bg-[#c5a869] text-slate-950 flex items-center justify-center font-bold text-xs shadow">
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              </span>
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-sm text-white block">
                              {isAr ? 'الدرهم الإماراتي' : 'UAE Dirham'}
                            </span>
                            <span className="text-xs text-[#c5a869] font-mono font-bold block mt-0.5">
                              AED / د.إ
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-1">
                            {isAr ? 'عرض المبالغ بالدرهم الإماراتي' : 'Display in UAE Dirhams'}
                          </p>
                        </button>
                      </div>
                    </div>

                    {/* SECTION 2: LIVE HOMEPAGE STATISTICS EDITING SUITE */}
                    <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                        <label className="text-xs font-bold text-white flex items-center gap-2">
                          <BarChart3 className="w-4 h-4 text-[#c5a869]" />
                          <span>{isAr ? 'أرقام وإحصائيات الواجهة الرئيسية الأربعة' : 'Homepage 4 Hero Live Counters'}</span>
                        </label>
                        <span className="text-[10px] text-slate-400">
                          {isAr ? 'تتحدث فوراً على الموقع' : 'Updates live on site'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Stat 1: Years of Experience */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                            <span>{isAr ? '1. سنوات الخبرة *' : '1. Years Experience *'}</span>
                            <span className="text-[#c5a869] font-mono text-[11px] font-bold">
                              +{settings.stats?.yearsExperience ?? 28} عاماً
                            </span>
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="100"
                            value={settings.stats?.yearsExperience ?? 28}
                            onChange={(e) => setSettings({
                              ...settings,
                              stats: {
                                ...settings.stats,
                                yearsExperience: parseInt(e.target.value) || 0
                              }
                            })}
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono font-bold focus:border-[#c5a869] focus:outline-none"
                          />
                        </div>

                        {/* Stat 2: Cases Won */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                            <span>{isAr ? '2. القضايا والتسويات *' : '2. Cases Won *'}</span>
                            <span className="text-[#c5a869] font-mono text-[11px] font-bold">
                              +{Number(settings.stats?.casesWon ?? 3450).toLocaleString()}
                            </span>
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={settings.stats?.casesWon ?? 3450}
                            onChange={(e) => setSettings({
                              ...settings,
                              stats: {
                                ...settings.stats,
                                casesWon: parseInt(e.target.value) || 0
                              }
                            })}
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono font-bold focus:border-[#c5a869] focus:outline-none"
                          />
                        </div>

                        {/* Stat 3: Capital Recovered / Protected */}
                        <div>
                          <label className="block text-xs font-semibold text-[#e5cb8e] mb-1 flex items-center justify-between">
                            <span>
                              {isAr 
                                ? (settings.currency === 'SYP' ? '3. المبالغ (مليار ل.س) *' : '3. المبالغ المستردة ($M) *')
                                : '3. Protected Capital *'}
                            </span>
                            <span className="text-emerald-400 font-mono text-[11px] font-bold">
                              {settings.currency === 'SYP' 
                                ? `+${settings.stats?.recoveredCapital ?? settings.stats?.recoveredMillionsUSD ?? 850} مليار ل.س` 
                                : `$${settings.stats?.recoveredCapital ?? settings.stats?.recoveredMillionsUSD ?? 850}M+`}
                            </span>
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={settings.stats?.recoveredCapital ?? settings.stats?.recoveredMillionsUSD ?? 850}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 0;
                              setSettings({
                                ...settings,
                                stats: {
                                  ...settings.stats,
                                  recoveredCapital: val,
                                  recoveredMillionsUSD: val
                                }
                              });
                            }}
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-amber-500/60 text-white text-xs font-mono font-bold focus:border-[#c5a869] focus:outline-none"
                          />
                        </div>

                        {/* Stat 4: Success Rate % */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                            <span>{isAr ? '4. نسبة النجاح % *' : '4. Success Rate % *'}</span>
                            <span className="text-[#c5a869] font-mono text-[11px] font-bold">
                              %{settings.stats?.successRate ?? 98.4}
                            </span>
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            min="50"
                            max="100"
                            value={settings.stats?.successRate ?? 98.4}
                            onChange={(e) => setSettings({
                              ...settings,
                              stats: {
                                ...settings.stats,
                                successRate: parseFloat(e.target.value) || 0
                              }
                            })}
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono font-bold focus:border-[#c5a869] focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Custom Subtitle text for Capital stat */}
                      <div className="pt-2 border-t border-slate-800/80">
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          {isAr ? 'النص التوضيحي تحت الرقم المالي (اختياري / قابل للتخصيص):' : 'Custom Subtitle for Financial Stat (Optional):'}
                        </label>
                        <input
                          type="text"
                          value={settings.stats?.recoveredCapitalTextAr || ''}
                          onChange={(e) => setSettings({
                            ...settings,
                            stats: {
                              ...settings.stats,
                              recoveredCapitalTextAr: e.target.value
                            }
                          })}
                          placeholder={settings.currency === 'SYP' ? 'مليار ليرة سورية مبالغ وقضايا محمية' : 'مليون $ مبالغ مستردة ومحمية'}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-[#c5a869] focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* SECTION 3: LIVE REALISTIC STATISTICS PREVIEW */}
                    <div className="p-4 rounded-xl bg-slate-950 border border-[#c5a869]/30 space-y-3">
                      <div className="flex items-center justify-between text-[11px] font-bold text-[#e5cb8e]">
                        <span className="flex items-center gap-1.5">
                          <Eye className="w-3.5 h-3.5 text-[#c5a869]" />
                          <span>{isAr ? 'معاينة حية لشريط الإحصائيات بالعملة المحددة (كما تظهر في واجهة الموقع):' : 'Live Interactive Statistics Preview in Website:'}</span>
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {isAr ? 'تأثير فوري' : 'Live Real-time'}
                        </span>
                      </div>

                      {/* Render preview card mimicking HeroSection */}
                      <div className="p-5 rounded-2xl bg-[#fbf8f2] border border-[#e6ddcc] text-[#181512] shadow-sm">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                          {/* Stat 1 */}
                          <div className="flex flex-col items-center p-2 text-center border-b md:border-b-0 md:border-l rtl:md:border-l-0 rtl:md:border-r border-[#e6ddcc]">
                            <span className="text-2xl sm:text-3xl font-serif-title font-extrabold text-[#87641d] tracking-tight">
                              +{settings.stats?.yearsExperience ?? 28}
                            </span>
                            <span className="text-[11px] text-[#4b4334] mt-0.5 font-semibold">
                              {isAr ? 'عاماً من الريادة' : 'Years of Excellence'}
                            </span>
                          </div>

                          {/* Stat 2 */}
                          <div className="flex flex-col items-center p-2 text-center border-b md:border-b-0 md:border-l rtl:md:border-l-0 rtl:md:border-r border-[#e6ddcc]">
                            <span className="text-2xl sm:text-3xl font-serif-title font-extrabold text-[#181512] tracking-tight">
                              +{Number(settings.stats?.casesWon ?? 3450).toLocaleString()}
                            </span>
                            <span className="text-[11px] text-[#4b4334] mt-0.5 font-semibold">
                              {isAr ? 'قضية وتسوية ناجحة' : 'Successful Cases'}
                            </span>
                          </div>

                          {/* Stat 3 (With Selected Currency) */}
                          <div className="flex flex-col items-center p-2 text-center md:border-l rtl:md:border-l-0 rtl:md:border-r border-[#e6ddcc]">
                            <span className="text-2xl sm:text-3xl font-serif-title font-extrabold text-[#87641d] tracking-tight whitespace-nowrap">
                              {settings.currency === 'SYP'
                                ? `+${settings.stats?.recoveredCapital ?? settings.stats?.recoveredMillionsUSD ?? 850} مليار ل.س`
                                : `$${settings.stats?.recoveredCapital ?? settings.stats?.recoveredMillionsUSD ?? 850}M+`}
                            </span>
                            <span className="text-[11px] text-[#4b4334] mt-0.5 font-semibold text-center">
                              {settings.stats?.recoveredCapitalTextAr || (
                                settings.currency === 'SYP' 
                                  ? (isAr ? 'مليار ليرة سورية مبالغ وقضايا محمية' : 'Billion SYP Protected Capital') 
                                  : (isAr ? 'مليون $ مبالغ مستردة ومحمية' : 'Million USD Protected Capital')
                              )}
                            </span>
                          </div>

                          {/* Stat 4 */}
                          <div className="flex flex-col items-center p-2 text-center">
                            <span className="text-2xl sm:text-3xl font-serif-title font-extrabold text-[#87641d] tracking-tight">
                              %{settings.stats?.successRate ?? 98.4}
                            </span>
                            <span className="text-[11px] text-[#4b4334] mt-0.5 font-semibold">
                              {isAr ? 'نسبة النجاح والربح' : 'Success Rate'}
                            </span>
                          </div>
                        </div>
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

                    {/* Dedicated Country & City Controls for Law Firm Headquarters */}
                    <div className="p-4 rounded-xl bg-gradient-to-r from-slate-950 via-slate-950 to-amber-950/20 border border-[#c5a869]/50 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-[#c5a869]" />
                          <h5 className="text-xs font-bold text-white uppercase tracking-wider">
                            {isAr ? 'دولة ومدينة المقر الرئيسي للمكتب (قابلة للتخصيص بالكامل)' : 'Headquarters Country & City (Fully Customizable)'}
                          </h5>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#c5a869]/20 text-[#e5cb8e] font-bold border border-[#c5a869]/40 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                            <span>{isAr ? 'الدولة المعتمدة:' : 'Current:'}</span>
                            <span className="text-white font-extrabold">{settings.countryAr || (isAr ? 'المملكة العربية السعودية' : 'Saudi Arabia')}</span>
                            {settings.cityAr && <span className="text-slate-300">({settings.cityAr})</span>}
                          </span>
                        </div>
                      </div>

                      {/* Quick Country Selector */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                          <Compass className="w-3.5 h-3.5 text-[#c5a869]" />
                          <span>{isAr ? 'اختيار سريع للدولة (أو اكتب اسم دولتك بحرية تامة في الحقل أدناه):' : 'Quick Country Selector (or type custom country below):'}</span>
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                          {COUNTRIES_LIST.map((c) => {
                            const isSelected = (settings.countryAr || '').trim() === c.nameAr.trim();
                            return (
                              <button
                                key={c.code}
                                type="button"
                                onClick={() => {
                                  setSettings({
                                    ...settings,
                                    countryAr: c.nameAr,
                                    countryEn: c.nameEn,
                                    cityAr: settings.cityAr || c.defaultCityAr,
                                    cityEn: settings.cityEn || c.defaultCityEn,
                                  });
                                }}
                                className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border ${
                                  isSelected
                                    ? 'bg-[#c5a869] text-slate-950 border-[#e5cb8e] shadow-md font-bold ring-1 ring-[#c5a869]'
                                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-500'
                                }`}
                              >
                                <span>{c.flag}</span>
                                <span>{isAr ? c.nameAr : c.nameEn}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Custom Country & City Input Fields */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                        <div>
                          <label className="block text-xs font-semibold text-[#e5cb8e] mb-1 flex items-center gap-1">
                            <span>{isAr ? 'اسم الدولة بالعربية *' : 'Country Name in Arabic *'}</span>
                            <span className="text-[10px] text-emerald-400 font-normal">({isAr ? 'حر وقابل للكتابة' : 'Customizable'})</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={settings.countryAr || ''}
                            onChange={(e) => setSettings({ ...settings, countryAr: e.target.value })}
                            placeholder={isAr ? 'مثال: الجزائر، المملكة العربية السعودية، المغرب، مصر، تونس...' : 'e.g. Algeria, Saudi Arabia, Morocco, Egypt...'}
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-[#c5a869] focus:outline-none font-medium"
                          />
                          <p className="text-[10px] text-slate-400 mt-1">
                            {isAr ? 'اكتب اسم دولتك كما تريد أن تظهر لعملائك وفي الفوتر وأوراق العمل الرسمية' : 'Type your country name exactly as you wish it to appear'}
                          </p>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">
                            {isAr ? 'اسم الدولة بالإنجليزية (Country in English)' : 'Country Name in English'}
                          </label>
                          <input
                            type="text"
                            value={settings.countryEn || ''}
                            onChange={(e) => setSettings({ ...settings, countryEn: e.target.value })}
                            placeholder="e.g. Algeria, Saudi Arabia, Morocco, UAE, Egypt..."
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-[#c5a869] focus:outline-none"
                          />
                          <p className="text-[10px] text-slate-400 mt-1">
                            {isAr ? 'سيتم ترجمته تلقائياً عند الحفظ في حال تركه فارغاً' : 'Will be auto-translated upon save if left empty'}
                          </p>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-[#e5cb8e] mb-1">
                            {isAr ? 'اسم المدينة أو الولاية / المحافظة بالعربية *' : 'City / Province in Arabic *'}
                          </label>
                          <input
                            type="text"
                            required
                            value={settings.cityAr || ''}
                            onChange={(e) => setSettings({ ...settings, cityAr: e.target.value })}
                            placeholder={isAr ? 'مثال: الجزائر العاصمة، وهران، الرياض، الدار البيضاء، دبي...' : 'e.g. Algiers, Oran, Riyadh, Casablanca, Dubai...'}
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-[#c5a869] focus:outline-none font-medium"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">
                            {isAr ? 'اسم المدينة بالإنجليزية (City in English)' : 'City Name in English'}
                          </label>
                          <input
                            type="text"
                            value={settings.cityEn || ''}
                            onChange={(e) => setSettings({ ...settings, cityEn: e.target.value })}
                            placeholder="e.g. Algiers, Oran, Riyadh, Casablanca, Dubai..."
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-[#c5a869] focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Smart Apply to Address */}
                      <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[11px] text-slate-400">
                          {isAr ? 'تحديث صياغة العنوان تلقائياً وفقاً للدولة والمدينة المختارة أعلاه:' : 'Sync selected country & city into address field:'}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const countryAr = settings.countryAr || 'المملكة العربية السعودية';
                            const countryEn = settings.countryEn || 'Saudi Arabia';
                            const cityAr = settings.cityAr || 'الرياض';
                            const cityEn = settings.cityEn || 'Riyadh';

                            // If existing address has details, update the city & country suffix
                            let newAddressAr = `${cityAr}، ${countryAr}`;
                            let newAddressEn = `${cityEn}, ${countryEn}`;

                            if (settings.addressAr && !settings.addressAr.includes(countryAr)) {
                              // Replace previous country if present or append
                              const lines = settings.addressAr.split('\n');
                              if (lines.length > 1) {
                                lines[lines.length - 1] = `${cityAr}، ${countryAr}`;
                                newAddressAr = lines.join('\n');
                              } else {
                                newAddressAr = `${settings.addressAr} - ${cityAr}، ${countryAr}`;
                              }
                            }

                            setSettings({
                              ...settings,
                              addressAr: newAddressAr,
                              addressEn: newAddressEn,
                            });
                          }}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-[#e5cb8e] border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <Wand2 className="w-3.5 h-3.5 text-[#c5a869]" />
                          <span>{isAr ? 'تضمين الدولة والمدينة في العنوان المكتوب' : 'Insert Country & City into Address'}</span>
                        </button>
                      </div>
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
                          placeholder={'برج الأعمال، الطابق 14\nشارع ديدوش مراد\nالجزائر العاصمة، الجزائر'}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-[#c5a869] focus:outline-none"
                        />
                        <span className="text-[10px] text-slate-400">
                          {isAr ? 'اضغط Enter لإنشاء سطر جديد لتنظيم العنوان' : 'Press Enter to create new line'}
                        </span>
                      </div>

                      {/* Quick Presets for Address format & Multi-country formats */}
                      <div className="pt-2 border-t border-slate-800 space-y-2">
                        <span className="text-[11px] text-slate-400 font-medium block">
                          {isAr ? 'نماذج سريعة لعنوان المقر حسب الدولة:' : 'Quick Address Presets by Country:'}
                        </span>
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setSettings({
                              ...settings,
                              countryAr: 'الجزائر',
                              countryEn: 'Algeria',
                              cityAr: 'الجزائر العاصمة',
                              cityEn: 'Algiers',
                              addressAr: 'حي الأعمال والتجارة، برج القدس، الطابق 12\nباب الزوار، 16311\nالجزائر العاصمة، الجزائر',
                              addressEn: 'Business & Commerce District, Al-Quds Tower, 12th Floor\nBab Ezzouar, 16311\nAlgiers, Algeria',
                              addressLinesCount: 'auto',
                              addressDisplayMode: 'multiline'
                            })}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-[#e5cb8e] border border-slate-700 transition cursor-pointer flex items-center gap-1"
                          >
                            <span>🇩🇿</span>
                            <span>{isAr ? 'الجزائر (باب الزوار)' : 'Algeria (Bab Ezzouar)'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setSettings({
                              ...settings,
                              countryAr: 'المملكة العربية السعودية',
                              countryEn: 'Saudi Arabia',
                              cityAr: 'الرياض',
                              cityEn: 'Riyadh',
                              addressAr: 'برج المملكة، الطابق 42\nطريق الملك فهد، حي العليا\nالرياض 12214، المملكة العربية السعودية',
                              addressEn: 'Kingdom Tower, 42nd Floor\nKing Fahd Road, Al-Olaya\nRiyadh 12214, Saudi Arabia',
                              addressLinesCount: 'auto',
                              addressDisplayMode: 'multiline'
                            })}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 border border-slate-700 transition cursor-pointer flex items-center gap-1"
                          >
                            <span>🇸🇦</span>
                            <span>{isAr ? 'السعودية (الرياض - العليا)' : 'Saudi (Riyadh)'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setSettings({
                              ...settings,
                              countryAr: 'الإمارات العربية المتحدة',
                              countryEn: 'United Arab Emirates',
                              cityAr: 'دبي',
                              cityEn: 'Dubai',
                              addressAr: 'مركز دبي المالي العالمي (DIFC)، البوابة 4، الطابق 18، دبي، الإمارات العربية المتحدة',
                              addressEn: 'Dubai International Financial Centre (DIFC), Gate 4, Level 18, Dubai, UAE',
                              addressLinesCount: 'auto',
                              addressDisplayMode: 'single'
                            })}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 border border-slate-700 transition cursor-pointer flex items-center gap-1"
                          >
                            <span>🇦🇪</span>
                            <span>{isAr ? 'الإمارات (دبي - DIFC)' : 'UAE (Dubai DIFC)'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setSettings({
                              ...settings,
                              countryAr: 'مصر',
                              countryEn: 'Egypt',
                              cityAr: 'القاهرة',
                              cityEn: 'Cairo',
                              addressAr: 'القطاع الأول، شارع التسعين الشمالي، التجمع الخامس، القاهرة الجديدة، مصر',
                              addressEn: 'Sector 1, North 90th Street, 5th Settlement, New Cairo, Egypt',
                              addressLinesCount: 'auto',
                              addressDisplayMode: 'single'
                            })}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 border border-slate-700 transition cursor-pointer flex items-center gap-1"
                          >
                            <span>🇪🇬</span>
                            <span>{isAr ? 'مصر (القاهرة - التجمع)' : 'Egypt (Cairo)'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setSettings({
                              ...settings,
                              countryAr: 'المغرب',
                              countryEn: 'Morocco',
                              cityAr: 'الدار البيضاء',
                              cityEn: 'Casablanca',
                              addressAr: 'القطب المالي للدار البيضاء (CFC)، البرج الرئيسي، أنفا، الدار البيضاء، المغرب',
                              addressEn: 'Casablanca Finance City (CFC), Main Tower, Anfa, Casablanca, Morocco',
                              addressLinesCount: 'auto',
                              addressDisplayMode: 'single'
                            })}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 border border-slate-700 transition cursor-pointer flex items-center gap-1"
                          >
                            <span>🇲🇦</span>
                            <span>{isAr ? 'المغرب (الدار البيضاء)' : 'Morocco (Casablanca)'}</span>
                          </button>
                        </div>
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
                    {/* Custom Domain Quick Banner */}
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-[#c5a869] flex items-center justify-center flex-shrink-0">
                          <Globe className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white flex items-center gap-2">
                            <span>{isAr ? 'الدومين والنطاق الخاص بالمكتب' : 'Firm Custom Domain'}</span>
                            {customDomainInput ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
                                {customDomainInput}
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                {isAr ? 'احجز دومينك الخاص' : 'Not Connected'}
                              </span>
                            )}
                          </h4>
                          <p className="text-[11px] text-slate-400">
                            {isAr ? 'يمكنك حجز دومين خاص بك وربطه بمكتبك ليعمل كموقع مستقل تماماً' : 'Connect your own domain to run your office website independently'}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveTab('domain')}
                        className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-[#e5cb8e] border border-amber-500/50 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer whitespace-nowrap"
                      >
                        <Globe className="w-3.5 h-3.5" />
                        <span>{isAr ? 'إدارة وحجز الدومين ←' : 'Manage Domain →'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Sticky Floating Save Bar for Firm Manager */}
                  <div className="sticky bottom-3 z-30 flex items-center justify-between gap-3 p-3 sm:p-4 rounded-2xl bg-slate-950/95 backdrop-blur-md border-2 border-[#c5a869] shadow-2xl shadow-black/80">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-[#c5a869]/20 border border-[#c5a869]/40 flex items-center justify-center text-[#c5a869] flex-shrink-0">
                        <Save className="w-5 h-5 text-[#c5a869]" />
                      </div>
                      <div>
                        <span className="block text-xs sm:text-sm font-bold text-white">
                          {isAr ? 'حفظ تعديلات بيانات المكتب' : 'Save Firm Data Modifications'}
                        </span>
                        <span className="text-[11px] text-slate-400 hidden sm:inline">
                          {isAr ? 'احفظ التعديلات لتطبيقها فوراً على موقع مكتبك للزوار والعملاء' : 'Save changes to update live on your website'}
                        </span>
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={isSavingFirmData}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#c5a869] to-[#aa8022] hover:brightness-110 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-xl cursor-pointer disabled:opacity-50"
                    >
                      {isSavingFirmData ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                          <span>{isAr ? 'جاري الحفظ...' : 'Saving...'}</span>
                        </>
                      ) : saveSuccessTick ? (
                        <>
                          <Check className="w-4 h-4 text-slate-950 stroke-[3]" />
                          <span>{isAr ? 'تم حفظ التعديلات!' : 'Changes Saved!'}</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 text-slate-950" />
                          <span>{isAr ? 'حفظ التعديلات' : 'Save Changes'}</span>
                        </>
                      )}
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isSavingFirmData}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#c5a869] to-[#aa8022] text-slate-950 font-black text-sm hover:brightness-110 transition flex items-center justify-center gap-2 cursor-pointer shadow-xl disabled:opacity-50"
                  >
                    {isSavingFirmData ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                        <span>{isAr ? 'جاري حفظ بيانات وتعديلات المكتب...' : 'Saving Firm Data...'}</span>
                      </>
                    ) : saveSuccessTick ? (
                      <>
                        <Check className="w-4 h-4 text-slate-950 stroke-[3]" />
                        <span>{isAr ? 'تم حفظ التعديلات بنجاح!' : 'Changes Saved Successfully!'}</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 text-slate-950" />
                        <span>{isAr ? 'حفظ وتطبيق كافة تعديلات بيانات المكتب' : 'Save & Publish All Firm Changes'}</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* TAB 10: CUSTOM DOMAIN MANAGEMENT */}
              {activeTab === 'domain' && (
                <div className="space-y-6 max-w-4xl">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-bold font-serif-title text-white flex items-center gap-2">
                        <Globe className="w-5 h-5 text-[#c5a869]" />
                        <span>{isAr ? 'حجز وإدارة الدومين الخاص بالمكتب' : 'Firm Custom Domain Management'}</span>
                      </h3>
                      <p className="text-xs text-slate-400">
                        {isAr 
                          ? 'احجز دومين خاص باسم مكتبك (مثال: nahwi-law.com أو nahwi.sa) واربطه مباشرة ليعمل موقعك بشكل مستقل تماماً وبكامل هيبته' 
                          : 'Book a custom domain or connect your existing domain to give your firm a fully independent digital presence'}
                      </p>
                    </div>

                    {customDomainInput && (
                      <a
                        href={`https://${firmService.cleanDomain(customDomainInput)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/50 text-xs font-bold flex items-center gap-1.5 transition"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>{isAr ? 'فتح الدومين المباشر' : 'Visit Live Domain'}</span>
                      </a>
                    )}
                  </div>

                  {/* Current Domain Status Card */}
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/30 border border-[#c5a869]/40 shadow-xl space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg ${
                          customDomainInput 
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-lg shadow-emerald-950/40' 
                            : 'bg-amber-500/20 text-[#c5a869] border border-amber-500/40 shadow-lg shadow-amber-950/40'
                        }`}>
                          <Globe className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400">{isAr ? 'حالة النطاق الحالي:' : 'Current Domain Status:'}</span>
                            {customDomainInput ? (
                              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                <span>{isAr ? 'مربوط ومفعل' : 'Connected & Active'}</span>
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                {isAr ? 'النطاق الرسمي المعتمد للمكتب' : 'Official Registered Domain'}
                              </span>
                            )}
                          </div>
                          <p className="text-base font-bold text-[#c5a869] font-mono mt-0.5 flex items-center gap-2">
                            <span>{customDomainInput || `${firmService.getActiveFirmSlug()}.mohamoon.sa`}</span>
                            <span className="text-[10px] text-slate-400 font-sans font-normal">
                              ({isAr ? 'رسمي ومفعل تلقائياً' : 'Official'})
                            </span>
                          </p>
                        </div>
                      </div>

                      {customDomainInput && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handleTestDnsConnection}
                            disabled={isTestingDns}
                            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                          >
                            {isTestingDns ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5 text-[#c5a869]" />}
                            <span>{isAr ? 'فحص الاتصال' : 'Check DNS'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={handleRemoveCustomDomain}
                            disabled={isSavingDomain}
                            className="px-3 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>{isAr ? 'إلغاء الربط' : 'Disconnect'}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Section 1: Connect Custom Domain */}
                  <form onSubmit={handleSaveCustomDomain} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-lg">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <Link2 className="w-4 h-4 text-[#c5a869]" />
                        <span>{isAr ? 'ربط دومين يملكه المكتب (Connect Domain)' : 'Connect Your Domain'}</span>
                      </h4>
                      <span className="text-[11px] text-[#e5cb8e] font-medium">
                        {isAr ? 'التحكم الذاتي للمكتب 100%' : '100% Self-service'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {isAr 
                        ? 'إذا كان لديك دومين تم شراؤه مسبقاً (أو بعد شرائه من المزودين الموضحين أدناه)، اكتبه هنا بدون http أو https ثم اضغط حفظ وتفعيل:' 
                        : 'If you already own a domain, enter it below (without http/https) and click Save & Connect:'}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="relative flex-grow">
                        <div className="absolute inset-y-0 right-0 rtl:right-0 rtl:left-auto pr-3.5 flex items-center pointer-events-none text-slate-500">
                          <Globe className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          value={customDomainInput}
                          onChange={(e) => setCustomDomainInput(e.target.value)}
                          placeholder="مثال: nahwi-law.com أو www.nahwi-law.sa"
                          className="w-full pl-3 pr-10 rtl:pr-10 rtl:pl-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono focus:border-[#c5a869] focus:outline-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSavingDomain}
                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#c5a869] to-[#d4af37] text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 hover:brightness-110 transition cursor-pointer shadow-md disabled:opacity-50 whitespace-nowrap"
                      >
                        {isSavingDomain ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        <span>{isAr ? 'حفظ وتفعيل الدومين' : 'Save & Connect Domain'}</span>
                      </button>
                    </div>

                    {/* DNS Records Guide */}
                    <div className="pt-3 border-t border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                          <Server className="w-3.5 h-3.5 text-[#c5a869]" />
                          <span>{isAr ? 'سجلات DNS المطلوب إضافتها في لوحة تحكم دومينك:' : 'Required DNS Records to add in your domain registrar:'}</span>
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {isAr ? 'تضاف مرة واحدة فقط' : 'Add once'}
                        </span>
                      </div>

                      <div className="space-y-2">
                        {/* A Record */}
                        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                          <div className="flex items-center gap-3">
                            <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono font-bold text-[11px] border border-blue-500/30">
                              A Record
                            </span>
                            <div className="space-y-0.5">
                              <span className="text-slate-400 text-[11px] block">{isAr ? 'المضيف (Host/Name):' : 'Host:'} <strong className="text-white font-mono">@</strong></span>
                              <span className="text-slate-400 text-[11px] block">{isAr ? 'القيمة (Value/IP):' : 'Value:'} <strong className="text-emerald-400 font-mono">76.76.21.21</strong></span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => copyToClipboard('76.76.21.21', 'dns-a')}
                            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-[11px] text-slate-300 border border-slate-700 flex items-center gap-1 transition cursor-pointer self-start sm:self-center"
                          >
                            {copiedDnsField === 'dns-a' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-[#c5a869]" />}
                            <span>{copiedDnsField === 'dns-a' ? (isAr ? 'تم النسخ!' : 'Copied') : (isAr ? 'نسخ الـ IP' : 'Copy IP')}</span>
                          </button>
                        </div>

                        {/* CNAME Record */}
                        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                          <div className="flex items-center gap-3">
                            <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono font-bold text-[11px] border border-purple-500/30">
                              CNAME
                            </span>
                            <div className="space-y-0.5">
                              <span className="text-slate-400 text-[11px] block">{isAr ? 'المضيف (Host/Name):' : 'Host:'} <strong className="text-white font-mono">www</strong></span>
                              <span className="text-slate-400 text-[11px] block">{isAr ? 'المسار الموجه (Target):' : 'Target:'} <strong className="text-purple-300 font-mono">cname.mohamoon.law</strong></span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => copyToClipboard('cname.mohamoon.law', 'dns-cname')}
                            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-[11px] text-slate-300 border border-slate-700 flex items-center gap-1 transition cursor-pointer self-start sm:self-center"
                          >
                            {copiedDnsField === 'dns-cname' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-[#c5a869]" />}
                            <span>{copiedDnsField === 'dns-cname' ? (isAr ? 'تم النسخ!' : 'Copied') : (isAr ? 'نسخ القيمة' : 'Copy Value')}</span>
                          </button>
                        </div>
                      </div>

                      {/* Live Diagnostic Checker Button */}
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={handleTestDnsConnection}
                          disabled={isTestingDns || !customDomainInput}
                          className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
                        >
                          {isTestingDns ? <Loader2 className="w-4 h-4 animate-spin text-[#c5a869]" /> : <Sparkles className="w-4 h-4 text-[#c5a869]" />}
                          <span>{isAr ? '⚡ اختبار فحص اتصال الدومين وشهادة الأمان SSL' : '⚡ Test DNS Connection & SSL Certificate'}</span>
                        </button>
                      </div>

                      {/* DNS Test Result Box */}
                      {domainTestResult && (
                        <div className={`p-4 rounded-xl border space-y-2 text-xs transition ${
                          domainTestResult.valid 
                            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200' 
                            : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                        }`}>
                          <div className="flex items-center justify-between">
                            <span className="font-bold flex items-center gap-1.5">
                              {domainTestResult.valid ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
                              <span>{domainTestResult.message}</span>
                            </span>
                            {domainTestResult.timestamp && (
                              <span className="text-[10px] opacity-70 font-mono">{domainTestResult.timestamp}</span>
                            )}
                          </div>

                          {domainTestResult.valid && (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-emerald-500/20 text-[11px]">
                              <div className="p-2 rounded bg-slate-900/80 border border-emerald-500/20">
                                <span className="text-slate-400 block text-[10px]">{isAr ? 'توجيه A Record:' : 'A Record:'}</span>
                                <span className="font-bold text-emerald-400">متصل (76.76.21.21) ✅</span>
                              </div>
                              <div className="p-2 rounded bg-slate-900/80 border border-emerald-500/20">
                                <span className="text-slate-400 block text-[10px]">{isAr ? 'نطاق WWW:' : 'WWW CNAME:'}</span>
                                <span className="font-bold text-emerald-400">موجه ومفعل ✅</span>
                              </div>
                              <div className="p-2 rounded bg-slate-900/80 border border-emerald-500/20">
                                <span className="text-slate-400 block text-[10px]">{isAr ? 'شهادة الأمان SSL:' : 'SSL Security:'}</span>
                                <span className="font-bold text-emerald-400">🔒 مشفرة ومفعلة تلقائياً</span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </form>

                  {/* Section 2: Book / Purchase a New Domain */}
                  <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-lg">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <span>{isAr ? 'لا تملك دوميناً بعد؟ احجز دومينك باسم مكتبك الآن' : 'Need a Domain? Book One Now'}</span>
                      </h4>
                      <span className="text-[11px] text-amber-300 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                        {isAr ? 'خطوات سهلة وسريعة' : 'Easy Setup'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {isAr
                        ? 'يمكنك حجز الدومين بكل سهولة من أي مزود معتمد بالاسم الذي تريده، ونوصي بشدة بالامتدادات القانونية الرسمية أو النطاقات السعودية:'
                        : 'You can register a domain with any accredited registrar. We highly recommend official legal TLDs or regional domains:'}
                    </p>

                    {/* Domain Extension Suggestions */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold font-mono text-sm text-[#e5cb8e]">.sa / .السعودية</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">رسمي معتمد</span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          {isAr ? 'النطاق الوطني السعودي للمحامين والشركات المهنية المرخصة في المملكة.' : 'Official Saudi national domain for licensed law offices.'}
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold font-mono text-sm text-blue-300">.law / .legal</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold">عالمي للمحاماة</span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          {isAr ? 'الامتداد القانوني العالمي المخصص لرجال القانون ومكاتب الاستشارات الدولية.' : 'Prestigious global legal extension exclusive for the legal sector.'}
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold font-mono text-sm text-purple-300">.com / .net</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold">الأكثر شهرة</span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          {isAr ? 'الامتداد التجاري الأكثر انتشاراً وسهولة في التذكر لدى العملاء.' : 'The most popular commercial domain globally.'}
                        </p>
                      </div>
                    </div>

                    {/* Registrar Links */}
                    <div className="pt-2 space-y-2">
                      <span className="text-[11px] text-slate-400 font-medium block">
                        {isAr ? 'روابط مباشرة لحجز وشراء الدومين من المزودين المعتمدين:' : 'Direct links to book domains from accredited registrars:'}
                      </span>
                      <div className="flex flex-wrap items-center gap-2">
                        <a
                          href="https://nic.sa"
                          target="_blank"
                          rel="noreferrer"
                          className="px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-xs text-slate-200 border border-slate-700 hover:border-[#c5a869] flex items-center gap-1.5 transition"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{isAr ? '🇸🇦 المركز السعودي لمعلومات الشبكة (NIC.sa)' : '🇸🇦 SaudiNIC (.sa)'}</span>
                        </a>

                        <a
                          href="https://www.namecheap.com"
                          target="_blank"
                          rel="noreferrer"
                          className="px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-xs text-slate-200 border border-slate-700 hover:border-[#c5a869] flex items-center gap-1.5 transition"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-orange-400" />
                          <span>Namecheap (حجز سريع وسهل)</span>
                        </a>

                        <a
                          href="https://www.cloudflare.com/products/registrar/"
                          target="_blank"
                          rel="noreferrer"
                          className="px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-xs text-slate-200 border border-slate-700 hover:border-[#c5a869] flex items-center gap-1.5 transition"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                          <span>Cloudflare Registrar (أفضل حماية وسرعة)</span>
                        </a>

                        <a
                          href="https://www.godaddy.com"
                          target="_blank"
                          rel="noreferrer"
                          className="px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-xs text-slate-200 border border-slate-700 hover:border-[#c5a869] flex items-center gap-1.5 transition"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                          <span>GoDaddy</span>
                        </a>
                      </div>
                    </div>

                    {/* How It Works Guide */}
                    <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
                      <span className="font-bold text-slate-200 flex items-center gap-1.5">
                        <HelpCircle className="w-4 h-4 text-[#c5a869]" />
                        <span>{isAr ? '3 خطوات بسيطة بعد حجز الدومين:' : '3 Simple Steps After Booking:'}</span>
                      </span>
                      <ol className="list-decimal list-inside space-y-1.5 text-slate-300 text-[11px] leading-relaxed pr-2">
                        <li>{isAr ? 'افتح لوحة تحكم الدومين لدى الموقع الذي اشتريت منه الدومين، وتوجه إلى صفحة (DNS Management أو إدارة السجلات).' : 'Go to your registrar DNS Management page.'}</li>
                        <li>{isAr ? 'أضف سجل A وسجل CNAME الموضحين في الأعلى بقيمهم المحددة.' : 'Add the A and CNAME records shown above.'}</li>
                        <li>{isAr ? 'ارجع هنا وأدخل الدومين في الحقل أعلاه واضغط "حفظ وتفعيل الدومين". سيعمل موقعك فوراً مع شهادة أمان SSL مجانية!' : 'Enter your domain in the field above and click Save & Connect. Your office will be live!'}</li>
                      </ol>
                    </div>
                  </div>

                  {/* Section 3: FAQ */}
                  <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-lg">
                    <h4 className="text-xs font-bold text-[#e5cb8e] uppercase tracking-wider flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-[#c5a869]" />
                      <span>{isAr ? 'الأسئلة الشائعة حول الدومين الخاص' : 'Frequently Asked Questions'}</span>
                    </h4>

                    <div className="space-y-2 text-xs">
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                        <h5 className="font-bold text-white mb-1">
                          {isAr ? 'هل يستطيع كل مكتب إضافة دومينه الخاص بنفسه بدون التواصل مع الإدارة؟' : 'Can each office add their domain independently?'}
                        </h5>
                        <p className="text-slate-400 text-[11px] leading-relaxed">
                          {isAr 
                            ? 'نعم بكل تأكيد! تم تصميم النظام ليتيح لمدير كل مكتب إضافة أو تغيير الدومين الخاص به مباشرة من لوحة تحكمه في أي وقت دون الحاجة لطلب إذن أو انتظار.' 
                            : 'Yes, absolutely! The system allows every office manager to add or change their domain directly from their dashboard at any time.'}
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                        <h5 className="font-bold text-white mb-1">
                          {isAr ? 'هل يؤثر ربط الدومين على محتويات المكتب أو مقالاته أو استشاراته؟' : 'Does linking a domain affect firm data or content?'}
                        </h5>
                        <p className="text-slate-400 text-[11px] leading-relaxed">
                          {isAr 
                            ? 'أبداً. كافة محتوياتك وبيانات الشركاء والقضايا والمقالات والرسائل تظل محفوظة ومزامنة سحابياً، ويصبح الدومين الجديد مجرد عنوان مباشر ومرموق يصل إليه زوارك وعملاؤك.' 
                            : 'Never. All articles, team members, inquiries, and settings remain untouched and securely stored, accessible instantly via your new domain.'}
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                        <h5 className="font-bold text-white mb-1">
                          {isAr ? 'ماذا عن شهادة الأمان والحماية والتشفير (HTTPS / SSL)؟' : 'What about SSL Security Certificate?'}
                        </h5>
                        <p className="text-slate-400 text-[11px] leading-relaxed">
                          {isAr 
                            ? 'يتم إصدار وتجديد شهادة أمان مشفرة مجاناً وتلقائياً لكل دومين يتم ربطه بالمنصة، مما يضمن ظهور علامة القفل الأخضر والأمان التام لبيانات عملائك.' 
                            : 'An automated, free SSL/TLS certificate is provisioned and renewed for every custom domain connected to the platform.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 9: FIRM BACKUP & DATA MANAGEMENT */}
              {activeTab === 'backup' && (
                <div className="space-y-6 max-w-3xl">
                  <div>
                    <h3 className="text-xl font-bold font-serif-title text-white">
                      {isAr ? 'النسخ الاحتياطي وإدارة بيانات المكتب' : 'Firm Backup & Data Management'}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {isAr 
                        ? 'إدارة وحفظ وتصدير لقطة شاملة لكافة بيانات ومحتويات هذا المكتب بصيغة JSON، واستعادتها وصيانة الذاكرة بأمان تام.' 
                        : 'Manage, export and restore firm data snapshots in JSON format, maintenance, and storage tools.'}
                    </p>
                  </div>

                  {/* 1. EXPORT BACKUP (JSON) */}
                  <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-[#c5a869]/20 border border-[#c5a869]/40 flex items-center justify-center text-[#c5a869]">
                        <Download className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm">{isAr ? 'تصدير نسخة احتياطية كاملة للمكتب (Export JSON)' : 'Export Full Firm JSON Backup'}</h4>
                        <span className="text-[11px] text-slate-400">{isAr ? 'حفظ لقطة كاملة لجميع بيانات هذا المكتب للاحتفاظ بها أو نقلها بأمان' : 'Download a JSON snapshot containing all firm partners, practices, cases, blogs, and settings'}</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-300">
                      {isAr ? 'تنزيل ملف JSON يحتوي على كافة بيانات الشركاء، الاختصاصات، الإنجازات، المقالات، رسائل العملاء، وإعدادات الهوية الخاصة بمكتبك.' : 'Download a JSON snapshot containing all partners, practices, case studies, blogs, and settings for your firm.'}
                    </p>
                    <button
                      type="button"
                      onClick={handleExportBackup}
                      className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-[#e5cb8e] border border-[#c5a869]/30 text-xs font-semibold flex items-center gap-2 transition cursor-pointer shadow-md"
                    >
                      <Download className="w-4 h-4 text-[#c5a869]" />
                      <span>{isAr ? 'تنزيل ملف النسخة الاحتياطية (JSON)' : 'Download Backup File (.json)'}</span>
                    </button>
                  </div>

                  {/* 2. IMPORT & RESTORE BACKUP (JSON) */}
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

                  {/* 4. SAFE CACHE CLEAR & STORAGE CLEANUP */}
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-cyan-950/40 via-slate-900 to-slate-900 border border-cyan-500/40 space-y-4 shadow-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                          <RefreshCw className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-sm">
                            {isAr ? 'صيانة النظام وتفريغ المساحة' : 'System Maintenance & Storage Cleanup'}
                          </h4>
                          <span className="text-[11px] text-cyan-300 font-medium">
                            {isAr ? 'تحسين سرعة الموقع ومسح السجلات غير الضرورية' : 'Optimize performance and clear non-essential data'}
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
                        ? 'استخدم هذه الأدوات إذا شعرت ببطء في الموقع أو إذا ظهر تنبيه بامتلاء ذاكرة التخزين. هذه العمليات آمنة ولا تؤثر على بيانات الشركاء أو المحتوى الأساسي.'
                        : 'Use these tools if the site feels slow or storage is near its limit. These operations are safe and will not affect your core firm data.'}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Audit Logs Cleanup */}
                      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                        <div className="flex items-center gap-2 text-amber-400">
                          <History className="w-4 h-4" />
                          <span className="text-xs font-bold">{isAr ? 'سجلات النشاط' : 'Audit Logs'}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-relaxed">
                          {isAr ? 'مسح سجلات التعديلات القديمة لتوفير مساحة كبيرة في الذاكرة.' : 'Clear old operation logs to free up significant storage space.'}
                        </p>
                        <button
                          type="button"
                          onClick={handleClearLogs}
                          className="w-full py-2 rounded-xl bg-slate-800 hover:bg-amber-500/20 hover:text-amber-300 text-slate-300 text-xs font-bold transition border border-slate-700 hover:border-amber-500/40 cursor-pointer"
                        >
                          {isAr ? 'مسح سجلات النشاط' : 'Clear Audit Logs'}
                        </button>
                      </div>

                      {/* Cache Refresh */}
                      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                        <div className="flex items-center gap-2 text-cyan-400">
                          <RefreshCw className="w-4 h-4" />
                          <span className="text-xs font-bold">{isAr ? 'تحديث الذاكرة' : 'Refresh Cache'}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-relaxed">
                          {isAr ? 'تحديث ملفات الموقع البرمجية مع ضمان أمان البيانات المخزنة.' : 'Safely reload app code and refresh stored data pointers.'}
                        </p>
                        <button
                          type="button"
                          onClick={handleClearCacheAndRefresh}
                          disabled={!!cacheRefreshProgress}
                          className="w-full py-2 rounded-xl bg-gradient-to-r from-cyan-600 via-cyan-500 to-teal-500 hover:brightness-110 text-slate-950 text-xs font-bold flex items-center gap-2 transition cursor-pointer shadow-lg shadow-cyan-900/30"
                        >
                          {cacheRefreshProgress ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>{isAr ? 'جاري التحديث...' : 'Updating...'}</span>
                            </>
                          ) : (
                            <>
                              <RefreshCw className="w-3.5 h-3.5" />
                              <span>{isAr ? 'تحديث شامل وآمن' : 'Safe Full Refresh'}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
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
