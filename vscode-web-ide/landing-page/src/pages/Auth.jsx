import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";

export function Auth({ setUser }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/google`, {
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
        console.error('Google Auth Failed on Backend:', data.error);
      }
    } catch (err) {
      console.error('Failed to communicate with backend', err);
    }
  };

  const handleGoogleError = () => {
    console.error('Google Login Failed');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      
      const res = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
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
        console.error('Auth Error:', data.error);
        alert(data.error || 'Authentication failed');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="auth-wrapper container">
      <div className="auth-card">
        <h2 className="auth-title">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
        <p className="auth-subtitle">
          {isLogin ? 'Sign in to access your assessments.' : 'Register to start your technical evaluation.'}
        </p>

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
