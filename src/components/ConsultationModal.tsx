import React, { useState, useEffect } from 'react';
import { X, Scale, Send, CheckCircle2, Phone, Mail } from 'lucide-react';
import confetti from 'canvas-confetti';
import { storageService } from '../services/storageService';
import { Partner, PracticeArea, Language, SiteSettings } from '../types';
import { useTranslation, getLocalized } from '../services/i18n';

interface ConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  partners: Partner[];
  practiceAreas: PracticeArea[];
  defaultPracticeId?: string;
  defaultPartnerId?: string;
  lang: Language;
  settings?: SiteSettings;
}

export const ConsultationModal: React.FC<ConsultationModalProps> = ({
  isOpen,
  onClose,
  partners,
  practiceAreas,
  defaultPracticeId,
  defaultPartnerId,
  lang,
  settings: propSettings,
}) => {
  const t = useTranslation(lang);
  const currentSettings = propSettings || storageService.getSettings();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    company: '',
    practiceId: defaultPracticeId || (practiceAreas[0]?.id || 'corporate-m-a'),
    partnerId: defaultPartnerId || '',
    preferredDate: '',
    timeSlot: 'morning',
    isUrgent: false,
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (defaultPracticeId) {
      setFormData((prev) => ({ ...prev, practiceId: defaultPracticeId }));
    }
    if (defaultPartnerId) {
      setFormData((prev) => ({ ...prev, partnerId: defaultPartnerId }));
    }
  }, [defaultPracticeId, defaultPartnerId]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const selectedPartner = partners.find(p => p.id === formData.partnerId);
      const selectedPractice = practiceAreas.find(p => p.id === formData.practiceId);

      const notes = [
        selectedPartner ? `Partner: ${selectedPartner.name}` : '',
        `Time Slot: ${formData.timeSlot}`,
        formData.message
      ].filter(Boolean).join('\n---\n');

      storageService.addMessage({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        consultationType: selectedPractice ? getLocalized(selectedPractice, 'title', lang, selectedPractice.title) : formData.practiceId,
        preferredDate: formData.preferredDate,
        isUrgent: formData.isUrgent,
        message: notes,
      });

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#c5a869', '#ffffff', '#e5cb8e', '#d4af37']
      });

      setSubmitted(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-3xl bg-[#fbf8f2] border border-[#c5a869]/50 shadow-2xl p-6 sm:p-8 max-h-[92vh] overflow-y-auto">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 left-5 rtl:left-auto rtl:right-5 p-2 rounded-xl bg-white border border-[#d8ceb8] text-[#5c5343] hover:text-[#181512] transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

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
              onClick={onClose}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#b38a38] via-[#c5a869] to-[#87641d] text-white font-bold text-sm shadow-md hover:brightness-105 transition cursor-pointer mt-4"
            >
              {lang === 'ar' ? 'تم، العودة إلى الموقع' : lang === 'tr' ? 'Tamam, Siteye Dön' : 'Done, Return to Website'}
            </button>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-[#b38a38]/15 border border-[#b38a38]/30 flex items-center justify-center">
                <Scale className="w-6 h-6 text-[#87641d]" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#87641d] uppercase tracking-wider">
                  {lang === 'ar' ? 'حجز جلسة استشارية سرية' : lang === 'tr' ? 'Gizli Hukuki Danışmanlık Randevusu' : 'Confidential Legal Session'}
                </span>
                <h3 className="text-xl sm:text-2xl font-serif-title font-bold text-[#181512]">
                  {lang === 'ar' ? 'جدولة استشارة قانونية رفيعة المستوى' : lang === 'tr' ? 'Kıdemli Avukatla Randevu Oluşturun' : 'Schedule Executive Consultation'}
                </h3>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Row: Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-[#2c261e] mb-1">
                    {t.fullName} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder={lang === 'ar' ? 'الاسم الثلاثي أو اللقب' : lang === 'tr' ? 'Adınız Soyadınız' : 'Full name'}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#d8ceb8] text-[#181512] text-xs focus:border-[#b38a38] focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2c261e] mb-1">
                    {t.phone} *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+966 5X XXX XXXX / +90 5XX XXX XX XX"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#d8ceb8] text-[#181512] text-xs focus:border-[#b38a38] focus:outline-none transition ltr"
                  />
                </div>
              </div>

              {/* Row: Email & Company */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-[#2c261e] mb-1">
                    {t.email} *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#d8ceb8] text-[#181512] text-xs focus:border-[#b38a38] focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2c261e] mb-1">
                    {t.company}
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder={lang === 'ar' ? 'اسم الشركة (اختياري)' : lang === 'tr' ? 'Şirket Adı (İsteğe bağlı)' : 'Optional'}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#d8ceb8] text-[#181512] text-xs focus:border-[#b38a38] focus:outline-none transition"
                  />
                </div>
              </div>

              {/* Row: Practice Area & Preferred Partner */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-[#2c261e] mb-1">
                    {t.practiceAreaSelect} *
                  </label>
                  <select
                    value={formData.practiceId}
                    onChange={(e) => setFormData({ ...formData, practiceId: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#d8ceb8] text-[#181512] text-xs focus:border-[#b38a38] focus:outline-none transition"
                  >
                    {practiceAreas.map((p) => (
                      <option key={p.id} value={p.id} className="bg-white text-[#181512]">
                        {getLocalized(p, 'title', lang, p.title)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2c261e] mb-1">
                    {lang === 'ar' ? 'الشريك المطلوب (اختياري)' : lang === 'tr' ? 'Görüşmek İstediğiniz Ortak (İsteğe bağlı)' : 'Specific Partner (Optional)'}
                  </label>
                  <select
                    value={formData.partnerId}
                    onChange={(e) => setFormData({ ...formData, partnerId: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#d8ceb8] text-[#181512] text-xs focus:border-[#b38a38] focus:outline-none transition"
                  >
                    <option value="" className="bg-white text-[#6b6255]">
                      {lang === 'ar' ? 'أي شريك مختص متاح' : lang === 'tr' ? 'Müsait Olan Herhangi Bir Kıdemli Ortak' : 'Any Available Senior Partner'}
                    </option>
                    {partners.map((partner) => (
                      <option key={partner.id} value={partner.id} className="bg-white text-[#181512]">
                        {getLocalized(partner, 'name', lang, partner.name)} - {getLocalized(partner, 'title', lang, partner.title)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row: Date & Time Slot */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-[#2c261e] mb-1">
                    {t.preferredDate}
                  </label>
                  <input
                    type="date"
                    value={formData.preferredDate}
                    onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#d8ceb8] text-[#181512] text-xs focus:border-[#b38a38] focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2c261e] mb-1">
                    {lang === 'ar' ? 'الفترة الزمنية المفضلة' : lang === 'tr' ? 'Tercih Edilen Zaman Aralığı' : 'Preferred Time Slot'}
                  </label>
                  <select
                    value={formData.timeSlot}
                    onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#d8ceb8] text-[#181512] text-xs focus:border-[#b38a38] focus:outline-none transition"
                  >
                    <option value="morning">
                      {lang === 'ar' ? 'الفترة الصباحية (9:00 ص - 12:00 م)' : lang === 'tr' ? 'Sabah (09:00 - 12:00)' : 'Morning (9:00 AM - 12:00 PM)'}
                    </option>
                    <option value="afternoon">
                      {lang === 'ar' ? 'فترة الظهيرة (1:00 م - 4:00 م)' : lang === 'tr' ? 'Öğleden Sonra (13:00 - 16:00)' : 'Afternoon (1:00 PM - 4:00 PM)'}
                    </option>
                    <option value="evening">
                      {lang === 'ar' ? 'الفترة المسائية (4:00 م - 7:00 م)' : lang === 'tr' ? 'Akşam (16:00 - 19:00)' : 'Evening (4:00 PM - 7:00 PM)'}
                    </option>
                  </select>
                </div>
              </div>

              {/* Urgent Toggle */}
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#f4eee2] border border-[#e6ddcc]">
                <input
                  type="checkbox"
                  id="modalUrgent"
                  checked={formData.isUrgent}
                  onChange={(e) => setFormData({ ...formData, isUrgent: e.target.checked })}
                  className="w-4 h-4 rounded text-[#b38a38] focus:ring-[#b38a38] bg-white border-[#d8ceb8] cursor-pointer"
                />
                <label htmlFor="modalUrgent" className="text-xs text-[#2c261e] cursor-pointer">
                  <span className="font-bold text-[#87641d]">{t.urgentLabel}</span>
                </label>
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-bold text-[#2c261e] mb-1">
                  {t.summaryLabel} *
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder={t.summaryPlaceholder}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#d8ceb8] text-[#181512] text-xs focus:border-[#b38a38] focus:outline-none transition resize-none"
                />
              </div>

              {/* Direct Urgent Contact Row */}
              <div className="pt-3 border-t border-[#e6ddcc] flex flex-wrap items-center justify-between gap-3 text-[11px] text-[#6b6255]">
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#b38a38]" />
                  <span>{lang === 'ar' ? 'للحالات الطارئة جداً:' : lang === 'tr' ? 'Acil durumlar için:' : 'For urgent matters:'}</span>
                  <a href={`tel:${currentSettings.emergencyPhone}`} className="text-[#181512] font-bold font-mono hover:text-[#87641d] ltr">
                    {currentSettings.emergencyPhone}
                  </a>
                </div>

                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#b38a38]" />
                  <a href={`mailto:${currentSettings.email}`} className="text-[#181512] font-medium hover:text-[#87641d]">
                    {currentSettings.email}
                  </a>
                </div>
              </div>

              {/* Buttons */}
              <div className="pt-1 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl text-[#5c5343] hover:text-[#181512] text-xs font-semibold cursor-pointer"
                >
                  {lang === 'ar' ? 'إلغاء' : lang === 'tr' ? 'İptal' : 'Cancel'}
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-7 py-3 rounded-xl bg-gradient-to-r from-[#b38a38] via-[#c5a869] to-[#87641d] text-white font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer hover:brightness-105"
                >
                  <Send className="w-3.5 h-3.5 text-white" />
                  <span>{isSubmitting ? t.submittingBtn : t.confirmBooking}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
