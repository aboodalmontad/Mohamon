import React, { useState, useEffect } from 'react';
import { 
  Send, Phone, Mail, MapPin, Clock, Shield, CheckCircle2, Building, MessageCircle, ExternalLink, Globe, Award, Sparkles, AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { storageService } from '../services/storageService';
import { SiteSettings, PracticeArea, OfficeLocation, Language } from '../types';
import { useTranslation, getLocalized } from '../services/i18n';

interface ContactSectionProps {
  settings: SiteSettings;
  practiceAreas: PracticeArea[];
  offices: OfficeLocation[];
  lang: Language;
}

export const ContactAndOfficesSection: React.FC<ContactSectionProps> = ({
  settings,
  practiceAreas,
  offices,
  lang,
}) => {
  const t = useTranslation(lang);
  const isAr = lang === 'ar';
  const isTr = lang === 'tr';

  // Initialize active office: prefer HQ, or first office, or create a virtual HQ from settings
  const hqOffice = offices.find(o => o.isHeadquarter) || offices[0];
  const [activeOffice, setActiveOffice] = useState<OfficeLocation>(hqOffice || {} as OfficeLocation);

  useEffect(() => {
    if (offices.length > 0) {
      // If no active office or current active office is HQ, ensure it stays fresh
      const currentHq = offices.find(o => o.isHeadquarter) || offices[0];
      if (!activeOffice?.id || activeOffice.isHeadquarter) {
        setActiveOffice(currentHq);
      } else {
        const found = offices.find(o => o.id === activeOffice.id);
        if (found) setActiveOffice(found);
      }
    }
  }, [offices, settings]);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    company: '',
    consultationType: 'corporate-m-a',
    preferredDate: '',
    isUrgent: false,
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      storageService.addMessage({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        consultationType: formData.consultationType,
        preferredDate: formData.preferredDate,
        isUrgent: formData.isUrgent,
        message: formData.message,
      });

      // Confetti burst
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#c5a869', '#e5cb8e', '#ffffff', '#aa8022']
      });

      setSubmitted(true);
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        company: '',
        consultationType: 'corporate-m-a',
        preferredDate: '',
        isUrgent: false,
        message: '',
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const firmName = getLocalized(settings, 'firmName', lang, settings.firmNameAr);
  const workingHours = getLocalized(settings, 'workingHours', lang, settings.workingHoursAr);
  const headquarterAddress = getLocalized(settings, 'address', lang, settings.addressAr);

  // Clean phone number for WhatsApp link
  const cleanPhoneForWhatsApp = (settings.phone || settings.emergencyPhone || '').replace(/[^0-9]/g, '');

  return (
    <section id="contact" className="py-24 bg-[#f7f2e8] relative border-t border-[#e6ddcc]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#b38a38]/12 border border-[#b38a38]/30 text-[#87641d] text-xs font-bold uppercase tracking-wider mb-4">
            <Mail className="w-3.5 h-3.5" />
            <span>{t.contactBadge}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif-title font-bold text-[#181512] tracking-tight mb-4">
            {lang === 'ar' ? (
              <>
                دعنا نبدأ في <span className="gold-gradient-text">حماية وتنمية مصالحك القانونية</span>
              </>
            ) : lang === 'tr' ? (
              <>
                Hukuki Çıkarlarınızı <span className="gold-gradient-text">Korumaya ve Güvenceye Almaya Başlayalım</span>
              </>
            ) : (
              <>
                Let Us Begin <span className="gold-gradient-text">Safeguarding Your Legal Interests</span>
              </>
            )}
          </h2>

          <p className="text-[#4b4334] text-base sm:text-lg">
            {t.contactSubtitle}
          </p>
        </div>

        {/* 4 Quick Contact Summary Cards (Direct Channels Bar) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          
          {/* Card 1: Main Direct Phone */}
          <div className="p-5 rounded-2xl bg-white border border-[#e6ddcc] shadow-md hover:shadow-lg hover:border-[#c5a869] transition flex items-start gap-3.5 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#b38a38]/15 to-[#87641d]/15 border border-[#b38a38]/30 flex items-center justify-center text-[#87641d] flex-shrink-0 group-hover:scale-105 transition">
              <Phone className="w-5 h-5 text-[#87641d]" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[11px] font-bold text-[#87641d] uppercase tracking-wider block">
                {isAr ? 'الهاتف الرئيسي المباشر' : isTr ? 'Genel Telefon Hattı' : 'Primary Direct Phone'}
              </span>
              <a 
                href={`tel:${settings.phone}`} 
                className="text-sm sm:text-base font-bold text-[#181512] hover:text-[#87641d] font-mono ltr block truncate mt-0.5"
                title={settings.phone}
              >
                {settings.phone || '+966 11 456 7890'}
              </a>
              <span className="text-[10px] text-[#6b6255] block mt-0.5">
                {isAr ? 'استقبال الاتصالات والاستفسارات' : isTr ? 'Danışma ve Bilgi Hattı' : 'Direct client inquiries'}
              </span>
            </div>
          </div>

          {/* Card 2: 24/7 Emergency Hotline */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#221d19] to-[#181512] text-white border border-[#c5a869]/40 shadow-md hover:shadow-xl transition flex items-start gap-3.5 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#c5a869]/10 rounded-full blur-xl pointer-events-none" />
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#c5a869] to-[#87641d] flex items-center justify-center text-slate-950 flex-shrink-0 group-hover:scale-105 transition shadow-md">
              <Shield className="w-5 h-5 text-slate-950" />
            </div>
            <div className="min-w-0 flex-1 relative z-10">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-[#e5cb8e] uppercase tracking-wider block">
                  {isAr ? 'خط الطوارئ 24/7' : isTr ? '7/24 Acil Hukuk Hattı' : '24/7 Emergency Hotline'}
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <a 
                href={`tel:${settings.emergencyPhone}`} 
                className="text-sm sm:text-base font-bold text-white hover:text-[#e5cb8e] font-mono ltr block truncate mt-0.5"
                title={settings.emergencyPhone}
              >
                {settings.emergencyPhone || '+966 50 123 4567'}
              </a>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                {isAr ? 'استجابة فورية للقضايا العاجلة' : isTr ? 'Kritik durumlar için anında destek' : 'Immediate high-stakes response'}
              </span>
            </div>
          </div>

          {/* Card 3: Official Email */}
          <div className="p-5 rounded-2xl bg-white border border-[#e6ddcc] shadow-md hover:shadow-lg hover:border-[#c5a869] transition flex items-start gap-3.5 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#b38a38]/15 to-[#87641d]/15 border border-[#b38a38]/30 flex items-center justify-center text-[#87641d] flex-shrink-0 group-hover:scale-105 transition">
              <Mail className="w-5 h-5 text-[#87641d]" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[11px] font-bold text-[#87641d] uppercase tracking-wider block">
                {isAr ? 'البريد الإلكتروني المعتمد' : isTr ? 'Resmi E-Posta Adresi' : 'Official Email Address'}
              </span>
              <a 
                href={`mailto:${settings.email}`} 
                className="text-xs sm:text-sm font-bold text-[#181512] hover:text-[#87641d] block truncate mt-0.5"
                title={settings.email}
              >
                {settings.email || 'info@aladllaw.com'}
              </a>
              <span className="text-[10px] text-[#6b6255] block mt-0.5">
                {isAr ? 'سرية مصرفية ومراجعة خلال ساعتين' : isTr ? 'Gizlilik protokolü ile 2 saatte yanıt' : 'Confidential review within 2 hours'}
              </span>
            </div>
          </div>

          {/* Card 4: Working & Consultation Hours */}
          <div className="p-5 rounded-2xl bg-white border border-[#e6ddcc] shadow-md hover:shadow-lg hover:border-[#c5a869] transition flex items-start gap-3.5 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#b38a38]/15 to-[#87641d]/15 border border-[#b38a38]/30 flex items-center justify-center text-[#87641d] flex-shrink-0 group-hover:scale-105 transition">
              <Clock className="w-5 h-5 text-[#87641d]" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[11px] font-bold text-[#87641d] uppercase tracking-wider block">
                {isAr ? 'ساعات استقبال المراجعين' : isTr ? 'Çalışma ve Danışma Saatleri' : 'Consultation & Working Hours'}
              </span>
              <span className="text-xs sm:text-sm font-bold text-[#181512] block mt-0.5 leading-snug">
                {workingHours || (isAr ? 'الأحد - الخميس: 8:00 ص - 6:00 م' : 'Sun - Thu: 8:00 AM - 6:00 PM')}
              </span>
              <span className="text-[10px] text-[#6b6255] block mt-0.5">
                {isAr ? 'جلسات حضورية وافتراضية عبر Zoom' : isTr ? 'Yüz yüze ve Online Görüşmeler' : 'In-person & Secure Virtual Sessions'}
              </span>
            </div>
          </div>

        </div>

        {/* Main 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column (7 cols): Consultation Form */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl bg-white p-8 sm:p-10 border border-[#c5a869]/40 shadow-xl relative font-cards-custom">
              
              {submitted ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/15 text-emerald-600 border border-emerald-500/30 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-serif-title font-bold text-[#181512]">
                    {t.successTitle}
                  </h3>
                  <p className="text-[#4b4334] text-sm max-w-md mx-auto leading-relaxed">
                    {t.successDesc}
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#b38a38] via-[#c5a869] to-[#87641d] text-white font-bold text-xs shadow-md transition cursor-pointer mt-4"
                  >
                    {t.submitAnother}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="pb-2 border-b border-[#e6ddcc] flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold font-serif-title text-[#181512]">
                        {t.formTitle}
                      </h3>
                      <p className="text-xs text-[#6b6255] mt-0.5">
                        {isAr ? 'سيتم تحويل طلبك مباشرة للشريك المختص بالقضية' : 'Directly routed to the managing partner in charge'}
                      </p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#b38a38]/15 text-[#87641d] font-bold">
                      {isAr ? 'سرية تامة' : 'Strict NDA'}
                    </span>
                  </div>

                  {/* Row 1: Name & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#2c261e] mb-1.5">
                        {t.fullName} *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder={lang === 'ar' ? 'مثال: عبد العزيز بن ناصر' : lang === 'tr' ? 'Örn: Ahmet Yılmaz' : 'e.g. Johnathan Doe'}
                        className="w-full px-4 py-3 rounded-xl bg-[#fbf8f2] border border-[#d8ceb8] text-[#181512] text-sm focus:border-[#b38a38] focus:bg-white focus:outline-none transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#2c261e] mb-1.5">
                        {t.phone} *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+966 5X XXX XXXX / +90 5XX XXX XX XX"
                        className="w-full px-4 py-3 rounded-xl bg-[#fbf8f2] border border-[#d8ceb8] text-[#181512] text-sm focus:border-[#b38a38] focus:bg-white focus:outline-none transition ltr"
                      />
                    </div>
                  </div>

                  {/* Row 2: Email & Company */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#2c261e] mb-1.5">
                        {t.email} *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="name@company.com"
                        className="w-full px-4 py-3 rounded-xl bg-[#fbf8f2] border border-[#d8ceb8] text-[#181512] text-sm focus:border-[#b38a38] focus:bg-white focus:outline-none transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#2c261e] mb-1.5">
                        {t.company}
                      </label>
                      <input
                        type="text"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        placeholder={lang === 'ar' ? 'اسم الشركة أو الكيان التجاري' : lang === 'tr' ? 'Şirket veya Kurum Adı' : 'Company or corporate entity'}
                        className="w-full px-4 py-3 rounded-xl bg-[#fbf8f2] border border-[#d8ceb8] text-[#181512] text-sm focus:border-[#b38a38] focus:bg-white focus:outline-none transition"
                      />
                    </div>
                  </div>

                  {/* Row 3: Practice Area & Preferred Date */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#2c261e] mb-1.5">
                        {t.practiceAreaSelect} *
                      </label>
                      <select
                        value={formData.consultationType}
                        onChange={(e) => setFormData({ ...formData, consultationType: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-[#fbf8f2] border border-[#d8ceb8] text-[#181512] text-sm focus:border-[#b38a38] focus:bg-white focus:outline-none transition"
                      >
                        {practiceAreas.map((p) => (
                          <option key={p.id} value={p.id} className="bg-white text-[#181512]">
                            {getLocalized(p, 'title', lang, p.title)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#2c261e] mb-1.5">
                        {t.preferredDate}
                      </label>
                      <input
                        type="date"
                        value={formData.preferredDate}
                        onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-[#fbf8f2] border border-[#d8ceb8] text-[#181512] text-sm focus:border-[#b38a38] focus:bg-white focus:outline-none transition"
                      />
                    </div>
                  </div>

                  {/* Urgent Checkbox */}
                  <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[#f4eee2] border border-[#e6ddcc]">
                    <input
                      type="checkbox"
                      id="isUrgent"
                      checked={formData.isUrgent}
                      onChange={(e) => setFormData({ ...formData, isUrgent: e.target.checked })}
                      className="w-4 h-4 rounded text-[#b38a38] focus:ring-[#b38a38] bg-white border-[#d8ceb8] cursor-pointer"
                    />
                    <label htmlFor="isUrgent" className="text-xs text-[#2c261e] cursor-pointer flex items-center gap-1.5">
                      <span className="font-bold text-[#87641d]">{t.urgentLabel}</span>
                      <span className="text-[#6b6255]">({t.urgentHint})</span>
                    </label>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-xs font-bold text-[#2c261e] mb-1.5">
                      {t.summaryLabel} *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder={t.summaryPlaceholder}
                      className="w-full px-4 py-3 rounded-xl bg-[#fbf8f2] border border-[#d8ceb8] text-[#181512] text-sm focus:border-[#b38a38] focus:bg-white focus:outline-none transition resize-none"
                    />
                  </div>

                  {/* Confidentiality Notice */}
                  <div className="flex items-center gap-2 text-[11px] text-[#6b6255]">
                    <Shield className="w-4 h-4 text-[#b38a38] flex-shrink-0" />
                    <span>{t.confidentialNotice}</span>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-[#b38a38] via-[#c5a869] to-[#87641d] text-white font-bold text-base shadow-md hover:brightness-105 active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="w-4 h-4 text-white" />
                    <span>{isSubmitting ? t.submittingBtn : t.submitBtn}</span>
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Right Column (5 cols): Headquarters Details, WhatsApp CTA, Branches & Interactive Map */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* 1. Main Official Headquarters Details Card */}
            <div className="rounded-3xl bg-white p-6 sm:p-7 border border-[#e6ddcc] shadow-xl font-cards-custom space-y-5">
              <div className="flex items-center justify-between border-b border-[#e6ddcc] pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#b38a38] to-[#87641d] text-white flex items-center justify-center font-bold shadow-sm">
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#181512]">
                      {isAr ? 'المقر الرئيسي للمكتب' : isTr ? 'Genel Merkez Bilgileri' : 'Headquarters & Main Office'}
                    </h4>
                    <span className="text-[11px] text-[#87641d] font-semibold block">
                      {firmName}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#b38a38]/15 text-[#87641d] font-bold font-mono">
                  HQ
                </span>
              </div>

              {/* Address details */}
              <div className="space-y-3.5 text-xs text-[#4b4334]">
                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#f7f2e8] border border-[#e6ddcc]">
                  <MapPin className="w-4 h-4 text-[#b38a38] flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <span className="font-bold text-[#181512] block mb-1">
                      {isAr ? 'العنوان الجغرافي المعتمد:' : isTr ? 'Resmi Adres:' : 'Official Physical Address:'}
                    </span>
                    <div className="text-[#3b352b] leading-relaxed font-medium">
                      {(() => {
                        if (headquarterAddress && headquarterAddress.includes('\n')) {
                          return headquarterAddress.split('\n').map((line, i) => (
                            <span key={i} className="block leading-relaxed">{line}</span>
                          ));
                        }
                        return <span>{headquarterAddress}</span>;
                      })()}
                    </div>
                  </div>
                </div>

                {/* Direct Communications */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-xl bg-[#f7f2e8] border border-[#e6ddcc]">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#87641d] uppercase mb-1">
                      <Phone className="w-3 h-3 text-[#b38a38]" />
                      <span>{isAr ? 'الهاتف المباشر' : 'Phone'}</span>
                    </div>
                    <a href={`tel:${settings.phone}`} className="text-xs font-bold text-[#181512] hover:text-[#87641d] font-mono ltr block truncate">
                      {settings.phone || '+966 11 456 7890'}
                    </a>
                  </div>

                  <div className="p-3 rounded-xl bg-[#f7f2e8] border border-[#e6ddcc]">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#87641d] uppercase mb-1">
                      <Shield className="w-3 h-3 text-[#b38a38]" />
                      <span>{isAr ? 'طوارئ 24/7' : 'Emergency'}</span>
                    </div>
                    <a href={`tel:${settings.emergencyPhone}`} className="text-xs font-bold text-[#181512] hover:text-[#87641d] font-mono ltr block truncate">
                      {settings.emergencyPhone || '+966 50 123 4567'}
                    </a>
                  </div>
                </div>

                {/* Email and Working Hours */}
                <div className="p-3 rounded-xl bg-[#f7f2e8] border border-[#e6ddcc] flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#87641d] uppercase mb-0.5">
                      <Mail className="w-3 h-3 text-[#b38a38]" />
                      <span>{isAr ? 'البريد الرسمي المعتمد' : 'Official Email'}</span>
                    </div>
                    <a href={`mailto:${settings.email}`} className="text-xs font-semibold text-[#181512] hover:text-[#87641d] block truncate">
                      {settings.email || 'info@aladllaw.com'}
                    </a>
                  </div>
                  <a 
                    href={`mailto:${settings.email}`} 
                    className="px-2.5 py-1.5 rounded-lg bg-[#b38a38]/15 text-[#87641d] hover:bg-[#b38a38]/25 text-[11px] font-bold transition flex-shrink-0"
                  >
                    {isAr ? 'مراسلة' : 'Send'}
                  </a>
                </div>
              </div>

              {/* Direct Quick Action Buttons (Call / WhatsApp) */}
              <div className="pt-2 grid grid-cols-2 gap-2.5">
                <a
                  href={`tel:${settings.phone || settings.emergencyPhone}`}
                  className="py-2.5 px-3 rounded-xl bg-[#181512] text-white hover:bg-[#2c261e] text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5 text-[#c5a869]" />
                  <span>{isAr ? 'اتصال هاتفي مباشر' : 'Call Now'}</span>
                </a>

                {cleanPhoneForWhatsApp ? (
                  <a
                    href={`https://wa.me/${cleanPhoneForWhatsApp}`}
                    target="_blank"
                    rel="noreferrer"
                    className="py-2.5 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-white" />
                    <span>{isAr ? 'محادثة واتساب' : 'WhatsApp'}</span>
                  </a>
                ) : (
                  <a
                    href={`mailto:${settings.email}`}
                    className="py-2.5 px-3 rounded-xl bg-[#b38a38] hover:bg-[#87641d] text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                  >
                    <Mail className="w-3.5 h-3.5 text-white" />
                    <span>{isAr ? 'إرسال بريد' : 'Email Us'}</span>
                  </a>
                )}
              </div>
            </div>

            {/* 2. Global & Regional Offices Switcher with Map Embed */}
            {offices && offices.length > 0 && (
              <div className="rounded-3xl bg-white p-6 sm:p-7 border border-[#e6ddcc] shadow-xl font-cards-custom space-y-4">
                <div className="flex items-center justify-between border-b border-[#e6ddcc] pb-3">
                  <h4 className="text-xs font-bold text-[#87641d] uppercase tracking-wider flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    <span>{t.globalOffices}</span>
                  </h4>
                  <span className="text-[10px] text-[#6b6255]">
                    {offices.length} {isAr ? 'مقار إقليمية ودولية' : 'Locations'}
                  </span>
                </div>

                {/* City buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {offices.map((office) => {
                    const cityName = getLocalized(office, 'city', lang, office.cityAr);
                    const isSelected = activeOffice?.id === office.id;
                    return (
                      <button
                        key={office.id}
                        type="button"
                        onClick={() => setActiveOffice(office)}
                        className={`py-2 px-2 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1 cursor-pointer truncate ${
                          isSelected
                            ? 'bg-gradient-to-r from-[#b38a38] to-[#87641d] text-white shadow-sm font-bold'
                            : 'bg-[#f4eee2] text-[#4b4334] hover:text-[#181512] hover:bg-[#ede4d4] border border-[#e6ddcc]'
                        }`}
                      >
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{cityName}</span>
                        {office.isHeadquarter && (
                          <span className={`text-[8px] px-1 rounded font-bold font-mono ${isSelected ? 'bg-black/30 text-white' : 'bg-[#b38a38]/20 text-[#87641d]'}`}>HQ</span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Selected Office Details if not default HQ or when exploring branches */}
                {activeOffice && (
                  <div className="p-3.5 rounded-2xl bg-[#f7f2e8] border border-[#e6ddcc] text-xs text-[#4b4334] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#181512] flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#b38a38]" />
                        <span>{getLocalized(activeOffice, 'city', lang, activeOffice.cityAr)} - {getLocalized(activeOffice, 'country', lang, activeOffice.countryAr)}</span>
                      </span>
                      {activeOffice.isHeadquarter && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#b38a38]/20 text-[#87641d] font-bold">
                          {isAr ? 'المقر الرئيسي' : 'Headquarters'}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-[#5c5343] text-[11px]">
                      {activeOffice.isHeadquarter 
                        ? headquarterAddress 
                        : getLocalized(activeOffice, 'address', lang, activeOffice.addressAr)}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] pt-1.5 border-t border-[#e6ddcc]">
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-[#b38a38]" />
                        <a href={`tel:${activeOffice.isHeadquarter ? settings.phone : activeOffice.phone}`} className="font-mono ltr text-[#181512] font-semibold hover:text-[#87641d]">
                          {activeOffice.isHeadquarter ? settings.phone : activeOffice.phone}
                        </a>
                      </div>
                      <div className="flex items-center gap-1">
                        <Mail className="w-3 h-3 text-[#b38a38]" />
                        <a href={`mailto:${activeOffice.isHeadquarter ? settings.email : activeOffice.email}`} className="text-[#181512] font-semibold hover:text-[#87641d]">
                          {activeOffice.isHeadquarter ? settings.email : activeOffice.email}
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* Embedded Google Map Iframe with Fallback */}
                {(() => {
                  const cityName = getLocalized(activeOffice, 'city', lang, activeOffice.cityAr);
                  const address = activeOffice.isHeadquarter ? headquarterAddress : getLocalized(activeOffice, 'address', lang, activeOffice.addressAr);
                  const mapQuery = encodeURIComponent(`${cityName} ${address || ''}`);
                  const embedSrc = activeOffice?.mapEmbedUrl || `https://maps.google.com/maps?q=${mapQuery}&output=embed`;
                  const externalMapUrl = activeOffice?.mapEmbedUrl || `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;

                  return (
                    <div className="space-y-2">
                      <div className="rounded-2xl overflow-hidden h-52 border border-[#e6ddcc] shadow-inner relative bg-[#f4eee2]">
                        <iframe
                          title={`Google Map - ${cityName}`}
                          src={embedSrc}
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          allowFullScreen={false}
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-[#6b6255]">
                          {isAr ? '📍 الموقع الجغرافي المعتمد عبر خرائط جوجل' : 'Verified Google Maps Location'}
                        </span>
                        <a
                          href={externalMapUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#b38a38]/15 text-[#87641d] hover:bg-[#b38a38]/25 text-xs font-bold transition"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>{isAr ? 'فتح في خرائط جوجل' : isTr ? 'Google Haritalarda Aç' : 'Open in Google Maps'}</span>
                        </a>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

          </div>
        </div>
      </div>
    </section>
  );
};
