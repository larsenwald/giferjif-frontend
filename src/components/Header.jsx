import "../styles/header.css";

import "../styles/header.css";

function Header({ favoritesCount, showFavoritesOnly, onToggleFavorites }) {
  return (
    <header className="header">
      <div className="header__spacer" />

      <h1 className="header__title">
        GIFER<span className="header__title-accent">JIF</span>
      </h1>

      <button
        className={`favorites-button ${
          showFavoritesOnly ? "favorites-button--active" : ""
        }`}
        type="button"
        onClick={onToggleFavorites}
      >
        <span className="favorites-button__icon">♥</span>
        {showFavoritesOnly ? "SHOW ALL" : `FAVORITES (${favoritesCount})`}
      </button>
    </header>
  );
}

export default Header;

