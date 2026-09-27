import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  ScrollText,
  Search,
  RefreshCw,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  Scale,
  MapPin,
  Filter,
} from "lucide-react";
import AppShell from "../components/app/AppShell";
import { api } from "../lib/api";

const operationConfig = {
  RECEIPT: {
    label: "Receipt",
    icon: ArrowDownToLine,
    className: "text-emerald-300 bg-emerald-400/10 border-emerald-400/15",
    sign: "+",
  },
  DELIVERY: {
    label: "Delivery",
    icon: ArrowUpFromLine,
    className: "text-orange-300 bg-orange-400/10 border-orange-400/15",
    sign: "-",
  },
  TRANSFER: {
    label: "Transfer",
    icon: ArrowLeftRight,
    className: "text-violet-300 bg-violet-400/10 border-violet-400/15",
    sign: "â†’",
  },
  ADJUSTMENT: {
    label: "Adjustment",
    icon: Scale,
    className: "text-amber-300 bg-amber-400/10 border-amber-400/15",
    sign: "",
  },
};

export default function Ledger() {
  const [ledger, setLedger] = useState([]);
  const [warehouses, setWarehouses] = useState([]);

  const [search, setSearch] = useState("");
  const [operation, setOperation] = useState("all");
  const [warehouse, setWarehouse] = useState("all");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    try {
      setError("");

      const [ledgerData, warehouseData] = await Promise.all([
        api.getLedger(),
        api.getWarehouses(),
      ]);

      setLedger(ledgerData || []);
      setWarehouses(warehouseData || []);
    } catch (e) {
      setError(e.message || "Failed to load stock ledger.");
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

  const filteredLedger = useMemo(() => {
    const q = search.toLowerCase().trim();

    return ledger.filter((item) => {
      const matchesSearch =
        !q ||
        item.products?.name?.toLowerCase().includes(q) ||
        item.products?.sku?.toLowerCase().includes(q) ||
        item.notes?.toLowerCase().includes(q);

      const matchesOperation =
        operation === "all" || item.operation_type === operation;

      const matchesWarehouse =
        warehouse === "all" ||
        item.from_warehouse_id === warehouse ||
        item.to_warehouse_id === warehouse;

      return matchesSearch && matchesOperation && matchesWarehouse;
    });
  }, [ledger, search, operation, warehouse]);

  const stats = useMemo(() => {
    return {
      total: ledger.length,
      receipts: ledger.filter((x) => x.operation_type === "RECEIPT").length,
      deliveries: ledger.filter((x) => x.operation_type === "DELIVERY").length,
      transfers: ledger.filter((x) => x.operation_type === "TRANSFER").length,
      adjustments: ledger.filter((x) => x.operation_type === "ADJUSTMENT").length,
    };
  }, [ledger]);

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
                <ScrollText size={14} />
                Inventory Audit
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Stock Ledger
              </h1>

              <p className="mt-2 max-w-2xl text-sm text-slate-400">
                Complete chronological history of every inventory movement.
              </p>
            </div>

            <button
              onClick={refresh}
              disabled={refreshing}
              className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-slate-300 transition hover:bg-white/[0.08] disabled:opacity-50"
            >
              <RefreshCw
                size={15}
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </motion.div>

          {/* Stats */}
          <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-5">
            <Stat
              label="Total Movements"
              value={stats.total}
              icon={<ScrollText size={17} />}
            />

            <Stat
              label="Receipts"
              value={stats.receipts}
              icon={<ArrowDownToLine size={17} />}
              type="green"
            />

            <Stat
              label="Deliveries"
              value={stats.deliveries}
              icon={<ArrowUpFromLine size={17} />}
              type="orange"
            />

            <Stat
              label="Transfers"
              value={stats.transfers}
              icon={<ArrowLeftRight size={17} />}
              type="violet"
            />

            <Stat
              label="Adjustments"
              value={stats.adjustments}
              icon={<Scale size={17} />}
              type="amber"
            />
          </div>

          {/* Filters */}
          <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.035] p-3">
            <div className="flex flex-col gap-3 lg:flex-row">
              <div className="relative flex-1">
                <Search
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search product, SKU or operation notes..."
                  className="h-11 w-full rounded-xl border border-white/10 bg-black/30 pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/40"
                />
              </div>

              <FilterSelect
                value={operation}
                onChange={setOperation}
                icon={<Filter size={15} />}
                options={[
                  { value: "all", label: "All Operations" },
                  { value: "RECEIPT", label: "Receipts" },
                  { value: "DELIVERY", label: "Deliveries" },
                  { value: "TRANSFER", label: "Transfers" },
                  { value: "ADJUSTMENT", label: "Adjustments" },
                ]}
              />

              <FilterSelect
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
            </div>
          </div>

          {error && (
            <div className="mb-5 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {/* Ledger */}
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025]">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div>
                <h2 className="font-semibold text-white">
                  Movement Timeline
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  {filteredLedger.length} movement
                  {filteredLedger.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            {loading ? (
              <Loading />
            ) : filteredLedger.length === 0 ? (
              <div className="flex min-h-[320px] flex-col items-center justify-center text-center">
                <div className="mb-4 rounded-2xl bg-white/[0.04] p-4">
                  <ScrollText className="text-slate-500" />
                </div>

                <h3 className="font-semibold text-white">
                  No movements found
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Inventory operations will appear here automatically.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.06]">
                {filteredLedger.map((item, index) => (
                  <LedgerRow
                    key={item.id}
                    item={item}
                    index={index}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function LedgerRow({ item, index }) {
  const config =
    operationConfig[item.operation_type] || operationConfig.ADJUSTMENT;

  const Icon = config.icon;

  const difference =
    item.operation_type === "ADJUSTMENT"
      ? Number(item.quantity || 0)
      : null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.025 }}
      className="group px-5 py-4 transition hover:bg-white/[0.035]"
    >
      <div className="flex items-center gap-4">

        {/* Icon */}
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${config.className}`}
        >
          <Icon size={17} />
        </div>

        {/* Main */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
            <span className="font-semibold text-white">
              {item.products?.name || "Unknown Product"}
            </span>

            <span className="w-fit rounded-md bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] text-slate-500">
              {item.products?.sku || "â€”"}
            </span>

            <span
              className={`w-fit rounded-full border px-2 py-0.5 text-[10px] font-semibold ${config.className}`}
            >
              {config.label}
            </span>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
            {item.operation_type === "TRANSFER" ? (
              <>
                <span className="flex items-center gap-1.5">
                  <MapPin size={12} />
                  {item.from_warehouse?.name || "Unknown"}
                </span>

                <ArrowLeftRight
                  size={12}
                  className="text-violet-400"
                />

                <span className="flex items-center gap-1.5">
                  <MapPin size={12} />
                  {item.to_warehouse?.name || "Unknown"}
                </span>
              </>
            ) : (
              <span className="flex items-center gap-1.5">
                <MapPin size={12} />

                {item.to_warehouse?.name ||
                  item.from_warehouse?.name ||
                  "Unknown warehouse"}
              </span>
            )}

            {item.notes && (
              <span className="max-w-[400px] truncate">
                {item.notes}
              </span>
            )}
          </div>
        </div>

        {/* Quantity */}
        <div className="hidden text-right sm:block">
          <div
            className={`text-base font-bold ${
              item.operation_type === "RECEIPT"
                ? "text-emerald-300"
                : item.operation_type === "DELIVERY"
                ? "text-orange-300"
                : item.operation_type === "ADJUSTMENT" &&
                  difference < 0
                ? "text-red-300"
                : "text-slate-200"
            }`}
          >
            {item.operation_type === "RECEIPT" && "+"}
            {item.operation_type === "DELIVERY" && "-"}
            {item.operation_type === "ADJUSTMENT" &&
              difference > 0 &&
              "+"}
            {Number(item.quantity || 0).toLocaleString("en-IN")}
          </div>

          <div className="text-[10px] text-slate-600">
            units
          </div>
        </div>

        {/* Date */}
        <div className="hidden w-32 text-right lg:block">
          <div className="text-xs text-slate-400">
            {formatDate(item.created_at)}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Stat({ label, value, icon, type }) {
  const styles = {
    green: "text-emerald-300 bg-emerald-400/10",
    orange: "text-orange-300 bg-orange-400/10",
    violet: "text-violet-300 bg-violet-400/10",
    amber: "text-amber-300 bg-amber-400/10",
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="rounded-2xl border border-white/10 bg-white/[0.035] p-4"
    >
      <div
        className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl ${
          styles[type] || "bg-cyan-400/10 text-cyan-300"
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

function FilterSelect({ value, onChange, options, icon }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
        {icon}
      </span>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 min-w-[180px] appearance-none rounded-xl border border-white/10 bg-black/30 pl-9 pr-8 text-sm text-slate-300 outline-none focus:border-cyan-400/40"
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
    </div>
  );
}

function Loading() {
  return (
    <div className="divide-y divide-white/[0.06]">
      {[1, 2, 3, 4, 5].map((x) => (
        <div key={x} className="flex animate-pulse items-center gap-4 p-5">
          <div className="h-10 w-10 rounded-xl bg-white/[0.06]" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-48 rounded bg-white/[0.06]" />
            <div className="h-3 w-72 rounded bg-white/[0.04]" />
          </div>
          <div className="h-5 w-16 rounded bg-white/[0.06]" />
        </div>
      ))}
    </div>
  );
}

function formatDate(date) {
  if (!date) return "â€”";

  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

