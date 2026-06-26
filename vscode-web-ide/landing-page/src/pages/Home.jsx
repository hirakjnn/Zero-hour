import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Home() {
  return (
    <div>
      <section className="hero">
        <span className="eyebrow">The Cognitive Gap</span>
        <h1 className="hero-title">
          Evaluate engineers <span className="serif-italic">without bias</span> in under <span className="serif-italic">two minutes</span>.
        </h1>
        <p className="hero-subtitle">
          Zero Hour is an AI-native assessment engine. We evaluate candidates in real-time using a deterministic scoring matrix, an interactive AI Mentor, and true edge synchronization.
        </p>
        <Link to="/auth" className="btn btn-primary" style={{ padding: '14px 28px', fontSize: '14px', borderRadius: '4px' }}>
          Start Assessment <ArrowRight size={16} />
        </Link>
      </section>

      <section className="feature-section container">
        <span className="eyebrow" style={{ textAlign: 'center', marginBottom: '40px' }}>Up and running in 2 minutes</span>
        
        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-number">01 / REAL IDE</div>
            <h3 className="feature-title">True execution</h3>
            <p className="feature-desc">Candidates code in a fully-featured VS Code web environment backed by dedicated EC2 containers, not a toy textarea.</p>
            <div className="editorial-code">
              $ docker run -d --name workspace-123 code-server<br/>
              <span style={{ color: '#4caf50' }}>[Success] Sandbox isolated.</span>
            </div>
          </div>
          
          <div className="feature-card">
            <div className="feature-number">02 / INTERACTIVE AI</div>
            <h3 className="feature-title">Live mentor</h3>
            <p className="feature-desc">Our integrated AI pair programmer challenges candidates on architectural decisions in real-time, just like a human interviewer.</p>
            <div className="editorial-code">
              <span style={{ color: '#fff' }}>User:</span> How should I handle the locking mechanism?<br/><br/>
              <span style={{ color: '#0072ff' }}>AI:</span> Consider object-level mutexes for higher throughput.
            </div>
          </div>
          
          <div className="feature-card">
            <div className="feature-number">03 / COST EFFICIENCY</div>
            <h3 className="feature-title">Scale to zero</h3>
            <p className="feature-desc">Infrastructure runs completely serverless. EC2 instances spin down automatically after 15 minutes of inactivity to save costs.</p>
            <div className="editorial-code">
              Checking activity heartbeat...<br/>
              <span style={{ color: '#f44336' }}>Idle detected. Terminating container.</span>
            </div>
          </div>
        </div>
      </section>
      
      <section className="feature-section container" style={{ textAlign: 'center' }}>
        <span className="eyebrow">Visual Proof</span>
        <h2 className="hero-title" style={{ fontSize: '48px', marginBottom: '64px' }}>
          See the <span className="serif-italic">platform</span> in action.
        </h2>
        {/* Mock Video Embed doing heavy lifting */}
        <div className="video-embed">
          [ Product Demo Video ]
        </div>
      </section>
    </div>
  );
}
