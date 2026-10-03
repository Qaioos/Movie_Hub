import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCollection, BACKDROP, POSTER } from '../lib/tmdb';
import type { Collection } from '../lib/types';
import { formatYear, ratingColor } from '../lib/utils';

export default function CollectionPage() {
  const { id } = useParams<{ id: string }>();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getCollection(Number(id))
      .then(setCollection)
      .finally(() => setLoading(false));
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#070a11', paddingTop: 80 }}>
      <div className="skeleton" style={{ height: 320 }} />
    </div>
  );

  if (!collection) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#070a11' }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ color: '#edeef2' }}>Collection not found</h1>
        <Link to="/" style={{ color: '#f0b430', textDecoration: 'none' }}>← Home</Link>
      </div>
    </div>
  );

  const backdrop = BACKDROP(collection.backdrop_path, 'original');

  return (
    <div className="page-enter" style={{ minHeight: '100vh', background: '#070a11', paddingTop: 64 }}>
      {/* Backdrop */}
      <div style={{ position: 'relative', height: 340, overflow: 'hidden' }}>
        {backdrop && <img src={backdrop} alt={collection.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #070a11 0%, rgba(7,10,17,0.5) 60%, rgba(7,10,17,0.3) 100%)' }} />
        <div style={{ position: 'absolute', bottom: 32, left: 40 }}>
          <p style={{ fontSize: 12, color: '#f0b430', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Collection</p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(24px, 4vw, 42px)', fontWeight: 900, color: '#f0eff4' }}>{collection.name}</h1>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px 80px' }}>
        {collection.overview && (
          <p style={{ fontSize: 15, color: '#adb8cc', lineHeight: 1.75, maxWidth: 800, marginBottom: 40 }}>{collection.overview}</p>
        )}

        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#edeef2', marginBottom: 20 }}>
          Parts ({collection.parts?.length || 0})
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 20 }}>
          {collection.parts?.sort((a, b) => a.release_date?.localeCompare(b.release_date || '') || 0).map(movie => {
            const clr = ratingColor(movie.vote_average || 0);
            return (
              <Link key={movie.id} to={`/movie/${movie.id}`} style={{ textDecoration: 'none' }} className="movie-card">
                <div style={{ borderRadius: 10, overflow: 'hidden', background: '#141b24', position: 'relative', aspectRatio: '2/3' }}>
                  {POSTER(movie.poster_path)
                    ? <img src={POSTER(movie.poster_path)!} alt={movie.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} className="poster-img" loading="lazy" />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3a4558', fontSize: 28 }}>🎬</div>
                  }
                  <div style={{ position: 'absolute', top: 7, right: 7, fontFamily: "'DM Mono', monospace", fontSize: 11, fontWeight: 600, color: clr, background: 'rgba(7,10,17,0.85)', padding: '2px 7px', borderRadius: 6 }}>
                    ★ {(movie.vote_average || 0).toFixed(1)}
                  </div>
                </div>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#d8dbe4', marginTop: 8, lineHeight: 1.3 }} className="line-clamp-2">{movie.title}</p>
                <p style={{ fontSize: 11, color: '#7a8499', marginTop: 2 }}>{formatYear(movie.release_date)}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
