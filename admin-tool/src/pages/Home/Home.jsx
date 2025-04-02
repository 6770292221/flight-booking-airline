// src/pages/Home/Home.jsx
import Sidebar from "./Sidebar";
import "./Home.css";
import { FaPlane, FaChair, FaTicketAlt, FaRocket } from "react-icons/fa";

function Home() {
  return (
    <div className="home-wrapper">
      <Sidebar />
      <main className="home-content">
        <h2 className="home-title">✈️ Airline Admin Dashboard</h2>
        <p className="home-subtitle">Overview of your airline operations.</p>

        <section className="home-cards">
          <div className="dashboard-card">
            <FaPlane className="card-icon" />
            <div>
              <h3>Airlines</h3>
              <p>5 airlines registered</p>
            </div>
          </div>

          <div className="dashboard-card">
            <FaChair className="card-icon" />
            <div>
              <h3>Cabins</h3>
              <p>8 cabin types</p>
            </div>
          </div>

          <div className="dashboard-card">
            <FaRocket className="card-icon" />
            <div>
              <h3>Aircraft</h3>
              <p>12 aircraft in service</p>
            </div>
          </div>

          <div className="dashboard-card">
            <FaTicketAlt className="card-icon" />
            <div>
              <h3>Bookings</h3>
              <p>230 this month</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Home;
