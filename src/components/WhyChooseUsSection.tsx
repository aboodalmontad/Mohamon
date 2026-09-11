import React from 'react';
import { Lock, Trophy, Clock, Globe2, ShieldCheck, FileCheck2, Award } from 'lucide-react';
import { Language } from '../types';
import { useTranslation } from '../services/i18n';

interface WhyChooseUsProps {
  lang: Language;
}

export const WhyChooseUsSection: React.FC<WhyChooseUsProps> = ({ lang }) => {
  const t = useTranslation(lang);

  const pillars = [
    {
      icon: <Lock className="w-7 h-7 text-[#c5a869]" />,
      titleAr: 'سرية مطلقة وحصانة مصرفية',
      titleEn: 'Bank-Grade Confidentiality & Privilege',
      titleTr: 'Banka Düzeyinde Gizlilik ve Mesleki Dokunulmazlık',
      descAr: 'نلتزم بأعلى بروتوكولات حماية وسرية المعلومات القانونية والمالية مع تشفير كامل لكافة الملفات والمراسلات.',
      descEn: 'Strict attorney-client privilege protocols and enterprise-grade data encryption for all sensitive transactions.',
      descTr: 'Tüm hassas ticari işlemlerde ve uyuşmazlıklarda avukat-müvekkil gizliliği ve kurumsal veri şifreleme protokolleri.'
    },
    {
      icon: <Trophy className="w-7 h-7 text-[#c5a869]" />,
      titleAr: 'سجل حافل بالانتصارات النوعية',
      titleEn: 'Proven Track Record of Precedents',
      titleTr: 'Emsal Nitelikte Yüksek Başarı Oranı',
      descAr: 'نسبة نجاح تتجاوز 98% في القضايا التجارية والتحكيمية الدولية، وتحصيل تعويضات استثمارية كبرى.',
      descEn: 'Over 98% success rate in high-value commercial arbitrations, recovering multi-million dispute compensations.',
      descTr: 'Uluslararası ticari tahkim ve yüksek meblağlı davalarda %98\'i aşan başarı ve tazminat tahsilat oranı.'
    },
    {
      icon: <Globe2 className="w-7 h-7 text-[#c5a869]" />,
      titleAr: 'تحالفات ومكاتب عابرة للحدود',
      titleEn: 'Cross-Border International Reach',
      titleTr: 'Sınır Ötesi Küresel Ofis Ağı',
      descAr: 'شراكات وتواجد مباشر في الرياض، إسطنبول، دبي، ولندن لتوفير تمثيل قانوني متزامن في مختلف الاختصاصات.',
      descEn: 'Strategic direct presence across Riyadh, Istanbul, Dubai, and London for seamless multi-jurisdictional representation.',
      descTr: 'Riyad, İstanbul, Dubai ve Londra\'daki doğrudan varlığımızla çok yargılı davalarda eşzamanlı temsil.'
    },
    {
      icon: <Clock className="w-7 h-7 text-[#c5a869]" />,
      titleAr: 'فريق استجابة طارئة 24/7',
      titleEn: '24/7 Rapid Response Legal Unit',
      titleTr: '7/24 Acil Hukuki Müdahale Ekibi',
      descAr: 'غرفة عمليات قانونية مخصصة للتعامل مع الأوامر الوقتية المستعجلة، الحجوزات التحفظية، والأزمات التنظيمية.',
      descEn: 'Dedicated crisis team for injunctions, precautionary asset attachments, and emergency regulatory interventions.',
      descTr: 'İhtiyati tedbirler, acil hacizler ve beklenmedik regülasyon denetimleri için özel kriz yönetim masası.'
    },
    {
      icon: <FileCheck2 className="w-7 h-7 text-[#c5a869]" />,
      titleAr: 'وضوح وشفافية الأتعاب دون مفاجآت',
      titleEn: 'Transparent Value-Based Billing',
      titleTr: 'Şeffaf ve Öngörülebilir Ücretlendirme',
      descAr: 'هيكلة أتعاب مرنة وواضحة ترتبط بالقيمة المضافة والنتائج المحققة دون أي تكاليف خفية أو مبالغ غير مبررة.',
      descEn: 'Predictable, milestone-based and value-driven fee structures with full fiscal transparency.',
      descTr: 'Aşamalara bağlı, katma değer odaklı ve hiçbir gizli maliyet barındırmayan tam şeffaf ücret politikası.'
    },
    {
      icon: <ShieldCheck className="w-7 h-7 text-[#c5a869]" />,
      titleAr: 'حلول استباقية تحصن عقودك',
      titleEn: 'Proactive Dispute Prevention',
      titleTr: 'Uyuşmazlık Önleyici Proaktif Sözleşmeler',
      descAr: 'لا ننتظر وقوع النزاع؛ بل نصيغ العقود والاتفاقيات بحرفية هندسية تسد كل الثغرات وتمنع أي تعثر مستقبلي.',
      descEn: 'Dispute-preventive contractual drafting that fortifies your commercial deals and mitigates exposure upfront.',
      descTr: 'Uyuşmazlık doğmadan önce sözleşmeleri kusursuzca yapılandırarak gelecekteki tüm hukuki riskleri bertaraf ediyoruz.'
    }
  ];

  return (
    <section id="why-us" className="py-24 bg-[#fbf8f2] relative border-t border-[#e6ddcc]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#b38a38]/12 border border-[#b38a38]/30 text-[#87641d] text-xs font-bold uppercase tracking-wider mb-4">
            <Award className="w-3.5 h-3.5" />
            <span>{t.whyBadge}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif-title font-bold text-[#181512] tracking-tight mb-4">
            {lang === 'ar' ? (
              <>
                لماذا تضع كبرى الشركات <span className="gold-gradient-text">ثقتها المطلقة في مكتبنا؟</span>
              </>
            ) : lang === 'tr' ? (
              <>
                Küresel Şirketler Neden <span className="gold-gradient-text">En Kritik Dosyalarını Bize Emanet Ediyor?</span>
              </>
            ) : (
              <>
                Why Global Corporations <span className="gold-gradient-text">Entrust Us With Their Critical Stakes</span>
              </>
            )}
          </h2>

          <p className="text-[#4b4334] text-base sm:text-lg">
            {t.whySubtitle}
          </p>
        </div>

        {/* 6 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {pillars.map((pillar, idx) => {
            const title = lang === 'tr' ? pillar.titleTr : lang === 'en' ? pillar.titleEn : pillar.titleAr;
            const desc = lang === 'tr' ? pillar.descTr : lang === 'en' ? pillar.descEn : pillar.descAr;

            return (
              <div
                key={idx}
                className="rounded-2xl bg-white p-8 border border-[#e6ddcc] hover:border-[#b38a38] transition duration-300 group hover:-translate-y-1 relative shadow-md hover:shadow-xl font-cards-custom"
              >
                {/* Pillar Number */}
                <span className="absolute top-6 right-6 rtl:right-auto rtl:left-6 font-serif-title text-4xl font-extrabold text-[#e6ddcc] group-hover:text-[#b38a38]/30 transition-colors">
                  0{idx + 1}
                </span>

                <div className="w-14 h-14 rounded-xl bg-[#b38a38]/15 border border-[#b38a38]/30 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-[#b38a38]/25 transition duration-300 shadow-sm">
                  {pillar.icon}
                </div>

                <h3 className="text-xl font-bold font-serif-title text-[#181512] mb-3 group-hover:text-[#87641d] transition">
                  {title}
                </h3>

                <p className="text-[#4b4334] text-sm leading-relaxed font-normal">
                  {desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
