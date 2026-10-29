import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Map from "./components/Map.jsx";
import Home from "./components/Home.jsx";
import Dashboard from "./components/layer/Dashboard.jsx";
import AI from "./components/layer/Ai.jsx";
import 'leaflet/dist/leaflet.css';

function App() {

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/map" element={<Map />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/ai" element={<AI />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;
