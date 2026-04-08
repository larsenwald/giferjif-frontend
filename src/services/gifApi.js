const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const API_KEY = import.meta.env.VITE_API_KEY || "";

const fallbackGifs = [
  {
    id: "1",
    title: "Funny Cat Reaction",
    imageUrl: "https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif",
    copyUrl: "https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif",
  },
  {
    id: "2",
    title: "Dog Jumping Excited",
    imageUrl: "https://media.giphy.com/media/26BRuo6sLetdllPAQ/giphy.gif",
    copyUrl: "https://media.giphy.com/media/26BRuo6sLetdllPAQ/giphy.gif",
  },
  {
    id: "3",
    title: "Dancing Celebration",
    imageUrl: "https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif",
    copyUrl: "https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif",
  },
  {
    id: "4",
    title: "Confused Expression",
    imageUrl: "https://media.giphy.com/media/3o7TKTDn976rzVgky4/giphy.gif",
    copyUrl: "https://media.giphy.com/media/3o7TKTDn976rzVgky4/giphy.gif",
  },
  {
    id: "5",
    title: "Happy Baby Laughing",
    imageUrl: "https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif",
    copyUrl: "https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif",
  },
  {
    id: "6",
    title: "Thumbs Up Success",
    imageUrl: "https://media.giphy.com/media/111ebonMs90YLu/giphy.gif",
    copyUrl: "https://media.giphy.com/media/111ebonMs90YLu/giphy.gif",
  },
  {
    id: "7",
    title: "Clapping Applause",
    imageUrl: "https://media.giphy.com/media/OkJat1YNdoD3W/giphy.gif",
    copyUrl: "https://media.giphy.com/media/OkJat1YNdoD3W/giphy.gif",
  },
  {
    id: "8",
    title: "Shocked Surprised",
    imageUrl: "https://media.giphy.com/media/5VKbvrjxpVJCM/giphy.gif",
    copyUrl: "https://media.giphy.com/media/5VKbvrjxpVJCM/giphy.gif",
  },
];

function normalizeGif(rawGif, index) {
  return {
    id: rawGif.id ?? String(index),
    title: rawGif.title ?? "Untitled GIF",
    imageUrl:
      rawGif.imageUrl ??
      rawGif.image_url ??
      rawGif.url ??
      rawGif.images?.fixed_height?.url ??
      rawGif.images?.original?.url ??
      "",
    copyUrl:
      rawGif.copyUrl ??
      rawGif.copy_url ??
      rawGif.shareUrl ??
      rawGif.url ??
      rawGif.images?.original?.url ??
      "",
  };
}

function getFallbackResults(query = "") {
  const trimmedQuery = query.trim().toLowerCase();

  if (!trimmedQuery) {
    return fallbackGifs.map(normalizeGif);
  }

  return fallbackGifs
    .filter((gif) => gif.title.toLowerCase().includes(trimmedQuery))
    .map(normalizeGif);
}

export async function searchGifs(query = "") {
  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    return getFallbackResults();
  }

  const headers = API_KEY
    ? {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
      }
    : {
        "Content-Type": "application/json",
      };

  try {
    const response = await fetch(
      `${API_BASE_URL}/gifs/search?q=${encodeURIComponent(trimmedQuery)}`,
      {
        method: "GET",
        headers,
      }
    );

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const data = await response.json();
    const results = Array.isArray(data) ? data : data.results || data.gifs || [];

    return results.map(normalizeGif);
  } catch (error) {
    console.warn("Using fallback GIF data because API search failed.", error);
    return getFallbackResults(trimmedQuery);
  }
}