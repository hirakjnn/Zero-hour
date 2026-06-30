import { useState, useEffect } from 'react';
import { Navigate, useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, ArrowLeft, Loader2, Code, Star, Target, FileText } from 'lucide-react';

export function Results({ user }) {
  if (!user) {
    return <Navigate to="/auth" />;
  }

  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('sessionId');
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [scorecard, setScorecard] = useState(null);

  useEffect(() => {
    if (!sessionId) {
      setError('No session ID provided.');
      setLoading(false);
      return;
    }

    const fetchResults = async () => {
      try {
        const backendUrl = 'https://dk967f0qqssj5.cloudfront.net';
        const res = await fetch(`${backendUrl}/api/evaluations/${sessionId}`);
        const data = await res.json();
        
        if (res.ok) {
          setScorecard(data.evaluation);
        } else {
          setError(data.error || 'Failed to fetch evaluation results.');
        }
      } catch (err) {
        setError('Network error. Failed to reach the backend.');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [sessionId]);

  if (!user) {
    return <Navigate to="/auth" />;
  }

  return (
    <>
      <nav className="navbar">
        <div className="nav-brand">Zero Hour</div>
        <div className="nav-user">
          <img src={user.picture} alt="Profile" className="nav-avatar" />
        </div>
      </nav>

      <div className="container" style={{ maxWidth: '900px', padding: '40px 24px' }}>
        
        <button 
          className="btn btn-outline" 
          style={{ marginBottom: '40px', padding: '10px 20px', borderRadius: '8px' }}
          onClick={() => navigate('/dashboard')}
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        {loading ? (
          <div className="glass-panel" style={{ textAlign: 'center', padding: '80px 20px' }}>
            <Loader2 className="spinner" size={48} color="#0072ff" style={{ margin: '0 auto 24px' }} />
            <h2 className="hero-title" style={{ fontSize: '32px', marginBottom: '12px' }}>Analyzing Your Code</h2>
            <p className="hero-subtitle" style={{ margin: 0 }}>Our AI Mentor is evaluating your submission...</p>
          </div>
        ) : error ? (
          <div className="glass-panel" style={{ textAlign: 'center', padding: '80px 20px', borderColor: 'rgba(255, 68, 68, 0.3)' }}>
            <XCircle size={64} color="#ff4444" style={{ margin: '0 auto 24px', filter: 'drop-shadow(0 0 20px rgba(255, 68, 68, 0.4))' }} />
            <h2 className="hero-title" style={{ fontSize: '32px', marginBottom: '12px', color: '#ff4444' }}>Evaluation Failed</h2>
            <p className="hero-subtitle" style={{ margin: 0 }}>{error}</p>
          </div>
        ) : scorecard ? (
          <div className="premium-results-wrapper">
            
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <span className="eyebrow" style={{ color: '#0072ff' }}>Assessment Complete</span>
              <h1 className="hero-title" style={{ fontSize: '48px', margin: '16px 0 0' }}>
                Your Final <span className="serif-italic">Scorecard</span>
              </h1>
            </div>

            <div className="glass-panel">
              
              <div className="score-display-wrapper">
                
                <div className="metric-card neon-blue">
                  <Star size={32} color="#0072ff" />
                  <div className="metric-value" style={{ color: '#0072ff' }}>
                    {scorecard.score}<span style={{ fontSize: '24px', opacity: 0.5 }}>/100</span>
                  </div>
                  <div className="metric-label">AI Evaluated Score</div>
                </div>

                <div className={`metric-card ${scorecard.fixed ? 'neon-green' : 'neon-red'}`}>
                  {scorecard.fixed ? (
                    <CheckCircle size={32} color="#4caf50" />
                  ) : (
                    <XCircle size={32} color="#ff4444" />
                  )}
                  <div className="metric-value" style={{ color: scorecard.fixed ? '#4caf50' : '#ff4444' }}>
                    {scorecard.fixed ? 'SOLVED' : 'FAILED'}
                  </div>
                  <div className="metric-label">Resolution Status</div>
                </div>

              </div>

              <div className="feedback-section">
                <h2><Target size={24} color="#0072ff" /> Mentor Feedback</h2>
                <div className="feedback-content">
                  {scorecard.feedback}
                </div>
              </div>

              <div className="technical-details">
                <div className="tech-detail-item">
                  <div className="label">Session ID</div>
                  <div className="value">{scorecard.sessionId}</div>
                </div>
                <div className="tech-detail-item">
                  <div className="label">Date Submitted</div>
                  <div className="value">{new Date(scorecard.createdAt).toLocaleString()}</div>
                </div>
                <div className="tech-detail-item">
                  <div className="label">Lines Changed</div>
                  <div className="value">{scorecard.diffLength} bytes</div>
                </div>
              </div>

            </div>
          </div>
        ) : null}

      </div>
    </>
  );
}
