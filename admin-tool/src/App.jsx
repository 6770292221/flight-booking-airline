import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login/Login";
import Home from "./pages/Home/Home";
import Cabins from "./pages/Cabins/Cabins";
import Airline from "./pages/Airline/Airline";
import Airport from "./pages/Airport/Airport";
import Aircraft from "./pages/Aircraft/Aircraft";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/home" element={<Home />} />
      <Route path="/cabins" element={<Cabins />} />
      <Route path="/airline" element={<Airline />} />
      <Route path="/airports" element={<Airport />} />
      <Route path="/aircrafts" element={<Aircraft />} />
    </Routes>
  );
}

export default App;
