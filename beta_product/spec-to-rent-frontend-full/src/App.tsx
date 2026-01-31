import React, { useEffect, useState } from 'react';
import { Calendar, MessageSquare, Send, ArrowLeft, FileText } from 'lucide-react';
import { User, Machinery, Order, OrderStatus } from './types';
import { createOrder, getOrders } from './api/orders';
import { ChatSocket, ChatMessage } from './ws/chat';
import { Header } from './components/Header';
import { LandingPage } from './components/LandingPage';
import { SearchPage } from './components/SearchPage';
import { MachineryDetailsPage } from './components/MachineryDetailsPage';
import { AuthPage } from './components/AuthPage';
import { UserProfile } from './components/UserProfile';

const STORAGE_KEY_CURRENT_USER = 'spectorrent_current_user';

function getStoredCurrentUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CURRENT_USER);
    if (!raw) return null;
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

type View = 'home' | 'search' | 'machinery-details' | 'orders' | 'order-details' | 'chat' | 'profile' | 'auth';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(getStoredCurrentUser);
  const [currentView, setCurrentView] = useState<View>(user ? 'home' : 'home');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedMachinery, setSelectedMachinery] = useState<Machinery | null>(null);

  // chat
  const [chatSocket, setChatSocket] = useState<ChatSocket | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatText, setChatText] = useState('');

  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user]);

  const loadOrders = async () => {
    if (!user) return;
    try {
      const data = await getOrders();
      // Фильтруем заказы текущего пользователя
      const userOrders = data.filter(o => 
        o.renterId === Number(user.id) || 
        (selectedMachinery && o.itemId === selectedMachinery.id)
      );
      setOrders(userOrders);
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
    setUser(null);
    setCurrentView('home');
    if (chatSocket) {
      chatSocket.disconnect();
      setChatSocket(null);
    }
  };

  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(loggedInUser));
    setCurrentView('home');
  };

  const handleStartSearch = () => {
    setSelectedCategory('');
    setCurrentView('search');
  };

  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat);
    setCurrentView('search');
  };

  const handleViewMachineryDetails = (machinery: Machinery) => {
    setSelectedMachinery(machinery);
    setCurrentView('machinery-details');
  };

  const handleCreateOrder = async (orderData: { startDate: string, endDate: string, quantity: number }) => {
    if (!user || !selectedMachinery) {
      setCurrentView('auth');
      return;
    }

    try {
      const order = await createOrder({
        renterId: Number(user.id),
        itemId: selectedMachinery.id,
        startDate: orderData.startDate,
        endDate: orderData.endDate,
      });
      setOrders((prev) => [...prev, order]);
      alert(`Заявка на ${selectedMachinery.name || selectedMachinery.title} успешно создана!`);
      setCurrentView('orders');
      setSelectedMachinery(null);
    } catch (e: any) {
      console.error(e);
      alert(e.message || 'Не удалось создать заявку');
    }
  };

  const handleViewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setCurrentView('order-details');
  };

  const handleCancelOrder = async (orderId: number) => {
    if (window.confirm('Вы действительно хотите отозвать заказ? Это действие нельзя отменить.')) {
      // TODO: Добавить API для отмены заказа
      const updatedOrders = orders.filter(o => o.id !== orderId);
      setOrders(updatedOrders);
      setCurrentView('orders');
      setSelectedOrder(null);
    }
  };

  const openChatForOrder = (order: Order) => {
    if (!user) return;
    if (chatSocket) {
      chatSocket.disconnect();
    }
    const roomId = String(order.id);
    const socket = new ChatSocket(roomId);
    socket.connect((msg) => {
      setChatMessages((prev) => [...prev, msg]);
    });
    setChatSocket(socket);
    setChatMessages([]);
    setSelectedOrder(order);
    setCurrentView('chat');
  };

  const handleSendChat = () => {
    if (!chatSocket || !user || !chatText.trim()) return;
    chatSocket.sendMessage(Number(user.id), chatText.trim());
    setChatText('');
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
                        <th className="text-left py-4 px-6 font-semibold text-gray-600 text-sm">Статус</th>
                        <th className="text-right py-4 px-6 font-semibold text-gray-600 text-sm">Действия</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(order => (
                        <tr key={order.id} className="border-b last:border-0 hover:bg-gray-50 transition cursor-pointer" onClick={() => openChatForOrder(order)}>
                          <td className="py-4 px-6 font-medium text-gray-900">Заявка #{order.id}</td>
                          <td className="py-4 px-6 text-gray-600">{order.startDate} — {order.endDate}</td>
                          <td className="py-4 px-6">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              order.status === OrderStatus.APPROVED ? 'bg-green-100 text-green-700' : 
                              order.status === OrderStatus.REJECTED ? 'bg-red-100 text-red-700' :
                              'bg-orange-100 text-orange-700'
                            }`}>
                              {order.status === OrderStatus.NEW ? 'Новая' :
                               order.status === OrderStatus.APPROVED ? 'Одобрена' :
                               order.status === OrderStatus.REJECTED ? 'Отклонена' :
                               order.status === OrderStatus.CANCELED ? 'Отменена' : order.status}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <button 
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                              onClick={(e) => {
                                e.stopPropagation();
                                openChatForOrder(order);
                              }}
                            >
                              Чат
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
        )}
        {currentView === 'order-details' && selectedOrder && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <button onClick={() => setCurrentView('orders')} className="flex items-center text-gray-500 hover:text-gray-900 mb-6 w-fit">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Назад к заказам
            </button>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Заявка #{selectedOrder.id}</h2>
              <div className="space-y-2">
                <div><span className="font-medium">Даты:</span> {selectedOrder.startDate} — {selectedOrder.endDate}</div>
                <div><span className="font-medium">Статус:</span> {selectedOrder.status}</div>
              </div>
            </div>
          </div>
        )}
        {currentView === 'chat' && selectedOrder && (
          <div className="flex-1 max-w-7xl mx-auto px-4 py-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold">Чат по заявке #{selectedOrder.id}</h2>
                <div className="text-xs text-gray-500">
                  {selectedOrder.startDate} — {selectedOrder.endDate}
                </div>
              </div>
              <button
                onClick={() => setCurrentView('orders')}
                className="text-sm text-gray-500 hover:text-gray-800"
              >
                ← Назад к заявкам
              </button>
            </div>
            <div className="flex-1 bg-white rounded-2xl shadow-sm border p-4 flex flex-col">
              <div className="flex-1 overflow-y-auto space-y-2 mb-4">
                {chatMessages.length === 0 && (
                  <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                    История сообщений пуста
                  </div>
                )}
                {chatMessages.map((m, idx) => (
                  <div key={idx} className="flex justify-start">
                    <div className="bg-gray-100 rounded-xl px-3 py-2 text-sm">
                      <div className="text-xs text-gray-400 mb-1">
                        Пользователь {m.sender?.id}
                      </div>
                      <div>{m.content}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  className="flex-1 border rounded-lg px-3 py-2 text-sm"
                  placeholder="Сообщение..."
                  value={chatText}
                  onChange={(e) => setChatText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                />
                <button
                  onClick={handleSendChat}
                  className="bg-blue-600 text-white rounded-lg px-4 flex items-center justify-center"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
        {currentView === 'profile' && user && (
          <main className="flex-1 max-w-6xl mx-auto px-4 py-6 flex flex-col gap-6">
            <UserProfile
              user={user}
              onUserUpdated={(updated) => {
                setUser(updated);
                localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(updated));
              }}
            />
          </main>
        )}
        {currentView === 'auth' && (
          <AuthPage onLoginSuccess={handleLoginSuccess} />
        )}
      </main>

      <footer className="bg-white border-t py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center">
            <div className="h-6 w-6 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              S
            </div>
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
};

export default App;
