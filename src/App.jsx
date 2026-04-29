import { useEffect, useMemo, useState } from 'react';
import { hasSupabaseConfig, supabase } from './supabaseClient';
import TeamSection from './components/sections/TeamSection';

// ✅ Single source of truth (no duplicates)
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

  // ✅ Supabase session
  useEffect(() => {
    if (!supabase) {
      setStatusMessage('Supabase is not configured. Running in demo mode.');
      return;
    }
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, nextSession) => setSession(nextSession));
    return () => subscription.unsubscribe();
  }, []);

  // ✅ animations (removed workspaceOpen bug)
  useEffect(() => {
    const reveals = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          observer.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });

    reveals.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const filteredInsights = useMemo(() =>
    insights.filter((item) =>
      (filter.discipline === 'All' || item.tags.discipline === filter.discipline) &&
      (filter.region === 'All' || item.tags.region === filter.region) &&
      (filter.format === 'All' || item.tags.format === filter.format)
    ), [insights, filter]);

  // ✅ Auth
  const handleAuth = async (e) => {
    e.preventDefault();
    if (!supabase) return;

    if (authMode === 'signup') {
      const { data, error } = await supabase.auth.signUp({
        email: authEmail,
        password: authPassword,
      });
      if (error) return setStatusMessage(error.message);

      if (!data.session) {
        setPendingConfirmationEmail(authEmail);
        setStatusMessage('Confirm your email before login.');
      } else {
        setAuthOpen(false);
      }
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: authEmail,
      password: authPassword,
    });

    if (error) return setStatusMessage(error.message);
    setAuthOpen(false);
  };

  // ✅ Apply
  const handleApply = (e) => {
    e.preventDefault();
    const payload = { ...applicationForm, id: Date.now(), status: 'pending' };
    setApplications((prev) => [payload, ...prev]);
    setStatusMessage('Application submitted.');
    setApplicationForm({ full_name: '', email: '', role: '', institution: '', expertise: '', linkedin_url: '', statement: '', cv_url: '' });
  };

  // ✅ Publish insight
  const publishInsight = (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    const item = {
      id: Date.now(),
      title: form.get('title'),
      body: form.get('body'),
      author: session?.user?.email || 'Member',
      date: new Date().toISOString().slice(0, 10),
      tags: {
        discipline: form.get('discipline'),
        region: form.get('region'),
        format: form.get('format'),
      },
      comments: [],
    };

    setInsights((prev) => [item, ...prev]);
    e.currentTarget.reset();
  };

  const toggleSaved = (id) =>
    setSavedInsightIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const addComment = (id) => {
    const text = (commentDrafts[id] || '').trim();
    if (!text) return;

    setInsights((prev) =>
      prev.map((item) =>
        item.id !== id ? item : {
          ...item,
          comments: [...item.comments, {
            id: Date.now(),
            author: session?.user?.email || 'Member',
            text,
            date: new Date().toISOString().slice(0, 10),
          }],
        }
      )
    );

    setCommentDrafts((prev) => ({ ...prev, [id]: '' }));
  };

  return (
    <>
      {/* NAV */}
      <nav>
        <span className="nav-logo">ESTRA</span>
        <button onClick={() => setAuthOpen(true)}>Apply</button>
      </nav>

      {/* HERO */}
      <section className="hero">
        <h1>ESTRA Forum</h1>
        <p>Evidence · Synthesis · Translation · Real-World Action</p>
      </section>

      {/* INSIGHTS */}
      <section className="section">
        <h2>Insights</h2>

        <div className="filters">
          <select onChange={(e) => setFilter((p) => ({ ...p, discipline: e.target.value }))}>
            <option>All</option>
            {disciplineTags.map(x => <option key={x}>{x}</option>)}
          </select>
        </div>

        {isApprovedMember && (
          <form onSubmit={publishInsight}>
            <input name="title" placeholder="Title" required />
            <textarea name="body" required />
            <button type="submit">Publish</button>
          </form>
        )}

        {filteredInsights.map(item => (
          <div key={item.id}>
            <h3>{item.title}</h3>
            <p>{item.body}</p>

            <button onClick={() => toggleSaved(item.id)}>
              {savedInsightIds.includes(item.id) ? 'Saved' : 'Save'}
            </button>

            {isApprovedMember && (
              <>
                {item.comments.map(c => (
                  <p key={c.id}><b>{c.author}</b>: {c.text}</p>
                ))}

                <textarea
                  value={commentDrafts[item.id] || ''}
                  onChange={(e) =>
                    setCommentDrafts(prev => ({ ...prev, [item.id]: e.target.value }))
                  }
                />

                <button onClick={() => addComment(item.id)}>Comment</button>
              </>
            )}
          </div>
        ))}
      </section>

      {/* APPLY */}
      <section className="section">
        <h2>Apply</h2>
        <form onSubmit={handleApply}>
          <input placeholder="Name" value={applicationForm.full_name} onChange={(e) => setApplicationForm(p => ({ ...p, full_name: e.target.value }))} required />
          <input placeholder="Email" value={applicationForm.email} onChange={(e) => setApplicationForm(p => ({ ...p, email: e.target.value }))} required />
          <button type="submit">Submit</button>
        </form>
      </section>

      {/* TEAM */}
      <TeamSection />

      {/* AUTH MODAL */}
      {authOpen && (
        <div className="auth-overlay" onClick={() => setAuthOpen(false)}>
          <form onClick={(e) => e.stopPropagation()} onSubmit={handleAuth}>
            <input type="email" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} required />
            <input type="password" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} required />
            <button type="submit">{authMode === 'signup' ? 'Sign Up' : 'Login'}</button>
          </form>
        </div>
      )}

      {/* FOOTER */}
      <footer>
        <p>{statusMessage}</p>
      </footer>
    </>
  );
}
