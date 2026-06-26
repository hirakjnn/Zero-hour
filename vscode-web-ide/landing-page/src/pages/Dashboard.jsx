import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Play, FileText, CheckCircle, Loader2 } from 'lucide-react';

export function Dashboard({ user }) {
  if (!user) {
    return <Navigate to="/auth" />;
  }

  const [isBooting, setIsBooting] = useState(false);
  const [bootStatus, setBootStatus] = useState("Waking up the server...");

  const startAssessment = async (challengeId) => {
    setIsBooting(true);
    setBootStatus("Provisioning your dedicated workspace...");

    // 1. Ping the Lambda function to wake up the EC2 server
    try {
      if (import.meta.env.VITE_LAMBDA_URL) {
        await fetch(import.meta.env.VITE_LAMBDA_URL, { method: 'POST' });
      }
    } catch(err) {
      console.log("Lambda wake-up failed or not configured, falling back to direct polling...");
    }

    setBootStatus("Loading your tools and AI mentor...");
    const sessionId = Math.random().toString(36).substring(2, 15);
    const backendUrl = 'https://dk967f0qqssj5.cloudfront.net';

    // 2. Poll the backend until it's awake
    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`${backendUrl}/health`);
        if (res.ok) {
          clearInterval(pollInterval);
          setBootStatus("Spinning up secure Docker container...");
          
          try {
            const initRes = await fetch(`${backendUrl}/api/session/init`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ sessionId, challengeId })
            });
            if (!initRes.ok) throw new Error("Failed to init session");
            
            setBootStatus("Server ready! Redirecting...");
            setTimeout(() => {
              window.location.href = `${backendUrl}/ide/${sessionId}?challenge=${challengeId}`;
            }, 2500);
          } catch (initErr) {
            setBootStatus("Error starting container. Try again.");
            console.error(initErr);
          }
        }
      } catch (err) {
        // Still booting...
      }
    }, 3000);
  };

  return (
    <>
      {isBooting && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(10, 10, 10, 0.6)', backdropFilter: 'blur(16px)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, color: '#fff', fontFamily: 'Inter, sans-serif'
        }}>
          <Loader2 size={48} className="lucide-spin" style={{ animation: 'spin 2s linear infinite', marginBottom: '24px', opacity: 0.8 }} />
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '12px' }}>{bootStatus}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>This typically takes about 15-30 seconds.</p>
        </div>
      )}

      <div className="container" style={{ padding: '40px 24px' }}>
      <div className="dashboard-header">
        <h1 style={{ fontSize: '32px', margin: '0 0 8px 0' }}>Welcome, {user.name || user.email.split('@')[0]}</h1>
        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Candidate Dashboard • Logged in as {user.email}</p>
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
    </>
  );
}
