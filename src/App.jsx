import { useEffect, useMemo, useState } from 'react';
import { hasSupabaseConfig, supabase } from './supabaseClient';

const DISCIPLINES = ['Economics', 'Healthcare', 'Policy', 'Biology', 'Psychology', 'Anthropology', 'Nutrition', 'Geopolitics', 'Technology', 'Environment'];
const REGIONS = ['Europe', 'Asia', 'Americas', 'Global'];
const FORMATS = ['Brief', 'Data Note', 'Commentary', 'Research Summary'];

const navItems = [
  ['home', 'Home'],
  ['page2', 'Context'],
  ['page3', 'System Moment'],
  ['page4', 'System Diagram'],
  ['insights', 'Insights'],
];

export default function App() {
  const [view, setView] = useState('home');
  const [status, setStatus] = useState('Ready');
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [auth, setAuth] = useState({ open: false, mode: 'login', email: '', password: '' });

  const [insights, setInsights] = useState([]);
  const [commentsByInsight, setCommentsByInsight] = useState({});
  const [bookmarks, setBookmarks] = useState([]);
  const [follows, setFollows] = useState([]);
  const [filter, setFilter] = useState({ discipline: 'All', region: 'All', format: 'All' });

  const [application, setApplication] = useState({ full_name: '', email: '', role: '', institution: '', area_of_expertise: '', linkedin_url: '', statement_of_interest: '', cv_url: '' });
  const [applications, setApplications] = useState([]);

  const role = profile?.role || session?.user?.user_metadata?.role || 'public';
  const isAdmin = role === 'admin';
  const isMember = role === 'member' || isAdmin;

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!supabase || !session?.user?.id) return;
    supabase.from('profiles').select('*').eq('id', session.user.id).single().then(({ data }) => setProfile(data || null));
    supabase.from('bookmarks').select('insight_id').eq('user_id', session.user.id).then(({ data }) => setBookmarks((data || []).map((x) => x.insight_id)));
    supabase.from('tag_follows').select('tag_key').eq('user_id', session.user.id).then(({ data }) => setFollows((data || []).map((x) => x.tag_key)));
  }, [session?.user?.id]);

  useEffect(() => {
    if (!supabase) return;
    supabase.from('insights').select('*, profiles(full_name, institution)').order('created_at', { ascending: false }).then(({ data, error }) => {
      if (error) setStatus(error.message);
      else setInsights(data || []);
    });
    supabase.from('comments').select('id, insight_id').then(({ data }) => {
      const acc = {};
      (data || []).forEach((c) => { acc[c.insight_id] = (acc[c.insight_id] || 0) + 1; });
      setCommentsByInsight(acc);
    });
    if (isAdmin) supabase.from('applications').select('*').order('created_at', { ascending: false }).then(({ data }) => setApplications(data || []));
  }, [isAdmin]);

  const visibleInsights = useMemo(() => insights.filter((x) => (filter.discipline === 'All' || x.discipline === filter.discipline)
    && (filter.region === 'All' || x.region === filter.region)
    && (filter.format === 'All' || x.format === filter.format)), [insights, filter]);

  const authSubmit = async (e) => {
    e.preventDefault();
    if (!supabase) return setStatus('Set SUPABASE env vars first.');
    if (auth.mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email: auth.email, password: auth.password });
      if (error) return setStatus(error.message);
      setAuth((p) => ({ ...p, open: false }));
      return setStatus('Signed in.');
    }
    const { error } = await supabase.auth.signUp({ email: auth.email, password: auth.password, options: { emailRedirectTo: window.location.origin } });
    if (error) return setStatus(error.message);
    setStatus('Account created. Verify email if confirmation is enabled.');
  };

  const apply = async (e) => {
    e.preventDefault();
    if (!supabase) return;
    const { error } = await supabase.from('applications').insert({ ...application, status: 'pending' });
    if (error) return setStatus(error.message);
    setStatus('Application submitted.');
  };

  const approve = async (id, approved) => {
    if (!supabase) return;
    const next = approved ? 'approved' : 'rejected';
    await supabase.from('applications').update({ status: next }).eq('id', id);
    setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, status: next } : a)));
  };

  const publishInsight = async (e) => {
    e.preventDefault();
    if (!supabase || !isMember) return;
    const f = new FormData(e.currentTarget);
    const payload = Object.fromEntries(f.entries());
    const { error } = await supabase.from('insights').insert({ ...payload, author_id: session.user.id });
    if (error) return setStatus(error.message);
    e.currentTarget.reset();
    setStatus('Insight published.');
  };

  return <div className="min-h-screen bg-slate-50 text-slate-900">
    <header className="sticky top-0 z-20 border-b bg-white/90 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3"><div><h1 className="font-serif text-xl tracking-wide">ESTRA</h1><p className="text-xs text-slate-500">Evidence Synthesis Translation Real-World Action</p></div></div>
        <nav className="flex gap-2 flex-wrap">{navItems.map(([k, l]) => <button key={k} onClick={() => setView(k)} className="px-2 py-1 text-sm border rounded">{l}</button>)}</nav>
        <div className="flex gap-2"><button className="px-3 py-2 rounded bg-slate-800 text-white text-sm" onClick={() => setAuth((p) => ({ ...p, open: true }))}>{session ? 'Account' : 'Apply to Participate'}</button></div>
      </div>
    </header>

    <main className="mx-auto max-w-6xl px-4 py-8 space-y-8">
      {view === 'home' && <section className="space-y-6">
        <div className="rounded-2xl bg-gradient-to-br from-slate-700 to-slate-500 text-white p-10">
          <h2 className="font-serif text-6xl">ESTRA</h2><p className="mt-2">Evidence. Synthesis. Translation. Real-World Action.</p><p>Global Longevity Intelligence. Verified Science. Unified Experts. Policy in Motion.</p>
        </div>
        <article className="grid md:grid-cols-2 gap-4"><div className="border rounded-xl p-6"><h3 className="font-serif text-2xl">The New Ecosystem</h3><p className="mt-2">The field of healthy longevity is disconnected. ESTRA connects everyone.</p></div><div className="border rounded-xl p-6"><h3 className="font-serif text-2xl">ESTRA = Longevity Operating System</h3><ul className="list-disc ml-5 mt-2"><li>Public Knowledge Bank</li><li>Expert Network & Evidence Bank</li><li>Intelligence Engine</li><li>ESTRA Think Tank</li></ul></div></article>
      </section>}

      {view === 'page2' && <section className="grid md:grid-cols-3 gap-4">{[['01 Structural Context','By 2050, people aged 60+ will exceed 2.1 billion globally.','WHO, 2024'],['02 Economic Consequence','Unhealthy ageing costs the world $2 trillion annually.','World Bank, 2024'],['03 The Disease Burden','Non-communicable diseases cause 74% of global deaths.','WHO Global Health Estimates, 2020']].map(([a,b,c]) => <div className="border rounded-xl p-5" key={a}><h3 className="font-serif text-xl">{a}</h3><p className="mt-3">{b}</p><p className="text-xs mt-4 text-slate-500">Source: {c}</p></div>)}</section>}

      {view === 'page3' && <section className="border rounded-xl p-8"><h2 className="font-serif text-4xl">A System Moment and The Missing Layer</h2><blockquote className="mt-5 italic text-lg">“Gagarin’s orbit in 1961 didn’t just make history. It triggered the largest coordinated scientific investment in human history. Longevity science is at the same inflection point. The geopolitical stakes are identical. The response is not.”</blockquote><p className="mt-5 text-sm">Georgia Bailey — Founder, ESTRA</p></section>}

      {view === 'page4' && <section className="border rounded-xl p-8 text-center"><h2 className="font-serif text-3xl">ESTRA System Diagram</h2><div className="mt-6 grid md:grid-cols-3 gap-3">{['Data','Experts','Insurers','Governments','Clinics & Hospitals','Public'].map((x) => <div className="border rounded p-3" key={x}>{x} → ESTRA</div>)}</div></section>}

      {view === 'insights' && <section className="space-y-4"><div className="flex flex-wrap gap-2">{[['discipline', DISCIPLINES], ['region', REGIONS], ['format', FORMATS]].map(([key, arr]) => <select key={key} className="border rounded px-2 py-1" onChange={(e) => setFilter((p) => ({ ...p, [key]: e.target.value }))}><option>All</option>{arr.map((x) => <option key={x}>{x}</option>)}</select>)}</div>
      {isMember && <form onSubmit={publishInsight} className="grid gap-2 border rounded-xl p-4 bg-white"><input name="title" placeholder="Title" className="border p-2" required /><textarea name="body" placeholder="Body" className="border p-2" required /><div className="grid md:grid-cols-3 gap-2"><select name="discipline" className="border p-2">{DISCIPLINES.map((x)=><option key={x}>{x}</option>)}</select><select name="region" className="border p-2">{REGIONS.map((x)=><option key={x}>{x}</option>)}</select><select name="format" className="border p-2">{FORMATS.map((x)=><option key={x}>{x}</option>)}</select></div><button className="bg-slate-800 text-white rounded px-3 py-2">Publish Insight</button></form>}
      {visibleInsights.map((i) => <article key={i.id} className="border rounded-xl p-4 bg-white"><p className="text-xs text-slate-500">{i.discipline} • {i.region} • {i.format}</p><h3 className="font-serif text-2xl">{i.title}</h3><p className="mt-2">{i.body}</p><p className="text-sm text-slate-500 mt-2">{new Date(i.created_at).toLocaleString()} · {commentsByInsight[i.id] || 0} members are discussing this</p></article>)}
      </section>}

      <section className="border rounded-xl p-6 bg-white">
        <h3 className="font-serif text-2xl">Application Form</h3>
        <form onSubmit={apply} className="grid md:grid-cols-2 gap-2 mt-3">{Object.keys(application).map((k) => <input key={k} value={application[k]} onChange={(e) => setApplication((p) => ({ ...p, [k]: e.target.value }))} placeholder={k.replaceAll('_', ' ')} className="border p-2" />)}<button className="md:col-span-2 bg-slate-700 text-white rounded px-3 py-2">Submit Application</button></form>
      </section>

      {isAdmin && <section className="border rounded-xl p-6 bg-white"><h3 className="font-serif text-2xl">Admin Dashboard</h3>{applications.map((a)=><div className="border rounded p-2 mt-2" key={a.id}><p>{a.full_name} — {a.email} — {a.status}</p><div className="flex gap-2"><button onClick={()=>approve(a.id,true)} className="text-sm">Approve</button><button onClick={()=>approve(a.id,false)} className="text-sm">Reject</button></div></div>)}</section>}

      <p className="text-sm text-slate-600">{hasSupabaseConfig ? status : 'Demo mode: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'}</p>
    </main>

    {auth.open && <div className="fixed inset-0 bg-black/40 flex items-center justify-center"><form onSubmit={authSubmit} className="bg-white rounded-xl p-6 w-full max-w-md grid gap-2"><h3 className="font-serif text-3xl">{auth.mode === 'login' ? 'Login' : 'Sign up'}</h3><input type="email" className="border p-2" value={auth.email} onChange={(e)=>setAuth((p)=>({...p,email:e.target.value}))} required /><input type="password" className="border p-2" value={auth.password} onChange={(e)=>setAuth((p)=>({...p,password:e.target.value}))} required /><button className="bg-slate-800 text-white rounded p-2">Continue</button><button type="button" className="text-sm underline" onClick={()=>setAuth((p)=>({...p,mode:p.mode==='login'?'signup':'login'}))}>Switch to {auth.mode === 'login' ? 'sign up' : 'login'}</button><button type="button" onClick={()=>setAuth((p)=>({...p,open:false}))}>Close</button></form></div>}
  </div>;
}
