import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SearchFlight from "./pages/SearchFlight";
import SelectFlight from "./pages/SelectFlight";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SearchFlight />} />
        <Route path="/select-flight" element={<SelectFlight />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
