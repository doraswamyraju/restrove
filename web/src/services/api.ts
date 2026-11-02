export const API_URL = (import.meta as any).env?.VITE_API_URL || '/api';

export async function fetchCatalog() {
  try {
    const [catRes, itemRes] = await Promise.all([
      fetch(`${API_URL}/catalog/categories`),
      fetch(`${API_URL}/catalog/items`)
    ]);
    const cats = await catRes.json();
    const items = await itemRes.json();
    return { categories: cats.categories || [], items: items.items || [] };
  } catch (err) {
    console.error('Failed to fetch catalog:', err);
    return { categories: [], items: [] };
  }
}

export async function fetchOrders(status = 'All') {
  try {
    const res = await fetch(`${API_URL}/orders?status=${status}`);
    const data = await res.json();
    return data.orders || [];
  } catch (err) {
    console.error('Failed to fetch orders:', err);
    return [];
  }
}

export async function getCustomerWallet(phone: string) {
  try {
    const res = await fetch(`${API_URL}/wallet/customer/${phone}`);
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error('Failed to fetch wallet:', err);
    return null;
  }
}

export async function depositWallet(phone: string, name: string, amount: number, notes = '') {
  const res = await fetch(`${API_URL}/wallet/deposit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, name, amount, notes })
  });
  return await res.json();
}

export async function createOrder(orderPayload: any) {
  const res = await fetch(`${API_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderPayload)
  });
  return await res.json();
}
