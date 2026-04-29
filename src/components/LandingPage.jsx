import { useMemo, useState } from 'react';
import WhyNowSection from './sections/WhyNowSection';
import EcosystemSection from './sections/EcosystemSection';
import WhyEstraSection from './sections/WhyEstraSection';
import TeamSection from './sections/TeamSection';
import ApplyForm from './ApplyForm';
import AdminPanel from './AdminPanel';

const disciplineTags = ['Economics', 'Healthcare', 'Policy', 'Biology', 'Psychology', 'Anthropology', 'Nutrition', 'Geopolitics', 'Technology', 'Environment'];
const regionTags = ['Europe', 'Asia', 'Americas', 'Global'];
const formatTags = ['Brief', 'Data Note', 'Commentary', 'Research Summary'];

const starterInsights = [
  { id: 1, title: 'Longevity Financing Models for Ageing Economies', body: 'Comparative policy scan across OECD systems shows prevention-first financing produces stronger labor participation and lower late-life acute care costs.', author: 'ESTRA Editorial', date: '2026-04-21', tags: { discipline: 'Economics', region: 'Global', format: 'Research Summary' }, comments: [{ id: 1, author: 'Member A', text: 'Useful framing for fiscal ministries.', date: '2026-04-22' }] },
  { id: 2, title: 'Primary-Care Prevention Signals in Central Europe', body: 'Pilot regions integrating digital risk triage with GP networks report earlier interventions and measurable adherence gains.', author: 'ESTRA Member', date: '2026-04-25', tags: { discipline: 'Healthcare', region: 'Europe', format: 'Data Note' }, comments: [] },
];

const starterMembers = [
  { id: 1, name: 'Georgia Bailey', role: 'Founder', institution: 'ESTRA', linkedin: '#', expertise: ['Policy', 'Geopolitics'], joined: '2025-02-15', insightsCount: 3 },
  { id: 2, name: 'Stuti Iyer', role: 'Technical Lead', institution: 'ESTRA', linkedin: '#', expertise: ['Technology', 'Healthcare'], joined: '2025-03-02', insightsCount: 2 },
];

export default function LandingPage({ session, userRole, statusMessage, onOpenAuth, onOpenWorkspace }) {
  const [filter, setFilter] = useState({ discipline: 'All', region: 'All', format: 'All' });
  const [followedTags, setFollowedTags] = useState([]);
  const [followedMembers, setFollowedMembers] = useState([]);
  const [savedInsightIds, setSavedInsightIds] = useState([]);
  const [insights, setInsights] = useState(starterInsights);
  const [commentDrafts, setCommentDrafts] = useState({});
  const [applications, setApplications] = useState([]);
  const [notificationMessage, setNotificationMessage] = useState('Notifications: off');

  const isAdmin = userRole === 'admin';
  const isApprovedMember = userRole === 'member' || isAdmin;

  const filteredInsights = useMemo(() => insights.filter((item) => (filter.discipline === 'All' || item.tags.discipline === filter.discipline) && (filter.region === 'All' || item.tags.region === filter.region) && (filter.format === 'All' || item.tags.format === filter.format)), [insights, filter]);

  const publishInsight = (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const item = {
      id: Date.now(),
      title: String(form.get('title') || ''),
      body: String(form.get('body') || ''),
      author: session?.user?.email || 'Approved Member',
      date: new Date().toISOString().slice(0, 10),
      tags: { discipline: String(form.get('discipline') || ''), region: String(form.get('region') || ''), format: String(form.get('format') || '') },
      comments: [],
    };
    if (!item.title || !item.body || !item.tags.discipline || !item.tags.region || !item.tags.format) return;
    setInsights((prev) => [item, ...prev]);
    event.currentTarget.reset();
  };

  const addComment = (insightId) => {
    const text = (commentDrafts[insightId] || '').trim();
    if (!text) return;
    setInsights((prev) => prev.map((item) => item.id !== insightId ? item : { ...item, comments: [...item.comments, { id: Date.now(), author: session?.user?.email || 'Approved Member', text, date: new Date().toISOString().slice(0, 10) }] }));
    setCommentDrafts((prev) => ({ ...prev, [insightId]: '' }));
  };

  return (
    <>
      <nav>
        <a href="#hero" className="nav-logo"><span className="nav-logo-name steel-logo">ESTRA</span><span className="nav-logo-sub">Evidence Synthesis Translation Real-World Action</span></a>
        <div className="nav-links"><a href="#why-now">Structural Context</a><a href="#ecosystem">System Diagram</a><a href="#insights">Insights</a><a href="#profiles">Profiles</a></div>
        <button className="nav-cta" onClick={() => window.location.assign('#apply')}>Apply to Join</button>
      </nav>

      <section className="hero" id="hero">
        <div className="hero-inner">
          <h1 className="hero-title steel-logo">ESTRA</h1>
          <p className="hero-sub">Evidence. Synthesis. Translation. Real-World Action.</p>
          <p className="hero-desc">Global Longevity Intelligence.<br />Verified Science. Unified Experts. Policy in Motion.</p>
          <div className="hero-actions"><button className="btn-solid" onClick={() => window.location.assign('#apply')}>Apply to Join</button><button className="btn-ghost" onClick={onOpenAuth}>{session ? 'Account' : 'Sign up / Login'}</button>{session && <button className="btn-ghost" onClick={onOpenWorkspace}>Open Workspace</button>}</div>
        </div>
      </section>

      <WhyNowSection />
      <EcosystemSection />
      <WhyEstraSection />

      <section className="section" id="insights">
        <div className="section-inner">
          <div className="label">Insights</div>
          <h2 className="section-title">Structured Publishing</h2>
          <div className="filters"><select value={filter.discipline} onChange={(e) => setFilter((p) => ({ ...p, discipline: e.target.value }))}><option>All</option>{disciplineTags.map((x) => <option key={x}>{x}</option>)}</select><select value={filter.region} onChange={(e) => setFilter((p) => ({ ...p, region: e.target.value }))}><option>All</option>{regionTags.map((x) => <option key={x}>{x}</option>)}</select><select value={filter.format} onChange={(e) => setFilter((p) => ({ ...p, format: e.target.value }))}><option>All</option>{formatTags.map((x) => <option key={x}>{x}</option>)}</select></div>
          <div className="tag-row">{[...disciplineTags, ...regionTags, ...formatTags].map((tag) => <button key={tag} className={`eco-tag ${followedTags.includes(tag) ? 'active-tag' : ''}`} onClick={() => setFollowedTags((prev) => prev.includes(tag) ? prev.filter((x) => x !== tag) : [...prev, tag])}>Follow {tag}</button>)}</div>
          <button className="btn-ghost" onClick={() => setNotificationMessage('Notifications: mock subscribed to followed tags and members')}>Enable Notifications (Mock)</button>
          <p className="section-body" style={{ marginTop: 10 }}>{notificationMessage}</p>

          {isApprovedMember && (
            <form className="publish-form" onSubmit={publishInsight}>
              <h3>Publish Insight (Approved Members)</h3>
              <input name="title" placeholder="Title" required />
              <textarea name="body" placeholder="Body" required rows={5} />
              <div className="filters"><select name="discipline" required><option value="">Discipline</option>{disciplineTags.map((x) => <option key={x}>{x}</option>)}</select><select name="region" required><option value="">Region</option>{regionTags.map((x) => <option key={x}>{x}</option>)}</select><select name="format" required><option value="">Format</option>{formatTags.map((x) => <option key={x}>{x}</option>)}</select></div>
              <button className="btn-solid" type="submit">Publish Insight</button>
            </form>
          )}

          {filteredInsights.map((item) => (
            <article key={item.id} className="public-card insight-card">
              <div className="tag-meta">{item.tags.discipline} · {item.tags.region} · {item.tags.format}</div>
              <h3>{item.title}</h3>
              <div className="tag-meta">{item.author} · {item.date}</div>
              <p>{item.body}</p>
              <div className="insight-actions"><button className="btn-ghost" onClick={() => setSavedInsightIds((prev) => prev.includes(item.id) ? prev.filter((x) => x !== item.id) : [...prev, item.id])}>{savedInsightIds.includes(item.id) ? 'Saved' : 'Save'}</button>{!isApprovedMember ? <span>{item.comments.length} members are discussing this</span> : <span>{item.comments.length} comments</span>}</div>
              {isApprovedMember && <div className="comment-thread">{item.comments.map((c) => <p key={c.id}><strong>{c.author}</strong>: {c.text}</p>)}<textarea rows={2} value={commentDrafts[item.id] || ''} onChange={(e) => setCommentDrafts((prev) => ({ ...prev, [item.id]: e.target.value }))} placeholder="Add comment" /><button className="btn-solid" onClick={() => addComment(item.id)}>Post Comment</button></div>}
            </article>
          ))}
        </div>
      </section>

      <section className="section" id="profiles"><div className="section-inner"><div className="label">Approved Members</div><h2 className="section-title">Member Profiles</h2><div className="team-grid">{starterMembers.map((m) => <div key={m.id} className="team-card"><div className="team-avatar">{m.name.split(' ').map((x) => x[0]).join('').slice(0, 2)}</div><div className="team-role">{m.role}</div><div className="team-name">{m.name}</div><p className="team-desc">{m.institution} · Joined {m.joined}<br />Expertise: {m.expertise.join(', ')}<br />Insights published: {m.insightsCount}</p><button className="btn-ghost" onClick={() => setFollowedMembers((prev) => prev.includes(m.id) ? prev.filter((x) => x !== m.id) : [...prev, m.id])}>{followedMembers.includes(m.id) ? 'Following' : 'Follow Member'}</button></div>)}</div></div></section>

      <TeamSection />

      <section className="section" id="apply"><div className="section-inner"><h2 className="section-title">Apply to Join</h2><ApplyForm onStatus={() => {}} onLocalSubmit={(payload) => setApplications((prev) => [{ id: Date.now(), ...payload }, ...prev])} /></div></section>
      {isAdmin && <AdminPanel applications={applications} onApprove={(id, status) => setApplications((prev) => prev.map((x) => x.id === id ? { ...x, status } : x))} />}

      <footer><div className="footer-logo steel-logo">ESTRA</div><div className="footer-copy">{statusMessage}</div><button className="btn-ghost" onClick={onOpenAuth}>{session ? 'Switch account' : 'Login'}</button></footer>
    </>
  );
}
