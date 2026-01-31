import React, { useState, useEffect } from 'react';
import { MapPin, Filter, ArrowRight } from 'lucide-react';
import { Machinery, User } from '../types';
import { REGIONS, CATEGORIES } from '../constants';
import { getItems } from '../api/items';

interface SearchPageProps {
  initialCategory: string;
  onViewDetails: (m: Machinery) => void;
  user: User | null;
}

export const SearchPage: React.FC<SearchPageProps> = ({ initialCategory, onViewDetails, user }) => {
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [machinery, setMachinery] = useState<Machinery[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMachinery();
  }, []);

  useEffect(() => {
    setSelectedCategory(initialCategory);
  }, [initialCategory]);

  const loadMachinery = async () => {
    try {
      setLoading(true);
      const data = await getItems();
      setMachinery(data);
    } catch (e) {
      console.error('Failed to load machinery:', e);
    } finally {
      setLoading(false);
    }
  };

  const filteredMachinery = machinery.filter(m => {
    const regionSource = m.region || m.location || '';
    const matchRegion = selectedRegion ? regionSource.includes(selectedRegion) : true;
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

      {loading ? (
        <div className="text-center py-12 text-gray-500">Загрузка...</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
         {filteredMachinery.map(m => (
           <div 
             key={m.id} 
             onClick={() => onViewDetails(m)}
             className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition cursor-pointer group"
           >
             <div className="h-48 overflow-hidden relative bg-gray-200">
               {m.imageUrl ? (
                 <img src={m.imageUrl} alt={m.name || m.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
               ) : (
                 <div className="w-full h-full flex items-center justify-center text-gray-400">
                   Нет изображения
                 </div>
               )}
               {m.category && (
                 <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-sm font-semibold text-gray-700">
                   {m.category}
                 </div>
               )}
             </div>
             <div className="p-5">
               <div className="flex justify-between items-start mb-2">
                 <div>
                   <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
                     {m.name || m.title}
                   </h3>
                   <div className="flex items-center text-sm text-gray-500 mt-1">
                      <MapPin className="h-3 w-3 mr-1" />
                      {m.region || m.location || 'Регион не указан'}
                   </div>
                 </div>
                 <div className="text-right">
                   <div className="font-bold text-blue-600 text-lg">
                     {(m.pricePerShift || m.dailyPrice || 0).toLocaleString()} ₽
                   </div>
                   <div className="text-xs text-gray-400">за смену</div>
                 </div>
               </div>
               <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                 {m.description || 'Описание не задано'}
               </p>
               <div className="flex justify-between items-center border-t pt-4 mt-2">
                 <div className="text-xs text-gray-500">
                    {m.availableCount ? `Доступно: ${m.availableCount} ед.` : 'Владелец не указан'}
                 </div>
                 <div className="flex items-center text-blue-600 text-sm font-medium">
                   Подробнее <ArrowRight className="h-4 w-4 ml-1" />
                 </div>
               </div>
             </div>
           </div>
         ))}
         {filteredMachinery.length === 0 && !loading && (
           <div className="col-span-full text-center py-12 text-gray-500">
             Ничего не найдено по вашим параметрам
           </div>
         )}
      </div>
      )}
    </div>
  );
};
