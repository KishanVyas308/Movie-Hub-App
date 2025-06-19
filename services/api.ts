export const TMDB_CONFIG = {
    BASE_URL: 'https://api.themoviedb.org/3',
    API_KEY:  process.env.EXPO_PUBLIC_MOVIE_API_KEY,
    headers: {
        accept : 'application/json',
        Authorization: `Bearer ${process.env.EXPO_PUBLIC_MOVIE_API_KEY}`
    }
}

export const fetchMovies = async ({ query } : { query: string }) => {
    const endpoint = query 
    ? `${TMDB_CONFIG.BASE_URL}/search/movie?query=${encodeURIComponent(query)}` 
    : `${TMDB_CONFIG.BASE_URL}/discover/movie?sort_by=popularity.desc`;

    const response = await fetch(endpoint, {
        method: 'GET',
        headers: TMDB_CONFIG.headers,
    })

    if (!response.ok) {
        throw new Error(`Error fetching movies: ${response.statusText}`);
    }

    const data = await response.json();

    return data.results;
}

export const fetchMovieDetails = async( movieId: string) : Promise<MovieDetails> => {
    try {
        const response = await fetch(`${TMDB_CONFIG.BASE_URL}/movie/${movieId}?api_key=${TMDB_CONFIG.API_KEY}` ,
            {
                method: 'GET',
                headers: TMDB_CONFIG.headers,
            }
        )

        if (!response.ok) throw new Error(`Error fetching movie details: ${response.statusText}`);
        const data = await response.json();
        return data
    } catch (error) {
        console.log(`Error fetching movie details for ID ${movieId}:`, error);
        throw error
        
    }
}

// Fetch movie cast and crew
export const fetchMovieCredits = async (movieId: string): Promise<MovieCredits> => {
    try {
        const response = await fetch(`${TMDB_CONFIG.BASE_URL}/movie/${movieId}/credits?api_key=${TMDB_CONFIG.API_KEY}`, {
            method: 'GET',
            headers: TMDB_CONFIG.headers,
        });

        if (!response.ok) throw new Error(`Error fetching movie credits: ${response.statusText}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.log(`Error fetching movie credits for ID ${movieId}:`, error);
        throw error;
    }
};

// Fetch movie videos (trailers, teasers, etc.)
export const fetchMovieVideos = async (movieId: string): Promise<MovieVideos> => {
    try {
        const response = await fetch(`${TMDB_CONFIG.BASE_URL}/movie/${movieId}/videos?api_key=${TMDB_CONFIG.API_KEY}`, {
            method: 'GET',
            headers: TMDB_CONFIG.headers,
        });

        if (!response.ok) throw new Error(`Error fetching movie videos: ${response.statusText}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.log(`Error fetching movie videos for ID ${movieId}:`, error);
        throw error;
    }
};

// Fetch similar movies
export const fetchSimilarMovies = async (movieId: string): Promise<Movie[]> => {
    try {
        const response = await fetch(`${TMDB_CONFIG.BASE_URL}/movie/${movieId}/similar?api_key=${TMDB_CONFIG.API_KEY}`, {
            method: 'GET',
            headers: TMDB_CONFIG.headers,
        });

        if (!response.ok) throw new Error(`Error fetching similar movies: ${response.statusText}`);
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.log(`Error fetching similar movies for ID ${movieId}:`, error);
        throw error;
    }
};

// Fetch movie reviews
export const fetchMovieReviews = async (movieId: string): Promise<MovieReviews> => {
    try {
        const response = await fetch(`${TMDB_CONFIG.BASE_URL}/movie/${movieId}/reviews?api_key=${TMDB_CONFIG.API_KEY}`, {
            method: 'GET',
            headers: TMDB_CONFIG.headers,
        });

        if (!response.ok) throw new Error(`Error fetching movie reviews: ${response.statusText}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.log(`Error fetching movie reviews for ID ${movieId}:`, error);
        throw error;
    }
};

// Fetch movie images
export const fetchMovieImages = async (movieId: string): Promise<MovieImages> => {
    try {
        const response = await fetch(`${TMDB_CONFIG.BASE_URL}/movie/${movieId}/images?api_key=${TMDB_CONFIG.API_KEY}`, {
            method: 'GET',
            headers: TMDB_CONFIG.headers,
        });

        if (!response.ok) throw new Error(`Error fetching movie images: ${response.statusText}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.log(`Error fetching movie images for ID ${movieId}:`, error);
        throw error;
    }
};

// Fetch movies by genre
export const fetchMoviesByGenre = async (genreId: number, page: number = 1): Promise<Movie[]> => {
    try {
        const response = await fetch(`${TMDB_CONFIG.BASE_URL}/discover/movie?with_genres=${genreId}&page=${page}&api_key=${TMDB_CONFIG.API_KEY}`, {
            method: 'GET',
            headers: TMDB_CONFIG.headers,
        });

        if (!response.ok) throw new Error(`Error fetching movies by genre: ${response.statusText}`);
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.log(`Error fetching movies by genre ${genreId}:`, error);
        throw error;
    }
};

// Fetch all genres
export const fetchGenres = async (): Promise<Genre[]> => {
    try {
        const response = await fetch(`${TMDB_CONFIG.BASE_URL}/genre/movie/list?api_key=${TMDB_CONFIG.API_KEY}`, {
            method: 'GET',
            headers: TMDB_CONFIG.headers,
        });

        if (!response.ok) throw new Error(`Error fetching genres: ${response.statusText}`);
        const data = await response.json();
        return data.genres;
    } catch (error) {
        console.log('Error fetching genres:', error);
        throw error;
    }
};

// Fetch trending movies
export const fetchTrendingMovies = async (timeWindow: 'day' | 'week' = 'week'): Promise<Movie[]> => {
    try {
        const response = await fetch(`${TMDB_CONFIG.BASE_URL}/trending/movie/${timeWindow}?api_key=${TMDB_CONFIG.API_KEY}`, {
            method: 'GET',
            headers: TMDB_CONFIG.headers,
        });

        if (!response.ok) throw new Error(`Error fetching trending movies: ${response.statusText}`);
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.log('Error fetching trending movies:', error);
        throw error;
    }
};

// Fetch top rated movies
export const fetchTopRatedMovies = async (page: number = 1): Promise<Movie[]> => {
    try {
        const response = await fetch(`${TMDB_CONFIG.BASE_URL}/movie/top_rated?page=${page}&api_key=${TMDB_CONFIG.API_KEY}`, {
            method: 'GET',
            headers: TMDB_CONFIG.headers,
        });

        if (!response.ok) throw new Error(`Error fetching top rated movies: ${response.statusText}`);
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.log('Error fetching top rated movies:', error);
        throw error;
    }
};

// Fetch upcoming movies
export const fetchUpcomingMovies = async (page: number = 1): Promise<Movie[]> => {
    try {
        const response = await fetch(`${TMDB_CONFIG.BASE_URL}/movie/upcoming?page=${page}&api_key=${TMDB_CONFIG.API_KEY}`, {
            method: 'GET',
            headers: TMDB_CONFIG.headers,
        });

        if (!response.ok) throw new Error(`Error fetching upcoming movies: ${response.statusText}`);
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.log('Error fetching upcoming movies:', error);
        throw error;
    }
};

// Fetch now playing movies
export const fetchNowPlayingMovies = async (page: number = 1): Promise<Movie[]> => {
    try {
        const response = await fetch(`${TMDB_CONFIG.BASE_URL}/movie/now_playing?page=${page}&api_key=${TMDB_CONFIG.API_KEY}`, {
            method: 'GET',
            headers: TMDB_CONFIG.headers,
        });

        if (!response.ok) throw new Error(`Error fetching now playing movies: ${response.statusText}`);
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.log('Error fetching now playing movies:', error);
        throw error;
    }
};

// Advanced search with filters
export const fetchMoviesWithFilters = async (filters: MovieFilters): Promise<{
    results: Movie[];
    page: number;
    total_pages: number;
    total_results: number;
}> => {
    try {
        const params = new URLSearchParams();
        
        if (filters.query) params.append('query', filters.query);
        
        // Handle multiple genres
        if (filters.genres && filters.genres.length > 0) {
            params.append('with_genres', filters.genres.join(','));
        } else if (filters.genre) {
            params.append('with_genres', filters.genre.toString());
        }
        
        if (filters.year) params.append('year', filters.year.toString());
        if (filters.sortBy) params.append('sort_by', filters.sortBy);
        if (filters.minRating) params.append('vote_average.gte', filters.minRating.toString());
        if (filters.maxRating) params.append('vote_average.lte', filters.maxRating.toString());
        if (filters.page) params.append('page', filters.page.toString());
        
        params.append('api_key', TMDB_CONFIG.API_KEY || '');

        const endpoint = filters.query 
            ? `${TMDB_CONFIG.BASE_URL}/search/movie`
            : `${TMDB_CONFIG.BASE_URL}/discover/movie`;

        const response = await fetch(`${endpoint}?${params.toString()}`, {
            method: 'GET',
            headers: TMDB_CONFIG.headers,
        });

        if (!response.ok) throw new Error(`Error fetching filtered movies: ${response.statusText}`);
        const data = await response.json();
        return {
            results: data.results,
            page: data.page,
            total_pages: data.total_pages,
            total_results: data.total_results
        };
    } catch (error) {
        console.log('Error fetching filtered movies:', error);
        throw error;
    }
};

// Fetch person details (cast/crew member)
export const fetchPersonDetails = async (personId: string): Promise<PersonDetails> => {
    try {
        const response = await fetch(`${TMDB_CONFIG.BASE_URL}/person/${personId}?api_key=${TMDB_CONFIG.API_KEY}`, {
            method: 'GET',
            headers: TMDB_CONFIG.headers,
        });

        if (!response.ok) throw new Error(`Error fetching person details: ${response.statusText}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.log(`Error fetching person details for ID ${personId}:`, error);
        throw error;
    }
};

// Fetch person movie credits
export const fetchPersonMovieCredits = async (personId: string): Promise<PersonMovieCredits> => {
    try {
        const response = await fetch(`${TMDB_CONFIG.BASE_URL}/person/${personId}/movie_credits?api_key=${TMDB_CONFIG.API_KEY}`, {
            method: 'GET',
            headers: TMDB_CONFIG.headers,
        });

        if (!response.ok) throw new Error(`Error fetching person movie credits: ${response.statusText}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.log(`Error fetching person movie credits for ID ${personId}:`, error);
        throw error;
    }
};

// Fetch person images
export const fetchPersonImages = async (personId: string): Promise<PersonImages> => {
    try {
        const response = await fetch(`${TMDB_CONFIG.BASE_URL}/person/${personId}/images?api_key=${TMDB_CONFIG.API_KEY}`, {
            method: 'GET',
            headers: TMDB_CONFIG.headers,
        });

        if (!response.ok) throw new Error(`Error fetching person images: ${response.statusText}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.log(`Error fetching person images for ID ${personId}:`, error);
        throw error;
    }
};

// Search for people (actors, directors, etc.)
export const searchPeople = async (query: string, page: number = 1): Promise<SearchPeopleResponse> => {
    try {
        const response = await fetch(`${TMDB_CONFIG.BASE_URL}/search/person?query=${encodeURIComponent(query)}&page=${page}&api_key=${TMDB_CONFIG.API_KEY}`, {
            method: 'GET',
            headers: TMDB_CONFIG.headers,
        });

        if (!response.ok) throw new Error(`Error searching people: ${response.statusText}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.log(`Error searching people with query "${query}":`, error);
        throw error;
    }
};

// Multi search (movies, TV shows, people)
export const multiSearch = async (query: string, page: number = 1): Promise<MultiSearchResponse> => {
    try {
        const response = await fetch(`${TMDB_CONFIG.BASE_URL}/search/multi?query=${encodeURIComponent(query)}&page=${page}&api_key=${TMDB_CONFIG.API_KEY}`, {
            method: 'GET',
            headers: TMDB_CONFIG.headers,
        });

        if (!response.ok) throw new Error(`Error in multi search: ${response.statusText}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.log(`Error in multi search with query "${query}":`, error);
        throw error;
    }
};

// Search collections
export const searchCollections = async (query: string, page: number = 1): Promise<SearchCollectionsResponse> => {
    try {
        const response = await fetch(`${TMDB_CONFIG.BASE_URL}/search/collection?query=${encodeURIComponent(query)}&page=${page}&api_key=${TMDB_CONFIG.API_KEY}`, {
            method: 'GET',
            headers: TMDB_CONFIG.headers,
        });

        if (!response.ok) throw new Error(`Error searching collections: ${response.statusText}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.log(`Error searching collections with query "${query}":`, error);
        throw error;
    }
};

// Discover movies with advanced filters
export const discoverMovies = async (filters: DiscoverFilters): Promise<Movie[]> => {
    try {
        const params = new URLSearchParams();
        
        if (filters.with_genres) params.append('with_genres', filters.with_genres.toString());
        if (filters.without_genres) params.append('without_genres', filters.without_genres.toString());
        if (filters.with_cast) params.append('with_cast', filters.with_cast.toString());
        if (filters.with_crew) params.append('with_crew', filters.with_crew.toString());
        if (filters.with_people) params.append('with_people', filters.with_people.toString());
        if (filters.with_companies) params.append('with_companies', filters.with_companies.toString());
        if (filters.with_keywords) params.append('with_keywords', filters.with_keywords.toString());
        if (filters.without_keywords) params.append('without_keywords', filters.without_keywords.toString());
        if (filters.sort_by) params.append('sort_by', filters.sort_by);
        if (filters.certification_country) params.append('certification_country', filters.certification_country);
        if (filters.certification) params.append('certification', filters.certification);
        if (filters.certification_lte) params.append('certification.lte', filters.certification_lte);
        if (filters.certification_gte) params.append('certification.gte', filters.certification_gte);
        if (filters.include_adult !== undefined) params.append('include_adult', filters.include_adult.toString());
        if (filters.include_video !== undefined) params.append('include_video', filters.include_video.toString());
        if (filters.page) params.append('page', filters.page.toString());
        if (filters.primary_release_year) params.append('primary_release_year', filters.primary_release_year.toString());
        if (filters.primary_release_date_gte) params.append('primary_release_date.gte', filters.primary_release_date_gte);
        if (filters.primary_release_date_lte) params.append('primary_release_date.lte', filters.primary_release_date_lte);
        if (filters.release_date_gte) params.append('release_date.gte', filters.release_date_gte);
        if (filters.release_date_lte) params.append('release_date.lte', filters.release_date_lte);
        if (filters.with_release_type) params.append('with_release_type', filters.with_release_type.toString());
        if (filters.year) params.append('year', filters.year.toString());
        if (filters.vote_count_gte) params.append('vote_count.gte', filters.vote_count_gte.toString());
        if (filters.vote_count_lte) params.append('vote_count.lte', filters.vote_count_lte.toString());
        if (filters.vote_average_gte) params.append('vote_average.gte', filters.vote_average_gte.toString());
        if (filters.vote_average_lte) params.append('vote_average.lte', filters.vote_average_lte.toString());
        if (filters.with_runtime_gte) params.append('with_runtime.gte', filters.with_runtime_gte.toString());
        if (filters.with_runtime_lte) params.append('with_runtime.lte', filters.with_runtime_lte.toString());
        if (filters.region) params.append('region', filters.region);
        if (filters.with_original_language) params.append('with_original_language', filters.with_original_language);
        
        params.append('api_key', TMDB_CONFIG.API_KEY || '');

        const response = await fetch(`${TMDB_CONFIG.BASE_URL}/discover/movie?${params.toString()}`, {
            method: 'GET',
            headers: TMDB_CONFIG.headers,
        });

        if (!response.ok) throw new Error(`Error discovering movies: ${response.statusText}`);
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.log('Error discovering movies:', error);
        throw error;
    }
};


