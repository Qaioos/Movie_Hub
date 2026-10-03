import { Link } from 'react-router-dom';
import type { Movie } from '../lib/types';
import { POSTER } from '../lib/tmdb';
import { formatYear, ratingColor } from '../lib/utils';

interface Props {
  movie: Movie;
  width?: number;
  height?: number;
}

export default function MovieCard({ movie, width = 160, height = 240 }: Props) {
  const poster = POSTER(movie.poster_path, 'w342');
  const year = formatYear(movie.release_date);
  const rating = movie.vote_average;
  const clr = ratingColor(rating);

  return (
    <Link
      to={`/movie/${movie.id}`}
      className="movie-card"
      style={{ width, flexShrink: 0, display: 'block', textDecoration: 'none' }}
    >
      <div
        style={{
          width, height,
          borderRadius: 10,
          overflow: 'hidden',
          background: '#141b24',
          position: 'relative',
        }}
      >
        {poster ? (
          <img src={poster} alt={movie.title} className="poster-img" loading="lazy" />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3a4558' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm-5 9H7v-2h6v2zm4-4H7V7h10v2z"/>
            </svg>
          </div>
        )}
        {/* Rating badge */}
        <div style={{
          position: 'absolute', top: 8, right: 8,
          background: 'rgba(7,10,17,0.85)',
          backdropFilter: 'blur(6px)',
          borderRadius: 6,
          padding: '2px 7px',
          display: 'flex', alignItems: 'center', gap: 3,
          fontSize: 11, fontWeight: 600,
          fontFamily: "'DM Mono', monospace",
          color: clr,
          border: `1px solid ${clr}22`,
        }}>
          ★ {rating.toFixed(1)}
        </div>
        {/* Hover overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(7,10,17,0.95) 0%, rgba(7,10,17,0.3) 50%, transparent 100%)',
          opacity: 0,
          transition: 'opacity 0.25s',
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 10,
        }} className="card-overlay">
          <p style={{ fontSize: 11, color: '#edeef2', fontWeight: 600, lineHeight: 1.3 }} className="line-clamp-2">
            {movie.title}
          </p>
        </div>
      </div>
      <div style={{ paddingTop: 8 }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: '#d8dbe4', lineHeight: 1.3 }} className="line-clamp-2">
          {movie.title}
        </p>
        {year && <p style={{ fontSize: 11, color: '#7a8499', marginTop: 2 }}>{year}</p>}
      </div>

      <style>{`
        .movie-card:hover .card-overlay { opacity: 1 !important; }
      `}</style>
    </Link>
  );
}

// Landscape card (wider, used for hero row thumbnails)
export function MovieLandscapeCard({ movie }: { movie: Movie }) {
  const backdrop = movie.backdrop_path
    ? `https://image.tmdb.org/t/p/w500${movie.backdrop_path}`
    : POSTER(movie.poster_path, 'w342');
  const year = formatYear(movie.release_date);
  const clr = ratingColor(movie.vote_average);

  return (
    <Link
      to={`/movie/${movie.id}`}
      className="movie-card"
      style={{ width: 260, flexShrink: 0, display: 'block', textDecoration: 'none' }}
    >
      <div style={{
        width: 260, height: 148,
        borderRadius: 10, overflow: 'hidden',
        background: '#141b24', position: 'relative',
      }}>
        {backdrop ? (
          <img src={backdrop} alt={movie.title} className="poster-img" loading="lazy" />
        ) : (
          <div style={{ width: '100%', height: '100%', background: '#141b24' }} />
        )}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(7,10,17,0.9) 0%, transparent 60%)',
        }} />
        <div style={{
          position: 'absolute', bottom: 8, left: 10, right: 10,
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
        }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: '#edeef2', lineHeight: 1.3, flex: 1, marginRight: 8 }} className="line-clamp-2">
            {movie.title}
          </p>
          <span style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: clr, fontWeight: 600, flexShrink: 0 }}>
            ★ {movie.vote_average.toFixed(1)}
          </span>
        </div>
      </div>
      {year && <p style={{ fontSize: 11, color: '#7a8499', marginTop: 6 }}>{year}</p>}
    </Link>
  );
}
