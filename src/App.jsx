const whyNowCards = [
  {
    title: 'Structural Context',
    body: 'By 2050, people aged 60+ will exceed 2.1 billion globally.',
    source: 'WHO, 2024',
  },
  {
    title: 'Economic Consequence',
    body: 'Unhealthy ageing costs the world $2 trillion annually.',
    source: 'World Bank, 2024',
  },
  {
    title: 'Disease Burden',
    body: 'Non-communicable diseases cause 74% of global deaths.',
    source: 'WHO Global Health Estimates, 2020',
  },
];

const whyEstraBullets = [
  'Credentialed expertise and verified interpretation of evidence.',
  'One unified layer linking science, economics, policy, and public outcomes.',
  'Open knowledge principles with transparent synthesis workflows.',
  'Designed for institutions, experts, and decision-makers at scale.',
];

const team = [
  { name: 'Georgia Bailey', role: 'Founder', focus: 'Platform vision, policy translation, and strategic partnerships.' },
  { name: 'Avery Chen', role: 'Research Lead', focus: 'Evidence synthesis frameworks and discipline taxonomy quality.' },
  { name: 'Samir Patel', role: 'Data & Intelligence', focus: 'Insight pipelines, signal quality controls, and analytics architecture.' },
];

const previewInsights = [
  {
    title: 'Prevention Economics in Rapidly Aging Regions',
    summary: 'A cross-region synthesis of prevention-first models and fiscal impacts on long-term care systems.',
    tags: ['Economics', 'Global', 'Research Summary'],
  },
  {
    title: 'Regenerative Care Delivery Readiness',
    summary: 'Framework for assessing clinic and hospital readiness as regenerative interventions scale.',
    tags: ['Healthcare', 'Europe', 'Data Note'],
  },
  {
    title: 'Policy Alignment for Longevity Governance',
    summary: 'A brief on aligning insurers, governments, and public systems around verified science.',
    tags: ['Policy', 'Americas', 'Commentary'],
  },
];

const ecosystemNodes = ['Data', 'Experts', 'Insurers', 'Governments', 'Clinics & Hospitals', 'Public'];

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div>
            <p className="font-serif text-2xl tracking-wide text-slate-700">ESTRA</p>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Global Longevity Intelligence</p>
          </div>
          <div className="flex gap-2">
            <button className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700">Explore Insights</button>
            <button className="rounded-md bg-cyan-700 px-4 py-2 text-sm font-medium text-white">Apply to Join</button>
          </div>
        </div>
      </header>

      <main>
        <section className="bg-gradient-to-br from-slate-500 to-slate-700 text-white">
          <div className="mx-auto flex max-w-6xl flex-col items-center px-4 py-24 text-center">
            <p className="font-serif text-6xl tracking-[0.1em]">ESTRA</p>
            <p className="mt-8 max-w-4xl text-4xl leading-tight text-slate-100">Evidence. Synthesis. Translation. Real-World Action.</p>
            <p className="mt-6 text-3xl text-slate-100">Global Longevity Intelligence.</p>
            <p className="mt-4 text-4xl leading-tight text-slate-50">Verified Science. Unified Experts. Policy in Motion.</p>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <button className="rounded-md bg-white px-6 py-3 font-medium text-slate-700">Explore Insights</button>
              <button className="rounded-md border border-white/60 px-6 py-3 font-medium text-white">Apply to Join</button>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="font-serif text-4xl text-slate-800">Why Now</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {whyNowCards.map((card) => (
              <article key={card.title} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="font-serif text-2xl text-slate-800">{card.title}</h3>
                <p className="mt-3 text-slate-600">{card.body}</p>
                <p className="mt-3 text-xs uppercase tracking-[0.12em] text-cyan-700">{card.source}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-slate-800 text-white">
          <div className="mx-auto max-w-4xl px-4 py-16 text-center">
            <h2 className="font-serif text-4xl">A System Moment & The Missing Layer</h2>
            <blockquote className="mt-6 text-2xl italic leading-relaxed text-slate-100">
              “Gagarin’s orbit in 1961 didn’t just make history. It triggered the largest coordinated scientific
              investment in human history. Longevity science is at the same inflection point. The geopolitical stakes
              are identical. The response is not.”
            </blockquote>
            <p className="mt-6 text-sm uppercase tracking-[0.18em] text-cyan-200">Georgia Bailey · Founder, ESTRA</p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="font-serif text-4xl text-slate-800">Ecosystem Diagram</h2>
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-8">
            <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-3">
              {ecosystemNodes.map((node) => (
                <div key={node} className="flex items-center justify-center gap-3 text-sm text-slate-700">
                  <span className="h-px w-10 bg-cyan-400" aria-hidden="true" />
                  <span className="rounded-full border border-cyan-300 px-3 py-1">{node}</span>
                  <span className="h-px w-10 bg-cyan-400" aria-hidden="true" />
                </div>
              ))}
            </div>
            <div className="mx-auto mt-8 flex h-36 w-36 items-center justify-center rounded-full border border-cyan-500 bg-cyan-50 font-serif text-3xl text-cyan-700">
              ESTRA
            </div>
          </div>
        </section>

        <section className="bg-slate-100">
          <div className="mx-auto max-w-6xl px-4 py-16">
            <h2 className="font-serif text-4xl text-slate-800">Why ESTRA</h2>
            <ul className="mt-6 grid gap-3 md:grid-cols-2">
              {whyEstraBullets.map((item) => (
                <li key={item} className="rounded-lg border border-slate-200 bg-white p-4 text-slate-700">• {item}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="font-serif text-4xl text-slate-800">Team</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {team.map((person) => (
              <article key={person.name} className="rounded-xl border border-slate-200 bg-white p-6">
                <p className="text-xs uppercase tracking-[0.16em] text-cyan-700">{person.role}</p>
                <h3 className="mt-2 font-serif text-2xl">{person.name}</h3>
                <p className="mt-3 text-slate-600">{person.focus}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-white">
          <div className="mx-auto max-w-6xl px-4 py-16">
            <h2 className="font-serif text-4xl text-slate-800">Insights Preview</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {previewInsights.map((item) => (
                <article key={item.title} className="rounded-xl border border-slate-200 p-6 shadow-sm">
                  <div className="mb-3 flex flex-wrap gap-2">
                    {item.tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-cyan-50 px-2 py-1 text-xs font-medium text-cyan-700">{tag}</span>
                    ))}
                  </div>
                  <h3 className="font-serif text-2xl text-slate-800">{item.title}</h3>
                  <p className="mt-3 text-slate-600">{item.summary}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
