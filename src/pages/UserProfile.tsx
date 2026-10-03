import { useState } from 'react';
import { Link } from 'react-router-dom';
import { POSTER } from '../lib/tmdb';
import { getLocalList, setLocalList, formatDate, ratingColor } from '../lib/utils';
import type { FavoriteItem, WatchlistItem, RatedItem } from '../lib/types';

type Tab = 'favorites' | 'watchlist' | 'rated';

export default function UserProfile() {
  const [tab, setTab] = useState<Tab>('favorites');
  const [favorites, setFavorites] = useState<FavoriteItem[]>(() => getLocalList('favorites'));
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>(() => getLocalList('watchlist'));
  const [rated, setRated] = useState<RatedItem[]>(() => getLocalList('rated'));

  const removeFav = (id: number) => {
    const updated = favorites.filter(i => i.id !== id);
    setFavorites(updated);
    setLocalList('favorites', updated);
  };

  const removeWatchlist = (id: number) => {
    const updated = watchlist.filter(i => i.id !== id);
    setWatchlist(updated);
    setLocalList('watchlist', updated);
  };

  const removeRated = (id: number) => {
    const updated = rated.filter(i => i.id !== id);
    setRated(updated);
    setLocalList('rated', updated);
  };

  const TABS: { key: Tab; label: string; count: number }[] = [
    { key: 'favorites', label: 'Favorites', count: favorites.length },
    { key: 'watchlist', label: 'Watchlist', count: watchlist.length },
    { key: 'rated', label: 'Rated', count: rated.length },
  ];

  return (
    <div className="page-enter" style={{ minHeight: '100vh', background: '#070a11', paddingTop: 80 }}>
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 24px 80px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 40 }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'linear-gradient(135deg, #f0b430 0%, #e8916e 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, fontWeight: 900, color: '#070a11',
          }}>
            U
          </div>
          <div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 900, color: '#f0eff4', letterSpacing: '-0.5px' }}>
              My Profile
            </h1>
            <p style={{ fontSize: 14, color: '#7a8499', marginTop: 4 }}>
              {favorites.length} favorites · {watchlist.length} in watchlist · {rated.length} rated
            </p>
          </div>
        </div>

        {/* Stats strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 36 }}>
          <StatCard label="Favorites" value={favorites.length} icon="♥" color="#e54b4b" />
          <StatCard label="Watchlist" value={watchlist.length} icon="🔖" color="#f0b430" />
          <StatCard label="Rated" value={rated.length} icon="★" color="#7dd3fc" />
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 28, borderBottom: '1px solid rgba(255,255,255,0.07)', marginBottom: 32 }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} className={`tab-btn ${tab === t.key ? 'active' : ''}`}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', gap: 7 }}>
              {t.label}
              {t.count > 0 && (
                <span style={{ fontSize: 11, background: tab === t.key ? 'rgba(240,180,48,0.15)' : 'rgba(255,255,255,0.07)', color: tab === t.key ? '#f0b430' : '#7a8499', padding: '1px 6px', borderRadius: 10 }}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {tab === 'favorites' && (
          <MovieList
            items={favorites}
            onRemove={removeFav}
            emptyLabel="No favorites yet. Explore movies and add them to your favorites."
            emptyIcon="♥"
          />
        )}

        {tab === 'watchlist' && (
          <MovieList
            items={watchlist}
            onRemove={removeWatchlist}
            emptyLabel="Your watchlist is empty. Add movies you want to see."
            emptyIcon="🔖"
          />
        )}

        {tab === 'rated' && (
          <div>
            {rated.length === 0 ? (
              <EmptyState icon="★" label="You haven't rated any movies yet." />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {rated.map(item => {
                  const clr = ratingColor((item.userRating || 0));
                  return (
                    <div key={item.id} style={{ display: 'flex', gap: 14, alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <Link to={`/movie/${item.id}`} style={{ textDecoration: 'none', display: 'flex', gap: 14, alignItems: 'center', flex: 1 }}>
                        <div style={{ width: 46, height: 68, borderRadius: 6, overflow: 'hidden', background: '#141b24', flexShrink: 0 }}>
                          {item.poster_path && <img src={POSTER(item.poster_path, 'w92')!} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontWeight: 600, color: '#edeef2', fontSize: 14 }} className="line-clamp-2">{item.title}</p>
                          <p style={{ fontSize: 12, color: '#7a8499', marginTop: 2 }}>{item.release_date?.split('-')[0]}</p>
                          <p style={{ fontSize: 11, color: '#7a8499', marginTop: 4 }}>Added {formatDate(item.addedAt)}</p>
                        </div>
                      </Link>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 20, fontWeight: 700, color: clr }}>{item.userRating}</div>
                          <div style={{ fontSize: 10, color: '#7a8499' }}>/ 10</div>
                        </div>
                        <button onClick={() => removeRated(item.id)} style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(229,75,75,0.1)', border: '1px solid rgba(229,75,75,0.2)', color: '#e54b4b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                          ×
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Discover link */}
        <div style={{ marginTop: 60, textAlign: 'center' }}>
          <Link to="/discover" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '12px 24px', borderRadius: 12,
            background: 'rgba(240,180,48,0.08)', border: '1px solid rgba(240,180,48,0.2)',
            color: '#f0b430', textDecoration: 'none', fontWeight: 600, fontSize: 14,
            transition: 'all 0.2s',
          }}>
            🎬 Discover More Movies
          </Link>
        </div>
      </div>
    </div>
  );
}

function MovieList({ items, onRemove, emptyLabel, emptyIcon }: {
  items: FavoriteItem[];
  onRemove: (id: number) => void;
  emptyLabel: string;
  emptyIcon: string;
}) {
  if (items.length === 0) return <EmptyState icon={emptyIcon} label={emptyLabel} />;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 20 }}>
      {items.map(item => {
        const poster = POSTER(item.poster_path, 'w342');
        const clr = ratingColor(item.vote_average || 0);
        return (
          <div key={item.id} style={{ position: 'relative' }}>
            <Link to={`/movie/${item.id}`} style={{ textDecoration: 'none', display: 'block' }} className="movie-card">
              <div style={{ borderRadius: 10, overflow: 'hidden', background: '#141b24', position: 'relative', aspectRatio: '2/3' }}>
                {poster
                  ? <img src={poster} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                  : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3a4558', fontSize: 28 }}>🎬</div>
                }
                <div style={{ position: 'absolute', top: 7, right: 7, fontFamily: "'DM Mono', monospace", fontSize: 11, fontWeight: 600, color: clr, background: 'rgba(7,10,17,0.85)', padding: '2px 7px', borderRadius: 6, backdropFilter: 'blur(6px)' }}>
                  ★ {(item.vote_average || 0).toFixed(1)}
                </div>
              </div>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#d8dbe4', marginTop: 8, lineHeight: 1.3 }} className="line-clamp-2">{item.title}</p>
              <p style={{ fontSize: 11, color: '#7a8499', marginTop: 2 }}>{item.release_date?.split('-')[0]}</p>
            </Link>
            <button
              onClick={() => onRemove(item.id)}
              title="Remove"
              style={{
                position: 'absolute', top: 7, left: 7,
                width: 26, height: 26, borderRadius: 6,
                background: 'rgba(7,10,17,0.88)', border: '1px solid rgba(229,75,75,0.3)',
                color: '#e54b4b', cursor: 'pointer', fontSize: 14,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: 0, transition: 'opacity 0.2s',
              }}
              className="remove-btn"
            >
              ×
            </button>
            <style>{`.movie-card:hover ~ .remove-btn, .movie-card:hover + .remove-btn { opacity: 1 !important; }`}</style>
          </div>
        );
      })}
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: string; color: string }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '20px 24px' }}>
      <div style={{ fontSize: 24, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 32, fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: 13, color: '#7a8499', marginTop: 4 }}>{label}</div>
    </div>
  );
}

function EmptyState({ icon, label }: { icon: string; label: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '80px 0' }}>
      <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.4 }}>{icon}</div>
      <p style={{ fontSize: 15, color: '#7a8499', lineHeight: 1.7, maxWidth: 360, margin: '0 auto' }}>{label}</p>
      <Link to="/discover" style={{ display: 'inline-block', marginTop: 20, color: '#f0b430', textDecoration: 'none', fontSize: 14 }}>
        Discover movies →
      </Link>
    </div>
  );
}
