import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./SandwhichMenu.css";

const SandwhichMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

   if (location.pathname === '/') return null;


  const handleNavigate = (path) => {
    setIsOpen(false);
    navigate(path);
  };

  return (
    <div className="sandwhich-button fixed top-4 right-15 z-50 flex flex-col items-end">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex flex-col justify-between w-10 h-8 bg-transparent border-none cursor-pointer focus:outline-none gap-1 items-center"
      >
        <span className="block w-4 h-1 bg-white"></span>
        <span className="block w-4 h-1 bg-white"></span>
        <span className="block w-4 h-1 bg-white"></span>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="mt-2 bg-[#1e1e2f] text-white rounded-lg shadow-lg p-4">
          <ul className="flex flex-col gap-1">
            <li onClick={() => handleNavigate('/game-room/nes')} className="dropdown-item">
              NES
            </li>
            <li onClick={() => handleNavigate('/game-room/sega-saturn')} className="dropdown-item">
              Sega Saturn
            </li>
            <li onClick={() => handleNavigate('/game-room/ps1')} className="dropdown-item">
              PlayStation 1
            </li>
            {/* Add more consoles */}
          </ul>
        </div>
      )}
    </div>
  );
}

export default SandwhichMenu
