import React, { useState } from 'react';
import { 
  Building2, Globe, Sparkles, CheckCircle2, Copy, ExternalLink, 
  ShieldCheck, Lock, Phone, Mail, MapPin, Palette, ArrowRight, ArrowLeft,
  X, Scale, Briefcase, HelpCircle, Layers
} from 'lucide-react';
import { firmService } from '../services/firmService';
import { LawFirm } from '../types';
import { COUNTRIES_LIST } from '../data/countries';

interface LawyerSiteBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'ar' | 'en' | 'tr';
  onFirmCreated?: (newFirm: LawFirm) => void;
}

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

  // Form State
  const [nameAr, setNameAr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [taglineAr, setTaglineAr] = useState('خبرة قضائية عريقة واستشارات قانونية استراتيجية متميزة');
  const [cityAr, setCityAr] = useState('الرياض');
  const [countryAr, setCountryAr] = useState('المملكة العربية السعودية');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [themeColor, setThemeColor] = useState('#c5a869');
  const [selectedPractices, setSelectedPractices] = useState<string[]>([
    'corporate', 'arbitration', 'litigation', 'realestate'
  ]);
  const [adminPassword, setAdminPassword] = useState('');

  // Result State
  const [createdFirm, setCreatedFirm] = useState<LawFirm | null>(null);
  const [landingUrl, setLandingUrl] = useState('');

  if (!isOpen) return null;

  const togglePractice = (id: string) => {
    setSelectedPractices(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleCreate = async () => {
    if (!nameAr.trim()) {
      setErrorMsg(isAr ? 'يرجى كتابة اسم المكتب القانوني بالعربية' : 'Please enter law firm name');
      setStep(1);
      return;
    }
    if (!adminPassword.trim()) {
      setErrorMsg(isAr ? 'يرجى تحديد كلمة مرور لإدارة مكتبك' : 'Please choose a manager password');
      setStep(4);
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
        phone: phone.trim() || whatsapp.trim(),
        email: email.trim(),
        licenseNumber: licenseNumber.trim(),
        adminPassword: adminPassword.trim(),
        themeColor,
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
              <div className="p-3.5 rounded-xl bg-[#c5a869]/10 border border-[#c5a869]/20 text-xs text-[#d8ceb8] flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-[#c5a869] shrink-0 mt-0.5" />
                <p>
                  {isAr 
                    ? 'ستظهر صفحة الهبوط باسم مكتبك فقط، مع شعارك، وأرقام تواصلك، بدون أي علامة تجارية أو رابط لمنصتنا.'
                    : 'Your landing page will strictly display your firm branding, phone numbers, and services with 100% white-label isolation.'}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isAr ? 'اسم المكتب القانوني (بالعربية) *' : 'Law Firm Name (Arabic) *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={isAr ? 'مثال: مكتب النحوي للمحاماة والاستشارات القانونية' : 'e.g. Al-Nahwi Law Firm'}
                  value={nameAr}
                  onChange={(e) => setNameAr(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-[#c5a869] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isAr ? 'اسم المكتب القانوني (بالإنكليزية / اللاتينية)' : 'Law Firm Name (English)'}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Al-Nahwi Legal Consultants & Attorneys"
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-[#c5a869] focus:outline-none ltr"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isAr ? 'الشعار اللفظي أو العبارة الترويجية (Slogan)' : 'Firm Tagline / Slogan'}
                </label>
                <input
                  type="text"
                  placeholder={isAr ? 'مثال: حماية حقوقكم ودعم استثماراتكم بأعلى معايير الحكمة القضائية' : 'Protecting your rights & business'}
                  value={taglineAr}
                  onChange={(e) => setTaglineAr(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-[#c5a869] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {isAr ? 'الدولة التي تعمل فيها' : 'Country'}
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

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {isAr ? 'رقم ترخيص المحاماة' : 'Bar License Number'}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 42/1892"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-[#c5a869] focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {isAr ? 'رقم الواتساب للاستشارات السريعة' : 'WhatsApp Number'}
                  </label>
                  <input
                    type="text"
                    placeholder="+966 50 000 0000"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-[#c5a869] focus:outline-none font-mono ltr text-right"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {isAr ? 'البريد الإلكتروني الرسمي' : 'Official Email'}
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
