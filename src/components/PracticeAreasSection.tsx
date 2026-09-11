import React, { useState } from 'react';
import { 
  Building2, Scale, Gavel, ShieldCheck, Briefcase, Landmark, 
  ArrowLeft, ArrowRight, CheckCircle2, X 
} from 'lucide-react';
import { PracticeArea, Partner, Language } from '../types';
import { useTranslation, getLocalized } from '../services/i18n';

interface PracticeAreasSectionProps {
  practiceAreas: PracticeArea[];
  partners: Partner[];
  lang: Language;
  onOpenConsultation: (practiceId?: string, partnerId?: string) => void;
}

export const PracticeAreasSection: React.FC<PracticeAreasSectionProps> = ({
  practiceAreas,
  partners,
  lang,
  onOpenConsultation
}) => {
  const isRtl = lang === 'ar';
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;
  const t = useTranslation(lang);

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedPractice, setSelectedPractice] = useState<PracticeArea | null>(null);

  const knownCategoryLabels: Record<string, { ar: string; en: string; tr: string }> = {
    corporate: { ar: 'الشركات والاستحواذ', en: 'Corporate & M&A', tr: 'Şirketler & M&A' },
    disputes: { ar: 'التحكيم والتقاضي', en: 'Disputes & Arbitration', tr: 'Tahkim & Dava' },
    technology: { ar: 'التقنية والملكية الفكرية', en: 'Tech & IP', tr: 'Teknoloji & Fikri Mülkiyet' },
    finance: { ar: 'التمويل والمصرفية', en: 'Banking & Finance', tr: 'Bankacılık & Finans' },
    realestate: { ar: 'العقارات والإنشاءات', en: 'Real Estate & Projects', tr: 'Gayrimenkul & İnşaat' },
    labor: { ar: 'قانون العمل والتوظيف', en: 'Labor & Employment', tr: 'İş Hukuku' },
    tax: { ar: 'الضرائب والجمارك', en: 'Tax & Customs', tr: 'Vergi & Gümrük' },
    criminal: { ar: 'الجرائم الاقتصادية', en: 'Corporate Crimes', tr: 'Ekonomik Suçlar' },
    international: { ar: 'القانون الدولي', en: 'International Law', tr: 'Uluslararası Hukuk' },
    general: { ar: 'استشارات قانونية عامة', en: 'General Advisory', tr: 'Genel Hukuki Danışmanlık' },
  };

  const getCategoryName = (catKey: string, match?: PracticeArea) => {
    if (catKey === 'all') return t.allAreas;
    if (match) {
      if (lang === 'tr') return match.categoryLabelTr || match.categoryLabelEn || knownCategoryLabels[catKey]?.tr || catKey;
      if (lang === 'en') return match.categoryLabelEn || knownCategoryLabels[catKey]?.en || catKey;
      return match.categoryLabelAr || knownCategoryLabels[catKey]?.ar || catKey;
    }
    const known = knownCategoryLabels[catKey];
    if (known) {
      return lang === 'tr' ? known.tr : lang === 'en' ? known.en : known.ar;
    }
    return catKey;
  };

  // Derive categories dynamically from available practice areas
  const uniqueCategoryKeys: string[] = Array.from(new Set(practiceAreas.map(p => p.category).filter(Boolean)));
  
  const categories = [
    { id: 'all', label: t.allAreas },
    ...uniqueCategoryKeys.map((catKey: string) => {
      const match = practiceAreas.find(p => p.category === catKey);
      return {
        id: catKey,
        label: getCategoryName(catKey, match)
      };
    })
  ];

  const filteredPractices = activeCategory === 'all'
    ? practiceAreas
    : practiceAreas.filter(p => p.category === activeCategory);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Building2': return <Building2 className="w-6 h-6 text-[#c5a869]" />;
      case 'Scale': return <Scale className="w-6 h-6 text-[#c5a869]" />;
      case 'Gavel': return <Gavel className="w-6 h-6 text-[#c5a869]" />;
      case 'ShieldCheck': return <ShieldCheck className="w-6 h-6 text-[#c5a869]" />;
      case 'Briefcase': return <Briefcase className="w-6 h-6 text-[#c5a869]" />;
      case 'Landmark': return <Landmark className="w-6 h-6 text-[#c5a869]" />;
      default: return <Scale className="w-6 h-6 text-[#c5a869]" />;
    }
  };

  const getServicesList = (practice: PracticeArea): string[] => {
    if (lang === 'tr') {
      return (practice.keyServicesTr && practice.keyServicesTr.length > 0)
        ? practice.keyServicesTr
        : practice.keyServicesEn || practice.keyServices || [];
    }
    if (lang === 'en') {
      return (practice.keyServicesEn && practice.keyServicesEn.length > 0)
        ? practice.keyServicesEn
        : practice.keyServices || [];
    }
    return practice.keyServices || [];
  };

  return (
    <section id="practice-areas" className="py-24 bg-[#fbf8f2] relative border-t border-[#e6ddcc]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#b38a38]/12 border border-[#b38a38]/30 text-[#87641d] text-xs font-bold uppercase tracking-wider mb-4">
            <Scale className="w-3.5 h-3.5" />
            <span>{t.practiceBadge}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif-title font-bold text-[#181512] tracking-tight mb-4">
            {lang === 'ar' ? (
              <>
                حلول قانونية متكاملة تواكب <span className="gold-gradient-text">طموحات الشركات والمستثمرين</span>
              </>
            ) : lang === 'tr' ? (
              <>
                Şirketlerin ve Yatırımcıların Hedeflerine Uygun <span className="gold-gradient-text">Entegre Hukuki Çözümler</span>
              </>
            ) : (
              <>
                Comprehensive Legal Solutions for <span className="gold-gradient-text">Leading Enterprises & Investors</span>
              </>
            )}
          </h2>

          <p className="text-[#4b4334] text-base sm:text-lg">
            {t.practiceSubtitle}
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-12">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition duration-200 cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-gradient-to-r from-[#b38a38] to-[#87641d] text-white font-bold shadow-md'
                  : 'bg-white text-[#4b4334] hover:text-[#181512] border border-[#d8ceb8] hover:border-[#b38a38]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Practice Areas Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {filteredPractices.map(practice => {
            const title = getLocalized(practice, 'title', lang, practice.title);
            const shortDesc = getLocalized(practice, 'shortDesc', lang, practice.shortDesc);
            const categoryLabel = getCategoryName(practice.category, practice);
            const services = getServicesList(practice);

            return (
              <div
                key={practice.id}
                className="group relative rounded-2xl bg-white p-7 border border-[#e6ddcc] hover:border-[#b38a38] transition-all duration-300 flex flex-col justify-between hover:-translate-y-1.5 shadow-md hover:shadow-xl font-cards-custom"
              >
                {/* Background image subtle preview */}
                <div className="absolute inset-0 rounded-2xl overflow-hidden opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none">
                  <img
                    src={practice.image}
                    alt={title}
                    className="w-full h-full object-cover filter grayscale"
                  />
                </div>

                <div>
                  {/* Top Bar: Icon + Case Counter & Category */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#b38a38]/15 to-[#87641d]/10 border border-[#b38a38]/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm">
                      {getIcon(practice.iconName)}
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs px-2.5 py-1 rounded-full bg-[#f4eee2] text-[#87641d] border border-[#e6ddcc] font-mono font-bold">
                        +{practice.casesCount} {t.casesHandled}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#b38a38]/10 text-[#87641d] border border-[#b38a38]/20">
                        {categoryLabel}
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold font-serif-title text-[#181512] mb-3 group-hover:text-[#87641d] transition-colors leading-snug">
                    {title}
                  </h3>

                  {/* Description */}
                  <p className="text-[#4b4334] text-sm leading-relaxed mb-6 font-body-custom">
                    {shortDesc}
                  </p>

                  {/* Highlighted Services Bullet Points */}
                  <div className="space-y-2 mb-6">
                    {services.slice(0, 2).map((srv, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-[#4b4334]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#b38a38] mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-1 font-medium">{srv}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Footer: Action */}
                <div className="pt-4 border-t border-[#e6ddcc] flex items-center justify-between mt-2">
                  <button
                    onClick={() => setSelectedPractice(practice)}
                    className="text-xs font-bold text-[#87641d] hover:text-[#181512] flex items-center gap-1.5 transition group-hover:underline cursor-pointer"
                  >
                    <span>{lang === 'ar' ? 'تفاصيل الاختصاص والخدمات' : lang === 'tr' ? 'Uzmanlık Detayları' : 'View Practice Details'}</span>
                    <ArrowIcon className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onOpenConsultation(practice.id, practice.leadPartnerId)}
                    className="p-2 rounded-xl bg-[#b38a38]/15 hover:bg-[#b38a38] text-[#87641d] hover:text-white transition cursor-pointer"
                    title={t.requestConsultationInField}
                  >
                    <Scale className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA bar */}
        <div className="mt-16 p-8 rounded-2xl bg-gradient-to-r from-[#f4eee2] via-[#ede4d4] to-[#f4eee2] border border-[#c5a869]/40 flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#b38a38]/15 flex items-center justify-center flex-shrink-0 border border-[#b38a38]/30">
              <Scale className="w-6 h-6 text-[#87641d]" />
            </div>
            <div>
              <h4 className="text-[#181512] font-bold text-lg">
                {lang === 'ar' 
                  ? 'هل تحتاج إلى استشارة قانونية مخصصة أو دراسة دقيقة لعقد استثماري؟' 
                  : lang === 'tr'
                  ? 'Özel bir hukuki danışmanlığa veya yatırım sözleşmesi incelemesine mi ihtiyacınız var?'
                  : 'Need tailored legal counsel or complex contract due diligence?'}
              </h4>
              <p className="text-[#4b4334] text-sm">
                {lang === 'ar'
                  ? 'مستشارونا جاهزون لتقديم جلسة تقييمية سرية خلال 24 ساعة.'
                  : lang === 'tr'
                  ? 'Kıdemli ortaklarımız 24 saat içinde gizli bir ön değerlendirme sunmaya hazırdır.'
                  : 'Our senior partners are available for a confidential assessment within 24 hours.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => onOpenConsultation()}
            className="w-full md:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#b38a38] via-[#c5a869] to-[#87641d] text-white font-bold text-sm shadow-md hover:brightness-105 transition whitespace-nowrap cursor-pointer"
          >
            {t.bookConsultation}
          </button>
        </div>
      </div>

      {/* Practice Details Modal */}
      {selectedPractice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-3xl rounded-2xl bg-[#fbf8f2] border border-[#c5a869]/50 shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            
            {/* Close button */}
            <button
              onClick={() => setSelectedPractice(null)}
              className="absolute top-5 left-5 rtl:left-auto rtl:right-5 p-2 rounded-xl bg-white border border-[#d8ceb8] text-[#5c5343] hover:text-[#181512] transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-start gap-4 mb-6">
              <div className="w-14 h-14 rounded-xl bg-[#b38a38]/15 border border-[#b38a38]/30 flex items-center justify-center flex-shrink-0 mt-1">
                {getIcon(selectedPractice.iconName)}
              </div>
              <div>
                <span className="text-xs font-bold text-[#87641d] uppercase tracking-wider">
                  {lang === 'ar' ? 'مجال اختصاص معتمد' : lang === 'tr' ? 'Akredite Uzmanlık Alanı' : 'Accredited Practice Area'}
                </span>
                <h3 className="text-2xl sm:text-3xl font-serif-title font-bold text-[#181512] mt-1">
                  {getLocalized(selectedPractice, 'title', lang, selectedPractice.title)}
                </h3>
              </div>
            </div>

            {/* Modal Image */}
            <div className="rounded-xl overflow-hidden h-48 mb-6 border border-[#e6ddcc] relative">
              <img
                src={selectedPractice.image}
                alt={getLocalized(selectedPractice, 'title', lang, selectedPractice.title)}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#181512]/50 via-transparent to-transparent" />
            </div>

            {/* Full description */}
            <div className="mb-6">
              <h4 className="text-sm font-bold text-[#181512] mb-2">
                {lang === 'ar' ? 'نظرة شاملة حول الممارسة:' : lang === 'tr' ? 'Uzmanlık Alanına Genel Bakış:' : 'Practice Overview:'}
              </h4>
              <p className="text-[#4b4334] text-sm leading-relaxed">
                {getLocalized(selectedPractice, 'fullDesc', lang, selectedPractice.fullDesc)}
              </p>
            </div>

            {/* Key Services Breakdown */}
            <div className="mb-8">
              <h4 className="text-sm font-bold text-[#181512] mb-3">
                {lang === 'ar' ? 'أبرز الخدمات والحلول المقدمة في هذا القسم:' : lang === 'tr' ? 'Sunulan Temel Hukuki Hizmetler ve Çözümler:' : 'Key Solutions & Scope of Services:'}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {getServicesList(selectedPractice).map((service, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-[#e6ddcc]">
                    <CheckCircle2 className="w-4 h-4 text-[#b38a38] flex-shrink-0 mt-0.5" />
                    <span className="text-xs text-[#2c261e] font-medium">{service}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons in Modal */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-[#e6ddcc]">
              <button
                onClick={() => setSelectedPractice(null)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-[#6b6255] hover:text-[#181512] font-semibold text-sm cursor-pointer"
              >
                {t.closeModal}
              </button>
              
              <button
                onClick={() => {
                  const pId = selectedPractice.id;
                  const partnerId = selectedPractice.leadPartnerId;
                  setSelectedPractice(null);
                  onOpenConsultation(pId, partnerId);
                }}
                className="w-full sm:w-auto px-7 py-3 rounded-xl bg-gradient-to-r from-[#b38a38] via-[#c5a869] to-[#87641d] text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Scale className="w-4 h-4 text-white" />
                <span>{t.requestConsultationInField}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
