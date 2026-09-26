import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Boxes,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { supabase } from "../../lib/supabase";

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function sendOtp(e) {
    e.preventDefault();

    setError("");
    setLoading(true);

    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
      },
    });

    setLoading(false);

    if (otpError) {
      setError(otpError.message);
      return;
    }

    setStep(2);
  }

  async function verifyOtp(e) {
    e.preventDefault();

    setError("");

    if (otp.length !== 6) {
      setError("Enter the 6-digit OTP sent to your email.");
      return;
    }

    setLoading(true);

    const { error: verifyError } =
      await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: "email",
      });

    setLoading(false);

    if (verifyError) {
      setError(verifyError.message);
      return;
    }

    setStep(3);
  }

  async function updatePassword(e) {
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

    const { error: passwordError } =
      await supabase.auth.updateUser({
        password,
      });

    setLoading(false);

    if (passwordError) {
      setError(passwordError.message);
      return;
    }

    await supabase.auth.signOut();

    setSuccess(true);
  }

  function handleOtpChange(value) {
    const cleaned = value.replace(/\D/g, "").slice(0, 6);
    setOtp(cleaned);
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

      </div>


      {/* =====================================================
          MAIN
      ===================================================== */}

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-6 sm:px-6">

        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7 }}
          className="grid w-full max-w-6xl overflow-hidden rounded-[30px] border border-white/10 bg-[#080808]/80 shadow-[0_30px_120px_rgba(0,0,0,0.65)] backdrop-blur-2xl lg:grid-cols-[1.05fr_0.95fr]"
        >

          {/* =================================================
              LEFT
          ================================================= */}

          <div className="relative hidden min-h-[680px] overflow-hidden border-r border-white/[0.08] lg:block">

            <div className="absolute left-[-100px] top-[20%] h-[350px] w-[350px] rounded-full bg-indigo-500/[0.08] blur-[100px]" />

            <div className="relative z-10 flex h-full flex-col p-10">

              <Link
                to="/"
                className="flex w-fit items-center gap-3"
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

                <span className="font-semibold">
                  StockSense
                </span>

              </Link>


              <div className="mt-24">

                <div className="flex items-center gap-2">

                  <span className="flex h-2 w-2">
                    <span className="absolute h-2 w-2 animate-ping rounded-full bg-violet-400 opacity-60" />
                    <span className="relative h-2 w-2 rounded-full bg-violet-400" />
                  </span>

                  <span className="text-[10px] font-semibold tracking-[0.2em] text-violet-300">
                    ACCOUNT RECOVERY
                  </span>

                </div>


                <h1 className="mt-5 max-w-lg text-5xl font-semibold leading-[0.98] tracking-[-0.055em]">

                  Access restored.

                  <span className="mt-1 block bg-gradient-to-r from-violet-300 via-indigo-400 to-cyan-300 bg-clip-text text-transparent">
                    Stay in control.
                  </span>

                </h1>


                <p className="mt-6 max-w-md text-sm leading-6 text-white/40">
                  Securely verify your identity and get back to your
                  inventory workspace.
                </p>

              </div>


              {/* Recovery visual */}

              <div className="relative mt-16 flex-1">

                <motion.div
                  animate={{
                    y: [0, -8, 0],
                    rotate: [0, 1, 0],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute left-4 top-4 rounded-3xl border border-white/10 bg-white/[0.035] p-6 shadow-2xl backdrop-blur-xl"
                >

                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-300">
                    <KeyRound size={25} />
                  </div>

                  <p className="mt-5 text-sm font-medium">
                    Identity verification
                  </p>

                  <p className="mt-2 max-w-[190px] text-[10px] leading-5 text-white/25">
                    A secure one-time code protects your account.
                  </p>

                  <div className="mt-5 flex gap-1.5">

                    {[1, 2, 3, 4, 5, 6].map((item) => (
                      <motion.div
                        key={item}
                        animate={{
                          opacity: [0.25, 0.8, 0.25],
                        }}
                        transition={{
                          duration: 2,
                          delay: item * 0.15,
                          repeat: Infinity,
                        }}
                        className="h-2 w-2 rounded-full bg-violet-400"
                      />
                    ))}

                  </div>

                </motion.div>


                <motion.div
                  animate={{
                    y: [0, 8, 0],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute right-8 top-20 rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.05] p-4"
                >

                  <div className="flex items-center gap-2">

                    <ShieldCheck
                      size={15}
                      className="text-emerald-300"
                    />

                    <span className="text-[10px] text-emerald-200">
                      Protected
                    </span>

                  </div>

                  <p className="mt-3 text-[9px] text-white/25">
                    Secure recovery flow
                  </p>

                </motion.div>

              </div>


              <div className="text-[10px] text-white/20">
                © 2026 StockSense
              </div>

            </div>

          </div>


          {/* =================================================
              RIGHT
          ================================================= */}

          <div className="flex min-h-[680px] items-center p-7 sm:p-10 lg:p-12">

            <div className="mx-auto w-full max-w-md">

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


              {/* Progress */}

              {!success && (

                <div className="mb-8 flex items-center gap-2">

                  {[1, 2, 3].map((item) => (

                    <div
                      key={item}
                      className="flex items-center gap-2"
                    >

                      <motion.div
                        animate={{
                          scale: step === item ? 1.08 : 1,
                        }}
                        className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-semibold transition ${
                          step >= item
                            ? "bg-white text-black"
                            : "border border-white/10 bg-white/[0.03] text-white/25"
                        }`}
                      >
                        {item}
                      </motion.div>

                      {item < 3 && (
                        <div
                          className={`h-px w-7 transition ${
                            step > item
                              ? "bg-white/50"
                              : "bg-white/10"
                          }`}
                        />
                      )}

                    </div>

                  ))}

                </div>

              )}


              <AnimatePresence mode="wait">

                {/* =================================================
                    SUCCESS
                ================================================= */}

                {success && (

                  <motion.div
                    key="success"
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

                    <h2 className="mt-7 text-3xl font-semibold">
                      Password updated.
                    </h2>

                    <p className="mt-3 text-sm leading-6 text-white/40">
                      Your StockSense account is secure again.
                    </p>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate("/login")}
                      className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-black"
                    >
                      Continue to login
                      <ArrowRight size={16} />
                    </motion.button>

                  </motion.div>

                )}


                {/* =================================================
                    STEP 1
                ================================================= */}

                {!success && step === 1 && (

                  <motion.div
                    key="step1"
                    initial={{
                      opacity: 0,
                      x: 20,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    exit={{
                      opacity: 0,
                      x: -20,
                    }}
                  >

                    <div>

                      <p className="text-[10px] font-semibold tracking-[0.22em] text-violet-300">
                        STEP 01 · IDENTIFY
                      </p>

                      <h2 className="mt-3 text-4xl font-semibold tracking-[-0.045em]">
                        Forgot password?
                      </h2>

                      <p className="mt-3 text-sm leading-6 text-white/35">
                        Enter your account email and we'll send you
                        a secure verification code.
                      </p>

                    </div>


                    {error && (

                      <div className="mt-6 rounded-xl border border-red-400/20 bg-red-400/[0.06] px-4 py-3 text-xs text-red-300">
                        {error}
                      </div>

                    )}


                    <form
                      onSubmit={sendOtp}
                      className="mt-8"
                    >

                      <label className="mb-2.5 block text-xs font-medium text-white/55">
                        Email address
                      </label>

                      <div className="group relative">

                        <Mail
                          size={16}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 transition group-focus-within:text-violet-300"
                        />

                        <input
                          type="email"
                          value={email}
                          onChange={(e) =>
                            setEmail(e.target.value)
                          }
                          placeholder="you@example.com"
                          required
                          className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.035] pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-violet-400/50 focus:bg-white/[0.055]"
                        />

                      </div>


                      <motion.button
                        type="submit"
                        disabled={loading}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.985 }}
                        className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-white text-sm font-semibold text-black disabled:opacity-60"
                      >

                        {loading ? (
                          <>
                            <Loader2
                              size={16}
                              className="animate-spin"
                            />
                            Sending code...
                          </>
                        ) : (
                          <>
                            Send verification code
                            <ArrowRight size={16} />
                          </>
                        )}

                      </motion.button>

                    </form>

                  </motion.div>

                )}


                {/* =================================================
                    STEP 2
                ================================================= */}

                {!success && step === 2 && (

                  <motion.div
                    key="step2"
                    initial={{
                      opacity: 0,
                      x: 20,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    exit={{
                      opacity: 0,
                      x: -20,
                    }}
                  >

                    <button
                      onClick={() => {
                        setStep(1);
                        setError("");
                      }}
                      className="mb-7 flex items-center gap-2 text-xs text-white/35 transition hover:text-white"
                    >
                      <ArrowLeft size={14} />
                      Change email
                    </button>


                    <p className="text-[10px] font-semibold tracking-[0.22em] text-violet-300">
                      STEP 02 · VERIFY
                    </p>

                    <h2 className="mt-3 text-4xl font-semibold tracking-[-0.045em]">
                      Enter your code.
                    </h2>

                    <p className="mt-3 text-sm leading-6 text-white/35">
                      We sent a 6-digit verification code to
                      <span className="text-white/60">
                        {" "}{email}
                      </span>
                    </p>


                    {error && (

                      <div className="mt-6 rounded-xl border border-red-400/20 bg-red-400/[0.06] px-4 py-3 text-xs text-red-300">
                        {error}
                      </div>

                    )}


                    <form
                      onSubmit={verifyOtp}
                      className="mt-8"
                    >

                      <div className="flex justify-between gap-2">

                        {Array.from({ length: 6 }).map((_, index) => (

                          <input
                            key={index}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={otp[index] || ""}
                            onChange={(e) => {

                              const value = e.target.value;

                              if (!/^\d?$/.test(value)) {
                                return;
                              }

                              const chars = otp.padEnd(6, " ").split("");
                              chars[index] = value || " ";
                              setOtp(chars.join("").trimEnd());

                              if (value && e.target.nextElementSibling) {
                                e.target.nextElementSibling.focus();
                              }

                            }}
                            onKeyDown={(e) => {

                              if (
                                e.key === "Backspace" &&
                                !otp[index] &&
                                e.target.previousElementSibling
                              ) {
                                e.target.previousElementSibling.focus();
                              }

                            }}
                            className="h-14 w-12 rounded-xl border border-white/10 bg-white/[0.035] text-center text-xl font-semibold text-white outline-none transition focus:border-violet-400/50 focus:bg-white/[0.06] sm:w-[58px]"
                          />

                        ))}

                      </div>


                      <motion.button
                        type="submit"
                        disabled={loading}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.985 }}
                        className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-white text-sm font-semibold text-black disabled:opacity-60"
                      >

                        {loading ? (
                          <>
                            <Loader2
                              size={16}
                              className="animate-spin"
                            />
                            Verifying...
                          </>
                        ) : (
                          <>
                            Verify code
                            <ArrowRight size={16} />
                          </>
                        )}

                      </motion.button>

                    </form>


                    <button
                      onClick={() => sendOtp({ preventDefault() {} })}
                      className="mt-5 flex w-full items-center justify-center text-xs text-white/30 transition hover:text-white/60"
                    >
                      Didn't receive it? Resend code
                    </button>

                  </motion.div>

                )}


                {/* =================================================
                    STEP 3
                ================================================= */}

                {!success && step === 3 && (

                  <motion.div
                    key="step3"
                    initial={{
                      opacity: 0,
                      x: 20,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    exit={{
                      opacity: 0,
                      x: -20,
                    }}
                  >

                    <p className="text-[10px] font-semibold tracking-[0.22em] text-violet-300">
                      STEP 03 · SECURE
                    </p>

                    <h2 className="mt-3 text-4xl font-semibold tracking-[-0.045em]">
                      New password.
                    </h2>

                    <p className="mt-3 text-sm leading-6 text-white/35">
                      Choose a new password for your StockSense account.
                    </p>


                    {error && (

                      <div className="mt-6 rounded-xl border border-red-400/20 bg-red-400/[0.06] px-4 py-3 text-xs text-red-300">
                        {error}
                      </div>

                    )}


                    <form
                      onSubmit={updatePassword}
                      className="mt-8 space-y-5"
                    >

                      {/* Password */}

                      <div>

                        <label className="mb-2.5 block text-xs font-medium text-white/55">
                          New password
                        </label>

                        <div className="relative">

                          <LockKeyhole
                            size={16}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20"
                          />

                          <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) =>
                              setPassword(e.target.value)
                            }
                            placeholder="Minimum 6 characters"
                            required
                            className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.035] pl-11 pr-12 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-violet-400/50"
                          />

                          <button
                            type="button"
                            onClick={() =>
                              setShowPassword(!showPassword)
                            }
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/70"
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

                        <label className="mb-2.5 block text-xs font-medium text-white/55">
                          Confirm password
                        </label>

                        <div className="relative">

                          <LockKeyhole
                            size={16}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20"
                          />

                          <input
                            type={showConfirm ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) =>
                              setConfirmPassword(e.target.value)
                            }
                            placeholder="Repeat your password"
                            required
                            className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.035] pl-11 pr-12 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-violet-400/50"
                          />

                          <button
                            type="button"
                            onClick={() =>
                              setShowConfirm(!showConfirm)
                            }
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/70"
                          >
                            {showConfirm ? (
                              <EyeOff size={16} />
                            ) : (
                              <Eye size={16} />
                            )}
                          </button>

                        </div>

                      </div>


                      <motion.button
                        type="submit"
                        disabled={loading}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.985 }}
                        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-white text-sm font-semibold text-black disabled:opacity-60"
                      >

                        {loading ? (
                          <>
                            <Loader2
                              size={16}
                              className="animate-spin"
                            />
                            Updating password...
                          </>
                        ) : (
                          <>
                            Update password
                            <CheckCircle2 size={16} />
                          </>
                        )}

                      </motion.button>

                    </form>

                  </motion.div>

                )}

              </AnimatePresence>


              {!success && (

                <div className="mt-8 flex items-center justify-center gap-2 text-[10px] text-white/20">

                  <ShieldCheck size={13} />

                  Secure account recovery

                </div>

              )}

            </div>

          </div>

        </motion.div>

      </div>

    </div>
  );
}
