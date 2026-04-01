import React, { useState, useEffect, useRef } from "react";

export default function SpotlightModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const modalRef = useRef();

  // Fake GIF data (no API)
  const fakeGifs = [
    { id: 1, url: "https://via.placeholder.com/150?text=GIF+1" },
    { id: 2, url: "https://via.placeholder.com/150?text=GIF+2" },
    { id: 3, url: "https://via.placeholder.com/150?text=GIF+3" },
    { id: 4, url: "https://via.placeholder.com/150?text=GIF+4" },
    { id: 5, url: "https://via.placeholder.com/150?text=GIF+5" },
    { id: 6, url: "https://via.placeholder.com/150?text=GIF+6" },
  ];

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Open/close modal
      if (e.ctrlKey && e.shiftKey && e.key === "G") {
        setIsOpen((prev) => !prev);
      }

      // Close with ESC
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.3)",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        paddingTop: "100px",
        zIndex: 1000,
      }}
    >
      <div
        ref={modalRef}
        style={{
          width: "500px",
          background: "#fff",
          border: "4px solid black",
          boxShadow: "6px 6px black",
          padding: "20px",
        }}
      >
        {/* Search Input */}
        <input
          type="text"
          placeholder="Search GIFs..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
          style={{
            width: "100%",
            padding: "10px",
            fontSize: "16px",
            border: "2px solid black",
            marginBottom: "15px",
          }}
        />

        {/* Fake Results */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "10px",
          }}
        >
          {fakeGifs
            .filter((gif) =>
              gif.url.toLowerCase().includes(query.toLowerCase())
            )
            .map((gif) => (
              <div
                key={gif.id}
                style={{
                  border: "2px solid black",
                  cursor: "pointer",
                }}
                onClick={() => {
                  navigator.clipboard.writeText(gif.url);
                  alert("Copied!");
                }}
              >
                <img
                  src={gif.url}
                  alt="gif"
                  style={{ width: "100%", display: "block" }}
                />
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}