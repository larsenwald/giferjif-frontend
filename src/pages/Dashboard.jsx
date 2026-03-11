import Header from "../components/Header";
import GifGrid from "../components/GifGrid";

function Dashboard() {

  const sampleGifs = [
    {
      id: 1,
      title: "Funny Cat",
      image: "https://placehold.co/200x150"
    },
    {
      id: 2,
      title: "Happy Reaction",
      image: "https://placehold.co/200x150"
    },
    {
      id: 3,
      title: "Celebration",
      image: "https://placehold.co/200x150"
    }
  ];

  return (
    <div>

      <Header />

      <GifGrid gifs={sampleGifs} />

    </div>
  );
}

export default Dashboard;