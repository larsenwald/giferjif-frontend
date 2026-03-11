import GifCard from "./GifCard";

function GifGrid({ gifs }) {
  return (
    <div style={{
      display: "flex",
      gap: "20px",
      flexWrap: "wrap",
      padding: "20px"
    }}>

      {gifs.map((gif) => (
        <GifCard
          key={gif.id}
          title={gif.title}
          image={gif.image}
        />
      ))}

    </div>
  );
}

export default GifGrid;