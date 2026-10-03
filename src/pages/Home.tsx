import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import HeroSlider from '../components/HeroSlider';
import MovieRow from '../components/MovieRow';
import PersonCard from '../components/PersonCard';
import { PersonCardSkeleton } from '../components/Skeleton';
import {
  getTrending, getPopular, getTopRated, getNowPlaying, getUpcoming,
  getGenres, getTrendingPeople,
} from '../lib/tmdb';
import type { Movie, Genre, Person } from '../lib/types';

const GENRE_ICONS: Record<number, string> = {
  28: '💥', 12: '🗺️', 16: '🎨', 35: '😂', 80: '🔫', 99: '🎬',
  18: '🎭', 10751: '👨‍👩‍👧', 14: '✨', 36: '🏛️', 27: '👻', 10402: '🎵',
  9648: '🕵️', 10749: '💕', 878: '🚀', 10770: '📺', 53: '😰', 10752: '⚔️', 37: '🤠',
};

export default function Home() {
  const [trending, setTrending] = useState<Movie[] | null>(null);
  const [popular, setPopular] = useState<Movie[] | null>(null);
  const [topRated, setTopRated] = useState<Movie[] | null>(null);
  const [nowPlaying, setNowPlaying] = useState<Movie[] | null>(null);
  const [upcoming, setUpcoming] = useState<Movie[] | null>(null);
  const [genres, setGenres] = useState<Genre[] | null>(null);
  const [people, setPeople] = useState<Person[] | null>(null);
  const [loadingHero, setLoadingHero] = useState(true);
  const [loadingRows, setLoadingRows] = useState(true);
  const [loadingGenres, setLoadingGenres] = useState(true);
  const [loadingPeople, setLoadingPeople] = useState(true);

  useEffect(() => {
    getTrending('movie', 'week')
      .then(r => setTrending(r.results))
      .finally(() => setLoadingHero(false));

    Promise.all([
      getPopular().then(r => setPopular(r.results)),
      getTopRated().then(r => setTopRated(r.results)),
      getNowPlaying().then(r => setNowPlaying(r.results)),
      getUpcoming().then(r => setUpcoming(r.results)),
    ]).finally(() => setLoadingRows(false));

    getGenres().then(r => setGenres(r.genres)).finally(() => setLoadingGenres(false));
    getTrendingPeople().then(r => setPeople(r.results.slice(0, 12))).finally(() => setLoadingPeople(false));
  }, []);

  return (
    <div className="page-enter" style={{ minHeight: '100vh', background: '#070a11' }}>
      <HeroSlider movies={trending} loading={loadingHero} />

      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '56px 24px 80px' }}>
        <MovieRow title="Trending This Week" movies={trending} loading={loadingHero} />
        <MovieRow title="Popular Now" movies={popular} loading={loadingRows} />
        <MovieRow title="Top Rated" movies={topRated} loading={loadingRows} />
        <MovieRow title="Now Playing" movies={nowPlaying} loading={loadingRows} />
        <MovieRow title="Coming Soon" movies={upcoming} loading={loadingRows} />

        {/* Genres Grid */}
        <section style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#edeef2', marginBottom: 18 }}>Browse by Genre</h2>
          {loadingGenres ? (
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ width: 110, height: 40, borderRadius: 20 }} />
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {genres?.map(g => (
                <Link
                  key={g.id}
                  to={`/discover?genre=${g.id}`}
                  className="genre-pill"
                  style={{ textDecoration: 'none', fontSize: 13 }}
                >
                  {GENRE_ICONS[g.id] && <span>{GENRE_ICONS[g.id]}</span>}
                  {g.name}
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Popular People */}
        <section>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#edeef2', marginBottom: 18 }}>Popular People</h2>
          {loadingPeople ? (
            <div className="scroll-row">
              {Array.from({ length: 8 }).map((_, i) => <PersonCardSkeleton key={i} />)}
            </div>
          ) : (
            <div className="scroll-row">
              {people?.map(p => <PersonCard key={p.id} person={p} />)}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
