const emptyRow = {
  country: '',
  policy: '',
  status: 'Planned',
  impact: '',
  source: '',
  notes: '',
  is_public: false,
  is_posted: false,
};

const statuses = ['Planned', 'Active', 'Scaling'];

export default function GeopoliticsTrackerPanel({ data, setData, onSaveRow, onAddRow, filterStatus, setFilterStatus }) {
  const visible = filterStatus === 'All' ? data : data.filter((row) => row.status === filterStatus);

  const updateCell = (id, field, value) => {
    setData((rows) => rows.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  };

  return (
    <section>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-slate-800">Geopolitics Tracker</h2>
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500">Status</label>
          <select
            className="rounded border border-slate-300 px-2 py-1 text-sm"
            value={filterStatus}
            onChange={(event) => setFilterStatus(event.target.value)}
          >
            <option>All</option>
            {statuses.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
          <button
            onClick={() => onAddRow({ ...emptyRow })}
            className="rounded bg-accent-500 px-3 py-1.5 text-sm text-white hover:bg-accent-700"
          >
            Add Row
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-md border border-slate-200 bg-white">
        <table className="w-full min-w-[1200px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              {['Country', 'Policy', 'Status', 'Impact', 'Source', 'Notes', 'Visibility', 'Post', 'Last Updated', 'Actions'].map((head) => (
                <th key={head} className="px-3 py-2 font-medium">
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => (
              <tr key={row.id} className="border-b border-slate-100 align-top">
                <td className="px-3 py-2"><input className="w-40 rounded border border-slate-300 px-2 py-1" value={row.country || ''} onChange={(event) => updateCell(row.id, 'country', event.target.value)} /></td>
                <td className="px-3 py-2"><input className="w-56 rounded border border-slate-300 px-2 py-1" value={row.policy || ''} onChange={(event) => updateCell(row.id, 'policy', event.target.value)} /></td>
                <td className="px-3 py-2">
                  <select className="rounded border border-slate-300 px-2 py-1" value={row.status || 'Planned'} onChange={(event) => updateCell(row.id, 'status', event.target.value)}>
                    {statuses.map((status) => <option key={status}>{status}</option>)}
                  </select>
                </td>
                <td className="px-3 py-2"><input className="w-56 rounded border border-slate-300 px-2 py-1" value={row.impact || ''} onChange={(event) => updateCell(row.id, 'impact', event.target.value)} /></td>
                <td className="px-3 py-2"><input className="w-56 rounded border border-slate-300 px-2 py-1" value={row.source || ''} onChange={(event) => updateCell(row.id, 'source', event.target.value)} /></td>
                <td className="px-3 py-2"><textarea className="w-64 rounded border border-slate-300 px-2 py-1" rows={2} value={row.notes || ''} onChange={(event) => updateCell(row.id, 'notes', event.target.value)} /></td>
                <td className="px-3 py-2">
                  <select className="rounded border border-slate-300 px-2 py-1" value={row.is_public ? 'public' : 'private'} onChange={(event) => updateCell(row.id, 'is_public', event.target.value === 'public')}>
                    <option value="private">Private</option>
                    <option value="public">Public</option>
                  </select>
                </td>
                <td className="px-3 py-2"><input type="checkbox" checked={Boolean(row.is_posted)} onChange={(event) => updateCell(row.id, 'is_posted', event.target.checked)} /></td>
                <td className="px-3 py-2 text-xs text-slate-500">{row.last_updated ? new Date(row.last_updated).toLocaleString() : '—'}</td>
                <td className="px-3 py-2">
                  <button onClick={() => onSaveRow(row)} className="rounded border border-accent-500 px-2 py-1 text-xs text-accent-700 hover:bg-accent-50">Save</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
