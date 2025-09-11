import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {
  selectGameDetailsStatus,
  selectGameDetails,
  fetchGameDetails
 } from "../../redux/games/gamesSlice";
import { useEffect, useState } from "react";

function GameDetails() {
  const dispatch = useDispatch()
  const { gameId } = useParams()
  const [gameDetails, setGameDetails] = useState([])
  const game = useSelector(selectGameDetails)
  const status = useSelector(selectGameDetailsStatus)
  const navigate = useNavigate()

  useEffect(()=>{
    dispatch(fetchGameDetails(gameId))
  },[dispatch, gameId])

  useEffect(()=>{
    if(status === 'succeeded' ){
      setGameDetails(game)
    }
  },[status, game])

  console.log(gameDetails)
  return (
    <div className="relative w-full h-screen">
      <div
        className="absolute inset-0 bg-cover bg-center filter brightness-50 bg-fixed"
        style={{
        backgroundImage: `url(${gameDetails?.background_image || null})`,
      }}
      />

      <div className="relative z-10 p-8">
        <header
        className="text-center text-pink-400 text-4xl font-mono p-6 cursor-pointer object-contain"
        onClick={() => navigate("/")}
        >
          🎮 Retro Game Room 🎮
        </header>

        {status == "failed" && <div className="text-red-600">Error: {error}</div>}
        {status === 'loading' ?
          <h1 className="loading text-xl flex items-center justify-self-center">Loading
            <span className="dot ml-1">.</span>
            <span className="dot">.</span>
            <span className="dot">.</span>
          </h1> :
          <p className="mt-4 text-lg">{gameDetails?.description_raw}</p>
        }
      </div>
    </div>
  )
}

export default GameDetails
