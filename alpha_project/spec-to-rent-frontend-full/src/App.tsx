import React, { useEffect, useState } from 'react';
import { Search, LogOut, User as UserIcon, Calendar, MessageSquare, Send } from 'lucide-react';
import { User, UserRole, Machinery, Order } from './types';
import { REGIONS, CATEGORIES } from './constants';
import { registerUser, loginUser } from './api/users';
import { getItems } from './api/items';
import { createOrder, getOrders } from './api/orders';
import { ChatSocket, ChatMessage } from './ws/chat';

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

type View = 'login' | 'catalog' | 'orders' | 'chat';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(getStoredCurrentUser);
  const [view, setView] = useState<View>(user ? 'catalog' : 'login');
  const [items, setItems] = useState<Machinery[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedItem, setSelectedItem] = useState<Machinery | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // filters
  const [region, setRegion] = useState('');
  const [category, setCategory] = useState('');

  // auth form
  const [isLogin, setIsLogin] = useState(true);
  const [authForm, setAuthForm] = useState({
    name: '',
    email: '',
    password: '',
    role: UserRole.RENTER as UserRole,
  });
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // booking form
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // chat
  const [chatSocket, setChatSocket] = useState<ChatSocket | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatText, setChatText] = useState('');

  useEffect(() => {
    if (user) {
      loadItems();
      loadOrders();
    }
  }, [user]);

  const loadItems = async () => {
    try {
      const data = await getItems();
      setItems(data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadOrders = async () => {
    try {
      const data = await getOrders();
      setOrders(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!authForm.email || !authForm.password || (!isLogin && !authForm.name)) {
      setAuthError('Заполните все поля');
      return;
    }

    try {
      setAuthLoading(true);
      let u: User;
      if (isLogin) {
        u = await loginUser(authForm.email, authForm.password);
      } else {
        u = await registerUser({
          name: authForm.name,
          email: authForm.email,
          password: authForm.password,
          role: authForm.role,
        });
      }
      setUser(u);
      localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(u));
      setView('catalog');
    } catch (err: any) {
      setAuthError(err.message || 'Ошибка авторизации');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
    setUser(null);
    setView('login');
  };

  const filteredItems = items.filter((i) => {
    const regionOk = region ? (i.location || '').includes(region) : true;
    const categoryOk = category ? (i.category === category) : true;
    return regionOk && categoryOk;
  });

  const handleCreateOrder = async () => {
    if (!user || !selectedItem || !startDate || !endDate) return;
    try {
      const order = await createOrder({
        renterId: Number(user.id),
        itemId: selectedItem.id,
        startDate,
        endDate,
      });
      setOrders((prev) => [...prev, order]);
      setView('orders');
    } catch (e) {
      console.error(e);
      alert('Не удалось создать заявку');
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
    setView('chat');
  };

  const handleSendChat = () => {
    if (!chatSocket || !user || !chatText.trim()) return;
    chatSocket.sendMessage(Number(user.id), chatText.trim());
    setChatText('');
  };

  if (!user || view === 'login') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="flex justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">SpecToRent</h1>
            <button
              className="text-sm text-blue-600"
              onClick={() => setIsLogin((v) => !v)}
            >
              {isLogin ? 'Регистрация' : 'Уже есть аккаунт? Войти'}
            </button>
          </div>
          <h2 className="text-xl font-semibold mb-4">
            {isLogin ? 'Вход в аккаунт' : 'Регистрация'}
          </h2>
          <form className="space-y-4" onSubmit={handleAuthSubmit}>
            {!isLogin && (
              <input
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Имя / Компания"
                value={authForm.name}
                onChange={(e) =>
                  setAuthForm({ ...authForm, name: e.target.value })
                }
              />
            )}
            <input
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Email"
              type="email"
              value={authForm.email}
              onChange={(e) =>
                setAuthForm({ ...authForm, email: e.target.value })
              }
            />
            <input
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Пароль"
              type="password"
              value={authForm.password}
              onChange={(e) =>
                setAuthForm({ ...authForm, password: e.target.value })
              }
            />
            {!isLogin && (
              <select
                className="w-full border rounded-lg px-3 py-2"
                value={authForm.role}
                onChange={(e) =>
                  setAuthForm({
                    ...authForm,
                    role: e.target.value as UserRole,
                  })
                }
              >
                <option value={UserRole.RENTER}>Арендатор</option>
                <option value={UserRole.OWNER}>Владелец</option>
              </select>
            )}
            {authError && (
              <div className="text-red-500 text-sm">{authError}</div>
            )}
            <button
              type="submit"
              disabled={authLoading}
              className="w-full bg-blue-600 text-white rounded-lg py-2 font-semibold hover:bg-blue-700 disabled:opacity-60"
            >
              {authLoading
                ? 'Загрузка...'
                : isLogin
                ? 'Войти'
                : 'Зарегистрироваться'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 text-white w-8 h-8 rounded-lg flex items-center justify-center font-bold">
              S
            </div>
            <span className="font-bold text-lg">SpecToRent</span>
          </div>
          <nav className="flex items-center gap-4">
            <button
              onClick={() => setView('catalog')}
              className={view === 'catalog' ? 'text-blue-600 font-semibold' : 'text-gray-600'}
            >
              Каталог
            </button>
            <button
              onClick={() => setView('orders')}
              className={view === 'orders' ? 'text-blue-600 font-semibold' : 'text-gray-600'}
            >
              Мои заявки
            </button>
          </nav>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <UserIcon className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-sm">
                <div className="font-semibold">{user.name}</div>
                <div className="text-gray-500 text-xs">
                  {user.role === UserRole.OWNER ? 'Владелец' : 'Арендатор'}
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-red-500"
              title="Выйти"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {view === 'catalog' && (
        <main className="flex-1 max-w-6xl mx-auto px-4 py-6">
          <div className="bg-white rounded-2xl shadow-sm border p-4 mb-6 flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="Поиск по названию (не реализовано, только фильтры ниже)"
                disabled
              />
            </div>
            <select
              className="border rounded-lg px-3 py-2 text-sm"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
            >
              <option value="">Все регионы</option>
              {REGIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <select
              className="border rounded-lg px-3 py-2 text-sm"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Все категории</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow-sm border p-4 flex flex-col justify-between"
              >
                <div>
                  <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-500 mb-2">
                    {item.location || 'Регион не указан'}
                  </p>
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {item.description || 'Описание не задано'}
                  </p>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-gray-400">Ставка за смену</div>
                    <div className="font-semibold text-blue-600">
                      {item.dailyPrice ? `${item.dailyPrice} ₽` : '—'}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedItem(item);
                      setView('orders');
                    }}
                    className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Оформить заявку
                  </button>
                </div>
              </div>
            ))}
            {filteredItems.length === 0 && (
              <div className="col-span-full text-center text-gray-500 py-10">
                Техника не найдена. Добавьте позиции через backend или измените фильтры.
              </div>
            )}
          </div>
        </main>
      )}

      {view === 'orders' && (
        <main className="flex-1 max-w-6xl mx-auto px-4 py-6 flex gap-6">
          <div className="flex-1 bg-white rounded-2xl shadow-sm border p-4">
            <h2 className="text-lg font-semibold mb-4">Мои заявки</h2>
            {orders.length === 0 ? (
              <div className="text-gray-500 text-sm">
                У вас пока нет заявок. Выберите технику в каталоге и оформите аренду.
              </div>
            ) : (
              <div className="space-y-2">
                {orders.map((o) => (
                  <div
                    key={o.id}
                    className="border rounded-lg px-3 py-2 flex items-center justify-between hover:bg-gray-50 cursor-pointer"
                    onClick={() => openChatForOrder(o)}
                  >
                    <div>
                      <div className="font-medium text-sm">Заявка #{o.id}</div>
                      <div className="text-xs text-gray-500">
                        {o.startDate} — {o.endDate}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>{o.status}</span>
                      <MessageSquare className="w-4 h-4 text-blue-600" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="w-full md:w-80 bg-white rounded-2xl shadow-sm border p-4">
            <h2 className="text-lg font-semibold mb-4">
              {selectedItem ? 'Оформление заявки' : 'Информация'}
            </h2>
            {selectedItem ? (
              <div className="space-y-3">
                <div className="text-sm">
                  <div className="font-semibold mb-1">{selectedItem.title}</div>
                  <div className="text-gray-500 mb-2">
                    {selectedItem.location || 'Регион не указан'}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-gray-500">Дата начала</label>
                  <input
                    type="date"
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                  <label className="text-xs text-gray-500">Дата окончания</label>
                  <input
                    type="date"
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
                <button
                  onClick={handleCreateOrder}
                  className="w-full bg-blue-600 text-white rounded-lg py-2 text-sm font-semibold hover:bg-blue-700"
                >
                  Подтвердить заявку
                </button>
              </div>
            ) : (
              <div className="text-gray-500 text-sm">
                Выберите технику в каталоге, чтобы оформить заявку.
              </div>
            )}
          </div>
        </main>
      )}

      {view === 'chat' && selectedOrder && (
        <main className="flex-1 max-w-6xl mx-auto px-4 py-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">Чат по заявке #{selectedOrder.id}</h2>
              <div className="text-xs text-gray-500">
                {selectedOrder.startDate} — {selectedOrder.endDate}
              </div>
            </div>
            <button
              onClick={() => setView('orders')}
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
        </main>
      )}
    </div>
  );
};

export default App;
