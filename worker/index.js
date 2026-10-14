const TMDB_ORIGIN = 'https://api.themoviedb.org';
const PREFIX = '/api/tmdb';

const ALLOWED_QUERY_PARAMS = new Set([
  'append_to_response',
  'first_air_date.gte',
  'first_air_date.lte',
  'include_adult',
  'page',
  'primary_release_date.gte',
  'primary_release_date.lte',
  'primary_release_year',
  'query',
  'sort_by',
  'vote_average.gte',
  'vote_average.lte',
  'vote_count.gte',
  'with_genres',
  'with_original_language',
]);

function allowedEndpoint(path) {
  return /^discover\/(movie|tv)$/.test(path)
    || /^genre\/(movie|tv)\/list$/.test(path)
    || /^search\/multi$/.test(path)
    || /^trending\/(movie|tv)\/week$/.test(path)
    || /^(movie|tv)\/(top_rated|popular)$/.test(path)
    || /^(movie|tv)\/\d+$/.test(path)
    || /^person\/\d+\/movie_credits$/.test(path);
}

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Accept',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
}

export default {
  async fetch(request, env) {
    const requestUrl = new URL(request.url);
    const origin = request.headers.get('Origin');
    const allowedOrigins = (env.ALLOWED_ORIGINS || '').split(',').map((value) => value.trim()).filter(Boolean);

    if (!origin || !allowedOrigins.includes(origin)) {
      return new Response('Origin not allowed', { status: 403 });
    }

    const headers = corsHeaders(origin);
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers });
    }
    if (request.method !== 'GET') {
      return new Response('Method not allowed', { status: 405, headers });
    }
    if (!env.TMDB_API_KEY) {
      return new Response('TMDB_API_KEY is not configured', { status: 503, headers });
    }

    const path = requestUrl.pathname.slice(PREFIX.length).replace(/^\/+|\/+$/g, '');
    if (!allowedEndpoint(path)) {
      return new Response('TMDB endpoint not allowed', { status: 404, headers });
    }

    const upstreamUrl = new URL(`/3/${path}`, TMDB_ORIGIN);
    for (const [key, value] of requestUrl.searchParams) {
      if (!ALLOWED_QUERY_PARAMS.has(key)) {
        return new Response(`Query parameter not allowed: ${key}`, { status: 400, headers });
      }
      upstreamUrl.searchParams.set(key, value);
    }
    upstreamUrl.searchParams.set('api_key', env.TMDB_API_KEY);

    try {
      const upstream = await fetch(upstreamUrl, { headers: { Accept: 'application/json' } });
      const responseHeaders = new Headers(headers);
      responseHeaders.set('Content-Type', upstream.headers.get('Content-Type') || 'application/json');
      responseHeaders.set('Cache-Control', 'public, max-age=60');
      return new Response(upstream.body, { status: upstream.status, headers: responseHeaders });
    } catch {
      return new Response('TMDB is temporarily unavailable', { status: 502, headers });
    }
  },
};
