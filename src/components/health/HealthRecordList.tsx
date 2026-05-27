'use client';

import { Badge } from '@/components/ui';
import { ClipboardList } from 'lucide-react';

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

const typeConfig: Record<string, { label: string; variant: 'coral' | 'sage' | 'mist' | 'warning' | 'danger' | 'default' }> = {
  VACCINE: { label: '疫苗接种', variant: 'mist' },
  DEWORM: { label: '驱虫', variant: 'sage' },
  CHECKUP: { label: '体检', variant: 'coral' },
  SURGERY: { label: '手术', variant: 'danger' },
  MEDICATION: { label: '用药', variant: 'warning' },
  OTHER: { label: '其他', variant: 'default' },
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function HealthRecordList({ records }: HealthRecordListProps) {
  if (records.length === 0) {
    return (
      <div className="text-center py-12">
        <ClipboardList className="w-10 h-10 mx-auto mb-2 text-ink-faded/30" />
        <p className="text-[14px] text-ink-faded">暂无健康记录</p>
        <p className="text-[12px] text-ink-faded mt-1">点击上方按钮添加记录</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {records.map((record) => {
        const config = typeConfig[record.type] || typeConfig.OTHER;
        return (
          <div
            key={record.id}
            className="flex items-center gap-3 px-4 py-3 bg-surface-white rounded-[8px] border border-border-light"
          >
            <Badge variant={config.variant} size="md">
              {config.label}
            </Badge>
            <div className="flex-1 min-w-0">
              {record.description && (
                <p className="text-[14px] text-ink truncate">{record.description}</p>
              )}
              {!record.description && (
                <p className="text-[14px] text-ink-faded italic">无描述</p>
              )}
            </div>
            <span className="text-[12px] text-ink-faded flex-shrink-0">
              {formatDate(record.recordDate)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
