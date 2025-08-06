import GameCarousel from "../GameCarousel/GameCarousel"
import GridBackground from "../GridBackground";
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import "./LandingPage.css";

const LandingPage = () => {
  return (
    <div className="w-full h-screen overflow-hidden" style={{
    background: 'radial-gradient(circle at center, #1e1e2f 0%, #0a0f1c 100%)'
    }}>
      <header className="text-center text-pink-400 text-4xl font-mono p-6">
      🎮 Welcome to the Retro World 🎮
      </header>
      {/* <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        className="block"
      >
        <ambientLight intensity={1}/>
        <GridBackground />
        <OrbitControls />
      </Canvas> */}
      <GameCarousel />
    </div>
  )
}

export default LandingPage
