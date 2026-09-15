/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { AboutSection } from './components/AboutSection';
import { PracticeAreasSection } from './components/PracticeAreasSection';
import { PartnersSection } from './components/PartnersSection';
import { WhyChooseUsSection } from './components/WhyChooseUsSection';
import { AchievementsSection } from './components/AchievementsSection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { BlogSection } from './components/BlogSection';
import { ContactAndOfficesSection } from './components/ContactAndOfficesSection';
import { Footer } from './components/Footer';
const AdminDashboard = React.lazy(() => import('./components/AdminDashboard').then(module => ({ default: module.AdminDashboard })));
const SuperAdminDashboard = React.lazy(() => import('./components/SuperAdminDashboard').then(module => ({ default: module.SuperAdminDashboard })));
const LawyerSiteBuilderModal = React.lazy(() => import('./components/LawyerSiteBuilderModal').then(module => ({ default: module.LawyerSiteBuilderModal })));
const FirmsDirectoryModal = React.lazy(() => import('./components/FirmsDirectoryModal').then(module => ({ default: module.FirmsDirectoryModal })));
const ConsultationModal = React.lazy(() => import('./components/ConsultationModal').then(module => ({ default: module.ConsultationModal })));
import { FirmSuspendedNotice } from './components/FirmSuspendedNotice';
import { PlatformLanding } from './components/PlatformLanding';
import { storageService } from './services/storageService';
import { firmService } from './services/firmService';
import { applyTypographySettings } from './services/typographyService';
import { ChevronDown } from 'lucide-react';
import { Partner, PracticeArea, Testimonial, BlogPost, CaseStudy, SiteSettings, OfficeLocation, Language, LawFirm } from './types';

// Eagerly initialize cache synchronously before React even starts rendering for INSTANT load
let initialIsPlatformView = false;
if (typeof window !== 'undefined') {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const urlSlug = urlParams.get('firm');
    
    if (!urlSlug && (window.location.pathname === '/' || window.location.pathname === '')) {
      initialIsPlatformView = true;
    }
  } catch (err) {
    initialIsPlatformView = true;
  }
}

export default function App() {
  const [isPlatformView, setIsPlatformView] = useState(initialIsPlatformView);
  
  const [lang, setLang] = useState<Language>('ar');
  const [firmData, setFirmData] = useState(() => ({
    settings: storageService.getSettings(),
    partners: storageService.getPartners(),
    practiceAreas: storageService.getPracticeAreas(),
    caseStudies: storageService.getCaseStudies(),
    testimonials: storageService.getTestimonials(),
    blogPosts: storageService.getBlogPosts(),
    offices: storageService.getOffices()
  }));

  // App Initialization state: Fast path - no loading if cached
  const [isInitializing, setIsInitializing] = useState(true);

  // Multi-Firm State
  const [activeFirmSlug, setActiveFirmSlug] = useState<string>(() => firmService.getActiveFirmSlug());
  const [activeFirm, setActiveFirm] = useState<LawFirm | null>(() => firmService.getFirmBySlug(firmService.getActiveFirmSlug()));
  const [isFirmActive, setIsFirmActive] = useState<boolean>(() => firmService.isFirmSiteActive(firmService.getActiveFirmSlug()).isActive);

  // Modals state
  const [isConsultationOpen, setIsConsultationOpen] = useState(false);
  const [selectedPracticeId, setSelectedPracticeId] = useState<string | undefined>(undefined);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | undefined>(undefined);

  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isSuperAdminOpen, setIsSuperAdminOpen] = useState(false);
  const [isSiteBuilderOpen, setIsSiteBuilderOpen] = useState(false);
  const [isDirectoryOpen, setIsDirectoryOpen] = useState(false);

  // Sync state with storage service & active firm - optimized with callback
  const refreshData = React.useCallback(() => {
    const slug = firmService.getActiveFirmSlug();
    setActiveFirmSlug(slug);
    const firm = firmService.getFirmBySlug(slug);
    setActiveFirm(firm);
    const siteStatus = firmService.isFirmSiteActive(slug);
    setIsFirmActive(siteStatus.isActive);

    setFirmData({
      settings: storageService.getSettings(),
      partners: storageService.getPartners(),
      practiceAreas: storageService.getPracticeAreas(),
      caseStudies: storageService.getCaseStudies(),
      testimonials: storageService.getTestimonials(),
      blogPosts: storageService.getBlogPosts(),
      offices: storageService.getOffices()
    });
  }, []);

  useEffect(() => {
    const loadAppData = async () => {
      try {
        // 1. Initialize services inside effect
        firmService.initLocal();
        
        const urlParams = new URLSearchParams(window.location.search);
        const urlSlug = urlParams.get('firm') || firmService.getActiveFirmSlug();

        // Platform View check
        if (!urlSlug && (window.location.pathname === '/' || window.location.pathname === '')) {
          setIsPlatformView(true);
          // Start background fetch immediately
          firmService.init().then(() => {
            refreshData();
          }).catch(e => console.warn('Platform firms fetch failed:', e));
          
          setIsInitializing(false);
          return;
        }
        
        // Load specific firm from local storage first (instant)
        if (urlSlug) {
          storageService.loadFirm(urlSlug, false);
          refreshData();
        } else {
          storageService.init();
          refreshData();
        }

        // Fetch background updates from Supabase/API
        if (urlSlug) {
          firmService.fetchSingleFirmFromSupabase(urlSlug).then(sbRes => {
            if (sbRes.success && sbRes.firm) {
              firmService.setFirm(sbRes.firm);
              storageService.loadFirm(urlSlug, false);
              refreshData();
            }
          }).catch(() => {});
        }
        
        // Full background initialization
        firmService.init().catch(() => {});
      } catch (err) {
        console.error('Critical initialization error:', err);
      } finally {
        setIsInitializing(false);
      }
    };

    loadAppData();

    // Listen for live updates from Admin Dashboard and Firm Switcher
    const handleStorageChange = () => {
      refreshData();
    };

    const handlePopState = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const urlSlug = urlParams.get('firm') || firmService.getDefaultPublicFirmSlug();
      if (urlSlug !== firmService.getActiveFirmSlug()) {
        storageService.switchFirm(urlSlug);
        refreshData();
      }
    };

    // Discreet shortcut for Super Admin (Ctrl+Shift+S or Alt+S)
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 's') || (e.altKey && e.key.toLowerCase() === 's')) {
        e.preventDefault();
        setIsSuperAdminOpen(prev => !prev);
      }
    };

    window.addEventListener('aladl_storage_sync', handleStorageChange);
    window.addEventListener('aladl_firms_updated', handleStorageChange);
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('keydown', handleKeyDown);

    const handleScroll = () => {
      const scrollProgress = document.getElementById('scroll-progress');
      const backToTop = document.getElementById('back-to-top');
      
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      
      if (scrollProgress) {
        scrollProgress.style.width = scrolled + '%';
      }
      
      if (backToTop) {
        if (winScroll > 400) {
          backToTop.classList.add('scale-100', 'opacity-100');
          backToTop.classList.remove('scale-0', 'opacity-0');
        } else {
          backToTop.classList.add('scale-0', 'opacity-0');
          backToTop.classList.remove('scale-100', 'opacity-100');
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('aladl_storage_sync', handleStorageChange);
      window.removeEventListener('aladl_firms_updated', handleStorageChange);
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Update HTML document direction, title and typography on settings/language change
  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    
    if (isPlatformView) {
      document.title = lang === 'en' ? 'Lawyers Platform | منصة محامون' : 'منصة محامون';
    } else {
      if (lang === 'ar') {
        document.title = firmData.settings.firmNameAr || activeFirm?.nameAr || 'مكتب المحاماة';
      } else if (lang === 'tr') {
        document.title = firmData.settings.firmNameTr || firmData.settings.firmNameEn || activeFirm?.nameEn || 'Hukuk Bürosu';
      } else {
        document.title = firmData.settings.firmNameEn || activeFirm?.nameEn || 'Law Firm';
      }
    }

    applyTypographySettings(firmData.settings);
  }, [lang, firmData.settings, isPlatformView, activeFirm]);

  const handleChangeLang = (newLang: Language) => {
    setLang(newLang);
  };

  const handleOpenConsultation = (practiceId?: string, partnerId?: string) => {
    setSelectedPracticeId(practiceId);
    setSelectedPartnerId(partnerId);
    setIsConsultationOpen(true);
  };

  const handleSelectFirm = (slug: string) => {
    storageService.switchFirm(slug);
    refreshData();
  };

  const handleFirmCreated = (newFirm: LawFirm) => {
    storageService.switchFirm(newFirm.slug);
    refreshData();
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-[#181512] flex items-center justify-center flex-col gap-4">
        <div className="w-12 h-12 border-4 border-[#c5a869] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[#c5a869] font-serif text-lg tracking-widest animate-pulse">جاري تحميل بيانات المكتب...</p>
      </div>
    );
  }

  if (isPlatformView) {
    return (
      <>
        <PlatformLanding 
          onAdminClick={() => setIsSuperAdminOpen(true)}
          lang={lang}
        />
        {/* Render SuperAdminDashboard conditionally on top of the landing page */}
        {isSuperAdminOpen && (
          <SuperAdminDashboard
            isOpen={isSuperAdminOpen}
            onClose={() => setIsSuperAdminOpen(false)}
            lang={lang}
            onSelectFirmToManage={(firmSlug: string) => {
              // If super admin switches to a firm from platform view, we need to exit platform view and load the firm
              setIsSuperAdminOpen(false);
              setIsPlatformView(false);
              firmService.setActiveFirmSlug(firmSlug);
              storageService.switchFirm(firmSlug);
              refreshData();
            }}
            onOpenCreateModal={() => {}}
          />
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbf8f2] text-[#181512] selection:bg-[#b38a38]/30 selection:text-[#87641d] font-body-custom">
      
      {/* If current firm is suspended / expired, show the suspension notice */}
      {!isFirmActive && activeFirm ? (
        <FirmSuspendedNotice
          firm={activeFirm}
          lang={lang}
          onOpenFirmAdmin={() => setIsAdminOpen(true)}
          onOpenSuperAdmin={() => setIsSuperAdminOpen(true)}
        />
      ) : (
        <>
          {/* 1. Header / Navbar */}
          <div className="fixed top-0 left-0 w-full z-50 h-1 bg-[#e6ddcc]/30 pointer-events-none">
            <div id="scroll-progress" className="h-full bg-gradient-to-r from-[#b38a38] to-[#c5a869] w-0 transition-all duration-150 shadow-[0_0_10px_rgba(197,168,105,0.5)]"></div>
          </div>
          
          <Navbar
            settings={firmData.settings}
            lang={lang}
            onChangeLang={handleChangeLang}
            onOpenConsultation={handleOpenConsultation}
            onOpenAdmin={() => setIsAdminOpen(true)}
          />

          {/* Floating UI Elements */}
          <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3">
            {/* Scroll to Top */}
            <button
              id="back-to-top"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="p-3 rounded-full bg-white shadow-lg border border-[#e6ddcc] text-[#87641d] hover:bg-[#b38a38] hover:text-white transition-all duration-300 scale-0 opacity-0 cursor-pointer"
            >
              <ChevronDown className="w-6 h-6 rotate-180" />
            </button>
            
            {/* Quick Contact / WhatsApp (if enabled) */}
            <a
              href={`https://wa.me/${firmData.settings.phone?.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-full bg-[#25D366] shadow-lg text-white hover:scale-110 transition-transform duration-300 cursor-pointer flex items-center justify-center"
              title={lang === 'ar' ? 'تواصل عبر واتساب' : 'Contact via WhatsApp'}
            >
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <path d="M12.031 6.062c-3.414 0-6.191 2.777-6.191 6.191 0 1.094.285 2.122.783 3.016L5.95 18.05l2.871-.753a6.16 6.16 0 0 0 3.21.896c3.414 0 6.191-2.777 6.191-6.191 0-3.414-2.777-6.191-6.191-6.191zM12.031 17.1c-1.008 0-1.954-.265-2.772-.733l-.198-.112-1.688.442.45-1.644-.124-.197c-.504-.805-.771-1.74-.771-2.703 0-2.825 2.302-5.127 5.127-5.127 2.825 0 5.127 2.302 5.127 5.127 0 2.825-2.302 5.127-5.127 5.127z"/>
              </svg>
            </a>
          </div>

          {/* 2. Hero Section */}
          <HeroSection
            settings={firmData.settings}
            lang={lang}
            onOpenConsultation={() => handleOpenConsultation()}
          />

          {/* 3. About Us Section */}
          <AboutSection
            settings={firmData.settings}
            lang={lang}
            onOpenConsultation={() => handleOpenConsultation()}
          />

          {/* 4. Practice Areas Section */}
          <PracticeAreasSection
            practiceAreas={firmData.practiceAreas}
            partners={firmData.partners}
            lang={lang}
            onOpenConsultation={handleOpenConsultation}
          />

          {/* 5. Our Partners & Attorneys */}
          <PartnersSection
            partners={firmData.partners}
            lang={lang}
            onOpenConsultation={handleOpenConsultation}
          />

          {/* 6. Why Choose Us */}
          <WhyChooseUsSection
            lang={lang}
          />

          {/* 7. Landmark Achievements & Transactions */}
          <AchievementsSection
            caseStudies={firmData.caseStudies}
            lang={lang}
            onOpenConsultation={() => handleOpenConsultation()}
          />

          {/* 8. Client Testimonials */}
          <TestimonialsSection
            testimonials={firmData.testimonials}
            lang={lang}
          />

          {/* 9. Legal Blog & Thought Leadership */}
          <BlogSection
            blogPosts={firmData.blogPosts}
            lang={lang}
          />

          {/* 10. Contact & Interactive Office Locations */}
          <ContactAndOfficesSection
            settings={firmData.settings}
            practiceAreas={firmData.practiceAreas}
            offices={firmData.offices}
            lang={lang}
          />

          {/* 11. Footer */}
          <Footer
            settings={firmData.settings}
            practiceAreas={firmData.practiceAreas}
            lang={lang}
            onOpenConsultation={handleOpenConsultation}
            onOpenAdmin={() => setIsAdminOpen(true)}
            onOpenSuperAdmin={() => setIsSuperAdminOpen(true)}
          />
        </>
      )}

      {/* Modals */}
      <React.Suspense fallback={null}>
        <ConsultationModal
          isOpen={isConsultationOpen}
          onClose={() => setIsConsultationOpen(false)}
          partners={firmData.partners}
          practiceAreas={firmData.practiceAreas}
          defaultPracticeId={selectedPracticeId}
          defaultPartnerId={selectedPartnerId}
          lang={lang}
        />
      </React.Suspense>

      {/* Protected Admin Control Center - Single Firm Level */}
      <React.Suspense fallback={null}>
        <AdminDashboard
          isOpen={isAdminOpen}
          onClose={() => setIsAdminOpen(false)}
          lang={lang}
          onOpenSuperAdmin={() => {
            setIsAdminOpen(false);
            setIsSuperAdminOpen(true);
          }}
        />
      </React.Suspense>

      {/* Platform Owner Super Admin Dashboard - All Firms & Subscriptions & Supabase Cloud Sync */}
      <React.Suspense fallback={null}>
        <SuperAdminDashboard
          isOpen={isSuperAdminOpen}
          onClose={() => setIsSuperAdminOpen(false)}
          lang={lang}
          onSelectFirmToManage={(slug) => {
            handleSelectFirm(slug);
            setIsSuperAdminOpen(false);
            setIsAdminOpen(true);
          }}
          onOpenCreateModal={() => {
            setIsSuperAdminOpen(false);
            setIsSiteBuilderOpen(true);
          }}
        />
      </React.Suspense>

      {/* Lawyer 1-Click Site Builder Modal */}
      <React.Suspense fallback={null}>
        <LawyerSiteBuilderModal
          isOpen={isSiteBuilderOpen}
          onClose={() => setIsSiteBuilderOpen(false)}
          onFirmCreated={handleFirmCreated}
          lang={lang}
        />
      </React.Suspense>

      {/* Law Firms Directory Modal */}
      <React.Suspense fallback={null}>
        <FirmsDirectoryModal
          isOpen={isDirectoryOpen}
          onClose={() => setIsDirectoryOpen(false)}
          onSelectFirm={handleSelectFirm}
          onOpenAdmin={(slug) => {
            if (slug) handleSelectFirm(slug);
            setIsDirectoryOpen(false);
            setIsAdminOpen(true);
          }}
          lang={lang}
        />
      </React.Suspense>

    </div>
  );
}
