import React, { useState } from 'react';
import { Menu, X, LogOut, User as UserIcon } from 'lucide-react';
import { User, UserRole } from '../types';

const Logo = ({ className = "h-8 w-8", textSize = "text-xl" }: { className?: string, textSize?: string }) => (
  <div className={`${className} bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold ${textSize} shadow-sm shrink-0`}>
    S
  </div>
);

interface HeaderProps {
  currentView: string;
  setCurrentView: (v: string) => void;
  user: User | null;
  onLogout: () => void;
  onLoginClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  setCurrentView,
  user,
  onLogout,
  onLoginClick
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center cursor-pointer" onClick={() => setCurrentView('home')}>
            <Logo />
            <span className="ml-2 text-2xl font-bold text-gray-900">SpecToRent</span>
          </div>
          
          <div className="hidden md:flex space-x-8">
            <button 
              onClick={() => setCurrentView('home')} 
              className={`${currentView === 'home' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'} px-3 py-2 text-sm font-medium`}
            >
              Главная
            </button>
            <button 
              onClick={() => setCurrentView('search')} 
              className={`${currentView === 'search' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'} px-3 py-2 text-sm font-medium`}
            >
              Поиск
            </button>
            {user && (
              <>
                <button 
                  onClick={() => setCurrentView('orders')} 
                  className={`${currentView === 'orders' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'} px-3 py-2 text-sm font-medium`}
                >
                  Мои заказы
                </button>
                <button 
                  onClick={() => setCurrentView('profile')} 
                  className={`${currentView === 'profile' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'} px-3 py-2 text-sm font-medium`}
                >
                  Профиль
                </button>
              </>
            )}
          </div>

          <div className="flex items-center">
            {user ? (
              <div className="flex items-center gap-4">
                 <div className="hidden md:flex flex-col items-end">
                    <span className="text-sm font-semibold text-gray-900">{user.name}</span>
                    <span className="text-xs text-gray-500">
                      {user.role === UserRole.OWNER ? 'Владелец' : 'Арендатор'}
                    </span>
                 </div>
                 <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold overflow-hidden border border-blue-200">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      user.name.charAt(0).toUpperCase()
                    )}
                 </div>
                 <button 
                  onClick={onLogout}
                  className="hidden md:flex items-center text-gray-400 hover:text-red-500 transition"
                  title="Выйти"
                 >
                   <LogOut className="h-5 w-5" />
                 </button>
              </div>
            ) : (
              <button 
                onClick={onLoginClick}
                className="bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-blue-700 transition shadow-sm flex items-center gap-2"
              >
                <UserIcon className="h-4 w-4" />
                Вход
              </button>
            )}

            <div className="md:hidden ml-4">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-2 pt-2 pb-3 space-y-1">
             <button onClick={() => { setCurrentView('home'); setIsMenuOpen(false); }} className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50">Главная</button>
             <button onClick={() => { setCurrentView('search'); setIsMenuOpen(false); }} className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50">Поиск</button>
             {user && (
               <>
                 <button onClick={() => { setCurrentView('orders'); setIsMenuOpen(false); }} className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50">Мои заказы</button>
                 <button onClick={() => { setCurrentView('profile'); setIsMenuOpen(false); }} className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50">Профиль</button>
               </>
             )}
             
             {!user ? (
               <button onClick={() => { onLoginClick(); setIsMenuOpen(false); }} className="block w-full text-left px-3 py-2 text-base font-medium text-blue-600 hover:bg-blue-50 mt-4 border-t pt-4">
                 Войти / Регистрация
               </button>
             ) : (
               <button onClick={() => { onLogout(); setIsMenuOpen(false); }} className="block w-full text-left px-3 py-2 text-base font-medium text-red-600 hover:bg-red-50 mt-4 border-t pt-4">
                 Выйти из аккаунта
               </button>
             )}
          </div>
        </div>
      )}
    </header>
  );
};
