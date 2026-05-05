const KLIPY_KEY = '2BALsUj12qaYJLTPeTY0G5aXIs3XpUkKwz5AeUAS9746yeWoKs3Tl6fTOSOcWfIr';
const API_BASE  = `https://api.klipy.com/api/v1/${KLIPY_KEY}`;

function normalizeGif(raw, index) {
  return {
    id:       String(raw.id ?? raw.slug ?? index),
    title:    raw.title ?? 'Untitled GIF',
    imageUrl: raw.file?.sm?.gif?.url ?? raw.file?.md?.gif?.url ?? '',
    copyUrl:  raw.file?.hd?.gif?.url ?? raw.file?.md?.gif?.url ?? '',
  };
}

function dedupeGifs(gifs) {
  const seen = new Set();
  return gifs.filter((gif) => {
    const key = gif.id || gif.copyUrl || gif.imageUrl;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function searchGifs(query = '', offset = 0, limit = 24) {
  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    return { searchId: null, results: [] };
  }

  const page = Math.floor(offset / limit) + 1;

  try {
    const response = await fetch(
      `${API_BASE}/gifs/search?q=${encodeURIComponent(trimmedQuery)}&per_page=${limit}&page=${page}`
    );

    if (!response.ok) throw new Error(`Request failed with status ${response.status}`);

    const data = await response.json();
    const results = data.data?.data ?? [];
    const normalized = results.map(normalizeGif);

    return {
      searchId: null,
      results: dedupeGifs(normalized),
    };
  } catch (error) {
    console.warn('Klipy search failed.', error);
    return { searchId: null, results: [] };
  }
}

export async function getTrendingGifs() {
  try {
    const response = await fetch(`${API_BASE}/gifs/trending?per_page=24`);

    if (!response.ok) throw new Error(`Request failed with status ${response.status}`);

    const data = await response.json();
    const results = data.data?.data ?? [];

    return results.map(normalizeGif);
  } catch (error) {
    console.warn('Klipy trending failed.', error);
    return [];
  }
}

export async function recordGifUsage(gifId, searchId) {
  // Klipy uses a share trigger endpoint per slug, not a usage endpoint.
  // This is a no-op for now since we don't have searchId context from Klipy.
  return;
}