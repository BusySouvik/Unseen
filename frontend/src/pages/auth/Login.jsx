import { useState } from "react";
import { motion } from "motion/react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Boxes,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Package,
  Warehouse,
  Activity,
  Sparkles,
} from "lucide-react";
import { supabase } from "../../lib/supabase";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e) {
    e.preventDefault();

    setError("");
    setLoading(true);

    const { error: loginError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    setLoading(false);

    if (loginError) {
      setError(loginError.message);
      return;
    }

    navigate("/dashboard");
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050505] text-white">

      {/* =====================================================
          AMBIENT BACKGROUND
      ===================================================== */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">

        <motion.div
          animate={{
            x: [0, 100, -40, 0],
            y: [0, -60, 50, 0],
            scale: [1, 1.12, 0.96, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute left-[-250px] top-[-250px] h-[700px] w-[700px] rounded-full bg-indigo-600/[0.14] blur-[150px]"
        />

        <motion.div
          animate={{
            x: [0, -80, 50, 0],
            y: [0, 60, -30, 0],
            scale: [1, 0.94, 1.08, 1],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-[-300px] right-[-220px] h-[700px] w-[700px] rounded-full bg-cyan-500/[0.09] blur-[160px]"
        />

        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "70px 70px",
          }}
        />

        <motion.div
          animate={{ opacity: [0.1, 0.3, 0.1] }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute left-1/2 top-0 h-px w-[40%] -translate-x-1/2 bg-gradient-to-r from-transparent via-indigo-400 to-transparent"
        />

      </div>


      {/* =====================================================
          PAGE
      ===================================================== */}

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-6 sm:px-6">

        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="grid w-full max-w-6xl overflow-hidden rounded-[30px] border border-white/10 bg-[#080808]/80 shadow-[0_30px_120px_rgba(0,0,0,0.65)] backdrop-blur-2xl lg:grid-cols-[1.05fr_0.95fr]"
        >

          {/* =================================================
              LEFT — PRODUCT EXPERIENCE
          ================================================= */}

          <div className="relative hidden min-h-[700px] overflow-hidden border-r border-white/[0.08] lg:block">

            {/* Internal glow */}

            <div className="absolute left-[-100px] top-[20%] h-[350px] w-[350px] rounded-full bg-indigo-500/[0.08] blur-[100px]" />

            <div className="relative z-10 flex h-full flex-col p-10">

              {/* Logo */}

              <Link
                to="/"
                className="group flex w-fit items-center gap-3"
              >

                <motion.div
                  whileHover={{
                    rotate: 8,
                    scale: 1.05,
                  }}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-black shadow-lg shadow-white/5"
                >
                  <Boxes size={19} />
                </motion.div>

                <span className="font-semibold tracking-tight">
                  StockSense
                </span>

              </Link>


              {/* Main copy */}

              <div className="mt-20">

                <div className="flex items-center gap-2">

                  <span className="flex h-2 w-2">
                    <span className="absolute h-2 w-2 animate-ping rounded-full bg-emerald-400 opacity-60" />
                    <span className="relative h-2 w-2 rounded-full bg-emerald-400" />
                  </span>

                  <span className="text-[10px] font-semibold tracking-[0.2em] text-emerald-300">
                    SYSTEM ONLINE
                  </span>

                </div>


                <h1 className="mt-5 max-w-lg text-5xl font-semibold leading-[0.98] tracking-[-0.055em]">

                  Your inventory.

                  <span className="mt-1 block bg-gradient-to-r from-indigo-300 via-violet-400 to-cyan-300 bg-clip-text text-transparent">
                    In motion.
                  </span>

                </h1>


                <p className="mt-6 max-w-md text-sm leading-6 text-white/40">
                  One intelligent workspace for products,
                  warehouses and every stock movement.
                </p>

              </div>


              {/* Floating dashboard visualization */}

              <div className="relative mt-12 flex-1">

                {/* Floating inventory card */}

                <motion.div
                  animate={{
                    y: [0, -8, 0],
                    rotate: [0, 0.5, 0],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute left-2 top-4 w-[280px] rounded-2xl border border-white/10 bg-white/[0.035] p-4 shadow-2xl backdrop-blur-xl"
                >

                  <div className="flex items-center justify-between">

                    <div className="flex items-center gap-3">

                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-300">
                        <Package size={17} />
                      </div>

                      <div>
                        <p className="text-xs font-medium">
                          Steel Rods
                        </p>

                        <p className="mt-1 text-[9px] text-white/25">
                          STL-001 · Raw Material
                        </p>
                      </div>

                    </div>

                    <span className="text-[10px] text-emerald-300">
                      +100 kg
                    </span>

                  </div>


                  <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">

                    <motion.div
                      animate={{
                        width: ["35%", "70%", "55%", "75%"],
                      }}
                      transition={{
                        duration: 6,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-cyan-300"
                    />

                  </div>

                </motion.div>


                {/* Warehouse card */}

                <motion.div
                  animate={{
                    y: [0, 9, 0],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute right-4 top-24 w-[220px] rounded-2xl border border-white/10 bg-[#101010]/90 p-4 shadow-2xl backdrop-blur-xl"
                >

                  <div className="flex items-center justify-between">

                    <div className="flex items-center gap-2">

                      <Warehouse
                        size={15}
                        className="text-cyan-300"
                      />

                      <span className="text-xs text-white/60">
                        Main Warehouse
                      </span>

                    </div>

                    <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />

                  </div>

                  <p className="mt-5 text-2xl font-medium">
                    8,420
                  </p>

                  <p className="mt-1 text-[9px] text-white/25">
                    units currently stored
                  </p>

                </motion.div>


                {/* Activity card */}

                <motion.div
                  animate={{
                    y: [0, -5, 0],
                  }}
                  transition={{
                    duration: 4.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute bottom-6 left-12 w-[245px] rounded-2xl border border-white/10 bg-[#0d0d0d]/95 p-4 shadow-2xl backdrop-blur-xl"
                >

                  <div className="flex items-center justify-between">

                    <div className="flex items-center gap-2">

                      <Activity
                        size={15}
                        className="text-violet-300"
                      />

                      <span className="text-xs text-white/50">
                        Live activity
                      </span>

                    </div>

                    <span className="text-[9px] text-emerald-300">
                      ACTIVE
                    </span>

                  </div>


                  <div className="mt-4 flex h-10 items-end gap-1">

                    {[25, 42, 32, 58, 44, 70, 50, 78, 62, 88, 68, 92].map(
                      (height, index) => (

                        <motion.div
                          key={index}
                          initial={{ height: 0 }}
                          animate={{
                            height: `${height}%`,
                          }}
                          transition={{
                            duration: 0.7,
                            delay: index * 0.04,
                          }}
                          className="flex-1 rounded-t-sm bg-gradient-to-t from-indigo-500/30 to-cyan-300"
                        />

                      )
                    )}

                  </div>

                </motion.div>


                {/* Small floating badge */}

                <motion.div
                  animate={{
                    y: [0, -7, 0],
                    rotate: [0, 2, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute bottom-10 right-8 flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/[0.06] px-3 py-2"
                >

                  <ShieldCheck
                    size={13}
                    className="text-emerald-300"
                  />

                  <span className="text-[9px] text-emerald-200">
                    Inventory verified
                  </span>

                </motion.div>

              </div>


              {/* Bottom */}

              <div className="flex items-center justify-between text-[10px] text-white/20">

                <span>
                  © 2026 StockSense
                </span>

                <div className="flex items-center gap-2">
                  <Sparkles size={11} />
                  Intelligent inventory
                </div>

              </div>

            </div>

          </div>


          {/* =================================================
              RIGHT — LOGIN
          ================================================= */}

          <div className="relative flex items-center p-7 sm:p-10 lg:p-12">

            {/* Top accent */}

            <motion.div
              animate={{
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
              }}
              className="absolute right-12 top-0 h-px w-32 bg-gradient-to-r from-transparent via-indigo-400 to-transparent"
            />


            <motion.div
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.6,
                delay: 0.15,
              }}
              className="mx-auto w-full max-w-md"
            >

              {/* Mobile logo */}

              <Link
                to="/"
                className="mb-12 flex items-center gap-3 lg:hidden"
              >

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-black">
                  <Boxes size={19} />
                </div>

                <span className="font-semibold">
                  StockSense
                </span>

              </Link>


              {/* Header */}

              <div>

                <div className="mb-4 flex items-center gap-2">

                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />

                  <p className="text-[10px] font-semibold tracking-[0.22em] text-indigo-300">
                    SECURE WORKSPACE
                  </p>

                </div>


                <h2 className="text-4xl font-semibold tracking-[-0.045em]">
                  Welcome back.
                </h2>

                <p className="mt-3 text-sm leading-6 text-white/35">
                  Sign in to continue managing your inventory.
                </p>

              </div>


              {/* Error */}

              {error && (

                <motion.div
                  initial={{
                    opacity: 0,
                    y: -8,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  className="mt-6 rounded-xl border border-red-400/20 bg-red-400/[0.06] px-4 py-3 text-xs leading-5 text-red-300"
                >
                  {error}
                </motion.div>

              )}


              {/* Form */}

              <form
                onSubmit={handleLogin}
                className="mt-8 space-y-5"
              >

                {/* Email */}

                <div>

                  <label className="mb-2.5 block text-xs font-medium text-white/55">
                    Email address
                  </label>

                  <div className="group relative">

                    <Mail
                      size={16}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 transition group-focus-within:text-indigo-300"
                    />

                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.035] pl-11 pr-4 text-sm text-white outline-none transition duration-300 placeholder:text-white/20 hover:border-white/15 focus:border-indigo-400/50 focus:bg-white/[0.055] focus:shadow-[0_0_30px_rgba(99,102,241,0.08)]"
                    />

                  </div>

                </div>


                {/* Password */}

                <div>

                  <div className="mb-2.5 flex items-center justify-between">

                    <label className="text-xs font-medium text-white/55">
                      Password
                    </label>

                    <Link
                      to="/forgot-password"
                      className="text-[11px] text-indigo-300 transition hover:text-indigo-200"
                    >
                      Forgot password?
                    </Link>

                  </div>


                  <div className="group relative">

                    <LockKeyhole
                      size={16}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 transition group-focus-within:text-indigo-300"
                    />

                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.035] pl-11 pr-12 text-sm text-white outline-none transition duration-300 placeholder:text-white/20 hover:border-white/15 focus:border-indigo-400/50 focus:bg-white/[0.055] focus:shadow-[0_0_30px_rgba(99,102,241,0.08)]"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(!showPassword)
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/25 transition hover:text-white/70"
                    >
                      {showPassword ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>

                  </div>

                </div>


                {/* Login */}

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{
                    scale: 1.01,
                    boxShadow: "0 15px 40px rgba(255,255,255,0.08)",
                  }}
                  whileTap={{
                    scale: 0.985,
                  }}
                  className="group relative mt-2 flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-white text-sm font-semibold text-black transition disabled:cursor-not-allowed disabled:opacity-60"
                >

                  <motion.span
                    className="absolute inset-0 bg-gradient-to-r from-indigo-100 via-white to-cyan-100 opacity-0 transition group-hover:opacity-100"
                  />

                  <span className="relative flex items-center gap-2">

                    {loading ? (
                      <>
                        <Loader2
                          size={16}
                          className="animate-spin"
                        />
                        Signing in...
                      </>
                    ) : (
                      <>
                        Sign in
                        <ArrowRight
                          size={16}
                          className="transition-transform group-hover:translate-x-1"
                        />
                      </>
                    )}

                  </span>

                </motion.button>

              </form>


              {/* Divider */}

              <div className="my-7 flex items-center gap-3">

                <div className="h-px flex-1 bg-white/[0.07]" />

                <span className="text-[9px] tracking-wider text-white/20">
                  STOCKSENSE
                </span>

                <div className="h-px flex-1 bg-white/[0.07]" />

              </div>


              {/* Signup */}

              <p className="text-center text-xs text-white/30">

                New to StockSense?{" "}

                <Link
                  to="/signup"
                  className="font-medium text-white/70 transition hover:text-white"
                >
                  Create an account
                </Link>

              </p>


              {/* Security note */}

              <div className="mt-8 flex items-center justify-center gap-2 text-[10px] text-white/20">

                <ShieldCheck size={13} />

                Secure authentication powered by Supabase

              </div>

            </motion.div>

          </div>

        </motion.div>

      </div>

    </div>
  );
}
