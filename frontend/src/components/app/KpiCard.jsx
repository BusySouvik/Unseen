import { motion } from "motion/react";

export default function KpiCard({
  label,
  value,
  icon: Icon,
  detail,
  accent = "indigo",
  delay = 0,
}) {
  const accents = {
    indigo: "text-indigo-300 bg-indigo-400/10",
    cyan: "text-cyan-300 bg-cyan-400/10",
    amber: "text-amber-300 bg-amber-400/10",
    emerald: "text-emerald-300 bg-emerald-400/10",
    red: "text-red-300 bg-red-400/10",
  };

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 15,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.5,
        delay,
      }}
      whileHover={{
        y: -3,
      }}
      className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 transition-colors hover:border-white/[0.13]"
    >

      <div className="flex items-start justify-between">

        <div>

          <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-white/30">
            {label}
          </p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay + 0.2 }}
            className="mt-3 text-3xl font-semibold tracking-[-0.04em]"
          >
            {value}
          </motion.p>

          {detail && (
            <p className="mt-2 text-[10px] text-white/25">
              {detail}
            </p>
          )}

        </div>


        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${accents[accent]}`}
        >
          <Icon size={18} />
        </div>

      </div>


      <div className="absolute bottom-0 left-0 h-px w-0 bg-gradient-to-r from-indigo-400 to-cyan-300 transition-all duration-500 group-hover:w-full" />

    </motion.div>
  );
}
