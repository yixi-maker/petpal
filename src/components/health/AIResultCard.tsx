'use client';

import { ShieldAlert, ShieldCheck, ShieldMinus, AlertTriangle, Info, AlertCircle, CheckCircle2 } from 'lucide-react';
import { AITriageResult } from '@/lib/ai-provider';

interface AIResultCardProps {
  result: AITriageResult;
}

const riskConfig = {
  LOW: {
    label: '低风险',
    bg: 'bg-green-50',
    border: 'border-green-200',
    badgeBg: 'bg-green-100',
    badgeText: 'text-green-700',
    icon: ShieldCheck,
    iconColor: 'text-green-500',
  },
  MEDIUM: {
    label: '中风险',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    badgeBg: 'bg-orange-100',
    badgeText: 'text-orange-700',
    icon: ShieldMinus,
    iconColor: 'text-orange-500',
  },
  HIGH: {
    label: '高风险',
    bg: 'bg-red-50',
    border: 'border-red-200',
    badgeBg: 'bg-red-100',
    badgeText: 'text-red-700',
    icon: ShieldAlert,
    iconColor: 'text-red-500',
  },
};

export function AIResultCard({ result }: AIResultCardProps) {
  const config = riskConfig[result.riskLevel];
  const Icon = config.icon;

  return (
    <div className={`rounded-2xl border p-5 ${config.bg} ${config.border}`}>
      {/* Header with risk badge */}
      <div className="flex items-center gap-3 mb-4">
        <Icon className={`w-6 h-6 ${config.iconColor}`} />
        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${config.badgeBg} ${config.badgeText}`}>
          {config.label}
        </span>
      </div>

      {/* Possible conditions */}
      <Section icon={AlertTriangle} color="text-amber-500" title="可能相关的情况">
        <ol className="list-decimal pl-5 space-y-1">
          {result.possibleConditions.map((c, i) => (
            <li key={i} className="text-sm text-gray-700">{c}</li>
          ))}
        </ol>
      </Section>

      {/* Home care advice */}
      <Section icon={CheckCircle2} color="text-emerald-500" title="居家护理建议">
        <ul className="list-disc pl-5 space-y-1">
          {result.homeCareAdvice.map((a, i) => (
            <li key={i} className="text-sm text-gray-700">{a}</li>
          ))}
        </ul>
      </Section>

      {/* Should see vet */}
      <Section icon={AlertCircle} color={result.shouldSeeVet ? 'text-red-500' : 'text-gray-400'} title="是否建议就医">
        <p className={`text-sm font-medium ${result.shouldSeeVet ? 'text-red-600' : 'text-gray-600'}`}>
          {result.shouldSeeVet ? '建议前往宠物医院就诊' : '暂不建议紧急就医'}
        </p>
        {result.urgencyNote && (
          <p className="text-sm text-gray-600 mt-1">{result.urgencyNote}</p>
        )}
      </Section>

      {/* Precautions */}
      <Section icon={Info} color="text-blue-500" title="注意事项">
        <ul className="list-disc pl-5 space-y-1">
          {result.precautions.map((p, i) => (
            <li key={i} className="text-sm text-gray-700">{p}</li>
          ))}
        </ul>
      </Section>

      {/* Disclaimer */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-400 italic whitespace-pre-line leading-relaxed">
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
        <h4 className="text-sm font-semibold text-gray-800">{title}</h4>
      </div>
      {children}
    </div>
  );
}
