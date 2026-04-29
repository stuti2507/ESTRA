import { useEffect, useMemo, useState } from 'react';
import { hasSupabaseConfig, supabase } from './supabaseClient';

const disciplineTags = ['Economics', 'Healthcare', 'Policy', 'Biology', 'Psychology', 'Anthropology', 'Nutrition', 'Geopolitics', 'Technology', 'Environment'];
const regionTags = ['Europe', 'Asia', 'Americas', 'Global'];
const formatTags = ['Brief', 'Data Note', 'Commentary', 'Research Summary'];

const starterInsights = [
  {
    id: 1,
    title: 'Longevity Financing Models for Ageing Economies',
    body: 'Comparative policy scan across OECD systems shows prevention-first financing produces stronger labor participation and lower late-life acute care costs.',
    author: 'ESTRA Editorial',
    date: '2026-04-21',
    tags: { discipline: 'Economics', region: 'Global', format: 'Research Summary' },
    comments: [{ id: 1, author: 'Member A', text: 'Useful framing for fiscal ministries.', date: '2026-04-22' }],
  },
  {
    id: 2,
    title: 'Primary-Care Prevention Signals in Central Europe',
    body: 'Pilot regions integrating digital risk triage with GP networks report earlier interventions and measurable adherence gains.',
    author: 'ESTRA Member',
    date: '2026-04-25',
    tags: { discipline: 'Healthcare', region: 'Europe', format: 'Data Note' },
    comments: [],
  },
];

export default function App() {
  const [session, setSession] = useState(null);
  const [statusMessage, setStatusMessage] = useState('Ready.');
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [pendingConfirmationEmail, setPendingConfirmationEmail] = useState('');

  const [activeSection, setActiveSection] = useState('home');
  const [filter, setFilter] = useState({ discipline: 'All', region: 'All', format: 'All' });
  const [followedTags, setFollowedTags] = useState([]);
  const [savedInsightIds, setSavedInsightIds] = useState([]);
  const [insights, setInsights] = useState(starterInsights);
  const [commentDrafts, setCommentDrafts] = useState({});

  const [applicationForm, setApplicationForm] = useState({
    full_name: '', email: '', role: '', institution: '', expertise: '', linkedin_url: '', statement: '', cv_url: '',
  });

  const [applications, setApplications] = useState([]);

  const userRole = session?.user?.user_metadata?.role || 'public';
  const isAdmin = userRole === 'admin';
  const isApprovedMember = userRole === 'member' || isAdmin;

  useEffect(() => {
    if (!supabase) {
      setStatusMessage('Supabase is not configured. Running in demo mode.');
      return;
    }
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, nextSession) => setSession(nextSession));
    return () => subscription.unsubscribe();
  }, []);

  const handleAuth = async (event) => {
    event.preventDefault();
    if (!supabase) return;
    if (authMode === 'signup') {
      const { data, error } = await supabase.auth.signUp({ email: authEmail, password: authPassword, options: { emailRedirectTo: window.location.origin } });
      if (error) return setStatusMessage(error.message);
      if (data?.session) {
        setStatusMessage('Signup successful. You are now logged in.');
        setAuthOpen(false);
        return;
      }
      setPendingConfirmationEmail(authEmail);
      setStatusMessage('Account created. Confirm your email before login.');
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword });
    if (error) {
      setStatusMessage(error.message === 'Invalid login credentials' ? 'Invalid credentials or unconfirmed email. Confirm then try again.' : error.message);
      return;
    }
    setPendingConfirmationEmail('');
    setStatusMessage('Logged in successfully.');
    setAuthOpen(false);
  };

  const filteredInsights = useMemo(() => insights.filter((item) =>
    (filter.discipline === 'All' || item.tags.discipline === filter.discipline) &&
    (filter.region === 'All' || item.tags.region === filter.region) &&
    (filter.format === 'All' || item.tags.format === filter.format)), [insights, filter]);

  const handleApply = async (event) => {
    event.preventDefault();
    const payload = { ...applicationForm, status: 'pending', created_at: new Date().toISOString() };
    if (supabase) {
      const { error } = await supabase.from('applications').insert(payload);
      if (error) return setStatusMessage(error.message);
    }
    setApplications((prev) => [{ id: Date.now(), ...payload }, ...prev]);
    setStatusMessage('Application submitted. Admin review pending.');
    setApplicationForm({ full_name: '', email: '', role: '', institution: '', expertise: '', linkedin_url: '', statement: '', cv_url: '' });
  };

  const approveApplication = (id, nextStatus) => setApplications((prev) => prev.map((x) => x.id === id ? { ...x, status: nextStatus } : x));

  const publishInsight = (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const item = {
      id: Date.now(),
      title: String(form.get('title') || ''),
      body: String(form.get('body') || ''),
      author: session?.user?.email || 'Approved Member',
      date: new Date().toISOString().slice(0, 10),
      tags: { discipline: String(form.get('discipline')), region: String(form.get('region')), format: String(form.get('format')) },
      comments: [],
    };
    if (!item.title || !item.body || !item.tags.discipline || !item.tags.region || !item.tags.format) {
      setStatusMessage('All insight fields and tags are required.');
      return;
    }
    setInsights((prev) => [item, ...prev]);
    event.currentTarget.reset();
  };

  const toggleSaved = (id) => setSavedInsightIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  const toggleFollowTag = (tag) => setFollowedTags((prev) => prev.includes(tag) ? prev.filter((x) => x !== tag) : [...prev, tag]);

  const addComment = (insightId) => {
    const text = (commentDrafts[insightId] || '').trim();
    if (!text) return;
    setInsights((prev) => prev.map((item) => item.id !== insightId ? item : {
      ...item,
      comments: [...item.comments, { id: Date.now(), author: session?.user?.email || 'Approved Member', text, date: new Date().toISOString().slice(0, 10) }],
    }));
    setCommentDrafts((prev) => ({ ...prev, [insightId]: '' }));
  };

  return (
    <>
      <nav>
        <a href="#hero" className="nav-logo"><span className="nav-logo-name">ESTRA</span><span className="nav-logo-sub">Evidence Synthesis Translation Real-World Action</span></a>
        <div className="nav-links">
          <a href="#why-now">Structural Context</a><a href="#ecosystem">System Diagram</a><a href="#insights">Insights</a><a href="#team">Team</a>
        </div>
        <button className="nav-cta" onClick={() => setActiveSection('apply')}>Apply to Join</button>
      </nav>

      <section className="hero" id="hero">
        <div className="hero-inner">
          <h1 className="hero-title">ESTRA</h1>
          <p className="hero-sub">Evidence. Synthesis. Translation. Real-World Action.</p>
          <p className="hero-desc">Global Longevity Intelligence. Verified Science. Unified Experts. Policy in Motion.</p>
          <div className="hero-actions"><button className="btn-solid" onClick={() => setActiveSection('apply')}>Apply to Join</button><button className="btn-ghost" onClick={() => setAuthOpen(true)}>{session ? 'Account' : 'Sign up / Login'}</button></div>
        </div>
      </section>

      <section className="section" id="why-now">
        <div className="section-inner"><div className="why-grid">
          <article className="why-block"><div className="why-block-num">01</div><h3>Structural Context</h3><p><strong>By 2050, people aged 60+ will exceed 2.1 billion.</strong> The global population of people aged 60 and older is set to more than double, from 1 billion in 2020 to 2.1 billion by 2050, at an unprecedented pace across every country in the world. (Source: WHO, 2024)</p></article>
          <article className="why-block"><div className="why-block-num">02</div><h3>Economic Consequence</h3><p><strong>Unhealthy ageing costs the world $2 trillion every year.</strong> NCDs reduce labour supply, increase absenteeism, and push family caregivers out of the workforce. Bold action on healthy longevity could save 150 million lives and generate transformative economic value by 2050. (Source: World Bank, 2024)</p></article>
          <article className="why-block"><div className="why-block-num">03</div><h3>The Disease Burden</h3><p><strong>Non-communicable diseases cause 74% of global deaths.</strong> Healthcare systems now face chronic, long-duration diseases rather than infectious outbreaks. The shift demands prevention, early intervention, and long-term management. The tools exist. The policy frameworks do not. (Source: WHO)</p></article>
        </div></div>
      </section>

      <section className="why-closing"><div className="why-closing-inner"><h2 className="section-title" style={{ color: 'white' }}>A System Moment and The Missing Layer</h2><div className="pull">“Gagarin’s orbit in 1961 didn’t just make history. It triggered the largest coordinated scientific investment in human history. Longevity science is at the same inflection point. The geopolitical stakes are identical. The response is not.”</div><p><strong>Georgia Bailey</strong><br />Founder, ESTRA</p></div></section>

      <section className="section" id="ecosystem"><div className="section-inner"><h2 className="section-title">ESTRA System Network</h2><div className="eco-visual"><svg viewBox="0 0 420 300" width="100%" height="300" xmlns="http://www.w3.org/2000/svg"><circle cx="210" cy="150" r="46" fill="#2e4050"/><text x="210" y="156" fill="white" fontSize="20" textAnchor="middle">ESTRA</text><g stroke="#8fa7b3" strokeWidth="1" fill="white"><line x1="210" y1="104" x2="210" y2="45"/><line x1="250" y1="130" x2="342" y2="90"/><line x1="260" y1="165" x2="352" y2="208"/><line x1="210" y1="196" x2="210" y2="255"/><line x1="170" y1="165" x2="78" y2="208"/><line x1="170" y1="130" x2="78" y2="90"/></g><g fill="#2e4050" fontSize="13" textAnchor="middle"><circle cx="210" cy="30" r="24" fill="white" stroke="#8fa7b3"/><text x="210" y="35">Data</text><circle cx="360" cy="82" r="28" fill="white" stroke="#8fa7b3"/><text x="360" y="87">Insurers</text><circle cx="360" cy="218" r="32" fill="white" stroke="#8fa7b3"/><text x="360" y="223">Governments</text><circle cx="210" cy="270" r="35" fill="white" stroke="#8fa7b3"/><text x="210" y="266">Clinics &amp;</text><text x="210" y="281">Hospitals</text><circle cx="60" cy="218" r="24" fill="white" stroke="#8fa7b3"/><text x="60" y="223">Public</text><circle cx="60" cy="82" r="24" fill="white" stroke="#8fa7b3"/><text x="60" y="87">Experts</text></g></svg></div></div></section>

      <section className="section" id="insights">
        <div className="section-inner">
          <div className="label">Insights</div>
          <h2 className="section-title">Structured Publishing</h2>
          <div className="filters">
            <select value={filter.discipline} onChange={(e) => setFilter((p) => ({ ...p, discipline: e.target.value }))}><option>All</option>{disciplineTags.map((x) => <option key={x}>{x}</option>)}</select>
            <select value={filter.region} onChange={(e) => setFilter((p) => ({ ...p, region: e.target.value }))}><option>All</option>{regionTags.map((x) => <option key={x}>{x}</option>)}</select>
            <select value={filter.format} onChange={(e) => setFilter((p) => ({ ...p, format: e.target.value }))}><option>All</option>{formatTags.map((x) => <option key={x}>{x}</option>)}</select>
          </div>

          <div className="tag-row">{[...disciplineTags, ...regionTags, ...formatTags].map((tag) => <button key={tag} className={`eco-tag ${followedTags.includes(tag) ? 'active-tag' : ''}`} onClick={() => toggleFollowTag(tag)}>Follow {tag}</button>)}</div>

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
              <div className="insight-actions">
                <button className="btn-ghost" onClick={() => toggleSaved(item.id)}>{savedInsightIds.includes(item.id) ? 'Saved' : 'Save'}</button>
                {!isApprovedMember ? <span>{item.comments.length} members are discussing this</span> : <span>{item.comments.length} comments</span>}
              </div>
              {isApprovedMember && (
                <div className="comment-thread">
                  {item.comments.map((c) => <p key={c.id}><strong>{c.author}</strong>: {c.text}</p>)}
                  <textarea rows={2} value={commentDrafts[item.id] || ''} onChange={(e) => setCommentDrafts((prev) => ({ ...prev, [item.id]: e.target.value }))} placeholder="Add comment" />
                  <button className="btn-solid" onClick={() => addComment(item.id)}>Post Comment</button>
                </div>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className="section" id="team"><div className="section-inner"><h2 className="section-title">Member Profiles</h2><p className="section-body">Approved members maintain public profiles with institution, role, expertise tags, joined date, and insight publication stats.</p></div></section>

      <section className="section" id="apply" style={{ display: activeSection === 'apply' ? 'block' : 'none' }}>
        <div className="section-inner"><h2 className="section-title">Apply to Join</h2>
          <form className="publish-form" onSubmit={handleApply}>
            <input placeholder="Full Name" value={applicationForm.full_name} onChange={(e) => setApplicationForm((p) => ({ ...p, full_name: e.target.value }))} required />
            <input placeholder="Email" type="email" value={applicationForm.email} onChange={(e) => setApplicationForm((p) => ({ ...p, email: e.target.value }))} required />
            <input placeholder="Role" value={applicationForm.role} onChange={(e) => setApplicationForm((p) => ({ ...p, role: e.target.value }))} required />
            <input placeholder="Institution" value={applicationForm.institution} onChange={(e) => setApplicationForm((p) => ({ ...p, institution: e.target.value }))} required />
            <input placeholder="Area of Expertise" value={applicationForm.expertise} onChange={(e) => setApplicationForm((p) => ({ ...p, expertise: e.target.value }))} required />
            <input placeholder="LinkedIn URL" value={applicationForm.linkedin_url} onChange={(e) => setApplicationForm((p) => ({ ...p, linkedin_url: e.target.value }))} required />
            <textarea rows={3} placeholder="Statement of Interest" value={applicationForm.statement} onChange={(e) => setApplicationForm((p) => ({ ...p, statement: e.target.value }))} required />
            <input placeholder="Optional CV upload URL" value={applicationForm.cv_url} onChange={(e) => setApplicationForm((p) => ({ ...p, cv_url: e.target.value }))} />
            <button className="btn-solid" type="submit">Submit Application</button>
          </form>
        </div>
      </section>

      {isAdmin && (
        <section className="section"><div className="section-inner"><div className="label">Admin Dashboard</div><h2 className="section-title">Moderation & Approval</h2>
          {applications.map((app) => <div key={app.id} className="advisor-card"><div><strong>{app.full_name}</strong> ({app.email}) — {app.status}</div><div style={{ marginLeft: 'auto' }}><button className="btn-solid" onClick={() => approveApplication(app.id, 'approved')}>Approve</button><button className="btn-ghost" onClick={() => approveApplication(app.id, 'rejected')}>Reject</button></div></div>)}
        </div></section>
      )}

      <footer><div className="footer-logo">ESTRA</div><div className="footer-copy">{statusMessage}</div><button className="btn-ghost" onClick={() => setAuthOpen(true)}>{session ? 'Switch account' : 'Login'}</button></footer>

      {authOpen && <div className="auth-overlay" onClick={() => setAuthOpen(false)}><form className="auth-modal" onClick={(e) => e.stopPropagation()} onSubmit={handleAuth}><h3>{authMode === 'signup' ? 'Create account' : 'Login'}</h3><input type="email" placeholder="Email" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} required /><input type="password" placeholder="Password" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} required /><button type="submit">{authMode === 'signup' ? 'Sign Up' : 'Login'}</button><button type="button" className="link-btn" onClick={() => setAuthMode((p) => p === 'signup' ? 'login' : 'signup')}>{authMode === 'signup' ? 'Already have an account? Login' : 'Need an account? Sign up'}</button>{pendingConfirmationEmail && <button type="button" className="link-btn" onClick={async () => {
        if (!supabase) return;
        const { error } = await supabase.auth.resend({ type: 'signup', email: pendingConfirmationEmail, options: { emailRedirectTo: window.location.origin } });
        setStatusMessage(error ? error.message : `Confirmation email re-sent to ${pendingConfirmationEmail}.`);
      }}>Resend confirmation email</button>}<small>{statusMessage}</small></form></div>}
    </>
  );
}
