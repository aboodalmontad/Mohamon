import React, { useState, useEffect } from 'react';
import { Shield, Briefcase, Globe, ArrowLeft, ArrowRight, UserPlus, Server, MapPin, Scale, Building, RefreshCw } from 'lucide-react';
import { FirmRegistrationModal } from './FirmRegistrationModal';
import { Language, LawFirm } from '../types';
import { firmService, createDefaultFirms } from '../services/firmService';
import { storageService } from '../services/storageService';
import { PlatformSettings } from '../types';

interface PlatformLandingProps {
  onAdminClick: () => void;
  lang: Language;
}

export const PlatformLanding: React.FC<PlatformLandingProps> = ({ onAdminClick, lang }) => {
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [activeFirms, setActiveFirms] = useState<LawFirm[]>([]);
  const [settings, setSettings] = useState<PlatformSettings>(storageService.getPlatformSettings());
  const isRtl = lang === 'ar';

  const loadFirms = async () => {
    // 1. Instant synchronous load from local memory/storage
    firmService.initLocal();
    let syncFirms = firmService.getAllFirms();
    if (!syncFirms || syncFirms.length === 0) {
      syncFirms = createDefaultFirms();
    }
    if (syncFirms && syncFirms.length > 0) {
      setActiveFirms(syncFirms.filter(f => f.status !== 'suspended'));
    }
    // 2. Full async fetch to pull latest server/supabase data
    await firmService.init();
    const firms = firmService.getAllFirms();
    if (firms && firms.length > 0) {
      setActiveFirms(firms.filter(f => f.status !== 'suspended'));
    }
  };

  useEffect(() => {
    // Automatically clear browser cache & hard-reload ONCE when entering the home page per session
    if (typeof window !== 'undefined') {
      const HOME_CACHE_KEY = 'aladl_home_cache_cleared_session_v4';
      if (!sessionStorage.getItem(HOME_CACHE_KEY)) {
        sessionStorage.setItem(HOME_CACHE_KEY, 'true');
        (async () => {
          if ('caches' in window) {
            try {
              const keys = await window.caches.keys();
              await Promise.all(keys.map(k => window.caches.delete(k)));
            } catch (e) {
              console.warn('Cache storage clear warning:', e);
            }
          }
          if ('serviceWorker' in navigator) {
            try {
              const regs = await navigator.serviceWorker.getRegistrations();
              for (const r of regs) await r.unregister();
            } catch (e) {
              console.warn('Service worker unregister warning:', e);
            }
          }
          window.location.reload();
        })();
        return;
      }
    }

    loadFirms();
    const handleStorageSync = () => {
      setSettings(storageService.getPlatformSettings());
      loadFirms();
    };
    const handleFirmsUpdated = () => {
      loadFirms();
    };

    window.addEventListener('aladl_storage_sync', handleStorageSync);
    window.addEventListener('aladl_firms_updated', handleFirmsUpdated);
    window.addEventListener('aladl_default_firm_changed', handleFirmsUpdated);
    window.addEventListener('aladl_active_firm_changed', handleFirmsUpdated);

    return () => {
      window.removeEventListener('aladl_storage_sync', handleStorageSync);
      window.removeEventListener('aladl_firms_updated', handleFirmsUpdated);
      window.removeEventListener('aladl_default_firm_changed', handleFirmsUpdated);
      window.removeEventListener('aladl_active_firm_changed', handleFirmsUpdated);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#181512] text-[#fbf8f2] font-body-custom selection:bg-[#c5a869] selection:text-[#181512]">
      {/* Platform Header */}
      <header className="fixed w-full top-0 z-50 bg-[#181512]/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#c5a869] to-[#ebd397] flex items-center justify-center shadow-lg shadow-[#c5a869]/20">
                <Shield className="w-6 h-6 text-[#181512]" />
              </div>
              <div>
                <h1 className="text-2xl font-serif text-[#c5a869] tracking-wider leading-none">{isRtl ? settings.platformNameAr : settings.platformNameEn}</h1>
                <p className="text-xs text-white/40 tracking-[0.2em] mt-1 uppercase">{isRtl ? settings.platformNameEn : settings.platformNameEn}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 sm:gap-4">
              <button 
                onClick={() => setIsRegistrationOpen(true)}
                className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-[#c5a869] text-[#181512] font-bold text-sm hover:bg-[#b38a38] transition-all shadow-lg shadow-[#c5a869]/20 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>{isRtl ? 'تسجيل مكتب جديد' : 'Register New Firm'}</span>
              </button>
              <button 
                onClick={() => storageService.clearCacheAndRefreshApp()}
                className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition-colors bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-2 rounded-lg cursor-pointer"
                title={isRtl ? 'مسح الكاش وتحديث الصفحة' : 'Clear Cache & Refresh'}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{isRtl ? 'تحديث الكاش' : 'Clear Cache'}</span>
              </button>
              <button 
                onClick={onAdminClick}
                className="flex items-center gap-2 text-sm font-medium text-white/60 hover:text-white transition-colors"
              >
                <Server className="w-4 h-4" />
                <span>{isRtl ? 'إدارة المنصة' : 'Platform Admin'}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="pt-32 pb-20 relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#c5a869]/20 blur-[120px] rounded-full pointer-events-none" />
        {/* Hero Banner Background Image */}
        {(() => {
          const bannerSrc = settings.heroBannerUrl || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2000&q=80';
          return (
            <div className="absolute inset-0 z-0 transition-opacity duration-500 overflow-hidden">
              <img 
                src={bannerSrc} 
                alt="Hero Banner" 
                className="w-full h-full object-cover contrast-[1.35] brightness-[1.12] saturate-[1.25] filter drop-shadow-xl" 
              />
              {/* Subtle bottom gradient overlay for smooth transition into content without darkening the banner */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#181512]" />
            </div>
          );
        })()}
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mt-16 drop-shadow-[0_4px_16px_rgba(0,0,0,0.85)]">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-[#c5a869] text-sm mb-6 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-[#c5a869] animate-pulse" />
              {isRtl ? settings.heroBadgeAr : settings.heroBadgeEn}
            </div>
            <h2 className="text-5xl md:text-7xl font-serif text-white mb-6 leading-tight drop-shadow-[0_4px_20px_rgba(0,0,0,0.9)]" dangerouslySetInnerHTML={{__html: isRtl ? settings.heroHeadingAr : settings.heroHeadingEn}} />
            <p className="text-lg md:text-xl text-white/90 mb-10 leading-relaxed max-w-2xl mx-auto drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] font-medium">
              {isRtl ? settings.heroSubheadingAr : settings.heroSubheadingEn}
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={() => setIsRegistrationOpen(true)}
                className="w-full sm:w-auto bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white px-10 py-4 rounded-xl text-lg font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xl"
              >
                <UserPlus className="w-5 h-5 text-[#c5a869]" />
                <span>{isRtl ? 'سجل مكتبك الآن' : 'Register Your Firm'}</span>
              </button>
              <button 
                onClick={() => document.getElementById('directory')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full sm:w-auto bg-gradient-to-r from-[#c5a869] to-[#ebd397] hover:from-[#b38a38] hover:to-[#c5a869] text-[#181512] px-10 py-4 rounded-xl text-lg font-bold transition-all shadow-xl shadow-[#c5a869]/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Building className="w-5 h-5" />
                <span>{isRtl ? settings.ctaSecondaryAr : settings.ctaSecondaryEn}</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Directory Section */}
      <section id="directory" className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <h3 className="text-3xl font-serif text-white mb-4">{isRtl ? "دليل المكاتب المعتمدة" : "Registered Firms Directory"}</h3>
              <p className="text-white/50 max-w-2xl">{isRtl ? "تصفح قائمة بمكاتب المحاماة الموثوقة والمسجلة في منصتنا، وتواصل معهم مباشرة." : "Browse the list of trusted law firms registered on our platform and connect with them directly."}</p>
            </div>
            <div className="text-[#c5a869] bg-[#c5a869]/10 px-4 py-2 rounded-lg font-medium border border-[#c5a869]/20 inline-flex items-center gap-2">
              <Scale className="w-5 h-5" />
              <span>{activeFirms.length} {isRtl ? "مكتب مسجل" : "Registered Firms"}</span>
            </div>
          </div>

          {activeFirms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeFirms.map((firm) => {
                const logo = firm.logoUrl || (firm.data?.settings as any)?.customLogoUrl || (firm.data?.settings as any)?.logoUrl;
                const name = firm.nameAr || firm.data?.settings?.firmNameAr || 'مكتب محاماة معتمد';
                const city = firm.cityAr || (firm.data as any)?.offices?.[0]?.cityAr || 'الرياض';
                const tagline = firm.taglineAr || firm.data?.settings?.sloganAr || '';

                return (
                  <a 
                    key={firm.id}
                    href={`/?firm=${firm.slug}`}
                    className="group block bg-white/5 border border-white/10 rounded-2xl p-5 sm:p-6 hover:bg-white/10 hover:border-[#c5a869]/50 transition-all shadow-lg hover:shadow-2xl hover:shadow-[#c5a869]/10"
                  >
                    <div className="flex items-start gap-3.5 sm:gap-4">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-black/60 shrink-0 border border-white/10 group-hover:border-[#c5a869]/50 transition-colors flex items-center justify-center">
                        {logo ? (
                          <img src={logo} alt={name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-slate-800/80 text-[#c5a869]">
                            <Building className="w-7 h-7 sm:w-8 sm:h-8" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-base sm:text-lg font-bold text-white group-hover:text-[#c5a869] transition-colors leading-snug break-words mb-1.5">
                          {name}
                        </h4>
                        
                        {tagline && (
                          <p className="text-xs text-white/70 mb-3 font-normal leading-relaxed break-words">
                            {tagline}
                          </p>
                        )}

                        <div className="flex flex-col gap-1.5 mt-2 pt-2 border-t border-white/10">
                          <div className="flex items-center gap-1.5 text-xs text-white/70">
                            <MapPin className="w-3.5 h-3.5 text-[#c5a869] shrink-0" />
                            <span className="break-words">{city}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-[#c5a869] font-mono">
                            <Globe className="w-3.5 h-3.5 shrink-0" />
                            <span className="break-all dir-ltr">mohamoon.com/?firm={firm.slug}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 bg-white/5 border border-white/10 rounded-2xl">
              <Scale className="w-12 h-12 text-white/20 mx-auto mb-4" />
              <h4 className="text-xl text-white mb-2">{isRtl ? "لا توجد مكاتب مسجلة حالياً" : "No firms registered currently"}</h4>
              <p className="text-white/50">{isRtl ? "يرجى مراجعة إدارة المنصة لتفعيل المكاتب." : "Please contact platform administration to activate firms."}</p>
            </div>
          )}
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-black/40 border-t border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-serif text-white mb-4">{isRtl ? `لماذا تختار منصة ${settings.platformNameAr}؟` : `Why Choose ${settings.platformNameEn}?`}</h3>
            <p className="text-white/50 max-w-2xl mx-auto">نوفر لك كل ما تحتاجه لإدارة مكتب محاماة عصري وموثوق.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-colors">
              <div className="w-12 h-12 bg-[#c5a869]/10 rounded-xl flex items-center justify-center mb-6">
                <Globe className="w-6 h-6 text-[#c5a869]" />
              </div>
              <h4 className="text-xl font-medium text-white mb-3">موقع إلكتروني خاص</h4>
              <p className="text-white/50 leading-relaxed">
                رابط مخصص لمكتبك (مثال: mohamoon.com/your-name) بواجهة احترافية تعكس هويتك القانونية.
              </p>
            </div>
            
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-colors">
              <div className="w-12 h-12 bg-[#c5a869]/10 rounded-xl flex items-center justify-center mb-6">
                <Briefcase className="w-6 h-6 text-[#c5a869]" />
              </div>
              <h4 className="text-xl font-medium text-white mb-3">إدارة متكاملة</h4>
              <p className="text-white/50 leading-relaxed">
                لوحة تحكم خاصة بك لإدارة المحتوى، فريق العمل، الخدمات، واستقبال طلبات الاستشارة مباشرة.
              </p>
            </div>
            
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-colors">
              <div className="w-12 h-12 bg-[#c5a869]/10 rounded-xl flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-[#c5a869]" />
              </div>
              <h4 className="text-xl font-medium text-white mb-3">أمان وسرية</h4>
              <p className="text-white/50 leading-relaxed">
                حماية فائقة لبيانات مكتبك وعملائك من خلال خوادم مشفرة ونظام صلاحيات متقدم.
              </p>
            </div>
          </div>
        </div>
      </section>

      {isRegistrationOpen && (
        <FirmRegistrationModal 
          isOpen={isRegistrationOpen} 
          onClose={() => {
            setIsRegistrationOpen(false);
            loadFirms();
          }} 
          lang={lang} 
        />
      )}
    </div>
  );
};
