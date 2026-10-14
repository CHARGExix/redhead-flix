import axios from 'axios';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY || '';
const API_BASE = import.meta.env.VITE_TMDB_API_BASE_URL || (TMDB_API_KEY ? 'https://api.themoviedb.org/3' : '/api/tmdb');
const tmdbGet = (url) => axios.get(url, TMDB_API_KEY ? { params: { api_key: TMDB_API_KEY } } : undefined);
export const IMG_URL_500 = 'https://image.tmdb.org/t/p/w500';
export const IMG_URL_300 = 'https://image.tmdb.org/t/p/w300';
export const IMG_URL_ORIGINAL = 'https://image.tmdb.org/t/p/original';

export const LANGUAGES = {
  all: { name: 'All Movies', query: '', with_original_language: '' },
  hindi: { name: 'Hindi Movies', query: 'hindi', with_original_language: 'hi' },
  english: { name: 'English Movies', query: 'english', with_original_language: 'en' },
  bengali: { name: 'Bengali Movies', query: 'bengali', with_original_language: 'bn' },
  japanese: { name: 'Japanese Movies', query: 'japanese', with_original_language: 'ja' },
  korean: { name: 'Korean Movies', query: 'korean', with_original_language: 'ko' },
  chinese: { name: 'Chinese Movies', query: 'chinese', with_original_language: 'zh' },
};

export const fetchMoviesByLanguage = async (langKey) => {
  try {
    const lang = LANGUAGES[langKey];
    const params = new URLSearchParams({ sort_by: 'popularity.desc', page: '1' });
    if (lang?.with_original_language) params.set('with_original_language', lang.with_original_language);
    const url = `${API_BASE}/discover/movie?${params}`;
    const res = await tmdbGet(url);
    return res.data.results || [];
  } catch (err) {
    console.error('Error fetching movies by language:', err);
    return [];
  }
};

export const fetchGenres = async (type) => {
  try {
    const res = await tmdbGet(`${API_BASE}/genre/${type}/list`);
    return res.data.genres || [];
  } catch (err) {
    console.error('Error fetching genres:', err);
    return [];
  }
};

export const fetchTrending = async (type) => {
  try {
    const year = new Date().getFullYear();
    let url = '';
    if (type === 'movie') {
      url = `${API_BASE}/discover/movie?sort_by=popularity.desc&primary_release_year=${year}&with_original_language=en&page=1`;
    } else {
      url = `${API_BASE}/discover/tv?sort_by=popularity.desc&page=1`;
    }
    const res = await tmdbGet(url);
    return res.data.results || [];
  } catch (err) {
    console.error('Error fetching trending:', err);
    return [];
  }
};

export const fetchBrowse = async (type, page, sort, langKey, filters, searchQuery) => {
  let url = '';
  const lang = LANGUAGES[langKey];
  const hasFilters = filters.genres.length > 0
    || filters.yearFrom != null
    || filters.yearTo != null
    || filters.ratingFrom != null
    || filters.ratingTo != null;

  if (searchQuery) {
    url = `${API_BASE}/search/multi?query=${encodeURIComponent(searchQuery)}&page=${page}&include_adult=false`;
  } else if (hasFilters) {
    url = `${API_BASE}/discover/${type}?page=${page}&sort_by=popularity.desc`;
    if (filters.genres.length > 0) url += `&with_genres=${filters.genres.join(',')}`;
    const dateField = type === 'movie' ? 'primary_release_date' : 'first_air_date';
    if (filters.yearFrom != null) url += `&${dateField}.gte=${filters.yearFrom}-01-01`;
    if (filters.yearTo != null) url += `&${dateField}.lte=${filters.yearTo}-12-31`;
    if (filters.ratingFrom != null) url += `&vote_average.gte=${filters.ratingFrom}`;
    if (filters.ratingTo != null) url += `&vote_average.lte=${filters.ratingTo}`;
    if (langKey !== 'all' && lang.with_original_language) {
      url += `&with_original_language=${lang.with_original_language}`;
    }
  } else if (type === 'movie') {
    url = `${API_BASE}/discover/movie?page=${page}&sort_by=popularity.desc`;
    if (langKey !== 'all' && lang.with_original_language) {
      url += `&with_original_language=${lang.with_original_language}`;
    }
  } else if (sort === 'new') {
    url = `${API_BASE}/discover/tv?page=${page}&sort_by=popularity.desc`;
  } else {
    url = `${API_BASE}/tv/top_rated?page=${page}`;
  }

  const res = await tmdbGet(url);
  const data = res.data;
  let results = data.results || [];

  if (searchQuery) {
    results = results.filter(item => (item.media_type === 'movie' || item.media_type === 'tv') && item.poster_path);
  }

  return { results, totalPages: data.total_pages || 1 };
};

export const fetchDetails = async (id, type) => {
  const res = await tmdbGet(
    `${API_BASE}/${type}/${id}?append_to_response=credits,videos,similar,external_ids`
  );
  return res.data;
};

export const fetchByCategory = async (type, category) => {
  let url = '';
  switch (category) {
    case 'trending':
      url = `${API_BASE}/trending/${type}/week`;
      break;
    case 'new':
      url = `${API_BASE}/discover/${type}?sort_by=primary_release_date.desc&vote_count.gte=100`;
      break;
    case 'top':
      url = `${API_BASE}/${type}/top_rated`;
      break;
    case 'action':
      url = `${API_BASE}/discover/${type}?with_genres=${type === 'movie' ? 28 : 10759}&sort_by=popularity.desc`;
      break;
    case 'popular_tv':
      url = `${API_BASE}/tv/popular`;
      break;
    default:
      url = `${API_BASE}/trending/${type}/week`;
  }
  const res = await tmdbGet(url);
  return res.data.results || [];
};

export const fetchActorMovies = async (actorId) => {
  try {
    const res = await tmdbGet(`${API_BASE}/person/${actorId}/movie_credits`);
    return (res.data.cast || [])
      .filter(m => m.poster_path)
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, 16);
  } catch (err) {
    console.error('Error fetching actor movies:', err);
    return [];
  }
};

export const fetchSearchSuggestions = async (query) => {
  try {
    const url = `${API_BASE}/search/multi?query=${encodeURIComponent(query)}&page=1&include_adult=false`;
    const res = await tmdbGet(url);
    return res.data.results || [];
  } catch (err) {
    console.error('Error fetching search suggestions:', err);
    return [];
  }
};
