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

  useEffect(() => {
    if (workspaceOpen) return undefined;

    const reveals = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    reveals.forEach((el) => revealObserver.observe(el));

    const chartObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const l1 = document.getElementById('line1');
          const a1 = document.getElementById('area1');
          const d1 = document.getElementById('dot1');
          if (l1 && l1.style.strokeDashoffset !== '0') {
            l1.style.strokeDashoffset = '0';
            if (a1) a1.style.opacity = '0.7';
            if (d1) d1.style.opacity = '1';
          }

          const l2 = document.getElementById('line2');
          const a2 = document.getElementById('area2');
          const d2 = document.getElementById('dot2');
          if (l2 && l2.style.strokeDashoffset !== '0') {
            l2.style.strokeDashoffset = '0';
            if (a2) a2.style.opacity = '0.6';
            if (d2) d2.style.opacity = '1';
          }

          ['seg1', 'seg2', 'seg3'].forEach((id, i) => {
            const el = document.getElementById(id);
            if (el && el.style.opacity === '0') {
              setTimeout(() => {
                el.style.transition = 'opacity 0.5s ease';
                el.style.opacity = '1';
              }, i * 200 + 300);
            }
          });
        });
      },
      { threshold: 0.3 },
    );

    document.querySelectorAll('.data-card').forEach((card) => chartObserver.observe(card));

    const navLinks = document.querySelectorAll('.nav-links a');
    const sections = document.querySelectorAll('section[id], div[id]');
    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            navLinks.forEach((l) => l.classList.remove('active'));
            const match = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
            if (match) match.classList.add('active');
          }
        });
      },
      { threshold: 0.45 },
    );
    sections.forEach((s) => navObserver.observe(s));

    return () => {
      revealObserver.disconnect();
      chartObserver.disconnect();
      navObserver.disconnect();
    };
  }, [workspaceOpen]);

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
        <a href="#hero" className="nav-logo">
          <span className="nav-logo-name">ESTRA</span>
          <span className="nav-logo-sub">Evidence · Synthesis · Translation · Real-World Action</span>
        </a>
        <div className="nav-links">
          <a href="#why-now">Why Now</a>
          <a href="#ecosystem">Ecosystem</a>
          <a href="#why-estra">Why ESTRA</a>
          <a href="#team">Team</a>
        </div>
        <button className="nav-cta" onClick={() => setAuthOpen(true)}>Apply to Participate</button>
      </nav>

      <section className="hero" id="hero">
        <div className="hero-inner">
          <div className="hero-eyebrow">Annual Gathering <span>·</span> Healthy Longevity <span>·</span> Global Intelligence</div>
          <h1 className="hero-title">ESTRA <em>Forum</em></h1>
          <p className="hero-sub">Evidence · Synthesis · Translation · Real-World Action</p>
          <p className="hero-desc">A yearly gathering bringing together researchers, clinicians, policymakers and innovators working on healthy longevity — to present research, discuss emerging evidence and explore how longevity science translates into prevention, healthcare systems and policy.</p>
          <div className="hero-actions">
            <button className="btn-solid" onClick={() => setAuthOpen(true)}>Apply to Participate</button>
            <a href="#why-now" className="btn-ghost">Explore the Platform</a>
          </div>
          <div className="hero-pillars">
            <div className="hero-pillar"><div className="pillar-label">Flagship Project</div><div className="pillar-name">Verified Science</div></div>
            <div className="hero-pillar"><div className="pillar-label">Geopolitics Tracker</div><div className="pillar-name">Unified Experts</div></div>
            <div className="hero-pillar"><div className="pillar-label">Insights &amp; Signals</div><div className="pillar-name">Policy in Motion</div></div>
          </div>
        </div>
      </section>

      <section className="section" id="why-now">
        <div className="section-inner">
          <div className="why-intro reveal">
            <div className="label">Structural Context</div>
            <h2 className="section-title">Why Now</h2>
            <p className="section-body">Three converging global trends make the work of ESTRA not only timely — but structurally necessary. These are not temporary disruptions. They are the permanent new shape of modern societies.</p>
          </div>
          <div className="cards-row">
            <div className="data-card reveal reveal-delay-1">
              <div className="card-num">01</div>
              <h3 className="card-headline">By 2050, people aged 60+ will exceed 2.1 billion.</h3>
              <p className="card-body">Global populations are ageing at an unprecedented rate. This demographic shift is transforming healthcare demand, long-term care needs, and economic structures worldwide.</p>
              <div className="chart-wrap">
                <svg id="chart-ageing" viewBox="0 0 320 160" width="100%" height="160" xmlns="http://www.w3.org/2000/svg" style={{ overflow: 'visible' }}>
                  <defs><linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6aacb8" stopOpacity="0.25" /><stop offset="100%" stopColor="#6aacb8" stopOpacity="0" /></linearGradient></defs>
                  <line x1="0" y1="130" x2="320" y2="130" stroke="#ddd8cf" strokeWidth="0.5" />
                  <line x1="0" y1="95" x2="320" y2="95" stroke="#ddd8cf" strokeWidth="0.5" strokeDasharray="3,4" />
                  <line x1="0" y1="60" x2="320" y2="60" stroke="#ddd8cf" strokeWidth="0.5" strokeDasharray="3,4" />
                  <text x="4" y="134" fontSize="8" fill="#8fa7b3" fontFamily="Jost,sans-serif">0</text><text x="4" y="99" fontSize="8" fill="#8fa7b3" fontFamily="Jost,sans-serif">1B</text><text x="4" y="64" fontSize="8" fill="#8fa7b3" fontFamily="Jost,sans-serif">2B</text>
                  <text x="30" y="148" fontSize="8" fill="#8fa7b3" fontFamily="Jost,sans-serif" textAnchor="middle">1960</text><text x="100" y="148" fontSize="8" fill="#8fa7b3" fontFamily="Jost,sans-serif" textAnchor="middle">1990</text><text x="180" y="148" fontSize="8" fill="#8fa7b3" fontFamily="Jost,sans-serif" textAnchor="middle">2020</text><text x="280" y="148" fontSize="8" fill="#8fa7b3" fontFamily="Jost,sans-serif" textAnchor="middle">2050</text>
                  <path id="area1" d="M30,124 L60,122 L90,119 L120,115 L150,109 L180,100 L210,90 L250,75 L280,52 L280,130 L30,130 Z" fill="url(#grad1)" opacity="0" style={{ transition: 'opacity 0.5s 0.5s' }} />
                  <polyline id="line1" points="30,124 60,122 90,119 120,115 150,109 180,100 210,90 250,75 280,52" fill="none" stroke="#6aacb8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="500" strokeDashoffset="500" style={{ transition: 'stroke-dashoffset 2s ease' }} />
                  <circle id="dot1" cx="280" cy="52" r="3.5" fill="#6aacb8" opacity="0" style={{ transition: 'opacity 0.3s 2s' }} />
                  <text x="288" y="50" fontSize="8" fill="#6aacb8" fontFamily="Jost,sans-serif">2.1B projected</text>
                </svg>
              </div>
              <div className="chart-meta">Source: <a href="https://population.un.org/wpp/" target="_blank" rel="noreferrer">United Nations World Population Prospects</a><br />Data last updated: 2024</div>
            </div>

            <div className="data-card reveal reveal-delay-2">
              <div className="card-num">02</div>
              <h3 className="card-headline">Humans are living over 20 years longer than in 1950.</h3>
              <p className="card-body">Life expectancy gains are extending lifespan globally, reshaping healthcare systems, retirement models, and prevention priorities at every level of society.</p>
              <div className="chart-wrap">
                <svg id="chart-life" viewBox="0 0 320 160" width="100%" height="160" xmlns="http://www.w3.org/2000/svg" style={{ overflow: 'visible' }}>
                  <defs><linearGradient id="grad2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8fa7b3" stopOpacity="0.2" /><stop offset="100%" stopColor="#8fa7b3" stopOpacity="0" /></linearGradient></defs>
                  <line x1="0" y1="130" x2="320" y2="130" stroke="#ddd8cf" strokeWidth="0.5" />
                  <line x1="0" y1="95" x2="320" y2="95" stroke="#ddd8cf" strokeWidth="0.5" strokeDasharray="3,4" />
                  <line x1="0" y1="55" x2="320" y2="55" stroke="#ddd8cf" strokeWidth="0.5" strokeDasharray="3,4" />
                  <path id="area2" d="M30,128 L60,124 L90,117 L120,107 L150,95 L180,81 L210,69 L250,61 L295,55 L295,130 L30,130 Z" fill="url(#grad2)" opacity="0" style={{ transition: 'opacity 0.5s 0.5s' }} />
                  <polyline id="line2" points="30,128 60,124 90,117 120,107 150,95 180,81 210,69 250,61 295,55" fill="none" stroke="#8fa7b3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="500" strokeDashoffset="500" style={{ transition: 'stroke-dashoffset 2s ease' }} />
                  <circle id="dot2" cx="295" cy="55" r="3.5" fill="#8fa7b3" opacity="0" style={{ transition: 'opacity 0.3s 2s' }} />
                  <text x="268" y="50" fontSize="8" fill="#8fa7b3" fontFamily="Jost,sans-serif">72.6 yrs</text>
                </svg>
              </div>
              <div className="chart-meta">Source: <a href="https://ourworldindata.org/life-expectancy" target="_blank" rel="noreferrer">Our World in Data (UN / WHO data)</a><br />Data last updated: 2024</div>
            </div>

            <div className="data-card reveal reveal-delay-3">
              <div className="card-num">03</div>
              <h3 className="card-headline">Non-communicable diseases cause ~74% of global deaths.</h3>
              <p className="card-body">Healthcare systems now face chronic, long-duration diseases rather than infectious outbreaks, shifting focus toward prevention and long-term management.</p>
              <div className="chart-wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg id="chart-ncd" viewBox="0 0 260 160" width="260" height="160" xmlns="http://www.w3.org/2000/svg">
                  <path id="seg1" d="M90,78 L90,22 A56,56 0 1,1 35.5,105.3 Z" fill="#6aacb8" opacity="0" />
                  <path id="seg2" d="M90,78 L35.5,105.3 A56,56 0 0,1 58.4,23.7 Z" fill="#8fa7b3" opacity="0" />
                  <path id="seg3" d="M90,78 L58.4,23.7 A56,56 0 0,1 90,22 Z" fill="#b8cdd5" opacity="0" />
                  <circle cx="90" cy="78" r="34" fill="white" />
                  <text x="90" y="74" fontSize="16" fontWeight="500" fill="#1a2328" fontFamily="Cormorant Garamond,serif" textAnchor="middle">74%</text>
                  <text x="90" y="87" fontSize="7.5" fill="#8fa7b3" fontFamily="Jost,sans-serif" textAnchor="middle">NCD</text>
                  <rect x="158" y="38" width="9" height="9" fill="#6aacb8" rx="1" /><text x="172" y="47" fontSize="9.5" fill="#2e4050" fontFamily="Jost,sans-serif">Non-communicable — 74%</text>
                  <rect x="158" y="58" width="9" height="9" fill="#8fa7b3" rx="1" /><text x="172" y="67" fontSize="9.5" fill="#2e4050" fontFamily="Jost,sans-serif">Communicable — 19%</text>
                  <rect x="158" y="78" width="9" height="9" fill="#b8cdd5" rx="1" /><text x="172" y="87" fontSize="9.5" fill="#2e4050" fontFamily="Jost,sans-serif">Injuries — 7%</text>
                </svg>
              </div>
              <div className="chart-meta">Source: <a href="https://www.who.int/data/global-health-estimates" target="_blank" rel="noreferrer">WHO Global Health Estimates</a><br />Data last updated: 2021</div>
            </div>
          </div>
        </div>
      </section>

      <div className="why-closing">
        <div className="why-closing-inner reveal">
          <p>This is not temporary. It is the structural future of modern societies.</p>
          <p>Health systems face rising pressure across care delivery, long-term care, and public financing. But ageing also creates an opportunity — if prevention, economics, and implementation are aligned.</p>
          <div className="pull">"When Yuri Gagarin entered space in 1961, progress accelerated through coordination, investment, and long-term vision. Longevity science is advancing just as rapidly today. Healthcare systems are not."</div>
          <div className="systems-grid">
            <div className="systems-block"><h4>A Systems Moment</h4><p>Longevity science is advancing across prevention, regenerative medicine, and health technology. But implementation remains fragmented across research, clinical practice, insurers, economics, and policy.</p></div>
            <div className="systems-block"><h4>The Missing Layer</h4><p>Prevention lives in probabilities, but public discourse demands certainty. This gap fuels misinformation and slows implementation. There is no shared infrastructure translating evidence into coordinated action.</p></div>
          </div>
        </div>
      </div>

      <section className="section" id="ecosystem">
        <div className="section-inner">
          <div className="ecosystem-inner">
            <div className="eco-visual reveal">
              <svg viewBox="0 0 420 420" width="420" height="420" xmlns="http://www.w3.org/2000/svg" style={{ maxWidth: '100%', overflow: 'visible' }}>
                <circle cx="210" cy="210" r="185" fill="none" stroke="#8fa7b3" strokeWidth="0.5" opacity="0.4" />
                <circle cx="210" cy="210" r="140" fill="none" stroke="#8fa7b3" strokeWidth="0.5" opacity="0.25" />
                <circle cx="210" cy="210" r="100" fill="#2e4050" opacity="0.92" />
                <text x="210" y="204" fontSize="20" fontWeight="500" fill="rgba(255,255,255,0.85)" fontFamily="Cormorant Garamond,serif" textAnchor="middle" letterSpacing="5">ESTRA</text>
                <text x="210" y="222" fontSize="8" fill="rgba(255,255,255,0.35)" fontFamily="Jost,sans-serif" textAnchor="middle" letterSpacing="2">THE HUB</text>
                <circle cx="210" cy="55" r="26" fill="white" stroke="#ddd8cf" strokeWidth="0.5" /><text x="210" y="59" fontSize="11" fill="#2e4050" fontFamily="Jost,sans-serif" textAnchor="middle" fontWeight="400">Data</text>
                <circle cx="58" cy="155" r="30" fill="white" stroke="#ddd8cf" strokeWidth="0.5" /><text x="58" y="159" fontSize="11" fill="#2e4050" fontFamily="Jost,sans-serif" textAnchor="middle" fontWeight="400">Experts</text>
                <circle cx="368" cy="155" r="30" fill="white" stroke="#ddd8cf" strokeWidth="0.5" /><text x="368" y="159" fontSize="11" fill="#2e4050" fontFamily="Jost,sans-serif" textAnchor="middle" fontWeight="400">Insurers</text>
                <circle cx="58" cy="285" r="28" fill="white" stroke="#ddd8cf" strokeWidth="0.5" /><text x="58" y="289" fontSize="11" fill="#2e4050" fontFamily="Jost,sans-serif" textAnchor="middle" fontWeight="400">Public</text>
                <circle cx="368" cy="285" r="30" fill="white" stroke="#ddd8cf" strokeWidth="0.5" /><text x="368" y="284" fontSize="10" fill="#2e4050" fontFamily="Jost,sans-serif" textAnchor="middle" fontWeight="400">Governments</text>
                <circle cx="210" cy="375" r="34" fill="white" stroke="#ddd8cf" strokeWidth="0.5" /><text x="210" y="373" fontSize="10" fill="#2e4050" fontFamily="Jost,sans-serif" textAnchor="middle" fontWeight="400">Clinics &amp;</text><text x="210" y="386" fontSize="10" fill="#2e4050" fontFamily="Jost,sans-serif" textAnchor="middle" fontWeight="400">Hospitals</text>
              </svg>
            </div>
            <div className="eco-text reveal reveal-delay-1">
              <div className="label">New Ecosystem Circle</div>
              <h2 className="section-title">The field of healthy longevity is disconnected.<br /><em style={{ fontFamily: 'Cormorant Garamond,serif', fontWeight: 300, fontStyle: 'italic' }}>ESTRA connects everyone.</em></h2>
              <p className="section-body">Longevity is no longer only a medical question. It is a systems challenge. Scientific progress is accelerating across prevention, regenerative medicine, and health technology — but implementation remains fragmented.</p>
              <p className="section-body" style={{ marginTop: '1rem' }}>There is no shared infrastructure translating evidence into coordinated action across research, clinical practice, insurers, economics, and policy. ESTRA is that infrastructure.</p>
              <div className="eco-tags"><span className="eco-tag">Researchers</span><span className="eco-tag">Clinicians</span><span className="eco-tag">Policymakers</span><span className="eco-tag">Insurers</span><span className="eco-tag">Governments</span><span className="eco-tag">Public</span></div>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="why-estra">
        <div className="section-inner">
          <div className="reveal"><div className="label">Mission Logic</div><h2 className="section-title">Why ESTRA</h2></div>
          <div className="why-grid">
            <div className="why-block reveal"><div className="why-block-num">01</div><h3>Longevity Is a Systems Challenge</h3><p>Scientific progress is accelerating across prevention, regenerative medicine, and health technology. But the implementation gap grows wider every year. There is no shared infrastructure to bridge them.</p></div>
            <div className="why-block reveal reveal-delay-1"><div className="why-block-num">02</div><h3>The Misinformation Barrier</h3><p>Prevention science operates in probabilities. Public discourse demands certainty. This disconnect fuels misinformation — not because people lack intelligence, but because uncertainty is difficult to navigate without trusted systems.</p></div>
            <div className="why-block reveal"><div className="why-block-num">03</div><h3>What ESTRA Provides</h3><ul><li>Evidence synthesis across disciplines</li><li>Verified dialogues between experts</li><li>Translation into policy-ready formats</li><li>Geopolitical intelligence on implementation</li><li>Public-facing insight communication</li></ul></div>
            <div className="why-block reveal reveal-delay-1"><div className="why-block-num">04</div><h3>The Three Pillars</h3><p style={{ marginBottom: '1rem' }}>Every ESTRA activity is anchored to one of three flagship initiatives:</p><ul><li><strong style={{ color: 'var(--ink-mid)' }}>Verified Science</strong> — curating and validating the highest-quality longevity evidence</li><li><strong style={{ color: 'var(--ink-mid)' }}>Unified Experts</strong> — convening scientists, clinicians, economists across disciplines</li><li><strong style={{ color: 'var(--ink-mid)' }}>Policy in Motion</strong> — translating synthesis into concrete legislative action</li></ul></div>
          </div>
          <div className="mission-banner reveal"><p>"Longevity is the largest systems transformation of our time. ESTRA provides the operating system to navigate it."</p></div>
        </div>
      </section>

      <section className="section" id="team" style={{ background: 'var(--cream-dark)' }}>
        <div className="section-inner">
          <div className="reveal"><div className="label">The People</div><h2 className="section-title">Team</h2><p className="section-body" style={{ maxWidth: '520px' }}>The individuals building ESTRA — bringing together expertise across longevity science, technology, and strategy.</p></div>
          <div className="team-grid" style={{ marginTop: '3rem' }}>
            <div className="team-card reveal"><div className="team-avatar" style={{ background: 'rgba(106,172,184,0.14)', color: '#3d8090' }}>GB</div><div className="team-role">Founder</div><div className="team-name">Georgia Isabella Bailey</div><p className="team-desc">Visionary behind ESTRA&apos;s mission to build the operating system for global longevity intelligence. Driving the intersection of science, policy, and public understanding.</p></div>
            <div className="team-card reveal reveal-delay-1"><div className="team-avatar" style={{ background: 'rgba(143,167,179,0.14)', color: '#527080' }}>SI</div><div className="team-role">Technical Lead</div><div className="team-name">Stuti Iyer</div><p className="team-desc">Leading the technical architecture of ESTRA&apos;s research platform — building the infrastructure that makes evidence synthesis, tracking, and dissemination possible at scale.</p></div>
          </div>
          <div className="advisor-section reveal">
            <div className="advisor-label">Advisors</div>
            <div className="advisor-card"><div className="advisor-avatar" style={{ background: 'rgba(106,172,184,0.1)', color: '#3d8090' }}>AM</div><div className="advisor-info"><h4>Anna Milani</h4><p>Business Strategy · Founder &amp; CEO @SPARKD<br /><span style={{ color: 'var(--accent-dark)', fontSize: '11px', letterSpacing: '0.08em' }}>Strategy · Entrepreneurship · Growth</span></p></div></div>
          </div>
          <div className="reveal" style={{ marginTop: '4rem', padding: '3rem 2.5rem', background: 'var(--white)', textAlign: 'center' }}>
            <div className="label" style={{ textAlign: 'center', marginBottom: '1rem' }}>Annual Forum · 2025</div>
            <h3 style={{ fontFamily: 'Cormorant Garamond,serif', fontWeight: 400, fontSize: '28px', color: 'var(--ink)', marginBottom: '1rem', letterSpacing: '0.03em' }}>Join the ESTRA Forum</h3>
            <p style={{ fontSize: '14px', fontWeight: 300, color: 'var(--muted)', maxWidth: '480px', margin: '0 auto 2rem', lineHeight: 1.8 }}>Researchers, clinicians, policymakers and innovators working on healthy longevity — apply to participate in the next Forum and its Dialogues.</p>
            <a href="mailto:hello@estra.org" className="btn-solid" style={{ background: 'var(--accent-dark)', color: 'white' }}>Apply to Participate</a>
          </div>
        </div>
      </section>

      <section className="why-closing"><div className="why-closing-inner"><h2 className="section-title" style={{ color: 'white' }}>A System Moment and The Missing Layer</h2><div className="pull">“Gagarin’s orbit in 1961 didn’t just make history. It triggered the largest coordinated scientific investment in human history. Longevity science is at the same inflection point. The geopolitical stakes are identical. The response is not.”</div><p><strong>Georgia Bailey</strong><br />Founder, ESTRA</p></div></section>

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
              <h3>Insights &amp; Signals</h3>
              {publicInsights.length ? publicInsights.slice(0, 6).map((entry) => <p key={entry.id}><strong>{entry.title}</strong> — {entry.summary}</p>) : <p>No public insights yet.</p>}
            </div>
          </div>

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

      <footer>
        <div className="footer-logo">ESTRA</div>
        <div className="footer-links"><a href="#why-now">Why Now</a><a href="#ecosystem">Ecosystem</a><a href="#why-estra">Why ESTRA</a><a href="#team">Team</a></div>
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
