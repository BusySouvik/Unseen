export default function StatCard({ icon, label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
      <div className="flex items-center gap-2 text-white/40">
        {icon}
        <span className="text-xs">{label}</span>
      </div>

      <p className="mt-4 text-2xl font-semibold">
        {value}
      </p>
    </div>
  );
}
