import React, { useState } from 'react';
import { ArrowLeft, MapPin, CheckCircle, X } from 'lucide-react';
import { Machinery, User } from '../types';

interface MachineryDetailsPageProps {
  machinery: Machinery;
  onBack: () => void;
  onCreateOrder: (data: { startDate: string, endDate: string, quantity: number }) => void;
  user: User | null;
  onLogin: () => void;
}

export const MachineryDetailsPage: React.FC<MachineryDetailsPageProps> = ({
  machinery,
  onBack,
  onCreateOrder,
  user,
  onLogin
}) => {
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [quantity, setQuantity] = useState(1);

  const pricePerShift = machinery.pricePerShift || machinery.dailyPrice || 0;
  const availableCount = machinery.availableCount || 1;

  const calculateTotal = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    if (diffDays <= 0) return 0;
    return diffDays * pricePerShift * quantity;
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
    if (quantity > availableCount) {
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
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 aspect-video relative bg-gray-200">
            {machinery.imageUrl ? (
              <img src={machinery.imageUrl} alt={machinery.name || machinery.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                Нет изображения
              </div>
            )}
            {machinery.category && (
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg text-sm font-semibold text-gray-800 shadow-sm">
                {machinery.category}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                 <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{machinery.name || machinery.title}</h1>
                    <div className="flex items-center text-gray-500">
                        <MapPin className="h-4 w-4 mr-1" />
                        {machinery.region || machinery.location || 'Регион не указан'}
                    </div>
                 </div>
                 <div className="text-left md:text-right">
                    <div className="text-3xl font-bold text-blue-600">{pricePerShift.toLocaleString()} ₽</div>
                    <div className="text-sm text-gray-400">стоимость смены</div>
                 </div>
             </div>

             <div className="prose prose-blue max-w-none text-gray-600 mb-8">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Описание</h3>
                <p>{machinery.description || 'Описание не задано'}</p>
             </div>

             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t">
                <div>
                   <div className="text-xs text-gray-400 mb-1">Тип техники</div>
                   <div className="font-medium">{machinery.type || 'Не указан'}</div>
                </div>
                <div>
                   <div className="text-xs text-gray-400 mb-1">Доступно</div>
                   <div className="font-medium text-green-600">{availableCount} ед.</div>
                </div>
                <div>
                   <div className="text-xs text-gray-400 mb-1">Категория</div>
                   <div className="font-medium">{machinery.category || 'Не указана'}</div>
                </div>
                <div>
                   <div className="text-xs text-gray-400 mb-1">Мин. срок</div>
                   <div className="font-medium">1 смена</div>
                </div>
             </div>
          </div>
        </div>

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
                        Количество техники <span className="text-gray-400 ml-1">(макс: {availableCount})</span>
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
                          max={availableCount}
                          className="w-full text-center outline-none py-2 text-sm bg-white text-gray-900"
                          value={quantity}
                          onChange={(e) => {
                             const val = parseInt(e.target.value);
                             if (!isNaN(val)) setQuantity(Math.min(availableCount, Math.max(1, val)));
                          }}
                        />
                        <button 
                          type="button"
                          className="px-3 py-2 bg-gray-50 hover:bg-gray-100 border-l"
                          onClick={() => setQuantity(Math.min(availableCount, quantity + 1))}
                        >
                          +
                        </button>
                      </div>
                   </div>

                   <div className="bg-gray-50 rounded-lg p-4 space-y-2 mt-4">
                      <div className="flex justify-between text-sm">
                         <span className="text-gray-500">Цена за смену</span>
                         <span>{pricePerShift.toLocaleString()} ₽</span>
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
