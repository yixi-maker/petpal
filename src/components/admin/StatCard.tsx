'use client';

interface StatCardProps {
  icon: React.ReactNode;
  value: number | string;
  label: string;
  color?: 'blue' | 'green' | 'orange' | 'red' | 'purple';
}

const colorMap: Record<string, { bg: string; text: string; iconBg: string }> = {
  blue: { bg: 'bg-blue-50', text: 'text-blue-600', iconBg: 'bg-blue-100' },
  green: { bg: 'bg-green-50', text: 'text-green-600', iconBg: 'bg-green-100' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-600', iconBg: 'bg-orange-100' },
  red: { bg: 'bg-red-50', text: 'text-red-600', iconBg: 'bg-red-100' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-600', iconBg: 'bg-purple-100' },
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
        <div className="text-sm text-gray-500">{label}</div>
      </div>
    </div>
  );
}
