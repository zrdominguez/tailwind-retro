import './GameCard.css'
import { useState } from "react"

const GameCard = ({name="", src = ""}) => {

  console.log(name)
  return (
    <div className="w-200 h-300 rounded bg-gradient-to-br from-[#FF69B4] to-[#FF1493] metallic-hover justify-center max-w-80 max-h-100 p-4">
      <h2 className='text-xl font-semibold mb-2 font-mono'>{name}</h2>
      <div className="img-container flex items-center justify-center">
        <img src= {src} alt='mario-world'/>
      </div>
    </div>
  )
}

export default GameCard
