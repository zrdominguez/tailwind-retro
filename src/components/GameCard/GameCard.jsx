import './GameCard.css'
import { useState } from "react"

const GameCard = ({title, src = ""}) => {

  return (
    <div className="w-auto h-auto rounded bg-gradient-to-br from-[#FF69B4] to-[#FF1493] metallic-hover justify-center">
      <h2 className='p-4 text-xl font-semibold mb-2 font-mono'>Super Mario World</h2>
      <div className="img-container">
        <img src='https://zechariahdbucket.s3.us-east-2.amazonaws.com/super-mario-world.jpeg' alt='mario-world'/>
      </div>
      <div className='summary'>
        <p></p>
      </div>
    </div>
  )
}

export default GameCard
