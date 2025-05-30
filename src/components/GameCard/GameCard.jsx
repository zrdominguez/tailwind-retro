import './GameCard.css'
import { useState } from "react";
import { SiNintendo } from "react-icons/si";
import {
  FaPlaystation,
  FaXbox,
  FaWindows,
  FaAndroid,
  FaApple
} from 'react-icons/fa';

const platformIcons = {
  playstation: <FaPlaystation className="text-white w-6 h-6" />,
  xbox: <FaXbox className="text-green-400 w-6 h-6 "/>,
  pc: <FaWindows className="text-blue-300 w-6 h-6" />,
  nintendo: <SiNintendo className="text-red-500 h-full w-full" />,
  ios: <FaApple className="text-gray-300 w-full h-full"/>,
  android: <FaAndroid className="text-green-500 w-full h-full" />,
  sega: <img src='https://cdn.worldvectorlogo.com/logos/sega-logo.svg' className='w-full h-full'/>
};


const GameCard = ({game}) => {
  const {
    background_image,
    genres,
    name,
    parent_platforms,
    released
  } = game;

  return (
     <div className="w-72 rounded-2xl shadow-lg bg-gradient-to-br from-[#FF69B4] to-[#FF1493] metallic-hover overflow-hidden font-mono text-white">
      <div className="w-full h-40 bg-black flex items-center justify-center">
        <img
          className="object-contain w-full h-full"
          src={background_image}
          alt={name}
        />
      </div>

      <div className="p-4 space-y-2">
        <h2 className="text-xl font-bold">{name}</h2>

        <div className="flex flex-wrap justify-left gap-3 items-center">

          {parent_platforms?.filter((parent) => platformIcons[parent.platform.slug])
          .map((parent, i) => {
            return(
            <div key={i} className="flex items-center justify-center w-8 h-8 ">
              {platformIcons[parent.platform.slug]}
            </div>
            )
          })}
        </div>

        <p className="text-xs text-white/80">Released: {released}</p>

        <div className="flex flex-wrap gap-1 text-sm">
          {genres.map((genre, i) => (
            <span
              key={i}
              className="bg-white/20 px-2 py-0.5 rounded-full text-xs"
            >
              {genre.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default GameCard
