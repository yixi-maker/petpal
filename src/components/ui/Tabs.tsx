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
    <div className="flex border-b border-border-light bg-surface-white">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`relative flex-1 py-2.5 text-[14px] font-medium transition-colors duration-150
            ${activeKey === tab.key ? 'text-coral-500' : 'text-ink-faded hover:text-ink-muted'}`}
        >
          {tab.label}
          {activeKey === tab.key && (
            <span className="absolute bottom-0 left-1/3 right-1/3 h-[2.5px] bg-coral-500 rounded-full" />
          )}
        </button>
      ))}
    </div>
  );
}
