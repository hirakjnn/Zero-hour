import { ArrowRight, Terminal, Clock, Layers, Zap, Code2, FileText, Briefcase, Coins, Database, TrendingUp, Box, Cpu, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';

const ScoreRow = ({ label, score }) => (
  <div className="score-row">
    <div className="score-label">{label}</div>
    <div className="score-bar-bg">
      <div className="score-bar-fill" style={{ width: `${score}%` }}></div>
    </div>
    <div className="score-value">{score}</div>
  </div>
);

export function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="hero">
        <h1 className="hero-title">
          Assessments to hire<br/>
          <span className="serif-italic">AI-native Engineers</span>
        </h1>
        <p className="hero-subtitle">
          Don't ban AI from your interviews. Test with Zero Hour to check how candidates ship with AI.
        </p>
        <Link to="/auth" className="btn btn-primary" style={{ padding: '14px 28px', fontSize: '14px', borderRadius: '4px' }}>
          Start Assessment <ArrowRight size={16} />
        </Link>
      </section>

      {/* The Graveyard */}
      <section className="feature-section container">
        <span className="eyebrow" style={{ textAlign: 'center', marginBottom: '40px' }}>Every method you use was designed before AI</span>
        
        <div className="graveyard-table">
          <div className="graveyard-row">
            <div className="graveyard-logo">
              <Code2 size={28} />
            </div>
            <div className="graveyard-meta">
              <div className="graveyard-title">R.I.P. Leetcode</div>
              <div className="graveyard-dates">2005 — 2025</div>
            </div>
            <div className="graveyard-desc">
              <h3>Tests memorization, not engineering.</h3>
              <p>Your best engineer hasn't reversed a linked list since college.</p>
            </div>
          </div>
          
          <div className="graveyard-row">
            <div className="graveyard-logo">
              <FileText size={28} />
            </div>
            <div className="graveyard-meta">
              <div className="graveyard-title">R.I.P. Take-homes</div>
              <div className="graveyard-dates">2010 — 2025</div>
            </div>
            <div className="graveyard-desc">
              <h3>One-shotted by AI in 7 minutes.</h3>
              <p>Candidates paste the brief into Claude and submit the result.</p>
            </div>
          </div>
          
          <div className="graveyard-row">
            <div className="graveyard-logo">
              <Briefcase size={28} />
            </div>
            <div className="graveyard-meta">
              <div className="graveyard-title">R.I.P. Work trials</div>
              <div className="graveyard-dates">2015 — 2025</div>
            </div>
            <div className="graveyard-desc">
              <h3>Expensive, slow, and don't scale.</h3>
              <p>You miss out on great candidates because of location and availability.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="feature-section container">
        <span className="eyebrow" style={{ textAlign: 'center', marginBottom: '40px' }}>How Zero Hour Works</span>
        <h2 className="hero-title" style={{ fontSize: '48px', marginBottom: '64px', textAlign: 'center' }}>
          Coding assessments for the <span className="serif-italic">AI age</span>
        </h2>
        
        <div className="bento-grid">
          <div className="bento-item large" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <span className="eyebrow">Step 1</span>
            <h3 className="feature-title" style={{ fontSize: '32px' }}>Real world engineering problems</h3>
            <p className="feature-desc">Candidates work on an existing codebase matched to your stack.</p>
            <div className="editorial-code" style={{ marginTop: 'auto', marginBottom: '0' }}>
              <span style={{ color: '#fff', fontWeight: 'bold' }}>AUTH-347</span> • High Priority<br/><br/>
              Fix the token refresh race condition in the backend service.<br/>
              <span style={{ color: 'var(--text-secondary)' }}>Assigned: Candidate</span>
            </div>
          </div>
          
          <div className="bento-item" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <span className="eyebrow">Step 2</span>
            <h3 className="feature-title" style={{ fontSize: '24px' }}>Complete access to AI agents</h3>
            <p className="feature-desc">Candidates work with AI coding agents in their CLI — similar to how they work on the actual job.</p>
          </div>

          <div className="bento-item" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <span className="eyebrow">Step 3</span>
            <h3 className="feature-title" style={{ fontSize: '24px' }}>Live evaluation reports</h3>
            <p className="feature-desc">Get a play-by-play of how candidates collaborated, their taste, and final solution quality.</p>
          </div>
        </div>
      </section>
      
      {/* Scorecard UI */}
      <section className="feature-section container" style={{ textAlign: 'center' }}>
        <span className="eyebrow">Evaluation</span>
        <h2 className="hero-title" style={{ fontSize: '48px', marginBottom: '24px' }}>
          See what a great AI-native <span className="serif-italic">engineer</span> looks like.
        </h2>
        <p className="feature-desc" style={{ maxWidth: '600px', margin: '0 auto 64px' }}>
          Get a detailed evaluation report for every candidate, with a complete picture of how they think and build with AI.
        </p>

        <div className="scorecard-wrapper">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '24px' }}>
            <div>
              <h3 style={{ fontSize: '24px', margin: '0 0 4px', color: '#fff' }}>Sarah Marshall</h3>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px' }}>Senior Software Engineer · Full Stack</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#0072ff', fontFamily: 'JetBrains Mono, monospace' }}>85</div>
              <p style={{ margin: 0, color: '#4caf50', fontSize: '12px', fontWeight: 'bold', letterSpacing: '1px' }}>RECOMMENDED</p>
            </div>
          </div>

          <h4 style={{ fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '24px' }}>Dimensions</h4>
          
          <ScoreRow label="Analysis" score={82} />
          <ScoreRow label="Discovery" score={91} />
          <ScoreRow label="Planning" score={76} />
          <ScoreRow label="Judgement" score={88} />
          <ScoreRow label="Execution" score={72} />
          <ScoreRow label="AI Collaboration" score={85} />
        </div>
      </section>

      {/* Experience Bento */}
      <section className="feature-section container">
        <span className="eyebrow" style={{ textAlign: 'center', marginBottom: '40px' }}>Candidate Experience</span>
        <h2 className="hero-title" style={{ fontSize: '48px', marginBottom: '64px', textAlign: 'center' }}>
          Give your candidates a <span className="serif-italic">10 star</span> experience.
        </h2>
        
        <div className="bento-grid">
          <div className="bento-item">
            <Terminal size={32} color="#0072ff" style={{ marginBottom: '24px' }}/>
            <h3 className="feature-title" style={{ fontSize: '24px' }}>No Leetcode</h3>
            <p className="feature-desc">No one reverse-sorts a linked list at work. We test what actually matters — how engineers think, build, and ship.</p>
          </div>
          <div className="bento-item">
            <Layers size={32} color="#0072ff" style={{ marginBottom: '24px' }}/>
            <h3 className="feature-title" style={{ fontSize: '24px' }}>Real world problems</h3>
            <p className="feature-desc">Candidates work on a real codebase with real tickets. The interview feels like day one on the job, not a pop quiz.</p>
          </div>
          <div className="bento-item">
            <Clock size={32} color="#0072ff" style={{ marginBottom: '24px' }}/>
            <h3 className="feature-title" style={{ fontSize: '24px' }}>Respectful of time</h3>
            <p className="feature-desc">One 90-minute session replaces 2 rounds of interviews. Your best candidates will love your interview loop.</p>
          </div>
          <div className="bento-item">
            <Zap size={32} color="#0072ff" style={{ marginBottom: '24px' }}/>
            <h3 className="feature-title" style={{ fontSize: '24px' }}>AI native</h3>
            <p className="feature-desc">Candidates use AI tools exactly like they do at work — in an interactive CLI. No artificial chatboxes.</p>
          </div>
        </div>
      </section>

      {/* Challenges Catalog */}
      <section className="feature-section container">
        <span className="eyebrow" style={{ textAlign: 'center', marginBottom: '40px' }}>Featured Assessments</span>
        <h2 className="hero-title" style={{ fontSize: '48px', marginBottom: '64px', textAlign: 'center' }}>
          Hand-picked for <span className="serif-italic">top roles</span>
        </h2>
        
        <div className="bento-grid">
          <div className="feature-card">
            <span className="eyebrow" style={{ color: '#0072ff', textAlign: 'left', marginBottom: '16px' }}>For Hiring</span>
            <h3 className="feature-title" style={{ fontSize: '24px' }}>Backend Developer</h3>
            <h4 style={{ fontSize: '16px', color: '#fff', margin: '0 0 16px', fontFamily: 'Inter, sans-serif', fontWeight: '500' }}>Build Webhook Delivery That Survives Crashes</h4>
            <p className="feature-desc">There's zero dedup on your Kafka consumer — every crash sprays duplicate webhooks everywhere. Design and build a dedup layer from scratch that holds up under chaos testing.</p>
            <div style={{ marginTop: '24px' }}>
              <span className="challenge-tag">distributed-systems</span>
              <span className="challenge-tag">backend</span>
              <span className="challenge-tag">reliability</span>
            </div>
            <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>Companies hiring for similar skills</p>
              <div style={{ display: 'flex', gap: '20px', opacity: 0.6, fontSize: '15px', fontFamily: 'Inter, sans-serif', fontWeight: 'bold', color: '#fff', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Coins size={16} /> Mercury</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Database size={16} /> Pinecone</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><TrendingUp size={16} /> Linear</span>
              </div>
            </div>
          </div>

          <div className="feature-card">
            <span className="eyebrow" style={{ color: '#0072ff', textAlign: 'left', marginBottom: '16px' }}>For Hiring</span>
            <h3 className="feature-title" style={{ fontSize: '24px' }}>AI Engineer</h3>
            <h4 style={{ fontSize: '16px', color: '#fff', margin: '0 0 16px', fontFamily: 'Inter, sans-serif', fontWeight: '500' }}>Build Search for a Technical Manual</h4>
            <p className="feature-desc">Engineers keep asking the same questions about a dense PDF manual full of tables and jargon. Build a RAG API that actually finds the right section and gives accurate answers.</p>
            <div style={{ marginTop: '24px' }}>
              <span className="challenge-tag">api</span>
              <span className="challenge-tag">llm</span>
              <span className="challenge-tag">rag</span>
            </div>
            <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>Companies hiring for similar skills</p>
              <div style={{ display: 'flex', gap: '20px', opacity: 0.6, fontSize: '15px', fontFamily: 'Inter, sans-serif', fontWeight: 'bold', color: '#fff', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Box size={16} /> 10a Labs</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Cpu size={16} /> Abridge</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><CreditCard size={16} /> Brex</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="feature-section container" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', paddingBottom: '120px' }}>
        <h2 className="hero-title" style={{ fontSize: '64px', margin: '80px 0 40px' }}>
          Playground for <br/><span className="serif-italic">AI-native engineers.</span>
        </h2>
        <p className="feature-desc" style={{ marginBottom: '48px', fontSize: '18px' }}>
          Run your first Zero Hour and see the difference in signal.
        </p>
        <Link to="/auth" className="btn btn-primary" style={{ padding: '16px 32px', fontSize: '16px', borderRadius: '4px' }}>
          Start Hiring Better <ArrowRight size={20} />
        </Link>
      </section>
    </div>
  );
}
