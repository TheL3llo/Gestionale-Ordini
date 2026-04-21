export const API_BASE_URL = import.meta.env.VITE_API_URL || '';
const API_URL = `${API_BASE_URL}/api`;

const handleResponse = async (res) => {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Errore del server');
  }
  return data;
};

export const api = {
  // Orders
  getOrders: async () => {
    const res = await fetch(`${API_URL}/orders`);
    return handleResponse(res);
  },
  getOrder: async (id) => {
    const res = await fetch(`${API_URL}/orders/${id}`);
    return handleResponse(res);
  },
  createOrder: async (data) => {
    const res = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },
  updateOrderStatus: async (id, status) => {
    const res = await fetch(`${API_URL}/orders/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shippingStatus: status })
    });
    return handleResponse(res);
  },
  updateOrderTracking: async (id, trackingCode) => {
    const res = await fetch(`${API_URL}/orders/${id}/tracking`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trackingCode })
    });
    return handleResponse(res);
  },
  deleteOrder: async (id) => {
    const res = await fetch(`${API_URL}/orders/${id}`, {
      method: 'DELETE'
    });
    return handleResponse(res);
  },

  // Items
  addItem: async (orderId, formData) => {
    const res = await fetch(`${API_URL}/orders/${orderId}/items`, {
      method: 'POST',
      body: formData // multipart/form-data
    });
    return handleResponse(res);
  },
  updateItem: async (itemId, formData) => {
    const res = await fetch(`${API_URL}/items/${itemId}`, {
      method: 'PUT',
      body: formData // multipart/form-data
    });
    return handleResponse(res);
  },
  updateItemDelivery: async (itemId, isDeliveredToRecipient) => {
    const res = await fetch(`${API_URL}/items/${itemId}/delivery`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isDeliveredToRecipient })
    });
    return handleResponse(res);
  },

  deleteItem: async (itemId) => {
    const res = await fetch(`${API_URL}/items/${itemId}`, { method: 'DELETE' });
    return handleResponse(res);
  }
};
