import ThreeCanvas from "../ThreeCanvas"

const LandingPage = () => {
  return (
    <div className="w-full h-screen" style={{
  background: 'radial-gradient(circle at center, #1e1e2f 0%, #0a0f1c 100%)'
    }}>
      <header className="text-center text-pink-400 text-4xl font-mono p-6">
      🎮 Welcome to the Retro World 🎮
      </header>
      <ThreeCanvas />
    </div>
  )
}

export default LandingPage
