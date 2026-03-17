import React, { useEffect, useState } from 'react';
import { Calendar, MessageSquare, Send, ArrowLeft, FileText, Check, X as XIcon, ExternalLink, User as UserIcon, MapPin, Building, Download } from 'lucide-react';
import { User, Machinery, Order, OrderStatus, UserRole } from './types';
import { createOrder, getOrders, updateOrderStatus } from './api/orders';
import { getItemById } from './api/items';
import { ChatSocket, ChatMessage, getChatHistory } from './ws/chat';
import { Header } from './components/Header';
import { LandingPage } from './components/LandingPage';
import { SearchPage } from './components/SearchPage';
import { MachineryDetailsPage } from './components/MachineryDetailsPage';
import { AuthPage } from './components/AuthPage';
import { UserProfile } from './components/UserProfile';
import { OwnerDashboard } from './components/OwnerDashboard';

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

type View = 'home' | 'search' | 'machinery-details' | 'orders' | 'order-details' | 'chat' | 'profile' | 'auth' | 'my-machinery';

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
  
  // profile modal
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileData, setProfileData] = useState<{
    name: string;
    avatar?: string;
    region?: string;
    companyName?: string;
    description?: string;
    role: string;
  } | null>(null);

  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user]);

  const loadOrders = async () => {
    if (!user) return;
    try {
      const data = await getOrders();
      // Фильтруем заказы: для арендатора - его заявки, для владельца - заявки на его технику
      const userOrders = data.filter(o => 
        o.renterId === Number(user.id) || 
        o.ownerId === Number(user.id)
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

  const handleCreateOrder = async (orderData: { startDate: string, endDate: string, quantity: number, address: string }) => {
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
        quantity: orderData.quantity,
        address: orderData.address,
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

  const handleUpdateOrderStatus = async (orderId: number, newStatus: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
    } catch (e: any) {
      console.error(e);
    }
    // Always reload orders to get fresh state from the server
    await loadOrders();
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
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

  const openChatForOrder = async (order: Order) => {
    if (!user) return;
    if (chatSocket) {
      chatSocket.disconnect();
    }
    const roomId = String(order.id);
    
    // Load chat history first
    const history = await getChatHistory(roomId);
    setChatMessages(history);
    
    const socket = new ChatSocket(roomId);
    socket.connect((msg) => {
      setChatMessages((prev) => [...prev, msg]);
    });
    setChatSocket(socket);
    setSelectedOrder(order);
    setCurrentView('chat');
  };

  const handleSendChat = () => {
    if (!chatSocket || !user || !chatText.trim()) return;
    chatSocket.sendMessage(Number(user.id), chatText.trim());
    setChatText('');
    // Message will appear via WebSocket subscription when server broadcasts it back
  };

  const showPartnerProfile = (order: Order) => {
    if (!user) return;
    const isOwner = order.ownerId === Number(user.id);
    if (isOwner) {
      setProfileData({
        name: order.renterName || 'Арендатор',
        avatar: order.renterAvatar,
        region: order.renterRegion,
        companyName: order.renterCompanyName,
        description: order.renterDescription,
        role: 'Арендатор',
      });
    } else {
      setProfileData({
        name: order.ownerName || 'Владелец',
        avatar: order.ownerAvatar,
        region: order.ownerRegion,
        companyName: order.ownerCompanyName,
        description: order.ownerDescription,
        role: 'Владелец',
      });
    }
    setShowProfileModal(true);
  };

  const handleViewItem = async (order: Order) => {
    try {
      const machinery = await getItemById(order.itemId);
      setSelectedMachinery(machinery);
      setCurrentView('machinery-details');
    } catch (e) {
      console.error('Failed to load item', e);
      alert('Не удалось загрузить объявление');
    }
  };

  const handleDownloadContract = async (orderId: number) => {
    const confirmed = window.confirm(
      'Данный договор является примером и не носит юридический характер. Советуется проконсультироваться с юристом.\n\nПродолжить скачивание?'
    );
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/contracts/${orderId}/download`);
      if (!response.ok) {
        throw new Error('Failed to download');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `contract_${orderId}.docx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (e) {
      console.error('Failed to download contract', e);
      alert('Не удалось скачать договор');
    }
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
            onBecomePartner={() => {
              if (user && user.role === 'OWNER') {
                setCurrentView('my-machinery');
              } else {
                setCurrentView('auth');
              }
            }}
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
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              {user.role === UserRole.OWNER ? 'Заявки на мою технику' : 'Мои заказы'}
            </h2>
            {orders.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
                 <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                   <FileText className="h-10 w-10 text-gray-400" />
                 </div>
                 <h3 className="text-xl font-bold text-gray-900 mb-2">
                   {user.role === UserRole.OWNER ? 'Пока нет заявок' : 'У вас пока нет заказов'}
                 </h3>
                 <p className="text-gray-500">
                   {user.role === UserRole.OWNER ? 'Заявки на аренду вашей техники появятся здесь' : 'Найдите подходящую технику в поиске и оформите заявку'}
                 </p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left py-4 px-6 font-semibold text-gray-600 text-sm">Техника</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-600 text-sm">Кол-во</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-600 text-sm">Даты</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-600 text-sm">Статус</th>
                        <th className="text-right py-4 px-6 font-semibold text-gray-600 text-sm">Действия</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(order => {
                        const isOwner = order.ownerId === Number(user.id);
                        return (
                          <tr key={order.id} className="border-b last:border-0 hover:bg-gray-50 transition cursor-pointer" onClick={() => openChatForOrder(order)}>
                            <td className="py-4 px-6">
                              <div className="font-medium text-gray-900">{order.itemTitle || `Заявка #${order.id}`}</div>
                              <div className="text-xs text-gray-400">#{order.id}</div>
                            </td>
                            <td className="py-4 px-6 text-gray-600">{order.quantity || 1} ед.</td>
                            <td className="py-4 px-6 text-gray-600">{order.startDate} — {order.endDate}</td>
                            <td className="py-4 px-6">
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                order.status === OrderStatus.APPROVED ? 'bg-green-100 text-green-700' : 
                                order.status === OrderStatus.REJECTED ? 'bg-red-100 text-red-700' :
                                order.status === OrderStatus.COMPLETED ? 'bg-blue-100 text-blue-700' :
                                order.status === OrderStatus.EARLY_COMPLETED ? 'bg-purple-100 text-purple-700' :
                                'bg-orange-100 text-orange-700'
                              }`}>
                                {order.status === OrderStatus.NEW ? 'Новая' :
                                 order.status === OrderStatus.APPROVED ? 'Одобрена' :
                                 order.status === OrderStatus.REJECTED ? 'Отклонена' :
                                 order.status === OrderStatus.CANCELED ? 'Отменена' :
                                 order.status === OrderStatus.COMPLETED ? 'Завершена' :
                                 order.status === OrderStatus.EARLY_COMPLETED ? 'Досрочно завершена' : order.status}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-right flex justify-end gap-2">
                              {isOwner && order.status === OrderStatus.NEW && (
                                <>
                                  <button 
                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                                    onClick={(e) => { e.stopPropagation(); handleUpdateOrderStatus(order.id, OrderStatus.APPROVED); }}
                                    title="Одобрить"
                                  >
                                    <Check className="w-4 h-4" />
                                  </button>
                                  <button 
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                    onClick={(e) => { e.stopPropagation(); handleUpdateOrderStatus(order.id, OrderStatus.REJECTED); }}
                                    title="Отклонить"
                                  >
                                    <XIcon className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                              {isOwner && order.status === OrderStatus.APPROVED && (
                                <button 
                                  className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg"
                                  onClick={(e) => { e.stopPropagation(); handleUpdateOrderStatus(order.id, OrderStatus.EARLY_COMPLETED); }}
                                  title="Досрочно завершить"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                              )}
                              <button 
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium px-2"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openChatForOrder(order);
                                }}
                              >
                                Чат
                              </button>
                            </td>
                          </tr>
                        );
                      })}
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
                <h2 className="text-lg font-semibold">
                  {selectedOrder.itemTitle || `Заявка #${selectedOrder.id}`}
                </h2>
                <div className="text-xs text-gray-500">
                  Количество: {selectedOrder.quantity || 1} ед. | {selectedOrder.startDate} — {selectedOrder.endDate}
                </div>
                <div className="mt-1 flex items-center gap-2 flex-wrap">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    selectedOrder.status === OrderStatus.APPROVED ? 'bg-green-100 text-green-700' : 
                    selectedOrder.status === OrderStatus.REJECTED ? 'bg-red-100 text-red-700' :
                    selectedOrder.status === OrderStatus.COMPLETED ? 'bg-blue-100 text-blue-700' :
                    selectedOrder.status === OrderStatus.EARLY_COMPLETED ? 'bg-purple-100 text-purple-700' :
                    'bg-orange-100 text-orange-700'
                  }`}>
                    {selectedOrder.status === OrderStatus.NEW ? 'Новая' :
                     selectedOrder.status === OrderStatus.APPROVED ? 'Одобрена' :
                     selectedOrder.status === OrderStatus.REJECTED ? 'Отклонена' :
                     selectedOrder.status === OrderStatus.CANCELED ? 'Отменена' :
                     selectedOrder.status === OrderStatus.COMPLETED ? 'Завершена' :
                     selectedOrder.status === OrderStatus.EARLY_COMPLETED ? 'Досрочно завершена' : selectedOrder.status}
                  </span>
                  <button
                    onClick={() => handleViewItem(selectedOrder)}
                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Объявление
                  </button>
                  <button
                    onClick={() => showPartnerProfile(selectedOrder)}
                    className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800"
                  >
                    <UserIcon className="w-3 h-3" />
                    {user && selectedOrder.ownerId === Number(user.id) ? 'Профиль арендатора' : 'Профиль владельца'}
                  </button>
                  <button
                    onClick={() => handleDownloadContract(selectedOrder.id)}
                    className="flex items-center gap-1 text-xs text-orange-600 hover:text-orange-800 bg-orange-50 px-2 py-1 rounded"
                  >
                    <Download className="w-3 h-3" />
                    Скачать договор
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {user && selectedOrder.ownerId === Number(user.id) && selectedOrder.status === OrderStatus.NEW && (
                  <>
                    <button
                      onClick={() => handleUpdateOrderStatus(selectedOrder.id, OrderStatus.APPROVED)}
                      className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
                    >
                      <Check className="w-4 h-4" />
                      Одобрить
                    </button>
                    <button
                      onClick={() => handleUpdateOrderStatus(selectedOrder.id, OrderStatus.REJECTED)}
                      className="flex items-center gap-1 px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
                    >
                      <XIcon className="w-4 h-4" />
                      Отклонить
                    </button>
                  </>
                )}
                {user && selectedOrder.ownerId === Number(user.id) && selectedOrder.status === OrderStatus.APPROVED && (
                  <button
                    onClick={() => handleUpdateOrderStatus(selectedOrder.id, OrderStatus.EARLY_COMPLETED)}
                    className="flex items-center gap-1 px-3 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700"
                  >
                    <Check className="w-4 h-4" />
                    Досрочно завершить
                  </button>
                )}
                <button
                  onClick={() => setCurrentView('orders')}
                  className="text-sm text-gray-500 hover:text-gray-800"
                >
                  ← Назад к заявкам
                </button>
              </div>
            </div>
            <div className="flex-1 bg-white rounded-2xl shadow-sm border p-4 flex flex-col">
              <div className="flex-1 overflow-y-auto space-y-2 mb-4">
                {chatMessages.length === 0 && (
                  <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                    История сообщений пуста
                  </div>
                )}
                {chatMessages.map((m, idx) => {
                  const isCurrentUser = m.sender?.id === Number(user?.id);
                  const isSystem = !m.sender;
                  const senderName = m.sender?.fullName || 'Система';
                  const senderRole = m.sender?.role === 'OWNER' ? 'Владелец' : m.sender ? 'Арендатор' : '';
                  return (
                    <div key={idx} className={`flex ${isSystem ? 'justify-center' : isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                      <div className={`rounded-xl px-3 py-2 text-sm max-w-[70%] ${
                        isSystem ? 'bg-yellow-50 text-yellow-800 border border-yellow-200' :
                        isCurrentUser ? 'bg-blue-600 text-white' : 'bg-gray-100'
                      }`}>
                        {!isSystem && (
                          <div className={`text-xs mb-1 ${isCurrentUser ? 'text-blue-200' : 'text-gray-400'}`}>
                            {senderName} {senderRole && `(${senderRole})`}
                          </div>
                        )}
                        <div>{m.content}</div>
                      </div>
                    </div>
                  );
                })}
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
        {currentView === 'my-machinery' && user && (
          <OwnerDashboard user={user} />
        )}
        {currentView === 'auth' && (
          <AuthPage onLoginSuccess={handleLoginSuccess} />
        )}
      </main>

      {showProfileModal && profileData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-xl">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
                  {profileData.avatar ? (
                    <img src={profileData.avatar} alt={profileData.name} className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="w-10 h-10 text-white" />
                  )}
                </div>
                <div className="text-white">
                  <h2 className="text-2xl font-bold">{profileData.name}</h2>
                  <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-semibold ${
                    profileData.role === 'Владелец' 
                      ? 'bg-purple-500/30 text-purple-100' 
                      : 'bg-green-500/30 text-green-100'
                  }`}>
                    {profileData.role}
                  </span>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {profileData.region && (
                <div className="flex items-center gap-3 text-gray-600">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <span>{profileData.region}</span>
                </div>
              )}
              {profileData.companyName && (
                <div className="flex items-center gap-3 text-gray-600">
                  <Building className="w-5 h-5 text-gray-400" />
                  <span>{profileData.companyName}</span>
                </div>
              )}
              {profileData.description && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">О себе</h4>
                  <p className="text-gray-700">{profileData.description}</p>
                </div>
              )}
              {!profileData.region && !profileData.companyName && !profileData.description && (
                <p className="text-gray-400 text-center py-4">Информация о профиле не заполнена</p>
              )}
            </div>
            <div className="px-6 pb-6">
              <button
                onClick={() => setShowProfileModal(false)}
                className="w-full bg-gray-100 text-gray-700 rounded-xl px-4 py-3 font-medium hover:bg-gray-200 transition"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="bg-white border-t py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center">
            <div className="h-6 w-6 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              S
            </div>
            <span className="ml-2 text-lg font-bold text-gray-900">SpecToRent</span>
          </div>
          <div className="text-gray-500 text-sm text-center md:text-right max-w-md">
            © 2026 SpecToRent. Все права защищены. <br/>
            Сайт носит информационный характер. Размещенные на сайте материалы и цены не являются публичной офертой.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
