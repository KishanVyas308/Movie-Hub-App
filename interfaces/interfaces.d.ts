interface Movie {
  id: number;
  title: string;
  adult: boolean;
  backdrop_path: string;
  genre_ids: number[];
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path: string;
  release_date: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
}

interface TrendingMovie {
  searchTerm: string;
  movie_id: number;
  title: string;
  count: number;
  poster_url: string;
}

interface MovieDetails {
  adult: boolean;
  backdrop_path: string | null;
  belongs_to_collection: {
    id: number;
    name: string;
    poster_path: string;
    backdrop_path: string;
  } | null;
  budget: number;
  genres: {
    id: number;
    name: string;
  }[];
  homepage: string | null;
  id: number;
  imdb_id: string | null;
  original_language: string;
  original_title: string;
  overview: string | null;
  popularity: number;
  poster_path: string | null;
  production_companies: {
    id: number;
    logo_path: string | null;
    name: string;
    origin_country: string;
  }[];
  production_countries: {
    iso_3166_1: string;
    name: string;
  }[];
  release_date: string;
  revenue: number;
  runtime: number | null;
  spoken_languages: {
    english_name: string;
    iso_639_1: string;
    name: string;
  }[];
  status: string;
  tagline: string | null;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
}

interface TrendingCardProps {
  movie: TrendingMovie;
  index: number;
}

interface Genre {
  id: number;
  name: string;
}

interface CastMember {
  adult: boolean;
  gender: number;
  id: number;
  known_for_department: string;
  name: string;
  original_name: string;
  popularity: number;
  profile_path: string | null;
  cast_id: number;
  character: string;
  credit_id: string;
  order: number;
}

interface CrewMember {
  adult: boolean;
  gender: number;
  id: number;
  known_for_department: string;
  name: string;
  original_name: string;
  popularity: number;
  profile_path: string | null;
  credit_id: string;
  department: string;
  job: string;
}

interface MovieCredits {
  id: number;
  cast: CastMember[];
  crew: CrewMember[];
}

interface MovieVideo {
  iso_639_1: string;
  iso_3166_1: string;
  name: string;
  key: string;
  site: string;
  size: number;
  type: string;
  official: boolean;
  published_at: string;
  id: string;
}

interface MovieVideos {
  id: number;
  results: MovieVideo[];
}

interface ReviewAuthor {
  name: string;
  username: string;
  avatar_path: string | null;
  rating: number | null;
}

interface MovieReview {
  author: string;
  author_details: ReviewAuthor;
  content: string;
  created_at: string;
  id: string;
  updated_at: string;
  url: string;
}

interface MovieReviews {
  id: number;
  page: number;
  results: MovieReview[];
  total_pages: number;
  total_results: number;
}

interface MovieFilters {
  query?: string;
  genre?: number;
  year?: number;
  sortBy?: string;
  minRating?: number;
  maxRating?: number;
  page?: number;
}

interface WatchlistItem {
  id: number;
  movieId: number;
  title: string;
  poster_path: string;
  vote_average: number;
  release_date: string;
  addedAt: string;
}

interface MovieImage {
  aspect_ratio: number;
  file_path: string;
  height: number;
  iso_639_1: string | null;
  vote_average: number;
  vote_count: number;
  width: number;
}

interface MovieImages {
  id: number;
  backdrops: MovieImage[];
  logos: MovieImage[];
  posters: MovieImage[];
}

interface UserStats {
  totalWatched: number;
  totalWatchlist: number;
  favoriteGenres: { name: string; count: number }[];
  averageRating: number;
}

interface PersonDetails {
  adult: boolean;
  also_known_as: string[];
  biography: string;
  birthday: string | null;
  deathday: string | null;
  gender: number;
  homepage: string | null;
  id: number;
  imdb_id: string | null;
  known_for_department: string;
  name: string;
  place_of_birth: string | null;
  popularity: number;
  profile_path: string | null;
}

interface PersonMovieCredit {
  adult: boolean;
  backdrop_path: string | null;
  genre_ids: number[];
  id: number;
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path: string | null;
  release_date: string;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
  character?: string;
  credit_id: string;
  order?: number;
  department?: string;
  job?: string;
}

interface PersonMovieCredits {
  cast: PersonMovieCredit[];
  crew: PersonMovieCredit[];
  id: number;
}

interface PersonImage {
  aspect_ratio: number;
  file_path: string;
  height: number;
  vote_average: number;
  vote_count: number;
  width: number;
}

interface PersonImages {
  id: number;
  profiles: PersonImage[];
}

interface SearchPerson {
  adult: boolean;
  gender: number;
  id: number;
  known_for: Movie[];
  known_for_department: string;
  name: string;
  popularity: number;
  profile_path: string | null;
}

interface SearchPeopleResponse {
  page: number;
  results: SearchPerson[];
  total_pages: number;
  total_results: number;
}

interface MultiSearchResult {
  adult?: boolean;
  backdrop_path?: string | null;
  genre_ids?: number[];
  id: number;
  media_type: 'movie' | 'tv' | 'person';
  original_language?: string;
  original_title?: string;
  overview?: string;
  popularity: number;
  poster_path?: string | null;
  release_date?: string;
  title?: string;
  video?: boolean;
  vote_average?: number;
  vote_count?: number;
  // Person specific fields
  gender?: number;
  known_for?: Movie[];
  known_for_department?: string;
  name?: string;
  profile_path?: string | null;
  // TV specific fields
  first_air_date?: string;
  origin_country?: string[];
  original_name?: string;
}

interface MultiSearchResponse {
  page: number;
  results: MultiSearchResult[];
  total_pages: number;
  total_results: number;
}

interface SearchCollection {
  adult: boolean;
  backdrop_path: string | null;
  id: number;
  name: string;
  original_language: string;
  original_name: string;
  overview: string;
  poster_path: string | null;
}

interface SearchCollectionsResponse {
  page: number;
  results: SearchCollection[];
  total_pages: number;
  total_results: number;
}

interface DiscoverFilters {
  certification_country?: string;
  certification?: string;
  certification_lte?: string;
  certification_gte?: string;
  include_adult?: boolean;
  include_video?: boolean;
  page?: number;
  primary_release_year?: number;
  primary_release_date_gte?: string;
  primary_release_date_lte?: string;
  region?: string;
  release_date_gte?: string;
  release_date_lte?: string;
  sort_by?: string;
  vote_average_gte?: number;
  vote_average_lte?: number;
  vote_count_gte?: number;
  vote_count_lte?: number;
  watch_region?: string;
  with_cast?: string;
  with_companies?: string;
  with_crew?: string;
  with_genres?: string;
  with_keywords?: string;
  with_original_language?: string;
  with_people?: string;
  with_release_type?: number;
  with_runtime_gte?: number;
  with_runtime_lte?: number;
  without_companies?: string;
  without_genres?: string;
  without_keywords?: string;
  year?: number;
}

