import { useEffect, useMemo, useState } from 'react';
import Sidebar from './components/Sidebar';
import FlagshipProjectPanel from './components/FlagshipProjectPanel';
import GeopoliticsTrackerPanel from './components/GeopoliticsTrackerPanel';
import InsightsSignalsPanel from './components/InsightsSignalsPanel';
import { hasSupabaseConfig, supabase } from './supabaseClient';

export default function App() {
  const [session, setSession] = useState(null);
  const [userEmail, setUserEmail] = useState('');
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('signup');
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

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUserEmail(data.session?.user?.email || '');
    });
    const {
      data: { subscription: authSub },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setUserEmail(nextSession?.user?.email || '');
    });

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

    const email = authEmail.trim().toLowerCase();
    const password = authPassword;

    if (authMode === 'signup') {
      const { error: signUpError } = await supabase.auth.signUp({ email, password });
      if (signUpError) {
        setStatusMessage(signUpError.message);
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setStatusMessage(
          `Account created, but auto-login failed: ${signInError.message}. Try logging in manually.`,
        );
        setAuthMode('login');
        return;
      }

      setStatusMessage('Signup and login successful.');
      setAuthOpen(false);
      setWorkspaceOpen(true);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setStatusMessage(error ? `Login failed: ${error.message}` : 'Logged in successfully.');
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
      updated_by: userEmail || session?.user?.email || '',
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
        <button className="nav-cta" onClick={() => { setAuthOpen(true); setAuthMode('signup'); }}>Apply to Participate</button>
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

      <section className="section" id="why-now">
        <div className="section-inner">
          <div className="label">Structural Context</div>
          <h2 className="section-title">Why Now</h2>
          <p className="section-body">
            Three converging global trends make the work of ESTRA not only timely — but structurally necessary. These are not temporary disruptions. They are the permanent new shape of modern societies.
          </p>

          <div className="trend-grid">
            <article className="trend-card">
              <p className="trend-number">01</p>
              <h3>By 2050, people aged 60+ will exceed 2.1 billion.</h3>
              <p>Global populations are ageing at an unprecedented rate. This demographic shift is transforming healthcare demand, long-term care needs, and economic structures worldwide.</p>
              <div className="chart-labels">
                <p>0, 1B, 2B</p>
                <p>1960, 1990, 2020, 2050</p>
                <p>2.1B projected</p>
                <p>projected →</p>
              </div>
              <p className="meta">Source: United Nations World Population Prospects</p>
              <p className="meta">Data last updated: 2024</p>
            </article>
            <article className="trend-card">
              <p className="trend-number">02</p>
              <h3>Humans are living over 20 years longer than in 1950.</h3>
              <p>Life expectancy gains are extending lifespan globally, reshaping healthcare systems, retirement models, and prevention priorities at every level of society.</p>
              <div className="chart-labels">
                <p>45, 60, 73</p>
                <p>1950, 1980, 2010, 2024</p>
                <p>72.6 yrs</p>
                <p>+20 yrs</p>
              </div>
              <p className="meta">Source: Our World in Data (UN / WHO data)</p>
              <p className="meta">Data last updated: 2024</p>
            </article>
            <article className="trend-card">
              <p className="trend-number">03</p>
              <h3>Non-communicable diseases cause ~74% of global deaths.</h3>
              <p>Healthcare systems now face chronic, long-duration diseases rather than infectious outbreaks, shifting focus toward prevention and long-term management.</p>
              <div className="chart-labels">
                <p>74%</p>
                <p>NCD</p>
                <p>Non-communicable — 74%</p>
                <p>Communicable — 19%</p>
                <p>Injuries — 7%</p>
              </div>
              <p className="meta">Source: WHO Global Health Estimates</p>
              <p className="meta">Data last updated: 2021</p>
            </article>
          </div>

          <div className="editorial-block">
            <p className="section-body">This is not temporary. It is the structural future of modern societies.</p>
            <p className="section-body">Health systems face rising pressure across care delivery, long-term care, and public financing. But ageing also creates an opportunity — if prevention, economics, and implementation are aligned.</p>
            <blockquote>
              "When Yuri Gagarin entered space in 1961, progress accelerated through coordination, investment, and long-term vision. Longevity science is advancing just as rapidly today. Healthcare systems are not."
            </blockquote>
            <div className="systems-grid">
              <article className="systems-card">
                <h3>A Systems Moment</h3>
                <p>Longevity science is advancing across prevention, regenerative medicine, and health technology. But implementation remains fragmented across research, clinical practice, insurers, economics, and policy.</p>
              </article>
              <article className="systems-card">
                <h3>The Missing Layer</h3>
                <p>Prevention lives in probabilities, but public discourse demands certainty. This gap fuels misinformation and slows implementation. There is no shared infrastructure translating evidence into coordinated action.</p>
              </article>
            </div>
          </div>
        </div>
      </section>
      <section className="section" id="ecosystem">
        <div className="section-inner">
          <div className="label">New Ecosystem Circle</div>
          <div className="ecosystem-circle">
            <span className="hub">ESTRA<br />THE HUB</span>
            <span>Data</span>
            <span>Experts</span>
            <span>Insurers</span>
            <span>Public</span>
            <span>Governments</span>
            <span>Clinics & Hospitals</span>
          </div>
          <h2 className="section-title">The field of healthy longevity is disconnected. ESTRA connects everyone.</h2>
          <p className="section-body">
            Longevity is no longer only a medical question. It is a systems challenge. Scientific progress is accelerating across prevention, regenerative medicine, and health technology — but implementation remains fragmented.
          </p>
          <p className="section-body">
            There is no shared infrastructure translating evidence into coordinated action across research, clinical practice, insurers, economics, and policy. ESTRA is that infrastructure.
          </p>
          <div className="tag-row">
            {['Researchers', 'Clinicians', 'Policymakers', 'Insurers', 'Governments', 'Public'].map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        </div>
      </section>
      <section className="section" id="why-estra">
        <div className="section-inner">
          <div className="label">Mission Logic</div>
          <h2 className="section-title">Why ESTRA</h2>
          <div className="mission-grid">
            <article>
              <p className="trend-number">01</p>
              <h3>Longevity Is a Systems Challenge</h3>
              <p>Scientific progress is accelerating across prevention, regenerative medicine, and health technology. But the implementation gap grows wider every year. There is no shared infrastructure to bridge them.</p>
            </article>
            <article>
              <p className="trend-number">02</p>
              <h3>The Misinformation Barrier</h3>
              <p>Prevention science operates in probabilities. Public discourse demands certainty. This disconnect fuels misinformation — not because people lack intelligence, but because uncertainty is difficult to navigate without trusted systems.</p>
              <div className="comparison">
                <div>
                  <h4>Science says:</h4>
                  <p>Risk reduction</p>
                  <p>Trade-offs</p>
                  <p>Evidence maturity</p>
                  <p>Context</p>
                </div>
                <div>
                  <h4>Public demands:</h4>
                  <p>Binary answers</p>
                  <p>Guarantees</p>
                  <p>Simple conclusions</p>
                  <p>Certainty</p>
                </div>
              </div>
            </article>
            <article>
              <p className="trend-number">03</p>
              <h3>What ESTRA Provides</h3>
              <p>Evidence synthesis across disciplines</p>
              <p>Verified dialogues between experts</p>
              <p>Translation into policy-ready formats</p>
              <p>Geopolitical intelligence on implementation</p>
              <p>Public-facing insight communication</p>
            </article>
            <article>
              <p className="trend-number">04</p>
              <h3>The Three Pillars</h3>
              <p>Every ESTRA activity is anchored to one of three flagship initiatives:</p>
              <p>Verified Science — curating and validating the highest-quality longevity evidence</p>
              <p>Unified Experts — convening scientists, clinicians, economists across disciplines</p>
              <p>Policy in Motion — translating synthesis into concrete legislative action</p>
              <blockquote>"Longevity is the largest systems transformation of our time. ESTRA provides the operating system to navigate it."</blockquote>
            </article>
          </div>
        </div>
      </section>
      <section className="section" id="team">
        <div className="section-inner">
          <div className="label">The People</div>
          <h2 className="section-title">Team</h2>
          <p className="section-body">The individuals building ESTRA — bringing together expertise across longevity science, technology, and strategy.</p>
          <div className="team-grid">
            <article className="team-card">
              <p className="initials">GB</p>
              <p className="role">Founder</p>
              <h3>Georgia Isabella Bailey</h3>
              <p>Visionary behind ESTRA's mission to build the operating system for global longevity intelligence. Driving the intersection of science, policy, and public understanding.</p>
            </article>
            <article className="team-card">
              <p className="initials">SI</p>
              <p className="role">Technical Lead</p>
              <h3>Stuti Iyer</h3>
              <p>Leading the technical architecture of ESTRA's research platform — building the infrastructure that makes evidence synthesis, tracking, and dissemination possible at scale.</p>
            </article>
          </div>
          <div className="advisors">
            <div className="label">Advisors</div>
            <article className="team-card">
              <p className="initials">AM</p>
              <h3>Anna Milani</h3>
              <p>Business Strategy · Founder & CEO @SPARKD</p>
              <p>Strategy · Entrepreneurship · Growth</p>
            </article>
          </div>
        </div>
      </section>

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
            <p>{hasSupabaseConfig ? 'Use email + password to access the editable collaborative modules.' : 'Configure Supabase first to enable authentication.'}</p>
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
