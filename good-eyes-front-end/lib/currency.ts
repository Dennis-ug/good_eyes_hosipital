export function formatUGX(amount?: number | null): string {
  const value = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  return `UGX ${Math.round(value).toLocaleString()}`;
}


