import React, { useState } from 'react';
import { BookOpen, Calendar, Clock, ArrowLeft, ArrowRight, X, User, Tag } from 'lucide-react';
import { BlogPost, Language } from '../types';
import { useTranslation, getLocalized } from '../services/i18n';

interface BlogSectionProps {
  blogPosts: BlogPost[];
  lang: Language;
}

export const BlogSection: React.FC<BlogSectionProps> = ({ blogPosts, lang }) => {
  const isRtl = lang === 'ar';
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;
  const t = useTranslation(lang);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  return (
    <section id="blog" className="py-24 bg-[#f7f2e8] relative border-t border-[#e6ddcc]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#b38a38]/12 border border-[#b38a38]/30 text-[#87641d] text-xs font-bold uppercase tracking-wider mb-4">
            <BookOpen className="w-3.5 h-3.5" />
            <span>{t.insightsBadge}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif-title font-bold text-[#181512] tracking-tight mb-4">
            {lang === 'ar' ? (
              <>
                تحليلات تشريعية ورؤى <span className="gold-gradient-text">لقادة الفكر القانوني</span>
              </>
            ) : lang === 'tr' ? (
              <>
                Mevzuat Analizleri ve <span className="gold-gradient-text">Hukuki Düşünce Liderliği</span>
              </>
            ) : (
              <>
                Legislative Insights & <span className="gold-gradient-text">Thought Leadership</span>
              </>
            )}
          </h2>

          <p className="text-[#4b4334] text-base sm:text-lg">
            {t.insightsSubtitle}
          </p>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {blogPosts.map(post => {
            const title = getLocalized(post, 'title', lang, post.title);
            const excerpt = getLocalized(post, 'excerpt', lang, post.excerpt);
            const category = getLocalized(post, 'category', lang, post.category);
            const authorName = getLocalized(post, 'authorName', lang, post.authorName);
            const authorRole = getLocalized(post, 'authorRole', lang, post.authorRole);
            const date = getLocalized(post, 'date', lang, post.date);
            const readTime = getLocalized(post, 'readTime', lang, post.readTime);

            return (
              <article
                key={post.id}
                className="rounded-2xl bg-white border border-[#e6ddcc] hover:border-[#b38a38] overflow-hidden flex flex-col justify-between group transition duration-300 hover:-translate-y-1.5 shadow-md hover:shadow-xl font-cards-custom"
              >
                <div>
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden bg-[#f4eee2]">
                    <img
                      src={post.image}
                      alt={title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#181512]/60 to-transparent opacity-60" />
                    <span className="absolute top-3 right-3 rtl:right-auto rtl:left-3 px-2.5 py-1 rounded-lg bg-white/95 text-[#87641d] text-xs font-bold backdrop-blur-md border border-[#b38a38]/30 shadow-sm">
                      {category}
                    </span>
                  </div>

                  {/* Body */}
                  <div className="p-6">
                    {/* Meta */}
                    <div className="flex items-center gap-4 text-xs text-[#6b6255] mb-3 font-semibold">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#b38a38]" />
                        {date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#b38a38]" />
                        {readTime}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold font-serif-title text-[#181512] group-hover:text-[#87641d] transition mb-3 line-clamp-2 leading-snug">
                      {title}
                    </h3>

                    {/* Excerpt */}
                    <p className="text-[#4b4334] text-xs sm:text-sm line-clamp-3 leading-relaxed mb-4 font-normal font-body-custom">
                      {excerpt}
                    </p>
                  </div>
                </div>

                {/* Author & Read More Button */}
                <div className="px-6 py-4 border-t border-[#e6ddcc] flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-[#181512] block">
                      {authorName}
                    </span>
                    <span className="text-[11px] text-[#6b6255] block line-clamp-1">
                      {authorRole}
                    </span>
                  </div>

                  <button
                    onClick={() => setSelectedPost(post)}
                    className="p-2 rounded-xl bg-[#b38a38]/15 hover:bg-[#b38a38] text-[#87641d] hover:text-white transition cursor-pointer"
                    title={t.readFullArticle}
                  >
                    <ArrowIcon className="w-4 h-4" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* Article Reader Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-3xl rounded-2xl bg-[#fbf8f2] border border-[#c5a869]/50 shadow-2xl p-6 sm:p-10 max-h-[90vh] overflow-y-auto">
            
            {/* Close button */}
            <button
              onClick={() => setSelectedPost(null)}
              className="absolute top-5 left-5 rtl:left-auto rtl:right-5 p-2 rounded-xl bg-white border border-[#d8ceb8] text-[#5c5343] hover:text-[#181512] transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Category badge */}
            <span className="text-xs px-3 py-1 rounded-full bg-[#b38a38]/15 text-[#87641d] font-bold mb-3 inline-block">
              {getLocalized(selectedPost, 'category', lang, selectedPost.category)}
            </span>

            {/* Title */}
            <h2 className="text-2xl sm:text-3xl font-serif-title font-bold text-[#181512] mb-4 leading-tight">
              {getLocalized(selectedPost, 'title', lang, selectedPost.title)}
            </h2>

            {/* Author bar */}
            <div className="flex items-center justify-between flex-wrap gap-4 py-4 border-y border-[#e6ddcc] mb-6 text-xs text-[#5c5343]">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-[#b38a38]" />
                <span className="font-bold text-[#181512]">
                  {getLocalized(selectedPost, 'authorName', lang, selectedPost.authorName)}
                </span>
                <span className="text-[#d8ceb8]">|</span>
                <span>
                  {getLocalized(selectedPost, 'authorRole', lang, selectedPost.authorRole)}
                </span>
              </div>

              <div className="flex items-center gap-4 text-[#6b6255] font-medium">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#b38a38]" />
                  {getLocalized(selectedPost, 'date', lang, selectedPost.date)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#b38a38]" />
                  {getLocalized(selectedPost, 'readTime', lang, selectedPost.readTime)}
                </span>
              </div>
            </div>

            {/* Image */}
            <div className="rounded-xl overflow-hidden h-64 mb-6 border border-[#e6ddcc]">
              <img
                src={selectedPost.image}
                alt={getLocalized(selectedPost, 'title', lang, selectedPost.title)}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Article Content */}
            <div className="prose max-w-none text-[#2c261e] text-sm sm:text-base leading-relaxed space-y-4 font-normal">
              <p className="font-semibold text-lg text-[#87641d]">
                {getLocalized(selectedPost, 'excerpt', lang, selectedPost.excerpt)}
              </p>
              <p>
                {getLocalized(selectedPost, 'content', lang, selectedPost.content)}
              </p>
              <p>
                {lang === 'ar'
                  ? 'ختاماً، إن الإلمام الدقيق بهذه النصوص والتحولات ليس مجرد رفاهية قانونية، بل هو صلب العمل الاستثماري الناجح لحماية التدفقات النقدية وتفادي النزاعات المعقدة. يسعد فريقنا بتقديم استشارات متعمقة لمواءمة أوضاع شركتكم مع أحدث المتطلبات.'
                  : lang === 'tr'
                  ? 'Sonuç olarak, değişen yasal düzenlemelere proaktif uyum sağlamak, kurumsal varlıkları korumanın ve uzun süreli uyuşmazlıkları önlemenin temel taşıdır. Ekibimiz şirketinizi yeni gereksinimlere uyarlamak için kapsamlı danışmanlık sunmaktan memnuniyet duyar.'
                  : 'In conclusion, proactive compliance with these statutory evolutions represents a vital cornerstone for shielding institutional assets and avoiding protracted arbitral disputes.'}
              </p>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap items-center gap-2 pt-6 mt-8 border-t border-[#e6ddcc]">
              <Tag className="w-3.5 h-3.5 text-[#b38a38]" />
              {(lang === 'tr' && selectedPost.tagsTr && selectedPost.tagsTr.length > 0
                ? selectedPost.tagsTr
                : lang === 'en' && selectedPost.tagsEn && selectedPost.tagsEn.length > 0
                ? selectedPost.tagsEn
                : selectedPost.tags || []
              ).map((tag, i) => (
                <span key={i} className="text-xs px-2.5 py-1 rounded-lg bg-[#f4eee2] text-[#87641d] font-semibold border border-[#e6ddcc]">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
