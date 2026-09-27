import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  Package,
  RefreshCw,
  SlidersHorizontal,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Boxes,
  MapPin,
    ChevronDown,
  Plus,
  X,
} from "lucide-react";
import AppShell from "../components/app/AppShell";
import { api } from "../lib/api";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
    const [showAddProduct, setShowAddProduct] = useState(false);
  const [savingProduct, setSavingProduct] = useState(false);
  const [showEditProduct, setShowEditProduct] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);

  const [productForm, setProductForm] = useState({
    name: "",
    sku: "",
    category: "",
    unit: "",
    reorder_level: "",
  });

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [warehouse, setWarehouse] = useState("all");
  const [status, setStatus] = useState("all");

  const loadData = useCallback(async () => {
    try {
      setError("");
      const [productData, inventoryData, warehouseData] = await Promise.all([
        api.getProducts(),
        api.getInventory(),
        api.getWarehouses(),
      ]);

      setProducts(productData || []);
      setInventory(inventoryData || []);
      setWarehouses(warehouseData || []);
    } catch (err) {
      setError(err.message || "Failed to load products.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      void loadData();
    }, 0);

    return () => window.clearTimeout(handle);
  }, [loadData]);

  const refresh = async () => {
    setRefreshing(true);
    await loadData();
  };

    const handleCreateProduct = async (e) => {
    e.preventDefault();

    if (
      !productForm.name.trim() ||
      !productForm.sku.trim() ||
      !productForm.category.trim() ||
      !productForm.unit.trim()
    ) {
      setError("Please fill in all required product fields.");
      return;
    }

    try {
      setSavingProduct(true);
      setError("");

      await api.createProduct({
        name: productForm.name.trim(),
        sku: productForm.sku.trim(),
        category: productForm.category.trim(),
        unit: productForm.unit.trim(),
        reorder_level: Number(productForm.reorder_level || 0),
      });

      setProductForm({
        name: "",
        sku: "",
        category: "",
        unit: "",
        reorder_level: "",
      });

      setShowAddProduct(false);
      await loadData();
    } catch (err) {
      setError(err.message || "Failed to create product.");
    } finally {
      setSavingProduct(false);
    }
  };


  const handleUpdateProduct = async (e) => {
    e.preventDefault();

    if (
      !editingProductId ||
      !productForm.name.trim() ||
      !productForm.sku.trim() ||
      !productForm.category.trim() ||
      !productForm.unit.trim()
    ) {
      setError("Please fill in all required product fields.");
      return;
    }

    try {
      setSavingProduct(true);
      setError("");

      await api.updateProduct(editingProductId, {
        name: productForm.name.trim(),
        sku: productForm.sku.trim(),
        category: productForm.category.trim(),
        unit: productForm.unit.trim(),
        reorder_level: Number(productForm.reorder_level || 0),
      });

      setProductForm({
        name: "",
        sku: "",
        category: "",
        unit: "",
        reorder_level: "",
      });

      setEditingProductId(null);
      setShowEditProduct(false);

      await loadData();
    } catch (err) {
      setError(err.message || "Failed to update product.");
    } finally {
      setSavingProduct(false);
    }
  };

  const openEditProduct = (product) => {
    setError("");

    setEditingProductId(product.id);

    setProductForm({
      name: product.name || "",
      sku: product.sku || "",
      category: product.category || "",
      unit: product.unit || "",
      reorder_level: product.reorder_level ?? "",
    });

    setShowEditProduct(true);
  };

  const closeEditProduct = () => {
    if (savingProduct) return;

    setShowEditProduct(false);
    setEditingProductId(null);

    setProductForm({
      name: "",
      sku: "",
      category: "",
      unit: "",
      reorder_level: "",
    });
  };
  const warehouseMap = useMemo(
    () => Object.fromEntries(warehouses.map((w) => [w.id, w])),
    [warehouses]
  );

  const inventoryByProduct = useMemo(() => {
    const map = {};

    inventory.forEach((item) => {
      if (!map[item.product_id]) map[item.product_id] = [];
      map[item.product_id].push(item);
    });

    return map;
  }, [inventory]);

  const getProductStock = useCallback((product) => {
    const rows = inventoryByProduct[product.id] || [];

    return {
      total: rows.reduce((sum, row) => sum + Number(row.quantity || 0), 0),
      rows,
    };
  }, [inventoryByProduct]);

  const getStatus = useCallback((product) => {
    const { total } = getProductStock(product);
    const reorder = Number(product.reorder_level || 0);

    if (total <= 0) return "out";
    if (total <= reorder) return "low";
    return "healthy";
  }, [getProductStock]);

  const categories = [...new Set(products.map((p) => p.category).filter(Boolean))];

  const filteredProducts = products.filter((product) => {
    const query = search.toLowerCase().trim();

    const matchesSearch =
      !query ||
      product.name?.toLowerCase().includes(query) ||
      product.sku?.toLowerCase().includes(query);

    const matchesCategory =
      category === "all" || product.category === category;

    const productRows = inventoryByProduct[product.id] || [];

    const matchesWarehouse =
      warehouse === "all" ||
      productRows.some((row) => row.warehouse_id === warehouse);

    const matchesStatus =
      status === "all" || getStatus(product) === status;

    return (
      matchesSearch &&
      matchesCategory &&
      matchesWarehouse &&
      matchesStatus
    );
  });

  const stats = useMemo(() => {
    let healthy = 0;
    let low = 0;
    let out = 0;

    products.forEach((product) => {
      const s = getStatus(product);
      if (s === "healthy") healthy++;
      if (s === "low") low++;
      if (s === "out") out++;
    });

    return {
      total: products.length,
      healthy,
      low,
      out,
    };
  }, [products, getStatus]);

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
                <Package size={14} />
                Inventory
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Products
              </h1>

              <p className="mt-2 max-w-2xl text-sm text-slate-400">
                Manage products, monitor stock levels, and see where inventory
                is stored across your warehouses.
              </p>
            </div>

            <div className="flex items-center gap-3">
  <button
    onClick={() => {
      setError("");
      setShowAddProduct(true);
    }}
    className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 hover:shadow-lg hover:shadow-cyan-400/20"
  >
    <Plus size={16} />
    Add Product
  </button>

  <button
    onClick={refresh}
    disabled={refreshing}
    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-cyan-400/30 hover:bg-white/[0.07] disabled:opacity-50"
  >
    <RefreshCw
      size={16}
      className={refreshing ? "animate-spin" : ""}
    />
    Refresh
  </button>
</div>
          </motion.div>

          {/* Stats */}
          <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Stat
              label="Total Products"
              value={stats.total}
              icon={<Boxes size={18} />}
            />
            <Stat
              label="Healthy Stock"
              value={stats.healthy}
              icon={<CheckCircle2 size={18} />}
              type="healthy"
            />
            <Stat
              label="Low Stock"
              value={stats.low}
              icon={<AlertTriangle size={18} />}
              type="low"
            />
            <Stat
              label="Out of Stock"
              value={stats.out}
              icon={<XCircle size={18} />}
              type="out"
            />
          </div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="mb-6 rounded-2xl border border-white/10 bg-white/[0.035] p-3 shadow-2xl shadow-black/20 backdrop-blur-xl"
          >
            <div className="flex flex-col gap-3 xl:flex-row">
              <div className="relative flex-1">
                <Search
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search product name or SKU..."
                  className="h-11 w-full rounded-xl border border-white/10 bg-black/30 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/10"
                />
              </div>

              <Filter
                value={category}
                onChange={setCategory}
                icon={<SlidersHorizontal size={15} />}
                options={[
                  { value: "all", label: "All Categories" },
                  ...categories.map((c) => ({ value: c, label: c })),
                ]}
              />

              <Filter
                value={warehouse}
                onChange={setWarehouse}
                icon={<MapPin size={15} />}
                options={[
                  { value: "all", label: "All Warehouses" },
                  ...warehouses.map((w) => ({
                    value: w.id,
                    label: w.name,
                  })),
                ]}
              />

              <Filter
                value={status}
                onChange={setStatus}
                options={[
                  { value: "all", label: "All Stock" },
                  { value: "healthy", label: "Healthy" },
                  { value: "low", label: "Low Stock" },
                  { value: "out", label: "Out of Stock" },
                ]}
              />
            </div>
          </motion.div>

          {/* Error */}
          {error && (
            <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {/* Products */}
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] shadow-2xl shadow-black/20">
            <div className="border-b border-white/10 px-5 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-white">
                    Product Inventory
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    {filteredProducts.length} product
                    {filteredProducts.length !== 1 ? "s" : ""} displayed
                  </p>
                </div>
              </div>
            </div>

            {loading ? (
              <LoadingTable />
            ) : filteredProducts.length === 0 ? (
              <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">
                <div className="mb-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <Package className="text-slate-500" size={30} />
                </div>
                <h3 className="font-semibold text-white">
                  No products found
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Try changing your search or filters.
                </p>
              </div>
            ) : (
              <>
                {/* Desktop */}
                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full min-w-[900px]">
                    <thead>
                      <tr className="border-b border-white/10 text-left text-[11px] uppercase tracking-wider text-slate-500">
                        <th className="px-5 py-4 font-semibold">Product</th>
                        <th className="px-5 py-4 font-semibold">Category</th>
                        <th className="px-5 py-4 font-semibold">Stock</th>
                        <th className="px-5 py-4 font-semibold">
                          Reorder Level
                        </th>
                        <th className="px-5 py-4 font-semibold">
                          Locations
                        </th>
                        <th className="px-5 py-4 font-semibold">Status</th>
<th className="px-5 py-4 text-right font-semibold">Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      <AnimatePresence>
                        {filteredProducts.map((product, index) => {
                          const { total, rows } = getProductStock(product);
                          const productStatus = getStatus(product);

                          return (
                            <motion.tr
                              key={product.id}
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.025 }}
                              className="border-b border-white/[0.06] transition hover:bg-white/[0.035]"
                            >
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/10 bg-cyan-400/[0.07]">
                                    <Package
                                      size={18}
                                      className="text-cyan-300"
                                    />
                                  </div>
                                  <div>
                                    <div className="font-semibold text-white">
                                      {product.name}
                                    </div>
                                    <div className="mt-0.5 font-mono text-xs text-slate-500">
                                      {product.sku}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              <td className="px-5 py-4 text-sm text-slate-300">
                                {product.category || "-"}
                              </td>

                              <td className="px-5 py-4">
                                <span className="text-lg font-bold text-white">
                                  {formatNumber(total)}
                                </span>
                                <span className="ml-1 text-xs text-slate-500">
                                  {product.unit}
                                </span>
                              </td>

                              <td className="px-5 py-4 text-sm text-slate-400">
                                {formatNumber(product.reorder_level || 0)}{" "}
                                {product.unit}
                              </td>

                              <td className="px-5 py-4">
                                <div className="flex flex-wrap gap-1.5">
                                  {rows.length ? (
                                    rows.map((row) => (
                                      <span
                                        key={row.id}
                                        className="rounded-lg border border-white/10 bg-white/[0.035] px-2 py-1 text-xs text-slate-400"
                                      >
                                        {warehouseMap[row.warehouse_id]
                                          ?.name || "Unknown"}
                                        <span className="ml-1 text-slate-600">
                                          {" - "}{formatNumber(row.quantity)}
                                        </span>
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-xs text-slate-600">
                                      No location
                                    </span>
                                  )}
                                </div>
                              </td>

                              <td className="px-5 py-4">
                                <StatusBadge status={productStatus} />
                              </td>

                              <td className="px-5 py-4 text-right">
                                <button
                                  type="button"
                                  onClick={() => openEditProduct(product)}
                                  className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-cyan-400/30 hover:bg-cyan-400/10 hover:text-cyan-300"
                                >
                                  Edit
                                </button>
                              </td>
                            </motion.tr>
                          );
                        })}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>

                {/* Mobile */}
                <div className="divide-y divide-white/[0.06] md:hidden">
                  {filteredProducts.map((product, index) => {
                    const { total, rows } = getProductStock(product);
                    const productStatus = getStatus(product);

                    return (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.03 }}
                        className="p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-400/[0.07] text-cyan-300">
                              <Package size={18} />
                            </div>

                            <div>
                              <h3 className="font-semibold text-white">
                                {product.name}
                              </h3>
                              <p className="font-mono text-xs text-slate-500">
                                {product.sku}
                              </p>
                            </div>
                          </div>

                          <StatusBadge status={productStatus} />
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3">
                          <MiniMetric
                            label="Stock"
                            value={`${formatNumber(total)} ${product.unit}`}
                          />
                          <MiniMetric
                            label="Reorder"
                            value={`${formatNumber(
                              product.reorder_level || 0
                            )} ${product.unit}`}
                          />
                        </div>

                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {rows.map((row) => (
                            <span
                              key={row.id}
                              className="rounded-lg border border-white/10 px-2 py-1 text-xs text-slate-400"
                            >
                              {warehouseMap[row.warehouse_id]?.name ||
                                "Unknown"}{" "}
                              {" - "}{formatNumber(row.quantity)}
                            </span>
                          ))}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
        <AnimatePresence>
        {showEditProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) {
                closeEditProduct();
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              className="w-full max-w-lg rounded-2xl border border-white/10 bg-slate-950 p-6 shadow-2xl shadow-black/50"
            >
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-400">
                    <Package size={14} />
                    Inventory
                  </div>

                  <h2 className="text-xl font-bold text-white">
                    Edit Product
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Update product information and reorder settings.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeEditProduct}
                  className="rounded-lg p-2 text-slate-500 transition hover:bg-white/5 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleUpdateProduct} className="space-y-4">
                <FormField
                  label="Product Name"
                  required
                  value={productForm.name}
                  onChange={(value) =>
                    setProductForm((p) => ({ ...p, name: value }))
                  }
                  placeholder="e.g. Steel Rods"
                />

                <FormField
                  label="SKU / Code"
                  required
                  value={productForm.sku}
                  onChange={(value) =>
                    setProductForm((p) => ({ ...p, sku: value }))
                  }
                  placeholder="e.g. STL-001"
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    label="Category"
                    required
                    value={productForm.category}
                    onChange={(value) =>
                      setProductForm((p) => ({ ...p, category: value }))
                    }
                    placeholder="e.g. Raw Material"
                  />

                  <FormField
                    label="Unit"
                    required
                    value={productForm.unit}
                    onChange={(value) =>
                      setProductForm((p) => ({ ...p, unit: value }))
                    }
                    placeholder="e.g. kg, pcs, bags"
                  />
                </div>

                <FormField
                  label="Reorder Level"
                  value={productForm.reorder_level}
                  onChange={(value) =>
                    setProductForm((p) => ({
                      ...p,
                      reorder_level: value,
                    }))
                  }
                  placeholder="e.g. 20"
                  type="number"
                />

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={closeEditProduct}
                    disabled={savingProduct}
                    className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/5 disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={savingProduct}
                    className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-5 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {savingProduct && (
                      <RefreshCw size={15} className="animate-spin" />
                    )}

                    {savingProduct ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
        {showAddProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) {
                setShowAddProduct(false);
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              className="w-full max-w-lg rounded-2xl border border-white/10 bg-slate-950 p-6 shadow-2xl shadow-black/50"
            >
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-400">
                    <Package size={14} />
                    Inventory
                  </div>

                  <h2 className="text-xl font-bold text-white">
                    Add New Product
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Create a product in your inventory database.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddProduct(false)}
                  className="rounded-lg p-2 text-slate-500 transition hover:bg-white/5 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateProduct} className="space-y-4">
                <FormField
                  label="Product Name"
                  required
                  value={productForm.name}
                  onChange={(value) =>
                    setProductForm((p) => ({ ...p, name: value }))
                  }
                  placeholder="e.g. Steel Rods"
                />

                <FormField
                  label="SKU / Code"
                  required
                  value={productForm.sku}
                  onChange={(value) =>
                    setProductForm((p) => ({ ...p, sku: value }))
                  }
                  placeholder="e.g. STL-001"
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    label="Category"
                    required
                    value={productForm.category}
                    onChange={(value) =>
                      setProductForm((p) => ({ ...p, category: value }))
                    }
                    placeholder="e.g. Raw Material"
                  />

                  <FormField
                    label="Unit"
                    required
                    value={productForm.unit}
                    onChange={(value) =>
                      setProductForm((p) => ({ ...p, unit: value }))
                    }
                    placeholder="e.g. kg, pcs, bags"
                  />
                </div>

                <FormField
                  label="Reorder Level"
                  value={productForm.reorder_level}
                  onChange={(value) =>
                    setProductForm((p) => ({
                      ...p,
                      reorder_level: value,
                    }))
                  }
                  placeholder="e.g. 20"
                  type="number"
                />

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowAddProduct(false)}
                    className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/5"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={savingProduct}
                    className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-5 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {savingProduct && (
                      <RefreshCw size={15} className="animate-spin" />
                    )}
                    {savingProduct ? "Creating..." : "Create Product"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppShell>
  );
}

function Stat({ label, value, icon, type }) {
  const iconClass =
    type === "healthy"
      ? "text-emerald-300 bg-emerald-400/10"
      : type === "low"
      ? "text-amber-300 bg-amber-400/10"
      : type === "out"
      ? "text-red-300 bg-red-400/10"
      : "text-cyan-300 bg-cyan-400/10";

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 backdrop-blur-xl"
    >
      <div
        className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl ${iconClass}`}
      >
        {icon}
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="mt-1 text-xs text-slate-500">{label}</div>
    </motion.div>
  );
}

function Filter({ value, onChange, options, icon }) {
  return (
    <div className="relative">
      {icon && (
        <span className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-slate-500">
          {icon}
        </span>
      )}

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`h-11 min-w-[170px] appearance-none rounded-xl border border-white/10 bg-black/30 pr-9 text-sm text-slate-300 outline-none focus:border-cyan-400/40 ${
          icon ? "pl-9" : "pl-3"
        }`}
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            className="bg-slate-950"
          >
            {option.label}
          </option>
        ))}
      </select>

      <ChevronDown
        size={15}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-600"
      />
    </div>
  );
}

function StatusBadge({ status }) {
  const data = {
    healthy: {
      label: "Healthy",
      icon: CheckCircle2,
      className:
        "border-emerald-400/15 bg-emerald-400/10 text-emerald-300",
    },
    low: {
      label: "Low Stock",
      icon: AlertTriangle,
      className: "border-amber-400/15 bg-amber-400/10 text-amber-300",
    },
    out: {
      label: "Out of Stock",
      icon: XCircle,
      className: "border-red-400/15 bg-red-400/10 text-red-300",
    },
  };

  const item = data[status];
  const Icon = item.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${item.className}`}
    >
      <Icon size={13} />
      {item.label}
    </span>
  );
}

function MiniMetric({ label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.025] p-3">
      <div className="text-[10px] uppercase tracking-wider text-slate-600">
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold text-slate-200">{value}</div>
    </div>
  );
}

function LoadingTable() {
  return (
    <div className="divide-y divide-white/[0.06]">
      {[1, 2, 3, 4, 5].map((x) => (
        <div key={x} className="flex animate-pulse items-center gap-5 p-5">
          <div className="h-10 w-10 rounded-xl bg-white/[0.06]" />
          <div className="h-4 w-40 rounded bg-white/[0.06]" />
          <div className="h-4 w-24 rounded bg-white/[0.06]" />
          <div className="ml-auto h-4 w-20 rounded bg-white/[0.06]" />
        </div>
      ))}
    </div>
  );
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  });
}

function FormField({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  type = "text",
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
        {required && (
          <span className="ml-1 text-cyan-400">*</span>
        )}
      </span>

      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        min={type === "number" ? "0" : undefined}
        className="h-11 w-full rounded-xl border border-white/10 bg-black/30 px-3.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/10"
      />
    </label>
  );
}





