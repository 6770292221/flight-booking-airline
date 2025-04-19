import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SearchFlight from "./pages/SearchFlight";
import Register from "./pages/Register";
import Login from "./pages/Login";
import History from "./pages/History";
import Booking from "./pages/Booking";
import SelectFlight from "./pages/SelectFlight";
import Payment from "./pages/Payment";
import PaymentHistory from "./pages/PaymentHistory.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SearchFlight />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login key={location.key} />} />
        <Route path="/history" element={<History />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/payment" element={<Payment />} /> {}
        <Route path="/select-flight" element={<SelectFlight />} />
        <Route path="/payments" element={<PaymentHistory />} />{" "}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
