import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import MovieCard from '../components/MovieCard';
import { MovieCardSkeleton } from '../components/Skeleton';
import { discoverMovies, getGenres } from '../lib/tmdb';
import type { Movie, Genre, DiscoverFilters } from '../lib/types';

const SORT_OPTIONS = [
  { value: 'popularity.desc', label: 'Most Popular' },
  { value: 'popularity.asc', label: 'Least Popular' },
  { value: 'vote_average.desc', label: 'Highest Rated' },
  { value: 'vote_average.asc', label: 'Lowest Rated' },
  { value: 'release_date.desc', label: 'Newest First' },
  { value: 'release_date.asc', label: 'Oldest First' },
  { value: 'revenue.desc', label: 'Highest Revenue' },
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 80 }, (_, i) => CURRENT_YEAR - i);

export default function Discover() {
  const [searchParams] = useSearchParams();
  const initGenre = searchParams.get('genre') ? Number(searchParams.get('genre')) : 0;

  const [genres, setGenres] = useState<Genre[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState<DiscoverFilters>({
    genre: initGenre || undefined,
    sortBy: 'popularity.desc',
    minRating: undefined,
    maxRating: undefined,
    minYear: undefined,
    maxYear: undefined,
    minRuntime: undefined,
    maxRuntime: undefined,
  });

  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => { getGenres().then(r => setGenres(r.genres)); }, []);

  const loadMovies = useCallback((f: DiscoverFilters, p: number, append = false) => {
    setLoading(true);
    discoverMovies({ ...f, page: p })
      .then(res => {
        setMovies(prev => append ? [...prev, ...res.results] : res.results);
        setTotalPages(res.total_pages);
      })
      .finally(() => setLoading(false));
  }, []);

  // Initial/filter-change load
  useEffect(() => {
    setPage(1);
    setMovies([]);
    loadMovies(filters, 1, false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  // Intersection observer for infinite scroll
  useEffect(() => {
    observerRef.current?.disconnect();
    if (page >= totalPages) return;
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !loading) {
        const nextPage = page + 1;
        setPage(nextPage);
        loadMovies(filters, nextPage, true);
      }
    }, { threshold: 0.5 });
    if (sentinelRef.current) observerRef.current.observe(sentinelRef.current);
    return () => observerRef.current?.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, totalPages, loading, filters]);

  const setFilter = <K extends keyof DiscoverFilters>(key: K, val: DiscoverFilters[K]) => {
    setFilters(f => ({ ...f, [key]: val }));
  };

  const resetFilters = () => setFilters({ sortBy: 'popularity.desc' });

  const activeFilterCount = [
    filters.genre, filters.minRating, filters.maxRating,
    filters.minYear, filters.maxYear, filters.minRuntime, filters.maxRuntime,
  ].filter(Boolean).length;

  return (
    <div className="page-enter" style={{ minHeight: '100vh', background: '#070a11', paddingTop: 80 }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 24px 80px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, fontWeight: 900, color: '#f0eff4', letterSpacing: '-0.5px' }}>
              Discover
            </h1>
            <p style={{ fontSize: 14, color: '#7a8499', marginTop: 4 }}>
              Explore thousands of films with advanced filters
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {/* Sort */}
            <select
              className="cselect"
              value={filters.sortBy}
              onChange={e => setFilter('sortBy', e.target.value)}
              style={{ fontSize: 13, height: 38 }}
            >
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters(f => !f)}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '8px 16px', borderRadius: 10, height: 38,
                background: showFilters ? 'rgba(240,180,48,0.12)' : 'rgba(255,255,255,0.06)',
                border: showFilters ? '1px solid rgba(240,180,48,0.4)' : '1px solid rgba(255,255,255,0.1)',
                color: showFilters ? '#f0b430' : '#adb8cc',
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4.25 5.61C6.27 8.2 10 13 10 13v6c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-6s3.72-4.8 5.74-7.39c.51-.66.04-1.61-.79-1.61H5.04c-.83 0-1.3.95-.79 1.61z"/>
              </svg>
              Filters {activeFilterCount > 0 && <span style={{ background: '#f0b430', color: '#070a11', borderRadius: '50%', width: 18, height: 18, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800 }}>{activeFilterCount}</span>}
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 16, padding: 24, marginBottom: 28,
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
              {/* Genre */}
              <FilterGroup label="Genre">
                <select className="cselect" style={{ fontSize: 13 }} value={filters.genre || ''} onChange={e => setFilter('genre', e.target.value ? Number(e.target.value) : undefined)}>
                  <option value="">All Genres</option>
                  {genres.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </FilterGroup>

              {/* Release year */}
              <FilterGroup label="Release Year (From)">
                <select className="cselect" style={{ fontSize: 13 }} value={filters.minYear || ''} onChange={e => setFilter('minYear', e.target.value ? Number(e.target.value) : undefined)}>
                  <option value="">Any</option>
                  {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </FilterGroup>
              <FilterGroup label="Release Year (To)">
                <select className="cselect" style={{ fontSize: 13 }} value={filters.maxYear || ''} onChange={e => setFilter('maxYear', e.target.value ? Number(e.target.value) : undefined)}>
                  <option value="">Any</option>
                  {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </FilterGroup>

              {/* Rating */}
              <FilterGroup label={`Min Rating: ${filters.minRating ?? 0}`}>
                <input type="range" min={0} max={10} step={0.5} value={filters.minRating ?? 0}
                  onChange={e => setFilter('minRating', Number(e.target.value) || undefined)}
                  style={{ width: '100%', accentColor: '#f0b430' }} />
              </FilterGroup>

              {/* Runtime */}
              <FilterGroup label="Min Runtime (min)">
                <select className="cselect" style={{ fontSize: 13 }} value={filters.minRuntime || ''} onChange={e => setFilter('minRuntime', e.target.value ? Number(e.target.value) : undefined)}>
                  <option value="">Any</option>
                  {[60, 80, 90, 100, 120, 150, 180].map(v => <option key={v} value={v}>{v} min</option>)}
                </select>
              </FilterGroup>
              <FilterGroup label="Max Runtime (min)">
                <select className="cselect" style={{ fontSize: 13 }} value={filters.maxRuntime || ''} onChange={e => setFilter('maxRuntime', e.target.value ? Number(e.target.value) : undefined)}>
                  <option value="">Any</option>
                  {[60, 80, 90, 100, 120, 150, 180, 240].map(v => <option key={v} value={v}>{v} min</option>)}
                </select>
              </FilterGroup>
            </div>

            {/* Genre pills */}
            <div style={{ marginTop: 20 }}>
              <p style={{ fontSize: 12, color: '#7a8499', marginBottom: 10, fontWeight: 600 }}>QUICK GENRES</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {genres.map(g => (
                  <button
                    key={g.id}
                    onClick={() => setFilter('genre', filters.genre === g.id ? undefined : g.id)}
                    className={`genre-pill ${filters.genre === g.id ? 'active' : ''}`}
                    style={{ border: 'none', cursor: 'pointer' }}
                  >
                    {g.name}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 18, display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={resetFilters} style={{ fontSize: 13, color: '#7a8499', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                Reset all filters
              </button>
            </div>
          </div>
        )}

        {/* Movie Grid */}
        {movies.length === 0 && !loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#7a8499' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎬</div>
            <p style={{ fontSize: 16 }}>No movies found. Try adjusting your filters.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 20 }}>
            {movies.map(movie => <MovieCard key={movie.id} movie={movie} />)}
            {loading && Array.from({ length: 12 }).map((_, i) => <MovieCardSkeleton key={`sk-${i}`} />)}
          </div>
        )}

        {/* Infinite scroll sentinel */}
        <div ref={sentinelRef} style={{ height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {loading && movies.length > 0 && (
            <div style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid rgba(240,180,48,0.3)', borderTopColor: '#f0b430', animation: 'spin 0.8s linear infinite' }} />
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ fontSize: 11, fontWeight: 600, color: '#7a8499', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.8 }}>{label}</label>
      {children}
    </div>
  );
}
