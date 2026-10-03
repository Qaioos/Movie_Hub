import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Movie, Credits, Video, Review, MovieImage, WatchProviderResult } from '../lib/types';
import {
  getMovieDetails, getMovieCredits, getMovieVideos, getMovieImages,
  getMovieReviews, getSimilar, getRecommendations, getWatchProviders,
  BACKDROP, POSTER, PROFILE, IMG_BASE,
} from '../lib/tmdb';
import { formatDate, formatRuntime, formatYear, formatMoney, ratingColor, getLocalList, setLocalList, isInList, toggleInList } from '../lib/utils';
import MovieRow from '../components/MovieRow';
import { DetailHeroSkeleton } from '../components/Skeleton';
import type { FavoriteItem, WatchlistItem, RatedItem } from '../lib/types';

type DetailTab = 'overview' | 'cast' | 'videos' | 'images' | 'reviews' | 'similar' | 'providers';

export default function MovieDetail() {
  const { id } = useParams<{ id: string }>();
  const movieId = Number(id);

  const [movie, setMovie] = useState<Movie | null>(null);
  const [credits, setCredits] = useState<Credits | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [images, setImages] = useState<MovieImage[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [similar, setSimilar] = useState<Movie[]>([]);
  const [recommendations, setRecommendations] = useState<Movie[]>([]);
  const [providers, setProviders] = useState<WatchProviderResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<DetailTab>('overview');
  const [trailerOpen, setTrailerOpen] = useState(false);
  const [ratingOpen, setRatingOpen] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  // User lists
  const [favorites, setFavorites] = useState<FavoriteItem[]>(() => getLocalList('favorites'));
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>(() => getLocalList('watchlist'));
  const [rated, setRated] = useState<RatedItem[]>(() => getLocalList('rated'));

  const isFav = isInList(favorites, movieId);
  const isWatchlist = isInList(watchlist, movieId);
  const myRating = rated.find(r => r.id === movieId)?.userRating || 0;

  useEffect(() => {
    if (!movieId) return;
    setLoading(true);
    setMovie(null);
    Promise.all([
      getMovieDetails(movieId).then(setMovie),
      getMovieCredits(movieId).then(setCredits),
      getMovieVideos(movieId).then(r => setVideos(r.results)),
      getMovieImages(movieId).then(r => setImages(r.backdrops.slice(0, 18))),
      getMovieReviews(movieId).then(r => setReviews(r.results)),
      getSimilar(movieId).then(r => setSimilar(r.results)),
      getRecommendations(movieId).then(r => setRecommendations(r.results)),
      getWatchProviders(movieId).then(r => setProviders(r.results?.US || null)),
    ]).finally(() => setLoading(false));
    window.scrollTo(0, 0);
  }, [movieId]);

  const makeListItem = (): FavoriteItem => ({
    id: movieId,
    type: 'movie',
    title: movie?.title || '',
    poster_path: movie?.poster_path || null,
    vote_average: movie?.vote_average || 0,
    release_date: movie?.release_date || '',
    addedAt: new Date().toISOString(),
  });

  const toggleFav = () => {
    const updated = toggleInList(favorites, makeListItem());
    setFavorites(updated);
    setLocalList('favorites', updated);
  };

  const toggleWatch = () => {
    const updated = toggleInList(watchlist, makeListItem() as WatchlistItem);
    setWatchlist(updated);
    setLocalList('watchlist', updated);
  };

  const submitRating = (r: number) => {
    const newRated: RatedItem[] = [
      ...rated.filter(i => i.id !== movieId),
      { ...makeListItem(), userRating: r },
    ];
    setRated(newRated);
    setLocalList('rated', newRated);
    setRatingOpen(false);
  };

  const trailer = videos.find(v => v.type === 'Trailer' && v.site === 'YouTube') || videos.find(v => v.site === 'YouTube');
  const director = credits?.crew.find(c => c.job === 'Director');

  if (loading) return (
    <div style={{ paddingTop: 64, background: '#070a11', minHeight: '100vh' }}>
      <DetailHeroSkeleton />
    </div>
  );

  if (!movie) return <NotFound />;

  const backdrop = BACKDROP(movie.backdrop_path, 'original');
  const poster = POSTER(movie.poster_path, 'w500');
  const clr = ratingColor(movie.vote_average);

  const TABS: { key: DetailTab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'cast', label: 'Cast & Crew' },
    { key: 'videos', label: `Videos${videos.length ? ` (${videos.length})` : ''}` },
    { key: 'images', label: `Images${images.length ? ` (${images.length})` : ''}` },
    { key: 'reviews', label: `Reviews${reviews.length ? ` (${reviews.length})` : ''}` },
    { key: 'similar', label: 'Similar' },
    { key: 'providers', label: 'Where to Watch' },
  ];

  return (
    <div className="page-enter" style={{ minHeight: '100vh', background: '#070a11' }}>
      {/* Cinematic backdrop hero */}
      <div style={{ position: 'relative', height: 560, overflow: 'hidden' }}>
        {backdrop && (
          <img src={backdrop} alt={movie.title} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 20%' }} />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(7,10,17,0.98) 0%, rgba(7,10,17,0.7) 50%, rgba(7,10,17,0.3) 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #070a11 0%, rgba(7,10,17,0.5) 40%, transparent 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(7,10,17,0.5) 0%, transparent 20%)' }} />

        {/* Content overlay */}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'flex-end', maxWidth: 1400, margin: '0 auto', left: '50%', transform: 'translateX(-50%)', width: '100%', padding: '0 40px 40px' }}>
          <div style={{ display: 'flex', gap: 36, alignItems: 'flex-end', width: '100%' }}>
            {/* Poster */}
            <div style={{ flexShrink: 0, width: 180, borderRadius: 12, overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.08)' }} className="detail-poster">
              {poster
                ? <img src={poster} alt={movie.title} style={{ width: '100%', display: 'block' }} />
                : <div style={{ width: 180, height: 270, background: '#141b24', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3a4558', fontSize: 40 }}>🎬</div>
              }
            </div>

            {/* Info */}
            <div style={{ flex: 1, paddingBottom: 4 }}>
              {movie.tagline && (
                <p style={{ fontSize: 13, color: '#f0b430', fontStyle: 'italic', marginBottom: 8, opacity: 0.85 }}>{movie.tagline}</p>
              )}
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(26px, 4vw, 48px)', fontWeight: 900, color: '#f0eff4', lineHeight: 1.05, letterSpacing: '-0.5px', marginBottom: 12 }}>
                {movie.title}
              </h1>

              {/* Meta row */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', marginBottom: 14 }}>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 15, fontWeight: 700, color: clr }}>★ {movie.vote_average.toFixed(1)}</span>
                <span style={{ fontSize: 13, color: '#7a8499' }}>{formatYear(movie.release_date)}</span>
                {movie.runtime && <span style={{ fontSize: 13, color: '#7a8499' }}>· {formatRuntime(movie.runtime)}</span>}
                {director && <span style={{ fontSize: 13, color: '#adb8cc' }}>· dir. {director.name}</span>}
              </div>

              {/* Genres */}
              {movie.genres && movie.genres.length > 0 && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
                  {movie.genres.map(g => (
                    <Link key={g.id} to={`/discover?genre=${g.id}`} className="genre-pill" style={{ textDecoration: 'none', fontSize: 12 }}>{g.name}</Link>
                  ))}
                </div>
              )}

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {trailer && (
                  <ActionBtn primary onClick={() => setTrailerOpen(true)}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                    Watch Trailer
                  </ActionBtn>
                )}
                <ActionBtn onClick={toggleFav} active={isFav}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill={isFav ? '#e54b4b' : 'none'} stroke={isFav ? '#e54b4b' : 'currentColor'} strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                  {isFav ? 'Favorited' : 'Favorite'}
                </ActionBtn>
                <ActionBtn onClick={toggleWatch} active={isWatchlist}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill={isWatchlist ? '#f0b430' : 'none'} stroke={isWatchlist ? '#f0b430' : 'currentColor'} strokeWidth="2">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                  </svg>
                  {isWatchlist ? 'In Watchlist' : 'Watchlist'}
                </ActionBtn>
                <ActionBtn onClick={() => setRatingOpen(true)} active={myRating > 0}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill={myRating > 0 ? '#f0b430' : 'none'} stroke={myRating > 0 ? '#f0b430' : 'currentColor'} strokeWidth="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                  {myRating > 0 ? `Rated ${myRating}/10` : 'Rate'}
                </ActionBtn>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content area */}
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 40px 80px' }}>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 24, borderBottom: '1px solid rgba(255,255,255,0.07)', marginBottom: 36, overflowX: 'auto' }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)} className={`tab-btn ${activeTab === t.key ? 'active' : ''}`}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, whiteSpace: 'nowrap' }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 40 }} className="detail-grid">
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#edeef2', marginBottom: 14 }}>Overview</h2>
              <p style={{ fontSize: 15, color: '#adb8cc', lineHeight: 1.75 }}>{movie.overview || 'No overview available.'}</p>

              {movie.keywords?.keywords && movie.keywords.keywords.length > 0 && (
                <div style={{ marginTop: 28 }}>
                  <h3 style={{ fontSize: 13, fontWeight: 700, color: '#7a8499', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.8 }}>Keywords</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                    {movie.keywords.keywords.map(k => (
                      <span key={k.id} style={{ fontSize: 12, color: '#adb8cc', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, padding: '3px 10px' }}>{k.name}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar facts */}
            <div>
              <InfoSection>
                <InfoItem label="Status" value={movie.status} />
                <InfoItem label="Release Date" value={formatDate(movie.release_date)} />
                <InfoItem label="Runtime" value={formatRuntime(movie.runtime)} />
                <InfoItem label="Budget" value={formatMoney(movie.budget)} />
                <InfoItem label="Revenue" value={formatMoney(movie.revenue)} />
                <InfoItem label="Original Language" value={movie.original_language?.toUpperCase()} />
              </InfoSection>

              {movie.production_companies && movie.production_companies.length > 0 && (
                <div style={{ marginTop: 20 }}>
                  <p style={{ fontSize: 11, color: '#7a8499', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>Production</p>
                  {movie.production_companies.map(c => (
                    <p key={c.id} style={{ fontSize: 13, color: '#adb8cc', marginBottom: 4 }}>{c.name}</p>
                  ))}
                </div>
              )}

              {movie.belongs_to_collection && (
                <Link to={`/collection/${movie.belongs_to_collection.id}`} style={{
                  display: 'block', marginTop: 20, padding: 14,
                  background: 'rgba(240,180,48,0.06)', border: '1px solid rgba(240,180,48,0.15)',
                  borderRadius: 10, textDecoration: 'none',
                }}>
                  <p style={{ fontSize: 11, color: '#f0b430', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 }}>Part of Collection</p>
                  <p style={{ fontSize: 14, color: '#edeef2', fontWeight: 600 }}>{movie.belongs_to_collection.name}</p>
                </Link>
              )}
            </div>
          </div>
        )}

        {activeTab === 'cast' && credits && (
          <div>
            <SectionHead>Cast</SectionHead>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 16, marginBottom: 40 }}>
              {credits.cast.slice(0, 24).map(c => (
                <Link key={c.credit_id} to={`/person/${c.id}`} style={{ textDecoration: 'none' }}>
                  <div style={{ borderRadius: 10, overflow: 'hidden', background: '#0d1117', transition: 'transform 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-3px)')}
                    onMouseLeave={e => (e.currentTarget.style.transform = 'none')}
                  >
                    <div style={{ aspectRatio: '2/3', background: '#141b24', overflow: 'hidden' }}>
                      {PROFILE(c.profile_path)
                        ? <img src={PROFILE(c.profile_path)!} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3a4558', fontSize: 28 }}>👤</div>
                      }
                    </div>
                    <div style={{ padding: '10px 12px' }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: '#edeef2', lineHeight: 1.3 }} className="line-clamp-2">{c.name}</p>
                      <p style={{ fontSize: 11, color: '#7a8499', marginTop: 3 }} className="line-clamp-2">{c.character}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {credits.crew.length > 0 && (
              <>
                <SectionHead>Crew</SectionHead>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
                  {credits.crew
                    .filter(c => ['Director', 'Producer', 'Screenplay', 'Writer', 'Director of Photography', 'Original Music Composer', 'Editor'].includes(c.job))
                    .slice(0, 20)
                    .map(c => (
                      <Link key={c.credit_id} to={`/person/${c.id}`} style={{ textDecoration: 'none', display: 'flex', gap: 10, alignItems: 'center', padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, transition: 'background 0.15s' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                      >
                        <div style={{ width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', background: '#141b24', flexShrink: 0 }}>
                          {PROFILE(c.profile_path, 'w45') && <img src={PROFILE(c.profile_path, 'w45')!} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                        </div>
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 600, color: '#edeef2' }}>{c.name}</p>
                          <p style={{ fontSize: 11, color: '#7a8499' }}>{c.job}</p>
                        </div>
                      </Link>
                    ))}
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'videos' && (
          <div>
            <SectionHead>Videos</SectionHead>
            {videos.length === 0 ? <EmptySection label="No videos available" /> : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                {videos.map(v => (
                  <a key={v.id} href={`https://www.youtube.com/watch?v=${v.key}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                    <div style={{ borderRadius: 10, overflow: 'hidden', background: '#141b24', position: 'relative' }}
                      className="movie-card"
                    >
                      <img src={`https://img.youtube.com/vi/${v.key}/mqdefault.jpg`} alt={v.name} style={{ width: '100%', display: 'block' }} />
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(240,180,48,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="#070a11"><path d="M8 5v14l11-7z"/></svg>
                        </div>
                      </div>
                      <div style={{ padding: '10px 12px', background: '#0d1117' }}>
                        <p style={{ fontSize: 12, fontWeight: 600, color: '#edeef2' }} className="line-clamp-2">{v.name}</p>
                        <p style={{ fontSize: 11, color: '#7a8499', marginTop: 2 }}>{v.type}</p>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'images' && (
          <div>
            <SectionHead>Images</SectionHead>
            {images.length === 0 ? <EmptySection label="No images available" /> : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                {images.map((img, i) => (
                  <a key={i} href={`${IMG_BASE}/original${img.file_path}`} target="_blank" rel="noopener noreferrer">
                    <div style={{ borderRadius: 8, overflow: 'hidden' }} className="movie-card">
                      <img src={`${IMG_BASE}/w500${img.file_path}`} alt={`Backdrop ${i + 1}`} style={{ width: '100%', display: 'block' }} loading="lazy" />
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div>
            <SectionHead>Reviews</SectionHead>
            {reviews.length === 0 ? <EmptySection label="No reviews yet" /> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {reviews.map(r => <ReviewCard key={r.id} review={r} />)}
              </div>
            )}
          </div>
        )}

        {activeTab === 'similar' && (
          <div>
            <MovieRow title="Similar Movies" movies={similar} />
            <MovieRow title="Recommended" movies={recommendations} />
          </div>
        )}

        {activeTab === 'providers' && (
          <div>
            <SectionHead>Where to Watch <span style={{ fontSize: 12, color: '#7a8499', fontWeight: 400 }}>(US)</span></SectionHead>
            {!providers ? (
              <EmptySection label="No streaming info available for this region" />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {providers.flatrate && <ProviderGroup label="Stream" providers={providers.flatrate} />}
                {providers.rent && <ProviderGroup label="Rent" providers={providers.rent} />}
                {providers.buy && <ProviderGroup label="Buy" providers={providers.buy} />}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Trailer modal */}
      {trailerOpen && trailer && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
          onClick={() => setTrailerOpen(false)}
        >
          <div style={{ position: 'relative', width: '100%', maxWidth: 900, aspectRatio: '16/9' }} onClick={e => e.stopPropagation()}>
            <iframe
              src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1`}
              title="Trailer"
              style={{ width: '100%', height: '100%', border: 'none', borderRadius: 12 }}
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
            <button onClick={() => setTrailerOpen(false)} style={{ position: 'absolute', top: -40, right: 0, background: 'none', border: 'none', color: '#edeef2', cursor: 'pointer', fontSize: 28 }}>✕</button>
          </div>
        </div>
      )}

      {/* Rating modal */}
      {ratingOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setRatingOpen(false)}>
          <div style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 32, textAlign: 'center', width: 320 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: '#edeef2', marginBottom: 8 }}>Rate this Movie</h3>
            <p style={{ fontSize: 13, color: '#7a8499', marginBottom: 24 }}>{movie.title}</p>
            <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 24 }}>
              {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
                <button key={n} onClick={() => setUserRating(n)}
                  onMouseEnter={() => setHoverRating(n)} onMouseLeave={() => setHoverRating(0)}
                  style={{ width: 34, height: 34, borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, transition: 'all 0.15s',
                    background: n <= (hoverRating || userRating) ? '#f0b430' : 'rgba(255,255,255,0.07)',
                    color: n <= (hoverRating || userRating) ? '#070a11' : '#7a8499',
                  }}>
                  {n}
                </button>
              ))}
            </div>
            <button onClick={() => userRating > 0 && submitRating(userRating)} style={{ width: '100%', padding: '12px', borderRadius: 10, background: userRating > 0 ? '#f0b430' : 'rgba(255,255,255,0.07)', color: userRating > 0 ? '#070a11' : '#7a8499', fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer' }}>
              {userRating > 0 ? `Submit Rating: ${userRating}/10` : 'Select a rating'}
            </button>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .detail-poster { display: none !important; }
          .detail-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ActionBtn({ children, onClick, primary, active }: { children: React.ReactNode; onClick: () => void; primary?: boolean; active?: boolean }) {
  return (
    <button onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', gap: 7, padding: '10px 18px',
      borderRadius: 10, border: primary ? 'none' : '1px solid rgba(255,255,255,0.12)',
      background: primary ? '#f0b430' : active ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)',
      color: primary ? '#070a11' : '#edeef2', fontWeight: 600, fontSize: 13,
      cursor: 'pointer', transition: 'all 0.2s',
    }}
    onMouseEnter={e => { if (!primary) e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; }}
    onMouseLeave={e => { if (!primary) e.currentTarget.style.background = active ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)'; }}
    >
      {children}
    </button>
  );
}

function SectionHead({ children }: { children: React.ReactNode }) {
  return <h2 style={{ fontSize: 20, fontWeight: 700, color: '#edeef2', marginBottom: 20 }}>{children}</h2>;
}

function InfoSection({ children }: { children: React.ReactNode }) {
  return <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 18 }}>{children}</div>;
}

function InfoItem({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <span style={{ fontSize: 12, color: '#7a8499', fontWeight: 600 }}>{label}</span>
      <span style={{ fontSize: 12, color: '#edeef2', textAlign: 'right', maxWidth: '60%' }}>{value}</span>
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const [expanded, setExpanded] = useState(false);
  const long = review.content.length > 400;
  const text = long && !expanded ? review.content.slice(0, 400) + '…' : review.content;
  const avatar = review.author_details.avatar_path;
  const avatarUrl = avatar
    ? avatar.startsWith('/https') ? avatar.slice(1) : `${IMG_BASE}/w45${avatar}`
    : null;

  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 20 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 14 }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', overflow: 'hidden', background: '#141b24', flexShrink: 0 }}>
          {avatarUrl ? <img src={avatarUrl} alt={review.author} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7a8499', fontWeight: 700 }}>{review.author[0]?.toUpperCase()}</div>}
        </div>
        <div>
          <p style={{ fontWeight: 600, color: '#edeef2', fontSize: 14 }}>{review.author}</p>
          <p style={{ fontSize: 12, color: '#7a8499' }}>{new Date(review.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        {review.author_details.rating && (
          <span style={{ marginLeft: 'auto', fontFamily: "'DM Mono', monospace", fontSize: 13, color: '#f0b430', fontWeight: 600 }}>★ {review.author_details.rating}</span>
        )}
      </div>
      <p style={{ fontSize: 14, color: '#adb8cc', lineHeight: 1.75, whiteSpace: 'pre-line' }}>{text}</p>
      {long && (
        <button onClick={() => setExpanded(e => !e)} style={{ marginTop: 10, fontSize: 13, color: '#f0b430', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          {expanded ? 'Show less' : 'Read more'}
        </button>
      )}
    </div>
  );
}

function ProviderGroup({ label, providers }: { label: string; providers: { logo_path: string; provider_id: number; provider_name: string }[] }) {
  return (
    <div>
      <p style={{ fontSize: 13, fontWeight: 700, color: '#7a8499', marginBottom: 14, textTransform: 'uppercase', letterSpacing: 0.8 }}>{label}</p>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {providers.map(p => (
          <div key={p.provider_id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, width: 72 }}>
            <div style={{ width: 54, height: 54, borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
              <img src={`https://image.tmdb.org/t/p/original${p.logo_path}`} alt={p.provider_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <p style={{ fontSize: 11, color: '#7a8499', textAlign: 'center', lineHeight: 1.3 }}>{p.provider_name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptySection({ label }: { label: string }) {
  return <div style={{ padding: '40px 0', textAlign: 'center', color: '#7a8499', fontSize: 14 }}>{label}</div>;
}

function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#070a11' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 60, marginBottom: 16 }}>🎬</div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: '#edeef2', marginBottom: 10 }}>Movie not found</h1>
        <Link to="/" style={{ color: '#f0b430', textDecoration: 'none' }}>← Back to Home</Link>
      </div>
    </div>
  );
}
