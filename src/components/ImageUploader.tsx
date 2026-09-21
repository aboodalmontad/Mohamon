import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Check, Link, RefreshCw, X, Sparkles } from 'lucide-react';
import { Language } from '../types';

interface ImageUploaderProps {
  value: string;
  onChange: (val: string) => void;
  label?: string;
  labelEn?: string;
  lang?: Language;
  presets?: string[];
  aspectRatio?: 'square' | 'video' | 'portrait' | 'wide' | 'banner';
  helpText?: string;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

// Compress and process image file on client-side using Canvas to ensure fast performance and compact storage
export const processImageFile = (
  file: File,
  maxWidth = 600,
  maxHeight = 600,
  quality = 0.7
): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('الملف المختار ليس صورة صالحة'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL(file.type === 'image/png' ? 'image/png' : 'image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => {
        resolve(e.target?.result as string);
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  value,
  onChange,
  label = 'صورة الشريك',
  labelEn = 'Partner Photo',
  lang = 'ar',
  presets = [],
  aspectRatio = 'square',
  helpText,
  maxWidth,
  maxHeight,
  quality,
}) => {
  const isAr = lang === 'ar';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isUploadedDataUrl = value?.startsWith('data:image/');

  const handleFileChange = async (file: File) => {
    try {
      setIsProcessing(true);
      setErrorMessage(null);
      const targetMaxWidth = maxWidth || (aspectRatio === 'banner' ? 1920 : 600);
      const targetMaxHeight = maxHeight || (aspectRatio === 'banner' ? 1080 : 600);
      const targetQuality = quality || (aspectRatio === 'banner' ? 0.8 : 0.7);
      const dataUrl = await processImageFile(file, targetMaxWidth, targetMaxHeight, targetQuality);
      onChange(dataUrl);
    } catch (err: any) {
      setErrorMessage(isAr ? 'حدث خطأ أثناء معالجة الصورة' : 'Error processing image');
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileChange(files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const isBanner = aspectRatio === 'banner';

  const aspectClass = 
    aspectRatio === 'square' ? 'w-24 h-24 sm:w-28 sm:h-28 rounded-2xl' :
    aspectRatio === 'portrait' ? 'w-24 h-32 sm:w-28 sm:h-36 rounded-2xl' :
    aspectRatio === 'video' ? 'w-40 h-24 sm:w-48 sm:h-28 rounded-2xl' :
    aspectRatio === 'banner' ? 'w-full h-44 sm:h-56 rounded-2xl' :
    'w-full h-32 rounded-2xl';

  return (
    <div className="space-y-3">
      {/* Label and Mode Switch */}
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-200">
          {isAr ? label : labelEn}
        </label>
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-[11px] text-[#c5a869] hover:underline flex items-center gap-1 cursor-pointer"
        >
          <Link className="w-3 h-3" />
          <span>{showUrlInput ? (isAr ? 'إخفاء حقل الرابط' : 'Hide URL input') : (isAr ? 'أو كتابة رابط صورة مباشر' : 'Or enter image URL')}</span>
        </button>
      </div>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={onFileInput}
        accept="image/png, image/jpeg, image/jpg, image/webp, image/gif"
        className="hidden"
      />

      {/* Banner Specific Full-Width Layout */}
      {isBanner ? (
        <div className="space-y-3">
          {/* Banner Preview Frame */}
          <div className="relative w-full h-44 sm:h-56 rounded-2xl overflow-hidden border-2 border-[#c5a869]/50 shadow-xl bg-slate-950 group">
            {value ? (
              <>
                <img
                  src={value}
                  alt="Banner Preview"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                
                {/* Floating Badges */}
                <div className="absolute top-3 start-3 flex items-center gap-2">
                  {isUploadedDataUrl ? (
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500 text-slate-950 text-xs font-bold shadow-md flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>{isAr ? 'تم الرفع من جهازك' : 'Uploaded from Device'}</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-lg bg-[#c5a869] text-slate-950 text-xs font-bold shadow-md flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{isAr ? 'بنر رسمي معتمد' : 'Active Banner'}</span>
                    </span>
                  )}
                </div>

                {/* Action buttons over banner */}
                <div className="absolute bottom-3 end-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-xl bg-black/70 hover:bg-black text-white text-xs font-semibold backdrop-blur-md border border-white/20 transition flex items-center gap-1.5 cursor-pointer shadow-lg"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#c5a869]" />
                    <span>{isAr ? 'استبدال البنر من جهازك' : 'Replace from Device'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onChange('')}
                    className="p-1.5 rounded-xl bg-rose-500/80 hover:bg-rose-600 text-white transition cursor-pointer shadow-lg"
                    title={isAr ? 'إزالة البنر والعودة للافتراضي' : 'Clear Banner'}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-900/80 hover:bg-slate-900 cursor-pointer transition p-4 text-center"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#c5a869]/20 text-[#e5cb8e] flex items-center justify-center mb-2">
                  <Upload className="w-6 h-6" />
                </div>
                <span className="text-sm font-bold text-white mb-1">
                  {isAr ? 'اضغط هنا لرفع صورة البنر من جهازك (أو اسحبها وأفلتها هنا)' : 'Click or drag & drop to upload hero banner'}
                </span>
                <span className="text-xs text-slate-400">
                  {isAr ? 'صيغ مدعومة: JPG, PNG, WebP بدقة عالية (يتم الضغط والمواءمة تلقائياً)' : 'Supports JPG, PNG, WebP with auto-compression'}
                </span>
              </div>
            )}
          </div>

          {/* Quick Drop Zone if banner already exists */}
          {value && (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`border border-dashed rounded-xl p-3 text-center cursor-pointer transition flex items-center justify-center gap-2 ${
                isDragging
                  ? 'border-[#c5a869] bg-[#c5a869]/15'
                  : 'border-slate-800 hover:border-slate-700 bg-slate-950/40'
              }`}
            >
              <Upload className="w-4 h-4 text-[#c5a869]" />
              <span className="text-xs text-slate-300">
                {isProcessing
                  ? (isAr ? 'جاري ضغط ومعالجة البنر...' : 'Processing...')
                  : (isAr ? 'أو اسحب ملف صورة جديد هنا من جهازك لتحديث البنر فوراً' : 'Or drag & drop new image file here')}
              </span>
            </div>
          )}

          {errorMessage && (
            <p className="text-xs text-rose-400 font-semibold">{errorMessage}</p>
          )}

          {helpText && (
            <p className="text-xs text-slate-400">{helpText}</p>
          )}
        </div>
      ) : (
        /* Standard Compact Grid Layout for Avatars/Logos */
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          
          {/* Preview Thumbnail */}
          <div className="sm:col-span-4 flex items-center justify-center">
            <div className={`relative ${aspectClass} overflow-hidden border-2 border-[#c5a869]/60 shadow-lg bg-slate-950 flex-shrink-0 group`}>
              {value ? (
                <img
                  src={value}
                  alt="Preview"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 bg-slate-900">
                  <ImageIcon className="w-8 h-8 opacity-40 mb-1" />
                  <span className="text-[10px]">{isAr ? 'لا توجد صورة' : 'No image'}</span>
                </div>
              )}

              {isUploadedDataUrl && (
                <div className="absolute top-1.5 start-1.5 px-1.5 py-0.5 rounded bg-emerald-500/90 text-slate-950 text-[9px] font-bold shadow flex items-center gap-0.5">
                  <Check className="w-2.5 h-2.5" />
                  <span>{isAr ? 'مرفوعة من الجهاز' : 'Uploaded'}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Button & Drag-Drop Area */}
          <div className="sm:col-span-8 space-y-2">
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 ${
                isDragging
                  ? 'border-[#c5a869] bg-[#c5a869]/15'
                  : 'border-slate-700 hover:border-[#c5a869]/70 bg-slate-950/60 hover:bg-slate-900/80'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-[#c5a869]/20 text-[#e5cb8e] flex items-center justify-center">
                {isProcessing ? (
                  <RefreshCw className="w-5 h-5 animate-spin text-[#c5a869]" />
                ) : (
                  <Upload className="w-5 h-5" />
                )}
              </div>

              <div>
                <p className="text-xs font-bold text-white mb-0.5">
                  {isProcessing
                    ? (isAr ? 'جاري ضغط ومعالجة الصورة...' : 'Processing image...')
                    : (isAr ? 'اضغط هنا لرفع صورة من جهازك' : 'Click to upload from device')}
                </p>
                <p className="text-[11px] text-slate-400">
                  {isAr ? 'أو اسحب وأفلت الصورة هنا (PNG, JPG, WebP)' : 'or drag & drop file here'}
                </p>
              </div>
            </div>

            {errorMessage && (
              <p className="text-[11px] text-rose-400">{errorMessage}</p>
            )}

            {helpText && (
              <p className="text-[11px] text-slate-400">{helpText}</p>
            )}
          </div>
        </div>
      )}

      {/* URL Input (Optional toggle) */}
      {showUrlInput && (
        <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 space-y-1.5 animate-fade-in">
          <label className="block text-[11px] text-slate-300">
            {isAr ? 'رابط الصورة المباشر (URL):' : 'Direct Image URL:'}
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="flex-grow px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-[#c5a869] focus:outline-none"
            />
            {value && (
              <button
                type="button"
                onClick={() => onChange('')}
                className="px-2.5 py-2 rounded-lg bg-slate-800 hover:bg-rose-500/20 hover:text-rose-300 text-slate-400 text-xs transition"
                title={isAr ? 'مسح' : 'Clear'}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Presets Gallery if provided */}
      {presets && presets.length > 0 && (
        <div className="pt-1">
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles className="w-3 h-3 text-[#c5a869]" />
            <span className="text-[11px] text-slate-400 font-medium">
              {isAr ? 'أو اختر من النماذج الاحترافية الجاهزة:' : 'Or choose a preset portrait:'}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {presets.map((presetImg, idx) => {
              const isSelected = value === presetImg;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onChange(presetImg)}
                  className={`relative w-10 h-10 rounded-xl overflow-hidden border-2 transition cursor-pointer ${
                    isSelected ? 'border-[#c5a869] scale-110 shadow-md ring-2 ring-[#c5a869]/40' : 'border-slate-800 opacity-65 hover:opacity-100 hover:border-slate-600'
                  }`}
                >
                  <img
                    src={presetImg}
                    alt={`Preset ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {isSelected && (
                    <div className="absolute inset-0 bg-[#c5a869]/30 flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 text-slate-950 font-bold" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
