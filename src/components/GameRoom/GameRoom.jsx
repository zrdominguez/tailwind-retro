import  GameCard  from "../GameCard";
import "./GameRoom.css";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchGames,
  selectAllGames,
  selectGameStatus,
  selectGameError } from "../../redux/games/gamesSlice";

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
  const [listGames, setListGames] = useState([]);
  const dispatch = useDispatch();
  const games = useSelector(selectAllGames);
  const status = useSelector(selectGameStatus);
  const error = useSelector(selectGameError);



  useEffect(() => {
    if(status === 'idle'){
      dispatch(fetchGames());
    }
  }, [status, dispatch])

  useEffect(() => {
    if(status === 'succeeded'){
      setListGames(games)
    }
  }, [status, games])

  if(status === 'succeeded') console.log(games);


  return (
    <div className="crt">
      <header className="text-center text-pink-400 text-4xl font-mono p-6">
      🎮 Retro Game Room 🎮
      </header>
      <div className="grid grid-cols-2 md:grid-rows-3 gap-8 p-6">
        {games.map(game => <GameCard key={game.id} name={game.name} src={game.background_image} />)}
      </div>
    </div>

  )
}

export default GameRoom
