import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./SandwhichMenu.css";

const SandwhichMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    setIsOpen(false);
    navigate(path);
  };

  return (
    <div className="sandwich-button fixed top-4 right-4 z-[9999] flex flex-col items-end">
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
        <div className="mt-2 bg-[#1e1e2f] text-white rounded-lg shadow-lg p-4 top-3em">
          <ul className="flex flex-col gap-1">
            <li onClick={() => handleNavigate('/games/49')} className="dropdown-item">
              NES
            </li>
            <li onClick={() => handleNavigate('/games/107')} className="dropdown-item">
              Sega Saturn
            </li>
            <li onClick={() => handleNavigate('/games/27')} className="dropdown-item">
              PlayStation 1
            </li>
            <li onClick={() => handleNavigate('/games/80')} className="dropdown-item">
              Xbox
            </li>
            {/* Add more consoles */}
          </ul>
        </div>
      )}
    </div>
  );
}

export default SandwhichMenu
