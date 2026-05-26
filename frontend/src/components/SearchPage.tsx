import React, { useState, useEffect } from 'react';
import { MapPin, Filter, ArrowRight, Search, SlidersHorizontal, X, Star, Calendar } from 'lucide-react';
import { Machinery, User } from '../types';
import { REGIONS, CATEGORIES } from '../constants';
import { getItems } from '../api/items';

interface SearchPageProps {
  initialCategory: string;
  onViewDetails: (m: Machinery) => void;
  user: User | null;
}

type SortOption = 'default' | 'price_asc' | 'price_desc' | 'name_asc';

export const SearchPage: React.FC<SearchPageProps> = ({ initialCategory, onViewDetails, user }) => {
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [machinery, setMachinery] = useState<Machinery[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [showFilters, setShowFilters] = useState(false);

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

  const clearFilters = () => {
    setSelectedRegion('');
    setSelectedCategory('');
    setSearchQuery('');
    setPriceMin('');
    setPriceMax('');
    setSortBy('default');
  };

  const hasActiveFilters = selectedRegion || selectedCategory || searchQuery || priceMin || priceMax;

  const filteredMachinery = machinery
    .filter(m => {
      const regionSource = m.region || m.location || '';
      const matchRegion = selectedRegion ? regionSource.includes(selectedRegion) : true;
      const matchCategory = selectedCategory ? m.category === selectedCategory : true;
      const matchSearch = searchQuery 
        ? (m.name || m.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (m.description || '').toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      const price = m.pricePerShift || m.dailyPrice || 0;
      const matchPriceMin = priceMin ? price >= parseInt(priceMin) : true;
      const matchPriceMax = priceMax ? price <= parseInt(priceMax) : true;
      return matchRegion && matchCategory && matchSearch && matchPriceMin && matchPriceMax;
    })
    .sort((a, b) => {
      const priceA = a.pricePerShift || a.dailyPrice || 0;
      const priceB = b.pricePerShift || b.dailyPrice || 0;
      switch (sortBy) {
        case 'price_asc': return priceA - priceB;
        case 'price_desc': return priceB - priceA;
        case 'name_asc': return (a.name || a.title || '').localeCompare(b.name || b.title || '');
        default: return 0;
      }
    });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-3xl font-bold text-gray-900">Каталог спецтехники</h2>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Найдено: <strong className="text-gray-900">{filteredMachinery.length}</strong> единиц</span>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Поиск по названию или описанию..."
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition md:hidden"
            >
              <SlidersHorizontal className="h-4 w-4" />
              {showFilters ? 'Скрыть фильтры' : 'Показать фильтры'}
            </button>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-sm text-red-500 hover:text-red-600 transition"
              >
                <X className="h-4 w-4" />
                Сбросить фильтры
              </button>
            )}
          </div>

          <div className={`grid md:grid-cols-5 gap-4 ${showFilters ? 'block' : 'hidden md:grid'}`}>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <select 
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white text-sm"
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
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white text-sm"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">Все категории</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Цена от"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
              />
              <input
                type="number"
                placeholder="до"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
              />
            </div>

            <div className="relative md:col-span-2">
              <select 
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white text-sm"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
              >
                <option value="default">Сортировка: по умолчанию</option>
                <option value="price_asc">Сначала дешевле</option>
                <option value="price_desc">Сначала дороже</option>
                <option value="name_asc">По названию (А-Я)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
              <div className="h-48 bg-gray-200" />
              <div className="p-5 space-y-3">
                <div className="h-6 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="h-4 bg-gray-200 rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMachinery.map(m => (
            <div 
              key={m.id} 
              onClick={() => onViewDetails(m)}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:border-blue-200 transition-all duration-300 cursor-pointer group"
            >
              <div className="h-48 overflow-hidden relative bg-gray-100">
                {m.imageUrl ? (
                  <img src={m.imageUrl} alt={m.name || m.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gradient-to-br from-gray-100 to-gray-200">
                    <div className="text-center">
                      <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <span className="text-sm">Нет фото</span>
                    </div>
                  </div>
                )}
                {m.category && (
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-gray-700 shadow-sm">
                    {m.category}
                  </div>
                )}
                {m.status === 'AVAILABLE' && (
                  <div className="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                    Доступна
                  </div>
                )}
              </div>
              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                      {m.name || m.title}
                    </h3>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                      <span className="truncate">{m.region || m.location || 'Регион не указан'}</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2 min-h-[2.5rem]">
                  {m.description || 'Описание не задано'}
                </p>
                <div className="flex justify-between items-center border-t border-gray-100 pt-4">
                  <div>
                    <div className="font-bold text-xl text-blue-600">
                      {(m.pricePerShift || m.dailyPrice || 0).toLocaleString()} ₽
                    </div>
                    <div className="text-xs text-gray-400">за смену</div>
                  </div>
                  <button className="flex items-center gap-1 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg text-sm font-medium group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    Подробнее <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filteredMachinery.length === 0 && !loading && (
            <div className="col-span-full text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Ничего не найдено</h3>
              <p className="text-gray-500 mb-4">Попробуйте изменить параметры поиска или сбросить фильтры</p>
              <button
                onClick={clearFilters}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Сбросить все фильтры
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
