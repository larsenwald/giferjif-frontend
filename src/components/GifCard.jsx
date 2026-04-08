import { useEffect, useRef, useState } from "react";
import "../styles/gifCard.css";

function GifCard({ gif, isFavorited, onFavoriteToggle }) {
  const [copied, setCopied] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);

    timeoutRef.current = window.setTimeout(() => {
      setImageError(true);
    }, 5000);

    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [gif.imageUrl]);

  async function handleCopyClick() {
    const textToCopy = gif.copyUrl || gif.imageUrl || gif.title;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1400);
    } catch (error) {
      console.error("Failed to copy GIF link.", error);
    }
  }

  function handleImageLoad() {
    setImageLoaded(true);
    setImageError(false);

    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }
  }

  function handleImageError() {
    setImageError(true);
    setImageLoaded(false);

    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }
  }

  return (
    <article className="gif-card">
      <div className="gif-card__media">
        {!imageError && gif.imageUrl ? (
          <>
            {!imageLoaded && (
              <div className="gif-card__placeholder" aria-hidden="true">
                <span className="gif-card__placeholder-text">LOADING...</span>
              </div>
            )}

            <img
              className={`gif-card__image ${
                imageLoaded ? "gif-card__image--visible" : ""
              }`}
              src={gif.imageUrl}
              alt={gif.title}
              loading="lazy"
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          </>
        ) : (
          <div
            className="gif-card__placeholder"
            aria-label={`${gif.title} preview unavailable`}
          >
            <span className="gif-card__placeholder-text">NO PREVIEW</span>
          </div>
        )}
      </div>

      <div className="gif-card__content">
        <h3 className="gif-card__title">{gif.title}</h3>

        <div className="gif-card__actions">
          <button
            className={`gif-card__copy-button ${
              copied ? "gif-card__copy-button--copied" : ""
            }`}
            type="button"
            onClick={handleCopyClick}
            aria-label={`Copy ${gif.title}`}
          >
            {copied ? "COPIED!" : "COPY LINK"}
          </button>

          <button
            className={`gif-card__favorite-button ${
              isFavorited ? "gif-card__favorite-button--active" : ""
            }`}
            type="button"
            onClick={() => onFavoriteToggle(gif.id)}
            aria-label={
              isFavorited
                ? `Remove ${gif.title} from favorites`
                : `Add ${gif.title} to favorites`
            }
          >
            {isFavorited ? "♥" : "♡"}
          </button>
        </div>
      </div>
    </article>
  );
}

export default GifCard;