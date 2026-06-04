'use client';

interface Tab {
  key: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  activeKey: string;
  onChange: (key: string) => void;
}

export function Tabs({ tabs, activeKey, onChange }: TabsProps) {
  return (
    <div className="flex gap-1 rounded-full border border-white/70 bg-white/70 p-1 shadow-[0_10px_24px_rgba(16,80,75,0.08)] backdrop-blur-xl">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`relative flex-1 rounded-full py-2 text-[14px] font-medium transition-all duration-150
            ${activeKey === tab.key
              ? 'bg-gradient-to-br from-teal-500 to-sea-500 text-white shadow-[0_8px_18px_rgba(29,138,128,0.22)]'
              : 'text-ink-faded hover:text-ink-muted'
            }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
