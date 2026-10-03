import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
  }, [searchOpen]);

  // Close mobile menu on navigation
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setSearchOpen(false);
      setQuery('');
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      transition: 'all 0.3s',
      background: scrolled
        ? 'rgba(7,10,17,0.92)'
        : 'linear-gradient(to bottom, rgba(7,10,17,0.85) 0%, transparent 100%)',
      backdropFilter: scrolled ? 'blur(16px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
    }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', gap: 32 }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', flexShrink: 0 }}>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, letterSpacing: '-0.5px' }}>
            <span style={{ color: '#f0b430' }}>Cine</span>
            <span style={{ color: '#edeef2' }}>Vault</span>
          </span>
        </Link>

        {/* Nav links - desktop */}
        <div style={{ display: 'flex', gap: 4, flex: 1 }} className="nav-desktop">
          {[
            { to: '/', label: 'Home' },
            { to: '/discover', label: 'Discover' },
            { to: '/search', label: 'Search' },
          ].map(link => (
            <Link
              key={link.to}
              to={link.to}
              style={{
                padding: '6px 14px', borderRadius: 8,
                textDecoration: 'none', fontSize: 14, fontWeight: 500,
                color: isActive(link.to) ? '#edeef2' : '#7a8499',
                background: isActive(link.to) ? 'rgba(255,255,255,0.07)' : 'transparent',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { if (!isActive(link.to)) e.currentTarget.style.color = '#c5cad6'; }}
              onMouseLeave={e => { if (!isActive(link.to)) e.currentTarget.style.color = '#7a8499'; }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
          {/* Search */}
          {searchOpen ? (
            <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center' }}>
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search movies, people…"
                className="cinput"
                style={{ width: 260, height: 36, fontSize: 13 }}
                onBlur={() => { if (!query) setSearchOpen(false); }}
                onKeyDown={e => e.key === 'Escape' && setSearchOpen(false)}
              />
            </form>
          ) : (
            <NavIconBtn onClick={() => setSearchOpen(true)} title="Search">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </NavIconBtn>
          )}

          {/* Profile */}
          <Link to="/profile" style={{ textDecoration: 'none' }}>
            <div style={{
              width: 34, height: 34, borderRadius: '50%',
              background: 'linear-gradient(135deg, #f0b430 0%, #e8916e 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 700, color: '#070a11',
              cursor: 'pointer', transition: 'transform 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.08)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
            >
              U
            </div>
          </Link>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen(o => !o)}
            style={{
              display: 'none', width: 34, height: 34, borderRadius: 8,
              background: 'rgba(255,255,255,0.07)', border: 'none',
              color: '#edeef2', cursor: 'pointer', alignItems: 'center', justifyContent: 'center',
            }}
            className="mobile-menu-btn"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              {mobileOpen
                ? <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                : <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
              }
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={{
          background: 'rgba(7,10,17,0.97)', borderTop: '1px solid rgba(255,255,255,0.07)',
          padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 4,
        }}>
          {[
            { to: '/', label: 'Home' },
            { to: '/discover', label: 'Discover' },
            { to: '/search', label: 'Search' },
            { to: '/profile', label: 'My Profile' },
          ].map(link => (
            <Link key={link.to} to={link.to} style={{ padding: '10px 0', fontSize: 15, fontWeight: 500, color: '#edeef2', textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              {link.label}
            </Link>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 640px) {
          .nav-desktop { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </nav>
  );
}

function NavIconBtn({ onClick, title, children }: { onClick: () => void; title: string; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: 36, height: 36, borderRadius: 8,
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.08)',
        color: '#adb8cc', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.2s',
      }}
      onMouseEnter={e => { e.currentTarget.style.color = '#edeef2'; e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
      onMouseLeave={e => { e.currentTarget.style.color = '#adb8cc'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
    >
      {children}
    </button>
  );
}
