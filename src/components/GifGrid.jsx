import GifCard from "./GifCard";
import "../styles/gifGrid.css";

function GifGrid({ gifs, favoriteIds, onFavoriteToggle }) {
  return (
    <section className="gif-grid">
      {gifs.map((gif) => (
        <GifCard
          key={gif.id}
          gif={gif}
          isFavorited={favoriteIds.includes(gif.id)}
          onFavoriteToggle={onFavoriteToggle}
        />
      ))}
    </section>
  );
}

export default GifGrid;