import { Link } from 'react-router-dom';
import type { Person } from '../lib/types';
import { PROFILE } from '../lib/tmdb';

interface Props {
  person: Person;
  size?: number;
}

export default function PersonCard({ person, size = 130 }: Props) {
  const img = PROFILE(person.profile_path, 'w185');

  return (
    <Link
      to={`/person/${person.id}`}
      style={{ width: size, flexShrink: 0, display: 'block', textDecoration: 'none', textAlign: 'center' }}
      className="movie-card"
    >
      <div style={{
        width: size, height: size,
        borderRadius: '50%', overflow: 'hidden',
        background: '#141b24',
        border: '2px solid rgba(255,255,255,0.08)',
        margin: '0 auto',
      }}>
        {img ? (
          <img src={img} alt={person.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3a4558' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
            </svg>
          </div>
        )}
      </div>
      <p style={{ fontSize: 12, fontWeight: 600, color: '#d8dbe4', marginTop: 8, lineHeight: 1.3 }} className="line-clamp-2">
        {person.name}
      </p>
      {person.known_for_department && (
        <p style={{ fontSize: 11, color: '#7a8499', marginTop: 2 }}>{person.known_for_department}</p>
      )}
    </Link>
  );
}
