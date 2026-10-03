import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { POSTER, PROFILE, searchMovies, searchPeople, searchMulti, searchCollections, searchCompanies } from '../lib/tmdb';
import { formatYear, ratingColor } from '../lib/utils';
import { SearchResultSkeleton } from '../components/Skeleton';
import type { Movie, Person, MultiSearchResult, Collection, Company } from '../lib/types';

type Tab = 'all' | 'movies' | 'people' | 'collections' | 'companies';

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initQuery);
  const [tab, setTab] = useState<Tab>('all');
  const [loading, setLoading] = useState(false);

  const [allResults, setAllResults] = useState<MultiSearchResult[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [counts, setCounts] = useState({ all: 0, movies: 0, people: 0, collections: 0, companies: 0 });

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleInput = (val: string) => {
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(val);
      setSearchParams(val ? { q: val } : {});
    }, 400);
  };

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setAllResults([]); setMovies([]); setPeople([]); setCollections([]); setCompanies([]);
      setCounts({ all: 0, movies: 0, people: 0, collections: 0, companies: 0 });
      return;
    }
    setLoading(true);
    try {
      const [multiRes, movRes, pepRes, colRes, comRes] = await Promise.all([
        searchMulti(q),
        searchMovies(q),
        searchPeople(q),
        searchCollections(q),
        searchCompanies(q),
      ]);
      setAllResults(multiRes.results);
      setMovies(movRes.results);
      setPeople(pepRes.results);
      setCollections(colRes.results);
      setCompanies(comRes.results);
      setCounts({
        all: multiRes.total_results,
        movies: movRes.total_results,
        people: pepRes.total_results,
        collections: colRes.total_results,
        companies: comRes.total_results,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { doSearch(debouncedQuery); }, [debouncedQuery, doSearch]);

  const TABS: { key: Tab; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: counts.all },
    { key: 'movies', label: 'Movies', count: counts.movies },
    { key: 'people', label: 'People', count: counts.people },
    { key: 'collections', label: 'Collections', count: counts.collections },
    { key: 'companies', label: 'Companies', count: counts.companies },
  ];

  const hasResults = debouncedQuery && !loading;

  return (
    <div className="page-enter" style={{ minHeight: '100vh', background: '#070a11', paddingTop: 80 }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px 80px' }}>

        {/* Search input */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, fontWeight: 900, color: '#f0eff4', marginBottom: 20, letterSpacing: '-0.5px' }}>
            Search
          </h1>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              value={query}
              onChange={e => handleInput(e.target.value)}
              placeholder="Search movies, people, collections…"
              className="cinput"
              autoFocus={!initQuery}
              style={{ paddingLeft: 44, fontSize: 16, height: 52, borderRadius: 14 }}
            />
            <svg
              width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7a8499" strokeWidth="2"
              style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
            >
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            {query && (
              <button onClick={() => { setQuery(''); handleInput(''); }}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#7a8499', cursor: 'pointer', padding: 4 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        {hasResults && (
          <div style={{ display: 'flex', gap: 24, borderBottom: '1px solid rgba(255,255,255,0.07)', marginBottom: 28 }}>
            {TABS.map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`tab-btn ${tab === t.key ? 'active' : ''}`}
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 14 }}
              >
                {t.label}
                {t.count > 0 && (
                  <span style={{ fontSize: 11, background: tab === t.key ? 'rgba(240,180,48,0.15)' : 'rgba(255,255,255,0.07)', color: tab === t.key ? '#f0b430' : '#7a8499', padding: '1px 6px', borderRadius: 10 }}>
                    {t.count.toLocaleString()}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Results */}
        {!debouncedQuery ? (
          <EmptySearch />
        ) : loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {Array.from({ length: 6 }).map((_, i) => <SearchResultSkeleton key={i} />)}
          </div>
        ) : (
          <>
            {tab === 'all' && <MultiResults results={allResults} />}
            {tab === 'movies' && <MovieResults movies={movies} />}
            {tab === 'people' && <PeopleResults people={people} />}
            {tab === 'collections' && <CollectionResults collections={collections} />}
            {tab === 'companies' && <CompanyResults companies={companies} />}
          </>
        )}
      </div>
    </div>
  );
}

// ── Result renderers ──────────────────────────────────────────────────────────

function MultiResults({ results }: { results: MultiSearchResult[] }) {
  if (!results.length) return <NoResults />;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {results.slice(0, 20).map(r => {
        if (r.media_type === 'movie') return <MovieResultItem key={r.id} item={r as unknown as Movie} />;
        if (r.media_type === 'person') return <PersonResultItem key={r.id} item={r as unknown as Person} />;
        return null;
      })}
    </div>
  );
}

function MovieResults({ movies }: { movies: Movie[] }) {
  if (!movies.length) return <NoResults />;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {movies.map(m => <MovieResultItem key={m.id} item={m} />)}
    </div>
  );
}

function PeopleResults({ people }: { people: Person[] }) {
  if (!people.length) return <NoResults />;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {people.map(p => <PersonResultItem key={p.id} item={p} />)}
    </div>
  );
}

function CollectionResults({ collections }: { collections: Collection[] }) {
  if (!collections.length) return <NoResults />;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {collections.map(c => (
        <ResultRow
          key={c.id}
          to={`/collection/${c.id}`}
          img={POSTER(c.poster_path, 'w185')}
          title={c.name}
          subtitle="Collection"
          overview={c.overview}
        />
      ))}
    </div>
  );
}

function CompanyResults({ companies }: { companies: Company[] }) {
  if (!companies.length) return <NoResults />;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {companies.map(c => (
        <div key={c.id} style={{ display: 'flex', gap: 16, padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', alignItems: 'center' }}>
          <div style={{ width: 60, height: 60, borderRadius: 8, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 20 }}>
            🏢
          </div>
          <div>
            <p style={{ fontWeight: 600, color: '#edeef2', fontSize: 15 }}>{c.name}</p>
            <p style={{ fontSize: 12, color: '#7a8499', marginTop: 2 }}>{c.origin_country || 'Production Company'}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function MovieResultItem({ item }: { item: Movie }) {
  const img = POSTER(item.poster_path, 'w185');
  const year = formatYear(item.release_date);
  const clr = ratingColor(item.vote_average || 0);
  return (
    <ResultRow
      to={`/movie/${item.id}`}
      img={img}
      title={item.title}
      subtitle={`Movie${year ? ' · ' + year : ''}`}
      meta={item.vote_average ? `★ ${item.vote_average.toFixed(1)}` : undefined}
      metaColor={clr}
      overview={item.overview}
    />
  );
}

function PersonResultItem({ item }: { item: Person }) {
  const img = PROFILE(item.profile_path, 'w185');
  return (
    <ResultRow
      to={`/person/${item.id}`}
      img={img}
      imgRound
      title={item.name}
      subtitle={item.known_for_department || 'Person'}
    />
  );
}

function ResultRow({
  to, img, imgRound = false, title, subtitle, meta, metaColor, overview,
}: {
  to: string; img: string | null; imgRound?: boolean;
  title: string; subtitle: string; meta?: string; metaColor?: string; overview?: string;
}) {
  return (
    <Link to={to} style={{ textDecoration: 'none', display: 'flex', gap: 14, padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.15s' }}
      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
    >
      <div style={{
        width: 54, height: 80, borderRadius: imgRound ? '50%' : 6,
        background: '#141b24', flexShrink: 0, overflow: 'hidden',
        ...(imgRound ? { height: 54, width: 54 } : {}),
      }}>
        {img ? <img src={img} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
      </div>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
          <p style={{ fontWeight: 600, color: '#edeef2', fontSize: 15, lineHeight: 1.3 }} className="line-clamp-2">{title}</p>
          {meta && <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: metaColor, flexShrink: 0 }}>{meta}</span>}
        </div>
        <p style={{ fontSize: 12, color: '#7a8499', marginTop: 3 }}>{subtitle}</p>
        {overview && <p style={{ fontSize: 13, color: '#adb8cc', marginTop: 6, lineHeight: 1.5 }} className="line-clamp-2">{overview}</p>}
      </div>
    </Link>
  );
}

function NoResults() {
  return (
    <div style={{ textAlign: 'center', padding: '60px 0', color: '#7a8499' }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
      <p style={{ fontSize: 16 }}>No results found</p>
    </div>
  );
}

function EmptySearch() {
  return (
    <div style={{ textAlign: 'center', padding: '80px 0' }}>
      <div style={{ fontSize: 60, marginBottom: 20 }}>🎬</div>
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: '#edeef2', marginBottom: 10 }}>
        Find Your Next Watch
      </h2>
      <p style={{ fontSize: 15, color: '#7a8499', lineHeight: 1.7 }}>
        Search for movies, actors, directors, collections, and more.
      </p>
    </div>
  );
}
