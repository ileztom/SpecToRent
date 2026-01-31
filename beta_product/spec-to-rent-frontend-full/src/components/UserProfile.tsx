import React, { useState } from 'react';
import { User } from '../types';
import { updateUserProfile } from '../api/users';

interface Props {
  user: User;
  onUserUpdated: (user: User) => void;
}

export const UserProfile: React.FC<Props> = ({ user, onUserUpdated }) => {
  const [fullName, setFullName] = useState(user.name);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      setSaving(true);
      const updated = await updateUserProfile(Number(user.id), { fullName });
      onUserUpdated(updated);
      setSuccess('Профиль успешно обновлён');
    } catch (err: any) {
      setError(err.message || 'Не удалось сохранить профиль');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border p-4">
      <h2 className="text-lg font-semibold mb-4">Профиль</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Роль</label>
          <div className="text-sm font-medium">
            {user.role === 'OWNER' ? 'Владелец' : 'Арендатор'}
          </div>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Email</label>
          <div className="text-sm text-gray-600">{user.email}</div>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Имя / Компания</label>
          <input
            className="w-full border rounded-lg px-3 py-2 text-sm"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>
        {error && <div className="text-sm text-red-500">{error}</div>}
        {success && <div className="text-sm text-green-600">{success}</div>}
        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-semibold hover:bg-blue-700 disabled:opacity-60"
        >
          {saving ? 'Сохранение...' : 'Сохранить изменения'}
        </button>
      </form>
    </div>
  );
};

