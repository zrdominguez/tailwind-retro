import  GameCard  from "../GameCard";
import "./GameRoom.css";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchGames,
  selectAllGames,
  selectGameStatus,
  selectGameError,
  selectNextPage,
  selectPrevPage,
  fetchGamesByUrl,
 } from "../../redux/games/gamesSlice";

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
  const nextPage = useSelector(selectNextPage);
  const prevPage = useSelector(selectPrevPage);



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

  const handleNext = () => {
    dispatch(fetchGamesByUrl(nextPage));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const handlePrev = () => {
    dispatch(fetchGamesByUrl(prevPage));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if(status === 'succeeded') console.log(games);


  return (
    <div className="crt">
      <header className="text-center text-pink-400 text-4xl font-mono p-6">
      🎮 Retro Game Room 🎮
      </header>
      {status === 'loading' &&
      <h1 className="loading text-xl flex items-center justify-self-center">Loading
        <span className="dot ml-1">.</span>
        <span className="dot">.</span>
        <span className="dot">.</span>
      </h1>}
      <div className="grid grid-cols-3 md:grid-rows-5 gap-10 p-6">
        {games.map(game => <GameCard key={game.id} game={game} />)}
      </div>
      <div className="flex justify-center gap-40">
        { prevPage &&
          <button
          className="prev-btn"
          onClick={handlePrev}
          >Prev</button>
        }
        <button
        className="next-btn"
        onClick={handleNext}
        >Next</button>
      </div>
    </div>

  )
}

export default GameRoom
