import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import  GameRoom  from './components/GameRoom';
import LandingPage from './components/LandingPage';
function App() {


  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />}/>
        <Route path="/games" element={<GameRoom />}/>
      </Routes>
    </Router>
  )
}

export default App
