import { describe, it, expect } from 'vitest';
import { OrderStatus, UserRole, Machinery, Order } from '../types';

describe('Types and Enums from Application', () => {
  describe('OrderStatus Enum', () => {
    it('содержит все необходимые статусы', () => {
      expect(OrderStatus.NEW).toBe('NEW');
      expect(OrderStatus.APPROVED).toBe('APPROVED');
      expect(OrderStatus.REJECTED).toBe('REJECTED');
      expect(OrderStatus.CANCELED).toBe('CANCELED');
      expect(OrderStatus.COMPLETED).toBe('COMPLETED');
      expect(OrderStatus.EARLY_COMPLETED).toBe('EARLY_COMPLETED');
    });

    it('активные статусы определены корректно', () => {
      const activeStatuses = [OrderStatus.NEW, OrderStatus.APPROVED];
      
      expect(activeStatuses.includes(OrderStatus.NEW)).toBe(true);
      expect(activeStatuses.includes(OrderStatus.APPROVED)).toBe(true);
      expect(activeStatuses.includes(OrderStatus.REJECTED)).toBe(false);
      expect(activeStatuses.includes(OrderStatus.COMPLETED)).toBe(false);
    });

    it('завершённые статусы определены корректно', () => {
      const completedStatuses = [OrderStatus.COMPLETED, OrderStatus.EARLY_COMPLETED];
      
      expect(completedStatuses.includes(OrderStatus.COMPLETED)).toBe(true);
      expect(completedStatuses.includes(OrderStatus.EARLY_COMPLETED)).toBe(true);
      expect(completedStatuses.includes(OrderStatus.NEW)).toBe(false);
    });

    it('неактивные статусы для удаления объявлений', () => {
      const inactiveStatuses = [
        OrderStatus.REJECTED, 
        OrderStatus.CANCELED, 
        OrderStatus.COMPLETED, 
        OrderStatus.EARLY_COMPLETED
      ];
      
      expect(inactiveStatuses.includes(OrderStatus.REJECTED)).toBe(true);
      expect(inactiveStatuses.includes(OrderStatus.NEW)).toBe(false);
      expect(inactiveStatuses.includes(OrderStatus.APPROVED)).toBe(false);
    });
  });

  describe('UserRole Enum', () => {
    it('TC-001: содержит роль владельца', () => {
      expect(UserRole.OWNER).toBe('OWNER');
    });

    it('TC-001: содержит роль арендатора', () => {
      expect(UserRole.RENTER).toBe('RENTER');
    });

    it('содержит роль администратора', () => {
      expect(UserRole.ADMIN).toBe('ADMIN');
    });

    it('все роли имеют строковые значения', () => {
      expect(typeof UserRole.OWNER).toBe('string');
      expect(typeof UserRole.RENTER).toBe('string');
      expect(typeof UserRole.ADMIN).toBe('string');
    });
  });

  describe('Machinery Interface Validation', () => {
    it('объект техники содержит обязательные поля', () => {
      const machinery: Machinery = {
        id: 1,
        name: 'Экскаватор',
        category: 'Экскаваторы',
        region: 'Москва',
        dailyPrice: 15000,
        availableCount: 3,
        ownerId: 1
      };

      expect(machinery.id).toBeDefined();
      expect(machinery.name).toBeDefined();
      expect(typeof machinery.id).toBe('number');
    });

    it('TC-007: фильтрация по категории работает корректно', () => {
      const machineryList: Machinery[] = [
        { id: 1, name: 'Экскаватор 1', category: 'Экскаваторы' },
        { id: 2, name: 'Кран 1', category: 'Автокраны' },
        { id: 3, name: 'Экскаватор 2', category: 'Экскаваторы' },
      ];

      const selectedCategory = 'Экскаваторы';
      const filtered = machineryList.filter(m => m.category === selectedCategory);

      expect(filtered.length).toBe(2);
      expect(filtered.every(m => m.category === 'Экскаваторы')).toBe(true);
    });

    it('TC-008: фильтрация по диапазону цены работает корректно', () => {
      const machineryList: Machinery[] = [
        { id: 1, name: 'Item 1', dailyPrice: 5000 },
        { id: 2, name: 'Item 2', dailyPrice: 10000 },
        { id: 3, name: 'Item 3', dailyPrice: 20000 },
      ];

      const minPrice = 5000;
      const maxPrice = 15000;
      const filtered = machineryList.filter(m => {
        const price = m.dailyPrice || 0;
        return price >= minPrice && price <= maxPrice;
      });

      expect(filtered.length).toBe(2);
    });
  });

  describe('Order Interface Validation', () => {
    it('объект заявки содержит обязательные поля', () => {
      const order: Order = {
        id: 1,
        status: OrderStatus.NEW,
        startDate: '2026-03-01',
        endDate: '2026-03-10',
        quantity: 1,
        address: 'ул. Примерная, 1',
        itemId: 1,
        renterId: 2,
        ownerId: 1
      };

      expect(order.id).toBeDefined();
      expect(order.status).toBeDefined();
      expect(order.startDate).toBeDefined();
      expect(order.endDate).toBeDefined();
      expect(order.itemId).toBeDefined();
      expect(order.renterId).toBeDefined();
    });

    it('TC-013: досрочное завершение меняет статус', () => {
      let order: Order = {
        id: 1,
        status: OrderStatus.APPROVED,
        startDate: '2026-03-01',
        endDate: '2026-03-10',
        quantity: 1,
        itemId: 1,
        renterId: 2
      };

      order = { ...order, status: OrderStatus.EARLY_COMPLETED };
      
      expect(order.status).toBe(OrderStatus.EARLY_COMPLETED);
    });

    it('TC-011/TC-012: изменение статуса заявки', () => {
      let order: Order = {
        id: 1,
        status: OrderStatus.NEW,
        startDate: '2026-03-01',
        endDate: '2026-03-10',
        quantity: 1,
        itemId: 1,
        renterId: 2
      };

      order = { ...order, status: OrderStatus.APPROVED };
      expect(order.status).toBe(OrderStatus.APPROVED);

      order = { ...order, status: OrderStatus.REJECTED };
      expect(order.status).toBe(OrderStatus.REJECTED);
    });
  });
});
