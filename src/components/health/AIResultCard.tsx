'use client';

import { CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { AITriageResult } from '@/lib/ai-provider';

interface AIResultCardProps {
  result: AITriageResult;
}

const riskConfig = {
  LOW: {
    label: '低风险',
    bg: 'bg-sage-50',
    border: 'border-sage-400/30',
    badgeBg: 'bg-sage-100',
    badgeText: 'text-sage-600',
    icon: CheckCircle,
    iconColor: 'text-sage-500',
  },
  MEDIUM: {
    label: '中风险',
    bg: 'bg-amber-50',
    border: 'border-amber-500/20',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-500',
    icon: AlertTriangle,
    iconColor: 'text-amber-500',
  },
  HIGH: {
    label: '高风险',
    bg: 'bg-rose-50',
    border: 'border-rose-500/20',
    badgeBg: 'bg-rose-50',
    badgeText: 'text-rose-500',
    icon: AlertTriangle,
    iconColor: 'text-rose-500',
  },
};

export function AIResultCard({ result }: AIResultCardProps) {
  const config = riskConfig[result.riskLevel];
  const Icon = config.icon;

  return (
    <div className={`rounded-[12px] border p-5 ${config.bg} ${config.border}`}>
      {/* Header with risk badge */}
      <div className="flex items-center gap-3 mb-4">
        <Icon className={`w-6 h-6 ${config.iconColor}`} />
        <span className={`px-3 py-1 rounded-full text-[13px] font-semibold ${config.badgeBg} ${config.badgeText}`}>
          {config.label}
        </span>
      </div>

      {/* Possible conditions */}
      <Section icon={AlertTriangle} color="text-amber-500" title="可能相关的情况">
        <ol className="list-decimal pl-5 space-y-1">
          {result.possibleConditions.map((c, i) => (
            <li key={i} className="text-[14px] text-ink-muted">{c}</li>
          ))}
        </ol>
      </Section>

      {/* Home care advice */}
      <Section icon={CheckCircle} color="text-sage-500" title="居家护理建议">
        <ul className="list-disc pl-5 space-y-1">
          {result.homeCareAdvice.map((a, i) => (
            <li key={i} className="text-[14px] text-ink-muted">{a}</li>
          ))}
        </ul>
      </Section>

      {/* Should see vet */}
      <Section icon={AlertTriangle} color={result.shouldSeeVet ? 'text-rose-500' : 'text-ink-faded'} title="是否建议就医">
        <p className={`text-[14px] font-medium ${result.shouldSeeVet ? 'text-rose-500' : 'text-ink-muted'}`}>
          {result.shouldSeeVet ? '建议前往宠物医院就诊' : '暂不建议紧急就医'}
        </p>
        {result.urgencyNote && (
          <p className="text-[14px] text-ink-muted mt-1">{result.urgencyNote}</p>
        )}
      </Section>

      {/* Precautions */}
      <Section icon={Info} color="text-sea-500" title="注意事项">
        <ul className="list-disc pl-5 space-y-1">
          {result.precautions.map((p, i) => (
            <li key={i} className="text-[14px] text-ink-muted">{p}</li>
          ))}
        </ul>
      </Section>

      {/* Disclaimer */}
      <div className="mt-4 pt-4 border-t border-border">
        <p className="text-[12px] text-ink-faded italic whitespace-pre-line leading-relaxed">
          {result.disclaimer}
        </p>
      </div>
    </div>
  );
}

function Section({
  icon: Icon,
  color,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${color}`} />
        <h4 className="text-[14px] font-semibold text-ink">{title}</h4>
      </div>
      {children}
    </div>
  );
}
