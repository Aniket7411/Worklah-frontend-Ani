/**
 * Money rounding helper (SGD amounts) to avoid floating point artifacts
 * like 87.23750000000001 leaking to UI/backend payloads.
 */
export const roundToMoney = (amount: number, decimals: number = 2): number => {
  if (!Number.isFinite(amount)) return 0;
  const factor = 10 ** decimals;
  return Math.round(amount * factor) / factor;
};

export const roundToHours = (hours: number): number => roundToMoney(hours, 2);

