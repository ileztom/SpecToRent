import React, { useRef, useState } from 'react';
import { Search, Calendar, FileText, CheckCircle, Zap, ArrowRight, Plus } from 'lucide-react';
import { REGIONS, CATEGORIES } from '../constants';

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
    { name: 'Автокраны', img: 'https://feniks-avto.ru/wp-content/uploads/2025/01/KS-55729-5K-3.jpg' },
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

interface LandingPageProps {
  onStartSearch: () => void;
  onCategorySelect: (cat: string) => void;
  onBecomePartner: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStartSearch, onCategorySelect, onBecomePartner }) => {
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

      <AdvantagesSection onStartSearch={onStartSearch} onBecomePartner={onBecomePartner} />
    </div>
  );
};
