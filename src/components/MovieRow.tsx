import { useRef } from 'react';
import type { Movie } from '../lib/types';
import MovieCard from './MovieCard';
import { MovieRowSkeleton } from './Skeleton';

interface Props {
  title: string;
  movies: Movie[] | null;
  loading?: boolean;
  error?: string | null;
  cardWidth?: number;
  cardHeight?: number;
}

export default function MovieRow({ title, movies, loading, error, cardWidth = 160, cardHeight = 240 }: Props) {
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    if (!rowRef.current) return;
    rowRef.current.scrollBy({ left: dir === 'right' ? 600 : -600, behavior: 'smooth' });
  };

  return (
    <section style={{ marginBottom: 48 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, paddingRight: 4 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#edeef2', letterSpacing: '-0.3px' }}>{title}</h2>
        {!loading && movies && movies.length > 6 && (
          <div style={{ display: 'flex', gap: 8 }}>
            <ScrollBtn dir="left" onClick={() => scroll('left')} />
            <ScrollBtn dir="right" onClick={() => scroll('right')} />
          </div>
        )}
      </div>

      {loading ? (
        <MovieRowSkeleton />
      ) : error ? (
        <ErrorState message={error} />
      ) : !movies || movies.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="scroll-row" ref={rowRef}>
          {movies.map(movie => (
            <MovieCard key={movie.id} movie={movie} width={cardWidth} height={cardHeight} />
          ))}
        </div>
      )}
    </section>
  );
}

function ScrollBtn({ dir, onClick }: { dir: 'left' | 'right'; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 32, height: 32, borderRadius: '50%',
        background: 'rgba(255,255,255,0.07)',
        border: '1px solid rgba(255,255,255,0.1)',
        color: '#adb8cc', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.2s',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(240,180,48,0.15)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        {dir === 'left'
          ? <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
          : <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
        }
      </svg>
    </button>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div style={{ padding: '24px', textAlign: 'center', color: '#7a8499', fontSize: 14 }}>
      <span style={{ color: '#e54b4b' }}>⚠</span> {message}
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{ padding: '24px', textAlign: 'center', color: '#7a8499', fontSize: 14 }}>
      No results found
    </div>
  );
}
