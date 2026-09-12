import React, { useState, useRef } from 'react';
import { Save, Image as ImageIcon, Layout, CheckCircle2, Upload, Trash2 } from 'lucide-react';
import { PlatformSettings, Language } from '../types';
import { storageService } from '../services/storageService';

interface PlatformSettingsTabProps {
  lang: Language;
}

const PRESET_BANNERS = [
  {
    id: 'modern_tower',
    titleAr: 'البرج المعماري الحديث (افتراضي)',
    titleEn: 'Modern Glass Tower (Default)',
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2000&q=80'
  },
  {
    id: 'legal_gavel',
    titleAr: 'مطرقة العدالة والمحاماة',
    titleEn: 'Justice Gavel & Law Books',
    url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=2000&q=80'
  },
  {
    id: 'classic_pillars',
    titleAr: 'أعمدة ومباني العدالة الكلاسيكية',
    titleEn: 'Classic Law Court Pillars',
    url: 'https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&w=2000&q=80'
  },
  {
    id: 'corporate_facade',
    titleAr: 'واجهة الشركات والأعمال التجارية',
    titleEn: 'Corporate Business Facade',
    url: 'https://images.unsplash.com/photo-1479839672679-a46483c0e7c8?auto=format&fit=crop&w=2000&q=80'
  },
  {
    id: 'boardroom_office',
    titleAr: 'قاعة الاجتماعات والاستشارات الفاخرة',
    titleEn: 'Luxury Boardroom Office Interior',
    url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=2000&q=80'
  },
  {
    id: 'financial_district',
    titleAr: 'المركز المالي والأبراج الحديثة',
    titleEn: 'Financial District Skyline',
    url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=2000&q=80'
  }
];

export const PlatformSettingsTab: React.FC<PlatformSettingsTabProps> = ({ lang }) => {
  const isAr = lang === 'ar';
  const [settings, setSettings] = useState<PlatformSettings>(storageService.getPlatformSettings());
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert(isAr ? 'حجم الصورة كبير جداً (الحد الأقصى 5 ميجابايت)' : 'File size is too large (Max 5MB)');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setSettings(prev => ({ ...prev, heroBannerUrl: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setSettings(prev => ({ ...prev, heroBannerUrl: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = () => {
    setSaveStatus('saving');
    storageService.savePlatformSettings(settings);
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-4xl pb-10" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white font-serif-title flex items-center gap-2">
            <Layout className="w-5 h-5 text-[#c5a869]" />
            {isAr ? 'تصميم وإعدادات واجهة المنصة' : 'Platform Landing Page Settings'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isAr ? 'قم بتخصيص النصوص والصور والأزرار المعروضة في الصفحة الرئيسية للمنصة' : 'Customize text, images, and buttons displayed on the platform landing page'}
          </p>
        </div>
        
        <button
          onClick={handleSave}
          disabled={saveStatus === 'saving'}
          className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#c5a869] to-[#ebd397] hover:brightness-110 text-slate-950 text-sm font-bold flex items-center gap-2 transition cursor-pointer shadow-lg shadow-[#c5a869]/20 disabled:opacity-70"
        >
          {saveStatus === 'saved' ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>{isAr ? 'تم الحفظ' : 'Saved'}</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>{isAr ? 'حفظ التغييرات' : 'Save Changes'}</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Arabic Settings */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <span className="w-6 h-6 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">AR</span>
            <h3 className="font-bold text-white text-sm">المحتوى العربي</h3>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">اسم المنصة</label>
              <input type="text" name="platformNameAr" value={settings.platformNameAr} onChange={handleChange} className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white focus:border-[#c5a869] focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">الشارة العلوية (Badge)</label>
              <input type="text" name="heroBadgeAr" value={settings.heroBadgeAr} onChange={handleChange} className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white focus:border-[#c5a869] focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">العنوان الرئيسي (يدعم كود HTML)</label>
              <textarea name="heroHeadingAr" value={settings.heroHeadingAr} onChange={handleChange} rows={3} className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white font-mono focus:border-[#c5a869] focus:outline-none" dir="ltr" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">النص الفرعي (الوصف)</label>
              <textarea name="heroSubheadingAr" value={settings.heroSubheadingAr} onChange={handleChange} rows={3} className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white focus:border-[#c5a869] focus:outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">زر الإجراء الأساسي</label>
                <input type="text" name="ctaPrimaryAr" value={settings.ctaPrimaryAr} onChange={handleChange} className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white focus:border-[#c5a869] focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">زر الإجراء الثانوي</label>
                <input type="text" name="ctaSecondaryAr" value={settings.ctaSecondaryAr} onChange={handleChange} className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white focus:border-[#c5a869] focus:outline-none" />
              </div>
            </div>
          </div>
        </div>

        {/* English Settings */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <span className="w-6 h-6 rounded bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold">EN</span>
            <h3 className="font-bold text-white text-sm">English Content</h3>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Platform Name</label>
              <input type="text" name="platformNameEn" value={settings.platformNameEn} onChange={handleChange} className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white focus:border-[#c5a869] focus:outline-none" dir="ltr" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Top Badge</label>
              <input type="text" name="heroBadgeEn" value={settings.heroBadgeEn} onChange={handleChange} className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white focus:border-[#c5a869] focus:outline-none" dir="ltr" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Main Heading (supports HTML)</label>
              <textarea name="heroHeadingEn" value={settings.heroHeadingEn} onChange={handleChange} rows={3} className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white font-mono focus:border-[#c5a869] focus:outline-none" dir="ltr" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Subheading (Description)</label>
              <textarea name="heroSubheadingEn" value={settings.heroSubheadingEn} onChange={handleChange} rows={3} className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white focus:border-[#c5a869] focus:outline-none" dir="ltr" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Primary CTA Button</label>
                <input type="text" name="ctaPrimaryEn" value={settings.ctaPrimaryEn} onChange={handleChange} className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white focus:border-[#c5a869] focus:outline-none" dir="ltr" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Secondary CTA Button</label>
                <input type="text" name="ctaSecondaryEn" value={settings.ctaSecondaryEn} onChange={handleChange} className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white focus:border-[#c5a869] focus:outline-none" dir="ltr" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Settings */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
          <ImageIcon className="w-5 h-5 text-purple-400" />
          <h3 className="font-bold text-white text-sm">{isAr ? 'صورة البانر الخلفية' : 'Hero Banner Image'}</h3>
        </div>

        {/* Preset Gallery Options */}
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-slate-300">
            {isAr ? 'اختيار بنر جاهز من مكتبة الصور المتاحة بالمنصة:' : 'Select a preset banner from the platform gallery:'}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {PRESET_BANNERS.map((preset) => {
              const isSelected = settings.heroBannerUrl === preset.url || (!settings.heroBannerUrl && preset.id === 'modern_tower');
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setSettings(prev => ({ ...prev, heroBannerUrl: preset.url }))}
                  className={`relative group rounded-xl overflow-hidden border-2 text-right transition-all cursor-pointer h-28 ${
                    isSelected 
                      ? 'border-[#c5a869] ring-2 ring-[#c5a869]/30 shadow-lg shadow-[#c5a869]/20 scale-[1.02]' 
                      : 'border-slate-800 hover:border-slate-600 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img 
                    src={preset.url} 
                    alt={preset.titleAr} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-2.5 flex flex-col justify-between">
                    <div className="flex justify-end">
                      {isSelected && (
                        <span className="bg-[#c5a869] text-slate-950 p-1 rounded-full shadow-md">
                          <CheckCircle2 className="w-4 h-4" />
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-bold text-white line-clamp-1 drop-shadow-md">
                      {isAr ? preset.titleAr : preset.titleEn}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800/80">
          <label className="block text-xs text-slate-400 mb-2">
            {isAr ? 'أو رفع صورة بانر مخصصة من جهازك / رابط مباشر:' : 'Or upload a custom banner image / direct URL:'}
          </label>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              id="hero-banner-file-input"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-300 text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer shrink-0"
            >
              <Upload className="w-4 h-4" />
              <span>{isAr ? 'رفع صورة خاصة' : 'Upload Custom Image'}</span>
            </button>

            <span className="text-xs text-slate-500 text-center sm:text-start">{isAr ? 'أو' : 'or'}</span>

            <input 
              type="text" 
              name="heroBannerUrl" 
              value={settings.heroBannerUrl || ''} 
              onChange={handleChange} 
              placeholder="https://..."
              className="flex-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white focus:border-[#c5a869] focus:outline-none" 
              dir="ltr"
            />

            {settings.heroBannerUrl && (
              <button
                type="button"
                onClick={handleRemoveImage}
                className="px-3 py-2 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center justify-center gap-1.5 transition cursor-pointer"
                title={isAr ? 'إزالة الصورة' : 'Remove Image'}
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">{isAr ? 'إزالة' : 'Remove'}</span>
              </button>
            )}
          </div>
        </div>
        
        {settings.heroBannerUrl && (
          <div className="mt-3 relative h-48 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 group">
            <img src={settings.heroBannerUrl} alt="Preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end justify-between p-3">
              <span className="text-white text-xs font-bold px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
                {isAr ? 'معاينة البانر المحدد حالياً' : 'Currently Selected Banner Preview'}
              </span>
              <button
                type="button"
                onClick={handleRemoveImage}
                className="px-2.5 py-1 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-medium flex items-center gap-1 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isAr ? 'حذف الصورة' : 'Delete'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
