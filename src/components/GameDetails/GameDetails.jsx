import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  selectGameDetailsStatus,
  selectGameDetails,
  fetchGameDetails
 } from "../../redux/games/gamesSlice";
import { useEffect, useState } from "react";

function GameDetails() {
  const dispatch = useDispatch();
  const { gameId } = useParams()
  const [gameDetails, setGameDetails] = useState([])
  const game = useSelector(selectGameDetails)
  const status = useSelector(selectGameDetailsStatus)

  useEffect(()=>{
    dispatch(fetchGameDetails(gameId))
  },[dispatch, gameId])

  useEffect(()=>{
    if(status === 'succeeded' ){
      setGameDetails(game)
    }
  },[status, game])

  console.log(gameDetails, gameId)
  return (
    <div>

    </div>
  )
}

export default GameDetails
