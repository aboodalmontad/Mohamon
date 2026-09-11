import React from 'react';
import { Trophy, CheckCircle, ArrowUpRight } from 'lucide-react';
import { CaseStudy, Language } from '../types';
import { useTranslation, getLocalized } from '../services/i18n';

interface AchievementsSectionProps {
  caseStudies: CaseStudy[];
  lang: Language;
  onOpenConsultation: () => void;
}

export const AchievementsSection: React.FC<AchievementsSectionProps> = ({ caseStudies, lang, onOpenConsultation }) => {
  const t = useTranslation(lang);

  return (
    <section id="achievements" className="py-24 bg-[#f7f2e8] relative border-t border-[#e6ddcc]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#b38a38]/12 border border-[#b38a38]/30 text-[#87641d] text-xs font-bold uppercase tracking-wider mb-4">
              <Trophy className="w-3.5 h-3.5" />
              <span>{t.achievementsBadge}</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif-title font-bold text-[#181512] tracking-tight">
              {lang === 'ar' ? (
                <>
                  إنجازات نوعية <span className="gold-gradient-text">رسخت سوابق تجارية وقضائية</span>
                </>
              ) : lang === 'tr' ? (
                <>
                  Hukuk ve Tahkim Dünyasında <span className="gold-gradient-text">Emsal Teşkil Eden Başarılarımız</span>
                </>
              ) : (
                <>
                  Precedent-Setting <span className="gold-gradient-text">Outcomes & Major Transactions</span>
                </>
              )}
            </h2>
          </div>

          <button
            onClick={onOpenConsultation}
            className="self-start md:self-auto px-6 py-3.5 rounded-xl border border-[#b38a38]/40 bg-white text-[#87641d] hover:bg-[#b38a38]/15 text-sm font-bold transition flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <span>{t.requestCaseEvaluation}</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        {/* Case Studies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {caseStudies.map(item => {
            const title = getLocalized(item, 'title', lang, item.title);
            const summary = getLocalized(item, 'summary', lang, item.summary);
            const outcome = getLocalized(item, 'outcome', lang, item.outcome);
            const category = getLocalized(item, 'category', lang, item.category);

            return (
              <div
                key={item.id}
                className="rounded-2xl bg-white p-7 border border-[#e6ddcc] hover:border-[#b38a38] transition duration-300 flex flex-col justify-between group shadow-md hover:shadow-xl font-cards-custom"
              >
                <div>
                  {/* Category & Year Tag */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs px-2.5 py-1 rounded-lg bg-[#b38a38]/15 text-[#87641d] font-bold">
                      {category}
                    </span>
                    <span className="text-xs text-[#6b6255] font-mono font-semibold">{item.year}</span>
                  </div>

                  {/* Deal Value */}
                  {item.value && (
                    <div className="text-2xl sm:text-3xl font-serif-title font-bold gold-gradient-text mb-2">
                      {item.value}
                    </div>
                  )}

                  {/* Title */}
                  <h3 className="text-lg font-bold font-serif-title text-[#181512] mb-3 group-hover:text-[#87641d] transition">
                    {title}
                  </h3>

                  {/* Summary */}
                  <p className="text-[#4b4334] text-xs sm:text-sm leading-relaxed mb-4 font-normal">
                    {summary}
                  </p>
                </div>

                {/* Outcome Highlight Box */}
                <div className="pt-4 border-t border-[#e6ddcc]">
                  <div className="flex items-start gap-2 p-3 rounded-xl bg-[#f4eee2] border border-[#e6ddcc]">
                    <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span className="text-xs text-[#2c261e] font-semibold">{outcome}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
