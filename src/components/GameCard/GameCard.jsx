import './GameCard.css'
import { useState } from "react"

const GameCard = ({game}) => {
  const {
    background_image,
    genres,
    name,
    platforms,
    parent_platforms,
    released
  } = game;

  return (
    <div className="w-200 h-300 rounded bg-gradient-to-br from-[#FF69B4] to-[#FF1493] metallic-hover justify-center max-w-80 max-h-100 p-4">
      <h2 className='text-xl font-semibold mb-2 font-mono'>{name}</h2>
      <div className="img-container w-full h-2/3w-full h-2/3 bg-black flex items-center justify-center">
        <img className="max-w-full max-h-full object-contain" src= {background_image} alt={name}/>
      </div>
    </div>
  )
}

export default GameCard
