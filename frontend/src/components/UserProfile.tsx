import React, { useState, useRef } from 'react';
import { User, UserRole } from '../types';
import { updateUserProfile } from '../api/users';
import { User as UserIcon, Phone, Building, MapPin, FileText, Camera, Trash2 } from 'lucide-react';

async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to upload');
  }
  const data = await res.json();
  return data.url;
}

interface Props {
  user: User;
  onUserUpdated: (user: User) => void;
}

const isCustomAvatar = (url: string | undefined): boolean => {
  if (!url) return false;
  return url.startsWith('/uploads/') || url.startsWith('http://') && url.includes('/uploads/');
};

export const UserProfile: React.FC<Props> = ({ user, onUserUpdated }) => {
  const customAvatar = isCustomAvatar(user.avatar) ? user.avatar : '';
  const [formData, setFormData] = useState({
    fullName: user.name,
    phone: user.phone || '',
    companyName: user.companyName || '',
    description: user.description || '',
    region: user.region || '',
    avatarUrl: customAvatar,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(customAvatar || null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      setError('Выберите изображение (JPEG или PNG)');
      return;
    }
    
    setUploadingAvatar(true);
    setError(null);
    
    try {
      const url = await uploadImage(file);
      setFormData({ ...formData, avatarUrl: url });
      setAvatarPreview(url);
    } catch (e: any) {
      setError('Не удалось загрузить фото: ' + e.message);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleRemoveAvatar = () => {
    setFormData({ ...formData, avatarUrl: '' });
    setAvatarPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      setSaving(true);
      const updated = await updateUserProfile(Number(user.id), formData);
      onUserUpdated(updated);
      setSuccess('Профиль успешно обновлён');
    } catch (err: any) {
      setError(err.message || 'Не удалось сохранить профиль');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <input
                type="file"
                ref={avatarInputRef}
                onChange={handleAvatarChange}
                accept="image/jpeg,image/png"
                className="hidden"
              />
              <div 
                className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center overflow-hidden cursor-pointer"
                onClick={() => avatarInputRef.current?.click()}
              >
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-10 h-10 text-white" />
                )}
                {uploadingAvatar && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full">
                    <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full"></div>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-blue-600 hover:bg-blue-50 transition"
              >
                <Camera className="w-4 h-4" />
              </button>
              {avatarPreview && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="absolute -bottom-1 -left-1 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-red-600 hover:bg-red-50 transition"
                  title="Удалить фото"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="text-white">
              <h2 className="text-2xl font-bold">{user.name}</h2>
              <p className="text-blue-100">{user.email}</p>
              <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
                user.role === UserRole.OWNER 
                  ? 'bg-purple-500/30 text-purple-100' 
                  : 'bg-green-500/30 text-green-100'
              }`}>
                {user.role === UserRole.OWNER ? 'Владелец техники' : 'Арендатор'}
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <UserIcon className="w-4 h-4" />
              ФИО / Название компании
            </label>
            <input
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="Иван Иванов"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Phone className="w-4 h-4" />
              Телефон
            </label>
            <input
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+7 (999) 123-45-67"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Building className="w-4 h-4" />
              Название компании
            </label>
            <input
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              placeholder="ООО 'Строймашины'"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4" />
              Регион
            </label>
            <input
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
              value={formData.region}
              onChange={(e) => setFormData({ ...formData, region: e.target.value })}
              placeholder="Москва"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <FileText className="w-4 h-4" />
              О себе / О компании
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition resize-none"
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Расскажите о себе или о вашей компании..."
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-600"></div>
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 text-green-600 text-sm p-3 rounded-lg flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-600"></div>
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-blue-600 text-white rounded-xl px-4 py-3 font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-600/20 disabled:opacity-60"
          >
            {saving ? 'Сохранение...' : 'Сохранить изменения'}
          </button>
        </form>
      </div>
    </div>
  );
};
