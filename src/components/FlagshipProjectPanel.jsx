const sections = ['Overview', 'Cost', 'Prevention', 'Implementation'];

export default function FlagshipProjectPanel({ data, setData, onSave, currentUser }) {
  const updateSection = (sectionName, field, value) => {
    setData((prev) =>
      prev.map((item) => (item.section_name === sectionName ? { ...item, [field]: value } : item)),
    );
  };

  return (
    <section>
      <h2 className="mb-5 text-2xl font-semibold text-slate-800">Flagship Project</h2>
      <div className="space-y-5">
        {sections.map((section) => {
          const record = data.find((item) => item.section_name === section);

          return (
            <article key={section} className="rounded-md border border-slate-200 bg-white p-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">{section}</h3>
                <button
                  onClick={() => onSave(record, currentUser)}
                  className="rounded border border-accent-500 px-2 py-1 text-xs text-accent-700 hover:bg-accent-50"
                >
                  Save
                </button>
              </div>
              <textarea
                value={record?.content || ''}
                onChange={(event) => updateSection(section, 'content', event.target.value)}
                rows={5}
                className="mb-3 w-full rounded border border-slate-300 px-3 py-2 text-sm"
                placeholder={`Add or update ${section.toLowerCase()} details...`}
              />
              <div className="mb-3 grid grid-cols-1 gap-2 md:grid-cols-3">
                <label className="text-xs text-slate-600">
                  Visibility
                  <select
                    className="mt-1 w-full rounded border border-slate-300 px-2 py-1"
                    value={record?.is_public ? 'public' : 'private'}
                    onChange={(event) => updateSection(section, 'is_public', event.target.value === 'public')}
                  >
                    <option value="private">Private</option>
                    <option value="public">Public</option>
                  </select>
                </label>
                <label className="col-span-2 flex items-center gap-2 rounded border border-slate-200 px-3 py-2 text-xs text-slate-600">
                  <input
                    type="checkbox"
                    checked={Boolean(record?.is_posted)}
                    onChange={(event) => updateSection(section, 'is_posted', event.target.checked)}
                  />
                  I am willing to post this for site visitors.
                </label>
              </div>
              <p className="text-xs text-slate-500">
                Last updated: {record?.last_updated ? new Date(record.last_updated).toLocaleString() : 'No updates yet'}
                {record?.updated_by ? ` • by ${record.updated_by}` : ''}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
