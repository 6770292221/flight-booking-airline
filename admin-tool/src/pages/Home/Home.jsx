// src/pages/Home/Home.jsx
import Sidebar from "./Sidebar";
import "./Home.css";

function Home() {
  return (
    <div className="home-wrapper">
      <Sidebar />
      <main className="home-content">
        <h2 className="home-title">🎉 Welcome to the Airline Dashboard</h2>
        <p className="home-subtitle">Manage your system at a glance.</p>

        <section className="home-cards">
          <div className="dashboard-card">
            <h3>Airlines</h3>
            <p>5 airlines registered</p>
          </div>
          <div className="dashboard-card">
            <h3>Cabins</h3>
            <p>8 cabin classes</p>
          </div>
          <div className="dashboard-card">
            <h3>Aircraft</h3>
            <p>12 aircraft in service</p>
          </div>
          <div className="dashboard-card">
            <h3>Bookings</h3>
            <p>230 bookings this month</p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Home;
