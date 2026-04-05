import { useEffect, useMemo, useState } from 'react';
import Sidebar from './components/Sidebar';
import FlagshipProjectPanel from './components/FlagshipProjectPanel';
import GeopoliticsTrackerPanel from './components/GeopoliticsTrackerPanel';
import InsightsSignalsPanel from './components/InsightsSignalsPanel';
import { hasSupabaseConfig, supabase } from './supabaseClient';

export default function App() {
  const [session, setSession] = useState(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [activeSection, setActiveSection] = useState('flagship');
  const [workspaceOpen, setWorkspaceOpen] = useState(false);

  const [flagshipProject, setFlagshipProject] = useState([]);
  const [geopoliticsTracker, setGeopoliticsTracker] = useState([]);
  const [insightsSignals, setInsightsSignals] = useState([]);
  const [filterStatus, setFilterStatus] = useState('All');
  const [statusMessage, setStatusMessage] = useState('Ready.');

  const ensureFlagshipSections = (rows = []) => {
    const names = ['Overview', 'Cost', 'Prevention', 'Implementation'];
    return names.map(
      (name) =>
        rows.find((row) => row.section_name === name) || {
          section_name: name,
          content: '',
          updated_by: '',
          last_updated: null,
          is_public: false,
          is_posted: false,
        },
    );
  };

  const fetchAll = async () => {
    if (!supabase) return;
    const [flagshipRes, geoRes, insightsRes] = await Promise.all([
      supabase.from('flagship_project').select('*').order('id', { ascending: true }),
      supabase.from('geopolitics_tracker').select('*').order('id', { ascending: true }),
      supabase.from('insights_signals').select('*').order('date', { ascending: false }),
    ]);

    if (!flagshipRes.error) setFlagshipProject(ensureFlagshipSections(flagshipRes.data || []));
    if (!geoRes.error) setGeopoliticsTracker(geoRes.data || []);
    if (!insightsRes.error) setInsightsSignals(insightsRes.data || []);
  };

  useEffect(() => {
    if (!supabase) {
      setStatusMessage('Supabase is not configured. Add env keys to connect shared data.');
      return;
    }

    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const {
      data: { subscription: authSub },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession));

    fetchAll();
    const channel = supabase
      .channel('estra-live-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'flagship_project' }, fetchAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'geopolitics_tracker' }, fetchAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'insights_signals' }, fetchAll)
      .subscribe();

    return () => {
      authSub.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, []);

  const handleAuth = async (event) => {
    event.preventDefault();
    if (!supabase) return;

    if (authMode === 'signup') {
      const { error } = await supabase.auth.signUp({ email: authEmail, password: authPassword });
      setStatusMessage(error ? error.message : 'Signup successful. You can now log in.');
      if (!error) setAuthMode('login');
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword });
    setStatusMessage(error ? error.message : 'Logged in successfully.');
    if (!error) {
      setAuthOpen(false);
      setWorkspaceOpen(true);
    }
  };

  const saveFlagshipSection = async (record) => {
    if (!supabase) return;
    const payload = {
      section_name: record.section_name,
      content: record.content || '',
      updated_by: session?.user?.email || '',
      last_updated: new Date().toISOString(),
      is_public: Boolean(record.is_public),
      is_posted: Boolean(record.is_posted),
    };
    const query = record.id
      ? supabase.from('flagship_project').update(payload).eq('id', record.id)
      : supabase.from('flagship_project').insert(payload);
    const { error } = await query;
    setStatusMessage(error ? error.message : `${record.section_name} saved.`);
    if (!error) fetchAll();
  };

  const saveTrackerRow = async (row) => {
    if (!supabase) return;
    const payload = {
      country: row.country || '',
      policy: row.policy || '',
      status: row.status || 'Planned',
      impact: row.impact || '',
      source: row.source || '',
      notes: row.notes || '',
      last_updated: new Date().toISOString(),
      is_public: Boolean(row.is_public),
      is_posted: Boolean(row.is_posted),
    };
    const query = row.id
      ? supabase.from('geopolitics_tracker').update(payload).eq('id', row.id)
      : supabase.from('geopolitics_tracker').insert(payload);
    const { error } = await query;
    setStatusMessage(error ? error.message : 'Tracker row saved.');
    if (!error) fetchAll();
  };

  const addTrackerRow = async (row) => setGeopoliticsTracker((prev) => [{ ...row, id: Date.now() }, ...prev]);

  const saveInsight = async (item) => {
    if (!supabase) return;
    const payload = {
      title: item.title || '',
      author: item.author || '',
      type: item.type || 'Insight',
      summary: item.summary || '',
      tags: item.tags || '',
      date: item.date || new Date().toISOString().split('T')[0],
      is_public: Boolean(item.is_public),
      is_posted: Boolean(item.is_posted),
    };
    const query = item.id
      ? supabase.from('insights_signals').update(payload).eq('id', item.id)
      : supabase.from('insights_signals').insert(payload);
    const { error } = await query;
    setStatusMessage(error ? error.message : 'Insight entry saved.');
    if (!error) fetchAll();
  };

  const publicFlagship = flagshipProject.filter((x) => x.is_public && x.is_posted && x.content);
  const publicGeo = geopoliticsTracker.filter((x) => x.is_public && x.is_posted);
  const publicInsights = insightsSignals.filter((x) => x.is_public && x.is_posted);

  const workspaceView = useMemo(() => {
    if (activeSection === 'geopolitics') {
      return (
        <GeopoliticsTrackerPanel
          data={geopoliticsTracker}
          setData={setGeopoliticsTracker}
          onSaveRow={saveTrackerRow}
          onAddRow={addTrackerRow}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
        />
      );
    }
    if (activeSection === 'insights') {
      return (
        <InsightsSignalsPanel
          data={insightsSignals}
          setData={setInsightsSignals}
          onSaveItem={saveInsight}
          onCreate={saveInsight}
        />
      );
    }
    return (
      <FlagshipProjectPanel
        data={flagshipProject}
        setData={setFlagshipProject}
        onSave={saveFlagshipSection}
        currentUser={session?.user?.email || ''}
      />
    );
  }, [activeSection, filterStatus, flagshipProject, geopoliticsTracker, insightsSignals, session]);

  if (workspaceOpen) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar
          active={activeSection}
          onChange={setActiveSection}
          userEmail={session?.user?.email || 'Unknown'}
          onLogout={async () => {
            if (supabase) await supabase.auth.signOut();
            setWorkspaceOpen(false);
          }}
        />
        <main className="flex-1 p-8">
          <div className="mb-5 rounded-md border border-slate-200 bg-white px-4 py-2 text-xs text-slate-600">{statusMessage}</div>
          {workspaceView}
        </main>
      </div>
    );
  }

  return (
    <>
      <nav>
        <a href="#hero" className="nav-logo"><span className="nav-logo-name">ESTRA</span><span className="nav-logo-sub">Evidence · Synthesis · Translation · Real-World Action</span></a>
        <div className="nav-links">
          <a href="#why-now">Why Now</a><a href="#ecosystem">Ecosystem</a><a href="#why-estra">Why ESTRA</a><a href="#team">Team</a>
        </div>
        <button className="nav-cta" onClick={() => { setAuthOpen(true); setAuthMode(session ? 'login' : 'signup'); }}>Apply to Participate</button>
      </nav>

      <section className="hero" id="hero">
        <div className="hero-inner">
          <div className="hero-eyebrow">Annual Gathering <span>·</span> Healthy Longevity <span>·</span> Global Intelligence</div>
          <h1 className="hero-title">ESTRA <em>Forum</em></h1>
          <p className="hero-sub">Evidence · Synthesis · Translation · Real-World Action</p>
          <p className="hero-desc">A yearly gathering bringing together researchers, clinicians, policymakers and innovators working on healthy longevity.</p>
          <div className="hero-actions">
            <button className="btn-solid" onClick={() => setAuthOpen(true)}>Apply to Participate</button>
            <a href="#public-feed" className="btn-ghost">Explore Public Posts</a>
          </div>
        </div>
      </section>

      <section className="section" id="why-now"><div className="section-inner"><div className="why-intro"><div className="label">Structural Context</div><h2 className="section-title">Why Now</h2><p className="section-body">Three converging global trends make the work of ESTRA structurally necessary.</p></div></div></section>
      <section className="section" id="ecosystem"><div className="section-inner"><div className="label">New Ecosystem Circle</div><h2 className="section-title">ESTRA connects everyone.</h2><p className="section-body">Longevity is no longer only a medical question. It is a systems challenge.</p></div></section>
      <section className="section" id="why-estra"><div className="section-inner"><div className="label">Mission Logic</div><h2 className="section-title">Why ESTRA</h2><p className="section-body">Evidence synthesis, expert dialogue, and policy translation.</p></div></section>
      <section className="section" id="team"><div className="section-inner"><div className="label">The People</div><h2 className="section-title">Team</h2><p className="section-body">Apply to participate, sign up, and collaborate in the live workspace.</p></div></section>

      <section className="section" id="public-feed">
        <div className="section-inner">
          <div className="label">Public Research Output</div>
          <h2 className="section-title">Published by ESTRA collaborators</h2>
          <p className="section-body">Only entries marked Public + Willing to Post appear below.</p>

          <div className="public-grid">
            <div className="public-card">
              <h3>Flagship Project</h3>
              {publicFlagship.length ? publicFlagship.map((item) => <p key={item.section_name}><strong>{item.section_name}:</strong> {item.content}</p>) : <p>No public flagship sections yet.</p>}
            </div>
            <div className="public-card">
              <h3>Geopolitics Tracker</h3>
              {publicGeo.length ? publicGeo.slice(0, 6).map((row) => <p key={row.id}><strong>{row.country}</strong> — {row.policy} ({row.status})</p>) : <p>No public tracker entries yet.</p>}
            </div>
            <div className="public-card">
              <h3>Insights & Signals</h3>
              {publicInsights.length ? publicInsights.slice(0, 6).map((entry) => <p key={entry.id}><strong>{entry.title}</strong> — {entry.summary}</p>) : <p>No public insights yet.</p>}
            </div>
          </div>

          <div style={{ marginTop: '24px' }}>
            {session ? (
              <button className="btn-solid" onClick={() => setWorkspaceOpen(true)}>Enter Editable Workspace</button>
            ) : (
              <button className="btn-solid" onClick={() => setAuthOpen(true)}>Sign up / Login to Edit</button>
            )}
          </div>
        </div>
      </section>

      <footer>
        <div className="footer-logo">ESTRA</div>
        <div className="footer-copy">Evidence · Synthesis · Translation · Real-World Action</div>
      </footer>

      {authOpen && (
        <div className="auth-overlay" onClick={() => setAuthOpen(false)}>
          <form className="auth-modal" onClick={(e) => e.stopPropagation()} onSubmit={handleAuth}>
            <h3>{authMode === 'signup' ? 'Create your researcher account' : 'Login to ESTRA'}</h3>
            <p>{hasSupabaseConfig ? 'Use your credentials to access the editable collaborative modules.' : 'Configure Supabase first to enable authentication.'}</p>
            <input type="email" placeholder="Email" required value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} />
            <input type="password" placeholder="Password" required value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} />
            <button type="submit" disabled={!hasSupabaseConfig}>{authMode === 'signup' ? 'Sign Up' : 'Login'}</button>
            <button type="button" className="link-btn" onClick={() => setAuthMode((prev) => (prev === 'signup' ? 'login' : 'signup'))}>
              {authMode === 'signup' ? 'Already have an account? Login' : 'Need an account? Sign up'}
            </button>
            {session && <button type="button" className="link-btn" onClick={() => { setAuthOpen(false); setWorkspaceOpen(true); }}>Already logged in? Enter workspace</button>}
            <small>{statusMessage}</small>
          </form>
        </div>
      )}
    </>
  );
}
