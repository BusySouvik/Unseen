import { supabase } from "./supabase";

const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

async function request(endpoint, options = {}) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (session?.access_token) {
    headers.Authorization = `Bearer ${session.access_token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  let data;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(
      data?.detail ||
      data?.message ||
      "Request failed"
    );
  }

  return data;
}

const unwrap = async (requestPromise) => {
  const response = await requestPromise;
  return response?.data ?? [];
};

export const api = {
  getDashboard: () => request("/dashboard/"),

  getProducts: () => unwrap(request("/products/")),

  getInventory: () => unwrap(request("/inventory/")),

  getWarehouses: () => unwrap(request("/warehouses/")),

  createWarehouse: (data) =>
    request("/warehouses/", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getLedger: async (params = {}) => {
    const query = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        query.append(key, value);
      }
    });

    const queryString = query.toString();

    return unwrap(
      request(`/ledger/${queryString ? `?${queryString}` : ""}`)
    );
  },

  getReceipts: () =>
    unwrap(request("/operations/receipts")),

  getDeliveries: () =>
    unwrap(request("/operations/deliveries")),

  getTransfers: () =>
    unwrap(request("/operations/transfers")),

  getAdjustments: () =>
    unwrap(request("/operations/adjustments")),

  createProduct: (data) =>
    request("/products/", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  createReceipt: (data) =>
    request("/receipts/", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  createDelivery: (data) =>
    request("/deliveries/", {
      method: "POST",
      body: JSON.stringify(data),
  }),

  createTransfer: (data) =>
    request("/transfers/", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  createAdjustment: (data) =>
    request("/adjustments/", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateProduct: (id, data) =>
    request(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),};



