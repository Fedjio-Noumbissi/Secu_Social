export const formatCurrency = (amount: number): string => {
  return `${amount.toLocaleString('fr-FR')} FCFA`;
};

export const parseCurrency = (value: string): number => {
  return Number(value.replace(/[^0-9,-]/g, '').replace(',', '.'));
};
