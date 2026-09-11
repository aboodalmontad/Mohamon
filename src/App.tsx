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
import { ConsultationModal } from './components/ConsultationModal';
import { AdminDashboard } from './components/AdminDashboard';
import { SuperAdminDashboard } from './components/SuperAdminDashboard';
import { LawyerSiteBuilderModal } from './components/LawyerSiteBuilderModal';
import { FirmsDirectoryModal } from './components/FirmsDirectoryModal';
import { FirmSuspendedNotice } from './components/FirmSuspendedNotice';
import { storageService } from './services/storageService';
import { firmService } from './services/firmService';
import { applyTypographySettings } from './services/typographyService';
import { Partner, PracticeArea, Testimonial, BlogPost, CaseStudy, SiteSettings, OfficeLocation, Language, LawFirm } from './types';

export default function App() {
  const [lang, setLang] = useState<Language>('ar');
  const [settings, setSettings] = useState<SiteSettings>(() => storageService.getSettings());
  const [partners, setPartners] = useState<Partner[]>([]);
  const [practiceAreas, setPracticeAreas] = useState<PracticeArea[]>([]);
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [offices, setOffices] = useState<OfficeLocation[]>([]);

  // App Initialization state
  const [isInitializing, setIsInitializing] = useState(true);

  // Multi-Firm State
  const [activeFirmSlug, setActiveFirmSlug] = useState<string>(() => firmService.getActiveFirmSlug());
  const [activeFirm, setActiveFirm] = useState<LawFirm | null>(() => firmService.getFirmBySlug(firmService.getActiveFirmSlug()));
  const [isFirmActive, setIsFirmActive] = useState<boolean>(true);

  // Modals state
  const [isConsultationOpen, setIsConsultationOpen] = useState(false);
  const [selectedPracticeId, setSelectedPracticeId] = useState<string | undefined>(undefined);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | undefined>(undefined);

  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isSuperAdminOpen, setIsSuperAdminOpen] = useState(false);
  const [isSiteBuilderOpen, setIsSiteBuilderOpen] = useState(false);
  const [isDirectoryOpen, setIsDirectoryOpen] = useState(false);

  // Sync state with storage service & active firm
  const refreshData = () => {
    const slug = firmService.getActiveFirmSlug();
    setActiveFirmSlug(slug);
    const firm = firmService.getFirmBySlug(slug);
    setActiveFirm(firm);
    const siteStatus = firmService.isFirmSiteActive(slug);
    setIsFirmActive(siteStatus.isActive);

    setSettings(storageService.getSettings());
    setPartners(storageService.getPartners());
    setPracticeAreas(storageService.getPracticeAreas());
    setCaseStudies(storageService.getCaseStudies());
    setTestimonials(storageService.getTestimonials());
    setBlogPosts(storageService.getBlogPosts());
    setOffices(storageService.getOffices());
  };

  useEffect(() => {
    const loadAppData = async () => {
      // 1. Instantly read local cache
      firmService.initLocal();
      
      const urlParams = new URLSearchParams(window.location.search);
      const urlSlug = urlParams.get('firm') || firmService.getActiveFirmSlug();

      // If we have cached data for the firm, render it instantly (optimistic UI)
      if (urlSlug) {
        const cachedFirm = firmService.getFirmBySlug(urlSlug);
        if (cachedFirm) {
          storageService.loadFirm(urlSlug, false);
          refreshData();
          setIsInitializing(false);
        }
      } else {
        storageService.init();
        refreshData();
        setIsInitializing(false);
      }

      // Check for direct super admin access immediately
      if (urlParams.get('admin') === 'super' || urlParams.get('super') === '1' || urlParams.get('superadmin') === 'true') {
        setIsSuperAdminOpen(true);
      }

      // 2. Fetch the LATEST data for THIS SPECIFIC office in the background
      if (urlSlug) {
        Promise.allSettled([
          firmService.fetchSingleFirmFromSupabase(urlSlug).then(sbRes => {
            if (sbRes.success && sbRes.firm) {
              firmService.setFirm(sbRes.firm);
              storageService.loadFirm(urlSlug, false);
              refreshData();
              setIsInitializing(false);
            }
          }).catch(() => {}),
          
          fetch(`/api/firms/${urlSlug}`).then(async (res) => {
            if (res.ok) {
              const json = await res.json();
              if (json.success && json.data) {
                const firm = firmService['ensureFirmSubscription'] ? firmService['ensureFirmSubscription'](json.data) : json.data;
                firmService.setFirm(firm);
                storageService.loadFirm(urlSlug, false);
                refreshData();
                setIsInitializing(false);
              }
            }
          }).catch(() => {})
        ]).finally(() => {
          // If the network completes and we were still waiting, fallback to defaults/cache
          setIsInitializing(false);
          storageService.loadFirm(urlSlug, true);
          refreshData();
        });
      }

      // 3. Initialize all background services (Supabase configs, all firms list)
      firmService.init();
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

    return () => {
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
    
    if (lang === 'ar') {
      document.title = `${settings.firmNameAr} | محاماة واستشارات قانونية`;
    } else if (lang === 'tr') {
      document.title = `${settings.firmNameTr || settings.firmNameEn} | Uluslararası Hukuk Bürosu`;
    } else {
      document.title = `${settings.firmNameEn} | Premier International Law Firm`;
    }

    applyTypographySettings(settings);
  }, [lang, settings]);

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
          <Navbar
            settings={settings}
            lang={lang}
            onChangeLang={handleChangeLang}
            onOpenConsultation={handleOpenConsultation}
            onOpenAdmin={() => setIsAdminOpen(true)}
          />

          {/* 2. Hero Section */}
          <HeroSection
            settings={settings}
            lang={lang}
            onOpenConsultation={() => handleOpenConsultation()}
          />

          {/* 3. About Us Section */}
          <AboutSection
            settings={settings}
            lang={lang}
            onOpenConsultation={() => handleOpenConsultation()}
          />

          {/* 4. Practice Areas Section */}
          <PracticeAreasSection
            practiceAreas={practiceAreas}
            partners={partners}
            lang={lang}
            onOpenConsultation={handleOpenConsultation}
          />

          {/* 5. Our Partners & Attorneys */}
          <PartnersSection
            partners={partners}
            lang={lang}
            onOpenConsultation={handleOpenConsultation}
          />

          {/* 6. Why Choose Us */}
          <WhyChooseUsSection
            lang={lang}
          />

          {/* 7. Landmark Achievements & Transactions */}
          <AchievementsSection
            caseStudies={caseStudies}
            lang={lang}
            onOpenConsultation={() => handleOpenConsultation()}
          />

          {/* 8. Client Testimonials */}
          <TestimonialsSection
            testimonials={testimonials}
            lang={lang}
          />

          {/* 9. Legal Blog & Thought Leadership */}
          <BlogSection
            blogPosts={blogPosts}
            lang={lang}
          />

          {/* 10. Contact & Interactive Office Locations */}
          <ContactAndOfficesSection
            settings={settings}
            practiceAreas={practiceAreas}
            offices={offices}
            lang={lang}
          />

          {/* 11. Footer */}
          <Footer
            settings={settings}
            practiceAreas={practiceAreas}
            lang={lang}
            onOpenConsultation={handleOpenConsultation}
            onOpenAdmin={() => setIsAdminOpen(true)}
            onOpenSuperAdmin={() => setIsSuperAdminOpen(true)}
          />
        </>
      )}

      {/* Modals */}
      <ConsultationModal
        isOpen={isConsultationOpen}
        onClose={() => setIsConsultationOpen(false)}
        partners={partners}
        practiceAreas={practiceAreas}
        defaultPracticeId={selectedPracticeId}
        defaultPartnerId={selectedPartnerId}
        lang={lang}
      />

      {/* Protected Admin Control Center - Single Firm Level */}
      <AdminDashboard
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        lang={lang}
        onOpenSuperAdmin={() => {
          setIsAdminOpen(false);
          setIsSuperAdminOpen(true);
        }}
      />

      {/* Platform Owner Super Admin Dashboard - All Firms & Subscriptions & Supabase Cloud Sync */}
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

      {/* Lawyer 1-Click Site Builder Modal */}
      <LawyerSiteBuilderModal
        isOpen={isSiteBuilderOpen}
        onClose={() => setIsSiteBuilderOpen(false)}
        onFirmCreated={handleFirmCreated}
        lang={lang}
      />

      {/* Law Firms Directory Modal */}
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

    </div>
  );
}
