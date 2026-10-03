import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Person, PersonCredits, MovieImage } from '../lib/types';
import { getPersonDetails, getPersonCredits, getPersonImages, PROFILE, POSTER, IMG_BASE } from '../lib/tmdb';
import { formatDate, ratingColor } from '../lib/utils';

type Tab = 'about' | 'movies' | 'images';

export default function ActorProfile() {
  const { id } = useParams<{ id: string }>();
  const personId = Number(id);

  const [person, setPerson] = useState<Person | null>(null);
  const [credits, setCredits] = useState<PersonCredits | null>(null);
  const [images, setImages] = useState<MovieImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('about');
  const [bioExpanded, setBioExpanded] = useState(false);

  useEffect(() => {
    if (!personId) return;
    setLoading(true);
    setPerson(null);
    Promise.all([
      getPersonDetails(personId).then(setPerson),
      getPersonCredits(personId).then(setCredits),
      getPersonImages(personId).then(r => setImages(r.profiles.slice(0, 20))),
    ]).finally(() => setLoading(false));
    window.scrollTo(0, 0);
  }, [personId]);

  if (loading) return <LoadingState />;
  if (!person) return <NotFound />;

  const profileImg = PROFILE(person.profile_path, 'w500');
  const bio = person.biography || '';
  const shortBio = bio.length > 500 ? bio.slice(0, 500) + '…' : bio;

  const sortedCast = credits?.cast
    .filter(m => m.poster_path)
    .sort((a, b) => new Date(b.release_date || '').getTime() - new Date(a.release_date || '').getTime()) || [];

  const TABS: { key: Tab; label: string }[] = [
    { key: 'about', label: 'About' },
    { key: 'movies', label: `Movies (${sortedCast.length})` },
    { key: 'images', label: `Photos (${images.length})` },
  ];

  return (
    <div className="page-enter" style={{ minHeight: '100vh', background: '#070a11', paddingTop: 80 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px 80px' }}>

        {/* Profile header */}
        <div style={{ display: 'flex', gap: 40, marginBottom: 48 }} className="actor-header">
          {/* Profile image */}
          <div style={{ flexShrink: 0 }} className="actor-img-col">
            <div style={{ width: 220, borderRadius: 16, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}>
              {profileImg
                ? <img src={profileImg} alt={person.name} style={{ width: '100%', display: 'block' }} />
                : <div style={{ width: 220, height: 330, background: '#141b24', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3a4558', fontSize: 48 }}>👤</div>
              }
            </div>

            {/* External links */}
            <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
              {person.imdb_id && (
                <ExternalLink href={`https://www.imdb.com/name/${person.imdb_id}`} label="IMDb" />
              )}
              {person.homepage && (
                <ExternalLink href={person.homepage} label="Website" />
              )}
            </div>
          </div>

          {/* Info */}
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 12, color: '#f0b430', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
              {person.known_for_department || 'Acting'}
            </p>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 900, color: '#f0eff4', letterSpacing: '-0.5px', lineHeight: 1.05, marginBottom: 20 }}>
              {person.name}
            </h1>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 20, borderBottom: '1px solid rgba(255,255,255,0.07)', marginBottom: 28 }}>
              {TABS.map(t => (
                <button key={t.key} onClick={() => setTab(t.key)} className={`tab-btn ${tab === t.key ? 'active' : ''}`}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            {tab === 'about' && (
              <div>
                {/* Personal facts */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
                  {person.birthday && <Fact label="Born" value={formatDate(person.birthday)} />}
                  {person.deathday && <Fact label="Died" value={formatDate(person.deathday)} />}
                  {person.place_of_birth && <Fact label="Birthplace" value={person.place_of_birth} />}
                  {person.also_known_as && person.also_known_as.length > 0 && (
                    <Fact label="Also Known As" value={person.also_known_as[0]} />
                  )}
                </div>

                {bio && (
                  <div>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: '#7a8499', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 }}>Biography</h3>
                    <p style={{ fontSize: 15, color: '#adb8cc', lineHeight: 1.8, whiteSpace: 'pre-line' }}>
                      {bioExpanded ? bio : shortBio}
                    </p>
                    {bio.length > 500 && (
                      <button onClick={() => setBioExpanded(e => !e)} style={{ marginTop: 10, fontSize: 13, color: '#f0b430', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                        {bioExpanded ? 'Show less' : 'Read more'}
                      </button>
                    )}
                  </div>
                )}

                {/* Known for */}
                {sortedCast.length > 0 && (
                  <div style={{ marginTop: 36 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: '#7a8499', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 16 }}>Known For</h3>
                    <div className="scroll-row">
                      {sortedCast.slice(0, 12).map(m => (
                        <Link key={m.credit_id} to={`/movie/${m.id}`} style={{ textDecoration: 'none', flexShrink: 0, width: 120 }}>
                          <div style={{ borderRadius: 8, overflow: 'hidden', background: '#141b24' }} className="movie-card">
                            <img src={POSTER(m.poster_path, 'w185')!} alt={m.title} style={{ width: '100%', display: 'block', aspectRatio: '2/3', objectFit: 'cover' }} loading="lazy" />
                          </div>
                          <p style={{ fontSize: 11, fontWeight: 600, color: '#adb8cc', marginTop: 6, lineHeight: 1.3 }} className="line-clamp-2">{m.title}</p>
                          <p style={{ fontSize: 10, color: '#7a8499', marginTop: 2 }}>{m.character}</p>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {tab === 'movies' && (
              <div>
                {sortedCast.length === 0 ? (
                  <div style={{ color: '#7a8499', fontSize: 14 }}>No movie credits found.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {sortedCast.map(m => {
                      const clr = ratingColor(m.vote_average || 0);
                      return (
                        <Link key={m.credit_id} to={`/movie/${m.id}`} style={{ textDecoration: 'none', display: 'flex', gap: 14, alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.15s' }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        >
                          <div style={{ width: 46, height: 68, borderRadius: 6, overflow: 'hidden', background: '#141b24', flexShrink: 0 }}>
                            {m.poster_path && <img src={POSTER(m.poster_path, 'w92')!} alt={m.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />}
                          </div>
                          <div style={{ flex: 1 }}>
                            <p style={{ fontWeight: 600, color: '#edeef2', fontSize: 14 }} className="line-clamp-2">{m.title}</p>
                            <p style={{ fontSize: 12, color: '#7a8499', marginTop: 2 }}>{m.character || ''}</p>
                          </div>
                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: clr }}>{m.vote_average ? `★ ${m.vote_average.toFixed(1)}` : ''}</p>
                            <p style={{ fontSize: 11, color: '#7a8499', marginTop: 2 }}>{m.release_date?.split('-')[0] || ''}</p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {tab === 'images' && (
              <div>
                {images.length === 0 ? (
                  <div style={{ color: '#7a8499', fontSize: 14 }}>No photos available.</div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
                    {images.map((img, i) => (
                      <a key={i} href={`${IMG_BASE}/original${img.file_path}`} target="_blank" rel="noopener noreferrer">
                        <div style={{ borderRadius: 8, overflow: 'hidden', aspectRatio: '2/3' }} className="movie-card">
                          <img src={`${IMG_BASE}/w300${img.file_path}`} alt={`Photo ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .actor-header { flex-direction: column !important; }
          .actor-img-col { display: flex; flex-direction: column; align-items: center; }
        }
      `}</style>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '12px 14px' }}>
      <p style={{ fontSize: 11, color: '#7a8499', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 5 }}>{label}</p>
      <p style={{ fontSize: 13, color: '#edeef2', lineHeight: 1.4 }}>{value}</p>
    </div>
  );
}

function ExternalLink({ href, label }: { href: string; label: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
      background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
      color: '#adb8cc', textDecoration: 'none', transition: 'all 0.2s',
    }}
    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#edeef2'; }}
    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#adb8cc'; }}
    >
      ↗ {label}
    </a>
  );
}

function LoadingState() {
  return (
    <div style={{ minHeight: '100vh', background: '#070a11', paddingTop: 120, padding: '80px 24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', gap: 40 }}>
        <div className="skeleton" style={{ width: 220, height: 330, borderRadius: 16, flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div className="skeleton" style={{ height: 16, width: 80, marginBottom: 16 }} />
          <div className="skeleton" style={{ height: 48, width: '60%', marginBottom: 24 }} />
          <div className="skeleton" style={{ height: 14, width: '90%', marginBottom: 10 }} />
          <div className="skeleton" style={{ height: 14, width: '80%', marginBottom: 10 }} />
          <div className="skeleton" style={{ height: 14, width: '70%' }} />
        </div>
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#070a11' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 60, marginBottom: 16 }}>👤</div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: '#edeef2', marginBottom: 10 }}>Person not found</h1>
        <Link to="/" style={{ color: '#f0b430', textDecoration: 'none' }}>← Back to Home</Link>
      </div>
    </div>
  );
}
