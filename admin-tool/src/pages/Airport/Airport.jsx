import { useEffect, useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import Sidebar from "../Home/Sidebar";
import {
  getAllAirports,
  addAirport,
  updateAirport,
  deleteAirport,
} from "../../apis/airport";
import ConfirmationPopup from "../components/ConfirmationPopup";
import { showErrorPopup } from "../components/ErrorPopup";
import "./Airport.css";

function Airports() {
  const [airportList, setAirportList] = useState([]);
  const [editingAirport, setEditingAirport] = useState(null);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [airportToDelete, setAirportToDelete] = useState(null);

  useEffect(() => {
    fetchAirports();
  }, []);

  const fetchAirports = async () => {
    try {
      const res = await getAllAirports();
      setAirportList(res.data.data.items);
    } catch (err) {
      console.error("Failed to fetch airports", err);
    }
  };

  const handleAdd = async () => {
    if (!editingAirport.iataCode || !editingAirport.airportName) {
      return alert("Please fill in airport code and name");
    }
    try {
      await addAirport(editingAirport);
      setEditingAirport(null);
      fetchAirports();
    } catch (err) {
      console.error("Add failed:", err);
      if (err.response) {
        const code = err.response.data.code || "UNKNOWN";
        const message =
          err.response.data.message ||
          "An error occurred while adding the airport.";
        showErrorPopup(code, message);
      } else {
        showErrorPopup(
          "NETWORK_ERROR",
          "Network error. Please try again later."
        );
      }
    }
  };

  const handleDelete = async () => {
    if (!airportToDelete) return;
    try {
      await deleteAirport(airportToDelete);
      setShowConfirmPopup(false);
      fetchAirports();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const handleUpdate = async () => {
    try {
      await updateAirport(editingAirport.id, editingAirport);
      setEditingAirport(null);
      fetchAirports();
    } catch (err) {
      console.error("Update failed:", err);
      if (err.response) {
        const code = err.response.data.code || "UNKNOWN";
        const message =
          err.response.data.message ||
          "An error occurred while updating the airport.";
        showErrorPopup(code, message);
      } else {
        showErrorPopup(
          "NETWORK_ERROR",
          "Network error. Please try again later."
        );
      }
    }
  };

  const openDeleteConfirm = (id) => {
    setAirportToDelete(id);
    setShowConfirmPopup(true);
  };

  const closeDeleteConfirm = () => {
    setShowConfirmPopup(false);
    setAirportToDelete(null);
  };

  const openEditConfirm = (item) => {
    setEditingAirport(item);
    setShowEditConfirm(true);
  };

  const closeEditConfirm = () => {
    setShowEditConfirm(false);
    setEditingAirport(null);
  };

  const openEditModal = (item) => {
    setEditingAirport(item);
  };

  return (
    <div className="home-wrapper">
      <Sidebar />
      <div className="airports-container">
        <h2>Airports</h2>
        <button
          className="btn-add"
          onClick={() =>
            setEditingAirport({
              iataCode: "",
              airportName: "",
              cityName: "",
              country: "",
              timezone: "",
            })
          }
        >
          + Add Airport
        </button>

        <table className="airport-table">
          <thead>
            <tr>
              <th>IATA Code</th>
              <th>Airport Name</th>
              <th>City</th>
              <th>Country</th>
              <th>Timezone</th>
              <th>Created</th>
              <th>Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {airportList.map((item) => (
              <tr key={item.id}>
                <td>{item.iataCode}</td>
                <td>{item.airportName}</td>
                <td>{item.cityName}</td>
                <td>{item.country}</td>
                <td>{item.timezone}</td>
                <td>{new Date(item.createdAt).toLocaleString()}</td>
                <td>{new Date(item.updatedAt).toLocaleString()}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="icon-button edit"
                      onClick={() => openEditModal(item)}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="icon-button delete"
                      onClick={() => openDeleteConfirm(item.id)}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {editingAirport && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>{editingAirport.id ? "Edit Airport" : "Add Airport"}</h3>
              <div className="modal-form">
                <input
                  value={editingAirport.iataCode}
                  onChange={(e) =>
                    setEditingAirport({
                      ...editingAirport,
                      iataCode: e.target.value,
                    })
                  }
                  placeholder="IATA Code"
                />
                <input
                  value={editingAirport.airportName}
                  onChange={(e) =>
                    setEditingAirport({
                      ...editingAirport,
                      airportName: e.target.value,
                    })
                  }
                  placeholder="Airport Name"
                />
                <input
                  value={editingAirport.cityName}
                  onChange={(e) =>
                    setEditingAirport({
                      ...editingAirport,
                      cityName: e.target.value,
                    })
                  }
                  placeholder="City"
                />
                <input
                  value={editingAirport.country}
                  onChange={(e) =>
                    setEditingAirport({
                      ...editingAirport,
                      country: e.target.value,
                    })
                  }
                  placeholder="Country"
                />
                <input
                  value={editingAirport.timezone}
                  onChange={(e) =>
                    setEditingAirport({
                      ...editingAirport,
                      timezone: e.target.value,
                    })
                  }
                  placeholder="Timezone"
                />
              </div>
              <div className="modal-buttons">
                <button
                  className="btn-update"
                  onClick={editingAirport.id ? handleUpdate : handleAdd}
                >
                  {editingAirport.id ? "Update" : "Create"}
                </button>
                <button
                  className="btn-cancel"
                  onClick={() => setEditingAirport(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Show the confirmation popup for deletion */}
        {showConfirmPopup && (
          <ConfirmationPopup
            message="Are you sure you want to delete this airport?"
            onConfirm={handleDelete}
            onCancel={closeDeleteConfirm}
          />
        )}
      </div>
    </div>
  );
}

export default Airports;
