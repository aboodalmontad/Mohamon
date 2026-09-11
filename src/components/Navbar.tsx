import React, { useState, useEffect, useRef } from 'react';
import { Scale, Phone, Globe, Menu, X, Shield, UserCheck, RefreshCw, ChevronDown, Check } from 'lucide-react';
import { SiteSettings, Language } from '../types';
import { useTranslation, getLocalized } from '../services/i18n';

interface NavbarProps {
  settings: SiteSettings;
  lang: Language;
  onChangeLang?: (lang: Language) => void;
  onToggleLang?: () => void;
  onOpenConsultation: (practiceId?: string, partnerId?: string) => void;
  onOpenAdmin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  lang,
  onChangeLang,
  onToggleLang,
  onOpenConsultation,
  onOpenAdmin,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);
  const t = useTranslation(lang);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close language dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
        setLangDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const languagesList: { code: Language; label: string; flag: string; nativeName: string }[] = [
    { code: 'ar', label: 'العربية', flag: '🇸🇦', nativeName: 'العربية' },
    { code: 'en', label: 'English', flag: '🇬🇧', nativeName: 'English' },
    { code: 'tr', label: 'Türkçe', flag: '🇹🇷', nativeName: 'Türkçe' },
  ];

  const handleSelectLanguage = (code: Language) => {
    if (onChangeLang) {
      onChangeLang(code);
    } else if (onToggleLang) {
      onToggleLang();
    }
    setLangDropdownOpen(false);
  };

  const navLinks = [
    { label: t.navHome, href: '#hero' },
    { label: t.navAbout, href: '#about' },
    { label: t.navPracticeAreas, href: '#practice-areas' },
    { label: t.navPartners, href: '#partners' },
    { label: t.navWhyUs, href: '#why-us' },
    { label: t.navAchievements, href: '#achievements' },
    { label: t.navTestimonials, href: '#testimonials' },
    { label: t.navBlog, href: '#blog' },
    { label: t.navContact, href: '#contact' },
  ];

  const currentFirmName = getLocalized(settings, 'firmName', lang, settings.firmNameAr);
  const currentSubtitle = lang === 'ar'
    ? (settings.navbarSubtitleAr || 'محامون ومستشارون قانونيون ومحكّمون')
    : lang === 'tr'
    ? (settings.navbarSubtitleTr || settings.navbarSubtitleEn || 'Avukatlar, Hukuk Müşavirleri ve Uluslararası Hakemler')
    : (settings.navbarSubtitleEn || 'Attorneys, Legal Counsel & Arbitrators');

  const currentLangObj = languagesList.find(l => l.code === lang) || languagesList[0];

  return (
    <>
      {/* Top emergency announcement bar */}
      <div className="bg-[#ede4d4] border-b border-[#c5a869]/30 text-xs text-[#4b4334] py-1.5 px-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-[#87641d] font-medium">
              <Shield className="w-3.5 h-3.5 text-[#b38a38]" />
              <span>{t.topAccredited}</span>
            </span>
            <span className="hidden sm:inline text-[#c8bcab]">|</span>
            <span className="hidden sm:flex items-center gap-1.5 text-[#5c5343]">
              <Phone className="w-3 h-3 text-[#b38a38]" />
              <span>{t.topHotline}</span>
              <a href={`tel:${settings.emergencyPhone}`} className="text-[#181512] hover:text-[#87641d] font-bold font-mono ltr">
                {settings.emergencyPhone}
              </a>
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Selector Dropdown (AR / EN / TR) */}
            <div className="relative" ref={langDropdownRef}>
              <button
                type="button"
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/90 hover:bg-white text-[#4b4334] hover:text-[#87641d] border border-[#d8ceb8] shadow-xs text-xs font-bold transition cursor-pointer"
                title="Select Language / اختيار اللغة / Dil Seçimi"
                aria-expanded={langDropdownOpen}
              >
                <Globe className="w-3.5 h-3.5 text-[#87641d]" />
                <span className="text-sm leading-none">{currentLangObj.flag}</span>
                <span>{currentLangObj.nativeName}</span>
                <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${langDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 rtl:right-auto rtl:left-0 mt-1.5 w-36 bg-white rounded-xl shadow-xl border border-[#c5a869]/30 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#87641d] border-b border-[#f0eae0] mb-1">
                    {lang === 'ar' ? 'اختر اللغة' : lang === 'tr' ? 'Dil Seçin' : 'Select Language'}
                  </div>
                  {languagesList.map((item) => (
                    <button
                      key={item.code}
                      onClick={() => handleSelectLanguage(item.code)}
                      className={`w-full flex items-center justify-between px-3 py-1.5 text-xs text-left rtl:text-right transition cursor-pointer hover:bg-[#f7f2e8] ${
                        lang === item.code ? 'font-bold text-[#87641d] bg-[#b38a38]/10' : 'text-[#3b352b]'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-sm">{item.flag}</span>
                        <span>{item.label}</span>
                      </span>
                      {lang === item.code && <Check className="w-3.5 h-3.5 text-[#87641d]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick reload cache button */}
            <button
              onClick={() => {
                if (confirm(t.refreshConfirm)) {
                  localStorage.clear();
                  sessionStorage.clear();
                  if ('serviceWorker' in navigator) {
                    navigator.serviceWorker.getRegistrations().then(registrations => {
                      for (let registration of registrations) {
                        registration.unregister();
                      }
                    });
                  }
                  window.location.reload();
                }
              }}
              className="text-xs text-[#5c5343] hover:text-[#181512] flex items-center gap-1 transition px-2 py-1 rounded-lg bg-white/80 border border-[#d8ceb8] cursor-pointer"
              title={t.refreshApp}
            >
              <RefreshCw className="w-3 h-3 text-[#87641d]" />
              <span className="font-medium hidden sm:inline">{t.refreshApp}</span>
            </button>

            {/* Admin Panel Trigger */}
            <button
              onClick={onOpenAdmin}
              className="text-xs text-[#5c5343] hover:text-[#181512] flex items-center gap-1 transition px-2.5 py-1 rounded-lg bg-white/80 border border-[#d8ceb8] cursor-pointer hover:bg-[#b38a38]/15"
              title={t.adminPanel}
            >
              <UserCheck className="w-3 h-3 text-[#87641d]" />
              <span className="font-medium">{t.adminPanel}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Sticky Navbar */}
      <header
        className={`fixed top-[31px] left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-[#fbf8f2]/95 backdrop-blur-md shadow-lg py-2.5 border-b border-[#e6ddcc]'
            : 'bg-[#fbf8f2]/90 backdrop-blur-sm py-3.5 border-b border-[#e6ddcc]/60'
        }`}
      >
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center ${
          settings.brandingPositionNavbar === 'center' ? 'justify-between lg:justify-center lg:relative' : 'justify-between'
        }`}>
          {/* Brand Logo & Name */}
          <div className={`flex items-center gap-2 ${
            settings.brandingPositionNavbar === 'center' ? 'lg:absolute lg:left-1/2 lg:-translate-x-1/2 rtl:lg:translate-x-1/2' : ''
          }`}>
            <a 
              href="#hero" 
              className={`flex group transition-all duration-300 ${
                settings.brandingLayout === 'vertical' ? 'flex-col items-center text-center gap-1.5' : 'flex-row items-center gap-3'
              }`}
            >
              {/* Logo Container with Dynamic Size & Shape */}
              {(() => {
                const sizeMap = {
                  sm: 'w-9 h-9',
                  md: 'w-11 h-11',
                  lg: 'w-14 h-14',
                  xl: 'w-16 h-16',
                };
                const logoSizeClass = sizeMap[settings.logoSizeNavbar || 'md'];

                const shapeClass = settings.logoShape === 'circle' 
                  ? 'rounded-full' 
                  : settings.logoShape === 'square' 
                  ? 'rounded-none' 
                  : settings.logoShape === 'transparent'
                  ? 'bg-transparent border-transparent shadow-none'
                  : 'rounded-xl';

                return (
                  <div className={`${logoSizeClass} ${shapeClass} ${
                    settings.logoShape === 'transparent' 
                      ? '' 
                      : 'bg-gradient-to-br from-[#b38a38] via-[#c5a869] to-[#87641d] p-0.5 shadow-md flex items-center justify-center'
                  } group-hover:scale-105 transition-transform flex-shrink-0`}>
                    {settings.customLogoUrl ? (
                      <img
                        src={settings.customLogoUrl}
                        alt={currentFirmName}
                        className={`w-full h-full object-contain ${
                          settings.logoShape === 'circle' 
                            ? 'rounded-full' 
                            : settings.logoShape === 'square' 
                            ? 'rounded-none' 
                            : settings.logoShape === 'transparent'
                            ? ''
                            : 'rounded-[10px]'
                        } bg-white`}
                      />
                    ) : (
                      <div className={`w-full h-full ${
                        settings.logoShape === 'transparent' 
                          ? 'bg-transparent' 
                          : 'bg-[#181512]'
                      } ${
                        settings.logoShape === 'circle' 
                          ? 'rounded-full' 
                          : settings.logoShape === 'square' 
                          ? 'rounded-none' 
                          : 'rounded-[10px]'
                      } flex items-center justify-center`}>
                        <Scale className="w-5 h-5 text-[#c5a869]" />
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Firm Name & Subtitle with Dynamic Size & Typography */}
              <div className={`flex flex-col ${settings.brandingLayout === 'vertical' ? 'items-center text-center' : 'items-start'}`}>
                {(() => {
                  const sizeMap = {
                    sm: 'text-base sm:text-lg',
                    md: 'text-lg sm:text-xl',
                    lg: 'text-xl sm:text-2xl',
                    xl: 'text-2xl sm:text-3xl',
                  };
                  const weightMap = {
                    normal: 'font-normal',
                    semibold: 'font-semibold',
                    bold: 'font-bold',
                    extrabold: 'font-extrabold',
                  };
                  const firmNameSizeClass = sizeMap[settings.firmNameSizeNavbar || 'md'];
                  const firmNameWeightClass = weightMap[settings.firmNameWeightNavbar || 'bold'];
                  const lineClass = settings.firmNameLinesNavbar === '1'
                    ? 'line-clamp-1 truncate max-w-[260px] sm:max-w-[380px] lg:max-w-[450px]'
                    : settings.firmNameLinesNavbar === '2'
                    ? 'line-clamp-2 max-w-[260px] sm:max-w-[380px] lg:max-w-[450px]'
                    : 'max-w-[260px] sm:max-w-[420px] lg:max-w-[500px]';

                  return (
                    <span className={`font-firm-name ${firmNameWeightClass} ${firmNameSizeClass} ${lineClass} text-[#181512] tracking-wide leading-tight group-hover:text-[#87641d] transition`}>
                      {currentFirmName}
                    </span>
                  );
                })()}

                {settings.showNavbarSubtitle !== false && (
                  <span className="font-navbar-brand text-[10px] text-[#87641d] uppercase tracking-wider font-bold mt-0.5">
                    {currentSubtitle}
                  </span>
                )}
              </div>
            </a>
          </div>

          {/* Desktop Nav Links */}
          <nav className={`hidden lg:flex items-center gap-6 text-sm font-semibold font-navbar-brand ${
            settings.brandingPositionNavbar === 'center' ? 'ltr:mr-auto rtl:ml-auto' : ''
          }`}>
            {navLinks.map((link, idx) => (
              <a
                key={idx}
                href={link.href}
                className="text-[#3b352b] hover:text-[#87641d] transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-[#b38a38] hover:after:w-full after:transition-all after:duration-300"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* CTA Consultation Button */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={() => onOpenConsultation()}
              className="relative inline-flex items-center justify-center px-6 py-2.5 overflow-hidden font-medium text-white transition duration-300 ease-out rounded-xl shadow-md group bg-gradient-to-r from-[#b38a38] via-[#c5a869] to-[#87641d] hover:brightness-105 active:scale-95 cursor-pointer font-bold text-sm"
            >
              <span className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-white" />
                <span>{t.bookConsultation}</span>
              </span>
            </button>
          </div>

          {/* Mobile Menu Trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-white text-[#181512] hover:text-[#87641d] border border-[#d8ceb8] shadow-sm cursor-pointer"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#fbf8f2] border-b border-[#c5a869]/30 px-6 py-6 space-y-4 backdrop-blur-xl shadow-xl">
            {/* Mobile Language Switcher */}
            <div className="flex items-center justify-between pb-3 border-b border-[#e6ddcc]">
              <span className="text-xs font-bold text-[#87641d] uppercase tracking-wider">
                {lang === 'ar' ? 'اللغة' : lang === 'tr' ? 'Dil' : 'Language'}
              </span>
              <div className="flex items-center gap-1 bg-[#ede4d4] p-1 rounded-xl">
                {languagesList.map((item) => (
                  <button
                    key={item.code}
                    onClick={() => {
                      handleSelectLanguage(item.code);
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                      lang === item.code
                        ? 'bg-white text-[#87641d] shadow-sm'
                        : 'text-[#5c5343] hover:text-[#181512]'
                    }`}
                  >
                    <span className="mr-1">{item.flag}</span>
                    {item.code.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col space-y-3">
              {navLinks.map((link, idx) => (
                <a
                  key={idx}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-[#181512] hover:text-[#87641d] text-base py-1.5 border-b border-[#e6ddcc] font-medium"
                >
                  {link.label}
                </a>
              ))}
            </div>

            <div className="pt-4 flex flex-col gap-3">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenConsultation();
                }}
                className="w-full py-3 rounded-lg bg-gradient-to-r from-[#d4af37] to-[#aa8022] text-slate-950 font-bold text-center shadow-lg cursor-pointer"
              >
                {t.bookConsultation}
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
