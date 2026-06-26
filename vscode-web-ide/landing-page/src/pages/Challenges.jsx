import React from 'react';
import { ArrowRight, Coins, Database, TrendingUp, Box, Cpu, CreditCard, PenTool, LayoutDashboard, FileText, Mic, Scale, Link2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Challenges() {
  return (
    <div style={{ padding: '80px 0', minHeight: '80vh' }}>
      <section className="container">
        <span className="eyebrow" style={{ textAlign: 'center', marginBottom: '16px' }}>Library</span>
        <h1 className="hero-title" style={{ fontSize: '56px', textAlign: 'center', marginBottom: '64px' }}>
          Explore our <span className="serif-italic">Assessments</span>
        </h1>

        <div className="bento-grid">
          {/* Challenge 1 */}
          <div className="feature-card">
            <span className="eyebrow" style={{ color: '#0072ff', textAlign: 'left', marginBottom: '16px' }}>For Hiring</span>
            <h3 className="feature-title" style={{ fontSize: '24px' }}>Backend Developer</h3>
            <h4 style={{ fontSize: '16px', color: '#fff', margin: '0 0 16px', fontFamily: 'Inter, sans-serif', fontWeight: '500' }}>Build Webhook Delivery That Survives Crashes</h4>
            <p className="feature-desc">There's zero dedup on your Kafka consumer — every crash sprays duplicate webhooks everywhere. Design and build a dedup layer from scratch that holds up under chaos testing.</p>
            <div style={{ marginTop: '24px', marginBottom: '24px' }}>
              <span className="challenge-tag">distributed-systems</span>
              <span className="challenge-tag">backend</span>
              <span className="challenge-tag">reliability</span>
            </div>
            <div style={{ paddingBottom: '32px' }}>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>Companies hiring for similar skills</p>
              <div style={{ display: 'flex', gap: '20px', opacity: 0.6, fontSize: '15px', fontFamily: 'Inter, sans-serif', fontWeight: 'bold', color: '#fff', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Coins size={16} /> Mercury</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Database size={16} /> Pinecone</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><TrendingUp size={16} /> Linear</span>
              </div>
            </div>
            <Link to="/auth" className="btn btn-outline" style={{ display: 'inline-flex', width: '100%' }}>
              Attempt Challenge <ArrowRight size={16} />
            </Link>
          </div>

          {/* Challenge 2 */}
          <div className="feature-card">
            <span className="eyebrow" style={{ color: '#0072ff', textAlign: 'left', marginBottom: '16px' }}>For Hiring</span>
            <h3 className="feature-title" style={{ fontSize: '24px' }}>AI Engineer</h3>
            <h4 style={{ fontSize: '16px', color: '#fff', margin: '0 0 16px', fontFamily: 'Inter, sans-serif', fontWeight: '500' }}>Build Search for a Technical Manual</h4>
            <p className="feature-desc">Engineers keep asking the same questions about a dense PDF manual full of tables and jargon. Build a RAG API that actually finds the right section and gives accurate answers.</p>
            <div style={{ marginTop: '24px', marginBottom: '24px' }}>
              <span className="challenge-tag">api</span>
              <span className="challenge-tag">llm</span>
              <span className="challenge-tag">rag</span>
            </div>
            <div style={{ paddingBottom: '32px' }}>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>Companies hiring for similar skills</p>
              <div style={{ display: 'flex', gap: '20px', opacity: 0.6, fontSize: '15px', fontFamily: 'Inter, sans-serif', fontWeight: 'bold', color: '#fff', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Box size={16} /> 10a Labs</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Cpu size={16} /> Abridge</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><CreditCard size={16} /> Brex</span>
              </div>
            </div>
            <Link to="/auth" className="btn btn-outline" style={{ display: 'inline-flex', width: '100%' }}>
              Attempt Challenge <ArrowRight size={16} />
            </Link>
          </div>

          {/* Challenge 3 */}
          <div className="feature-card">
            <span className="eyebrow" style={{ color: '#4caf50', textAlign: 'left', marginBottom: '16px' }}>For Practice</span>
            <h3 className="feature-title" style={{ fontSize: '24px' }}>Frontend Engineer</h3>
            <h4 style={{ fontSize: '16px', color: '#fff', margin: '0 0 16px', fontFamily: 'Inter, sans-serif', fontWeight: '500' }}>Object-level locking in Realtime</h4>
            <p className="feature-desc">Multiple users are dragging elements on a shared whiteboard. Implement an optimistic locking CRDT so local states don't conflict during high latency spikes.</p>
            <div style={{ marginTop: '24px', marginBottom: '24px' }}>
              <span className="challenge-tag">react</span>
              <span className="challenge-tag">crdt</span>
              <span className="challenge-tag">websockets</span>
            </div>
            <div style={{ paddingBottom: '32px' }}>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>Companies hiring for similar skills</p>
              <div style={{ display: 'flex', gap: '20px', opacity: 0.6, fontSize: '15px', fontFamily: 'Inter, sans-serif', fontWeight: 'bold', color: '#fff', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><PenTool size={16} /> Figma</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><LayoutDashboard size={16} /> Miro</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FileText size={16} /> Notion</span>
              </div>
            </div>
            <Link to="/auth" className="btn btn-outline" style={{ display: 'inline-flex', width: '100%' }}>
              Attempt Challenge <ArrowRight size={16} />
            </Link>
          </div>

          {/* Challenge 4 */}
          <div className="feature-card">
            <span className="eyebrow" style={{ color: '#4caf50', textAlign: 'left', marginBottom: '16px' }}>For Practice</span>
            <h3 className="feature-title" style={{ fontSize: '24px' }}>Agent Engineer</h3>
            <h4 style={{ fontSize: '16px', color: '#fff', margin: '0 0 16px', fontFamily: 'Inter, sans-serif', fontWeight: '500' }}>Build an Agent You Can Debug</h4>
            <p className="feature-desc">Build a Python agent from scratch with a tool loop, memory, retries, and stop conditions. Every decision must show up in structured trace output.</p>
            <div style={{ marginTop: '24px', marginBottom: '24px' }}>
              <span className="challenge-tag">python</span>
              <span className="challenge-tag">tool-calling</span>
              <span className="challenge-tag">traces</span>
            </div>
            <div style={{ paddingBottom: '32px' }}>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>Companies hiring for similar skills</p>
              <div style={{ display: 'flex', gap: '20px', opacity: 0.6, fontSize: '15px', fontFamily: 'Inter, sans-serif', fontWeight: 'bold', color: '#fff', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Mic size={16} /> Deepgram</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Scale size={16} /> Harvey</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Link2 size={16} /> LangChain</span>
              </div>
            </div>
            <Link to="/auth" className="btn btn-outline" style={{ display: 'inline-flex', width: '100%' }}>
              Attempt Challenge <ArrowRight size={16} />
            </Link>
          </div>

        </div>
      </section>
    </div>
  );
}
