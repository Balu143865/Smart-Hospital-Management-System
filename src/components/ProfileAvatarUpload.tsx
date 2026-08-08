import React, { useState, useRef } from 'react';
import { Camera, Upload, Image as ImageIcon, Check, Loader2, X, CloudUpload } from 'lucide-react';

interface ProfileAvatarUploadProps {
  value?: string;
  onChange: (url: string) => void;
  cloudName?: string;
  uploadPreset?: string;
  label?: string;
  className?: string;
}

export const ProfileAvatarUpload: React.FC<ProfileAvatarUploadProps> = ({
  value = '',
  onChange,
  cloudName = 'demo', // default fallback cloud name for Cloudinary upload
  uploadPreset = 'unsigned_preset',
  label = 'Profile Avatar Photo',
  className = ''
}) => {
  const [previewUrl, setPreviewUrl] = useState<string>(value);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadSource, setUploadSource] = useState<'cloudinary' | 'local' | 'url'>('local');
  const [customCloudName, setCustomCloudName] = useState<string>(cloudName);
  const [customPreset, setCustomPreset] = useState<string>(uploadPreset);
  const [showConfig, setShowConfig] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync internal preview when outer value changes
  React.useEffect(() => {
    setPreviewUrl(value);
  }, [value]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage('');

    // Instant local preview via FileReader
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setPreviewUrl(reader.result);
        onChange(reader.result);
      }
    };
    reader.readAsDataURL(file);

    // If Cloudinary configuration is active, attempt Cloudinary API upload
    if (customCloudName && customCloudName !== 'demo' && customPreset) {
      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', customPreset);

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${customCloudName}/image/upload`,
          {
            method: 'POST',
            body: formData,
          }
        );

        const data = response.ok ? await response.json().catch(() => ({})) : {};

        if (response.ok && data.secure_url) {
          setPreviewUrl(data.secure_url);
          onChange(data.secure_url);
          setUploadSource('cloudinary');
        } else {
          // Fallback to local data URL if Cloudinary upload preset fails
          console.warn('Cloudinary upload warning:', data.error?.message || 'Upload failed');
          setErrorMessage(data.error?.message ? `Cloudinary Note: ${data.error.message}. Saved locally.` : '');
        }
      } catch (err: any) {
        console.error('Cloudinary upload failed:', err);
        setErrorMessage('Cloudinary upload failed. Using local image copy.');
      } finally {
        setIsUploading(false);
      }
    } else {
      setUploadSource('local');
    }
  };

  const handleUrlChange = (newUrl: string) => {
    setPreviewUrl(newUrl);
    onChange(newUrl);
    setUploadSource('url');
    setErrorMessage('');
  };

  const presetAvatars = [
    'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200',
  ];

  return (
    <div className={`p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/60 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <label className="block font-semibold text-xs text-slate-700 dark:text-slate-300">
          {label}
        </label>
        <button
          type="button"
          onClick={() => setShowConfig(!showConfig)}
          className="text-[10px] text-cyan-600 dark:text-cyan-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
        >
          <CloudUpload className="w-3 h-3" />
          <span>{showConfig ? 'Hide Cloudinary Settings' : 'Cloudinary Config'}</span>
        </button>
      </div>

      {/* Optional Cloudinary API configuration bar */}
      {showConfig && (
        <div className="mb-3 p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-cyan-500/30 text-[11px] space-y-2">
          <p className="font-bold text-cyan-600 dark:text-cyan-400">Cloudinary Direct Upload Settings</p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold">Cloud Name</span>
              <input
                type="text"
                value={customCloudName}
                onChange={(e) => setCustomCloudName(e.target.value)}
                placeholder="e.g. my-hospital-cloud"
                className="w-full px-2 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
              />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold">Upload Preset</span>
              <input
                type="text"
                value={customPreset}
                onChange={(e) => setCustomPreset(e.target.value)}
                placeholder="e.g. ml_default / hospital_avatars"
                className="w-full px-2 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
              />
            </div>
          </div>
        </div>
      )}

      <div className="flex items-start gap-3">
        {/* Avatar Preview Ring */}
        <div className="relative group shrink-0">
          <img
            src={previewUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200'}
            alt="Avatar Preview"
            className="w-16 h-16 rounded-2xl object-cover ring-2 ring-cyan-500/40 shadow-md bg-slate-200 dark:bg-slate-700"
          />

          {isUploading && (
            <div className="absolute inset-0 bg-slate-900/70 rounded-2xl flex flex-col items-center justify-center text-white">
              <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
            </div>
          )}

          {!isUploading && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 bg-slate-900/60 text-white rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              title="Change Photo"
            >
              <Camera className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Upload Controls */}
        <div className="flex-1 space-y-2 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white font-bold text-[11px] rounded-xl shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
              <span>Upload Photo File</span>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            <span className="text-[10px] text-slate-400 font-mono">
              {uploadSource === 'cloudinary' ? 'Cloudinary CDN' : 'Local File / URL'}
            </span>
          </div>

          <input
            type="text"
            value={previewUrl}
            onChange={(e) => handleUrlChange(e.target.value)}
            placeholder="Or paste Cloudinary / image URL..."
            className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200"
          />

          {errorMessage && (
            <p className="text-[10px] text-amber-500 font-semibold">{errorMessage}</p>
          )}

          {/* Preset Avatars */}
          <div className="pt-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Sample Presets
            </span>
            <div className="flex items-center gap-1.5">
              {presetAvatars.map((url, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleUrlChange(url)}
                  className={`w-7 h-7 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                    previewUrl === url ? 'border-cyan-500 scale-105 shadow-sm' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={url} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
