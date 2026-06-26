import { useState, useEffect } from 'react';
import { Navigate, useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, ArrowLeft, Loader2, Code, Star, Target, FileText } from 'lucide-react';

export function Results({ user }) {
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

      <div className="container" style={{ maxWidth: '800px' }}>
        
        <button 
          className="btn btn-outline" 
          style={{ marginBottom: '30px', padding: '8px 16px' }}
          onClick={() => navigate('/dashboard')}
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <Loader2 className="spinner" size={48} color="var(--primary-color)" style={{ margin: '0 auto 20px' }} />
            <h2 style={{ margin: '0 0 10px' }}>Analyzing Your Code</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Our AI Mentor is evaluating your submission...</p>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid #ff4444' }}>
            <XCircle size={48} color="#ff4444" style={{ margin: '0 auto 20px' }} />
            <h2 style={{ margin: '0 0 10px', color: '#ff4444' }}>Evaluation Failed</h2>
            <p style={{ color: 'var(--text-secondary)' }}>{error}</p>
          </div>
        ) : scorecard ? (
          <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            
            <div style={{ 
              background: 'linear-gradient(135deg, rgba(0, 122, 204, 0.1) 0%, rgba(0, 0, 0, 0) 100%)',
              border: '1px solid var(--border-color)',
              borderTop: '4px solid var(--primary-color)',
              borderRadius: '12px',
              padding: '40px',
              textAlign: 'center',
              marginBottom: '30px'
            }}>
              <h1 style={{ fontSize: '32px', margin: '0 0 10px' }}>Assessment Complete</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '16px', marginBottom: '30px' }}>
                Your code has been evaluated by the AI Mentor.
              </p>
              
              <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', flexWrap: 'wrap' }}>
                
                <div style={{ background: 'var(--bg-primary)', padding: '20px 30px', borderRadius: '12px', border: '1px solid var(--border-color)', minWidth: '150px' }}>
                  <Star size={24} color="#ffd700" style={{ marginBottom: '10px' }} />
                  <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#fff' }}>{scorecard.score}<span style={{ fontSize: '20px', color: 'var(--text-secondary)' }}>/100</span></div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '5px', textTransform: 'uppercase', letterSpacing: '1px' }}>Score</div>
                </div>

                <div style={{ background: 'var(--bg-primary)', padding: '20px 30px', borderRadius: '12px', border: '1px solid var(--border-color)', minWidth: '150px' }}>
                  {scorecard.fixed ? (
                    <CheckCircle size={24} color="#4caf50" style={{ marginBottom: '10px' }} />
                  ) : (
                    <XCircle size={24} color="#ff4444" style={{ marginBottom: '10px' }} />
                  )}
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: scorecard.fixed ? '#4caf50' : '#ff4444', marginTop: '10px' }}>
                    {scorecard.fixed ? 'SOLVED' : 'FAILED'}
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '5px', textTransform: 'uppercase', letterSpacing: '1px' }}>Status</div>
                </div>

              </div>
            </div>

            <h2 style={{ fontSize: '20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Target size={20} color="var(--primary-color)" /> AI Feedback
            </h2>
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '24px', marginBottom: '30px', lineHeight: '1.6', fontSize: '16px', color: '#eee' }}>
              {scorecard.feedback}
            </div>

            <h2 style={{ fontSize: '20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Code size={20} color="var(--primary-color)" /> Technical Details
            </h2>
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '5px' }}>Session ID</div>
                <div style={{ fontFamily: 'monospace', color: '#ccc' }}>{scorecard.sessionId}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '5px' }}>Date Submitted</div>
                <div style={{ color: '#ccc' }}>{new Date(scorecard.createdAt).toLocaleString()}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '5px' }}>Lines Changed (Diff)</div>
                <div style={{ color: '#ccc' }}>{scorecard.diffLength} bytes</div>
              </div>
            </div>

          </div>
        ) : null}

      </div>
    </>
  );
}
