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
  UserRound,
  CheckCircle2,
  Package,
  Warehouse,
  Sparkles,
} from "lucide-react";
import { supabase } from "../../lib/supabase";

export default function Signup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSignup(e) {
    e.preventDefault();

    setError("");

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const { data, error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
      },
    });

    setLoading(false);

    if (signupError) {
      setError(signupError.message);
      return;
    }

    if (data.session) {
      navigate("/dashboard");
      return;
    }

    setSuccess(true);
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050505] text-white">

      {/* =====================================================
          BACKGROUND
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
          animate={{ opacity: [0.15, 0.45, 0.15] }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute left-1/2 top-0 h-px w-[40%] -translate-x-1/2 bg-gradient-to-r from-transparent via-indigo-400 to-transparent"
        />

      </div>


      {/* =====================================================
          MAIN CARD
      ===================================================== */}

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-6 sm:px-6">

        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="grid w-full max-w-6xl overflow-hidden rounded-[30px] border border-white/10 bg-[#080808]/80 shadow-[0_30px_120px_rgba(0,0,0,0.65)] backdrop-blur-2xl lg:grid-cols-[1.05fr_0.95fr]"
        >

          {/* =================================================
              LEFT
          ================================================= */}

          <div className="relative hidden min-h-[720px] overflow-hidden border-r border-white/[0.08] lg:block">

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
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-black"
                >
                  <Boxes size={19} />
                </motion.div>

                <span className="font-semibold tracking-tight">
                  StockSense
                </span>

              </Link>


              {/* Heading */}

              <div className="mt-20">

                <div className="flex items-center gap-2">

                  <span className="flex h-2 w-2">
                    <span className="absolute h-2 w-2 animate-ping rounded-full bg-cyan-400 opacity-60" />
                    <span className="relative h-2 w-2 rounded-full bg-cyan-400" />
                  </span>

                  <span className="text-[10px] font-semibold tracking-[0.2em] text-cyan-300">
                    BUILD YOUR WORKSPACE
                  </span>

                </div>


                <h1 className="mt-5 max-w-lg text-5xl font-semibold leading-[0.98] tracking-[-0.055em]">

                  Start managing.

                  <span className="mt-1 block bg-gradient-to-r from-indigo-300 via-violet-400 to-cyan-300 bg-clip-text text-transparent">
                    Smarter.
                  </span>

                </h1>


                <p className="mt-6 max-w-md text-sm leading-6 text-white/40">
                  Create your StockSense workspace and bring your
                  entire inventory operation together.
                </p>

              </div>


              {/* Floating cards */}

              <div className="relative mt-12 flex-1">

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
                  className="absolute left-2 top-4 w-[275px] rounded-2xl border border-white/10 bg-white/[0.035] p-4 shadow-2xl backdrop-blur-xl"
                >

                  <div className="flex items-center gap-3">

                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-300">
                      <Package size={17} />
                    </div>

                    <div>
                      <p className="text-xs font-medium">
                        Products
                      </p>

                      <p className="mt-1 text-[9px] text-white/25">
                        Centralized inventory
                      </p>
                    </div>

                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-2">

                    {["248", "03", "1.2K"].map((value, index) => (

                      <div
                        key={value}
                        className="rounded-xl bg-white/[0.025] p-2.5"
                      >

                        <p className="text-sm font-medium">
                          {value}
                        </p>

                        <p className="mt-1 text-[8px] text-white/20">
                          {["SKUs", "Warehouses", "Units"][index]}
                        </p>

                      </div>

                    ))}

                  </div>

                </motion.div>


                <motion.div
                  animate={{
                    y: [0, 9, 0],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute right-3 top-24 w-[215px] rounded-2xl border border-white/10 bg-[#101010]/90 p-4 shadow-2xl backdrop-blur-xl"
                >

                  <div className="flex items-center gap-2">

                    <Warehouse
                      size={15}
                      className="text-cyan-300"
                    />

                    <span className="text-xs text-white/60">
                      Multi-warehouse
                    </span>

                  </div>

                  <div className="mt-5 space-y-2">

                    {[
                      "Main Warehouse",
                      "Production Rack",
                      "Warehouse 2",
                    ].map((warehouse, index) => (

                      <div
                        key={warehouse}
                        className="flex items-center justify-between text-[9px]"
                      >

                        <span className="text-white/30">
                          {warehouse}
                        </span>

                        <span className="text-emerald-300">
                          {index === 0 ? "ACTIVE" : "READY"}
                        </span>

                      </div>

                    ))}

                  </div>

                </motion.div>


                <motion.div
                  animate={{
                    y: [0, -6, 0],
                  }}
                  transition={{
                    duration: 4.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute bottom-6 left-10 flex items-center gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.05] px-4 py-3"
                >

                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-400/10">
                    <CheckCircle2
                      size={16}
                      className="text-emerald-300"
                    />
                  </div>

                  <div>
                    <p className="text-xs font-medium text-emerald-200">
                      Ready to operate
                    </p>

                    <p className="mt-1 text-[9px] text-white/25">
                      Your workspace starts here
                    </p>
                  </div>

                </motion.div>

              </div>


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
              RIGHT — SIGNUP
          ================================================= */}

          <div className="relative flex items-center p-7 sm:p-10 lg:p-12">

            <motion.div
              animate={{
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
              }}
              className="absolute right-12 top-0 h-px w-32 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
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
                className="mb-10 flex items-center gap-3 lg:hidden"
              >

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-black">
                  <Boxes size={19} />
                </div>

                <span className="font-semibold">
                  StockSense
                </span>

              </Link>


              {!success ? (
                <>

                  {/* Header */}

                  <div>

                    <div className="mb-4 flex items-center gap-2">

                      <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />

                      <p className="text-[10px] font-semibold tracking-[0.22em] text-cyan-300">
                        CREATE YOUR WORKSPACE
                      </p>

                    </div>


                    <h2 className="text-4xl font-semibold tracking-[-0.045em]">
                      Create account.
                    </h2>

                    <p className="mt-3 text-sm leading-6 text-white/35">
                      Get your inventory workspace up and running.
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
                    onSubmit={handleSignup}
                    className="mt-7 space-y-4"
                  >

                    {/* Name */}

                    <div>

                      <label className="mb-2 block text-xs font-medium text-white/55">
                        Full name
                      </label>

                      <div className="group relative">

                        <UserRound
                          size={16}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 transition group-focus-within:text-cyan-300"
                        />

                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Your name"
                          required
                          className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.035] pl-11 pr-4 text-sm text-white outline-none transition duration-300 placeholder:text-white/20 hover:border-white/15 focus:border-cyan-400/50 focus:bg-white/[0.055] focus:shadow-[0_0_30px_rgba(34,211,238,0.07)]"
                        />

                      </div>

                    </div>


                    {/* Email */}

                    <div>

                      <label className="mb-2 block text-xs font-medium text-white/55">
                        Email address
                      </label>

                      <div className="group relative">

                        <Mail
                          size={16}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 transition group-focus-within:text-cyan-300"
                        />

                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          required
                          className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.035] pl-11 pr-4 text-sm text-white outline-none transition duration-300 placeholder:text-white/20 hover:border-white/15 focus:border-cyan-400/50 focus:bg-white/[0.055]"
                        />

                      </div>

                    </div>


                    {/* Password */}

                    <div>

                      <label className="mb-2 block text-xs font-medium text-white/55">
                        Password
                      </label>

                      <div className="group relative">

                        <LockKeyhole
                          size={16}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 transition group-focus-within:text-cyan-300"
                        />

                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Minimum 6 characters"
                          required
                          className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.035] pl-11 pr-12 text-sm text-white outline-none transition duration-300 placeholder:text-white/20 hover:border-white/15 focus:border-cyan-400/50 focus:bg-white/[0.055]"
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


                    {/* Confirm */}

                    <div>

                      <label className="mb-2 block text-xs font-medium text-white/55">
                        Confirm password
                      </label>

                      <div className="group relative">

                        <LockKeyhole
                          size={16}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 transition group-focus-within:text-cyan-300"
                        />

                        <input
                          type={showConfirm ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) =>
                            setConfirmPassword(e.target.value)
                          }
                          placeholder="Repeat your password"
                          required
                          className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.035] pl-11 pr-12 text-sm text-white outline-none transition duration-300 placeholder:text-white/20 hover:border-white/15 focus:border-cyan-400/50 focus:bg-white/[0.055]"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirm(!showConfirm)
                          }
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/25 transition hover:text-white/70"
                        >
                          {showConfirm ? (
                            <EyeOff size={16} />
                          ) : (
                            <Eye size={16} />
                          )}
                        </button>

                      </div>

                    </div>


                    {/* Submit */}

                    <motion.button
                      type="submit"
                      disabled={loading}
                      whileHover={{
                        scale: 1.01,
                        boxShadow:
                          "0 15px 40px rgba(34,211,238,0.08)",
                      }}
                      whileTap={{
                        scale: 0.985,
                      }}
                      className="group relative mt-2 flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-white text-sm font-semibold text-black transition disabled:cursor-not-allowed disabled:opacity-60"
                    >

                      <span className="absolute inset-0 bg-gradient-to-r from-cyan-100 via-white to-indigo-100 opacity-0 transition group-hover:opacity-100" />

                      <span className="relative flex items-center gap-2">

                        {loading ? (
                          <>
                            <Loader2
                              size={16}
                              className="animate-spin"
                            />
                            Creating workspace...
                          </>
                        ) : (
                          <>
                            Create account
                            <ArrowRight
                              size={16}
                              className="transition-transform group-hover:translate-x-1"
                            />
                          </>
                        )}

                      </span>

                    </motion.button>

                  </form>


                  {/* Login */}

                  <div className="mt-7 text-center text-xs text-white/30">

                    Already have an account?{" "}

                    <Link
                      to="/login"
                      className="font-medium text-white/70 transition hover:text-white"
                    >
                      Sign in
                    </Link>

                  </div>


                  {/* Security */}

                  <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-white/20">

                    <ShieldCheck size={13} />

                    Secure authentication powered by Supabase

                  </div>

                </>
              ) : (

                /* =================================================
                   SUCCESS
                ================================================= */

                <motion.div
                  initial={{
                    opacity: 0,
                    scale: 0.96,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                  className="text-center"
                >

                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 220,
                      damping: 15,
                    }}
                    className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300"
                  >
                    <CheckCircle2 size={30} />
                  </motion.div>


                  <h2 className="mt-7 text-3xl font-semibold tracking-tight">
                    Check your inbox.
                  </h2>

                  <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-white/40">
                    Your account has been created. If email confirmation
                    is enabled, check your inbox and verify your email
                    before signing in.
                  </p>


                  <Link
                    to="/login"
                    className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-white/90"
                  >
                    Continue to login
                    <ArrowRight size={16} />
                  </Link>

                </motion.div>

              )}

            </motion.div>

          </div>

        </motion.div>

      </div>

    </div>
  );
}
