import React, { useState, useEffect, useRef } from 'react';
import { 
  X, CheckCircle2, ChevronRight, ChevronLeft, Building2, Lock, Mail, Phone, 
  User, Globe, Sparkles, Copy, ExternalLink, ShieldCheck, MapPin, Check,
  CreditCard, Eye, EyeOff, FileText, ArrowRight, ArrowLeft, Award, Layers,
  Upload, Camera, Trash2
} from 'lucide-react';
import { Language, LawFirm, SubscriptionPlanTier, PricingPlan } from '../types';
import { firmService } from '../services/firmService';
import { pricingPlanService, formatPlanPrice, formatBillingCycle } from '../services/pricingPlanService';
import { COUNTRIES_LIST } from '../data/countries';
import { initialPracticeAreas, initialCaseStudies, initialTestimonials, initialBlogPosts } from '../data/initialData';
import { processImageFile } from './ImageUploader';

const LAWYER_PORTRAIT_PRESETS = [
  { id: 'attorney-1', label: 'محامي تنفيذي', url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=600' },
  { id: 'attorney-2', label: 'مستشار وقور', url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=600' },
  { id: 'attorney-3', label: 'محامية شريكة', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600' },
  { id: 'attorney-4', label: 'شريك إداري', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600' },
  { id: 'attorney-5', label: 'محامي تجاري', url: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&q=80&w=600' },
];

interface FirmRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onFirmRegistered?: (firm: LawFirm) => void;
  initialPlanTier?: string;
}

const generateCleanSlug = (text: string) => {
  const arabicMap: Record<string, string> = {
    'أ': 'a', 'ا': 'a', 'إ': 'e', 'آ': 'a', 'ؤ': 'o', 'ئ': 'e',
    'ب': 'b', 'ت': 't', 'ث': 'th', 'ج': 'j', 'ح': 'h', 'خ': 'kh',
    'د': 'd', 'ذ': 'dh', 'ر': 'r', 'ز': 'z', 'س': 's', 'ش': 'sh',
    'ص': 's', 'ض': 'd', 'ط': 't', 'ظ': 'z', 'ع': 'a', 'غ': 'gh',
    'ف': 'f', 'ق': 'q', 'ك': 'k', 'ل': 'l', 'م': 'm', 'ن': 'n',
    'ه': 'h', 'ة': 'h', 'و': 'w', 'ي': 'y', 'ى': 'a',
    ' ': '-'
  };
  
  let slug = text.trim().toLowerCase();
  let result = '';
  for (let i = 0; i < slug.length; i++) {
    const char = slug[i];
    if (arabicMap[char]) {
      result += arabicMap[char];
    } else if (/[a-z0-9-]/.test(char)) {
      result += char;
    } else if (char === ' ') {
      result += '-';
    }
  }
  
  return result.replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 30) || `firm-${Date.now().toString(36)}`;
};

export const FirmRegistrationModal: React.FC<FirmRegistrationModalProps> = ({ 
  isOpen, 
  onClose, 
  lang,
  onFirmRegistered,
  initialPlanTier
}) => {
  const isAr = lang === 'ar';
  const isTr = lang === 'tr';

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [createdFirm, setCreatedFirm] = useState<LawFirm | null>(null);

  // Form State (Lawyer Input Only - No internal manager fields)
  const [formData, setFormData] = useState({
    nameAr: '',
    nameEn: '',
    slug: '',
    taglineAr: '',
    founderName: '',
    founderTitle: 'المحامي المؤسس والشريك الإداري العام',
    founderPhotoUrl: '',
    phone: '',
    email: '',
    countryAr: 'المملكة العربية السعودية',
    countryEn: 'Saudi Arabia',
    cityAr: 'الرياض',
    aboutTextAr: '',
    adminPassword: '',
    confirmPassword: '',
    planTier: 'professional' as SubscriptionPlanTier,
    useTemplateData: true,
  });

  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);
  const photoFileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsProcessingPhoto(true);
      setErrorMsg('');
      const processed = await processImageFile(file, 600, 600, 0.8);
      setFormData(prev => ({ ...prev, founderPhotoUrl: processed }));
    } catch (err: any) {
      setErrorMsg(err.message || (isAr ? 'فشل معالجة الصورة، يرجى اختيار ملف صورة صالح' : 'Failed to process image'));
    } finally {
      setIsProcessingPhoto(false);
    }
  };

  const [plans, setPlans] = useState<PricingPlan[]>(() => pricingPlanService.getPlans());

  useEffect(() => {
    const handlePlansUpdated = () => {
      const activePlans = pricingPlanService.getPlans();
      setPlans(activePlans);
      if (activePlans.length > 0 && !activePlans.some(p => p.tier === formData.planTier)) {
        const defaultPlan = activePlans.find(p => p.isPopular) || activePlans[0];
        setFormData(prev => ({ ...prev, planTier: defaultPlan.tier }));
      }
    };

    handlePlansUpdated();
    if (isOpen) {
      if (initialPlanTier) {
        setFormData(prev => ({ ...prev, planTier: initialPlanTier as any }));
      }
      pricingPlanService.init().catch(() => {});
    }

    window.addEventListener('aladl_pricing_plans_updated', handlePlansUpdated);
    return () => {
      window.removeEventListener('aladl_pricing_plans_updated', handlePlansUpdated);
    };
  }, [isOpen, initialPlanTier]);

  if (!isOpen) return null;

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (step === 1) {
      if (!formData.nameAr.trim()) {
        setErrorMsg(isAr ? 'يرجى إدخال اسم المكتب الرسمي بالعربية' : 'Please enter official firm name');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!formData.founderName.trim()) {
        setErrorMsg(isAr ? 'يرجى إدخال اسم المحامي المسؤول / المؤسس' : 'Please enter founder attorney name');
        return;
      }
      if (!formData.phone.trim()) {
        setErrorMsg(isAr ? 'يرجى إدخال رقم الهاتف أو الواتساب للتواصل' : 'Please enter phone number');
        return;
      }
      setStep(3);
    }
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.adminPassword.trim() || formData.adminPassword.length < 4) {
      setErrorMsg(isAr ? 'يرجى تعيين كلمة مرور قوية لإدارة مكتبك (4 أحرف أو أرقام على الأقل)' : 'Please choose a manager password (at least 4 characters)');
      return;
    }

    if (formData.confirmPassword && formData.adminPassword !== formData.confirmPassword) {
      setErrorMsg(isAr ? 'كلمة المرور وتأكيدها غير متطابقين' : 'Passwords do not match');
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedPlan = plans.find(p => p.tier === formData.planTier) || plans[1];
      const selectedCountryObj = COUNTRIES_LIST.find(c => c.ar === formData.countryAr) || { ar: 'المملكة العربية السعودية', en: 'Saudi Arabia' };
      const firmSlug = generateCleanSlug(formData.nameAr);
      const firmEmail = formData.email.trim() || `info@${firmSlug || 'lawfirm'}.sa`;

      const res = await firmService.createFirm({
        nameAr: formData.nameAr.trim(),
        nameEn: formData.nameEn.trim() || formData.nameAr.trim(),
        slug: firmSlug,
        taglineAr: formData.taglineAr.trim() || 'ريادة قضائية وحلول قانونية واستشارية متكاملة',
        cityAr: formData.cityAr.trim() || 'الرياض',
        countryAr: selectedCountryObj.ar,
        countryEn: selectedCountryObj.en,
        phone: formData.phone.trim(),
        email: firmEmail,
        adminPassword: formData.adminPassword.trim(),
        themeColor: '#c5a869',
        populateTemplateData: formData.useTemplateData,
        founderName: formData.founderName.trim(),
        founderTitle: formData.founderTitle.trim(),
        founderPhotoUrl: formData.founderPhotoUrl.trim(),
      });

      if (res.success && res.firm) {
        // Enhance subscription details with chosen plan
        const updatedSub = {
          ...res.firm.subscription!,
          planTier: selectedPlan.tier,
          planNameAr: selectedPlan.nameAr,
          planNameEn: selectedPlan.nameEn,
          annualFee: selectedPlan.priceSAR,
          currency: 'SAR',
          status: 'trial' as const, // Start with free trial & instant active site
          isSiteActive: true,
          notes: `تم التسجيل الإلكتروني عبر منصة المحامين - باقة ${selectedPlan.nameAr}`,
        };

        // If template data is requested, populate rich legal defaults
        const updatedData = {
          ...res.firm.data,
          settings: {
            ...res.firm.data.settings,
            firmNameAr: formData.nameAr.trim(),
            firmNameEn: formData.nameEn.trim() || formData.nameAr.trim(),
            sloganAr: formData.taglineAr.trim() || 'ريادة قضائية وحلول قانونية واستشارية متكاملة',
            aboutTextAr: formData.aboutTextAr.trim() || `نحن في ${formData.nameAr.trim()} نكرس خبراتنا القانونية الراسخة لتقديم أعلى مستويات التمثيل القضائي والاستشارات القانونية المتخصصة.`,
            phone: formData.phone.trim(),
            emergencyPhone: formData.phone.trim(),
            email: formData.email.trim(),
            consultationEmail: formData.email.trim(),
            cityAr: formData.cityAr.trim(),
            countryAr: selectedCountryObj.ar,
            adminPassword: formData.adminPassword.trim(),
          },
          partners: [
            {
              id: `partner-${Date.now()}`,
              name: formData.founderName.trim() || formData.nameAr.trim(),
              nameEn: formData.founderName.trim() || 'Managing Partner',
              title: formData.founderTitle.trim() || 'المحامي المؤسس والمدير العام',
              titleEn: 'Founding & Managing Partner',
              specialty: 'الاستشارات القانونية والتمثيل القضائي والتحكيم',
              specialtyEn: 'Legal Consultancy, Litigation & Arbitration',
              experienceYears: 15,
              education: ['بكالوريوس في الحقوق والأنظمة القانونية'],
              educationEn: ['Bachelor of Laws (LL.B.)'],
              languages: ['العربية', 'الإنجليزية'],
              bio: `المحامي المؤسس والمدير العام لمكتب ${formData.nameAr.trim()}، خبرة رائدة في الترافع وصياغة العقود والاستشارات النوعية.`,
              bioEn: `Founding & Managing Partner with extensive experience in legal counsel and litigation.`,
              image: formData.founderPhotoUrl.trim() || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=600',
              imageUrl: formData.founderPhotoUrl.trim() || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=600',
              phone: formData.phone.trim(),
              email: formData.email.trim(),
              linkedin: 'https://linkedin.com',
              barAdmission: 'نقابة المحامين',
              featured: true,
              isPartner: true,
            }
          ],
          practiceAreas: formData.useTemplateData ? initialPracticeAreas : [],
          caseStudies: formData.useTemplateData ? initialCaseStudies : [],
          testimonials: formData.useTemplateData ? initialTestimonials : [],
          blogPosts: formData.useTemplateData ? initialBlogPosts : [],
        };

        const finalizedFirm: LawFirm = {
          ...res.firm,
          taglineAr: formData.taglineAr.trim() || res.firm.taglineAr,
          subscription: updatedSub,
          data: updatedData,
        };

        await firmService.saveFirm(finalizedFirm);
        setCreatedFirm(finalizedFirm);
        setStep(4);
        if (onFirmRegistered) {
          onFirmRegistered(finalizedFirm);
        }
      } else {
        setErrorMsg(res.message || (isAr ? 'حدث خطأ أثناء تسجيل المكتب، يرجى المحاولة ثانية' : 'Error creating firm'));
      }
    } catch (err: any) {
      setErrorMsg(err.message || (isAr ? 'حدث خطأ غير متوقع أثناء تسجيل المكتب' : 'Unexpected error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFullSiteUrl = (slug: string) => {
    if (typeof window === 'undefined') return `?firm=${slug}`;
    return `${window.location.origin}/?firm=${slug}`;
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div 
        className="relative w-full max-w-3xl rounded-3xl bg-slate-900 border border-[#c5a869]/50 shadow-2xl text-slate-100 flex flex-col max-h-[95vh] overflow-hidden my-auto"
        dir={isAr ? 'rtl' : 'ltr'}
      >
        {/* Modal Top Header */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 via-[#c5a869] to-amber-700 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold font-serif-title text-white">
                  {isAr ? 'معالج تسجيل وتدشين موقع مكتب محاماة' : 'Law Firm Registration & Launch Wizard'}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#c5a869]/20 text-[#ebd397] border border-[#c5a869]/40">
                  {isAr ? 'تدشين فوري' : 'Instant Launch'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {isAr ? 'أنشئ موقعك القانوني المستقل مع لوحة تحكم متكاملة في أقل من دقيقة' : 'Build your independent law firm website and control panel in 1 minute'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer border border-transparent hover:border-slate-700"
            title={isAr ? 'إغلاق' : 'Close'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Steps Navigation Bar (Only for steps 1, 2, 3) */}
        {step < 4 && (
          <div className="px-6 py-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between gap-2 overflow-x-auto text-xs font-bold">
            {/* Step 1 */}
            <div className={`flex items-center gap-2 ${step === 1 ? 'text-amber-400' : step > 1 ? 'text-emerald-400' : 'text-slate-500'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-mono font-black ${
                step === 1 ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30' : step > 1 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
              }`}>
                {step > 1 ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : '1'}
              </div>
              <span>{isAr ? '1. هوية واسم المكتب' : '1. Firm Identity'}</span>
            </div>

            <div className={`h-0.5 flex-1 max-w-[40px] ${step > 1 ? 'bg-emerald-500' : 'bg-slate-800'}`} />

            {/* Step 2 */}
            <div className={`flex items-center gap-2 ${step === 2 ? 'text-amber-400' : step > 2 ? 'text-emerald-400' : 'text-slate-500'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-mono font-black ${
                step === 2 ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30' : step > 2 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
              }`}>
                {step > 2 ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : '2'}
              </div>
              <span>{isAr ? '2. المحامي والتواصل' : '2. Founder & Contact'}</span>
            </div>

            <div className={`h-0.5 flex-1 max-w-[40px] ${step > 2 ? 'bg-emerald-500' : 'bg-slate-800'}`} />

            {/* Step 3 */}
            <div className={`flex items-center gap-2 ${step === 3 ? 'text-amber-400' : 'text-slate-500'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-mono font-black ${
                step === 3 ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30' : 'bg-slate-800 text-slate-400'
              }`}>
                3
              </div>
              <span>{isAr ? '3. الباقة وكلمة المرور' : '3. Plan & Password'}</span>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3.5 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-semibold flex items-center gap-2 animate-shake">
            <X className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Scrollable Form Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* STEP 1: FIRM IDENTITY */}
          {step === 1 && (
            <form onSubmit={handleNext} className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[#ebd397] flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
                <p className="leading-relaxed">
                  {isAr 
                    ? 'أهلاً بك زميلنا المحامي! أدخل اسم مكتبك لنقوم بإنشاء موقع رسمي متكامل ومخصص لك فوراً.'
                    : 'Welcome! Enter your firm name to instantly generate your official law firm website.'}
                </p>
              </div>

              {/* Names */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-200 font-bold mb-1.5">
                    {isAr ? 'اسم المكتب أو المحامي الرسمي (بالعربية) *:' : 'Official Firm Name (Arabic) *:'}
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={formData.nameAr}
                    onChange={(e) => {
                      const val = e.target.value;
                      const cleanSlug = generateCleanSlug(val);
                      setFormData(prev => ({
                        ...prev,
                        nameAr: val,
                        founderName: prev.founderName || val,
                        slug: prev.slug ? prev.slug : cleanSlug
                      }));
                    }}
                    placeholder={isAr ? 'مثال: شركة العدل للمحاماة والاستشارات' : 'e.g. Al-Adl Law Firm'}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400/30"
                  />
                </div>

                <div>
                  <label className="block text-slate-200 font-bold mb-1.5">
                    {isAr ? 'اسم المكتب بالإنجليزية (اختياري):' : 'Official Firm Name (English):'}
                  </label>
                  <input
                    type="text"
                    value={formData.nameEn}
                    onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                    placeholder="e.g. Al-Adl Law Firm & Legal Counsel"
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:border-amber-400 focus:outline-none font-sans"
                  />
                </div>
              </div>

              {/* Tagline */}
              <div>
                <label className="block text-slate-200 font-bold mb-1.5 flex items-center justify-between">
                  <span>{isAr ? 'الشعار اللفظي أو الرؤية القانونية للمكتب:' : 'Firm Tagline / Slogan:'}</span>
                  <span className="text-[10px] text-amber-400 font-normal">
                    {isAr ? 'اختر من العبارات الجاهزة المهنية' : 'Select professional tagline'}
                  </span>
                </label>
                <select
                  value={formData.taglineAr}
                  onChange={(e) => setFormData({ ...formData, taglineAr: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-amber-400 focus:outline-none cursor-pointer"
                >
                  <option value="">{isAr ? '-- اختر الشعار اللفظي المناسب لمكتبك --' : '-- Select Professional Slogan --'}</option>
                  {[
                    'ريادة قضائية وحلول قانونية واستشارية متكاملة',
                    'حماية حقوقكم وتحقيق العدالة بأعلى معايير المهنية',
                    'خبرة راسخة في الترافع والتمثيل القضائي وحماية المصالح',
                    'شركاؤكم الموثوقون في النجاح القانوني وحل النزاعات',
                    'رؤية استراتيجية وحلول قانونية مبتكرة لقطاع الأعمال والأفراد',
                    'دفاع صلب عن حقوقكم وموثوقية مطلقة في الاستشارات',
                    'نحمي مصالحكم القانونية ونمهد لكم طريق النجاح المؤسسي',
                    'التميز في صياغة العقود وتمثيل الموكلين أمام كافة الجهات القضائية',
                    'العدالة الناجزة والخبرة القانونية العميقة في خدمة قضاياكم',
                    'استشارات قانونية دقيقة وحلول قضائية ذكية لضمان استقرار أعمالكم'
                  ].map((slogan, idx) => (
                    <option key={idx} value={slogan}>{slogan}</option>
                  ))}
                </select>
              </div>

              {/* Step 1 Actions */}
              <div className="flex items-center justify-end pt-4 border-t border-slate-800">
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-[#c5a869] hover:bg-[#b59859] text-slate-950 font-black text-sm flex items-center gap-2 transition cursor-pointer shadow-lg shadow-amber-500/20 active:scale-95"
                >
                  <span>{isAr ? 'متابعة لبيانات التواصل والمحامي' : 'Continue to Contact Info'}</span>
                  {isAr ? <ChevronLeft className="w-4 h-4 stroke-[3]" /> : <ChevronRight className="w-4 h-4 stroke-[3]" />}
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: FOUNDER & CONTACT */}
          {step === 2 && (
            <form onSubmit={handleNext} className="space-y-4">
              {/* Founder Name */}
              <div>
                <label className="block text-slate-200 font-bold mb-1.5">
                  {isAr ? 'اسم المحامي المسؤول أو الشريك المؤسس *:' : 'Founder / Managing Attorney Name *:'}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-amber-400 absolute right-3 rtl:right-3 rtl:left-auto top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    autoFocus
                    value={formData.founderName}
                    onChange={(e) => setFormData({ ...formData, founderName: e.target.value })}
                    placeholder={isAr ? 'مثال: المحامي أحمد النحوي' : 'e.g. Attorney Ahmad Nahwi'}
                    className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Personal Photo Upload for Founder Lawyer */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-3 shadow-inner">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-amber-400" />
                    <span>{isAr ? 'الصورة الشخصية للمحامي المسؤول (ستظهر في موقع المكتب):' : 'Managing Attorney Portrait Photo:'}</span>
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 font-medium">
                    {isAr ? 'صورة الشريك' : 'Attorney Headshot'}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 pt-1">
                  {/* Avatar Preview */}
                  <div className="relative group shrink-0">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-slate-900 border-2 border-amber-400/60 shadow-lg flex items-center justify-center">
                      {formData.founderPhotoUrl ? (
                        <img
                          src={formData.founderPhotoUrl}
                          alt="Attorney Portrait"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-slate-500 gap-1">
                          <User className="w-7 h-7 text-slate-400" />
                          <span className="text-[9px] font-semibold text-slate-400">
                            {isAr ? 'صورتك' : 'Your Photo'}
                          </span>
                        </div>
                      )}
                    </div>

                    <input
                      ref={photoFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoFileSelect}
                      className="hidden"
                    />

                    <button
                      type="button"
                      onClick={() => photoFileInputRef.current?.click()}
                      className="absolute -bottom-1 -right-1 p-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md transition cursor-pointer"
                      title={isAr ? 'رفع صورة شخصية' : 'Upload photo'}
                    >
                      <Camera className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Controls & Presets */}
                  <div className="flex-1 space-y-2 text-center sm:text-right rtl:sm:text-right ltr:sm:text-left">
                    <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                      <button
                        type="button"
                        disabled={isProcessingPhoto}
                        onClick={() => photoFileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition shadow cursor-pointer disabled:opacity-50"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{isProcessingPhoto ? (isAr ? 'جاري المعالجة...' : 'Processing...') : (isAr ? 'رفع صورة شخصية من جهازك' : 'Upload Photo from Device')}</span>
                      </button>

                      {formData.founderPhotoUrl && (
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, founderPhotoUrl: '' }))}
                          className="px-2.5 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>{isAr ? 'إزالة' : 'Remove'}</span>
                        </button>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {isAr 
                        ? 'ارفع صورتك الرسمية لتظهر في قسم الشركاء والمحامين وواجهة الموقع كشريك إداري للمكتب.' 
                        : 'Upload your photo to be featured in the partners section and attorney profile.'}
                    </p>

                    {/* Presets */}
                    <div className="pt-1">
                      <span className="text-[10px] text-slate-400 block mb-1 font-medium">
                        {isAr ? 'أو اختر صورة رمزية احترافية جاهزة:' : 'Or select professional portrait:'}
                      </span>
                      <div className="flex items-center gap-1.5 flex-wrap justify-center sm:justify-start">
                        {LAWYER_PORTRAIT_PRESETS.map((preset) => (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, founderPhotoUrl: preset.url }))}
                            className={`relative w-8 h-8 rounded-lg overflow-hidden border-2 transition cursor-pointer ${
                              formData.founderPhotoUrl === preset.url
                                ? 'border-amber-400 scale-110 shadow-md ring-2 ring-amber-400/40'
                                : 'border-slate-700 opacity-70 hover:opacity-100 hover:border-slate-500'
                            }`}
                            title={preset.label}
                          >
                            <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                            {formData.founderPhotoUrl === preset.url && (
                              <div className="absolute inset-0 bg-amber-400/30 flex items-center justify-center text-white">
                                <Check className="w-3 h-3 stroke-[3]" />
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Phone & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-200 font-bold mb-1.5">
                    {isAr ? 'رقم الهاتف أو الواتساب الرسمي *:' : 'Phone or WhatsApp Number *:'}
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-emerald-400 absolute right-3 rtl:right-3 rtl:left-auto top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+966 50 123 4567"
                      className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-200 font-bold mb-1.5 flex items-center justify-between">
                    <span>{isAr ? 'البريد الإلكتروني الرسمي للمكتب:' : 'Official Law Firm Email:'}</span>
                    <span className="text-[10px] text-slate-400 font-normal">{isAr ? 'اختياري' : 'Optional'}</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-blue-400 absolute right-3 rtl:right-3 rtl:left-auto top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="contact@lawfirm.com"
                      className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Country & City */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-200 font-bold mb-1.5">
                    {isAr ? 'الدولة:' : 'Country:'}
                  </label>
                  <select
                    value={formData.countryAr}
                    onChange={(e) => {
                      const sel = COUNTRIES_LIST.find(c => c.ar === e.target.value);
                      setFormData({ 
                        ...formData, 
                        countryAr: e.target.value,
                        countryEn: sel?.en || 'Saudi Arabia'
                      });
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-amber-400 focus:outline-none cursor-pointer"
                  >
                    {COUNTRIES_LIST.map((c) => (
                      <option key={c.code} value={c.ar}>
                        {c.flag} {c.ar}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-200 font-bold mb-1.5">
                    {isAr ? 'المدينة:' : 'City:'}
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-amber-400 absolute right-3 rtl:right-3 rtl:left-auto top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={formData.cityAr}
                      onChange={(e) => setFormData({ ...formData, cityAr: e.target.value })}
                      placeholder={isAr ? 'الرياض / جدة / دمشق' : 'City name...'}
                      className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Brief About Firm Text */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-slate-200 font-bold">
                    {isAr ? 'نبذة تعريفية موجزة عن المكتب والخبرات:' : 'Brief About Firm Text:'}
                  </label>
                  <span className="text-[10px] text-amber-400 font-normal">
                    {isAr ? 'اختر نموذجاً جاهزاً أو اكتبه بنفسك' : 'Select a template or type custom'}
                  </span>
                </div>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      setFormData({ ...formData, aboutTextAr: e.target.value });
                    }
                  }}
                  className="w-full mb-2 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs focus:border-amber-400 focus:outline-none cursor-pointer"
                >
                  <option value="">{isAr ? '-- اختر نموذجاً جاهزاً للنبذة التعريفية (20 نموذجاً) --' : '-- Choose from 20 ready bio templates --'}</option>
                  {[
                    'نحن شركة رائدة في تقديم الخدمات القانونية والاستشارات المتخصصة والتمثيل القضائي أمام كافة المحاكم والجهات القضائية باحترافية عالية وموثوقية مطلقة.',
                    'مكتب محاماة متكامل يضم نخبة من الكفاءات القانونية المؤهلة لتقديم حلول استراتيجية ذكية لقطاع الأعمال والأفراد وحماية حقوقهم ومصالحهم.',
                    'نكرس خبراتنا القانونية الراسخة لتقديم أعلى مستويات التمثيل القضائي وصياغة العقود والاستشارات النوعية التي تضمن استقرار ونمو أعمال موكلينا.',
                    'مؤسسة قانونية معتمدة تقدم خدمات الترافع التجاري والمدني والجزائي، وتقديم الاستشارات القانونية الدقيقة وفق أعلى معايير المهنية والسرية.',
                    'نتميز بخبرة عريقة في حل النزاعات المعقدة والتحكيم التجاري وتمثيل الشركات والمؤسسات الكبرى أمام الجهات القضائية والتحكيمية.',
                    'فريق قانوني محترف يجمع بين الأصالة والعمق المعرفي في الشريعة والقانون وبين الحداثة في تقديم الحلول القانونية السريعة والفعالة.',
                    'نقدم خدمات استشارية وقانونية شاملة للشركات والناشئة والأفراد، مع التركيز على الوقاية القانونية وحماية الأصول وحل النزاعات بكفاءة عالية.',
                    'مكتب محاماة واستشارات يرتكز على قيم الأمانة والنزاهة والسرعة والإتقان في الدفاع عن حقوق الموكلين وتحقيق تطلعاتهم القانونية.',
                    'نمتلك خبرة واسعة في قضايا الشركات، الملكية الفكرية، عقود الاستثمار، والتقاضي القضائي الدولي والمحلي بمهارة واحترافية متناهية.',
                    'نسعى دائماً لتقديم حلول قانونية عملية ومبتكرة تخدم مصالح موكلينا وتحقق لهم الأمان القضائي والاستدامة في كافة تعاملاتهم.',
                    'مكتب قانوني متخصص في قضايا التجارة الدولية، الشركات المساهمة، النزاعات المصرفية، وصياغة العقود الكبرى بمهنية رفيعة المستوى.',
                    'نقدم رعاية قانونية شاملة ومتابعة دقيقة لكافة القضايا والمعاملات القانونية لعملائنا داخل الدولة وخارجها بأعلى معايير الجودة.',
                    'نحن شريككم القانوني الموثوق في اتخاذ القرارات السليمة وحماية حقوقكم ومكتسباتكم المالية والتجارية عبر استشارات دقيقة ومدروسة.',
                    'مكتب استشارات قانونية يضم خبرات قضائية متراكمة لتقديم الدعم القانوني الفوري والفعال للشركات ورجال الأعمال والأفراد.',
                    'نكرس جهودنا لتحقيق العدالة وحماية مصالح عملائنا من خلال الترافع البارع والتحليل القانوني العميق والحلول الاستراتيجية.',
                    'مكتب محاماة معتمد يقدم خدمات قانونية نوعية تشمل التأسيس، الحوكمة، تسوية النزاعات، والتمثيل القضائي أمام مختلف الدرجات القضائية.',
                    'نقدم رؤى قانونية ثاقبة وحلولاً استشارية ذكية تساعد عملاءنا على مواجهة التحديات القانونية بثقة واستقرار تام.',
                    'مؤسسة قانونية عصرية تجمع بين الاحترافية التقنية والخبرة القضائية العميقة لتوفير خدمات قانونية فائقة الجودة والموثوقية.',
                    'نضع خبرتنا الطويلة في خدمة عملائنا لضمان سلامة أعمالهم وحماية حقوقهم المدنية والتجارية وفق أحدث النظم القانونية.',
                    'مكتب محاماة رائد يلتزم بتقديم أرفع مستويات الدفاع القانوني والاستشارات الموثوقة التي تلبي طموحات واحتياجات موكلينا بكل كفاءة.'
                  ].map((tpl, i) => (
                    <option key={i} value={tpl}>النموذج ({i + 1}): {tpl.slice(0, 75)}...</option>
                  ))}
                </select>
                <textarea
                  rows={3}
                  value={formData.aboutTextAr}
                  onChange={(e) => setFormData({ ...formData, aboutTextAr: e.target.value })}
                  placeholder={isAr ? 'اكتب نبذة مختصرة عن تأسيس المكتب ومجالات تميزه أو اختر من القائمة أعلاه...' : 'Write a brief description or select from templates above...'}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
                />
              </div>

              {/* Step 2 Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition cursor-pointer"
                >
                  {isAr ? 'السابق' : 'Back'}
                </button>

                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-[#c5a869] hover:bg-[#b59859] text-slate-950 font-black text-sm flex items-center gap-2 transition cursor-pointer shadow-lg shadow-amber-500/20 active:scale-95"
                >
                  <span>{isAr ? 'متابعة لاختيار الباقة والأمان' : 'Continue to Plan & Password'}</span>
                  {isAr ? <ChevronLeft className="w-4 h-4 stroke-[3]" /> : <ChevronRight className="w-4 h-4 stroke-[3]" />}
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: PLAN SELECTION & ADMIN PASSWORD */}
          {step === 3 && (
            <form onSubmit={handleFinalSubmit} className="space-y-5">
              {/* Plan Cards */}
              <div className="space-y-2">
                <label className="block text-slate-200 font-bold">
                  {isAr ? 'اختر باقة الاشتراك المناسبة لمكتبك:' : 'Select Your Subscription Plan:'}
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {plans.map((p) => {
                    const isSelected = formData.planTier === p.tier;
                    return (
                      <div
                        key={p.tier}
                        onClick={() => setFormData({ ...formData, planTier: p.tier })}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                          isSelected
                            ? 'bg-amber-950/30 border-amber-400 shadow-lg shadow-amber-500/10 ring-1 ring-amber-400/50'
                            : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-950'
                        }`}
                      >
                        {p.isPopular && (
                          <span className="absolute -top-2.5 right-4 rtl:right-4 rtl:left-auto bg-gradient-to-r from-amber-400 to-[#c5a869] text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-full shadow">
                            {isAr ? (p.badgeAr || 'الأكثر طلباً') : (p.badgeEn || 'Popular')}
                          </span>
                        )}

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white text-xs">{p.nameAr}</span>
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              isSelected ? 'border-amber-400 bg-amber-400 text-slate-950' : 'border-slate-600'
                            }`}>
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                          </div>

                          <div className="text-[10px] text-amber-300 font-medium">
                            {p.badgeAr}
                          </div>

                          <ul className="space-y-1.5 pt-2 text-[10px] text-slate-300">
                            {p.featuresAr.slice(0, 3).map((feat, idx) => (
                              <li key={idx} className="flex items-start gap-1.5">
                                <Check className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                                <span>{feat}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">{isAr ? 'الباقة الرسمية' : 'Official Plan'}</span>
                          <span className="font-bold text-amber-300 font-mono">{formatPlanPrice(p, lang)} {formatBillingCycle(p.billingCycle, lang)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Manager Password Section */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-white font-bold">
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span>{isAr ? 'كلمة مرور لوحة تحكم المكتب (Manager Password):' : 'Firm Manager Password:'}</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {isAr 
                    ? 'ستستخدم هذه الكلمة لتسجيل الدخول إلى لوحة إدارة موقعك وتعديل النصوص، الشركاء، واستقبال استشارات الموكلين.'
                    : 'Used to log in to your executive dashboard and customize your landing page.'}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 mb-1">{isAr ? 'كلمة المرور *:' : 'Password *:'}</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={formData.adminPassword}
                        onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                        placeholder="••••••••"
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono focus:border-amber-400 focus:outline-none pr-10 rtl:pr-10 rtl:pl-3"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 rtl:right-3 rtl:left-auto top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1">{isAr ? 'تأكيد كلمة المرور:' : 'Confirm Password:'}</label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Use Template Seed Data */}
              <label className="flex items-center gap-3 p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 cursor-pointer hover:bg-slate-950 transition">
                <input
                  type="checkbox"
                  checked={formData.useTemplateData}
                  onChange={(e) => setFormData({ ...formData, useTemplateData: e.target.checked })}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 bg-slate-900 border-slate-700 cursor-pointer"
                />
                <span className="text-slate-300 text-[11px]">
                  {isAr 
                    ? 'تهيئة الموقع تلقائياً بنماذج تخصصات قانونية وقضايا نموذجية أولية (يُمكن تعديلها بالكامل لاحقاً)'
                    : 'Initialize site with default legal practice areas and template sections'}
                </span>
              </label>

              {/* Step 3 Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition cursor-pointer"
                >
                  {isAr ? 'السابق' : 'Back'}
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 via-[#d4af37] to-[#c5a869] hover:brightness-110 text-slate-950 font-black text-sm flex items-center gap-2 transition cursor-pointer shadow-xl shadow-amber-950/40 active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin text-slate-950" />
                      <span>{isAr ? 'جاري إنشاء وتدشين الموقع...' : 'Launching your website...'}</span>
                    </>
                  ) : (
                    <>
                      <Award className="w-4 h-4 text-slate-950 stroke-[3]" />
                      <span>{isAr ? 'تدشين موقع المكتب والبدء الآن' : 'Launch Law Firm Website'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 4: SUCCESS & LAUNCH SCREEN */}
          {step === 4 && createdFirm && (
            <div className="text-center space-y-6 py-4 animate-fade-in">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center mx-auto text-slate-950 font-black shadow-2xl shadow-emerald-500/30">
                <CheckCircle2 className="w-9 h-9 text-slate-950 stroke-[2.5]" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-2xl font-black text-white font-serif-title">
                  {isAr ? 'تهانينا! تم تدشين موقع مكتبك بنجاح' : 'Congratulations! Your Website is Live!'}
                </h3>
                <p className="text-xs text-[#ebd397] max-w-md mx-auto leading-relaxed">
                  {isAr 
                    ? `أصبح موقع "${createdFirm.nameAr}" جاهزاً ونشطاً لاستقبال الموكلين وطلبات الاستشارة.`
                    : `Your official website for "${createdFirm.nameAr}" is now live and ready.`}
                </p>
              </div>

              {/* Live Link Card */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/40 text-start space-y-2 max-w-lg mx-auto shadow-xl">
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold">
                  <span>{isAr ? 'رابط موقعك الرسمي المباشر:' : 'Official Live URL:'}</span>
                  <span className="text-emerald-400 flex items-center gap-1 font-mono">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    {isAr ? 'موقع نشط ومفعل' : 'Active Site'}
                  </span>
                </div>

                <div className="flex items-center gap-2 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                  <Globe className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-mono text-xs text-white truncate flex-1 font-bold">
                    {getFullSiteUrl(createdFirm.slug)}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(getFullSiteUrl(createdFirm.slug));
                      setCopiedLink(true);
                      setTimeout(() => setCopiedLink(false), 2000);
                    }}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
                    title={isAr ? 'نسخ الرابط' : 'Copy URL'}
                  >
                    {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Login Credentials Box */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 max-w-lg mx-auto text-start space-y-2">
                <div className="text-[11px] font-bold text-amber-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isAr ? 'بيانات إدارة موقعك ومتابعة الاستشارات:' : 'Control Panel Access:'}</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">{isAr ? 'البريد الإلكتروني:' : 'Email:'}</span>
                    <span className="font-mono font-bold text-white truncate block">{createdFirm.email}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">{isAr ? 'كلمة المرور:' : 'Password:'}</span>
                    <span className="font-mono font-bold text-amber-300 block">{formData.adminPassword}</span>
                  </div>
                </div>
              </div>

              {/* Direct Launch Action */}
              <div className="pt-3 max-w-lg mx-auto flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    window.location.href = `/?firm=${createdFirm.slug}`;
                  }}
                  className="w-full sm:flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-[#c5a869] hover:brightness-110 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 transition cursor-pointer active:scale-95"
                >
                  <ExternalLink className="w-4 h-4 text-slate-950 stroke-[3]" />
                  <span>{isAr ? 'الانتقال إلى موقع المكتب الآن' : 'Visit Live Website'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
