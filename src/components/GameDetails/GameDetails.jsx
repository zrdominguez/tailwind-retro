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
    <div
    className="relative w-full min-h-screen bg-center bg-cover bg-no-repeat bg-fixed"
    style={{ backgroundImage: `url(${gameDetails?.background_image || ''})` }}
    >
      <div className="fixed inset-0 bg-black/75" />

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
          <div>
            <p className="mt-4 text-lg" dangerouslySetInnerHTML={{ __html: gameDetails.description }} />
            <ul>
              {gameDetails.developers && gameDetails.developers.map(dev => <li key={dev.id}>{dev.name}</li>)}
            </ul>
            <ul>
              {gameDetails.genres && gameDetails.genres.map(gen => <li key={gen.id}>{gen.name}</li>)}
            </ul>
            <ul>
              {gameDetails.platforms && gameDetails.platforms.map(plat => <li key={plat.platform.id}>{plat.platform.name}</li>)}
            </ul>
          </div>
        }
      </div>
    </div>
  )
}

export default GameDetails
