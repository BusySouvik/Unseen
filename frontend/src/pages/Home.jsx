import { motion } from "motion/react";
import {
  ArrowRight,
  Boxes,
  CheckCircle2,
  Package,
  Warehouse,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  BarChart3,
  Activity,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Navbar1 } from "../components/ui/navbar-1";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050505] text-white">

      {/* ================= BACKGROUND ================= */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">

        <motion.div
          animate={{
            x: [0, 100, -50, 0],
            y: [0, -60, 40, 0],
            scale: [1, 1.12, 0.96, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute left-[-180px] top-[-220px] h-[600px] w-[600px] rounded-full bg-indigo-600/[0.13] blur-[140px]"
        />

        <motion.div
          animate={{
            x: [0, -80, 40, 0],
            y: [0, 50, -30, 0],
            scale: [1, 0.95, 1.08, 1],
          }}
          transition={{
            duration: 23,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute right-[-200px] top-[20%] h-[600px] w-[600px] rounded-full bg-cyan-500/[0.08] blur-[150px]"
        />

        <motion.div
          animate={{
            x: [0, 50, -30, 0],
            y: [0, -30, 50, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-[-250px] left-[25%] h-[500px] w-[500px] rounded-full bg-violet-600/[0.07] blur-[150px]"
        />

        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />

      </div>


      {/* ================= NAVBAR ================= */}

      <div className="relative z-50">
        <Navbar1 />
      </div>


      {/* ================= HERO ================= */}

      <main className="relative z-10 pt-10">

        <section
          id="home"
          className="mx-auto grid max-w-7xl items-center gap-12 px-5 pb-16 pt-10 lg:grid-cols-[0.9fr_1.1fr] lg:px-8"
        >

          {/* Hero copy */}

          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >

            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-4 py-2 text-xs text-white/50 backdrop-blur-xl">

              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]" />

              Intelligent inventory management

            </div>


            <h1 className="max-w-3xl text-5xl font-semibold leading-[0.98] tracking-[-0.055em] sm:text-6xl lg:text-[76px]">

              Know your inventory.

              <span className="block bg-gradient-to-r from-indigo-300 via-violet-400 to-cyan-300 bg-clip-text text-transparent">
                Move with confidence.
              </span>

            </h1>


            <p className="mt-7 max-w-xl text-base leading-7 text-white/40 sm:text-lg">
              StockSense connects products, warehouses, receipts,
              deliveries, transfers and adjustments into one intelligent
              inventory workspace.
            </p>


            <div className="mt-8 flex flex-wrap gap-3">

              <Link
                to="/login"
                className="group inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-sm font-semibold text-black transition hover:scale-[1.02] hover:bg-white/90"
              >
                Enter StockSense

                <ArrowRight
                  size={17}
                  className="transition-transform group-hover:translate-x-1"
                />

              </Link>


              <a
                href="#workflow"
                className="inline-flex items-center rounded-2xl border border-white/10 bg-white/[0.025] px-6 py-3.5 text-sm text-white/60 transition hover:border-white/20 hover:bg-white/[0.05] hover:text-white"
              >
                Explore workflow
              </a>

            </div>


            <div className="mt-8 flex flex-wrap gap-x-7 gap-y-3">

              {[
                "Real-time stock",
                "Multi-warehouse",
                "Complete ledger",
              ].map((item) => (

                <div
                  key={item}
                  className="flex items-center gap-2 text-xs text-white/35"
                >
                  <CheckCircle2
                    size={16}
                    className="text-emerald-400"
                  />
                  {item}
                </div>

              ))}

            </div>

          </motion.div>


          {/* Dashboard preview */}

          <motion.div
            initial={{ opacity: 0, x: 35, scale: 0.97 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{
              duration: 0.9,
              delay: 0.15,
            }}
            className="relative"
          >

            <motion.div
              animate={{
                y: [0, -8, 0],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="overflow-hidden rounded-[28px] border border-white/10 bg-[#090909]/90 p-2 shadow-2xl shadow-indigo-950/20 backdrop-blur-xl"
            >

              <div className="overflow-hidden rounded-[22px] border border-white/[0.07] bg-[#0c0c0c]">

                {/* Window bar */}

                <div className="flex h-11 items-center justify-between border-b border-white/[0.07] px-5">

                  <div className="flex gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
                    <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/70" />
                    <span className="h-2.5 w-2.5 rounded-full bg-green-400/70" />
                  </div>

                  <span className="text-[9px] tracking-[0.25em] text-white/20">
                    STOCKSENSE
                  </span>

                  <div className="w-8" />

                </div>


                <div className="p-5 sm:p-6">

                  <div className="flex items-center justify-between">

                    <div>
                      <p className="text-[9px] tracking-[0.2em] text-white/25">
                        INVENTORY OVERVIEW
                      </p>

                      <h3 className="mt-2 text-lg font-medium">
                        Warehouse health
                      </h3>
                    </div>

                    <div className="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/[0.06] px-3 py-1.5 text-[10px] text-emerald-300">

                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

                      Live

                    </div>

                  </div>


                  {/* KPIs */}

                  <div className="mt-5 grid grid-cols-2 gap-2.5">

                    {[
                      {
                        icon: Package,
                        label: "Total Stock",
                        value: "12,840",
                      },
                      {
                        icon: Boxes,
                        label: "Products",
                        value: "248",
                      },
                      {
                        icon: Warehouse,
                        label: "Warehouses",
                        value: "03",
                      },
                      {
                        icon: Activity,
                        label: "Movements",
                        value: "+18.4%",
                      },
                    ].map((item) => {

                      const Icon = item.icon;

                      return (
                        <motion.div
                          key={item.label}
                          whileHover={{ y: -2 }}
                          className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4"
                        >

                          <div className="flex items-center gap-2 text-xs text-white/30">

                            <Icon size={14} />

                            {item.label}

                          </div>

                          <p className="mt-5 text-2xl font-medium tracking-tight">
                            {item.value}
                          </p>

                        </motion.div>
                      );

                    })}

                  </div>


                  {/* Chart */}

                  <div className="mt-3 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">

                    <div className="flex items-center justify-between">

                      <div>
                        <p className="text-[10px] text-white/25">
                          Stock movement
                        </p>

                        <p className="mt-1 text-sm font-medium">
                          Operational activity
                        </p>
                      </div>

                      <span className="rounded-lg bg-emerald-400/[0.08] px-2 py-1 text-[9px] text-emerald-300">
                        +12.8%
                      </span>

                    </div>


                    <div className="mt-5 flex h-24 items-end gap-1">

                      {[35, 50, 40, 61, 46, 68, 55, 78, 63, 88, 70, 94].map(
                        (height, index) => (

                          <motion.div
                            key={index}
                            initial={{ height: 0 }}
                            animate={{ height: `${height}%` }}
                            transition={{
                              duration: 0.8,
                              delay: index * 0.04,
                            }}
                            className="flex-1 rounded-t-md bg-gradient-to-t from-indigo-500/30 to-cyan-300/90"
                          />

                        )
                      )}

                    </div>

                  </div>


                  {/* Recent activity */}

                  <div className="mt-3 flex items-center justify-between rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">

                    <div className="flex items-center gap-3">

                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-300">
                        <ArrowDownToLine size={16} />
                      </div>

                      <div>
                        <p className="text-xs font-medium">
                          Steel Rods received
                        </p>

                        <p className="mt-1 text-[9px] text-white/25">
                          Main Warehouse
                        </p>
                      </div>

                    </div>

                    <span className="text-xs font-medium text-emerald-300">
                      +100 kg
                    </span>

                  </div>

                </div>

              </div>

            </motion.div>

          </motion.div>

        </section>


        {/* ================= TRUST STRIP ================= */}

        <section className="border-y border-white/[0.06] bg-white/[0.015]">

          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-12 gap-y-4 px-5 py-5 text-[11px] text-white/25 sm:justify-between lg:px-8">

            <span>REAL-TIME INVENTORY</span>
            <span>MULTI-WAREHOUSE</span>
            <span>SMART FILTERS</span>
            <span>STOCK LEDGER</span>
            <span>LOW STOCK ALERTS</span>

          </div>

        </section>


        {/* ================= FEATURES ================= */}

        <section
          id="features"
          className="mx-auto max-w-7xl px-5 py-16 lg:px-8"
        >

          <div className="max-w-2xl">

            <p className="text-[10px] font-semibold tracking-[0.2em] text-indigo-400">
              EVERYTHING CONNECTED
            </p>

            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              One workspace for every movement.
            </h2>

            <p className="mt-4 text-sm leading-6 text-white/35">
              From receiving raw materials to final delivery, every
              inventory event stays connected and traceable.
            </p>

          </div>


          <div className="mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

            {[
              {
                icon: Package,
                title: "Products",
                text: "Centralize SKUs, categories, units and reorder levels.",
              },
              {
                icon: ArrowDownToLine,
                title: "Receipts",
                text: "Receive stock and update quantities automatically.",
              },
              {
                icon: ArrowUpFromLine,
                title: "Deliveries",
                text: "Pick, pack and reduce available stock with confidence.",
              },
              {
                icon: ArrowLeftRight,
                title: "Transfers",
                text: "Move inventory between warehouses without losing history.",
              },
            ].map((item) => {

              const Icon = item.icon;

              return (
                <motion.div
                  key={item.title}
                  whileHover={{
                    y: -5,
                    borderColor: "rgba(255,255,255,0.16)",
                  }}
                  className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 transition"
                >

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-300">
                    <Icon size={18} />
                  </div>

                  <h3 className="mt-5 text-sm font-medium">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-xs leading-5 text-white/30">
                    {item.text}
                  </p>

                </motion.div>
              );

            })}

          </div>

        </section>


        {/* ================= WORKFLOW ================= */}

        <section
          id="workflow"
          className="border-y border-white/[0.06] bg-white/[0.015]"
        >

          <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">

            <div className="text-center">

              <p className="text-[10px] font-semibold tracking-[0.2em] text-cyan-400">
                SIMPLE FLOW
              </p>

              <h2 className="mt-3 text-3xl font-semibold tracking-tight">
                Every stock movement, accounted for.
              </h2>

            </div>


            <div className="mt-10 grid gap-3 md:grid-cols-4">

              {[
                ["01", "Receive", "Stock enters the warehouse."],
                ["02", "Transfer", "Move stock between locations."],
                ["03", "Deliver", "Stock leaves for the customer."],
                ["04", "Reconcile", "Physical counts stay accurate."],
              ].map(([number, title, text]) => (

                <motion.div
                  key={number}
                  whileHover={{ y: -4 }}
                  className="rounded-2xl border border-white/[0.07] bg-black/30 p-6"
                >

                  <span className="text-xs text-indigo-400">
                    {number}
                  </span>

                  <h3 className="mt-8 text-base font-medium">
                    {title}
                  </h3>

                  <p className="mt-2 text-xs leading-5 text-white/30">
                    {text}
                  </p>

                </motion.div>

              ))}

            </div>

          </div>

        </section>


        {/* ================= ANALYTICS ================= */}

        <section
          id="analytics"
          className="mx-auto max-w-7xl px-5 py-16 lg:px-8"
        >

          <div className="grid items-center gap-12 lg:grid-cols-2">

            <div>

              <p className="text-[10px] font-semibold tracking-[0.2em] text-violet-400">
                COMPLETE VISIBILITY
              </p>

              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                Know what moved.
                <span className="block text-white/40">
                  Know where it went.
                </span>
              </h2>

              <p className="mt-5 max-w-lg text-sm leading-6 text-white/35">
                The Stock Ledger keeps every receipt, delivery,
                transfer and adjustment connected to its source.
              </p>

              <div className="mt-7 flex items-center gap-3 text-sm text-white/50">
                <BarChart3 size={18} className="text-cyan-300" />
                Live operational visibility
              </div>

            </div>


            <div className="rounded-3xl border border-white/[0.07] bg-white/[0.02] p-6">

              <div className="flex items-center justify-between border-b border-white/[0.07] pb-4">

                <div>
                  <p className="text-[9px] tracking-[0.2em] text-white/25">
                    STOCK LEDGER
                  </p>

                  <p className="mt-1 text-sm font-medium">
                    Recent movements
                  </p>
                </div>

                <Activity
                  size={17}
                  className="text-cyan-300"
                />

              </div>


              <div className="divide-y divide-white/[0.06]">

                {[
                  ["RECEIPT", "Steel Rods", "+100 kg"],
                  ["TRANSFER", "Office Chairs", "20 pcs"],
                  ["DELIVERY", "Hex Bolts", "-35 pcs"],
                  ["ADJUSTMENT", "Cement", "-3 bags"],
                ].map(([type, product, quantity]) => (

                  <div
                    key={product}
                    className="flex items-center justify-between py-4"
                  >

                    <div>

                      <p className="text-[9px] tracking-wider text-white/25">
                        {type}
                      </p>

                      <p className="mt-1 text-xs">
                        {product}
                      </p>

                    </div>

                    <span className="text-xs text-white/50">
                      {quantity}
                    </span>

                  </div>

                ))}

              </div>

            </div>

          </div>

        </section>


        {/* ================= CTA ================= */}

        <section className="mx-auto max-w-7xl px-5 pb-16 lg:px-8">

          <motion.div
            whileHover={{ scale: 1.005 }}
            className="relative overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-indigo-500/[0.12] via-white/[0.025] to-cyan-400/[0.08] p-8 sm:p-12"
          >

            <div className="relative z-10 max-w-2xl">

              <p className="text-[10px] font-semibold tracking-[0.2em] text-indigo-300">
                READY TO TAKE CONTROL?
              </p>

              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                Your inventory deserves a better system.
              </h2>

              <p className="mt-4 text-sm text-white/35">
                Start managing stock with one connected workspace.
              </p>

              <Link
                to="/login"
                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-white/90"
              >
                Enter StockSense
                <ArrowRight size={16} />
              </Link>

            </div>

          </motion.div>

        </section>


        {/* ================= FOOTER ================= */}

        <footer className="border-t border-white/[0.06]">

          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-7 text-xs text-white/25 sm:flex-row sm:items-center sm:justify-between lg:px-8">

            <div className="flex items-center gap-2">

              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-black">
                <Boxes size={14} />
              </div>

              <span>
                StockSense
              </span>

            </div>

            <span>
              Inventory management, reimagined.
            </span>

          </div>

        </footer>

      </main>

    </div>
  );
}
