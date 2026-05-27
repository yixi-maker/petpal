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
    <div className="flex border-b border-gray-100">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`flex-1 py-3 text-sm font-medium transition relative ${
            activeKey === tab.key ? 'text-brand-500' : 'text-gray-400'
          }`}
        >
          {tab.label}
          {activeKey === tab.key && (
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-brand-500 rounded-full" />
          )}
        </button>
      ))}
    </div>
  );
}
