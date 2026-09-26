import { motion } from "motion/react";

export default function FeatureCard({ icon, title, text }) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      className="group rounded-3xl border border-white/10 bg-white/[0.025] p-7 transition hover:border-white/20 hover:bg-white/[0.045]"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-indigo-300">
        {icon}
      </div>

      <h3 className="mt-7 text-xl font-semibold">
        {title}
      </h3>

      <p className="mt-3 leading-7 text-white/45">
        {text}
      </p>
    </motion.div>
  );
}
