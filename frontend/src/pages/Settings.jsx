import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  Settings as SettingsIcon,
  User,
  Mail,
  Shield,
  LogOut,
  Save,
  CheckCircle2,
  Building2,
} from "lucide-react";
import AppShell from "../components/app/AppShell";
import { supabase } from "../lib/supabase";

export default function Settings() {
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser(data.user);
        setName(data.user.user_metadata?.full_name || "");
      }
    });
  }, []);

  const saveProfile = async () => {
    const { error } = await supabase.auth.updateUser({
      data: { full_name: name },
    });

    if (!error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <AppShell>
      <div className="min-h-full px-4 pb-10 pt-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
              <SettingsIcon size={14} />
              Configuration
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Settings
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Manage your StockSense profile and account preferences.
            </p>
          </motion.div>

          <div className="grid gap-5 lg:grid-cols-[1fr_320px]">

            {/* Profile */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-white/10 bg-white/[0.035] p-6"
            >
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
                  <User size={18} />
                </div>

                <div>
                  <h2 className="font-semibold text-white">
                    Profile
                  </h2>
                  <p className="text-xs text-slate-500">
                    Your StockSense account information
                  </p>
                </div>
              </div>

              <div className="space-y-5">

                <div>
                  <label className="mb-2 block text-xs font-medium text-slate-400">
                    Full Name
                  </label>

                  <div className="relative">
                    <User
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
                    />

                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      className="h-11 w-full rounded-xl border border-white/10 bg-black/30 pl-10 pr-4 text-sm text-white outline-none focus:border-cyan-400/40"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium text-slate-400">
                    Email
                  </label>

                  <div className="relative">
                    <Mail
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
                    />

                    <input
                      value={user?.email || ""}
                      readOnly
                      className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.02] pl-10 pr-4 text-sm text-slate-500 outline-none"
                    />
                  </div>
                </div>

                <button
                  onClick={saveProfile}
                  className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:scale-[1.02]"
                >
                  {saved ? (
                    <>
                      <CheckCircle2 size={16} />
                      Saved
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </motion.div>

            {/* Account */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="space-y-5"
            >
              <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
                    <Shield size={17} />
                  </div>

                  <div>
                    <h3 className="font-semibold text-white">
                      Authentication
                    </h3>
                    <p className="text-xs text-slate-500">
                      Supabase Auth
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-xl border border-emerald-400/10 bg-emerald-400/[0.04] px-3 py-2.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  <span className="text-xs text-emerald-300">
                    Account authenticated
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
                    <Building2 size={17} />
                  </div>

                  <div>
                    <h3 className="font-semibold text-white">
                      Workspace
                    </h3>
                    <p className="text-xs text-slate-500">
                      StockSense Inventory
                    </p>
                  </div>
                </div>

                <p className="text-xs leading-5 text-slate-500">
                  Centralized inventory management across your warehouses,
                  operations, and stock ledger.
                </p>
              </div>

              <button
                onClick={signOut}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-400/15 bg-red-400/[0.05] px-4 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-400/10"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
