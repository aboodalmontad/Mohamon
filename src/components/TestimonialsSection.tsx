import React from 'react';
import { Star, MessageSquareQuote, CheckCircle } from 'lucide-react';
import { Testimonial, Language } from '../types';
import { useTranslation, getLocalized } from '../services/i18n';

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
  lang: Language;
}

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({ testimonials, lang }) => {
  const t = useTranslation(lang);

  if (!testimonials || testimonials.length === 0) return null;

  return (
    <section id="testimonials" className="py-24 bg-[#fbf8f2] relative border-t border-[#e6ddcc] overflow-hidden">
      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#b38a38]/8 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#b38a38]/12 border border-[#b38a38]/30 text-[#87641d] text-xs font-bold uppercase tracking-wider mb-4">
            <MessageSquareQuote className="w-3.5 h-3.5" />
            <span>{t.testimonialsBadge}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif-title font-bold text-[#181512] tracking-tight mb-4">
            {lang === 'ar' ? (
              <>
                ماذا يقول <span className="gold-gradient-text">قادة الأعمال والشركاء التنفيذيون؟</span>
              </>
            ) : lang === 'tr' ? (
              <>
                İş Dünyası Liderleri ve <span className="gold-gradient-text">Genel Hukuk Müşavirleri Ne Diyor?</span>
              </>
            ) : (
              <>
                Voices of <span className="gold-gradient-text">Business Leaders & General Counsels</span>
              </>
            )}
          </h2>

          <p className="text-[#4b4334] text-base sm:text-lg">
            {t.testimonialsSubtitle}
          </p>
        </div>

        {/* Testimonials Stacked Vertically (تحت بعضها) */}
        <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
          {testimonials.map((item, index) => {
            const quote = getLocalized(item, 'content', lang, item.content);
            const clientName = getLocalized(item, 'clientName', lang, item.clientName);
            const clientRole = getLocalized(item, 'clientRole', lang, item.clientRole);
            const company = getLocalized(item, 'company', lang, item.company);
            const caseType = getLocalized(item, 'caseType', lang, item.caseType);

            return (
              <article
                key={item.id || index}
                id={`testimonial-card-${item.id || index}`}
                className="relative rounded-3xl bg-white p-6 sm:p-10 border border-[#c5a869]/35 shadow-sm hover:shadow-xl hover:border-[#b38a38]/60 transition-all duration-300 font-cards-custom group"
              >
                {/* Top Quote Icon & Case Badge & Rating */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-[#b38a38]/12 flex items-center justify-center border border-[#b38a38]/30 text-[#87641d] group-hover:scale-105 transition-transform">
                      <MessageSquareQuote className="w-5 h-5" />
                    </div>
                    {/* Stars */}
                    <div className="flex items-center gap-1" aria-label={`Rating: ${item.rating || 5} out of 5 stars`}>
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 sm:w-5 sm:h-5 ${i < (item.rating || 5) ? 'fill-[#b38a38] text-[#b38a38]' : 'text-slate-200'}`}
                        />
                      ))}
                    </div>
                  </div>

                  {caseType && (
                    <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#f4eee2] border border-[#e6ddcc] text-xs text-[#87641d] font-bold">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span>{caseType}</span>
                      {item.year && <span className="text-[#6b6255] font-mono">({item.year})</span>}
                    </div>
                  )}
                </div>

                {/* Quote Content */}
                <blockquote className="text-base sm:text-xl font-serif-title text-[#181512] leading-relaxed mb-6 italic">
                  "{quote}"
                </blockquote>

                {/* Client Info Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-[#e6ddcc]/80">
                  <div className="flex items-center gap-4">
                    <img
                      src={item.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'}
                      alt={clientName}
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-[#b38a38]/50 shadow-sm"
                      loading="lazy"
                    />
                    <div>
                      <h4 className="text-[#181512] font-bold text-base sm:text-lg">
                        {clientName}
                      </h4>
                      {clientRole && (
                        <p className="text-xs sm:text-sm text-[#87641d] font-bold">
                          {clientRole}
                        </p>
                      )}
                      {company && (
                        <p className="text-xs sm:text-sm text-[#6b6255]">
                          {company}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-xs text-[#87641d] font-semibold flex items-center gap-1.5 bg-[#b38a38]/10 px-3.5 py-1.5 rounded-full border border-[#b38a38]/20 self-start sm:self-auto">
                    <CheckCircle className="w-3.5 h-3.5 text-[#87641d]" />
                    <span>{lang === 'ar' ? 'رأي موثّق ومثبت' : lang === 'tr' ? 'Doğrulanmış Değerlendirme' : 'Verified Review'}</span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};
