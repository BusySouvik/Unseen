import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  Activity,
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpRight,
  Boxes,
  Package,
  RefreshCw,
  Truck,
  Warehouse,
  ArrowLeftRight,
  SlidersHorizontal,
} from "lucide-react";

import AppShell from "../components/app/AppShell";
import KpiCard from "../components/app/KpiCard";
import { api } from "../lib/api";

function formatNumber(value) {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2,
  }).format(value || 0);
}

function operationLabel(type) {
  const labels = {
    RECEIPT: "Receipt",
    DELIVERY: "Delivery",
    TRANSFER: "Transfer",
    ADJUSTMENT: "Adjustment",
  };

  return labels[type] || type;
}

function operationIcon(type) {
  if (type === "RECEIPT") return ArrowDownToLine;
  if (type === "DELIVERY") return Truck;
  if (type === "TRANSFER") return ArrowLeftRight;
  return SlidersHorizontal;
}

export default function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const [
        dashboardResponse,
        inventoryResponse,
        ledgerResponse,
      ] = await Promise.all([
        api.getDashboard(),
        api.getInventory(),
        api.getLedger(),
      ]);

      setDashboard(dashboardResponse.data);
      setInventory(inventoryResponse.data || []);
      setLedger(ledgerResponse.data || []);
    } catch (err) {
      setError(err.message || "Unable to load dashboard.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      void loadDashboard();
    }, 0);

    return () => window.clearTimeout(handle);
  }, [loadDashboard]);

  const lowStockItems = useMemo(() => {
    return inventory
      .filter((item) => {
        const quantity = Number(item.quantity || 0);
        const reorder = Number(
          item.products?.reorder_level || 0
        );

        return quantity <= reorder;
      })
      .sort(
        (a, b) =>
          Number(a.quantity) - Number(b.quantity)
      )
      .slice(0, 5);
  }, [inventory]);

  const recentLedger = ledger.slice(0, 6);

  if (loading) {
    return (
      <AppShell>
        <div className="px-10 py-8 space-y-6">

          <div className="h-24 animate-pulse rounded-2xl bg-white/[0.035]" />

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-32 animate-pulse rounded-2xl bg-white/[0.035]"
              />
            ))}
          </div>

          <div className="grid gap-5 xl:grid-cols-[1.4fr_0.8fr]">
            <div className="h-[400px] animate-pulse rounded-2xl bg-white/[0.035]" />
            <div className="h-[400px] animate-pulse rounded-2xl bg-white/[0.035]" />
          </div>

        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="px-10 py-8">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <motion.div
        initial={{
          opacity: 0,
          y: 10,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"
      >

        <div>

          <div className="mb-3 flex items-center gap-2">

            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.7)]" />

            <span className="text-[9px] font-semibold tracking-[0.2em] text-emerald-300">
              LIVE INVENTORY
            </span>

          </div>

          <h1 className="text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">
            Inventory overview
          </h1>

          <p className="mt-2 text-sm text-white/30">
            Your warehouse operation at a glance.
          </p>

        </div>


        <button
          onClick={() => loadDashboard(true)}
          disabled={refreshing}
          className="flex w-fit items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 py-2.5 text-xs text-white/45 transition hover:bg-white/[0.05] hover:text-white disabled:opacity-50"
        >
          <RefreshCw
            size={14}
            className={
              refreshing ? "animate-spin" : ""
            }
          />

          Refresh data
        </button>

      </motion.div>


      {/* Error */}

      {error && (

        <div className="mb-5 rounded-xl border border-red-400/20 bg-red-400/[0.05] px-4 py-3 text-xs text-red-300">
          {error}
        </div>

      )}


      {/* =====================================================
          KPI GRID
      ===================================================== */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <KpiCard
          label="Total stock"
          value={formatNumber(dashboard?.total_stock)}
          icon={Boxes}
          detail={`${dashboard?.total_products || 0} products tracked`}
          accent="indigo"
          delay={0}
        />

        <KpiCard
          label="Low stock"
          value={formatNumber(dashboard?.low_stock)}
          icon={AlertTriangle}
          detail={`${dashboard?.out_of_stock || 0} completely out`}
          accent={
            dashboard?.low_stock
              ? "amber"
              : "emerald"
          }
          delay={0.05}
        />

        <KpiCard
          label="Pending receipts"
          value={formatNumber(
            dashboard?.pending_receipts
          )}
          icon={ArrowDownToLine}
          detail="Awaiting validation"
          accent="cyan"
          delay={0.1}
        />

        <KpiCard
          label="Pending deliveries"
          value={formatNumber(
            dashboard?.pending_deliveries
          )}
          icon={Truck}
          detail="Awaiting fulfillment"
          accent="red"
          delay={0.15}
        />

      </div>


      {/* =====================================================
          SECONDARY METRICS
      ===================================================== */}

      <div className="mt-4 grid gap-4 sm:grid-cols-3">

        <motion.div
          initial={{
            opacity: 0,
            y: 10,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-between rounded-2xl border border-white/[0.07] bg-white/[0.02] px-5 py-4"
        >

          <div className="flex items-center gap-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-400/10 text-violet-300">
              <ArrowLeftRight size={16} />
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-wider text-white/25">
                Internal transfers
              </p>

              <p className="mt-1 text-lg font-semibold">
                {dashboard?.internal_transfers_scheduled || 0}
              </p>
            </div>

          </div>

          <ArrowUpRight
            size={15}
            className="text-white/20"
          />

        </motion.div>


        <div className="flex items-center justify-between rounded-2xl border border-white/[0.07] bg-white/[0.02] px-5 py-4">

          <div className="flex items-center gap-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
              <Warehouse size={16} />
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-wider text-white/25">
                Warehouses
              </p>

              <p className="mt-1 text-lg font-semibold">
                {new Set(
                  inventory.map(
                    (item) => item.warehouse_id
                  )
                ).size}
              </p>
            </div>

          </div>

          <ArrowUpRight
            size={15}
            className="text-white/20"
          />

        </div>


        <div className="flex items-center justify-between rounded-2xl border border-white/[0.07] bg-white/[0.02] px-5 py-4">

          <div className="flex items-center gap-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
              <Activity size={16} />
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-wider text-white/25">
                Ledger movements
              </p>

              <p className="mt-1 text-lg font-semibold">
                {ledger.length}
              </p>
            </div>

          </div>

          <ArrowUpRight
            size={15}
            className="text-white/20"
          />

        </div>

      </div>


      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.4fr_0.8fr]">


        {/* STOCK OVERVIEW */}

        <motion.section
          initial={{
            opacity: 0,
            y: 15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{ delay: 0.25 }}
          className="overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.02]"
        >

          <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">

            <div>

              <h2 className="text-sm font-semibold">
                Stock by location
              </h2>

              <p className="mt-1 text-[10px] text-white/25">
                Current inventory across warehouses
              </p>

            </div>

            <Warehouse
              size={16}
              className="text-white/20"
            />

          </div>


          <div className="overflow-x-auto">

            <table className="w-full text-left">

              <thead>

                <tr className="border-b border-white/[0.05] text-[9px] uppercase tracking-wider text-white/20">

                  <th className="px-5 py-3 font-medium">
                    Product
                  </th>

                  <th className="px-5 py-3 font-medium">
                    Location
                  </th>

                  <th className="px-5 py-3 font-medium">
                    Stock
                  </th>

                  <th className="px-5 py-3 font-medium">
                    Status
                  </th>

                </tr>

              </thead>

              <tbody>

                {inventory.slice(0, 8).map(
                  (item, index) => {

                    const quantity = Number(
                      item.quantity || 0
                    );

                    const reorder = Number(
                      item.products?.reorder_level || 0
                    );

                    const out =
                      quantity === 0;

                    const low =
                      !out && quantity <= reorder;

                    return (
                      <motion.tr
                        key={item.id}
                        initial={{
                          opacity: 0,
                        }}
                        animate={{
                          opacity: 1,
                        }}
                        transition={{
                          delay:
                            0.3 + index * 0.04,
                        }}
                        className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02]"
                      >

                        <td className="px-5 py-3.5">

                          <div className="flex items-center gap-3">

                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.045] text-white/40">
                              <Package size={14} />
                            </div>

                            <div>

                              <p className="text-xs font-medium">
                                {item.products?.name ||
                                  "Unknown product"}
                              </p>

                              <p className="mt-0.5 text-[9px] text-white/20">
                                {item.products?.sku || "â€”"}
                              </p>

                            </div>

                          </div>

                        </td>


                        <td className="px-5 py-3.5 text-xs text-white/35">

                          {item.warehouses?.name ||
                            "Unknown"}

                        </td>


                        <td className="px-5 py-3.5">

                          <span className="text-sm font-medium">
                            {formatNumber(quantity)}
                          </span>

                          <span className="ml-1 text-[9px] text-white/20">
                            {item.products?.unit || ""}
                          </span>

                        </td>


                        <td className="px-5 py-3.5">

                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-[9px] ${
                              out
                                ? "bg-red-400/10 text-red-300"
                                : low
                                ? "bg-amber-400/10 text-amber-300"
                                : "bg-emerald-400/10 text-emerald-300"
                            }`}
                          >
                            {out
                              ? "Out of stock"
                              : low
                              ? "Low stock"
                              : "Healthy"}
                          </span>

                        </td>

                      </motion.tr>
                    );
                  }
                )}

              </tbody>

            </table>

            {inventory.length === 0 && (
              <div className="px-5 py-16 text-center text-xs text-white/25">
                No inventory records yet.
              </div>
            )}

          </div>

        </motion.section>


        {/* LOW STOCK */}

        <motion.section
          initial={{
            opacity: 0,
            y: 15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border border-white/[0.07] bg-white/[0.02]"
        >

          <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">

            <div>

              <h2 className="text-sm font-semibold">
                Attention required
              </h2>

              <p className="mt-1 text-[10px] text-white/25">
                Products at or below reorder level
              </p>

            </div>

            <AlertTriangle
              size={16}
              className="text-amber-300/70"
            />

          </div>


          <div className="p-4">

            {lowStockItems.length === 0 ? (

              <div className="flex min-h-[250px] flex-col items-center justify-center text-center">

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300">
                  <Package size={20} />
                </div>

                <p className="mt-4 text-sm font-medium">
                  Inventory looks healthy
                </p>

                <p className="mt-2 max-w-[220px] text-[10px] leading-5 text-white/25">
                  No products are currently below their reorder level.
                </p>

              </div>

            ) : (

              <div className="space-y-2">

                {lowStockItems.map((item) => {

                  const quantity = Number(
                    item.quantity || 0
                  );

                  const reorder = Number(
                    item.products?.reorder_level || 0
                  );

                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-xl border border-white/[0.05] bg-white/[0.02] p-3"
                    >

                      <div className="flex items-center gap-3">

                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400/10 text-amber-300">
                          <AlertTriangle size={14} />
                        </div>

                        <div>

                          <p className="text-xs font-medium">
                            {item.products?.name}
                          </p>

                          <p className="mt-0.5 text-[9px] text-white/20">
                            Reorder at {formatNumber(reorder)}
                          </p>

                        </div>

                      </div>

                      <span className="text-xs font-semibold text-amber-300">
                        {formatNumber(quantity)}
                      </span>

                    </div>
                  );
                })}

              </div>

            )}

          </div>

        </motion.section>

      </div>


      {/* =====================================================
          RECENT ACTIVITY
      ===================================================== */}

      <motion.section
        initial={{
          opacity: 0,
          y: 15,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{ delay: 0.35 }}
        className="mt-5 rounded-2xl border border-white/[0.07] bg-white/[0.02]"
      >

        <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">

          <div>

            <h2 className="text-sm font-semibold">
              Recent stock activity
            </h2>

            <p className="mt-1 text-[10px] text-white/25">
              Latest movements recorded in the stock ledger
            </p>

          </div>

          <Activity
            size={16}
            className="text-white/20"
          />

        </div>


        <div className="divide-y divide-white/[0.04]">

          {recentLedger.map((item, index) => {

            const Icon = operationIcon(
              item.operation_type
            );

            const positive =
              item.operation_type === "RECEIPT";

            return (
              <motion.div
                key={item.id}
                initial={{
                  opacity: 0,
                  x: -10,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                transition={{
                  delay:
                    0.4 + index * 0.05,
                }}
                className="flex items-center justify-between px-5 py-3.5"
              >

                <div className="flex items-center gap-3">

                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.045] text-white/40">
                    <Icon size={14} />
                  </div>

                  <div>

                    <p className="text-xs font-medium">
                      {operationLabel(
                        item.operation_type
                      )}
                      {" Â· "}
                      {item.products?.name ||
                        "Product"}
                    </p>

                    <p className="mt-0.5 text-[9px] text-white/20">
                      {item.notes ||
                        "Stock movement recorded"}
                    </p>

                  </div>

                </div>


                <div className="text-right">

                  <p
                    className={`text-xs font-semibold ${
                      positive
                        ? "text-emerald-300"
                        : "text-white/65"
                    }`}
                  >
                    {positive ? "+" : ""}
                    {formatNumber(item.quantity)}
                  </p>

                  <p className="mt-0.5 text-[9px] text-white/20">
                    {item.created_at
                      ? new Date(
                          item.created_at
                        ).toLocaleDateString(
                          "en-IN"
                        )
                      : ""}
                  </p>

                </div>

              </motion.div>
            );
          })}

          {recentLedger.length === 0 && (
            <div className="px-5 py-12 text-center text-xs text-white/25">
              No stock movements recorded yet.
            </div>
          )}

        </div>

      </motion.section>


      {/* Footer */}

      <div className="mt-8 flex items-center justify-between text-[9px] text-white/15">

        <span>
          StockSense Inventory OS
        </span>

        <span>
          Live data Â· Supabase
        </span>

      </div>

      </div>
    </AppShell>
  );
}




