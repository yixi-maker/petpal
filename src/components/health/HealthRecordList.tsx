'use client';

import { Syringe, Stethoscope, Scissors, Shield, Pill, ClipboardList } from 'lucide-react';

interface HealthRecord {
  id: number;
  type: string;
  recordDate: string;
  description?: string | null;
  images?: string;
  createdAt: string;
}

interface HealthRecordListProps {
  records: HealthRecord[];
}

const typeConfig: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  VACCINE: { label: '疫苗接种', icon: Syringe, color: 'text-blue-500' },
  DEWORM: { label: '驱虫', icon: Shield, color: 'text-emerald-500' },
  CHECKUP: { label: '体检', icon: Stethoscope, color: 'text-purple-500' },
  SURGERY: { label: '手术', icon: Scissors, color: 'text-red-500' },
  MEDICATION: { label: '用药', icon: Pill, color: 'text-orange-500' },
  OTHER: { label: '其他', icon: ClipboardList, color: 'text-gray-500' },
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function HealthRecordList({ records }: HealthRecordListProps) {
  if (records.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <ClipboardList className="w-10 h-10 mx-auto mb-2 opacity-30" />
        <p className="text-sm">暂无健康记录</p>
        <p className="text-xs mt-1">点击下方按钮添加记录</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {records.map((record) => {
        const config = typeConfig[record.type] || typeConfig.OTHER;
        const Icon = config.icon;
        return (
          <div key={record.id} className="flex gap-3 p-4 bg-white rounded-xl border border-gray-100">
            <div className={`mt-0.5 ${config.color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-800">{config.label}</span>
                <span className="text-xs text-gray-400">{formatDate(record.recordDate)}</span>
              </div>
              {record.description && (
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{record.description}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
