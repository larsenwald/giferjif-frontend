function GifCard({ title, image }) {
  return (
    <div style={{border: "1px solid black", padding: "10px", width: "200px"}}>

      <img
        src={image}
        alt={title}
        style={{width: "100%"}}
      />

      <h4>{title}</h4>

      <div style={{display: "flex", gap: "10px"}}>
        <button>Copy</button>
        <button>❤</button>
      </div>

    </div>
  );
}

export default GifCard;