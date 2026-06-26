import { Navigate } from 'react-router-dom';
import { Play, FileText, CheckCircle } from 'lucide-react';

export function Dashboard({ user }) {
  if (!user) {
    return <Navigate to="/auth" />;
  }

  const startAssessment = (challengeId) => {
    // Generate a secure session ID or pull from backend
    const sessionId = Math.random().toString(36).substring(2, 15);
    // Redirect to the Web IDE endpoint
    window.location.href = `http://localhost:5000/ide/${sessionId}?challenge=${challengeId}`;
  };

  return (
    <div className="container" style={{ padding: '40px 24px' }}>
      <div className="dashboard-header">
        <h1 style={{ fontSize: '32px', margin: '0 0 8px 0' }}>Candidate Dashboard</h1>
        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Logged in as {user.email}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '40px' }}>
        <div>
          <h2 style={{ fontSize: '20px', marginBottom: '20px' }}>Available Assessments</h2>
          <div className="assessment-list">
            
            <div className="assessment-card">
              <div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>Converge</h3>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px' }}>
                  Implement object-level locking for a real-time whiteboard collaboration tool.
                </p>
              </div>
              <button className="btn btn-primary" onClick={() => startAssessment('converge')}>
                <Play size={16} /> Start
              </button>
            </div>

            <div className="assessment-card">
              <div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>Corpus Haven</h3>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px' }}>
                  Build a deterministic ingestion pipeline for domain-mixed text data.
                </p>
              </div>
              <button className="btn btn-outline" onClick={() => startAssessment('corpus-haven')}>
                <Play size={16} /> Start
              </button>
            </div>

          </div>
        </div>

        <div>
          <h2 style={{ fontSize: '20px', marginBottom: '20px' }}>Past Reviews (Synced)</h2>
          
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <CheckCircle size={18} color="#4caf50" />
              <strong style={{ fontSize: '15px' }}>Snap Haul CLI</strong>
            </div>
            <p style={{ margin: '0 0 16px 0', color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.5' }}>
              Completed in 42 minutes. AI Mentor noted strong architectural decisions but suggested better error handling.
            </p>
            <button className="btn btn-outline" style={{ width: '100%', padding: '8px' }}>
              <FileText size={14} /> View Scorecard
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
