'use client';

type Tab = { key: string; label: string };

export default function TabBar(props: {
  tabs: Tab[];
  active: string;
  onChange: (key: string) => void;
  wrapperClass: string;
}) {
  return (
    <div className={props.wrapperClass}>
      {props.tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          className={tab.key === props.active ? 'active' : ''}
          onClick={() => props.onChange(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
