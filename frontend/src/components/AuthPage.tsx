import React, { useState } from 'react';
import { UserIcon, Mail, Lock, UserCheck, Briefcase } from 'lucide-react';
import { User, UserRole } from '../types';
import { registerUser, loginUser } from '../api/users';

interface AuthPageProps {
  onLoginSuccess: (user: User) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: UserRole.RENTER
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        if (!formData.email || !formData.password) {
          setError('Заполните все обязательные поля');
          setLoading(false);
          return;
        }
        const user = await loginUser(formData.email, formData.password);
        onLoginSuccess(user);
      } else {
        if (!formData.name || !formData.email || !formData.password) {
          setError('Заполните все поля');
          setLoading(false);
          return;
        }
        const user = await registerUser({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        });
        onLoginSuccess(user);
      }
    } catch (err: any) {
      setError(err.message || 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden">
        <div className="flex text-lg font-medium border-b">
          <button 
            onClick={() => { setIsLogin(true); setError(''); }}
            className={`flex-1 py-4 text-center transition-colors ${isLogin ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Вход
          </button>
          <button 
            onClick={() => { setIsLogin(false); setError(''); }}
            className={`flex-1 py-4 text-center transition-colors ${!isLogin ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Регистрация
          </button>
        </div>

        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              {isLogin ? 'С возвращением!' : 'Создание аккаунта'}
            </h2>
            <p className="text-gray-500 mt-2 text-sm">
              {isLogin ? 'Войдите, чтобы управлять заказами' : 'Зарегистрируйтесь для начала работы'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
               <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ФИО / Название компании</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    required={!isLogin}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 text-gray-900 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition placeholder-gray-400"
                    placeholder="Иван Иванов"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 text-gray-900 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition placeholder-gray-400"
                  placeholder="name@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Пароль</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 text-gray-900 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition placeholder-gray-400"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Кто вы?</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, role: UserRole.RENTER})}
                    className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition ${formData.role === UserRole.RENTER ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                  >
                    <UserCheck className="h-6 w-6" />
                    <span className="text-sm font-medium">Арендатор</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, role: UserRole.OWNER})}
                    className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition ${formData.role === UserRole.OWNER ? 'border-purple-600 bg-purple-50 text-purple-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                  >
                    <Briefcase className="h-6 w-6" />
                    <span className="text-sm font-medium">Владелец</span>
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-600"></div>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-600/20 disabled:opacity-60"
            >
              {loading ? 'Загрузка...' : (isLogin ? 'Войти' : 'Зарегистрироваться')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
