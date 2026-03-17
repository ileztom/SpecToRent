export function validateDateRange(startDate: string, endDate: string): { valid: boolean; error?: string } {
  if (!startDate || !endDate) {
    return { valid: false, error: 'Выберите даты аренды' };
  }
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (end < start) {
    return { valid: false, error: 'Дата окончания не может быть раньше даты начала' };
  }
  
  return { valid: true };
}

export function validateQuantity(requested: number, available: number): { valid: boolean; error?: string } {
  if (requested < 1) {
    return { valid: false, error: 'Количество должно быть не менее 1' };
  }
  
  if (requested > available) {
    return { valid: false, error: 'Превышено доступное количество техники' };
  }
  
  return { valid: true };
}

export function validateImageFile(filename: string, sizeMB: number): { valid: boolean; error?: string } {
  const allowedExtensions = ['.jpg', '.jpeg', '.png'];
  const maxSizeMB = 5;
  
  const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  
  if (!allowedExtensions.includes(ext)) {
    return { valid: false, error: 'Поддерживаются только JPEG и PNG' };
  }
  
  if (sizeMB > maxSizeMB) {
    return { valid: false, error: 'Размер файла превышает 5MB' };
  }
  
  return { valid: true };
}

export function isOwnMachinery(userId: number | string | undefined, machineryOwnerId: number | undefined): boolean {
  if (!userId || !machineryOwnerId) return false;
  return Number(userId) === machineryOwnerId;
}
