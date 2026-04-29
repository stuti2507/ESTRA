export default function WhyNowSection() {
  return (
    <>
      <section className="section" id="why-now">
        <div className="section-inner">
          <div className="why-grid">
            <article className="why-block">
              <div className="why-block-num">01</div>
              <h3>Structural Context</h3>
              <p><strong>By 2050, people aged 60+ will exceed 2.1 billion.</strong> The global population of people aged 60 and older is set to more than double, from 1 billion in 2020 to 2.1 billion by 2050, at an unprecedented pace across every country in the world. (Source: WHO, 2024)</p>
            </article>
            <article className="why-block">
              <div className="why-block-num">02</div>
              <h3>Economic Consequence</h3>
              <p><strong>Unhealthy ageing costs the world $2 trillion every year.</strong> NCDs reduce labour supply, increase absenteeism, and push family caregivers out of the workforce. Bold action on healthy longevity could save 150 million lives and generate transformative economic value by 2050. (Source: World Bank, 2024)</p>
            </article>
            <article className="why-block">
              <div className="why-block-num">03</div>
              <h3>The Disease Burden</h3>
              <p><strong>Non-communicable diseases cause 74% of global deaths.</strong> Healthcare systems now face chronic, long-duration diseases rather than infectious outbreaks. The shift demands prevention, early intervention, and long-term management. The tools exist. The policy frameworks do not. (Source: WHO)</p>
            </article>
          </div>
        </div>
      </section>

      <section className="why-closing">
        <div className="why-closing-inner">
          <h2 className="section-title" style={{ color: 'white' }}>A System Moment and The Missing Layer</h2>
          <div className="pull">“Gagarin’s orbit in 1961 didn’t just make history. It triggered the largest coordinated scientific investment in human history. Longevity science is at the same inflection point. The geopolitical stakes are identical. The response is not.”</div>
          <p><strong>Georgia Bailey</strong><br />Founder, ESTRA</p>
        </div>
      </section>
    </>
  );
}
