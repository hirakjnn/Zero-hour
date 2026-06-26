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
          <Link to="/platform" className="nav-link">Platform</Link>
          <Link to="/challenges" className="nav-link">Challenges</Link>
          {user ? (
            <>
              <Link to="/dashboard" className="nav-link">Dashboard</Link>
              <button className="btn btn-outline" onClick={() => {
                localStorage.removeItem('token');
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
