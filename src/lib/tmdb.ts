import type {
  Movie, Person, Genre, Collection, Credits, Video, Review,
  WatchProviderResult, MovieImage, PersonCredits, PaginatedResponse,
  MultiSearchResult, DiscoverFilters, Company
} from './types';

export const IMG_BASE = 'https://image.tmdb.org/t/p';
export const POSTER = (path: string | null, size = 'w500') =>
  path ? `${IMG_BASE}/${size}${path}` : null;
export const BACKDROP = (path: string | null, size = 'w1280') =>
  path ? `${IMG_BASE}/${size}${path}` : null;
export const PROFILE = (path: string | null, size = 'w185') =>
  path ? `${IMG_BASE}/${size}${path}` : null;

let apiKey = '';

export function setApiKey(key: string) { apiKey = key; }
export function getApiKey() { return apiKey; }
export function hasApiKey() { return !!apiKey; }

async function get<T>(endpoint: string, params: Record<string, string | number | boolean> = {}): Promise<T> {
  const url = new URL(`https://api.themoviedb.org/3${endpoint}`);
  url.searchParams.set('api_key', apiKey);
  url.searchParams.set('language', 'en-US');
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== '' && v !== null) url.searchParams.set(k, String(v));
  }
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`TMDB API error: ${res.status}`);
  return res.json();
}

// ── Trending ──────────────────────────────────────────────────────────────────
export const getTrending = (mediaType: 'movie' | 'person' = 'movie', timeWindow: 'day' | 'week' = 'week') =>
  get<PaginatedResponse<Movie>>(`/trending/${mediaType}/${timeWindow}`);

// ── Movies ────────────────────────────────────────────────────────────────────
export const getPopular = (page = 1) => get<PaginatedResponse<Movie>>('/movie/popular', { page });
export const getTopRated = (page = 1) => get<PaginatedResponse<Movie>>('/movie/top_rated', { page });
export const getNowPlaying = (page = 1) => get<PaginatedResponse<Movie>>('/movie/now_playing', { page });
export const getUpcoming = (page = 1) => get<PaginatedResponse<Movie>>('/movie/upcoming', { page });

export const getMovieDetails = (id: number) =>
  get<Movie>(`/movie/${id}`, { append_to_response: 'keywords,videos,images,credits,reviews,similar,recommendations,watch/providers,external_ids' });

export const getMovieCredits = (id: number) => get<Credits>(`/movie/${id}/credits`);
export const getMovieVideos = (id: number) => get<{ results: Video[] }>(`/movie/${id}/videos`);
export const getMovieImages = (id: number) => get<{ backdrops: MovieImage[]; posters: MovieImage[] }>(`/movie/${id}/images`, { include_image_language: 'en,null' });
export const getMovieReviews = (id: number, page = 1) => get<PaginatedResponse<Review>>(`/movie/${id}/reviews`, { page });
export const getSimilar = (id: number, page = 1) => get<PaginatedResponse<Movie>>(`/movie/${id}/similar`, { page });
export const getRecommendations = (id: number, page = 1) => get<PaginatedResponse<Movie>>(`/movie/${id}/recommendations`, { page });
export const getWatchProviders = (id: number) => get<{ results: Record<string, WatchProviderResult> }>(`/movie/${id}/watch/providers`);

// ── Discover ──────────────────────────────────────────────────────────────────
export function discoverMovies(filters: DiscoverFilters) {
  const params: Record<string, string | number | boolean> = {
    page: filters.page || 1,
    sort_by: filters.sortBy || 'popularity.desc',
  };
  if (filters.genre) params['with_genres'] = filters.genre;
  if (filters.minRating) params['vote_average.gte'] = filters.minRating;
  if (filters.maxRating) params['vote_average.lte'] = filters.maxRating;
  if (filters.year) params['primary_release_year'] = filters.year;
  if (filters.minYear) params['primary_release_date.gte'] = `${filters.minYear}-01-01`;
  if (filters.maxYear) params['primary_release_date.lte'] = `${filters.maxYear}-12-31`;
  if (filters.minRuntime) params['with_runtime.gte'] = filters.minRuntime;
  if (filters.maxRuntime) params['with_runtime.lte'] = filters.maxRuntime;
  if (filters.withCompany) params['with_companies'] = filters.withCompany;
  if (filters.withCast) params['with_cast'] = filters.withCast;
  if (filters.withCrew) params['with_crew'] = filters.withCrew;
  return get<PaginatedResponse<Movie>>('/discover/movie', params);
}

// ── Search ────────────────────────────────────────────────────────────────────
export const searchMovies = (query: string, page = 1) => get<PaginatedResponse<Movie>>('/search/movie', { query, page });
export const searchPeople = (query: string, page = 1) => get<PaginatedResponse<Person>>('/search/person', { query, page });
export const searchMulti = (query: string, page = 1) => get<PaginatedResponse<MultiSearchResult>>('/search/multi', { query, page });
export const searchCollections = (query: string, page = 1) => get<PaginatedResponse<Collection>>('/search/collection', { query, page });
export const searchCompanies = (query: string, page = 1) => get<PaginatedResponse<Company>>('/search/company', { query, page });

// ── People ────────────────────────────────────────────────────────────────────
export const getPersonDetails = (id: number) =>
  get<Person>(`/person/${id}`, { append_to_response: 'movie_credits,images,external_ids' });
export const getPersonCredits = (id: number) => get<PersonCredits>(`/person/${id}/movie_credits`);
export const getPersonImages = (id: number) => get<{ profiles: MovieImage[] }>(`/person/${id}/images`);
export const getTrendingPeople = () => get<PaginatedResponse<Person>>('/trending/person/week');

// ── Genres ────────────────────────────────────────────────────────────────────
export const getGenres = () => get<{ genres: Genre[] }>('/genre/movie/list');

// ── Collections ───────────────────────────────────────────────────────────────
export const getCollection = (id: number) => get<Collection>(`/collection/${id}`);
