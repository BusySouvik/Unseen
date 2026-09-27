import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  Warehouse as WarehouseIcon,
  Package,
  Boxes,
  MapPin,
  RefreshCw,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";
import AppShell from "../components/app/AppShell";
import { api } from "../lib/api";

export default function Warehouses() {
  const [warehouses, setWarehouses] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [warehouseName, setWarehouseName] = useState("");
  const [warehouseLocation, setWarehouseLocation] = useState("");

  const createWarehouse = async (e) => {
    e.preventDefault();

    if (!warehouseName.trim() || !warehouseLocation.trim()) {
      setError("Warehouse name and location are required.");
      return;
    }

    try {
      setCreating(true);
      setError("");

      await api.createWarehouse({
        name: warehouseName.trim(),
        location: warehouseLocation.trim(),
      });

      setWarehouseName("");
      setWarehouseLocation("");
      setShowCreate(false);

      await loadData();
    } catch (e) {
      setError(e.message || "Failed to create warehouse.");
    } finally {
      setCreating(false);
    }
  };

  const loadData = async () => {
    try {
      setError("");

      const [warehouseData, inventoryData, productData] =
        await Promise.all([
          api.getWarehouses(),
          api.getInventory(),
          api.getProducts(),
        ]);

      setWarehouses(warehouseData || []);
      setInventory(inventoryData || []);
      setProducts(productData || []);
    } catch (e) {
      setError(e.message || "Failed to load warehouses.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const productMap = useMemo(
    () => Object.fromEntries(products.map((p) => [p.id, p])),
    [products]
  );

  const warehouseStats = useMemo(() => {
    return warehouses.map((warehouse) => {
      const rows = inventory.filter(
        (item) => item.warehouse_id === warehouse.id
      );

      const totalUnits = rows.reduce(
        (sum, row) => sum + Number(row.quantity || 0),
        0
      );

      const activeProducts = rows.filter(
        (row) => Number(row.quantity || 0) > 0
      ).length;

      const lowStock = rows.filter((row) => {
        const product = productMap[row.product_id];
        return (
          Number(row.quantity || 0) > 0 &&
          Number(row.quantity || 0) <= Number(product?.reorder_level || 0)
        );
      }).length;

      return {
        ...warehouse,
        rows,
        totalUnits,
        activeProducts,
        lowStock,
      };
    });
  }, [warehouses, inventory, productMap]);

  const totalUnits = warehouseStats.reduce(
    (sum, warehouse) => sum + warehouse.totalUnits,
    0
  );

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
                <WarehouseIcon size={14} />
                Locations
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Warehouses
              </h1>

              <p className="mt-2 text-sm text-slate-400">
                Monitor inventory distribution across all storage locations.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                onClick={() => setShowCreate(true)}
                className="flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-white/90"
              >
                <WarehouseIcon size={15} />
                Add Warehouse
              </button>

              <button
                onClick={async () => {
                  setRefreshing(true);
                  await loadData();
                }}
                disabled={refreshing}
                className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-slate-300 transition hover:bg-white/[0.08] disabled:opacity-50"
              >
                <RefreshCw
                  size={15}
                  className={refreshing ? "animate-spin" : ""}
                />
                Refresh
              </button>
            </div>
          </motion.div>

          {showCreate && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0b0d12] p-6 shadow-2xl"
              >
                <div className="mb-6">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
                    <WarehouseIcon size={20} />
                  </div>

                  <h2 className="mt-4 text-xl font-semibold text-white">
                    Add Warehouse
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Create a storage location for this workspace.
                  </p>
                </div>

                <form onSubmit={createWarehouse} className="space-y-4">
                  <div>
                    <label className="mb-2 block text-xs font-medium text-slate-400">
                      Warehouse Name
                    </label>

                    <input
                      value={warehouseName}
                      onChange={(e) => setWarehouseName(e.target.value)}
                      placeholder="Main Warehouse"
                      required
                      className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/40"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-medium text-slate-400">
                      Location
                    </label>

                    <input
                      value={warehouseLocation}
                      onChange={(e) => setWarehouseLocation(e.target.value)}
                      placeholder="Central Storage"
                      required
                      className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/40"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreate(false);
                        setError("");
                      }}
                      className="flex-1 rounded-xl border border-white/10 bg-white/[0.04] py-3 text-sm text-slate-300 hover:bg-white/[0.08]"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={creating}
                      className="flex-1 rounded-xl bg-white py-3 text-sm font-semibold text-black disabled:opacity-50"
                    >
                      {creating ? "Creating..." : "Create Warehouse"}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}

          {/* Overview */}
          <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Stat
              label="Warehouses"
              value={warehouses.length}
              icon={<WarehouseIcon size={17} />}
            />

            <Stat
              label="Total Stock"
              value={formatNumber(totalUnits)}
              icon={<Boxes size={17} />}
            />

            <Stat
              label="Products"
              value={products.length}
              icon={<Package size={17} />}
            />

            <Stat
              label="Low Stock Locations"
              value={warehouseStats.reduce(
                (sum, warehouse) => sum + warehouse.lowStock,
                0
              )}
              icon={<AlertTriangle size={17} />}
              type="amber"
            />
          </div>

          {error && (
            <div className="mb-5 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {/* Warehouse cards */}
          {loading ? (
            <div className="grid gap-4 lg:grid-cols-3">
              {[1, 2, 3].map((x) => (
                <div
                  key={x}
                  className="h-72 animate-pulse rounded-2xl border border-white/10 bg-white/[0.03]"
                />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
              {warehouseStats.map((warehouse, index) => (
                <motion.div
                  key={warehouse.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  whileHover={{ y: -3 }}
                  className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] shadow-xl shadow-black/10"
                >
                  {/* Card header */}
                  <div className="border-b border-white/10 p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
                          <WarehouseIcon size={20} />
                        </div>

                        <div>
                          <h2 className="font-semibold text-white">
                            {warehouse.name}
                          </h2>

                          <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                            <MapPin size={11} />
                            {warehouse.location || "Location not specified"}
                          </div>
                        </div>
                      </div>

                      <span className="rounded-full border border-emerald-400/15 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-300">
                        ACTIVE
                      </span>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-px border-b border-white/10 bg-white/[0.04]">
                    <div className="bg-[#080a0e] p-4">
                      <div className="text-[10px] uppercase tracking-wider text-slate-600">
                        Stock
                      </div>
                      <div className="mt-1 text-xl font-bold text-white">
                        {formatNumber(warehouse.totalUnits)}
                      </div>
                    </div>

                    <div className="bg-[#080a0e] p-4">
                      <div className="text-[10px] uppercase tracking-wider text-slate-600">
                        Products
                      </div>
                      <div className="mt-1 text-xl font-bold text-white">
                        {warehouse.activeProducts}
                      </div>
                    </div>
                  </div>

                  {/* Inventory */}
                  <div className="p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Inventory
                      </span>

                      {warehouse.lowStock > 0 && (
                        <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-300">
                          <AlertTriangle size={11} />
                          {warehouse.lowStock} low
                        </span>
                      )}
                    </div>

                    {warehouse.rows.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-white/10 p-5 text-center text-xs text-slate-600">
                        No inventory assigned
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {warehouse.rows.slice(0, 4).map((row) => {
                          const product = productMap[row.product_id];
                          const quantity = Number(row.quantity || 0);
                          const reorder = Number(
                            product?.reorder_level || 0
                          );
                          const low =
                            quantity > 0 && quantity <= reorder;

                          return (
                            <div
                              key={row.id}
                              className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5"
                            >
                              <div className="flex min-w-0 items-center gap-2.5">
                                <Package
                                  size={14}
                                  className="shrink-0 text-slate-500"
                                />

                                <div className="min-w-0">
                                  <div className="truncate text-xs font-medium text-slate-300">
                                    {product?.name || "Unknown"}
                                  </div>

                                  <div className="font-mono text-[9px] text-slate-600">
                                    {product?.sku || ""}
                                  </div>
                                </div>
                              </div>

                              <div className="ml-3 shrink-0 text-right">
                                <div
                                  className={`text-sm font-semibold ${
                                    low
                                      ? "text-amber-300"
                                      : quantity === 0
                                      ? "text-red-300"
                                      : "text-white"
                                  }`}
                                >
                                  {formatNumber(quantity)}
                                </div>

                                <div className="text-[9px] text-slate-600">
                                  {product?.unit || "units"}
                                </div>
                              </div>
                            </div>
                          );
                        })}

                        {warehouse.rows.length > 4 && (
                          <div className="flex items-center justify-center gap-1 pt-2 text-[10px] text-slate-600">
                            + {warehouse.rows.length - 4} more products
                            <ArrowRight size={10} />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Location distribution */}
          {!loading && warehouseStats.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="mt-6 rounded-2xl border border-white/10 bg-white/[0.025] p-5"
            >
              <div className="mb-5">
                <h2 className="font-semibold text-white">
                  Stock Distribution
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Current inventory distribution by warehouse
                </p>
              </div>

              <div className="space-y-4">
                {warehouseStats.map((warehouse) => {
                  const percentage =
                    totalUnits > 0
                      ? (warehouse.totalUnits / totalUnits) * 100
                      : 0;

                  return (
                    <div key={warehouse.id}>
                      <div className="mb-2 flex items-center justify-between text-xs">
                        <span className="text-slate-300">
                          {warehouse.name}
                        </span>

                        <span className="text-slate-500">
                          {formatNumber(warehouse.totalUnits)} Â·{" "}
                          {percentage.toFixed(1)}%
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{
                            duration: 0.8,
                            delay: 0.2,
                          }}
                          className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function Stat({ label, value, icon, type }) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="rounded-2xl border border-white/10 bg-white/[0.035] p-4"
    >
      <div
        className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl ${
          type === "amber"
            ? "bg-amber-400/10 text-amber-300"
            : "bg-cyan-400/10 text-cyan-300"
        }`}
      >
        {icon}
      </div>

      <div className="text-2xl font-bold text-white">
        {value}
      </div>

      <div className="mt-1 text-xs text-slate-500">
        {label}
      </div>
    </motion.div>
  );
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  });
}

