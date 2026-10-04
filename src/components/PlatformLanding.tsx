import React, { useState, useEffect, useMemo } from 'react';
import { 
  Shield, Briefcase, Globe, ArrowLeft, ArrowRight, UserPlus, Server, 
  MapPin, Scale, Building, RefreshCw, QrCode, Sparkles, Check, 
  Search, X, Filter, RotateCcw 
} from 'lucide-react';
import { FirmRegistrationModal } from './FirmRegistrationModal';
import { FirmQRCodeModal } from './FirmQRCodeModal';
import { Language, LawFirm, PricingPlan } from '../types';
import { firmService, createDefaultFirms } from '../services/firmService';
import { pricingPlanService } from '../services/pricingPlanService';
import { storageService } from '../services/storageService';
import { PlatformSettings } from '../types';
import { getLocalized } from '../services/i18n';
import { translateTextSync } from '../services/translator';

interface PlatformLandingProps {
  onAdminClick: () => void;
  lang: Language;
  onChangeLang?: (lang: Language) => void;
  onSelectFirm?: (slug: string) => void;
}

export const PlatformLanding: React.FC<PlatformLandingProps> = ({ onAdminClick, lang, onChangeLang, onSelectFirm }) => {
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [activeFirms, setActiveFirms] = useState<LawFirm[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<PlatformSettings>(storageService.getPlatformSettings());
  const [qrModalFirm, setQrModalFirm] = useState<LawFirm | null>(null);
  const [plans, setPlans] = useState<PricingPlan[]>(() => pricingPlanService.getPlans());

  // Search & Filter state for office names & cities
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>('all');

  useEffect(() => {
    const handlePlansUpdated = () => {
      setPlans(pricingPlanService.getPlans());
    };
    pricingPlanService.init().catch(() => {});
    window.addEventListener('aladl_pricing_plans_updated', handlePlansUpdated);
    return () => {
      window.removeEventListener('aladl_pricing_plans_updated', handlePlansUpdated);
    };
  }, []);
  const isRtl = lang === 'ar';
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  const loadFirms = async () => {
    setIsLoading(true);
    // 1. Instant synchronous load from local memory/storage
    firmService.initLocal();
    let syncFirms = firmService.getAllFirms();
    if (syncFirms && syncFirms.length > 0) {
      setActiveFirms(syncFirms.filter(f => f.status !== 'suspended'));
      setIsLoading(false); // We have some data, show it immediately
    }
    
    // 2. Full async fetch to pull latest Supabase data
    await firmService.init();
    firmService.fetchFromSupabase().catch(() => {});
    const firms = firmService.getAllFirms();
    if (firms && firms.length > 0) {
      setActiveFirms(firms.filter(f => f.status !== 'suspended'));
    }
    setIsLoading(false);
  };

  // Extract unique cities for instant filtering
  const uniqueCities = useMemo(() => {
    const set = new Set<string>();
    activeFirms.forEach((f) => {
      const firstOffice = (f.data as any)?.offices?.[0];
      const city = isRtl
        ? (f.cityAr || firstOffice?.cityAr)
        : (f.cityEn || firstOffice?.cityEn || f.cityAr);
      if (city && city.trim()) set.add(city.trim());
    });
    return Array.from(set);
  }, [activeFirms, isRtl]);

  // Real-time search by office name, lawyer, city, and specialties
  const filteredFirms = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return activeFirms.filter((firm) => {
      const firmSettings = firm.data?.settings;
      const rawNameAr = (firm.nameAr || firmSettings?.firmNameAr || '').toLowerCase();
      const rawNameEn = (firm.nameEn || firmSettings?.firmNameEn || '').toLowerCase();
      const slug = (firm.slug || '').toLowerCase();
      const firstOffice = (firm.data as any)?.offices?.[0];
      const cityAr = (firm.cityAr || firstOffice?.cityAr || '').toLowerCase();
      const cityEn = (firm.cityEn || firstOffice?.cityEn || '').toLowerCase();
      const taglineAr = (firm.taglineAr || firmSettings?.sloganAr || '').toLowerCase();
      const taglineEn = (firm.taglineEn || firmSettings?.sloganEn || '').toLowerCase();
      const partners = (firm.data?.partners || []).map(p => `${p.name} ${p.nameEn || ''} ${p.title || ''}`).join(' ').toLowerCase();

      const matchesQuery = !q ||
        rawNameAr.includes(q) ||
        rawNameEn.includes(q) ||
        slug.includes(q) ||
        cityAr.includes(q) ||
        cityEn.includes(q) ||
        taglineAr.includes(q) ||
        taglineEn.includes(q) ||
        partners.includes(q);

      const matchesCity = selectedCity === 'all' ||
        (firm.cityAr === selectedCity || firm.cityEn === selectedCity || firstOffice?.cityAr === selectedCity || firstOffice?.cityEn === selectedCity);

      return matchesQuery && matchesCity;
    });
  }, [activeFirms, searchQuery, selectedCity]);

  useEffect(() => {
    loadFirms();
    
    const handleStorageSync = () => {
      setSettings(storageService.getPlatformSettings());
    };
    
    const handleFirmsUpdated = (e?: any) => {
      let latestFirms = [];
      if (e && e.detail && Array.isArray(e.detail)) {
        latestFirms = e.detail;
      } else {
        latestFirms = firmService.getAllFirms();
      }
      
      if (latestFirms && latestFirms.length > 0) {
        setActiveFirms(latestFirms.filter(f => f.status !== 'suspended'));
        setIsLoading(false);
      }
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
              {settings.platformLogoUrl ? (
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                  <img
                    src={settings.platformLogoUrl}
                    alt={isRtl ? settings.platformNameAr : settings.platformNameEn}
                    className="h-10 sm:h-12 w-auto max-w-[150px] sm:max-w-[220px] object-contain drop-shadow-md rounded-lg"
                  />
                  <div className="hidden sm:block">
                    <h1 className="text-xl sm:text-2xl font-serif text-[#c5a869] tracking-wider leading-none">{isRtl ? settings.platformNameAr : settings.platformNameEn}</h1>
                    <p className="text-[10px] text-white/40 tracking-[0.2em] mt-1 uppercase">{settings.platformNameEn}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#c5a869] to-[#ebd397] flex items-center justify-center shadow-lg shadow-[#c5a869]/20">
                    <Shield className="w-6 h-6 text-[#181512]" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-serif text-[#c5a869] tracking-wider leading-none">{isRtl ? settings.platformNameAr : settings.platformNameEn}</h1>
                    <p className="text-xs text-white/40 tracking-[0.2em] mt-1 uppercase">{settings.platformNameEn}</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-3 sm:gap-4">
              {onChangeLang && (
                <div className="flex items-center gap-1 bg-white/5 border border-white/10 p-1 rounded-xl">
                  <button
                    onClick={() => onChangeLang('ar')}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      lang === 'ar' ? 'bg-[#c5a869] text-[#181512]' : 'text-white/60 hover:text-white'
                    }`}
                  >
                    العربية
                  </button>
                  <button
                    onClick={() => onChangeLang('en')}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      lang === 'en' ? 'bg-[#c5a869] text-[#181512]' : 'text-white/60 hover:text-white'
                    }`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => onChangeLang('tr')}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      lang === 'tr' ? 'bg-[#c5a869] text-[#181512]' : 'text-white/60 hover:text-white'
                    }`}
                  >
                    Türkçe
                  </button>
                </div>
              )}

              <button 
                onClick={() => setIsRegistrationOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#c5a869] text-[#181512] font-bold text-sm hover:bg-[#ebd397] transition-all shadow-lg shadow-[#c5a869]/30 cursor-pointer whitespace-nowrap"
              >
                <UserPlus className="w-4 h-4" />
                <span>{isRtl ? 'سجل مكتبك' : lang === 'tr' ? 'Büro Kaydı' : 'Register'}</span>
              </button>
              <button 
                onClick={() => storageService.clearCacheAndRefreshApp()}
                className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition-colors bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-2 rounded-lg cursor-pointer"
                title={isRtl ? 'مسح الكاش وتحديث الصفحة' : lang === 'tr' ? 'Önbelleği Temizle ve Yenile' : 'Clear Cache & Refresh'}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{isRtl ? 'تحديث الكاش' : lang === 'tr' ? 'Önbelleği Temizle' : 'Clear Cache'}</span>
              </button>
              <button 
                onClick={onAdminClick}
                className="flex items-center gap-2 text-sm font-medium text-white/60 hover:text-white transition-colors"
              >
                <Server className="w-4 h-4" />
                <span>{isRtl ? 'إدارة المنصة' : lang === 'tr' ? 'Platform Yönetimi' : 'Platform Admin'}</span>
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
              {isRtl ? settings.heroBadgeAr : lang === 'tr' ? translateTextSync(settings.heroBadgeAr, 'tr') : settings.heroBadgeEn}
            </div>
            <h2 className="text-5xl md:text-7xl font-serif text-white mb-6 leading-tight drop-shadow-[0_4px_20px_rgba(0,0,0,0.9)]" dangerouslySetInnerHTML={{__html: isRtl ? settings.heroHeadingAr : settings.heroHeadingEn}} />
            <p className="text-lg md:text-xl text-white/90 mb-10 leading-relaxed max-w-2xl mx-auto drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] font-medium">
              {isRtl ? settings.heroSubheadingAr : lang === 'tr' ? translateTextSync(settings.heroSubheadingAr, 'tr') : settings.heroSubheadingEn}
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={() => setIsRegistrationOpen(true)}
                className="w-full sm:w-auto bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white px-10 py-4 rounded-xl text-lg font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xl"
              >
                <UserPlus className="w-5 h-5 text-[#c5a869]" />
                <span>{isRtl ? 'سجل مكتبك الآن' : lang === 'tr' ? 'Büronuzu Şimdi Kaydedin' : 'Register Your Firm'}</span>
              </button>
              <button 
                onClick={() => document.getElementById('directory')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full sm:w-auto bg-gradient-to-r from-[#c5a869] to-[#ebd397] hover:from-[#b38a38] hover:to-[#c5a869] text-[#181512] px-10 py-4 rounded-xl text-lg font-bold transition-all shadow-xl shadow-[#c5a869]/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Building className="w-5 h-5" />
                <span>{isRtl ? settings.ctaSecondaryAr : lang === 'tr' ? 'Onaylı Büroları Keşfet' : settings.ctaSecondaryEn}</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Directory Section */}
      <section id="directory" className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <h3 className="text-3xl font-serif text-white mb-3">{isRtl ? "دليل المكاتب المعتمدة" : lang === 'tr' ? "Kayıtlı Hukuk Büroları Rehberi" : "Registered Firms Directory"}</h3>
              <p className="text-white/50 max-w-2xl text-sm sm:text-base">{isRtl ? "تصفح قائمة بمكاتب المحاماة الموثوقة والمسجلة في منصتنا، وابحث عن اسم المكتب أو تواصل معهم مباشرة." : lang === 'tr' ? "Platformumuzda kayıtlı güvenilir hukuk bürolarının listesine göz atın ve doğrudan iletişime geçin." : "Browse the list of trusted law firms registered on our platform and connect with them directly."}</p>
            </div>
            <div className="text-[#c5a869] bg-[#c5a869]/10 px-4 py-2 rounded-xl font-medium border border-[#c5a869]/20 inline-flex items-center gap-2 self-start md:self-auto">
              <Scale className="w-5 h-5" />
              <span>{activeFirms.length} {isRtl ? "مكتب معتمد" : lang === 'tr' ? "Kayıtlı Büro" : "Registered Firms"}</span>
            </div>
          </div>

          {/* Real-time Office Search & Filtering Controls */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5 mb-8 backdrop-blur-md space-y-4 shadow-xl">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              {/* Main Office Search Input */}
              <div className="relative flex-1">
                <Search className="absolute right-3.5 rtl:right-3.5 rtl:left-auto ltr:left-3.5 ltr:right-auto top-1/2 -translate-y-1/2 w-5 h-5 text-[#c5a869] pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    isRtl
                      ? "ابحث عن اسم المكتب القانوني، اسم المحامي، أو المدينة..."
                      : lang === 'tr'
                      ? "Büro adı, avukat veya şehir ara..."
                      : "Search by law office name, attorney, or city..."
                  }
                  className="w-full bg-slate-950/80 border border-white/15 focus:border-[#c5a869] focus:ring-2 focus:ring-[#c5a869]/30 rounded-xl py-3 px-11 text-white placeholder-white/40 text-sm sm:text-base transition-all outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute left-3.5 rtl:left-3.5 rtl:right-auto ltr:right-3.5 ltr:left-auto top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    title={isRtl ? "مسح البحث" : "Clear search"}
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Match Count Badge & Reset */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="text-xs text-white/70 bg-white/5 border border-white/10 px-3.5 py-3 rounded-xl flex items-center gap-2">
                  <Scale className="w-4 h-4 text-[#c5a869]" />
                  <span>
                    {isRtl
                      ? `تم العثور على ${filteredFirms.length} من أصل ${activeFirms.length} مكتب`
                      : `Found ${filteredFirms.length} of ${activeFirms.length} firms`}
                  </span>
                </div>
                {(searchQuery || selectedCity !== 'all') && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCity('all');
                    }}
                    className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                    title={isRtl ? 'إعادة ضبط كل الفلاتر' : 'Reset all filters'}
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                    <span className="hidden sm:inline">{isRtl ? 'إعادة ضبط' : 'Reset'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* City Filter Pills */}
            {uniqueCities.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap pt-3 border-t border-white/5 text-xs">
                <span className="text-white/40 flex items-center gap-1 ml-1 rtl:ml-1 ltr:mr-1">
                  <MapPin className="w-3.5 h-3.5 text-[#c5a869]" />
                  <span>{isRtl ? 'المدينة:' : 'City:'}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedCity('all')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                    selectedCity === 'all'
                      ? 'bg-[#c5a869] text-slate-950 font-bold shadow-sm'
                      : 'bg-white/5 text-white/70 hover:text-white hover:bg-white/10 border border-white/5'
                  }`}
                >
                  {isRtl ? 'جميع المدن' : 'All Cities'}
                </button>
                {uniqueCities.map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => setSelectedCity(selectedCity === city ? 'all' : city)}
                    className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                      selectedCity === city
                        ? 'bg-[#c5a869] text-slate-950 font-bold shadow-sm'
                        : 'bg-white/5 text-white/70 hover:text-white hover:bg-white/10 border border-white/5'
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>
            )}
          </div>

          {isLoading && activeFirms.length === 0 ? (
            <div className="text-center py-20 bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center justify-center">
              <div className="w-10 h-10 border-4 border-[#c5a869] border-t-transparent rounded-full animate-spin mb-4"></div>
              <h4 className="text-xl text-white mb-2">{isRtl ? "جاري تحميل المكاتب..." : lang === 'tr' ? "Bürolar Yükleniyor..." : "Loading Firms..."}</h4>
              <p className="text-white/50">{isRtl ? "يرجى الانتظار بينما نقوم بجلب قائمة المكاتب المعتمدة." : lang === 'tr' ? "Kayıtlı hukuk bürolarını getirirken lütfen bekleyin." : "Please wait while we fetch the registered law firms."}</p>
            </div>
          ) : filteredFirms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFirms.map((firm) => {
                const logo = firm.logoUrl || (firm.data?.settings as any)?.customLogoUrl || (firm.data?.settings as any)?.logoUrl;
                const firmSettings = firm.data?.settings;
                const rawNameAr = firm.nameAr || firmSettings?.firmNameAr || 'مكتب محاماة معتمد';
                const name = lang === 'ar'
                  ? rawNameAr
                  : firmSettings
                  ? getLocalized(firmSettings, 'firmName', lang, firm.nameEn || rawNameAr)
                  : getLocalized(firm, 'name', lang, rawNameAr);
                const firstOffice = (firm.data as any)?.offices?.[0];
                const rawCityAr = firm.cityAr || firstOffice?.cityAr || 'الرياض';
                const city = lang === 'ar'
                  ? rawCityAr
                  : firstOffice
                  ? getLocalized(firstOffice, 'city', lang, firm.cityEn || rawCityAr)
                  : getLocalized(firm, 'city', lang, rawCityAr);
                const rawTaglineAr = firm.taglineAr || firmSettings?.sloganAr || '';
                const tagline = lang === 'ar'
                  ? rawTaglineAr
                  : firmSettings
                  ? getLocalized(firmSettings, 'slogan', lang, firm.taglineEn || rawTaglineAr)
                  : getLocalized(firm, 'tagline', lang, rawTaglineAr);
                return (
                  <a 
                    key={firm.id}
                    href={`/?firm=${firm.slug}`}
                    onMouseEnter={() => {
                      firmService.fetchSingleFirmFast(firm.slug).catch(() => {});
                    }}
                    onTouchStart={() => {
                      firmService.fetchSingleFirmFast(firm.slug).catch(() => {});
                    }}
                    onClick={(e) => {
                      if (onSelectFirm) {
                        e.preventDefault();
                        onSelectFirm(firm.slug);
                      }
                    }}
                    className="group block bg-white/5 border border-white/10 rounded-2xl p-5 sm:p-6 hover:bg-white/10 hover:border-[#c5a869]/50 transition-all shadow-lg hover:shadow-2xl hover:shadow-[#c5a869]/10 cursor-pointer"
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
                        <div className="flex items-start justify-between gap-2 mb-1.5 flex-wrap">
                          <h4 className="text-base sm:text-lg font-bold text-white group-hover:text-[#c5a869] transition-colors leading-snug break-words">
                            {name}
                          </h4>
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#ebd397] bg-[#c5a869]/15 px-2.5 py-0.5 rounded-full border border-[#c5a869]/30 shadow-xs">
                            <Shield className="w-3 h-3 text-[#c5a869]" />
                            <span>{isRtl ? 'مكتب معتمد' : lang === 'tr' ? 'Onaylı Hukuk Bürosu' : 'Verified'}</span>
                          </span>
                        </div>
                        
                        {tagline && (
                          <p className="text-xs text-white/70 mb-3 font-normal leading-relaxed break-words">
                            {tagline}
                          </p>
                        )}

                        <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-white/10 text-xs">
                          <div className="flex items-center gap-1.5 text-white/70">
                            <MapPin className="w-3.5 h-3.5 text-[#c5a869] shrink-0" />
                            <span className="break-words">{city}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setQrModalFirm(firm);
                              }}
                              className="p-1.5 px-2 rounded-md bg-white/10 hover:bg-[#c5a869] text-white hover:text-[#181512] transition-colors flex items-center gap-1 text-xs font-semibold cursor-pointer"
                              title={isRtl ? 'عرض ومسح باركود المكتب' : 'Show Firm QR Code'}
                            >
                              <QrCode className="w-3.5 h-3.5 text-[#c5a869] group-hover:text-inherit" />
                              <span>{isRtl ? 'الباركود QR' : 'QR'}</span>
                            </button>

                            <div className="flex items-center gap-1 text-xs text-[#ebd397] font-semibold bg-[#c5a869]/15 px-2.5 py-1 rounded-md border border-[#c5a869]/30 group-hover:bg-[#c5a869] group-hover:text-[#181512] transition-colors">
                              <span>{isRtl ? 'زيارة الموقع' : lang === 'tr' ? 'Siteyi Ziyaret Et' : 'Visit Site'}</span>
                              <ArrowIcon className="w-3 h-3" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          ) : activeFirms.length > 0 ? (
            /* Search yielded no results */
            <div className="text-center py-16 bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4 text-[#c5a869]">
                <Search className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold text-white mb-2">
                {isRtl ? 'لم يتم العثور على مكاتب تطابق بحثك' : 'No law firms match your search'}
              </h4>
              <p className="text-white/50 text-sm max-w-md mx-auto mb-6">
                {isRtl
                  ? `لا توجد نتائج تطابق "${searchQuery}". تأكد من صحة كتابة اسم المكتب أو جرب البحث بكلمة أخرى أو تصفح جميع المدن.`
                  : `No results matching "${searchQuery}". Try a different keyword or reset filters.`}
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCity('all');
                }}
                className="px-6 py-2.5 rounded-xl bg-[#c5a869] hover:bg-[#ebd397] text-[#181512] font-bold text-sm transition cursor-pointer inline-flex items-center gap-2 shadow-lg shadow-[#c5a869]/20"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{isRtl ? 'عرض جميع المكاتب' : 'Show All Firms'}</span>
              </button>
            </div>
          ) : (
            <div className="text-center py-20 bg-white/5 border border-white/10 rounded-2xl">
              <Scale className="w-12 h-12 text-white/20 mx-auto mb-4" />
              <h4 className="text-xl text-white mb-2">{isRtl ? "لا توجد مكاتب مسجلة حالياً" : lang === 'tr' ? "Şu anda kayıtlı hukuk bürosu bulunmamaktadır" : "No firms registered currently"}</h4>
              <p className="text-white/50">{isRtl ? "يرجى مراجعة إدارة المنصة لتفعيل المكاتب." : lang === 'tr' ? "Büroları etkinleştirmek için lütfen platform yönetimiyle iletişime geçin." : "Please contact platform administration to activate firms."}</p>
            </div>
          )}
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-black/40 border-t border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-serif text-white mb-4">
              {isRtl ? `لماذا تختار منصة ${settings.platformNameAr}؟` : lang === 'tr' ? `Neden ${settings.platformNameEn} Platformunu Seçmelisiniz?` : `Why Choose ${settings.platformNameEn}?`}
            </h3>
            <p className="text-white/50 max-w-2xl mx-auto">
              {isRtl ? 'نوفر لك كل ما تحتاجه لإدارة مكتب محاماة عصري وموثوق.' : lang === 'tr' ? 'Modern ve güvenilir bir hukuk bürosunu yönetmek için ihtiyacınız olan her şeyi sunuyoruz.' : 'We provide everything you need to manage a modern, trusted law firm.'}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-colors">
              <div className="w-12 h-12 bg-[#c5a869]/10 rounded-xl flex items-center justify-center mb-6">
                <Globe className="w-6 h-6 text-[#c5a869]" />
              </div>
              <h4 className="text-xl font-medium text-white mb-3">
                {isRtl ? 'نطاق رسمي وموقع مستقل' : lang === 'tr' ? 'Resmi Alan Adı ve Bağımsız Web Sitesi' : 'Official Domain & Independent Website'}
              </h4>
              <p className="text-white/50 leading-relaxed">
                {isRtl
                  ? 'رابط رسمي ونطاق مخصص لمكتبك (مثال: nahwi.mohamoon.sa أو نطاقك الخاص المستقل .sa / .com) بواجهة مهنية فاخرة تعكس هويتك القانونية.'
                  : lang === 'tr'
                  ? 'Hukuki kimliğinizi yansıtan prestijli ve profesyonel bir arayüzle büronuza özel resmi bağlantı ve alan adı.'
                  : 'An official dedicated domain for your law firm with a prestigious executive interface that reflects your legal identity.'}
              </p>
            </div>
            
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-colors">
              <div className="w-12 h-12 bg-[#c5a869]/10 rounded-xl flex items-center justify-center mb-6">
                <Briefcase className="w-6 h-6 text-[#c5a869]" />
              </div>
              <h4 className="text-xl font-medium text-white mb-3">
                {isRtl ? 'إدارة متكاملة' : lang === 'tr' ? 'Entegre Yönetim Paneli' : 'Integrated Management'}
              </h4>
              <p className="text-white/50 leading-relaxed">
                {isRtl
                  ? 'لوحة تحكم خاصة بك لإدارة المحتوى، فريق العمل، الخدمات، واستقبال طلبات الاستشارة مباشرة.'
                  : lang === 'tr'
                  ? 'İçeriği, ekibinizi, uzmanlık alanlarınızı yönetmek ve danışmanlık taleplerini doğrudan almak için özel kontrol paneli.'
                  : 'A dedicated control panel to manage content, team members, practice areas, and receive consultation requests directly.'}
              </p>
            </div>
            
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-colors">
              <div className="w-12 h-12 bg-[#c5a869]/10 rounded-xl flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-[#c5a869]" />
              </div>
              <h4 className="text-xl font-medium text-white mb-3">
                {isRtl ? 'أمان وسرية' : lang === 'tr' ? 'Güvenlik ve Gizlilik' : 'Security & Confidentiality'}
              </h4>
              <p className="text-white/50 leading-relaxed">
                {isRtl
                  ? 'حماية فائقة لبيانات مكتبك وعملائك من خلال خوادم مشفرة ونظام صلاحيات متقدم.'
                  : lang === 'tr'
                  ? 'Şifreli sunucular ve gelişmiş yetkilendirme sistemi ile büronuzun ve müvekkillerinizin verileri için üst düzey koruma.'
                  : 'Superior protection for your firm and client data through encrypted cloud servers and advanced access controls.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Pricing Plans Section */}
      <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-950 border-t border-white/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#c5a869]/10 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#c5a869]/10 border border-[#c5a869]/30 text-[#c5a869] text-xs font-semibold">
              <Sparkles className="w-4 h-4" />
              <span>{isRtl ? 'باقات الاشتراك والأسعار' : lang === 'tr' ? 'Abonelik Planları ve Fiyatlandırma' : 'Subscription Plans & Pricing'}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {isRtl ? 'خطط أسعار شفافة ومرنة تناسب كافة المكاتب القانونية' : lang === 'tr' ? 'Tüm Hukuk Büroları İçin Esnek ve Şeffaf Fiyatlandırma' : 'Transparent & Flexible Pricing Plans for Every Law Firm'}
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              {isRtl ? 'أنشئ موقع مكتبك الرسمي وانضم إلى المنصة الآن مع إمكانية إدارة شؤونك القانونية بكل كفاءة وسهولة.' : lang === 'tr' ? 'Büronuzun resmi web sitesini oluşturun ve hukuki süreçlerinizi kolayca yönetin.' : 'Launch your official firm website and manage legal operations with ease.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {plans
              .filter(p => p.isActive)
              .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
              .map(plan => {
                const priceDisplay = lang === 'ar' ? `${plan.priceSAR} ر.س` : lang === 'tr' ? `${plan.priceTRY || plan.priceSAR} ₺` : `$${plan.priceUSD}`;
                const cycleText = plan.billingCycle === 'annual' ? (isRtl ? '/ سنوياً' : ' / year') : (isRtl ? '/ شهرياً' : ' / month');

                return (
                  <div 
                    key={plan.id}
                    className={`relative rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 ${
                      plan.isPopular 
                        ? 'bg-gradient-to-b from-slate-900 to-slate-900/90 border-2 border-[#c5a869] shadow-2xl shadow-[#c5a869]/10 scale-105 z-10' 
                        : 'bg-slate-900/60 border border-white/10 hover:border-white/20'
                    }`}
                  >
                    {plan.isPopular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#c5a869] text-slate-950 font-bold text-xs uppercase tracking-wider shadow-md">
                        {isRtl ? (plan.badgeAr || 'الأكثر طلباً واختياراً') : (plan.badgeEn || 'Most Popular')}
                      </div>
                    )}

                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-white font-serif-title">{isRtl ? plan.nameAr : plan.nameEn}</h3>
                        <span className="text-xs px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300 font-mono">
                          {plan.tier}
                        </span>
                      </div>

                      <p className="text-xs text-slate-400 mb-6 min-h-[36px] leading-relaxed">
                        {isRtl ? plan.descriptionAr : plan.descriptionEn}
                      </p>

                      <div className="mb-6 pb-6 border-b border-white/10 flex items-baseline gap-2">
                        <span className="text-3xl sm:text-4xl font-black text-[#c5a869] font-serif-title">{priceDisplay}</span>
                        <span className="text-xs text-slate-400">{cycleText}</span>
                      </div>

                      <div className="space-y-3 mb-8">
                        <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                          {isRtl ? 'الميزات والقدرات المشمولة:' : 'Included Features & Capabilities:'}
                        </div>
                        
                        <div className="flex items-center gap-2 text-xs text-slate-300">
                          <Check className="w-4 h-4 text-[#c5a869] shrink-0" />
                          <span>{isRtl ? `عدد المحامين: ${plan.maxLawyers === 999 ? 'غير محدود' : plan.maxLawyers}` : `Lawyers: ${plan.maxLawyers === 999 ? 'Unlimited' : plan.maxLawyers}`}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-300">
                          <Check className="w-4 h-4 text-[#c5a869] shrink-0" />
                          <span>{isRtl ? `مساحة التخزين المشفرة: ${plan.storageGB} جيجابايت` : `Secure Storage: ${plan.storageGB} GB`}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-300">
                          <Check className="w-4 h-4 text-[#c5a869] shrink-0" />
                          <span>{isRtl ? `الدعم الفني: ${plan.supportLevelAr}` : `Support: ${plan.supportLevelAr}`}</span>
                        </div>

                        {(isRtl ? plan.featuresAr : plan.featuresEn)?.map((feat, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                            <Check className="w-4 h-4 text-[#c5a869] shrink-0" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsRegistrationOpen(true)}
                      className={`w-full py-3 px-6 rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-lg ${
                        plan.isPopular
                          ? 'bg-[#c5a869] hover:bg-[#b09358] text-slate-950 shadow-[#c5a869]/20'
                          : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                      }`}
                    >
                      <span>{isRtl ? 'اختر هذه الباقة وسجل الآن' : lang === 'tr' ? 'Bu Planı Seç ve Kaydol' : 'Select Plan & Register Now'}</span>
                      {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                    </button>
                  </div>
                );
              })}
          </div>
        </div>
      </section>

      {/* Platform Executive Footer */}
      <footer className="bg-slate-950 border-t border-white/10 py-12 px-4 sm:px-6 lg:px-8 relative z-10 text-white/70">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            {settings.platformLogoUrl ? (
              <img
                src={settings.platformLogoUrl}
                alt={isRtl ? settings.platformNameAr : settings.platformNameEn}
                className="h-10 w-auto max-w-[150px] object-contain drop-shadow-md rounded"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#c5a869] to-[#ebd397] flex items-center justify-center text-slate-950 font-bold shadow-md">
                <Shield className="w-6 h-6 text-[#181512]" />
              </div>
            )}
            <div>
              <div className="text-base font-serif text-[#c5a869] font-bold">
                {isRtl ? settings.platformNameAr : settings.platformNameEn}
              </div>
              <div className="text-xs text-white/50">
                {isRtl ? settings.heroBadgeAr : settings.heroBadgeEn}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-white/60">
            <button
              onClick={() => {
                document.getElementById('directory')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hover:text-[#c5a869] transition-colors cursor-pointer"
            >
              {isRtl ? 'دليل وبحث المكاتب' : 'Directory & Search'}
            </button>
            <button
              onClick={() => setIsRegistrationOpen(true)}
              className="hover:text-[#c5a869] transition-colors cursor-pointer"
            >
              {isRtl ? 'تسجيل مكتب محاماة' : 'Register Law Firm'}
            </button>
            <button
              onClick={onAdminClick}
              className="hover:text-[#c5a869] transition-colors cursor-pointer"
            >
              {isRtl ? 'إدارة المنصة' : 'Platform Administration'}
            </button>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="hover:text-[#c5a869] transition-colors cursor-pointer"
            >
              {isRtl ? 'العودة للأعلى ↑' : 'Back to top ↑'}
            </button>
          </div>

          <div className="text-xs text-white/40 text-center md:text-start">
            © {new Date().getFullYear()} {isRtl ? settings.platformNameAr : settings.platformNameEn}. {isRtl ? 'كافة الحقوق محفوظة.' : 'All rights reserved.'}
          </div>
        </div>
      </footer>

      {isRegistrationOpen && (
        <FirmRegistrationModal 
          isOpen={isRegistrationOpen} 
          onClose={() => {
            setIsRegistrationOpen(false);
            loadFirms();
          }} 
          onFirmRegistered={() => {
            loadFirms();
          }}
          lang={lang} 
        />
      )}

      {qrModalFirm && (
        <FirmQRCodeModal
          isOpen={!!qrModalFirm}
          onClose={() => setQrModalFirm(null)}
          firmName={qrModalFirm.nameAr}
          firmSlug={qrModalFirm.slug}
          tagline={qrModalFirm.taglineAr}
          city={qrModalFirm.cityAr}
          phone={qrModalFirm.phone}
          themeColor={qrModalFirm.themeColor}
          lang={lang}
        />
      )}
    </div>
  );
};
