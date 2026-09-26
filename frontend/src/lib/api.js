const API_URL = "http://127.0.0.1:8000";

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Request failed");
  }

  return data;
}

const unwrap = async (requestPromise) => {
  const response = await requestPromise;
  return response.data ?? [];
};

export const api = {
  // Dashboard returns an object, so DON'T unwrap it.
  getDashboard: () => request("/dashboard/"),

  // Lists → return actual arrays
  getProducts: () => unwrap(request("/products/")),

  getInventory: () => unwrap(request("/inventory/")),

  getWarehouses: () => unwrap(request("/warehouses/")),

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

  getReceipts: () => unwrap(request("/operations/receipts")),

  getDeliveries: () => unwrap(request("/operations/deliveries")),

  getTransfers: () => unwrap(request("/operations/transfers")),

  getAdjustments: () => unwrap(request("/operations/adjustments")),

  // Mutations return their complete response
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
};