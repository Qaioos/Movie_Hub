import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ApiSetup from './components/ApiSetup';
import Home from './pages/Home';
import Discover from './pages/Discover';
import Search from './pages/Search';
import MovieDetail from './pages/MovieDetail';
import ActorProfile from './pages/ActorProfile';
import UserProfile from './pages/UserProfile';
import CollectionPage from './pages/CollectionPage';
import { setApiKey } from './lib/tmdb';

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('tmdb_api_key');
    if (stored) {
      setApiKey(stored);
      setReady(true);
    }
  }, []);

  if (!ready) {
    return <ApiSetup onSet={() => setReady(true)} />;
  }

  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh', background: '#070a11' }}>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/search" element={<Search />} />
          <Route path="/movie/:id" element={<MovieDetail />} />
          <Route path="/person/:id" element={<ActorProfile />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/collection/:id" element={<CollectionPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

function NotFoundPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#070a11', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: 64 }}>🎬</div>
      <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, color: '#edeef2' }}>Page Not Found</h1>
      <a href="/" style={{ color: '#f0b430', textDecoration: 'none', fontSize: 15 }}>← Back to Home</a>
    </div>
  );
}
