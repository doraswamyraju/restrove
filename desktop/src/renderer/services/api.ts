export const API_URL = (import.meta as any).env?.VITE_API_URL || 'https://restrove.sriddha.com/api';

// Catalog
export async function getCategories() {
  const res = await fetch(`${API_URL}/catalog/categories`);
  return (await res.json()).categories || [];
}

export async function getMenuItems(categoryId?: string, search?: string) {
  let url = `${API_URL}/catalog/items?`;
  if (categoryId && categoryId !== 'All') url += `categoryId=${categoryId}&`;
  if (search) url += `search=${encodeURIComponent(search)}&`;
  const res = await fetch(url);
  return (await res.json()).items || [];
}

export async function uploadItemPhoto(file: File) {
  const formData = new FormData();
  formData.append('photo', file);
  const res = await fetch(`${API_URL}/catalog/upload`, {
    method: 'POST',
    body: formData
  });
  return await res.json();
}

export async function saveMenuItem(itemData: any) {
  const res = await fetch(`${API_URL}/catalog/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(itemData)
  });
  return await res.json();
}

export async function toggleItemAvailability(id: string, isAvailable: boolean) {
  const res = await fetch(`${API_URL}/catalog/items/${id}/availability`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ isAvailable })
  });
  return await res.json();
}

export async function deleteMenuItem(id: string) {
  const res = await fetch(`${API_URL}/catalog/items/${id}`, { method: 'DELETE' });
  return await res.json();
}

// Customers & Wallet
export async function getCustomers(search?: string) {
  let url = `${API_URL}/customers`;
  if (search) url += `?search=${encodeURIComponent(search)}`;
  const res = await fetch(url);
  return (await res.json()).customers || [];
}

export async function getCustomerWallet(phone: string) {
  const res = await fetch(`${API_URL}/wallet/customer/${phone}`);
  if (!res.ok) return null;
  return await res.json();
}

export async function depositCustomerWallet(phone: string, name: string, amount: number, notes?: string) {
  const res = await fetch(`${API_URL}/wallet/deposit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, name, amount, notes })
  });
  return await res.json();
}

// Orders
export async function getOrders(status?: string) {
  let url = `${API_URL}/orders`;
  if (status && status !== 'All Orders') url += `?status=${encodeURIComponent(status)}`;
  const res = await fetch(url);
  return (await res.json()).orders || [];
}

export async function createOrder(payload: any) {
  const res = await fetch(`${API_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return await res.json();
}

// Inventory
export async function getInventory() {
  const res = await fetch(`${API_URL}/inventory`);
  return (await res.json()).items || [];
}

export async function adjustInventory(itemId: string, adjustmentAmount: number, reason: string) {
  const res = await fetch(`${API_URL}/inventory/adjust`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ itemId, adjustmentAmount, reason })
  });
  return await res.json();
}

// Reports
export async function getReportsSummary() {
  const res = await fetch(`${API_URL}/reports/summary`);
  return await res.json();
}

// Settings
export async function getSettings() {
  const res = await fetch(`${API_URL}/settings`);
  return (await res.json()).settings || {};
}

export async function saveSettings(settings: any) {
  const res = await fetch(`${API_URL}/settings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ settings })
  });
  return await res.json();
}
