export const maskSSN = (numSecu: string): string => {
  if (!numSecu || numSecu.length < 4) return numSecu;
  const last4 = numSecu.slice(-4);
  return `**** *** ${last4}`;
};

export const formatSSN = (numSecu: string): string => {
  const cleaned = numSecu.replace(/\s/g, '');
  if (cleaned.length <= 4) return cleaned;
  const parts = [];
  for (let i = 0; i < cleaned.length; i += 4) {
    parts.push(cleaned.slice(i, i + 4));
  }
  return parts.join(' ');
};
