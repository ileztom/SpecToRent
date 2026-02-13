export function calculateRentalTotal(
  startDate: string, 
  endDate: string, 
  pricePerShift: number, 
  quantity: number
): number {
  if (!startDate || !endDate) return 0;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  
  if (diffDays <= 0) return 0;
  
  return diffDays * pricePerShift * quantity;
}

export function calculateDaysBetween(startDate: string, endDate: string): number {
  if (!startDate || !endDate) return 0;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

export function formatPrice(price: number): string {
  return price.toLocaleString('ru-RU');
}
