export const formatPhone = (phone: string): string => {
  const cleaned = phone.replace(/[^0-9+]/g, '');
  if (cleaned.startsWith('+237') && cleaned.length === 13) {
    return `+237 ${cleaned.slice(4, 7)} ${cleaned.slice(7, 9)} ${cleaned.slice(9, 11)} ${cleaned.slice(11, 13)}`;
  }
  if (cleaned.startsWith('6') && cleaned.length === 9) {
    return `+237 ${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 7)} ${cleaned.slice(7, 9)}`;
  }
  return phone;
};

export const cleanPhone = (phone: string): string => {
  return phone.replace(/[\s+]/g, '');
};
