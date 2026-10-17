const variants = {
  High: 'bg-red-500/15 text-red-400 border-red-500/30',
  Medium: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  Low: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  // Tag colors
  Backend: 'bg-violet-500/15 text-violet-400 border-violet-500/30',
  Frontend: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
  Design: 'bg-pink-500/15 text-pink-400 border-pink-500/30',
  DevOps: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  default: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
};

export default function Badge({ label, variant, size = 'sm' }) {
  const colorClass = variants[variant || label] || variants.default;
  const sizeClass = size === 'xs' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-0.5';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${colorClass} ${sizeClass}`}
    >
      {label}
    </span>
  );
}
