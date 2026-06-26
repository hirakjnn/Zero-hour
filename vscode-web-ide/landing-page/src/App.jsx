import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Home } from './pages/Home';
import { Auth } from './pages/Auth';
import { Dashboard } from './pages/Dashboard';
import { useState, useEffect } from 'react';
import { Layers } from 'lucide-react';

function Navbar({ user, setUser }) {
  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="nav-brand">
          <Layers size={20} />
          ZERO HOUR
        </Link>
        <div className="nav-links">
          {user ? (
            <>
              <Link to="/platform" className="nav-link">Platform</Link>
              <Link to="/challenges" className="nav-link">Challenges</Link>
              <Link to="/dashboard" className="nav-link">Dashboard</Link>
              <button className="btn btn-outline" onClick={() => {
                localStorage.removeItem('token');
                setUser(null);
                window.location.href = '/';
              }}>Sign Out</button>
            </>
          ) : (
            <>
              <span className="nav-link" style={{ opacity: 0.5, cursor: 'not-allowed' }} title="Please Sign In">Platform</span>
              <span className="nav-link" style={{ opacity: 0.5, cursor: 'not-allowed' }} title="Please Sign In">Challenges</span>
              <Link to="/auth" className="btn btn-primary">Sign In</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Mock validation
      setUser({ email: 'user@example.com' });
    }
  }, []);

  return (
    <BrowserRouter>
      <Navbar user={user} setUser={setUser} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth setUser={setUser} />} />
        <Route path="/dashboard" element={<Dashboard user={user} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
