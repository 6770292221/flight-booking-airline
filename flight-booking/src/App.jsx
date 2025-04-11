import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SearchFlight from "./pages/SearchFlight";
import SelectFlight from "./pages/SelectFlight";
import Register from "./pages/Register";
import Login from "./pages/Login";
import History from "./pages/History";
import Booking from "./pages/Booking";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SearchFlight />} />
        <Route path="/select-flight" element={<SelectFlight />} />
        <Route path="/register" element={<Register />} /> {/* Register route */}
        <Route path="/login" element={<Login />} /> {/* Register route */}
        <Route path="/history" element={<History />} /> {/* Register route */}
        <Route path="/booking" element={<Booking />} /> {/* Register route */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
