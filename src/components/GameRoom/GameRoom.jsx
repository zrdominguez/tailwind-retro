import  GameCard  from "../GameCard"
import "./GameRoom.css"

const TEST = [
  {
    id: 1,
    title: "Super Mario World",
    imgUrl: "path-to-image1",
  },
  {
    id: 2,
    title: "The Legend of Zelda: A Link to the Past",
    imgUrl: "path-to-image2",
  },
  {
    id: 3,
    title: "Sonic the Hedgehog",
    imgUrl: "path-to-image3",
  },
  {
    id: 4,
    title: "Street Fighter II",
    imgUrl: "path-to-image4",
  },
];


const GameRoom = () => {
  return (
    <div className="crt">
      <header className="text-center text-pink-400 text-4xl font-mono p-6">
      🎮 Retro Game Room 🎮
      </header>
      <div className="grid grid-cols-2 md:grid-rows-3 gap-8 p-6">
        {TEST.map(game => <GameCard key={game.id} title={game.title} src={game.imgUrl} />)}
      </div>
    </div>

  )
}

export default GameRoom
