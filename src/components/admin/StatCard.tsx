'use client';

interface StatCardProps {
  icon: React.ReactNode;
  value: number | string;
  label: string;
  color?: 'blue' | 'green' | 'teal' | 'rose';
}

const colorMap: Record<string, { bg: string; text: string; iconBg: string }> = {
  blue: { bg: 'bg-blue-50', text: 'text-blue-600', iconBg: 'bg-blue-100' },
  green: { bg: 'bg-green-50', text: 'text-green-600', iconBg: 'bg-green-100' },
  teal: { bg: 'bg-teal-50', text: 'text-teal-600', iconBg: 'bg-teal-100' },
  rose: { bg: 'bg-rose-50', text: 'text-rose-600', iconBg: 'bg-rose-100' },
};

export function StatCard({ icon, value, label, color = 'blue' }: StatCardProps) {
  const c = colorMap[color];
  return (
    <div className={`${c.bg} rounded-2xl p-5 flex items-center gap-4`}>
      <div className={`${c.iconBg} w-12 h-12 rounded-xl flex items-center justify-center ${c.text}`}>
        {icon}
      </div>
      <div>
        <div className={`text-2xl font-bold ${c.text}`}>{value}</div>
        <div className="text-sm text-ink-muted">{label}</div>
      </div>
    </div>
  );
}
