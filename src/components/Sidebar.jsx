const sections = [
  { key: 'flagship', label: 'Flagship Project' },
  { key: 'geopolitics', label: 'Geopolitics Tracker' },
  { key: 'insights', label: 'Insights & Signals' },
];

export default function Sidebar({ active, onChange, userEmail, onLogout }) {
  return (
    <aside className="w-72 border-r border-slate-200 bg-white p-6">
      <h1 className="mb-10 text-lg font-semibold tracking-wide text-slate-700">ESTRA</h1>
      <nav className="mb-12 space-y-2">
        {sections.map((section) => (
          <button
            key={section.key}
            onClick={() => onChange(section.key)}
            className={`w-full rounded-md border px-4 py-3 text-left text-sm transition ${
              active === section.key
                ? 'border-accent-500 bg-accent-50 text-accent-700'
                : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            {section.label}
          </button>
        ))}
      </nav>
      <div className="mt-auto rounded-md border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
        <p className="font-medium">Signed in as</p>
        <p className="mb-3 truncate">{userEmail}</p>
        <button
          className="rounded border border-slate-300 px-2 py-1 text-xs text-slate-700 hover:bg-slate-100"
          onClick={onLogout}
        >
          Switch User
        </button>
      </div>
    </aside>
  );
}
