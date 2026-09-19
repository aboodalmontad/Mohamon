import React, { useState } from 'react';
import { X, CheckCircle, ChevronRight, ChevronLeft, Building, Lock, Mail, Phone, User, Globe, LayoutTemplate, Copy, ExternalLink } from 'lucide-react';
import { Language, LawFirm } from '../types';
import { firmService } from '../services/firmService';
import { initialSiteSettings, initialPartners, initialPracticeAreas, initialTestimonials, initialBlogPosts, initialCaseStudies, initialOffices } from '../data/initialData';

const generateArabicSlug = (text: string) => {
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
  
  return result.replace(/-+/g, '-').replace(/^-|-$/g, '') || `firm-${Date.now()}`;
};

interface FirmRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const FirmRegistrationModal: React.FC<FirmRegistrationModalProps> = ({ isOpen, onClose, lang }) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [generatedSlugForView, setGeneratedSlugForView] = useState('');
  
  const [formData, setFormData] = useState({
    nameAr: '',
    email: '',
    phone: '',
    adminPassword: '',
    useTemplateData: true
  });

  const isRtl = lang === 'ar';

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 2) {
      setStep(step + 1);
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API delay
    await new Promise(r => setTimeout(r, 1500));
    
    const finalSlug = generateArabicSlug(formData.nameAr);
    setGeneratedSlugForView(finalSlug);

    // Create new firm object
    const newFirm: LawFirm = {
      id: crypto.randomUUID(),
      slug: finalSlug,
      nameAr: formData.nameAr,
      nameEn: formData.nameAr,
      email: formData.email,
      phone: formData.phone,
      logoUrl: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=200',
      adminPassword: formData.adminPassword, // Note: In production this would be hashed
      status: 'active',
      isVerified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      subscription: {
        planTier: 'professional',
        planNameAr: 'الباقة الاحترافية (تجريبي)',
        planNameEn: 'Professional (Trial)',
        status: 'trial',
        isSiteActive: true,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        annualFee: 0
      },
      data: {
        settings: {
          ...initialSiteSettings,
          firmNameAr: formData.nameAr,
          firmNameEn: formData.nameAr,
          email: formData.email,
          phone: formData.phone,
          primaryColor: '#c5a869',
        },
        partners: formData.useTemplateData ? initialPartners : [],
        practiceAreas: formData.useTemplateData ? initialPracticeAreas : [],
        caseStudies: formData.useTemplateData ? initialCaseStudies : [],
        testimonials: formData.useTemplateData ? initialTestimonials : [],
        blogPosts: formData.useTemplateData ? initialBlogPosts : [],
        offices: formData.useTemplateData ? initialOffices : [],
        messages: []
      }
    };

    // Save to service (and sync to Supabase if configured)
    await firmService.saveFirm(newFirm);
    
    setIsSubmitting(false);
    setIsSuccess(true);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6" dir={isRtl ? 'rtl' : 'ltr'}>
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative bg-[#181512] border border-white/10 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b border-white/10">
          <div>
            <h2 className="text-2xl font-serif text-[#c5a869]">تسجيل مكتب جديد</h2>
            <p className="text-white/50 text-sm mt-1">انضم إلى منصة محامون وأطلق مكتبك الرقمي</p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {isSuccess ? (
            <div className="text-center py-10">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h3 className="text-2xl font-medium text-white mb-4">تم إنشاء مكتبك بنجاح!</h3>
              <p className="text-white/60 leading-relaxed max-w-md mx-auto mb-6">
                تهانينا، لقد تم إنشاء مكتبك الرقمي وتفعيله بنجاح. 
                <br /><br />
                تم منحك <span className="text-[#c5a869] font-bold">فترة تجريبية مجانية لمدة شهر كامل</span>. 
              </p>

              <div className="bg-black/50 border border-white/10 rounded-xl p-4 mb-8 flex items-center justify-between gap-4 max-w-md mx-auto">
                <div className="overflow-hidden text-right w-full">
                  <span className="text-xs text-white/40 block mb-1">النطاق الرقمي الرسمي لمكتبك:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[#c5a869] font-mono text-base font-bold break-all" dir="ltr">
                      {generatedSlugForView}.mohamoon.sa
                    </span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                      نطاق معتمد
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/?firm=${generatedSlugForView}`);
                  }}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/60 hover:text-white shrink-0"
                  title="نسخ الرابط"
                >
                  <Copy className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button 
                  onClick={() => {
                    onClose();
                    window.location.href = `/?firm=${generatedSlugForView}`;
                  }}
                  className="bg-[#c5a869] hover:bg-[#b38a38] text-[#181512] font-medium px-6 py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-5 h-5" />
                  <span>عرض الموقع</span>
                </button>
                <button 
                  onClick={() => {
                    onClose();
                    window.location.href = `/?firm=${generatedSlugForView}&admin=true`;
                  }}
                  className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <LayoutTemplate className="w-5 h-5" />
                  <span>لوحة التحكم</span>
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Progress Steps */}
              <div className="flex items-center gap-2 mb-8">
                <div className={`flex-1 h-2 rounded-full ${step >= 1 ? 'bg-[#c5a869]' : 'bg-white/10'}`} />
                <div className={`flex-1 h-2 rounded-full ${step >= 2 ? 'bg-[#c5a869]' : 'bg-white/10'}`} />
              </div>

              {step === 1 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                  <h3 className="text-lg font-medium text-white mb-6">بيانات المكتب الأساسية</h3>
                  
                  <div>
                    <label className="block text-sm text-white/60 mb-2">اسم المكتب (بالعربية) *</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-white/40">
                        <Building className="w-5 h-5" />
                      </div>
                      <input 
                        type="text" 
                        required
                        value={formData.nameAr}
                        onChange={e => setFormData({...formData, nameAr: e.target.value})}
                        className="w-full bg-black/50 border border-white/10 text-white rounded-xl py-3 pr-11 pl-4 focus:outline-none focus:border-[#c5a869] transition-colors"
                        placeholder="مثال: مكتب النحوي للمحاماة"
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <div 
                      onClick={() => setFormData({...formData, useTemplateData: !formData.useTemplateData})}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-4 ${
                        formData.useTemplateData 
                          ? 'bg-[#c5a869]/10 border-[#c5a869] text-[#c5a869]' 
                          : 'bg-black/50 border-white/10 text-white hover:border-white/30'
                      }`}
                    >
                      <div className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                        formData.useTemplateData ? 'bg-[#c5a869] border-[#c5a869]' : 'border-white/30 bg-transparent'
                      }`}>
                        {formData.useTemplateData && <CheckCircle className="w-3.5 h-3.5 text-black" />}
                      </div>
                      <div>
                        <h4 className={`text-sm font-medium mb-1 ${formData.useTemplateData ? 'text-white' : 'text-white/80'}`}>
                          بدء بموقع جاهز ومليء بالبيانات (موصى به)
                        </h4>
                        <p className="text-xs text-white/50 leading-relaxed">
                          سيتم ملء موقعك ببيانات افتراضية احترافية باللغات الثلاث (محامين افتراضيين بخبرات عالية، مقالات، خدمات قانونية متكاملة) لتتمكن من رؤية الموقع بشكله النهائي وتعديله لاحقاً بدلاً من البدء بموقع فارغ.
                        </p>
                      </div>
                      <LayoutTemplate className={`w-8 h-8 shrink-0 opacity-20 ${formData.useTemplateData ? 'text-[#c5a869]' : 'text-white'}`} />
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                  <h3 className="text-lg font-medium text-white mb-6">بيانات الاتصال والتوثيق</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-white/60 mb-2">البريد الإلكتروني *</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-white/40">
                          <Mail className="w-5 h-5" />
                        </div>
                        <input 
                          type="email" 
                          required
                          dir="ltr"
                          value={formData.email}
                          onChange={e => setFormData({...formData, email: e.target.value})}
                          className="w-full bg-black/50 border border-white/10 text-white rounded-xl py-3 pr-11 pl-4 focus:outline-none focus:border-[#c5a869] transition-colors text-left"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-white/60 mb-2">رقم الجوال *</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-white/40">
                          <Phone className="w-5 h-5" />
                        </div>
                        <input 
                          type="tel" 
                          required
                          dir="ltr"
                          value={formData.phone}
                          onChange={e => setFormData({...formData, phone: e.target.value})}
                          className="w-full bg-black/50 border border-white/10 text-white rounded-xl py-3 pr-11 pl-4 focus:outline-none focus:border-[#c5a869] transition-colors text-left"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-white/60 mb-2">كلمة مرور مدير المكتب *</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-white/40">
                        <Lock className="w-5 h-5" />
                      </div>
                      <input 
                        type="password" 
                        required
                        value={formData.adminPassword}
                        onChange={e => setFormData({...formData, adminPassword: e.target.value})}
                        className="w-full bg-black/50 border border-white/10 text-white rounded-xl py-3 pr-11 pl-4 focus:outline-none focus:border-[#c5a869] transition-colors text-left"
                        placeholder="••••••••"
                      />
                    </div>
                    <p className="text-xs text-white/40 mt-2">ستستخدم هذه الكلمة لتسجيل الدخول للوحة تحكم مكتبك.</p>
                  </div>
                </div>
              )}

              <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    className="px-6 py-3 rounded-xl border border-white/10 text-white hover:bg-white/5 transition-colors flex items-center gap-2"
                  >
                    {isRtl ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                    <span>رجوع</span>
                  </button>
                ) : (
                  <div />
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#c5a869] hover:bg-[#b38a38] text-[#181512] px-8 py-3 rounded-xl font-medium transition-all flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-[#181512] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>{step === 1 ? 'التالي' : 'إرسال الطلب'}</span>
                      {step === 1 && (isRtl ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />)}
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
