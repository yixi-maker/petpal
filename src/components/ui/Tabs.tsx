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
    <div className="flex items-center justify-center gap-2 rounded-full border border-white/60 bg-white/55 p-1 shadow-[0_10px_24px_rgba(16,80,75,0.07)] backdrop-blur-2xl">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`relative flex-1 rounded-full py-2 text-[14px] font-semibold transition-all duration-200
            ${activeKey === tab.key
              ? 'bg-white text-teal-700 shadow-[0_8px_20px_rgba(16,80,75,0.11)]'
              : 'text-ink-faded hover:text-ink-muted'
            }`}
        >
          {tab.label}
          {activeKey === tab.key && (
            <span className="absolute bottom-[5px] left-1/2 h-[3px] w-5 -translate-x-1/2 rounded-full bg-gradient-to-r from-teal-400 to-sea-400" />
          )}
        </button>
      ))}
    </div>
  );
}
