import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SearchFlight from "./pages/SearchFlight";
import Register from "./pages/Register";
import Login from "./pages/Login";
import History from "./pages/History";
import Booking from "./pages/Booking";
import SelectFlight from "./pages/SelectFlight";
import Payment from "./pages/Payment"; // ✅ เพิ่มตรงนี้

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SearchFlight />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/history" element={<History />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/payment" element={<Payment />} /> {/* ✅ ใช้งานได้แล้ว */}
        <Route path="/select-flight" element={<SelectFlight />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
