import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {
  selectGameDetailsStatus,
  selectGameDetails,
  fetchGameDetails,
  selectGameError,
  selectGameTrailers,
  selectGameTrailersStatus,
  selectGameScreenshots,
  selectGameScreenshotsStatus,
  fetchGameTrailers,
  fetchGameScreenshots
 } from "../../redux/games/gamesSlice";
import { useEffect, useState } from "react";

function GameDetails() {
  const dispatch = useDispatch();
  const { gameId } = useParams();
  const [gameDetails, setGameDetails] = useState([]);
  const [allTrailers, setAllTrailers] = useState([]);
  const [allScreenshots, setAllScreenshots] = useState([]);
  const game = useSelector(selectGameDetails);
  const error = useSelector(selectGameError);
  const status = useSelector(selectGameDetailsStatus);
  const trailers = useSelector(selectGameTrailers);
  const trailersStatus = useSelector(selectGameTrailersStatus);
  const screenshots = useSelector(selectGameScreenshots);
  const screenshotsStatus = useSelector(selectGameScreenshotsStatus)
  const navigate = useNavigate()

  useEffect(()=>{
    dispatch(fetchGameDetails(gameId))
    dispatch(fetchGameTrailers(gameId))
    dispatch(fetchGameScreenshots(gameId))
  },[dispatch, gameId])

  useEffect(()=>{
    if(status === 'succeeded' ){
      setGameDetails(game)
    }
  },[status, game])

  useEffect(()=>{
    if(trailersStatus === 'succeeded'){
      setAllTrailers(trailers)
    }
  },[trailersStatus, trailers])

  useEffect(() => {
    if(screenshotsStatus === 'succeeded'){
      setAllScreenshots(screenshots)
    }
  },[screenshotsStatus, screenshots])

  console.log(trailers, screenshots)

  return (
    <div
    className="relative w-full min-h-screen bg-center bg-cover bg-no-repeat bg-fixed"
    style={{ backgroundImage: `url(${status === 'succeeded' ? gameDetails?.background_image : ''})` }}
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
          <div className="flex">
            <div className='bg-black flex-1'>
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
            <div className="bg-red-800 flex-1 text-[5vw]">
              <p className="mt-4 text-lg" dangerouslySetInnerHTML={{ __html: gameDetails.description }} />
            </div>
          </div>
        }
      </div>
    </div>
  )
}

export default GameDetails
