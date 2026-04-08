const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const API_KEY = import.meta.env.VITE_API_KEY || "";

const fallbackGifs = [
  {
    id: "1",
    title: "Funny Cat Reaction",
    imageUrl: "https://media.giphy.com/media/mlvseq9yvZhba/giphy.gif",
    copyUrl: "https://media.giphy.com/media/mlvseq9yvZhba/giphy.gif",
  },
  {
    id: "2",
    title: "Dog Jumping Excited",
    imageUrl: "https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif",
    copyUrl: "https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif",
  },
  {
    id: "3",
    title: "Dancing Celebration",
    imageUrl: "https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif",
    copyUrl: "https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif",
  },
  {
    id: "4",
    title: "Confused Expression",
    imageUrl: "https://media.giphy.com/media/3o7aCTfyhYawdOXcFW/giphy.gif",
    copyUrl: "https://media.giphy.com/media/3o7aCTfyhYawdOXcFW/giphy.gif",
  },
  {
    id: "5",
    title: "Happy Baby Laughing",
    imageUrl: "https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif",
    copyUrl: "https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif",
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
    imageUrl: "https://media.giphy.com/media/13G7hmmFr9yuxG/giphy.gif",
    copyUrl: "https://media.giphy.com/media/13G7hmmFr9yuxG/giphy.gif",
  },
  {
    id: "8",
    title: "Shocked Surprised",
    imageUrl: "https://media.giphy.com/media/xT0xeJpnrWC4XWblEk/giphy.gif",
    copyUrl: "https://media.giphy.com/media/xT0xeJpnrWC4XWblEk/giphy.gif",
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

export async function searchGifs(query = "") {
  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    return fallbackGifs;
  }

  try {
    const headers = API_KEY
      ? {
          "Content-Type": "application/json",
          "x-api-key": API_KEY,
        }
      : {
          "Content-Type": "application/json",
        };

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
    console.error("GIF search failed. Falling back to placeholder data.", error);

    return fallbackGifs.filter((gif) =>
      gif.title.toLowerCase().includes(trimmedQuery.toLowerCase())
    );
  }
}