import { ArrowRight, Code, Server, UserCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Home() {
  return (
    <div>
      <section className="hero container">
        <h1 className="hero-title">Standardize Engineering<br/>Hiring Without Bias.</h1>
        <p className="hero-subtitle">
          Zero Hour is an AI-native assessment engine. We evaluate candidates in real-time using a deterministic scoring matrix, an interactive AI Mentor, and true Scale-to-Zero sandboxes.
        </p>
        <Link to="/auth" className="btn btn-primary" style={{ padding: '14px 28px', fontSize: '16px' }}>
          Get Started <ArrowRight size={18} />
        </Link>
      </section>

      <section className="container feature-grid">
        <div className="feature-card">
          <Code className="feature-icon" size={32} />
          <h3 className="feature-title">Real IDE Environment</h3>
          <p className="feature-desc">Candidates code in a fully-featured VS Code web environment backed by dedicated EC2 containers, not a toy textarea.</p>
        </div>
        <div className="feature-card">
          <UserCheck className="feature-icon" size={32} />
          <h3 className="feature-title">Live AI Mentor</h3>
          <p className="feature-desc">Our integrated AI pair programmer challenges candidates on architectural decisions in real-time, just like a human interviewer.</p>
        </div>
        <div className="feature-card">
          <Server className="feature-icon" size={32} />
          <h3 className="feature-title">Scale to Zero</h3>
          <p className="feature-desc">Infrastructure runs completely serverless. EC2 instances spin down automatically after 15 minutes of inactivity to save costs.</p>
        </div>
      </section>
    </div>
  );
}
