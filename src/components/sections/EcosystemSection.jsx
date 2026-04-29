export default function EcosystemSection() {
  return (
    <section className="section" id="ecosystem">
      <div className="section-inner">
        <h2 className="section-title">ESTRA System Network</h2>
        <div className="eco-visual">
          <svg viewBox="0 0 420 300" width="100%" height="300" xmlns="http://www.w3.org/2000/svg">
            <circle cx="210" cy="150" r="46" fill="#2e4050" />
            <text x="210" y="156" fill="white" fontSize="20" textAnchor="middle">ESTRA</text>
            <g stroke="#8fa7b3" strokeWidth="1" fill="white">
              <line x1="210" y1="104" x2="210" y2="45" />
              <line x1="250" y1="130" x2="342" y2="90" />
              <line x1="260" y1="165" x2="352" y2="208" />
              <line x1="210" y1="196" x2="210" y2="255" />
              <line x1="170" y1="165" x2="78" y2="208" />
              <line x1="170" y1="130" x2="78" y2="90" />
            </g>
            <g fill="#2e4050" fontSize="13" textAnchor="middle">
              <circle cx="210" cy="30" r="24" fill="white" stroke="#8fa7b3" />
              <text x="210" y="35">Data</text>
              <circle cx="360" cy="82" r="28" fill="white" stroke="#8fa7b3" />
              <text x="360" y="87">Insurers</text>
              <circle cx="360" cy="218" r="32" fill="white" stroke="#8fa7b3" />
              <text x="360" y="223">Governments</text>
              <circle cx="210" cy="270" r="35" fill="white" stroke="#8fa7b3" />
              <text x="210" y="266">Clinics &amp;</text>
              <text x="210" y="281">Hospitals</text>
              <circle cx="60" cy="218" r="24" fill="white" stroke="#8fa7b3" />
              <text x="60" y="223">Public</text>
              <circle cx="60" cy="82" r="24" fill="white" stroke="#8fa7b3" />
              <text x="60" y="87">Experts</text>
            </g>
          </svg>
        </div>
      </div>
    </section>
  );
}
