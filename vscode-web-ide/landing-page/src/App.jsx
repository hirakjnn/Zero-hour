import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Home } from './pages/Home';
import { Challenges } from './pages/Challenges';
import { Auth } from './pages/Auth';
import { Dashboard } from './pages/Dashboard';
import { Results } from './pages/Results';
import { useState, useEffect } from 'react';
import { Code2 } from 'lucide-react';

function Navbar({ user, setUser }) {
  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="nav-brand">
          <Code2 size={20} />
          ZERO HOUR
        </Link>
        <div className="nav-links">
          <Link to="/challenges" className="nav-link">Challenges</Link>
          {user ? (
            <>
              <Link to="/dashboard" className="nav-link">Dashboard</Link>
              <button className="btn btn-outline" onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setUser(null);
                window.location.href = '/';
              }}>Sign Out</button>
            </>
          ) : (
            <Link to="/auth" className="btn btn-primary">Sign In</Link>
          )}
        </div>
      </div>
    </nav>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [authLoaded, setAuthLoaded] = useState(false);

  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        } else {
          setUser({ email: 'user@example.com', name: 'User' });
        }
      }
    } catch (err) {
      console.error("Failed to parse user from localStorage:", err);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    } finally {
      setAuthLoaded(true);
    }
  }, []);

  if (!authLoaded) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', color: '#fff' }}>Loading...</div>;
  }

  return (
    <BrowserRouter>
      <div className="ambient-bubbles">
        <div className="bubble bubble-1"></div>
        <div className="bubble bubble-2"></div>
        <div className="bubble bubble-3"></div>
      </div>
      <Navbar user={user} setUser={setUser} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/challenges" element={<Challenges />} />
        <Route path="/auth" element={<Auth setUser={setUser} />} />
        <Route path="/dashboard" element={<Dashboard user={user} />} />
        <Route path="/results" element={<Results user={user} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
