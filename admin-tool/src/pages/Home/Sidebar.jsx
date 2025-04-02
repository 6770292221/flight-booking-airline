import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaChevronDown,
  FaChevronUp,
  FaPlane,
  FaChair,
  FaMapMarkerAlt,
  FaTicketAlt,
  FaPowerOff,
  FaBars,
} from "react-icons/fa";
import "./Sidebar.css";
import { MdAirlineSeatReclineExtra, MdOutlinePayment } from "react-icons/md";
import { logout } from "../../apis/auth";

function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [openSection, setOpenSection] = useState({
    data: true,
    operation: true,
  });

  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      await logout();
      localStorage.removeItem("token");
      navigate("/"); // ไปที่หน้า login
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  const toggleSection = (key) => {
    setOpenSection({ ...openSection, [key]: !openSection[key] });
  };

  return (
    <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-header">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="menu-toggle"
        >
          <FaBars />
        </button>
        {!collapsed && <h3>Menu</h3>}
      </div>

      <ul>
        <li>
          <Link to="/home">
            <FaTicketAlt /> {!collapsed && "Dashboard"}
          </Link>
        </li>

        <li className="submenu-toggle" onClick={() => toggleSection("data")}>
          <span>{!collapsed && "Manage Data"}</span>
          {!collapsed &&
            (openSection.data ? <FaChevronUp /> : <FaChevronDown />)}
        </li>
        {openSection.data && (
          <>
            <li>
              <Link to="/airline">
                <FaPlane /> {!collapsed && "Airlines"}
              </Link>
            </li>
            <li>
              <Link to="/cabins">
                <FaChair /> {!collapsed && "Cabin"}
              </Link>
            </li>
            <li>
              <Link to="/airports">
                <FaMapMarkerAlt /> {!collapsed && "Airports"}
              </Link>
            </li>
            <li>
              <Link to="/aircrafts">
                <MdAirlineSeatReclineExtra /> {!collapsed && "Aircraft"}
              </Link>
            </li>
          </>
        )}

        <li
          className="submenu-toggle"
          onClick={() => toggleSection("operation")}
        >
          <span>{!collapsed && "Manage Operation"}</span>
          {!collapsed &&
            (openSection.operation ? <FaChevronUp /> : <FaChevronDown />)}
        </li>
        {openSection.operation && (
          <>
            <li>
              <Link to="/bookings">
                <FaTicketAlt /> {!collapsed && "Booking"}
              </Link>
            </li>
            <li>
              <Link to="/payments">
                <MdOutlinePayment /> {!collapsed && "Payment"}
              </Link>
            </li>
          </>
        )}

        <li>
          <button onClick={handleLogout} className="logout-button">
            <FaPowerOff /> {!collapsed && "Logout"}
          </button>
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;
