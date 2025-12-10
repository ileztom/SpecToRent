
import { Machinery, User, UserRole } from './types';

export const CURRENT_RENTER: User = {
  id: 'renter-1',
  name: 'Томов Илья',
  email: 'renter@example.com',
  role: UserRole.RENTER,
  avatar: 'https://picsum.photos/id/1005/100/100'
};

export const CURRENT_OWNER: User = {
  id: 'owner-1',
  name: 'СтройТех Групп',
  email: 'owner@example.com',
  role: UserRole.OWNER,
  avatar: 'https://picsum.photos/id/1010/100/100'
};

export const MOCK_MACHINERY: Machinery[] = [
  {
    id: 'm-1',
    name: 'JCB 3CX Super',
    type: 'Экскаватор-погрузчик',
    category: 'Экскаваторы',
    pricePerShift: 18000,
    region: 'Москва',
    description: 'Универсальный экскаватор-погрузчик для землеройных работ. Опытный оператор, топливо включено.',
    imageUrl: 'https://sankar.ru/upload/sprint.editor/9ea/img-1630565001-9217-936-image6.png',
    ownerId: 'owner-1',
    availableCount: 3
  },
  {
    id: 'm-2',
    name: 'Liebherr LTM 1050',
    type: 'Автокран',
    category: 'Краны',
    pricePerShift: 25000,
    region: 'Санкт-Петербург',
    description: 'Мобильный кран грузоподъемностью 50 тонн. Подходит для монтажных работ на высоте.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/7f/Autojerab-AD30.jpg',
    ownerId: 'owner-2', // Different owner to test filtering if needed
    availableCount: 1
  },
  {
    id: 'm-3',
    name: 'KAMAZ 6520',
    type: 'Самосвал',
    category: 'Грузовики',
    pricePerShift: 12000,
    region: 'Москва',
    description: 'Самосвал грузоподъемностью 20 тонн. Вывоз грунта, доставка песка и щебня.',
    imageUrl: 'https://samosval.maz.ru.com/wp-content/uploads/2019/08/Samosval-6h4-P-zadnyaya-12-s-b-k-1217x749.jpg',
    ownerId: 'owner-1',
    availableCount: 5
  },
  {
    id: 'm-4',
    name: 'Bobcat S530',
    type: 'Мини-погрузчик',
    category: 'Погрузчики',
    pricePerShift: 9000,
    region: 'Казань',
    description: 'Компактный погрузчик для работы в стесненных условиях. Навесное оборудование: щетка, вилы.',
    imageUrl: 'https://dana96.ru/upload/iblock/1c9/1c92b2dc536f1c2b8480b9cef17e8ff0.jpg',
    ownerId: 'owner-1',
    availableCount: 2
  },
  {
    id: 'm-5',
    name: 'Hitachi ZX330',
    type: 'Гусеничный экскаватор',
    category: 'Экскаваторы',
    pricePerShift: 32000,
    region: 'Екатеринбург',
    description: 'Мощный экскаватор для разработки котлованов и карьеров. Ковш 1.6 куба.',
    imageUrl: 'https://www.technodom.com/wp-content/uploads/2023/10/c5a2284.jpg',
    ownerId: 'owner-3',
    availableCount: 1
  }
];

export const REGIONS = ['Москва', 'Санкт-Петербург', 'Казань', 'Екатеринбург', 'Новосибирск'];
export const CATEGORIES = ['Экскаваторы', 'Краны', 'Грузовики', 'Погрузчики', 'Бульдозеры'];
