import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Activity,
  AlertTriangle,
  ArrowLeftRight,
  Bell,
  BookOpen,
  Boxes,
  ChevronDown,
  Grid2X2,
  LogOut,
  Menu,
  Package,
  Search,
  Settings,
  SlidersHorizontal,
  Truck,
  Warehouse,
  X,
} from "lucide-react";

import { supabase } from "../../lib/supabase";
import { api } from "../../lib/api";

const navigation = [
  {
    label: "Overview",
    path: "/dashboard",
    icon: Grid2X2,
  },
  {
    label: "Products",
    path: "/products",
    icon: Boxes,
  },
];

const operations = [
  {
    label: "Receipts",
    path: "/receipts",
    icon: Package,
  },
  {
    label: "Deliveries",
    path: "/deliveries",
    icon: Truck,
  },
  {
    label: "Transfers",
    path: "/transfers",
    icon: ArrowLeftRight,
  },
  {
    label: "Adjustments",
    path: "/adjustments",
    icon: SlidersHorizontal,
  },
  {
    label: "Stock Ledger",
    path: "/ledger",
    icon: BookOpen,
  },
  {
    label: "Warehouses",
    path: "/warehouses",
    icon: Warehouse,
  },
];

const searchItems = [
  {
    name: "Overview",
    description: "Inventory dashboard",
    path: "/dashboard",
    icon: Grid2X2,
  },
  {
    name: "Products",
    description: "Products and stock",
    path: "/products",
    icon: Boxes,
  },
  {
    name: "Receipts",
    description: "Receive incoming inventory",
    path: "/receipts",
    icon: Package,
  },
  {
    name: "Deliveries",
    description: "Deliver outgoing inventory",
    path: "/deliveries",
    icon: Truck,
  },
  {
    name: "Transfers",
    description: "Move stock between locations",
    path: "/transfers",
    icon: ArrowLeftRight,
  },
  {
    name: "Adjustments",
    description: "Reconcile physical stock",
    path: "/adjustments",
    icon: SlidersHorizontal,
  },
  {
    name: "Stock Ledger",
    description: "Complete inventory history",
    path: "/ledger",
    icon: BookOpen,
  },
  {
    name: "Warehouses",
    description: "Manage warehouse locations",
    path: "/warehouses",
    icon: Warehouse,
  },
  {
    name: "Settings",
    description: "Account and workspace settings",
    path: "/settings",
    icon: Settings,
  },
];

function AppShell({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user ?? null);
    }

    loadUser();
  }, []);

  useEffect(() => {
    async function loadNotifications() {
      try {
        const [inventoryResponse, dashboardResponse] =
          await Promise.all([
            api.getInventory(),
            api.getDashboard(),
          ]);

        const inventory = Array.isArray(inventoryResponse)
          ? inventoryResponse
          : inventoryResponse?.data ?? [];

        const dashboard = dashboardResponse?.data ?? {};

        const alerts = [];

        inventory.forEach((item) => {
          const quantity = Number(item.quantity ?? 0);

          const reorderLevel = Number(
            item.products?.reorder_level ?? 0
          );

          const productName =
            item.products?.name ?? "Unknown product";

          if (quantity === 0) {
            alerts.push({
              type: "danger",
              title: "Out of stock",
              message: `${productName} is completely out of stock.`,
            });
          } else if (quantity <= reorderLevel) {
            alerts.push({
              type: "warning",
              title: "Low stock",
              message: `${productName} is at or below reorder level.`,
            });
          }
        });

        if (Number(dashboard.pending_receipts) > 0) {
          alerts.push({
            type: "info",
            title: "Pending receipts",
            message: `${dashboard.pending_receipts} receipt(s) awaiting validation.`,
          });
        }

        if (Number(dashboard.pending_deliveries) > 0) {
          alerts.push({
            type: "info",
            title: "Pending deliveries",
            message: `${dashboard.pending_deliveries} delivery order(s) awaiting fulfillment.`,
          });
        }

        setNotifications(alerts);
      } catch {
        setNotifications([]);
      }
    }

    loadNotifications();
  }, [location.pathname]);

  useEffect(() => {
    const handleKeyboard = (event) => {
      if (
        event.key === "/" &&
        !searchOpen &&
        event.target.tagName !== "INPUT" &&
        event.target.tagName !== "TEXTAREA"
      ) {
        event.preventDefault();
        setSearchOpen(true);
        setNotificationOpen(false);
        setProfileOpen(false);
      }

      if (event.key === "Escape") {
        setSearchOpen(false);
        setNotificationOpen(false);
        setProfileOpen(false);
        setMobileOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyboard);

    return () => {
      window.removeEventListener("keydown", handleKeyboard);
    };
  }, [searchOpen]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate("/");
  }

  const filteredSearchItems = searchItems.filter((item) => {
    const query = searchQuery.toLowerCase().trim();

    if (!query) return true;

    return (
      item.name.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query)
    );
  });

  const displayName =
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "User";

  const initials = displayName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const renderNavItem = (item) => {
    const Icon = item.icon;

    return (
      <NavLink
        key={item.path}
        to={item.path}
        onClick={() => setMobileOpen(false)}
        className={({ isActive }) =>
          `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all ${
            isActive
              ? "bg-white/[0.09] text-white"
              : "text-white/45 hover:bg-white/[0.05] hover:text-white"
          }`
        }
      >
        {({ isActive }) => (
          <>
            {isActive && (
              <motion.div
                layoutId="activeNav"
                className="absolute left-0 h-7 w-0.5 rounded-full bg-indigo-400"
              />
            )}

            <Icon className="h-[18px] w-[18px]" />

            <span>{item.label}</span>
          </>
        )}
      </NavLink>
    );
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white">

      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 top-20 h-96 w-96 rounded-full bg-indigo-500/[0.04] blur-3xl" />
        <div className="absolute right-0 top-40 h-96 w-96 rounded-full bg-cyan-500/[0.03] blur-3xl" />

        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
            backgroundSize: "54px 54px",
          }}
        />
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="fixed inset-0 z-[90] bg-[#050505] p-6 lg:hidden"
          >
            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-black">
                  <Boxes className="h-5 w-5" />
                </div>

                <div>
                  <p className="font-semibold">StockSense</p>
                  <p className="text-[10px] uppercase tracking-widest text-white/30">
                    Inventory OS
                  </p>
                </div>
              </div>

              <button
                onClick={() => setMobileOpen(false)}
                className="rounded-xl p-2 text-white/60 hover:bg-white/5"
              >
                <X />
              </button>
            </div>

            <nav className="space-y-1">
              {navigation.map(renderNavItem)}

              <p className="px-3 pb-2 pt-7 text-[10px] uppercase tracking-[0.25em] text-white/20">
                Operations
              </p>

              {operations.map(renderNavItem)}

              <div className="my-5 border-t border-white/10" />

              {renderNavItem({
                label: "Settings",
                path: "/settings",
                icon: Settings,
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[340px] border-r border-white/[0.08] bg-[#050505]/90 backdrop-blur-xl lg:block">

        <div className="flex h-full flex-col">

          {/* Brand */}
          <div className="flex h-[100px] items-center gap-4 border-b border-white/[0.08] px-7">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-black shadow-xl">
              <Boxes className="h-6 w-6" />
            </div>

            <div>
              <div className="text-lg font-semibold tracking-tight">
                StockSense
              </div>

              <div className="text-[11px] uppercase tracking-widest text-white/30">
                Inventory OS
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-hidden px-4 py-7">

            <nav className="space-y-1">
              {navigation.map(renderNavItem)}

              <p className="px-3 pb-2 pt-8 text-[10px] uppercase tracking-[0.3em] text-white/20">
                Operations
              </p>

              {operations.map(renderNavItem)}
            </nav>
          </div>

          {/* Bottom */}
          <div className="border-t border-white/[0.08] p-4">

            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `mb-2 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                  isActive
                    ? "bg-white/[0.08] text-white"
                    : "text-white/40 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <Settings className="h-[18px] w-[18px]" />
              Settings
            </NavLink>

            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/40 transition hover:bg-red-500/5 hover:text-red-300"
            >
              <LogOut className="h-[18px] w-[18px]" />
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="relative min-h-screen lg:pl-[340px]">

        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-[100px] items-center justify-between border-b border-white/[0.08] bg-[#050505]/75 px-5 backdrop-blur-xl sm:px-8 lg:px-10">

          <div className="flex items-center gap-4">

            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-xl p-2 text-white/60 hover:bg-white/5 lg:hidden"
            >
              <Menu />
            </button>

            <div className="hidden items-center gap-3 sm:flex">
              <Activity className="h-4 w-4 text-emerald-400" />

              <span className="text-sm text-white/35">
                All systems operational
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">

            {/* Search */}
            <button
              onClick={() => {
                setSearchOpen(true);
                setNotificationOpen(false);
                setProfileOpen(false);
              }}
              className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.025] px-4 py-2.5 text-sm text-white/45 transition hover:border-white/20 hover:bg-white/[0.05] hover:text-white"
            >
              <Search className="h-4 w-4" />

              <span className="hidden sm:block">
                Search
              </span>

              <kbd className="hidden rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] text-white/30 sm:block">
                /
              </kbd>
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => {
                  setNotificationOpen((value) => !value);
                  setSearchOpen(false);
                  setProfileOpen(false);
                }}
                className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.025] text-white/55 transition hover:border-white/20 hover:bg-white/[0.05] hover:text-white"
              >
                <Bell className="h-[18px] w-[18px]" />

                {notifications.length > 0 && (
                  <motion.span
                    animate={{ scale: [1, 1.25, 1] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                    }}
                    className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-400"
                  />
                )}
              </button>

              <AnimatePresence>
                {notificationOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.98 }}
                    className="absolute right-0 top-14 z-50 w-[350px] overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b0d]/95 shadow-2xl backdrop-blur-2xl"
                  >
                    <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                      <div>
                        <p className="text-sm font-semibold">
                          Notifications
                        </p>

                        <p className="mt-1 text-xs text-white/30">
                          Inventory events requiring attention
                        </p>
                      </div>

                      <button
                        onClick={() => setNotificationOpen(false)}
                        className="rounded-lg p-2 text-white/30 hover:bg-white/5 hover:text-white"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="max-h-[360px] overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="px-5 py-12 text-center">
                          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-400/10">
                            <Bell className="h-5 w-5 text-emerald-400" />
                          </div>

                          <p className="text-sm font-medium">
                            All clear
                          </p>

                          <p className="mt-1 text-xs text-white/30">
                            No inventory alerts right now.
                          </p>
                        </div>
                      ) : (
                        notifications.map((item, index) => (
                          <div
                            key={`${item.title}-${index}`}
                            className="flex gap-3 border-b border-white/[0.06] px-5 py-4 hover:bg-white/[0.03]"
                          >
                            <div
                              className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                                item.type === "danger"
                                  ? "bg-red-400/10 text-red-400"
                                  : item.type === "warning"
                                  ? "bg-amber-400/10 text-amber-400"
                                  : "bg-cyan-400/10 text-cyan-400"
                              }`}
                            >
                              <AlertTriangle className="h-4 w-4" />
                            </div>

                            <div>
                              <p className="text-sm font-medium">
                                {item.title}
                              </p>

                              <p className="mt-1 text-xs leading-5 text-white/35">
                                {item.message}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="border-t border-white/10 px-5 py-3">
                      <button
                        onClick={() => {
                          setNotificationOpen(false);
                          navigate("/dashboard");
                        }}
                        className="text-xs font-medium text-cyan-300 hover:text-cyan-200"
                      >
                        View inventory →
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile */}
            <div className="relative">
              <button
                onClick={() => {
                  setProfileOpen((value) => !value);
                  setSearchOpen(false);
                  setNotificationOpen(false);
                }}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.025] px-2 py-1.5 transition hover:border-white/20 hover:bg-white/[0.05]"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 text-sm font-bold text-black">
                  {initials || "S"}
                </div>

                <ChevronDown className="hidden h-4 w-4 text-white/30 sm:block" />
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="absolute right-0 top-14 z-50 w-64 rounded-2xl border border-white/10 bg-[#0b0b0d]/95 p-2 shadow-2xl backdrop-blur-xl"
                  >
                    <div className="border-b border-white/10 px-3 py-3">
                      <p className="truncate text-sm font-medium">
                        {displayName}
                      </p>

                      <p className="mt-1 truncate text-xs text-white/30">
                        {user?.email}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        navigate("/settings");
                      }}
                      className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/55 hover:bg-white/5 hover:text-white"
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </button>

                    <button
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-300/70 hover:bg-red-500/5 hover:text-red-300"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="relative">
          {children}
        </div>
      </main>

      {/* Search command center */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                setSearchOpen(false);
              }
            }}
            className="fixed inset-0 z-[100] flex items-start justify-center bg-black/70 px-4 pt-[12vh] backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.97 }}
              className="w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-[#0b0b0d] shadow-2xl"
            >
              <div className="flex items-center gap-3 border-b border-white/10 px-5">
                <Search className="h-5 w-5 text-white/30" />

                <input
                  autoFocus
                  value={searchQuery}
                  onChange={(event) =>
                    setSearchQuery(event.target.value)
                  }
                  placeholder="Search StockSense..."
                  className="h-16 flex-1 bg-transparent text-base text-white outline-none placeholder:text-white/20"
                />

                <button
                  onClick={() => setSearchOpen(false)}
                  className="rounded-lg border border-white/10 px-2 py-1 text-[10px] text-white/30 hover:text-white"
                >
                  ESC
                </button>
              </div>

              <div className="max-h-[420px] overflow-y-auto p-3">
                {filteredSearchItems.length === 0 ? (
                  <div className="px-5 py-12 text-center text-sm text-white/30">
                    No results found.
                  </div>
                ) : (
                  filteredSearchItems.map((item) => {
                    const Icon = item.icon;

                    return (
                      <button
                        key={item.path}
                        onClick={() => {
                          navigate(item.path);
                          setSearchOpen(false);
                          setSearchQuery("");
                        }}
                        className="flex w-full items-center gap-4 rounded-2xl px-4 py-3 text-left transition hover:bg-white/[0.06]"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-white/50">
                          <Icon className="h-4 w-4" />
                        </div>

                        <div className="flex-1">
                          <p className="text-sm font-medium text-white">
                            {item.name}
                          </p>

                          <p className="mt-0.5 text-xs text-white/30">
                            {item.description}
                          </p>
                        </div>

                        <span className="text-white/20">
                          ↵
                        </span>
                      </button>
                    );
                  })
                )}
              </div>

              <div className="flex gap-5 border-t border-white/10 px-5 py-3 text-[10px] text-white/25">
                <span>↑↓ Navigate</span>
                <span>↵ Open</span>
                <span>ESC Close</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AppShell;



