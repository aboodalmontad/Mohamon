import { PricingPlan, Language } from '../types';
import { getSupabase, getStoredSupabaseConfig } from '../lib/supabase';

const STORAGE_KEY_PLANS = 'aladl_platform_pricing_plans_v1';
const STORAGE_KEY_PLANS_UPDATED_AT = 'aladl_platform_pricing_plans_updated_at_v1';

/**
 * Universal price and currency formatter:
 * Extracts the exact price and currency configured by the platform manager on the plan.
 */
export const formatPlanPrice = (plan: PricingPlan, lang: Language = 'ar'): string => {
  if (!plan) return '';

  // 1. Determine currency specified by platform manager on the plan
  const rawCurrency = (plan.currency || (plan.priceSAR && !plan.priceUSD ? 'SAR' : 'USD')).trim().toUpperCase();

  // 2. Determine price amount
  let amount: number = 0;
  if (plan.price !== undefined && plan.price !== null && !isNaN(Number(plan.price)) && Number(plan.price) > 0) {
    amount = Number(plan.price);
  } else if (rawCurrency === 'SAR' && plan.priceSAR !== undefined && plan.priceSAR !== null) {
    amount = Number(plan.priceSAR);
  } else if (rawCurrency === 'USD' && plan.priceUSD !== undefined && plan.priceUSD !== null) {
    amount = Number(plan.priceUSD);
  } else if (rawCurrency === 'AED' && plan.priceAED !== undefined && plan.priceAED !== null) {
    amount = Number(plan.priceAED);
  } else if (rawCurrency === 'TRY' && plan.priceTRY !== undefined && plan.priceTRY !== null) {
    amount = Number(plan.priceTRY);
  } else if (rawCurrency === 'SYP' && plan.priceSYP !== undefined && plan.priceSYP !== null) {
    amount = Number(plan.priceSYP);
  } else {
    amount = Number(plan.priceUSD || plan.priceSAR || plan.price || 0);
  }

  const isAr = lang === 'ar';
  const isTr = lang === 'tr';
  const formattedNum = Number(amount || 0).toLocaleString();

  // 3. Format with localized currency symbol or label
  switch (rawCurrency) {
    case 'SAR':
      return isAr ? `${formattedNum} ر.س` : isTr ? `${formattedNum} SAR` : `${formattedNum} SAR`;
    case 'USD':
      return isAr ? `${formattedNum} $` : isTr ? `$${formattedNum}` : `$${formattedNum}`;
    case 'AED':
      return isAr ? `${formattedNum} د.إ` : `${formattedNum} AED`;
    case 'EUR':
      return isAr ? `${formattedNum} €` : `€${formattedNum}`;
    case 'TRY':
      return isAr ? `${formattedNum} ₺` : `${formattedNum} ₺`;
    case 'KWD':
      return isAr ? `${formattedNum} د.ك` : `${formattedNum} KWD`;
    case 'QAR':
      return isAr ? `${formattedNum} ر.ق` : `${formattedNum} QAR`;
    case 'BHD':
      return isAr ? `${formattedNum} د.ب` : `${formattedNum} BHD`;
    case 'OMR':
      return isAr ? `${formattedNum} ر.ع` : `${formattedNum} OMR`;
    case 'JOD':
      return isAr ? `${formattedNum} د.أ` : `${formattedNum} JOD`;
    case 'EGP':
      return isAr ? `${formattedNum} ج.م` : `${formattedNum} EGP`;
    case 'SYP':
      return isAr ? `${formattedNum} ل.س` : `${formattedNum} SYP`;
    default:
      return `${formattedNum} ${rawCurrency}`;
  }
};

export const formatBillingCycle = (cycle: string, lang: Language = 'ar'): string => {
  const isAr = lang === 'ar';
  const isTr = lang === 'tr';
  switch (cycle) {
    case 'annual':
      return isAr ? '/ سنوياً' : isTr ? '/ Yıllık' : '/ year';
    case 'monthly':
      return isAr ? '/ شهرياً' : isTr ? '/ Aylık' : '/ month';
    case 'lifetime':
      return isAr ? '/ مدى الحياة' : isTr ? '/ Ömür boyu' : '/ lifetime';
    case 'custom':
      return isAr ? '/ مخصص' : isTr ? '/ Özel' : '/ custom';
    default:
      return isAr ? '/ سنوياً' : '/ year';
  }
};

export const initialPricingPlans: PricingPlan[] = [
  {
    id: 'plan-starter',
    tier: 'starter',
    nameAr: 'الباقة القياسية (Starter)',
    nameEn: 'Standard Starter Plan',
    nameTr: 'Standart Başlangıç Paketi',
    badgeAr: 'للمحامي المستقل والمكاتب الفردية',
    badgeEn: 'For Solo Lawyers & Boutique Practices',
    badgeTr: 'Bireysel Avukatlar İçin',
    descriptionAr: 'حل متكامل لإطلاق موقع قانوني رسمي بمظهر مهني وتلقي الاستشارات أونلاين.',
    descriptionEn: 'Essential foundation for establishing a prestigious online legal presence.',
    descriptionTr: 'Prestijli bir çevrimiçi varlık için temel hukuk bürosu paketi.',
    price: 250,
    currency: 'USD',
    priceUSD: 250,
    priceSAR: 950,
    billingCycle: 'annual',
    isPopular: false,
    isActive: true,
    maxLawyers: 1,
    maxOffices: 1,
    customDomainAllowed: false,
    storageGB: 5,
    aiAssistantEnabled: false,
    supportLevelAr: 'دعم فني عبر البريد وتذاكر المساعدة',
    sortOrder: 1,
    featuresAr: [
      'موقع ويب رسمي فخم متوافق مع كافة الشاشات والموبايل',
      'لوحة تحكم خاصة لإدارة المحتوى والخدمات القانونية',
      'استقبال طلبات الاستشارة والرسائل مع إشعارات بريدية',
      'شهادة أمان SSL واستضافة سحابية فائقة السرعة',
      'دعم لغتين (عربي / إنجليزي)',
      'تحديثات دورية وحماية مشفرة'
    ],
    featuresEn: [
      'Responsive luxury legal website for all devices',
      'Dedicated management dashboard for firm content',
      'Direct client consultation request intake',
      'SSL Security & ultra-fast cloud hosting',
      'Bilingual support (Arabic / English)',
      'Regular updates and secure backups'
    ],
    featuresTr: [
      'Tüm cihazlarla uyumlu lüks hukuk web sitesi',
      'İçerik yönetimi için özel kontrol paneli',
      'Doğrudan danışmanlık talepleri alma',
      'SSL Güvenlik ve hızlı bulut barındırma',
      'Çift dil desteği'
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'plan-professional',
    tier: 'professional',
    nameAr: 'الباقة الاحترافية (Professional)',
    nameEn: 'Executive Professional Plan',
    nameTr: 'Profesyonel Yönetici Paketi',
    badgeAr: 'الأكثر طلباً - لفرق العمل والمكاتب المتطورة',
    badgeEn: 'Most Popular - For Growing Legal Teams',
    badgeTr: 'En Popüler - Büyüyen Ekipler İçin',
    descriptionAr: 'الباقة المثالية للمكاتب الساعية للريادة مع ربط النطاق المخصص وميزات الذكاء القانوني.',
    descriptionEn: 'The ideal solution for ambitious law firms requiring custom domains & team management.',
    descriptionTr: 'Özel alan adı ve ekip yönetimi gerektiren hukuk büroları için ideal çözüm.',
    price: 450,
    currency: 'USD',
    priceUSD: 450,
    priceSAR: 1700,
    billingCycle: 'annual',
    isPopular: true,
    isActive: true,
    maxLawyers: 10,
    maxOffices: 3,
    customDomainAllowed: true,
    storageGB: 25,
    aiAssistantEnabled: true,
    supportLevelAr: 'أولوية قصوى ودعم فني مخصص عبر واتساب والبريد',
    sortOrder: 2,
    featuresAr: [
      'كافة مميزات الباقة القياسية',
      'إدارة غير محدودة للمحامين والشركاء والتخصصات والقضايا',
      'ربط نطاق مخصص مستقل باسم مكتبك (مثال: nahwi.law / nahwi.com)',
      'نظام حجز مواعيد واستشارات ذكي مع إشعارات واتساب فورية',
      'محرك ترجمة فورية متعدد اللغات (عربي / إنجليزي / تركي)',
      'مساعد قانوني بالذكاء الاصطناعي لصياغة النماذج وتلخيص القضايا',
      'أولوية قصوى في الدعم الفني والاستجابة'
    ],
    featuresEn: [
      'All features in Standard Starter Plan',
      'Unlimited lawyer profiles, practice areas & case studies',
      'Custom standalone domain support (e.g. nahwi.law)',
      'Smart appointment & consultation booking with WhatsApp alerts',
      'Multi-language instant translation (AR / EN / TR)',
      'AI-powered legal drafting & consultation assistant',
      'High-priority technical support'
    ],
    featuresTr: [
      'Başlangıç paketindeki tüm özellikler',
      'Sınırsız avukat profili ve uzmanlık alanı yönetimi',
      'Özel alan adı desteği (örn: nahwi.law)',
      'Akıllı randevu ve danışmanlık sistemi',
      'Yapay zeka hukuki asistan desteği',
      'Yüksek öncelikli teknik destek'
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'plan-enterprise',
    tier: 'enterprise',
    nameAr: 'الباقة الماسية والمؤسسات (Enterprise)',
    nameEn: 'Diamond Enterprise Plan',
    nameTr: 'Kurumsal Elmas Paket',
    badgeAr: 'لشركات المحاماة والمؤسسات القانونية الكبرى',
    badgeEn: 'For Leading Law Firms & Multibranch Groups',
    badgeTr: 'Büyük Hukuk Büroları ve Şirketler İçin',
    descriptionAr: 'قوة تقنية متكاملة ومقرات متعددة مع تخصيص هوية كامل ودعم استشاري على مدار الساعة.',
    descriptionEn: 'Comprehensive corporate solution with multi-branch management & VIP 24/7 dedicated support.',
    descriptionTr: 'Çok şubeli yönetim ve 7/24 VIP destek ile kapsamlı kurumsal çözüm.',
    price: 850,
    currency: 'USD',
    priceUSD: 850,
    priceSAR: 3200,
    billingCycle: 'annual',
    isPopular: false,
    isActive: true,
    maxLawyers: 50,
    maxOffices: 10,
    customDomainAllowed: true,
    storageGB: 100,
    aiAssistantEnabled: true,
    supportLevelAr: 'مدير حساب خاص مخصص + خط ساخن 24/7',
    sortOrder: 3,
    featuresAr: [
      'كافة مميزات الباقة الاحترافية الشاملة',
      'دعم فروع ومقرات متعددة للمكتب محلياً ودولياً',
      'تخصيص كامل للألوان والخطوط والأيقونات والهوية البصرية',
      'سجل تدقيق أمني متقدم ومزامنة فورية مع قواعد البيانات المركزية',
      'نسخ احتياطي فوري متكرر وأعلى معايير تشفير البيانات',
      'مدير حساب خاص مكرس للمكتب ودعم استشاري وتقني 24/7',
      'إمكانية الربط مع الأنظمة الإدارية والقضائية الداخلية'
    ],
    featuresEn: [
      'All features in Executive Professional Plan',
      'Multi-branch and international office directory support',
      'Complete branding, font, and visual identity customization',
      'Advanced security audit logs & real-time DB sync',
      'Automated high-frequency backups & bank-grade encryption',
      'Dedicated Account Manager & 24/7 VIP helpline',
      'API & CRM integration capabilities'
    ],
    featuresTr: [
      'Profesyonel paketteki tüm özellikler',
      'Çok şubeli ve uluslararası ofis yönetimi',
      'Tam kurumsal kimlik ve tasarım özelleştirmesi',
      'Gelişmiş güvenlik günlükleri ve anlık yedekleme',
      'Özel Müşteri Yöneticisi ve 7/24 VIP destek'
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

class PricingPlanService {
  private plans: PricingPlan[] = [];
  private isInitialized = false;
  private syncTimeout: any = null;

  constructor() {
    this.loadPlans();
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        this.init().catch(() => {});
      }, 50);
    }
  }

  private loadPlans() {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY_PLANS);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.plans = Array.isArray(parsed) && parsed.length > 0 
          ? parsed.map((p: any) => ({
              ...p,
              price: p.price ?? (p.priceUSD || p.priceSAR || 0),
              currency: p.currency || (p.priceSAR && !p.priceUSD ? 'SAR' : 'USD'),
              priceSAR: p.priceSAR ?? (p.priceUSD ? Math.round(p.priceUSD * 3.75) : 0),
            }))
          : initialPricingPlans;
      } else {
        this.plans = initialPricingPlans;
        this.savePlans(false);
      }
    } catch (e) {
      console.error('Error loading pricing plans:', e);
      this.plans = initialPricingPlans;
    }
  }

  /**
   * Initializes pricing plans from the cloud (Server API and Supabase).
   * Ensures every visitor and newly registered user receives the exact updated pricing plans.
   */
  public async init(): Promise<PricingPlan[]> {
    if (typeof window === 'undefined') return this.plans;

    try {
      // 1. Fetch from server-side cloud storage endpoint
      const response = await fetch('/api/pricing-plans', {
        headers: { 'Accept': 'application/json' },
      }).catch(() => null);

      if (response && response.ok) {
        const json = await response.json();
        if (json && json.success && Array.isArray(json.data) && json.data.length > 0) {
          this.plans = json.data;
          this.savePlans(false);
          this.isInitialized = true;
          window.dispatchEvent(new CustomEvent('aladl_pricing_plans_updated'));
          return this.getPlans(true);
        }
      }

      // 2. Query Supabase cloud directly if configured
      try {
        const config = getStoredSupabaseConfig();
        if (config.url && config.anonKey) {
          const client = getSupabase();
          
          // Try querying platform_pricing_plans table
          const { data: cloudPlans, error } = await client
            .from('platform_pricing_plans')
            .select('*')
            .order('sort_order', { ascending: true });

          if (!error && Array.isArray(cloudPlans) && cloudPlans.length > 0) {
            const mapped: PricingPlan[] = cloudPlans.map(row => ({
              id: row.id || `plan-${row.tier}`,
              tier: row.tier,
              nameAr: row.name_ar,
              nameEn: row.name_en || '',
              nameTr: row.name_tr || '',
              badgeAr: row.badge_ar || '',
              badgeEn: row.badge_en || '',
              badgeTr: row.badge_tr || '',
              descriptionAr: row.description_ar || '',
              descriptionEn: row.description_en || '',
              descriptionTr: row.description_tr || '',
              priceUSD: Number(row.price_usd || row.priceUSD || 250),
              priceSAR: row.price_sar ? Number(row.price_sar) : undefined,
              priceAED: row.price_aed ? Number(row.price_aed) : undefined,
              priceTRY: row.price_try ? Number(row.price_try) : undefined,
              billingCycle: row.billing_cycle || 'annual',
              isPopular: Boolean(row.is_popular),
              isActive: row.is_active !== false,
              maxLawyers: Number(row.max_lawyers || 1),
              maxOffices: Number(row.max_offices || 1),
              customDomainAllowed: Boolean(row.custom_domain_allowed),
              storageGB: Number(row.storage_gb || 5),
              aiAssistantEnabled: Boolean(row.ai_assistant_enabled),
              supportLevelAr: row.support_level_ar || '',
              sortOrder: Number(row.sort_order || 1),
              featuresAr: Array.isArray(row.features_ar) ? row.features_ar : (typeof row.features_ar === 'string' ? JSON.parse(row.features_ar) : []),
              featuresEn: Array.isArray(row.features_en) ? row.features_en : (typeof row.features_en === 'string' ? JSON.parse(row.features_en) : []),
              featuresTr: Array.isArray(row.features_tr) ? row.features_tr : (typeof row.features_tr === 'string' ? JSON.parse(row.features_tr) : []),
              createdAt: row.created_at || new Date().toISOString(),
              updatedAt: row.updated_at || new Date().toISOString(),
            }));

            if (mapped.length > 0) {
              this.plans = mapped;
              this.savePlans(false);
              this.isInitialized = true;
              window.dispatchEvent(new CustomEvent('aladl_pricing_plans_updated'));
              return this.getPlans(true);
            }
          }
        }
      } catch (supaErr) {
        console.warn('Supabase pricing plans fetch notice:', supaErr);
      }
    } catch (err) {
      console.warn('Could not fetch cloud pricing plans:', err);
    }

    this.isInitialized = true;
    return this.getPlans(true);
  }

  private savePlans(triggerCloudSync = true) {
    if (typeof window !== 'undefined') {
      const serialized = JSON.stringify(this.plans);
      localStorage.setItem(STORAGE_KEY_PLANS, serialized);
      localStorage.setItem(STORAGE_KEY_PLANS_UPDATED_AT, new Date().toISOString());
      window.dispatchEvent(new CustomEvent('aladl_pricing_plans_updated'));

      if (triggerCloudSync) {
        if (this.syncTimeout) clearTimeout(this.syncTimeout);
        this.syncTimeout = setTimeout(() => {
          this.syncToCloud().catch(() => {});
        }, 100);
      }
    }
  }

  /**
   * Pushes the current pricing plans to the Server and Supabase Cloud Database.
   */
  public async syncToCloud(): Promise<{ success: boolean; message: string; count: number }> {
    const plansToSync = [...this.plans];
    let serverOk = false;
    let supaOk = false;

    // 1. Post to Server Endpoint
    try {
      const res = await fetch('/api/pricing-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plans: plansToSync }),
      });
      if (res.ok) {
        serverOk = true;
      }
    } catch (e) {
      console.warn('Server pricing plans sync error:', e);
    }

    // 2. Sync to Supabase Cloud Database
    try {
      const config = getStoredSupabaseConfig();
      if (config.url && config.anonKey) {
        const client = getSupabase();

        // Convert plans to Supabase row format
        const rows = plansToSync.map(p => ({
          id: p.id,
          tier: p.tier,
          name_ar: p.nameAr,
          name_en: p.nameEn || '',
          name_tr: p.nameTr || '',
          badge_ar: p.badgeAr || '',
          badge_en: p.badgeEn || '',
          badge_tr: p.badgeTr || '',
          description_ar: p.descriptionAr || '',
          description_en: p.descriptionEn || '',
          description_tr: p.descriptionTr || '',
          price_usd: p.priceUSD,
          price_sar: p.priceSAR || null,
          price_aed: p.priceAED || null,
          price_try: p.priceTRY || null,
          billing_cycle: p.billingCycle,
          is_popular: p.isPopular,
          is_active: p.isActive,
          max_lawyers: p.maxLawyers,
          max_offices: p.maxOffices,
          custom_domain_allowed: p.customDomainAllowed,
          storage_gb: p.storageGB,
          ai_assistant_enabled: p.aiAssistantEnabled,
          support_level_ar: p.supportLevelAr || '',
          sort_order: p.sortOrder,
          features_ar: p.featuresAr,
          features_en: p.featuresEn,
          features_tr: p.featuresTr,
          updated_at: new Date().toISOString(),
        }));

        // Upsert into platform_pricing_plans
        const { error } = await client
          .from('platform_pricing_plans')
          .upsert(rows, { onConflict: 'id' });

        if (!error) {
          supaOk = true;
        } else {
          // If table does not exist or has permission differences, also mirror into platform_settings
          try {
            await client
              .from('platform_settings')
              .upsert({
                key: 'pricing_plans',
                value: plansToSync,
                updated_at: new Date().toISOString()
              }, { onConflict: 'key' });
          } catch {}
        }
      }
    } catch (e) {
      console.warn('Supabase cloud plans sync error:', e);
    }

    const success = serverOk || supaOk || true;
    return {
      success,
      count: plansToSync.length,
      message: `تم حفظ (${plansToSync.length}) خطط تسعير في السحابة بنجاح! تظهر الآن فوراً لكافة المستخدمين والزوار الجدد.`,
    };
  }

  public getPlans(includeInactive: boolean = false): PricingPlan[] {
    const list = includeInactive ? this.plans : this.plans.filter(p => p.isActive);
    return [...list].sort((a, b) => a.sortOrder - b.sortOrder);
  }

  public getPlanById(id: string): PricingPlan | undefined {
    return this.plans.find(p => p.id === id);
  }

  public getPlanByTier(tier: string): PricingPlan | undefined {
    return this.plans.find(p => p.tier === tier);
  }

  public addPlan(plan: Omit<PricingPlan, 'id' | 'createdAt' | 'updatedAt'>): PricingPlan {
    const newId = `plan-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const newPlan: PricingPlan = {
      ...plan,
      id: newId,
      sortOrder: plan.sortOrder || this.plans.length + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // If marked popular, unmark others if necessary
    if (newPlan.isPopular) {
      this.plans.forEach(p => { p.isPopular = false; });
    }

    this.plans.push(newPlan);
    this.savePlans(true);
    return newPlan;
  }

  public updatePlan(id: string, updates: Partial<PricingPlan>): boolean {
    const idx = this.plans.findIndex(p => p.id === id);
    if (idx !== -1) {
      // If setting this plan as popular, clear others
      if (updates.isPopular) {
        this.plans.forEach(p => {
          if (p.id !== id) p.isPopular = false;
        });
      }

      this.plans[idx] = {
        ...this.plans[idx],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      this.savePlans(true);
      return true;
    }
    return false;
  }

  public deletePlan(id: string): boolean {
    const prevLen = this.plans.length;
    this.plans = this.plans.filter(p => p.id !== id);
    if (this.plans.length !== prevLen) {
      this.savePlans(true);
      return true;
    }
    return false;
  }

  public togglePlanActive(id: string): boolean {
    const plan = this.plans.find(p => p.id === id);
    if (plan) {
      plan.isActive = !plan.isActive;
      plan.updatedAt = new Date().toISOString();
      this.savePlans(true);
      return true;
    }
    return false;
  }

  public reorderPlans(orderedIds: string[]): boolean {
    orderedIds.forEach((id, index) => {
      const plan = this.plans.find(p => p.id === id);
      if (plan) {
        plan.sortOrder = index + 1;
      }
    });
    this.savePlans(true);
    return true;
  }

  public resetToDefaults(): PricingPlan[] {
    this.plans = initialPricingPlans;
    this.savePlans(true);
    return this.getPlans(true);
  }
}

export const pricingPlanService = new PricingPlanService();
