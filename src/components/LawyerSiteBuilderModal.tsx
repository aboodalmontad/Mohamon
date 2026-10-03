import React, { useState, useRef } from 'react';
import { 
  Building2, Globe, Sparkles, CheckCircle2, Copy, ExternalLink, 
  ShieldCheck, Lock, Phone, Mail, MapPin, Palette, ArrowRight, ArrowLeft,
  X, Scale, Briefcase, HelpCircle, Layers, QrCode, Upload, User, Camera,
  Image as ImageIcon, Trash2, Check
} from 'lucide-react';
import { firmService } from '../services/firmService';
import { LawFirm } from '../types';
import { COUNTRIES_LIST } from '../data/countries';
import { FirmQRCodeCard } from './FirmQRCodeCard';
import { processImageFile } from './ImageUploader';

interface LawyerSiteBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'ar' | 'en' | 'tr';
  onFirmCreated?: (newFirm: LawFirm) => void;
}

const LAWYER_PORTRAIT_PRESETS = [
  { id: 'attorney-1', label: 'محامي تنفيذي', url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=600' },
  { id: 'attorney-2', label: 'مستشار وقور', url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=600' },
  { id: 'attorney-3', label: 'محامية شريكة', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600' },
  { id: 'attorney-4', label: 'شريك إداري', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600' },
  { id: 'attorney-5', label: 'محامي تجاري', url: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&q=80&w=600' },
];

const PRESET_PRACTICES = [
  { id: 'corporate', nameAr: 'قضايا الشركات والاستثمار التجاري', nameEn: 'Corporate & Commercial Law' },
  { id: 'arbitration', nameAr: 'التحكيم الدولي وتسوية النزاعات', nameEn: 'International Arbitration' },
  { id: 'litigation', nameAr: 'الترافع القضائي والمحاكم الكبرى', nameEn: 'Litigation & Court Defense' },
  { id: 'realestate', nameAr: 'العقارات والمشاريع والمقاولات', nameEn: 'Real Estate & Infrastructure' },
  { id: 'ip', nameAr: 'الملكية الفكرية وبراءات الاختراع', nameEn: 'Intellectual Property & Patents' },
  { id: 'labor', nameAr: 'قضايا العمل والنزاعات العمالية', nameEn: 'Labor & Employment Disputes' },
  { id: 'estates', nameAr: 'التركات وتصفية الأصول والوصايا', nameEn: 'Estate Planning & Asset Liquidation' },
  { id: 'banking', nameAr: 'التمويل الإسلامي والخدمات المصرفية', nameEn: 'Banking & Islamic Finance' },
];

const COLOR_PALETTES = [
  { id: 'gold', nameAr: 'الذهبي الملكي الفاخر (افتراضي)', nameEn: 'Royal Gold', hex: '#c5a869', bgClass: 'from-[#c5a869] to-[#87641d]' },
  { id: 'navy', nameAr: 'الأزرق الكحلي الدبلوماسي', nameEn: 'Navy Diplomatic', hex: '#1e3a8a', bgClass: 'from-[#1e3a8a] to-[#0f172a]' },
  { id: 'emerald', nameAr: 'الأخضر الزمردي الوقور', nameEn: 'Emerald Green', hex: '#047857', bgClass: 'from-[#047857] to-[#064e3b]' },
  { id: 'charcoal', nameAr: 'الأسود والرمادي الوقار', nameEn: 'Obsidian Prestige', hex: '#334155', bgClass: 'from-[#334155] to-[#0f172a]' },
];

export const LawyerSiteBuilderModal: React.FC<LawyerSiteBuilderModalProps> = ({
  isOpen,
  onClose,
  lang,
  onFirmCreated,
}) => {
  const isAr = lang === 'ar';
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [useTemplateData, setUseTemplateData] = useState(true);

  // Form State
  const [nameAr, setNameAr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [founderName, setFounderName] = useState('');
  const [founderTitle, setFounderTitle] = useState('المحامي المؤسس والشريك الإداري العام');
  const [founderPhotoUrl, setFounderPhotoUrl] = useState('');
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);
  const photoFileInputRef = useRef<HTMLInputElement>(null);

  const [taglineAr, setTaglineAr] = useState('خبرة قضائية عريقة واستشارات قانونية استراتيجية متميزة');
  const [cityAr, setCityAr] = useState('الرياض');
  const [countryAr, setCountryAr] = useState('المملكة العربية السعودية');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [themeColor, setThemeColor] = useState('#c5a869');
  const [selectedPractices, setSelectedPractices] = useState<string[]>([
    'corporate', 'arbitration', 'litigation', 'realestate'
  ]);
  const [adminPassword, setAdminPassword] = useState('');

  // Result State
  const [createdFirm, setCreatedFirm] = useState<LawFirm | null>(null);
  const [landingUrl, setLandingUrl] = useState('');

  if (!isOpen) return null;

  const handlePhotoFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsProcessingPhoto(true);
      setErrorMsg('');
      const processed = await processImageFile(file, 600, 600, 0.8);
      setFounderPhotoUrl(processed);
    } catch (err: any) {
      setErrorMsg(err.message || (isAr ? 'فشل معالجة الصورة، يرجى اختيار ملف صورة صالح' : 'Failed to process image'));
    } finally {
      setIsProcessingPhoto(false);
    }
  };

  const togglePractice = (id: string) => {
    setSelectedPractices(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleCreate = async () => {
    if (!nameAr.trim()) {
      setErrorMsg(isAr ? 'يرجى كتابة اسم المكتب أو المحامي بالعربية' : 'Please enter law firm or lawyer name');
      setStep(1);
      return;
    }
    const finalPhone = (phone || whatsapp).trim();
    if (!finalPhone) {
      setErrorMsg(isAr ? 'يرجى إدخال رقم الهاتف أو الواتساب للتواصل' : 'Please enter phone or WhatsApp number');
      setStep(1);
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const selectedCountryObj = COUNTRIES_LIST.find(c => c.ar === countryAr) || { ar: 'المملكة العربية السعودية', en: 'Saudi Arabia' };
      const res = await firmService.createFirm({
        nameAr: nameAr.trim(),
        nameEn: nameEn.trim() || 'Law Firm & Counsel',
        taglineAr: taglineAr.trim(),
        cityAr: cityAr.trim(),
        countryAr: selectedCountryObj.ar,
        countryEn: selectedCountryObj.en,
        phone: finalPhone,
        email: email.trim(),
        adminPassword: adminPassword.trim() || '123456',
        themeColor,
        populateTemplateData: useTemplateData,
        founderName: (founderName || nameAr).trim(),
        founderTitle: founderTitle.trim(),
        founderPhotoUrl: founderPhotoUrl.trim(),
      });

      if (res.success && res.firm) {
        setCreatedFirm(res.firm);
        const origin = window.location.origin + window.location.pathname;
        const generatedLanding = `${origin}?firm=${res.firm.slug}`;
        setLandingUrl(generatedLanding);
        setStep(5);
        if (onFirmCreated) {
          onFirmCreated(res.firm);
        }
      } else {
        setErrorMsg(res.message || 'فشل إنشاء الموقع، يرجى المحاولة ثانية');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'حدث خطأ أثناء الإنشاء');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyLandingLink = () => {
    navigator.clipboard.writeText(landingUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div 
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl text-slate-100 overflow-hidden my-6"
        dir={isAr ? 'rtl' : 'ltr'}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#c5a869] to-[#87641d] flex items-center justify-center text-slate-950 font-bold shadow-lg">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-serif-title text-white flex items-center gap-2">
                <span>{isAr ? 'منشئ صفحة هبوط المكتب القانوني المستقلة' : 'Lawyer Landing Page Builder'}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  White-Label
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {isAr 
                  ? 'ابنِ صفحة هبوط فاخرة لمكتبك في دقائق تظهر كصفحة رسمية خاصة بك 100%' 
                  : 'Launch a 100% white-label standalone legal landing page for your firm'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar Steps (If not finished) */}
        {step < 5 && (
          <div className="bg-slate-950 px-6 py-3 border-b border-slate-800/80 flex items-center justify-between text-xs">
            {[
              { num: 1, label: isAr ? 'بيانات المكتب' : 'Firm Info' },
              { num: 2, label: isAr ? 'الهوية والألوان' : 'Branding' },
              { num: 3, label: isAr ? 'الاختصاصات' : 'Practices' },
              { num: 4, label: isAr ? 'حساب الإدارة' : 'Manager Access' },
            ].map((st) => (
              <div 
                key={st.num}
                onClick={() => step > st.num && setStep(st.num as any)}
                className={`flex items-center gap-2 cursor-pointer transition ${
                  step === st.num 
                    ? 'text-[#c5a869] font-bold' 
                    : step > st.num 
                    ? 'text-emerald-400' 
                    : 'text-slate-500'
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                  step === st.num 
                    ? 'bg-[#c5a869] text-slate-950' 
                    : step > st.num 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {st.num}
                </div>
                <span className="hidden sm:inline">{st.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Error notification */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
            <span>{errorMsg}</span>
            <button onClick={() => setErrorMsg('')} className="text-rose-400 font-bold">&times;</button>
          </div>
        )}

        {/* Form Body */}
        <div className="p-6">
          {/* STEP 1: Basic Firm Info */}
          {step === 1 && (
            <div className="space-y-4">
              {/* Template Choice Selector */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#c5a869]/15 via-amber-500/10 to-slate-950 border border-[#c5a869]/40 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#c5a869]" />
                    <span className="text-xs font-bold text-white">
                      {isAr ? 'نوع محتوى المكتب عند التدشين:' : 'Firm Content Template:'}
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                    {isAr ? 'موصى به للمحامي' : 'Recommended'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-0.5">
                  <div 
                    onClick={() => setUseTemplateData(true)}
                    className={`p-3 rounded-xl border cursor-pointer transition flex items-start gap-2.5 ${
                      useTemplateData 
                        ? 'border-[#c5a869] bg-slate-950 shadow-md ring-1 ring-[#c5a869]/50' 
                        : 'border-slate-800 bg-slate-950/40 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <input
                      type="radio"
                      name="templateMode"
                      checked={useTemplateData}
                      onChange={() => setUseTemplateData(true)}
                      className="mt-1 text-[#c5a869] focus:ring-[#c5a869] cursor-pointer"
                    />
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>{isAr ? 'مكتب مكتمل مليء بالبيانات' : 'Complete Populated Firm'}</span>
                        {useTemplateData && <CheckCircle2 className="w-3.5 h-3.5 text-[#c5a869]" />}
                      </div>
                      <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                        {isAr 
                          ? 'فقط ضع اسمك ورقم هاتفك، والمنصة تنشئ لك فوراً موقعاً متكاملاً (شركاء، تخصصات، قضايا، شهادات، ومقالات) جاهزاً وقابلاً للتعديل بالكامل من لوحة التحكم.'
                          : 'Enter your name & phone only. Launches with complete partners, practices, precedents, testimonials & blog posts.'}
                      </p>
                    </div>
                  </div>

                  <div 
                    onClick={() => setUseTemplateData(false)}
                    className={`p-3 rounded-xl border cursor-pointer transition flex items-start gap-2.5 ${
                      !useTemplateData 
                        ? 'border-[#c5a869] bg-slate-950 shadow-md ring-1 ring-[#c5a869]/50' 
                        : 'border-slate-800 bg-slate-950/40 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <input
                      type="radio"
                      name="templateMode"
                      checked={!useTemplateData}
                      onChange={() => setUseTemplateData(false)}
                      className="mt-1 text-[#c5a869] focus:ring-[#c5a869] cursor-pointer"
                    />
                    <div>
                      <div className="text-xs font-bold text-white">
                        {isAr ? 'مكتب فارغ (البدء من الصفر)' : 'Blank Empty Firm'}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                        {isAr 
                          ? 'صفحة بيضاء بدون أي محتوى مسبق لتقوم بكتابة كل قسم وتخصص يدوياً من البداية.'
                          : 'A blank canvas with empty sections to build custom content manually from scratch.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isAr ? 'اسم المكتب القانوني أو المحامي (بالعربية) *' : 'Law Firm / Attorney Name (Arabic) *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={isAr ? 'مثال: مكتب النحوي للمحاماة والاستشارات القانونية' : 'e.g. Al-Nahwi Law Firm'}
                  value={nameAr}
                  onChange={(e) => {
                    setNameAr(e.target.value);
                    if (!founderName) setFounderName(e.target.value);
                  }}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-[#c5a869] focus:outline-none"
                />
              </div>

              {/* Founder Lawyer Profile & Personal Photo Section */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-[#c5a869]/30 space-y-3.5 shadow-inner">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-[#c5a869]" />
                    <span className="text-xs font-bold text-white">
                      {isAr ? 'بيانات وصورة المحامي المسؤول (ستظهر في الموقع):' : 'Managing Attorney Profile & Photo:'}
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#c5a869]/20 text-[#ebd397] font-semibold">
                    {isAr ? 'ملف المحامي' : 'Attorney Profile'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      {isAr ? 'اسم المحامي المسؤول / المؤسس:' : 'Attorney / Founder Name:'}
                    </label>
                    <input
                      type="text"
                      placeholder={isAr ? 'مثال: المحامي أحمد بن عبد الله النحوي' : 'e.g. Adv. Ahmad Al-Nahwi'}
                      value={founderName}
                      onChange={(e) => setFounderName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-[#c5a869] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      {isAr ? 'المسمى والصفة القانونية:' : 'Professional Title:'}
                    </label>
                    <input
                      type="text"
                      placeholder={isAr ? 'المحامي المؤسس والشريك الإداري العام' : 'Founding & Senior Managing Partner'}
                      value={founderTitle}
                      onChange={(e) => setFounderTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-[#c5a869] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Personal Photo Upload Box */}
                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    {/* Avatar Preview */}
                    <div className="relative group shrink-0">
                      <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-950 border-2 border-[#c5a869]/60 shadow-lg flex items-center justify-center">
                        {founderPhotoUrl ? (
                          <img
                            src={founderPhotoUrl}
                            alt="Lawyer Portrait"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-slate-500 gap-1">
                            <User className="w-8 h-8 text-slate-400" />
                            <span className="text-[9px] font-semibold text-slate-400">
                              {isAr ? 'صورتك' : 'Your Photo'}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Hidden File Input */}
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
                        className="absolute -bottom-1.5 -right-1.5 p-1.5 rounded-xl bg-[#c5a869] hover:bg-[#b59859] text-slate-950 shadow-md transition cursor-pointer"
                        title={isAr ? 'رفع صورة شخصية' : 'Upload photo'}
                      >
                        <Camera className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Upload Controls & Presets */}
                    <div className="flex-1 space-y-2 text-center sm:text-right rtl:sm:text-right ltr:sm:text-left">
                      <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                        <button
                          type="button"
                          disabled={isProcessingPhoto}
                          onClick={() => photoFileInputRef.current?.click()}
                          className="px-3 py-1.5 rounded-lg bg-[#c5a869] hover:bg-[#b59859] text-slate-950 font-bold text-xs flex items-center gap-1.5 transition shadow cursor-pointer disabled:opacity-50"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>{isProcessingPhoto ? (isAr ? 'جاري المعالجة...' : 'Processing...') : (isAr ? 'رفع صورة شخصية من جهازك' : 'Upload Photo from Device')}</span>
                        </button>

                        {founderPhotoUrl && (
                          <button
                            type="button"
                            onClick={() => setFounderPhotoUrl('')}
                            className="px-2.5 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>{isAr ? 'إزالة' : 'Remove'}</span>
                          </button>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {isAr 
                          ? 'ارفع صورتك الرسمية لتظهر في صفحة تعريف المكتب وقسم الشركاء والمحامين كصورة رسمية للمحامي المسؤول.' 
                          : 'Upload your professional headshot to be featured in the managing partner profile & hero section.'}
                      </p>

                      {/* Curated Presets Selection */}
                      <div className="pt-1">
                        <span className="text-[10px] text-slate-400 block mb-1.5 font-medium">
                          {isAr ? 'أو اختر من الصور الرمزية المهنية الجاهزة:' : 'Or choose from attorney presets:'}
                        </span>
                        <div className="flex items-center gap-1.5 flex-wrap justify-center sm:justify-start">
                          {LAWYER_PORTRAIT_PRESETS.map((preset) => (
                            <button
                              key={preset.id}
                              type="button"
                              onClick={() => setFounderPhotoUrl(preset.url)}
                              className={`relative w-8 h-8 rounded-lg overflow-hidden border-2 transition cursor-pointer ${
                                founderPhotoUrl === preset.url
                                  ? 'border-[#c5a869] scale-110 shadow-md ring-2 ring-[#c5a869]/40'
                                  : 'border-slate-700 opacity-70 hover:opacity-100 hover:border-slate-500'
                              }`}
                              title={preset.label}
                            >
                              <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                              {founderPhotoUrl === preset.url && (
                                <div className="absolute inset-0 bg-[#c5a869]/30 flex items-center justify-center text-white">
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
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {isAr ? 'رقم الهاتف أو الواتساب للتواصل *' : 'Phone / WhatsApp Number *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="+966 50 000 0000"
                    value={phone || whatsapp}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      setWhatsapp(e.target.value);
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-[#c5a869] focus:outline-none font-mono ltr text-right"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {isAr ? 'البريد الإلكتروني الرسمي (اختياري)' : 'Official Email (Optional)'}
                  </label>
                  <input
                    type="email"
                    placeholder="contact@lawfirm.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-[#c5a869] focus:outline-none font-mono ltr text-right"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {isAr ? 'الدولة' : 'Country'}
                  </label>
                  <select
                    value={countryAr}
                    onChange={(e) => setCountryAr(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-[#c5a869] focus:outline-none"
                  >
                    {COUNTRIES_LIST.map((c) => (
                      <option key={c.ar} value={c.ar}>{c.ar}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {isAr ? 'المدينة' : 'City'}
                  </label>
                  <input
                    type="text"
                    placeholder={isAr ? 'الرياض / دبي / القاهرة' : 'Riyadh / Dubai'}
                    value={cityAr}
                    onChange={(e) => setCityAr(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-[#c5a869] focus:outline-none"
                  />
                </div>
              </div>

              {/* Fast 1-Click Launch Action inside Step 1 */}
              <div className="pt-2 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#c5a869]" />
                    <span>{isAr ? 'تدشين فوري بنقرة واحدة:' : 'Instant 1-Click Launch:'}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {isAr ? 'يكفي كتابة الاسم ورقم الهاتف فقط لتدشين موقع مكتبي فوراً بكافة البيانات' : 'Name & phone are enough to launch live site immediately'}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={isSubmitting || !nameAr.trim() || !(phone.trim() || whatsapp.trim())}
                  onClick={handleCreate}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#c5a869] to-[#87641d] hover:brightness-110 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg cursor-pointer disabled:opacity-50 whitespace-nowrap"
                >
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span>{isSubmitting ? (isAr ? 'جاري التدشين...' : 'Launching...') : (isAr ? 'تدشين المكتب فوراً بكافة البيانات' : 'Launch Live Site Now')}</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Branding & Colors */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  {isAr ? 'اختر اللون والهوية الملكية لصفحة مكتبك:' : 'Select Visual Theme & Accent Color:'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {COLOR_PALETTES.map((pal) => (
                    <div
                      key={pal.id}
                      onClick={() => setThemeColor(pal.hex)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                        themeColor === pal.hex
                          ? 'border-[#c5a869] bg-slate-800/80 shadow-md ring-1 ring-[#c5a869]'
                          : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-7 h-7 rounded-lg shadow"
                          style={{ backgroundColor: pal.hex }}
                        />
                        <div>
                          <div className="text-xs font-bold text-white">
                            {isAr ? pal.nameAr : pal.nameEn}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {pal.hex}
                          </div>
                        </div>
                      </div>
                      {themeColor === pal.hex && (
                        <CheckCircle2 className="w-4 h-4 text-[#c5a869]" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
                <div className="font-bold text-slate-300 flex items-center gap-1.5">
                  <Palette className="w-4 h-4 text-[#c5a869]" />
                  <span>{isAr ? 'تخصيص كامل بعد النشر' : 'Full Post-Launch Customization'}</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  {isAr 
                    ? 'بعد إطلاق صفحة الهبوط، ستتمكن عبر لوحة تحكم مكتبك من رفع شعارك الخاص بجودة عالية، وتغيير صور الخلفية، وتعديل الخطوط بما يتوافق بدقة مع هويتك البصرية.'
                    : 'You can upload your HD logo, change cover images, and adjust typography freely from your manager dashboard.'}
                </p>
              </div>
            </div>
          )}

          {/* STEP 3: Practice Areas */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isAr ? 'حدد الاختصاصات القانونية التي يقدمها مكتبك:' : 'Select Your Core Practice Areas:'}
                </label>
                <p className="text-[11px] text-slate-400 mb-3">
                  {isAr ? 'اختر المجالات التي ترغب بظهورها في صفحة الهبوط (يمكنك إضافة مجالات أخرى لاحقاً):' : 'Click to toggle areas included on your landing page:'}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {PRESET_PRACTICES.map((pr) => {
                    const isSelected = selectedPractices.includes(pr.id);
                    return (
                      <div
                        key={pr.id}
                        onClick={() => togglePractice(pr.id)}
                        className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between text-xs ${
                          isSelected
                            ? 'border-emerald-500/60 bg-emerald-950/20 text-white font-medium'
                            : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Briefcase className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-400' : 'text-slate-500'}`} />
                          <span>{isAr ? pr.nameAr : pr.nameEn}</span>
                        </div>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Manager Password & Security */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                <div className="font-bold text-white flex items-center gap-2 mb-1">
                  <ShieldCheck className="w-4 h-4 text-[#c5a869]" />
                  <span>{isAr ? 'حساب الإدارة المستقل لمكتبك' : 'Your Isolated Manager Account'}</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  {isAr 
                    ? 'أنشئ كلمة مرور خاصة بك كمدير للمكتب، لتتمكن في أي وقت من تسجيل الدخول إلى لوحة التحكم الخاصة بمكتبك فقط وتعديل المحتوى والاطلاع على الاستشارات الواردة.'
                    : 'Set a private manager password to access and update your legal landing page, attorneys, and received inquiries.'}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isAr ? 'كلمة المرور الخاصة بمدير المكتب *' : 'Firm Manager Password *'}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute right-3 top-3 text-slate-400 rtl:right-3 rtl:left-auto" />
                  <input
                    type="text"
                    required
                    placeholder={isAr ? 'مثال: NahwiPass@2026 أو رمز سري تختاره' : 'Enter your private password'}
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-[#c5a869] focus:outline-none font-mono"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  {isAr ? 'احتفظ بهذه الكلمة لتسجيل الدخول إلى لوحة إدارة مكتبك مستقبلاً.' : 'Save this password to log in and manage your site.'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{isAr ? 'صفحتك ستكون جاهزة وفورية للنشر بنقرة واحدة!' : 'Ready for 1-click launch with immediate live URL!'}</span>
              </div>
            </div>
          )}

          {/* STEP 5: SUCCESS SCREEN & STANDALONE URL */}
          {step === 5 && createdFirm && (
            <div className="space-y-6 py-2">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-lg">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold font-serif-title text-white">
                  {isAr ? 'تهانينا! تم تدشين موقع مكتبك القانوني بنجاح' : 'Congratulations! Your Legal Site is Live'}
                </h3>
                <p className="text-xs text-slate-300 max-w-md mx-auto">
                  {isAr 
                    ? `أصبح لمكتب "${createdFirm.nameAr}" صفحة هبوط رسمية ومستقلة تماماً بدون أي إشارة لمنصتنا.` 
                    : `Your legal practice is now live with an isolated white-label landing page.`}
                </p>
              </div>

              {/* Standalone URL Card */}
              <div className="p-4 rounded-xl bg-slate-950 border border-[#c5a869]/40 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#c5a869] flex items-center gap-1.5">
                    <Globe className="w-4 h-4" />
                    <span>{isAr ? 'رابط صفحة الهبوط المستقلة لمكتبك:' : 'Your Standalone Landing Page URL:'}</span>
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-semibold">
                    {isAr ? 'نشط الآن' : 'Active Live'}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-700/80 text-xs font-mono text-emerald-300 break-all select-all flex items-center justify-between gap-2">
                  <span>{landingUrl}</span>
                  <button
                    onClick={copyLandingLink}
                    className="p-1.5 rounded-md bg-slate-800 hover:bg-[#c5a869] hover:text-slate-950 text-slate-300 transition shrink-0 cursor-pointer"
                    title={isAr ? 'نسخ الرابط' : 'Copy link'}
                  >
                    {copiedLink ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <a
                    href={landingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2.5 px-4 rounded-xl bg-[#c5a869] text-slate-950 font-bold text-xs flex items-center justify-center gap-2 hover:brightness-110 transition shadow cursor-pointer text-center"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>{isAr ? 'زيارة صفحة هبوط مكتبي المستقلة' : 'Open My Landing Page'}</span>
                  </a>

                  <button
                    onClick={copyLandingLink}
                    className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <Copy className="w-4 h-4 text-[#c5a869]" />
                    <span>{copiedLink ? (isAr ? 'تم النسخ!' : 'Copied!') : (isAr ? 'نسخ الرابط' : 'Copy')}</span>
                  </button>
                </div>
              </div>

              {/* QR Code / Barcode Card for sharing & printing */}
              <div className="space-y-2">
                <FirmQRCodeCard
                  firmName={createdFirm.nameAr}
                  firmSlug={createdFirm.slug}
                  tagline={createdFirm.data?.settings?.sloganAr || isAr ? 'امسح الباركود للوصول الفوري للمكتب' : 'Scan to open office'}
                  themeColor="#c5a869"
                  lang={lang}
                />
              </div>

              {/* Login info recap */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-[#c5a869]" />
                  <span>{isAr ? 'بيانات إدارة مكتبك:' : 'Manager Credentials:'}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-300 font-mono text-[11px] pt-1">
                  <div>
                    <span className="text-slate-500 block">{isAr ? 'المكتب:' : 'Firm Slug:'}</span>
                    <span className="text-white font-bold">{createdFirm.slug}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">{isAr ? 'كلمة المرور:' : 'Password:'}</span>
                    <span className="text-[#c5a869] font-bold">{adminPassword}</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                  {isAr 
                    ? 'يمكنك دائماً الضغط على أيقونة القفل في أسفل صفحة مكتبك لتعديل المحتوى وإضافة شركائك ومقالاتك.'
                    : 'Click the lock icon in your site footer to enter your manager portal.'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Buttons */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          {step < 5 ? (
            <>
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep((step - 1) as any)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition cursor-pointer"
                >
                  <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                  <span>{isAr ? 'السابق' : 'Back'}</span>
                </button>
              ) : (
                <div />
              )}

              {step < 4 ? (
                <button
                  type="button"
                  onClick={() => {
                    if (step === 1 && !nameAr.trim()) {
                      setErrorMsg(isAr ? 'يرجى إدخال اسم المكتب القانوني' : 'Firm name required');
                      return;
                    }
                    setErrorMsg('');
                    setStep((step + 1) as any);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#c5a869] text-slate-950 font-bold text-xs flex items-center gap-2 hover:brightness-110 transition shadow cursor-pointer"
                >
                  <span>{isAr ? 'التالي' : 'Next'}</span>
                  <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleCreate}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#c5a869] to-[#87641d] text-slate-950 font-bold text-xs flex items-center gap-2 hover:brightness-110 transition shadow-lg cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isSubmitting ? (isAr ? 'جاري التدشين...' : 'Launching...') : (isAr ? 'نشر وتدشين موقع مكتبي فوراً' : 'Launch My Firm Site Now')}</span>
                </button>
              )}
            </>
          ) : (
            <div className="w-full flex items-center justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition cursor-pointer"
              >
                {isAr ? 'إغلاق المعالج' : 'Done'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LawyerSiteBuilderModal;

