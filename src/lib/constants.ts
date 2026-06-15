export const TAX_RATE = 0.08;
export const FREE_SHIPPING_THRESHOLD = 2000;
export const BASE_SHIPPING = 15;

export function calculateTotals(subtotal: number) {
  const tax = Number((subtotal * TAX_RATE).toFixed(2));
  const shipping = subtotal > FREE_SHIPPING_THRESHOLD ? 0 : BASE_SHIPPING;
  const total = Number((subtotal + tax + shipping).toFixed(2));

  return { subtotal, tax, shipping, total };
}
