const API_URL = '/api';

export const api = {
  // Orders
  getOrders: async () => {
    const res = await fetch(`${API_URL}/orders`);
    return res.json();
  },
  getOrder: async (id) => {
    const res = await fetch(`${API_URL}/orders/${id}`);
    return res.json();
  },
  createOrder: async (data) => {
    const res = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  updateOrderStatus: async (id, status) => {
    const res = await fetch(`${API_URL}/orders/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shippingStatus: status })
    });
    return res.json();
  },
  updateOrderTracking: async (id, trackingCode) => {
    const res = await fetch(`${API_URL}/orders/${id}/tracking`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trackingCode })
    });
    return res.json();
  },
  deleteOrder: async (id) => {
    const res = await fetch(`${API_URL}/orders/${id}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  // Items
  addItem: async (orderId, formData) => {
    const res = await fetch(`${API_URL}/orders/${orderId}/items`, {
      method: 'POST',
      body: formData // multipart/form-data
    });
    return res.json();
  },
  updateItem: async (itemId, formData) => {
    const res = await fetch(`${API_URL}/items/${itemId}`, {
      method: 'PUT',
      body: formData // multipart/form-data
    });
    return res.json();
  },
  updateItemDelivery: async (itemId, isDeliveredToRecipient) => {
    const res = await fetch(`${API_URL}/items/${itemId}/delivery`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isDeliveredToRecipient })
    });
    return res.json();
  },

  deleteItem: async (itemId) => {
    const res = await fetch(`${API_URL}/items/${itemId}`, { method: 'DELETE' });
    return res.json();
  }
};
