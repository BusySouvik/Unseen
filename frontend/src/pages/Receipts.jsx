import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowDownToLine,
  Package,
  Warehouse,
  UserRound,
  Hash,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  X,
} from "lucide-react";
import AppShell from "../components/app/AppShell";
import { api } from "../lib/api";

export default function Receipts() {
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [receipts, setReceipts] = useState([]);

  const [supplier, setSupplier] = useState("");
  const [productId, setProductId] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [quantity, setQuantity] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [productData, warehouseData, receiptData] =
        await Promise.all([
          api.getProducts(),
          api.getWarehouses(),
          api.getReceipts(),
        ]);

      setProducts(productData || []);
      setWarehouses(warehouseData || []);
      setReceipts(receiptData || []);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Failed to load receipts.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      void loadData();
    }, 0);

    return () => window.clearTimeout(handle);
  }, [loadData]);

  const submitReceipt = async (e) => {
    e.preventDefault();

    if (!supplier || !productId || !warehouseId || !quantity) {
      setMessage({
        type: "error",
        text: "Please fill all fields.",
      });
      return;
    }

    try {
      setSubmitting(true);
      setMessage(null);

      await api.createReceipt({
        supplier,
        product_id: productId,
        warehouse_id: warehouseId,
        quantity: Number(quantity),
      });

      setMessage({
        type: "success",
        text: `Receipt validated successfully. ${quantity} ${selectedProduct?.unit || ""} added to stock.`,
      });

      setSupplier("");
      setProductId("");
      setWarehouseId("");
      setQuantity("");
      setShowForm(false);

      await loadData();
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Failed to create receipt.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const selectedProduct = products.find((p) => p.id === productId);

  return (
    <AppShell>
      <div className="min-h-full px-4 pb-10 pt-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1500px]">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-7 flex flex-col justify-between gap-5 lg:flex-row lg:items-end"
          >
            <div>
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
                <ArrowDownToLine size={14} />
                Operations
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Receipts
              </h1>

              <p className="mt-2 text-sm text-slate-400">
                Receive incoming goods and automatically update warehouse stock.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={loadData}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-slate-300 transition hover:bg-white/[0.08]"
              >
                <RefreshCw size={15} />
                Refresh
              </button>

              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:scale-[1.02]"
              >
                <ArrowDownToLine size={16} />
                New Receipt
              </button>
            </div>
          </motion.div>

          {/* Success/Error */}
          <AnimatePresence>
            {message && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`mb-5 flex items-center gap-3 rounded-xl border px-4 py-3 text-sm ${
                  message.type === "success"
                    ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                    : "border-red-400/20 bg-red-400/10 text-red-300"
                }`}
              >
                {message.type === "success" ? (
                  <CheckCircle2 size={18} />
                ) : (
                  <AlertCircle size={18} />
                )}
                {message.text}
              </motion.div>
            )}
          </AnimatePresence>

          {/* How it works */}
          <div className="mb-6 grid gap-3 md:grid-cols-3">
            <FlowCard
              number="01"
              title="Receive"
              description="Record supplier and incoming quantity."
            />
            <FlowCard
              number="02"
              title="Validate"
              description="Stock is automatically increased."
            />
            <FlowCard
              number="03"
              title="Ledger"
              description="Every movement is permanently logged."
            />
          </div>

          {/* Receipt History */}
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025]">
            <div className="border-b border-white/10 px-5 py-4">
              <h2 className="font-semibold text-white">Receipt History</h2>
              <p className="mt-1 text-xs text-slate-500">
                Validated incoming inventory
              </p>
            </div>

            {loading ? (
              <div className="space-y-3 p-5">
                {[1, 2, 3, 4].map((x) => (
                  <div
                    key={x}
                    className="h-16 animate-pulse rounded-xl bg-white/[0.04]"
                  />
                ))}
              </div>
            ) : receipts.length === 0 ? (
              <div className="flex min-h-[280px] flex-col items-center justify-center text-center">
                <div className="mb-4 rounded-2xl bg-white/[0.04] p-4">
                  <ArrowDownToLine className="text-slate-500" />
                </div>
                <p className="font-semibold text-white">No receipts yet</p>
                <p className="mt-1 text-sm text-slate-500">
                  Create your first incoming inventory receipt.
                </p>
              </div>
            ) : (
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[800px]">
                  <thead>
                    <tr className="border-b border-white/10 text-left text-[11px] uppercase tracking-wider text-slate-500">
                      <th className="px-5 py-4">Supplier</th>
                      <th className="px-5 py-4">Product</th>
                      <th className="px-5 py-4">Warehouse</th>
                      <th className="px-5 py-4">Quantity</th>
                      <th className="px-5 py-4">Status</th>
                      <th className="px-5 py-4">Date</th>
                    </tr>
                  </thead>

                  <tbody>
                    {receipts.map((receipt, index) => {
                      const item = receipt.receipt_items?.[0];
                      const product = item?.products;

                      return (
                        <motion.tr
                          key={receipt.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.03 }}
                          className="border-b border-white/[0.06] hover:bg-white/[0.03]"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="rounded-lg bg-cyan-400/10 p-2 text-cyan-300">
                                <UserRound size={15} />
                              </div>
                              <span className="text-sm font-medium text-white">
                                {receipt.supplier}
                              </span>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <div className="text-sm text-slate-200">
                              {product?.name || "—"}
                            </div>
                            <div className="font-mono text-xs text-slate-600">
                              {product?.sku || ""}
                            </div>
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-400">
                            {receipt.warehouses?.name || "—"}
                          </td>

                          <td className="px-5 py-4">
                            <span className="font-semibold text-white">
                              {item?.quantity || 0}
                            </span>
                            <span className="ml-1 text-xs text-slate-500">
                              {product?.unit || ""}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/15 bg-emerald-400/10 px-2.5 py-1 text-xs font-semibold text-emerald-300">
                              <CheckCircle2 size={13} />
                              {receipt.status}
                            </span>
                          </td>

                          <td className="px-5 py-4 text-xs text-slate-500">
                            {formatDate(receipt.created_at)}
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Receipt Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setShowForm(false);
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 25, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.98 }}
              className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0b0d11] p-6 shadow-2xl shadow-black/50"
            >
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
                    <ArrowDownToLine size={19} />
                  </div>
                  <h2 className="text-xl font-bold text-white">
                    Create Receipt
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Add incoming stock to a warehouse.
                  </p>
                </div>

                <button
                  onClick={() => setShowForm(false)}
                  className="rounded-lg p-2 text-slate-500 transition hover:bg-white/5 hover:text-white"
                >
                  <X size={19} />
                </button>
              </div>

              <form onSubmit={submitReceipt} className="space-y-4">
                <Field
                  label="Supplier"
                  icon={<UserRound size={15} />}
                >
                  <input
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)}
                    placeholder="e.g. Tata Steel"
                    className="input"
                  />
                </Field>

                <Field
                  label="Product"
                  icon={<Package size={15} />}
                >
                  <select
                    value={productId}
                    onChange={(e) => setProductId(e.target.value)}
                    className="input appearance-none"
                  >
                    <option value="">Select product</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} · {product.sku}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field
                  label="Warehouse"
                  icon={<Warehouse size={15} />}
                >
                  <select
                    value={warehouseId}
                    onChange={(e) => setWarehouseId(e.target.value)}
                    className="input appearance-none"
                  >
                    <option value="">Select warehouse</option>
                    {warehouses.map((warehouse) => (
                      <option key={warehouse.id} value={warehouse.id}>
                        {warehouse.name}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field
                  label={`Quantity${selectedProduct ? ` (${selectedProduct.unit})` : ""}`}
                  icon={<Hash size={15} />}
                >
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="Enter quantity"
                    className="input"
                  />
                </Field>

                {selectedProduct && quantity && warehouseId && (
                  <div className="rounded-xl border border-cyan-400/10 bg-cyan-400/[0.04] p-3 text-xs text-slate-400">
                    <div className="flex items-center justify-between">
                      <span>Incoming stock</span>
                      <span className="font-semibold text-cyan-300">
                        +{quantity} {selectedProduct.unit}
                      </span>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-white font-semibold text-black transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      Validating...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={17} />
                      Validate Receipt
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppShell>
  );
}

function Field({ label, icon, children }) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-400">
        {icon}
        {label}
      </span>
      {children}
    </label>
  );
}

function FlowCard({ number, title, description }) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="rounded-2xl border border-white/10 bg-white/[0.025] p-4"
    >
      <div className="mb-3 flex items-center gap-3">
        <span className="font-mono text-xs text-cyan-400">{number}</span>
        <span className="font-semibold text-white">{title}</span>
      </div>
      <p className="text-xs leading-5 text-slate-500">{description}</p>
    </motion.div>
  );
}

function formatDate(date) {
  if (!date) return "—";

  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
