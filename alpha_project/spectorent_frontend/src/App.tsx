
import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  MapPin, 
  FileText, 
  CheckSquare, 
  User as UserIcon, 
  Clock, 
  CheckCircle,
  Menu,
  X,
  Send,
  Zap,
  ArrowRight,
  Plus,
  Filter,
  Calendar,
  LogOut,
  ChevronRight,
  Mail,
  Lock,
  Briefcase,
  UserCheck,
  ArrowLeft,
  MessageSquare,
  Trash2,
  Info
} from 'lucide-react';
import { 
  User, 
  UserRole, 
  Machinery, 
  Order, 
  OrderStatus, 
  ChatMessage 
} from './types';
import { 
  CURRENT_RENTER, 
  CURRENT_OWNER, 
  MOCK_MACHINERY, 
  REGIONS, 
  CATEGORIES 
} from './constants';

// --- Auth Utils ---
const STORAGE_KEY_USERS = 'spectorent_users';
const STORAGE_KEY_CURRENT_USER = 'spectorent_current_user_id';
const STORAGE_KEY_ORDERS = 'spectorent_orders';

const getStoredUsers = (): User[] & { password?: string }[] => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_USERS) || '[]');
  } catch {
    return [];
  }
};

const getStoredCurrentUser = (): User | null => {
  const userId = localStorage.getItem(STORAGE_KEY_CURRENT_USER);
  if (!userId) return null;
  const users = getStoredUsers();
  return users.find(u => u.id === userId) || null;
};

const getStoredOrders = (): any[] => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_ORDERS) || '[]');
  } catch {
    return [];
  }
};

// --- Components ---

const Logo = ({ className = "h-8 w-8", textSize = "text-xl" }: { className?: string, textSize?: string }) => (
  <div className={`${className} bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold ${textSize} shadow-sm shrink-0`}>
    S
  </div>
);

const Header = ({ 
  currentView, 
  setCurrentView, 
  user,
  onLogout,
  onLoginClick
}: { 
  currentView: string, 
  setCurrentView: (v: string) => void, 
  user: User | null,
  onLogout: () => void,
  onLoginClick: () => void
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
              <button 
                onClick={() => setCurrentView('orders')} 
                className={`${currentView === 'orders' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'} px-3 py-2 text-sm font-medium`}
              >
                Мои заказы
              </button>
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
                {isMenuOpen ? <X /> : <Menu />}
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
               <button onClick={() => { setCurrentView('orders'); setIsMenuOpen(false); }} className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50">Мои заказы</button>
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

const AuthPage = ({ onLoginSuccess }: { onLoginSuccess: (user: User) => void }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: UserRole.RENTER
  });
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Заполните все обязательные поля');
      return;
    }

    const users = getStoredUsers();

    if (isLogin) {
      const user = users.find(u => u.email === formData.email && (u as any).password === formData.password);
      if (user) {
        localStorage.setItem(STORAGE_KEY_CURRENT_USER, user.id);
        onLoginSuccess(user);
      } else {
        setError('Неверный email или пароль');
      }
    } else {
      // Registration
      if (!formData.name) {
        setError('Введите имя');
        return;
      }
      if (users.find(u => u.email === formData.email)) {
        setError('Пользователь с таким email уже существует');
        return;
      }

      const newUser: User & { password: string } = {
        id: Date.now().toString(),
        name: formData.name,
        email: formData.email,
        role: formData.role,
        password: formData.password,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${formData.name}`
      };

      users.push(newUser);
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
      localStorage.setItem(STORAGE_KEY_CURRENT_USER, newUser.id);
      onLoginSuccess(newUser);
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
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-600/20"
            >
              {isLogin ? 'Войти' : 'Зарегистрироваться'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// ... [Existing LineChart Component]
const LineChart = () => {
  const [activeDataPoint, setActiveDataPoint] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const data = [
    { year: 2020, value: 644.5 },
    { year: 2021, value: 920.5 },
    { year: 2022, value: 1070.7 },
    { year: 2023, value: 1410.2 },
    { year: 2024, value: 1600.0 }
  ];

  const getX = (index: number) => (index / (data.length - 1)) * 1000;
  const getY = (value: number) => 300 - (value / 1800) * 300; 

  const pathD = `M${getX(0)},${getY(data[0].value)} C${getX(1)},${getY(data[0].value)} ${getX(0) + 100},${getY(data[1].value)} ${getX(1)},${getY(data[1].value)} S${getX(2)},${getY(data[2].value)} ${getX(2)},${getY(data[2].value)} S${getX(3)},${getY(data[3].value)} ${getX(3)},${getY(data[3].value)} S${getX(4)},${getY(data[4].value)} ${getX(4)},${getY(data[4].value)}`;

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    
    const index = Math.round((x / width) * (data.length - 1));
    if (index >= 0 && index < data.length) {
      setActiveDataPoint(index);
    }
  };

  const handleMouseLeave = () => {
    setActiveDataPoint(null);
  };

  return (
    <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-blue-50 w-full h-full flex flex-col justify-between transform hover:scale-[1.01] transition duration-300">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">Рост потребления услуг</h3>
        <span className="text-xs md:text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full whitespace-nowrap">руб/чел</span>
      </div>
      
      <div 
        ref={containerRef}
        className="relative flex-grow min-h-[250px] w-full cursor-crosshair"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
         <svg className="w-full h-full overflow-visible" viewBox="0 0 1000 300" preserveAspectRatio="none">
            <line x1="0" y1="250" x2="1000" y2="250" stroke="#F3F4F6" strokeWidth="2" />
            <line x1="0" y1="150" x2="1000" y2="150" stroke="#F3F4F6" strokeWidth="2" />
            <line x1="0" y1="50" x2="1000" y2="50" stroke="#F3F4F6" strokeWidth="2" />

            <defs>
              <linearGradient id="blueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#2563EB" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d={`${pathD} L1000,350 L0,350 Z`}
              fill="url(#blueGradient)"
            />

            <path
              d={pathD}
              fill="none"
              stroke="#2563EB"
              strokeWidth="6"
              strokeLinecap="round"
              className="drop-shadow-md"
            />

            {activeDataPoint !== null && (
              <>
                <line 
                  x1={getX(activeDataPoint)} 
                  y1="0" 
                  x2={getX(activeDataPoint)} 
                  y2="300" 
                  stroke="#93C5FD" 
                  strokeWidth="2" 
                  strokeDasharray="5,5" 
                />
                <circle 
                  cx={getX(activeDataPoint)} 
                  cy={getY(data[activeDataPoint].value)} 
                  r="8" 
                  fill="#FFFFFF" 
                  stroke="#2563EB" 
                  strokeWidth="3" 
                />
              </>
            )}
         </svg>

         {activeDataPoint !== null && (
           <div 
             className="absolute bg-gray-900 text-white text-sm rounded-lg py-2 px-3 shadow-xl transform -translate-x-1/2 -translate-y-full pointer-events-none z-10 transition-all duration-75"
             style={{ 
               left: `${(activeDataPoint / (data.length - 1)) * 100}%`,
               top: `${(getY(data[activeDataPoint].value) / 300) * 100}%`,
               marginTop: '-15px'
             }}
           >
             <div className="font-bold">{data[activeDataPoint].year}</div>
             <div className="text-blue-200">{data[activeDataPoint].value} руб/чел</div>
             <div className="absolute bottom-[-6px] left-1/2 transform -translate-x-1/2 w-3 h-3 bg-gray-900 rotate-45"></div>
           </div>
         )}
         
         <div className="absolute bottom-[-25px] w-full flex justify-between text-xs md:text-sm text-gray-400 font-medium px-1">
            {data.map((d, i) => (
              <span key={i} className={activeDataPoint === i ? 'text-blue-600 font-bold scale-110 transition-transform' : 'transition-transform'}>
                {d.year}
              </span>
            ))}
         </div>
      </div>
       <div className="mt-8 text-center text-xs text-gray-400">
        Рост рынка 8-10% ежегодно (Данные: ГИДМАРКЕТ, РБК)
      </div>
    </div>
  );
};

const CategoryGrid = ({ onCategorySelect }: { onCategorySelect: (cat: string) => void }) => {
  const categories = [
    { name: 'Самосвалы', img: 'https://sab1.ru/wp-content/uploads/2022/08/samosvali.png' },
    { name: 'Экскаваторы', img: 'https://www.vost-tech.ru/images/catalog/BHL/444F2/444f2-main.jpg' },
    { name: 'Манипуляторы', img: 'https://ooouc.ru/upload/iblock/24d/24de728a69c2cc88a290267498dd50f5.jpg' },
    { name: 'Колёсные экскаваторы', img: 'https://sinotechmach.ru/wp-content/uploads/2023/06/GHT160W.jpg' },
    { name: 'Бульдозеры', img: 'https://www.vost-tech.ru/images/img_user/2/buldozer_01.jpg' },
    { name: 'Тралы', img: 'https://excavatorsale.ru/wp-content/uploads/2023/03/90t-1.jpg' },
    { name: 'Башенные краны', img: 'https://cranemarket.ru/wp-content/uploads/2024/06/bashennyj-kran-liugong__kran-market.png' },
    { name: 'Автовышки', img: 'https://avtovyshki-arenda-ekb.ru/wp-content/uploads/2017/12/truck.png' },
    { name: 'Автокраны', img: 'https://mrg11.ru/upload/iblock/60c/73wdnqbs7hkdii7xof328w748iq2xshi.jpg' },
  ];

  return (
    <div className="bg-white rounded-3xl p-8 md:p-12 border border-gray-100 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Категория спецтехники <span className="text-gray-400 font-normal text-lg ml-2">популярные</span></h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categories.map((cat, idx) => (
                <div 
                  key={idx} 
                  className="relative group rounded-xl overflow-hidden shadow-sm aspect-[4/3] cursor-pointer hover:shadow-md transition-all duration-300"
                  onClick={() => onCategorySelect(cat.name)}
                >
                    <img src={cat.img} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3">
                        <span className="text-white font-medium text-sm md:text-base leading-tight">{cat.name}</span>
                    </div>
                </div>
            ))}
        </div>
        <div className="mt-8 flex justify-center">
          <button 
            onClick={() => onCategorySelect('')}
            className="bg-blue-100 text-blue-700 px-8 py-3 rounded-xl font-bold hover:bg-blue-200 transition flex items-center gap-2"
          >
              <div className="grid grid-cols-2 gap-1 w-4 h-4 opacity-70">
                  <div className="bg-blue-700 rounded-[1px]"></div>
                  <div className="bg-blue-700 rounded-[1px]"></div>
                  <div className="bg-blue-700 rounded-[1px]"></div>
                  <div className="bg-blue-700 rounded-[1px]"></div>
              </div>
              Все категории
          </button>
        </div>
    </div>
  );
};

// ... [Existing HowItWorksSection Component - Unchanged]
const HowItWorksSection = () => {
  const steps = [
    { 
      id: 1, 
      title: 'Выберите технику', 
      desc: 'Используйте поиск и фильтры для подбора идеальной спецтехники под ваши задачи.', 
      icon: Search 
    },
    { 
      id: 2, 
      title: 'Укажите даты', 
      desc: 'Проверьте доступность техники в реальном времени и выберите удобное время аренды.', 
      icon: Calendar 
    },
    { 
      id: 3, 
      title: 'Оформите заявку', 
      desc: 'Заполните простую форму. Договор аренды формируется автоматически и подписывается онлайн.', 
      icon: FileText 
    },
    { 
      id: 4, 
      title: 'Начните работу', 
      desc: 'Техника прибудет на объект точно в срок. Владелец получит оплату после выполнения работ.', 
      icon: CheckCircle 
    },
  ];

  return (
    <div id="how-it-works" className="py-16 bg-white border-y border-gray-100">
       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Как это работает?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Мы сделали процесс аренды спецтехники максимально простым и прозрачным. 
              Всего 4 шага от поиска до результата.
            </p>
          </div>
          
          <div className="relative">
             <div className="hidden md:block absolute top-12 left-[12%] right-[12%] h-0.5 bg-blue-100 -z-10"></div>
             <div className="grid md:grid-cols-4 gap-10">
               {steps.map((step) => (
                  <div key={step.id} className="flex flex-col items-center text-center group">
                     <div className="w-24 h-24 bg-white rounded-full border-4 border-blue-50 flex items-center justify-center mb-6 relative z-10 group-hover:border-blue-200 transition-colors duration-300">
                        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg transform group-hover:scale-110 transition duration-300">
                           <step.icon className="h-8 w-8" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-8 h-8 bg-orange-400 rounded-full flex items-center justify-center text-white font-bold text-sm border-2 border-white shadow-sm">
                          {step.id}
                        </div>
                     </div>
                     <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                     <p className="text-gray-500 text-sm leading-relaxed max-w-[250px]">{step.desc}</p>
                  </div>
               ))}
             </div>
          </div>
       </div>
    </div>
  );
};

// ... [Existing AdvantagesSection Component - Unchanged]
const AdvantagesSection = ({ onStartSearch, onBecomePartner }: { onStartSearch: () => void, onBecomePartner: () => void }) => (
  <div className="py-16">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3 mb-10 justify-center md:justify-start">
         <div className="bg-black text-white p-2 rounded-lg">
            <Zap className="h-6 w-6" />
         </div>
         <h2 className="text-3xl font-bold text-gray-900">Преимущества площадки SpecToRent</h2>
      </div>

      <div className="space-y-4">
        <div className="bg-white rounded-3xl p-8 md:p-12 border-2 border-gray-100 relative overflow-hidden transform skew-y-0 shadow-lg">
           <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 -translate-y-1/2 translate-x-1/2"></div>
           <h3 className="text-2xl font-bold mb-6 text-gray-900 relative z-10">Для арендаторов</h3>
           <ul className="space-y-4 relative z-10">
              <li className="flex items-start">
                 <CheckCircle className="h-6 w-6 text-black mr-3 flex-shrink-0" />
                 <div>
                    <span className="font-bold text-lg block">Быстрый поиск нужной спецтехники</span>
                    <span className="text-gray-500 text-sm">Вы можете найти нужную вам техники в пару кликов по параметрам</span>
                 </div>
              </li>
              <li className="flex items-start">
                 <CheckCircle className="h-6 w-6 text-black mr-3 flex-shrink-0" />
                 <div>
                    <span className="font-bold text-lg block">Возможность оформления заказа онлайн</span>
                    <span className="text-gray-500 text-sm">Чтобы вы могли оформить аренду спецтехники, вам достаточно оплатить заказ и выбрать дату</span>
                 </div>
              </li>
              <li className="flex items-start">
                 <CheckCircle className="h-6 w-6 text-black mr-3 flex-shrink-0" />
                 <div>
                    <span className="font-bold text-lg block">Подписания договора цифровой подписью</span>
                    <span className="text-gray-500 text-sm">Подписывайте договор аренды техники онлайн после покупки, чтобы не потерять документы</span>
                 </div>
              </li>
           </ul>
        </div>

        <div className="bg-gray-100 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
               <h4 className="font-bold text-xl text-gray-900">Хотите взять технику в аренду?</h4>
               <p className="text-gray-500">Найдите подходящую технику и предложение в каталоге.</p>
            </div>
            <button 
              onClick={onStartSearch}
              className="bg-orange-400 hover:bg-orange-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition shadow-md whitespace-nowrap"
            >
              <Search className="h-5 w-5" />
              Поиск спецтехники
            </button>
        </div>

        <div className="bg-white rounded-3xl p-8 md:p-12 border-2 border-gray-100 relative overflow-hidden transform skew-y-0 shadow-lg">
           <div className="absolute top-0 right-0 w-64 h-64 bg-purple-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 -translate-y-1/2 translate-x-1/2"></div>
           <h3 className="text-2xl font-bold mb-6 text-gray-900 relative z-10">Для владельцев спецтехники</h3>
           <ul className="space-y-4 relative z-10">
              <li className="flex items-start">
                 <CheckCircle className="h-6 w-6 text-black mr-3 flex-shrink-0" />
                 <div>
                    <span className="font-bold text-lg block">Удобство и простота размещения объявлений</span>
                    <span className="text-gray-500 text-sm">Благодаря простоте платформы SpecToRent, вы можете быстро приступить к размещению</span>
                 </div>
              </li>
              <li className="flex items-start">
                 <CheckCircle className="h-6 w-6 text-black mr-3 flex-shrink-0" />
                 <div>
                    <span className="font-bold text-lg block">Неограниченное количество предложений</span>
                    <span className="text-gray-500 text-sm">Даже если в вашем парке сотни единиц техники в аренду, вы сможете разместить их все</span>
                 </div>
              </li>
              <li className="flex items-start">
                 <CheckCircle className="h-6 w-6 text-black mr-3 flex-shrink-0" />
                 <div>
                    <span className="font-bold text-lg block">Широкая аудитория клиентов</span>
                    <span className="text-gray-500 text-sm">Арендодатели спецтехники получают обширный поток клиентов за счёт нашей платформы</span>
                 </div>
              </li>
           </ul>
        </div>

        <div className="bg-gray-100 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
               <h4 className="font-bold text-xl text-gray-900">Предоставляете спецтехнику в аренду?</h4>
               <p className="text-gray-500">Добавьте информацию о компании и предложениях. Это бесплатно.</p>
            </div>
            <button 
              onClick={onBecomePartner}
              className="bg-orange-400 hover:bg-orange-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition shadow-md whitespace-nowrap"
            >
              <Plus className="h-5 w-5" />
              Разместить информацию
            </button>
        </div>
      </div>
    </div>
  </div>
);

const LandingPage = ({ onStartSearch, onCategorySelect }: { onStartSearch: () => void, onCategorySelect: (cat: string) => void }) => {
  const scrollToHowItWorks = () => {
    const element = document.getElementById('how-it-works');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="flex flex-col bg-gray-50">
      <div className="bg-white pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight text-gray-900">
                Аренда спецтехники <br/>
                <span className="text-blue-600">в одно касание</span>
              </h1>
              <p className="text-lg md:text-xl mb-8 text-gray-600">
                Инновационный маркетплейс, объединяющий владельцев и арендаторов. 
                Быстрый поиск, цифровые договоры и безопасные сделки по всей России.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={onStartSearch}
                  className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition shadow-lg flex items-center justify-center gap-2"
                >
                  Найти технику
                  <ArrowRight className="h-5 w-5" />
                </button>
                <button 
                  onClick={scrollToHowItWorks}
                  className="bg-white text-gray-700 border border-gray-200 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-50 transition"
                >
                  Как это работает?
                </button>
              </div>
            </div>
            <div className="order-1 lg:order-2 relative">
               <div className="absolute inset-0 bg-blue-600 rounded-3xl transform rotate-3 opacity-10 blur-xl"></div>
               <img 
                src="https://dstvs.ru/media/product/777a-5.jpg" 
                alt="Спецтехника" 
                className="relative rounded-3xl shadow-2xl object-cover h-[400px] w-full"
               />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col gap-12">
            <div className="w-full">
               <LineChart />
            </div>
            
            <div className="w-full">
               <CategoryGrid onCategorySelect={onCategorySelect} />
            </div>
          </div>
      </div>

      <HowItWorksSection />

      <AdvantagesSection onStartSearch={onStartSearch} onBecomePartner={() => console.log('Partner')} />
    </div>
  );
};

const SearchPage = ({ initialCategory, onViewDetails, user }: { initialCategory: string, onViewDetails: (m: Machinery) => void, user: User | null }) => {
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);

  const filteredMachinery = MOCK_MACHINERY.filter(m => {
    const matchRegion = selectedRegion ? m.region === selectedRegion : true;
    const matchCategory = selectedCategory ? m.category === selectedCategory : true;
    return matchRegion && matchCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 space-y-4">
        <h2 className="text-3xl font-bold text-gray-900">Поиск спецтехники</h2>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 grid md:grid-cols-2 gap-4">
           <div className="relative">
             <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
             <select 
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white"
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
             >
               <option value="">Все регионы</option>
               {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
             </select>
           </div>
           <div className="relative">
             <Filter className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
             <select 
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
             >
               <option value="">Все категории</option>
               {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
             </select>
           </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
         {filteredMachinery.map(machinery => (
           <div 
             key={machinery.id} 
             onClick={() => onViewDetails(machinery)}
             className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition cursor-pointer group"
           >
             <div className="h-48 overflow-hidden relative">
               <img src={machinery.imageUrl} alt={machinery.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
               <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-sm font-semibold text-gray-700">
                 {machinery.category}
               </div>
             </div>
             <div className="p-5">
               <div className="flex justify-between items-start mb-2">
                 <div>
                   <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">{machinery.name}</h3>
                   <div className="flex items-center text-sm text-gray-500 mt-1">
                      <MapPin className="h-3 w-3 mr-1" />
                      {machinery.region}
                   </div>
                 </div>
                 <div className="text-right">
                   <div className="font-bold text-blue-600 text-lg">{machinery.pricePerShift.toLocaleString()} ₽</div>
                   <div className="text-xs text-gray-400">за смену</div>
                 </div>
               </div>
               <p className="text-sm text-gray-600 mb-4 line-clamp-2">{machinery.description}</p>
               <div className="flex justify-between items-center border-t pt-4 mt-2">
                 <div className="text-xs text-gray-500">
                    Владелец: <span className="font-medium text-gray-700">СтройТех</span>
                 </div>
                 <div className="flex items-center text-blue-600 text-sm font-medium">
                   Подробнее <ArrowRight className="h-4 w-4 ml-1" />
                 </div>
               </div>
             </div>
           </div>
         ))}
         {filteredMachinery.length === 0 && (
           <div className="col-span-full text-center py-12 text-gray-500">
             Ничего не найдено по вашим параметрам
           </div>
         )}
      </div>
    </div>
  );
}

const MachineryDetailsPage = ({ 
  machinery, 
  onBack, 
  onCreateOrder, 
  user,
  onLogin 
}: { 
  machinery: Machinery, 
  onBack: () => void, 
  onCreateOrder: (data: { startDate: string, endDate: string, quantity: number }) => void,
  user: User | null,
  onLogin: () => void
}) => {
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [quantity, setQuantity] = useState(1);

  const calculateTotal = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Inclusive
    if (diffDays <= 0) return 0;
    return diffDays * machinery.pricePerShift * quantity;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onLogin();
      return;
    }
    if (!startDate || !endDate) {
      alert("Выберите даты аренды");
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
        alert("Дата окончания не может быть раньше даты начала");
        return;
    }
    if (quantity > machinery.availableCount) {
      alert("Превышено доступное количество техники");
      return;
    }
    onCreateOrder({ startDate, endDate, quantity });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={onBack} className="flex items-center text-gray-500 hover:text-gray-900 mb-6 w-fit">
        <ArrowLeft className="h-5 w-5 mr-2" />
        Назад к поиску
      </button>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left: Image & Specs */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 aspect-video relative">
            <img src={machinery.imageUrl} alt={machinery.name} className="w-full h-full object-cover" />
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg text-sm font-semibold text-gray-800 shadow-sm">
                {machinery.category}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                 <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{machinery.name}</h1>
                    <div className="flex items-center text-gray-500">
                        <MapPin className="h-4 w-4 mr-1" />
                        {machinery.region}
                    </div>
                 </div>
                 <div className="text-left md:text-right">
                    <div className="text-3xl font-bold text-blue-600">{machinery.pricePerShift.toLocaleString()} ₽</div>
                    <div className="text-sm text-gray-400">стоимость смены</div>
                 </div>
             </div>

             <div className="prose prose-blue max-w-none text-gray-600 mb-8">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Описание</h3>
                <p>{machinery.description}</p>
             </div>

             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t">
                <div>
                   <div className="text-xs text-gray-400 mb-1">Тип техники</div>
                   <div className="font-medium">{machinery.type}</div>
                </div>
                <div>
                   <div className="text-xs text-gray-400 mb-1">Доступно</div>
                   <div className="font-medium text-green-600">{machinery.availableCount} ед.</div>
                </div>
                <div>
                   <div className="text-xs text-gray-400 mb-1">Владелец</div>
                   <div className="font-medium">СтройТех Групп</div>
                </div>
                <div>
                   <div className="text-xs text-gray-400 mb-1">Мин. срок</div>
                   <div className="font-medium">1 смена</div>
                </div>
             </div>
          </div>
        </div>

        {/* Right: Booking Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-50 sticky top-24">
             {!showBookingForm ? (
                <div className="text-center space-y-4">
                   <h3 className="text-xl font-bold text-gray-900">Аренда техники</h3>
                   <p className="text-sm text-gray-500">
                     Свяжитесь с владельцем и оформите договор аренды онлайн. Безопасная сделка через платформу.
                   </p>
                   {user ? (
                      <button 
                        onClick={() => setShowBookingForm(true)}
                        className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-600/20"
                      >
                        Оформить договор
                      </button>
                   ) : (
                      <button 
                        onClick={onLogin}
                        className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-600/20"
                      >
                        Войти для оформления
                      </button>
                   )}
                   <div className="flex items-center justify-center gap-2 text-xs text-gray-400 pt-2">
                      <CheckCircle className="h-3 w-3" />
                      Без скрытых комиссий
                   </div>
                </div>
             ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                   <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-bold text-gray-900">Параметры договора</h3>
                      <button type="button" onClick={() => setShowBookingForm(false)} className="text-gray-400 hover:text-gray-600">
                         <X className="h-5 w-5" />
                      </button>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-3">
                      <div>
                         <label className="block text-xs font-medium text-gray-700 mb-1">Начало аренды</label>
                         <input 
                           type="date" 
                           required
                           className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                           value={startDate}
                           onChange={(e) => setStartDate(e.target.value)}
                           min={new Date().toISOString().split('T')[0]}
                         />
                      </div>
                      <div>
                         <label className="block text-xs font-medium text-gray-700 mb-1">Конец аренды</label>
                         <input 
                           type="date" 
                           required
                           className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                           value={endDate}
                           onChange={(e) => setEndDate(e.target.value)}
                           min={startDate || new Date().toISOString().split('T')[0]}
                         />
                      </div>
                   </div>

                   <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Количество техники <span className="text-gray-400 ml-1">(макс: {machinery.availableCount})</span>
                      </label>
                      <div className="flex items-center border rounded-lg overflow-hidden bg-white">
                        <button 
                          type="button"
                          className="px-3 py-2 bg-gray-50 hover:bg-gray-100 border-r"
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        >
                          -
                        </button>
                        <input 
                          type="number" 
                          min="1" 
                          max={machinery.availableCount}
                          className="w-full text-center outline-none py-2 text-sm bg-white text-gray-900"
                          value={quantity}
                          onChange={(e) => {
                             const val = parseInt(e.target.value);
                             if (!isNaN(val)) setQuantity(Math.min(machinery.availableCount, Math.max(1, val)));
                          }}
                        />
                        <button 
                          type="button"
                          className="px-3 py-2 bg-gray-50 hover:bg-gray-100 border-l"
                          onClick={() => setQuantity(Math.min(machinery.availableCount, quantity + 1))}
                        >
                          +
                        </button>
                      </div>
                   </div>

                   <div className="bg-gray-50 rounded-lg p-4 space-y-2 mt-4">
                      <div className="flex justify-between text-sm">
                         <span className="text-gray-500">Цена за смену</span>
                         <span>{machinery.pricePerShift.toLocaleString()} ₽</span>
                      </div>
                      <div className="flex justify-between text-sm">
                         <span className="text-gray-500">Количество</span>
                         <span>{quantity} шт.</span>
                      </div>
                      <div className="border-t pt-2 mt-2 flex justify-between font-bold text-lg">
                         <span>Итого:</span>
                         <span className="text-blue-600">{calculateTotal().toLocaleString()} ₽</span>
                      </div>
                   </div>

                   <button 
                      type="submit"
                      className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-600/20"
                   >
                      Подтвердить
                   </button>
                </form>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

const OrderDetailsPage = ({ order, onBack, onCancelOrder }: { order: any, onBack: () => void, onCancelOrder: (id: string) => void }) => {
  const [message, setMessage] = useState('');
  // Clean initialization of messages, removed dummy data
  const [messages, setMessages] = useState<any[]>([]);

  const handleSend = () => {
    if (!message.trim()) return;
    setMessages([...messages, { id: Date.now(), text: message, isMe: true, time: new Date().toLocaleTimeString().slice(0, 5) }]);
    setMessage('');
  };

  const handleCancelClick = () => {
    if (window.confirm('Вы действительно хотите отозвать заказ? Это действие нельзя отменить.')) {
      onCancelOrder(order.id);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-64px)] flex flex-col">
      <button onClick={onBack} className="flex items-center text-gray-500 hover:text-gray-900 mb-6 w-fit">
        <ArrowLeft className="h-5 w-5 mr-2" />
        Назад к заказам
      </button>

      <div className="flex flex-col lg:flex-row gap-6 flex-grow overflow-hidden">
        {/* Order Info */}
        <div className="w-full lg:w-1/3 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 overflow-y-auto flex flex-col">
          <div className="aspect-video rounded-xl overflow-hidden mb-4 shrink-0">
            <img src={order.machineryImage} alt={order.machineryName} className="w-full h-full object-cover" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{order.machineryName}</h2>
          <div className="flex items-center justify-between mb-4">
             <span className={`px-3 py-1 rounded-full text-sm font-medium ${order.status === OrderStatus.ACTIVE ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                {order.status === OrderStatus.ACTIVE ? 'Активен' : 'Ожидает подтверждения'}
             </span>
             <span className="font-bold text-lg text-gray-900">{order.amount.toLocaleString()} ₽</span>
          </div>
          
          <div className="space-y-4 border-t pt-4 flex-grow">
            <div>
              <div className="text-sm text-gray-500 mb-1">Даты аренды</div>
              <div className="font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                {order.dates}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Количество</div>
              <div className="font-medium flex items-center gap-2">
                {order.quantity ? order.quantity : 1} шт.
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Владелец</div>
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-gray-200"></div>
                 <span className="font-medium">СтройТех Групп</span>
              </div>
            </div>
          </div>

          {order.status === OrderStatus.WAITING && (
            <button 
              onClick={handleCancelClick}
              className="mt-6 w-full bg-red-50 hover:bg-red-100 text-red-600 py-3 rounded-xl font-bold transition flex items-center justify-center gap-2"
            >
              <Trash2 className="h-5 w-5" />
              Отозвать заказ
            </button>
          )}
        </div>

        {/* Chat */}
        <div className="w-full lg:w-2/3 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
          <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
            <div className="font-bold text-lg flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              Чат с владельцем
            </div>
          </div>
          
          <div className="flex-grow p-4 overflow-y-auto space-y-4 bg-gray-50/50">
             {messages.length === 0 && (
               <div className="h-full flex flex-col items-center justify-center text-gray-400">
                 <MessageSquare className="h-10 w-10 mb-2 opacity-20" />
                 <p className="text-sm">История сообщений пуста</p>
               </div>
             )}
             {messages.map((msg) => (
               <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                 <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'}`}>
                    <p>{msg.text}</p>
                    <div className={`text-xs mt-1 text-right ${msg.isMe ? 'text-blue-200' : 'text-gray-400'}`}>{msg.time}</div>
                 </div>
               </div>
             ))}
          </div>

          <div className="p-4 bg-white border-t">
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-grow bg-gray-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-600 transition"
                placeholder="Напишите сообщение..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
              <button 
                onClick={handleSend}
                className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition flex items-center justify-center"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const OrdersPage = ({ orders, onViewDetails }: { orders: any[], onViewDetails: (order: any) => void }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Мои заказы</h2>
      {orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
           <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
             <FileText className="h-10 w-10 text-gray-400" />
           </div>
           <h3 className="text-xl font-bold text-gray-900 mb-2">У вас пока нет заказов</h3>
           <p className="text-gray-500">Найдите подходящую технику в поиске и оформите заявку</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-gray-600 text-sm">Техника</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-600 text-sm">Даты</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-600 text-sm">Кол-во</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-600 text-sm">Статус</th>
                  <th className="text-right py-4 px-6 font-semibold text-gray-600 text-sm">Сумма</th>
                  <th className="py-4 px-6"></th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id} className="border-b last:border-0 hover:bg-gray-50 transition cursor-pointer" onClick={() => onViewDetails(order)}>
                    <td className="py-4 px-6 font-medium text-gray-900">{order.machineryName}</td>
                    <td className="py-4 px-6 text-gray-600">{order.dates}</td>
                    <td className="py-4 px-6 text-gray-600">{order.quantity ? order.quantity : 1}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${order.status === OrderStatus.ACTIVE ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                        {order.status === OrderStatus.ACTIVE ? 'Активен' : 'Ожидает'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right font-medium text-gray-900">{order.amount.toLocaleString()} ₽</td>
                    <td className="py-4 px-6 text-right">
                      <button 
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewDetails(order);
                        }}
                      >
                        Подробнее
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Main App ---

export default function App() {
  const [currentView, setCurrentView] = useState('home');
  const [user, setUser] = useState<User | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [selectedMachinery, setSelectedMachinery] = useState<Machinery | null>(null);

  // Load user and orders from storage on mount
  useEffect(() => {
    const currentUser = getStoredCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    const storedOrders = getStoredOrders();
    setOrders(storedOrders);
  }, []);

  const handleStartSearch = () => {
    setSelectedCategory('');
    setCurrentView('search');
  };

  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat);
    setCurrentView('search');
  };

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
    setUser(null);
    setCurrentView('home');
  };

  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    setCurrentView('home');
  };

  const handleViewMachineryDetails = (machinery: Machinery) => {
    setSelectedMachinery(machinery);
    setCurrentView('machinery-details');
  };

  const handleCreateOrder = (orderData: { startDate: string, endDate: string, quantity: number }) => {
    if (!user || !selectedMachinery) {
      setCurrentView('auth');
      return;
    }

    const { startDate, endDate, quantity } = orderData;
    
    // Calculate total amount
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    const totalAmount = diffDays * selectedMachinery.pricePerShift * quantity;
    
    // Format dates for display
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('ru-RU');
    };
    
    const dateRangeString = `${formatDate(startDate)} - ${formatDate(endDate)}`;

    // Create new order
    const newOrder = {
      id: Date.now().toString(),
      machineryId: selectedMachinery.id,
      machineryName: selectedMachinery.name,
      machineryImage: selectedMachinery.imageUrl,
      price: selectedMachinery.pricePerShift,
      dates: dateRangeString,
      startDate: startDate,
      endDate: endDate,
      quantity: quantity,
      status: OrderStatus.WAITING,
      amount: totalAmount,
      messages: []
    };

    const updatedOrders = [...orders, newOrder];
    setOrders(updatedOrders);
    localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(updatedOrders));
    
    alert(`Заявка на ${selectedMachinery.name} успешно создана!`);
    setCurrentView('orders');
    setSelectedMachinery(null);
  };

  const handleViewOrderDetails = (order: any) => {
    setSelectedOrder(order);
    setCurrentView('order-details');
  };

  const handleCancelOrder = (orderId: string) => {
    const updatedOrders = orders.filter(o => o.id !== orderId);
    setOrders(updatedOrders);
    localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(updatedOrders));
    
    // Navigate back to orders list
    setCurrentView('orders');
    setSelectedOrder(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans text-gray-900">
      <Header 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        user={user}
        onLogout={handleLogout}
        onLoginClick={() => setCurrentView('auth')}
      />

      <main className="flex-grow">
        {currentView === 'home' && (
          <LandingPage 
            onStartSearch={handleStartSearch} 
            onCategorySelect={handleCategorySelect}
          />
        )}
        {currentView === 'search' && (
          <SearchPage 
            initialCategory={selectedCategory} 
            onViewDetails={handleViewMachineryDetails}
            user={user}
          />
        )}
        {currentView === 'machinery-details' && selectedMachinery && (
           <MachineryDetailsPage 
             machinery={selectedMachinery}
             onBack={() => setCurrentView('search')}
             onCreateOrder={handleCreateOrder}
             user={user}
             onLogin={() => setCurrentView('auth')}
           />
        )}
        {currentView === 'orders' && user && (
          <OrdersPage 
            orders={orders} 
            onViewDetails={handleViewOrderDetails}
          />
        )}
        {currentView === 'order-details' && selectedOrder && (
          <OrderDetailsPage 
            order={selectedOrder} 
            onBack={() => setCurrentView('orders')}
            onCancelOrder={handleCancelOrder}
          />
        )}
        {currentView === 'auth' && (
          <AuthPage onLoginSuccess={handleLoginSuccess} />
        )}
      </main>

      <footer className="bg-white border-t py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center">
            <Logo className="h-6 w-6" textSize="text-sm" />
            <span className="ml-2 text-lg font-bold text-gray-900">SpecToRent</span>
          </div>
          <div className="text-gray-500 text-sm text-center md:text-right max-w-md">
            © 2025 SpecToRent. Все права защищены. <br/>
            Сайт носит информационный характер. Размещенные на сайте материалы и цены не являются публичной офертой.
          </div>
        </div>
      </footer>
    </div>
  );
}
