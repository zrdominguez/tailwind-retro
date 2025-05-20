import  GameCard  from "../GameCard";
import Pages from "../Pages";
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
  selectCurrentPage,
  selectPageHistory
 } from "../../redux/games/gamesSlice";


const GameRoom = () => {
  const [gameList, setGameList] = useState([]);
  const dispatch = useDispatch();
  const games = useSelector(selectAllGames);
  const status = useSelector(selectGameStatus);
  const error = useSelector(selectGameError);
  const nextPage = useSelector(selectNextPage);
  const prevPage = useSelector(selectPrevPage);
  const currentPage = useSelector(selectCurrentPage);
  const pageHistory = useSelector(selectPageHistory);

  useEffect(() => {
    if(status === 'idle'){
      dispatch(fetchGames());
    }
  }, [status, dispatch])

  useEffect(() => {
    if(status === 'succeeded'){
      setGameList(games)
    }
  }, [status, games])

  const handleNext = () => {
    dispatch(fetchGames({page: currentPage + 1, url: nextPage}));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const handlePrev = () => {
    dispatch(fetchGames({page: currentPage - 1, url: prevPage}));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }



  if(status === 'succeeded') console.log(games);


  return (
    <div className="crt">
      <header className="text-center text-pink-400 text-4xl font-mono p-6">
      🎮 Retro Game Room 🎮
      </header>
      {status == "failed" && <div className="text-red-600">Error: {error}</div>}
      {status === 'loading' ?
      <h1 className="loading text-xl flex items-center justify-self-center">Loading
        <span className="dot ml-1">.</span>
        <span className="dot">.</span>
        <span className="dot">.</span>
      </h1> :
      <>
        <div className="grid grid-cols-3 md:grid-rows-5 gap-10 p-6">
          {gameList.map(game => <GameCard key={game.id} game={game} />)}
        </div>
        <div className="flex justify-center gap-40">
          <button
            className="
              prev-btn
              disabled:!shadow-none
              disabled:opacity-50
              disabled:!cursor-not-allowed"
            disabled={!prevPage}
            onClick={handlePrev}
          >Prev
          </button>
          <Pages
            currentPage={currentPage}
            dispatch={dispatch}
            fetchGames={fetchGames}
            pageHistory={pageHistory}
          />
          <button
            className="next-btn"
            onClick={handleNext}
          >Next
          </button>
        </div>
      </>
      }

    </div>

  )
}

export default GameRoom
