import { describe, it, expect } from 'vitest';
import { 
  validateDateRange, 
  validateQuantity, 
  validateImageFile, 
  isOwnMachinery 
} from '../utils/validation';
import { 
  calculateRentalTotal, 
  calculateDaysBetween, 
  formatPrice 
} from '../utils/calculations';

describe('Validation Functions Tests', () => {
  describe('TC-021: validateDateRange - Валидация дат аренды', () => {
    it('возвращает ошибку когда дата окончания раньше даты начала', () => {
      const result = validateDateRange('2026-03-01', '2026-02-15');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Дата окончания не может быть раньше даты начала');
    });

    it('возвращает success когда даты равны', () => {
      const result = validateDateRange('2026-03-01', '2026-03-01');
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('возвращает success когда дата окончания позже', () => {
      const result = validateDateRange('2026-03-01', '2026-03-15');
      expect(result.valid).toBe(true);
    });

    it('возвращает ошибку при отсутствии дат', () => {
      const result = validateDateRange('', '');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Выберите даты аренды');
    });
  });

  describe('TC-022: validateQuantity - Валидация количества техники', () => {
    it('возвращает ошибку когда количество превышает доступное', () => {
      const result = validateQuantity(7, 5);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Превышено доступное количество техники');
    });

    it('возвращает success когда количество равно доступному', () => {
      const result = validateQuantity(5, 5);
      expect(result.valid).toBe(true);
    });

    it('возвращает success когда количество меньше доступного', () => {
      const result = validateQuantity(3, 5);
      expect(result.valid).toBe(true);
    });

    it('возвращает ошибку при количестве меньше 1', () => {
      const result = validateQuantity(0, 5);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Количество должно быть не менее 1');
    });
  });

  describe('TC-019/TC-020: validateImageFile - Валидация изображений', () => {
    it('JPEG файл допустим', () => {
      const result = validateImageFile('photo.jpg', 2);
      expect(result.valid).toBe(true);
    });

    it('PNG файл допустим', () => {
      const result = validateImageFile('photo.png', 3);
      expect(result.valid).toBe(true);
    });

    it('GIF файл не допустим', () => {
      const result = validateImageFile('photo.gif', 1);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Поддерживаются только JPEG и PNG');
    });

    it('файл больше 5MB не допустим', () => {
      const result = validateImageFile('photo.jpg', 7);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Размер файла превышает 5MB');
    });

    it('файл ровно 5MB допустим', () => {
      const result = validateImageFile('photo.jpg', 5);
      expect(result.valid).toBe(true);
    });
  });

  describe('TC-010: isOwnMachinery - Проверка владельца техники', () => {
    it('возвращает true для владельца своей техники', () => {
      expect(isOwnMachinery(1, 1)).toBe(true);
      expect(isOwnMachinery('1', 1)).toBe(true);
    });

    it('возвращает false для чужой техники', () => {
      expect(isOwnMachinery(2, 1)).toBe(false);
    });

    it('возвращает false при отсутствии userId', () => {
      expect(isOwnMachinery(undefined, 1)).toBe(false);
    });

    it('возвращает false при отсутствии ownerId', () => {
      expect(isOwnMachinery(1, undefined)).toBe(false);
    });
  });
});

describe('Calculation Functions Tests', () => {
  describe('calculateRentalTotal - Расчёт стоимости аренды', () => {
    it('расчёт для одного дня аренды', () => {
      const total = calculateRentalTotal('2026-03-01', '2026-03-01', 10000, 1);
      expect(total).toBe(10000);
    });

    it('расчёт для 5 дней', () => {
      const total = calculateRentalTotal('2026-03-01', '2026-03-05', 10000, 1);
      expect(total).toBe(50000);
    });

    it('расчёт с учётом количества техники', () => {
      const total = calculateRentalTotal('2026-03-01', '2026-03-05', 10000, 2);
      expect(total).toBe(100000);
    });

    it('возвращает 0 при отсутствии дат', () => {
      const total = calculateRentalTotal('', '', 10000, 1);
      expect(total).toBe(0);
    });

    it('корректный расчёт для длительного периода', () => {
      const total = calculateRentalTotal('2026-03-01', '2026-03-31', 5000, 3);
      expect(total).toBe(31 * 5000 * 3);
    });
  });

  describe('calculateDaysBetween - Расчёт количества дней', () => {
    it('один день', () => {
      expect(calculateDaysBetween('2026-03-01', '2026-03-01')).toBe(1);
    });

    it('несколько дней', () => {
      expect(calculateDaysBetween('2026-03-01', '2026-03-05')).toBe(5);
    });

    it('возвращает 0 при пустых датах', () => {
      expect(calculateDaysBetween('', '')).toBe(0);
    });
  });

  describe('formatPrice - Форматирование цены', () => {
    it('форматирует цену', () => {
      const formatted = formatPrice(15000);
      expect(formatted).toContain('15');
    });

    it('форматирует нулевую цену', () => {
      expect(formatPrice(0)).toBe('0');
    });

    it('форматирует большую цену', () => {
      const formatted = formatPrice(1500000);
      expect(formatted.length).toBeGreaterThan(6);
    });
  });
});
