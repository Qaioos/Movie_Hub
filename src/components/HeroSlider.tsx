import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import type { Movie } from '../lib/types';
import { BACKDROP, POSTER } from '../lib/tmdb';
import { formatYear, ratingColor, truncate } from '../lib/utils';
import { HeroSkeleton } from './Skeleton';

interface Props {
  movies: Movie[] | null;
  loading?: boolean;
}

export default function HeroSlider({ movies, loading }: Props) {
  const [index, setIndex] = useState(0);
  const [animating, setAnimating] = useState(false);

  const featured = movies?.slice(0, 8) || [];

  const goTo = useCallback((i: number) => {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => { setIndex(i); setAnimating(false); }, 300);
  }, [animating]);

  useEffect(() => {
    if (!featured.length) return;
    const t = setInterval(() => {
      goTo((index + 1) % featured.length);
    }, 6000);
    return () => clearInterval(t);
  }, [index, featured.length, goTo]);

  if (loading) return <HeroSkeleton />;
  if (!featured.length) return null;

  const movie = featured[index];
  const backdrop = BACKDROP(movie.backdrop_path, 'original') || POSTER(movie.poster_path, 'w780');
  const rating = movie.vote_average;
  const clr = ratingColor(rating);
  const year = formatYear(movie.release_date);

  return (
    <div style={{ position: 'relative', height: '72vh', minHeight: 500, overflow: 'hidden', background: '#070a11' }}>
      {/* Backdrop */}
      <div style={{
        position: 'absolute', inset: 0,
        transition: 'opacity 0.6s ease',
        opacity: animating ? 0 : 1,
      }}>
        {backdrop && (
          <img
            src={backdrop}
            alt={movie.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }}
          />
        )}
      </div>

      {/* Overlays */}
      <div className="hero-overlay" style={{ position: 'absolute', inset: 0 }} />
      <div className="hero-bottom" style={{ position: 'absolute', inset: 0 }} />
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to bottom, rgba(7,10,17,0.4) 0%, transparent 30%)',
      }} />

      {/* Content */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'flex-end',
        maxWidth: 1400, margin: '0 auto', padding: '0 40px 80px',
        left: '50%', transform: 'translateX(-50%)',
        width: '100%',
        transition: 'opacity 0.4s ease',
        opacity: animating ? 0 : 1,
      }}>
        <div style={{ maxWidth: 580 }}>
          {/* Rating pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <span style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 13, fontWeight: 600,
              color: clr, letterSpacing: 1,
            }}>★ {rating.toFixed(1)}</span>
            {year && <span style={{ fontSize: 12, color: '#7a8499', borderLeft: '1px solid rgba(255,255,255,0.15)', paddingLeft: 12 }}>{year}</span>}
          </div>

          {/* Title */}
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(32px, 5vw, 58px)',
            fontWeight: 900, lineHeight: 1.05,
            color: '#f0eff4', marginBottom: 16,
            letterSpacing: '-1px',
            textShadow: '0 2px 20px rgba(0,0,0,0.4)',
          }}>
            {movie.title}
          </h1>

          {/* Overview */}
          <p style={{ fontSize: 15, color: '#adb8cc', lineHeight: 1.65, marginBottom: 28, maxWidth: 480 }} className="line-clamp-3">
            {truncate(movie.overview, 200)}
          </p>

          {/* CTA buttons */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link
              to={`/movie/${movie.id}`}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '12px 26px', borderRadius: 10,
                background: '#f0b430', color: '#070a11',
                fontWeight: 700, fontSize: 14, textDecoration: 'none',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#e8a820')}
              onMouseLeave={e => (e.currentTarget.style.background = '#f0b430')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
              </svg>
              View Details
            </Link>
            <Link
              to={`/movie/${movie.id}`}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '12px 26px', borderRadius: 10,
                background: 'rgba(255,255,255,0.1)', color: '#edeef2',
                fontWeight: 600, fontSize: 14, textDecoration: 'none',
                border: '1px solid rgba(255,255,255,0.15)',
                backdropFilter: 'blur(8px)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.16)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
              </svg>
              More Info
            </Link>
          </div>
        </div>
      </div>

      {/* Thumbnail strip */}
      <div style={{
        position: 'absolute', right: 40, bottom: 80,
        display: 'flex', gap: 10,
      }} className="hero-thumbs">
        {featured.map((m, i) => (
          <button
            key={m.id}
            onClick={() => goTo(i)}
            style={{
              width: i === index ? 44 : 6, height: 6,
              borderRadius: 4, border: 'none', cursor: 'pointer',
              background: i === index ? '#f0b430' : 'rgba(255,255,255,0.3)',
              transition: 'all 0.35s ease', padding: 0,
            }}
          />
        ))}
      </div>

      {/* Arrow nav */}
      <button
        onClick={() => goTo((index - 1 + featured.length) % featured.length)}
        style={{
          position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
          width: 40, height: 40, borderRadius: '50%',
          background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
          color: '#edeef2', cursor: 'pointer', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
        </svg>
      </button>
      <button
        onClick={() => goTo((index + 1) % featured.length)}
        style={{
          position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)',
          width: 40, height: 40, borderRadius: '50%',
          background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
          color: '#edeef2', cursor: 'pointer', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
        </svg>
      </button>

      <style>{`
        @media (max-width: 640px) {
          .hero-thumbs { display: none !important; }
        }
      `}</style>
    </div>
  );
}
