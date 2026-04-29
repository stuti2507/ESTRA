export default function AdminPanel({ applications, onApprove }) {
  return (
    <section className="section">
      <div className="section-inner">
        <div className="label">Admin Dashboard</div>
        <h2 className="section-title">Moderation &amp; Approval</h2>
        {applications.map((app) => (
          <div key={app.id} className="advisor-card">
            <div><strong>{app.full_name}</strong> ({app.email}) — {app.status}</div>
            <div style={{ marginLeft: 'auto' }}>
              <button className="btn-solid" onClick={() => onApprove(app.id, 'approved')}>Approve</button>
              <button className="btn-ghost" onClick={() => onApprove(app.id, 'rejected')}>Reject</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
