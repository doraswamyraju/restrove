// Detect if running inside native Android / Capacitor container or standard web
const isNativeApp = typeof window !== 'undefined' && (
  Boolean((window as any).Capacitor?.isNativePlatform?.()) ||
  window.location.protocol === 'capacitor:' ||
  (window.location.hostname === 'localhost' && !window.location.port)
);

export const API_URL = (import.meta as any).env?.VITE_API_URL || (isNativeApp ? 'https://restrove.sriddha.com/api' : '/api');

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
export async function getCustomers(search?: string, filter?: string, sort?: string) {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (filter) params.append('filter', filter);
  if (sort) params.append('sort', sort);

  const res = await fetch(`${API_URL}/customers?${params.toString()}`);
  return (await res.json()).customers || [];
}

export async function getCustomerStats() {
  const res = await fetch(`${API_URL}/customers/stats`);
  return await res.json();
}

export async function getCustomerDetails(id: string) {
  const res = await fetch(`${API_URL}/customers/${id}`);
  return await res.json();
}

export async function saveCustomer(data: any) {
  const res = await fetch(`${API_URL}/customers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return await res.json();
}

export async function updateCustomer(id: string, data: any) {
  const res = await fetch(`${API_URL}/customers/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return await res.json();
}

export async function adjustCustomerWallet(id: string, payload: any) {
  const res = await fetch(`${API_URL}/customers/${id}/wallet-adjust`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return await res.json();
}

export async function deleteCustomer(id: string) {
  const res = await fetch(`${API_URL}/customers/${id}`, {
    method: 'DELETE'
  });
  return await res.json();
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
export async function getOrders(status?: string, serviceType?: string, search?: string) {
  const params = new URLSearchParams();
  if (status && status !== 'All Orders' && status !== 'All') params.append('status', status);
  if (serviceType && serviceType !== 'All Orders' && serviceType !== 'All') params.append('serviceType', serviceType);
  if (search) params.append('search', search);

  const res = await fetch(`${API_URL}/orders?${params.toString()}`);
  return await res.json();
}

export async function getOrderById(id: string) {
  const res = await fetch(`${API_URL}/orders/${id}`);
  return await res.json();
}

export async function createOrder(payload: any) {
  const res = await fetch(`${API_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return await res.json();
}

export async function deleteOrder(id: string) {
  const res = await fetch(`${API_URL}/orders/${id}`, {
    method: 'DELETE'
  });
  return await res.json();
}

export async function updateOrderStatus(id: string, status: string) {
  const res = await fetch(`${API_URL}/orders/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
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
export async function getReportsSummary(range = 'Today') {
  const res = await fetch(`${API_URL}/reports/summary?range=${encodeURIComponent(range)}`);
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
