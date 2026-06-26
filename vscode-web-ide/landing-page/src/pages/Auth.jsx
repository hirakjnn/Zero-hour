import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';

export function Auth({ setUser }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const backendUrl = 'https://zero-hour-api.vercel.app';
      const res = await fetch(`${backendUrl}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialResponse.credential })
      });
      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        navigate('/dashboard');
      } else {
        setErrorMessage('Backend Error: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      setErrorMessage('Network Error: Failed to communicate with backend API. ' + err.message);
    }
  };

  const handleGoogleError = () => {
    setErrorMessage('Google Login Popup Failed. Check if your domain is Authorized in Google Cloud Console.');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const backendUrl = 'https://zero-hour-api.vercel.app';
      
      const res = await fetch(`${backendUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('token', data.token);
        // Map user data
        const userObj = data.user.name ? data.user : { ...data.user, name: data.user.email.split('@')[0] };
        localStorage.setItem('user', JSON.stringify(userObj));
        setUser(userObj);
        navigate('/dashboard');
      } else {
        setErrorMessage(data.error || 'Authentication failed');
      }
    } catch (err) {
      setErrorMessage('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <div className="auth-wrapper container">
      <div className="auth-card">
        <h2 className="auth-title">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
        <p className="auth-subtitle">
          {isLogin ? 'Sign in to access your assessments.' : 'Register to start your technical evaluation.'}
        </p>

        {errorMessage && (
          <div style={{ background: 'rgba(255, 50, 50, 0.1)', border: '1px solid #ff3333', color: '#ff3333', padding: '16px', borderRadius: '8px', marginBottom: '24px', textAlign: 'center', fontSize: '14px', fontWeight: 'bold' }}>
            {errorMessage}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'center', margin: '24px 0' }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            theme="filled_black"
            shape="rectangular"
            size="large"
            text={isLogin ? "signin_with" : "signup_with"}
            width="100%"
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px', opacity: 0.5 }}>
          <div style={{ flex: 1, height: '1px', background: '#fff' }}></div>
          <span style={{ margin: '0 12px', fontSize: '12px', letterSpacing: '0.1em' }}>OR</span>
          <div style={{ flex: 1, height: '1px', background: '#fff' }}></div>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input 
              type="email" 
              className="input" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com" 
              required 
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="input" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" 
              required 
            />
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', marginTop: '10px' }}>
            {isLogin ? 'Sign In with Email' : 'Register with Email'}
          </button>
        </form>
        
        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: 'var(--text-secondary)' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span 
            style={{ color: 'var(--text-primary)', cursor: 'pointer', fontWeight: '500' }}
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? 'Sign Up' : 'Log In'}
          </span>
        </p>
      </div>
    </div>
  );
}
