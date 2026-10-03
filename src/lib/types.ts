export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids?: number[];
  genres?: Genre[];
  runtime?: number;
  tagline?: string;
  status?: string;
  budget?: number;
  revenue?: number;
  popularity?: number;
  original_language?: string;
  production_companies?: Company[];
  production_countries?: { iso_3166_1: string; name: string }[];
  keywords?: { keywords: Keyword[] };
  belongs_to_collection?: Collection | null;
  adult?: boolean;
  video?: boolean;
}

export interface Person {
  id: number;
  name: string;
  profile_path: string | null;
  known_for_department?: string;
  known_for?: Movie[];
  biography?: string;
  birthday?: string;
  deathday?: string | null;
  place_of_birth?: string;
  popularity?: number;
  also_known_as?: string[];
  homepage?: string | null;
  imdb_id?: string;
  external_ids?: ExternalIds;
}

export interface Genre {
  id: number;
  name: string;
}

export interface Company {
  id: number;
  name: string;
  logo_path?: string | null;
  origin_country?: string;
}

export interface Keyword {
  id: number;
  name: string;
}

export interface Collection {
  id: number;
  name: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview?: string;
  parts?: Movie[];
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
  credit_id: string;
}

export interface CrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
  credit_id: string;
}

export interface Credits {
  cast: CastMember[];
  crew: CrewMember[];
}

export interface Video {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
  published_at: string;
}

export interface Review {
  id: string;
  author: string;
  author_details: {
    name: string;
    username: string;
    avatar_path: string | null;
    rating: number | null;
  };
  content: string;
  created_at: string;
  updated_at: string;
  url: string;
}

export interface WatchProvider {
  logo_path: string;
  provider_id: number;
  provider_name: string;
  display_priority: number;
}

export interface WatchProviderResult {
  link: string;
  flatrate?: WatchProvider[];
  rent?: WatchProvider[];
  buy?: WatchProvider[];
}

export interface MovieImage {
  aspect_ratio: number;
  file_path: string;
  height: number;
  width: number;
  vote_average: number;
}

export interface ExternalIds {
  imdb_id?: string;
  facebook_id?: string;
  instagram_id?: string;
  twitter_id?: string;
}

export interface PersonCredits {
  cast: (Movie & { character: string; credit_id: string })[];
  crew: (Movie & { job: string; department: string; credit_id: string })[];
}

export interface PaginatedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface MultiSearchResult {
  id: number;
  media_type: 'movie' | 'tv' | 'person';
  title?: string;
  name?: string;
  poster_path?: string | null;
  profile_path?: string | null;
  backdrop_path?: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  overview?: string;
  known_for_department?: string;
}

export interface DiscoverFilters {
  genre?: number;
  sortBy?: string;
  minRating?: number;
  maxRating?: number;
  year?: number;
  minYear?: number;
  maxYear?: number;
  minRuntime?: number;
  maxRuntime?: number;
  withCompany?: number;
  withCast?: string;
  withCrew?: string;
  page?: number;
}

export interface FavoriteItem {
  id: number;
  type: 'movie';
  title: string;
  poster_path: string | null;
  vote_average: number;
  release_date: string;
  addedAt: string;
}

export interface WatchlistItem extends FavoriteItem {
  watched?: boolean;
}

export interface RatedItem extends FavoriteItem {
  userRating: number;
}
