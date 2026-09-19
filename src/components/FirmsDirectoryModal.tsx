import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Search, 
  MapPin, 
  Phone, 
  Mail, 
  ExternalLink, 
  ShieldCheck, 
  PlusCircle, 
  Sparkles, 
  X, 
  Copy, 
  Check, 
  KeyRound, 
  ArrowRight,
  Database,
  Globe2
} from 'lucide-react';
import { firmService } from '../services/firmService';
import { storageService } from '../services/storageService';
import { LawFirm, Language } from '../types';

interface FirmsDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onSelectFirm: (slug: string) => void;
  onOpenAdmin: (firmSlug?: string) => void;
}

export const FirmsDirectoryModal: React.FC<FirmsDirectoryModalProps> = React.memo(({
  isOpen,
  onClose,
  lang,
  onSelectFirm,
  onOpenAdmin,
}) => {
  const [firms, setFirms] = useState<LawFirm[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  // New Firm Registration Form state
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newNameAr, setNewNameAr] = useState('');
  const [newNameEn, setNewNameEn] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [newCityAr, setNewCityAr] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('123456');
  const [newTaglineAr, setNewTaglineAr] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const activeSlug = firmService.getActiveFirmSlug();

  const loadFirmsList = () => {
    const list = firmService.getAllFirms();
    setFirms(list);
  };

  useEffect(() => {
    if (isOpen) {
      loadFirmsList();
      setIsCreatingNew(false);
      setFeedbackMsg(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Filter firms
  const cities = React.useMemo(() => 
    Array.from(new Set(firms.map((f) => f.cityAr).filter(Boolean))),
    [firms]
  );

  const filteredFirms = React.useMemo(() => firms.filter((firm) => {
    const matchesSearch = 
      (firm.nameAr || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (firm.nameEn || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (firm.taglineAr || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (firm.cityAr || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (firm.slug || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCity = selectedCity === 'all' || firm.cityAr === selectedCity;

    return matchesSearch && matchesCity;
  }), [firms, searchQuery, selectedCity]);

  const handleCopyLink = (slug: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = new URL(window.location.href);
    url.searchParams.set('firm', slug);
    navigator.clipboard.writeText(url.toString());
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2500);
  };

  const handleCreateFirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNameAr.trim()) {
      setFeedbackMsg({ type: 'error', text: 'يرجى إدخال اسم المكتب القانوني بالعربية.' });
      return;
    }

    setIsSubmitting(true);
    setFeedbackMsg(null);

    try {
      const res = await firmService.createFirm({
        nameAr: newNameAr.trim(),
        nameEn: newNameEn.trim(),
        slug: newSlug.trim() || undefined,
        cityAr: newCityAr.trim() || 'الرياض',
        phone: newPhone.trim(),
        email: newEmail.trim(),
        adminPassword: newPassword.trim() || '123456',
        taglineAr: newTaglineAr.trim(),
      });

      if (res.success && res.firm) {
        setFeedbackMsg({ type: 'success', text: res.message });
        loadFirmsList();
        setTimeout(() => {
          // Switch to new firm
          storageService.switchFirm(res.firm!.slug);
          onSelectFirm(res.firm!.slug);
          setIsCreatingNew(false);
          // Reset fields
          setNewNameAr('');
          setNewNameEn('');
          setNewSlug('');
          setNewCityAr('');
          setNewPhone('');
          setNewEmail('');
        }, 1200);
      } else {
        setFeedbackMsg({ type: 'error', text: res.message || 'فشل في إنشاء المكتب.' });
      }
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'حدث خطأ أثناء إنشاء المكتب' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div 
        className="relative w-full max-w-5xl bg-[#fdfcf9] rounded-2xl shadow-2xl border border-[#e8dfcf] overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#181512] via-[#2a241c] to-[#181512] text-white p-6 md:p-8 relative">
          <button
            onClick={onClose}
            className="absolute top-6 left-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 text-[#d4b068] text-sm font-semibold mb-2">
            <Globe2 className="w-4 h-4" />
            <span>منصة وشبكة المكاتب القانونية المعتمدة | Multi-Firm Legal Network</span>
          </div>

          <h2 className="text-2xl md:text-3xl font-bold font-serif-custom text-white tracking-wide">
            دليل المكاتب القانونية المستقلة
          </h2>
          <p className="text-stone-300 text-sm mt-2 max-w-2xl leading-relaxed">
            تستضيف المنصة مئات المواقع القانونية المستقلة، حيث يمتلك كل مكتب قانوني موقعه وهويته ومحاميه واختصاصاته ورابطه الخاص مع قاعدة بيانات سحابية مركزية ومزامنة Supabase.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-5">
            <button
              onClick={() => setIsCreatingNew(!isCreatingNew)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-md ${
                isCreatingNew 
                  ? 'bg-stone-700 text-white hover:bg-stone-600' 
                  : 'bg-gradient-to-r from-[#b38a38] to-[#87641d] text-white hover:brightness-110'
              }`}
            >
              {isCreatingNew ? (
                <>
                  <ArrowRight className="w-4 h-4" />
                  <span>العودة لقائمة المكاتب</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" />
                  <span>تسجيل وإطلاق موقع مكتب قانوني جديد</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenAdmin();
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-white/10 hover:bg-white/20 text-stone-100 transition-colors"
            >
              <KeyRound className="w-4 h-4 text-[#d4b068]" />
              <span>دخول لوحة تحكم مدراء المكاتب</span>
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 md:p-8 max-h-[72vh] overflow-y-auto">
          {/* Form: Register New Law Firm */}
          {isCreatingNew ? (
            <div className="bg-white rounded-xl p-6 md:p-8 border border-[#e5dcce] shadow-sm max-w-3xl mx-auto">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-stone-200">
                <div className="w-10 h-10 rounded-lg bg-[#b38a38]/10 text-[#87641d] flex items-center justify-center">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-stone-900">تسجيل مكتب قانوني جديد على المنصة</h3>
                  <p className="text-xs text-stone-500">سيتم إنشاء موقع إلكتروني مستقل للمكتب فوراً مع لوحة تحكم ورابط خاص</p>
                </div>
              </div>

              {feedbackMsg && (
                <div className={`p-4 rounded-xl text-sm mb-6 flex items-center gap-3 ${
                  feedbackMsg.type === 'success' 
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}>
                  <Sparkles className="w-5 h-5 flex-shrink-0" />
                  <span>{feedbackMsg.text}</span>
                </div>
              )}

              <form onSubmit={handleCreateFirm} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      اسم المكتب بالعربية <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: مكتب الأستاذ فهد السبيعي للمحاماة"
                      value={newNameAr}
                      onChange={(e) => {
                        setNewNameAr(e.target.value);
                        if (!newSlug) {
                          setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]+/g, '-').slice(0, 30));
                        }
                      }}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#b38a38] text-sm bg-stone-50/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      اسم المكتب بالإنجليزية (اختياري)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Fahad Al-Subaie Law Firm"
                      value={newNameEn}
                      onChange={(e) => setNewNameEn(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#b38a38] text-sm bg-stone-50/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      معرف الرابط الفريد (Slug / URL Identifier) <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex items-center text-xs text-stone-500 mb-1">
                      <span>النطاق المعتمد للمكتب: <strong className="font-mono text-[#87641d]">{newSlug ? `${newSlug}.mohamoon.sa` : 'nahwi.mohamoon.sa'}</strong></span>
                    </div>
                    <input
                      type="text"
                      placeholder="fahad-law"
                      value={newSlug}
                      onChange={(e) => setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '-'))}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#b38a38] text-sm font-mono bg-stone-50/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      المدينة والدولة
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: الرياض، السعودية أو دبي، الإمارات"
                      value={newCityAr}
                      onChange={(e) => setNewCityAr(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#b38a38] text-sm bg-stone-50/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      رقم هاتف / واتساب التواصل
                    </label>
                    <input
                      type="text"
                      placeholder="+966 50 000 0000"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#b38a38] text-sm bg-stone-50/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      البريد الإلكتروني الرسمي للمكتب
                    </label>
                    <input
                      type="email"
                      placeholder="lawyer@example.com"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#b38a38] text-sm bg-stone-50/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      شعار / عبارة المكتب (Slogan)
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: ريادة قانونية وحماية مصالح الشركات"
                      value={newTaglineAr}
                      onChange={(e) => setNewTaglineAr(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#b38a38] text-sm bg-stone-50/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      كلمة مرور مدير المكتب للوحة التحكم <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="123456"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#b38a38] text-sm font-mono bg-stone-50/50"
                    />
                    <p className="text-[11px] text-stone-400 mt-0.5">سيستخدمها مدير المكتب لتعديل موقعه وبياناته بحرية</p>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-stone-200">
                  <button
                    type="button"
                    onClick={() => setIsCreatingNew(false)}
                    className="px-5 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 text-sm font-medium transition-colors"
                  >
                    إلغاء
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#b38a38] to-[#87641d] hover:brightness-110 text-white text-sm font-bold shadow-md transition-all flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <span>جارٍ إنشاء الموقع وحفظه...</span>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>إنشاء موقع المكتب وتفعيله فوراً</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <>
              {/* Filter and Search Bar */}
              <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute right-3.5 top-3.5 text-stone-400" />
                  <input
                    type="text"
                    placeholder="ابحث عن مكتب بالاسم، التخصص، المدينة، أو الرابط..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#b38a38] text-sm bg-white shadow-sm"
                  />
                </div>

                {cities.length > 0 && (
                  <div className="w-full md:w-56">
                    <select
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#b38a38] text-sm bg-white shadow-sm text-stone-700"
                    >
                      <option value="all">كافة المدن والدول ({firms.length})</option>
                      {cities.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Firms Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredFirms.map((firm) => {
                  const isActive = firm.slug === activeSlug;
                  const isCopied = copiedSlug === firm.slug;

                  return (
                    <div
                      key={firm.id}
                      className={`relative bg-white rounded-2xl p-6 border transition-all duration-200 flex flex-col justify-between ${
                        isActive
                          ? 'border-[#b38a38] ring-2 ring-[#b38a38]/30 shadow-lg'
                          : 'border-stone-200 hover:border-stone-300 hover:shadow-md'
                      }`}
                    >
                      {isActive && (
                        <div className="absolute -top-3 right-6 bg-[#b38a38] text-white text-[11px] font-bold px-3 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          <span>الموقع المعروض حالياً</span>
                        </div>
                      )}

                      <div>
                        {/* Header card info */}
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-stone-900 to-[#2a241c] text-[#d4b068] flex items-center justify-center font-serif-custom font-bold text-lg shadow-sm flex-shrink-0">
                            {firm.nameAr.charAt(0)}
                          </div>

                          <div className="flex items-center gap-1.5">
                            {firm.isVerified && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                <ShieldCheck className="w-3 h-3" />
                                <span>معتمد</span>
                              </span>
                            )}
                            <button
                              onClick={(e) => handleCopyLink(firm.slug, e)}
                              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
                              title="نسخ رابط الموقع المستقل"
                            >
                              {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        {/* Title and tagline */}
                        <h4 className="font-bold text-base text-stone-900 leading-snug break-words">
                          {firm.nameAr}
                        </h4>
                        {firm.nameEn && (
                          <p className="text-xs text-stone-400 font-sans mt-0.5 break-words">{firm.nameEn}</p>
                        )}

                        <p className="text-xs text-stone-600 mt-2 break-words leading-relaxed">
                          {firm.taglineAr || firm.data?.settings?.sloganAr || 'مكتب محاماة واستشارات قانونية متكامل.'}
                        </p>

                        {/* Metadata badges */}
                        <div className="mt-4 pt-3 border-t border-stone-100 space-y-1.5 text-xs text-stone-500">
                          {firm.cityAr && (
                            <div className="flex items-center gap-2">
                              <MapPin className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
                              <span>{firm.cityAr}</span>
                            </div>
                          )}
                          {firm.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
                              <span dir="ltr">{firm.phone}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#87641d] bg-[#b38a38]/10 px-2 py-0.5 rounded-full border border-[#b38a38]/20 dir-ltr font-bold w-fit">
                            <Globe2 className="w-3 h-3 text-[#b38a38]" />
                            <span>{firmService.getFirmDisplayDomain(firm)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Card Actions */}
                      <div className="mt-6 pt-4 border-t border-stone-100 flex items-center gap-2">
                        <button
                          onClick={() => {
                            storageService.switchFirm(firm.slug);
                            onSelectFirm(firm.slug);
                            onClose();
                          }}
                          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm ${
                            isActive
                              ? 'bg-stone-100 text-stone-800 hover:bg-stone-200'
                              : 'bg-gradient-to-r from-[#b38a38] to-[#87641d] text-white hover:brightness-110'
                          }`}
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>{isActive ? 'أنت تتصفحه الآن' : 'زيارة موقع المكتب'}</span>
                        </button>

                        <button
                          onClick={() => {
                            onClose();
                            onOpenAdmin(firm.slug);
                          }}
                          className="py-2 px-3 rounded-xl text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 transition-colors flex items-center gap-1"
                          title="دخول إدارة وتعديل هذا المكتب"
                        >
                          <KeyRound className="w-3.5 h-3.5 text-[#b38a38]" />
                          <span>إدارة</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredFirms.length === 0 && (
                <div className="text-center py-12 bg-white rounded-2xl border border-stone-200 p-8">
                  <Building2 className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                  <h4 className="text-base font-bold text-stone-800">لم يتم العثور على مكاتب تطابق بحثك</h4>
                  <p className="text-xs text-stone-500 mt-1">جرب كلمات بحث مختلفة أو أضف مكتباً جديداً للمنصة</p>
                  <button
                    onClick={() => setIsCreatingNew(true)}
                    className="mt-4 px-4 py-2 rounded-xl bg-[#b38a38] text-white text-xs font-bold hover:brightness-110"
                  >
                    تسجيل مكتب جديد الآن
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer Info */}
        <div className="bg-stone-100/70 p-4 px-6 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-3">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-600" />
            <span>قاعدة البيانات: يدعم مئات المكاتب مع إمكانية الربط مع Supabase والمزامنة السحابية المباشرة.</span>
          </div>
          <div>
            <span>المكتب النشط: <strong>{activeSlug}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
});
