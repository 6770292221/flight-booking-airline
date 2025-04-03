import { useEffect, useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import Sidebar from "../Home/Sidebar";
import {
  addAircraft,
  getAllAircrafts,
  updateAircraft,
  deleteAircraft,
} from "../../apis/aircraft";
import "./Aircraft.css";
import { showErrorPopup } from "../components/ErrorPopup";
import ConfirmationPopup from "../components/ConfirmationPopup";

function Aircraft() {
  const [aircraftList, setAircraftList] = useState([]);
  const [editingAircraft, setEditingAircraft] = useState(null);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [aircraftToDelete, setAircraftToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchAircrafts();
  }, []);

  const fetchAircrafts = async () => {
    try {
      const res = await getAllAircrafts();
      setAircraftList(res.data.data.items);
    } catch (err) {
      console.error("Failed to fetch aircrafts", err);
    }
  };

  const handleAdd = async () => {
    if (!editingAircraft.aircraftCode || !editingAircraft.name) {
      return alert("Please fill in aircraft code and name");
    }
    try {
      await addAircraft(editingAircraft);
      setEditingAircraft(null);
      fetchAircrafts();
    } catch (err) {
      console.error("Update failed:", err);

      if (err.response) {
        const code = err.response.data.code || "UNKNOWN";
        const message =
          err.response.data.message ||
          "An error occurred while updating the aircraft.";
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
    try {
      if (aircraftToDelete) {
        await deleteAircraft(aircraftToDelete);
        setShowDeletePopup(false);
        fetchAircrafts();
      }
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const handleUpdate = async () => {
    try {
      const response = await updateAircraft(
        editingAircraft.id,
        editingAircraft
      );
      if (response.data.status === "failed") {
        showErrorPopup(response.data.code, response.data.message);
        return;
      }
      setEditingAircraft(null);
      fetchAircrafts();
    } catch (err) {
      console.error("Update failed:", err);

      if (err.response) {
        const code = err.response.data.code || "UNKNOWN";
        const message =
          err.response.data.message ||
          "An error occurred while updating the aircraft.";
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
    setAircraftToDelete(id);
    setShowDeletePopup(true);
  };

  const closeDeleteConfirm = () => {
    setShowDeletePopup(false);
    setAircraftToDelete(null);
  };

  const openEditModal = (item) => {
    setEditingAircraft(item);
  };

  //Filter aircrafts based on search query
  const filteredAircrafts = aircraftList.filter((item) => {
    const query = searchQuery.toLowerCase();
    return (
      item.aircraftCode?.toLowerCase().includes(query) ||
      item.name?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="home-wrapper">
      <Sidebar />
      <div className="aircraft-container">
        <h2>Aircrafts</h2>

        <button
          className="btn-add"
          onClick={() =>
            setEditingAircraft({
              aircraftCode: "",
              name: "",
              seatLayout: "",
              seatPitch: "",
              seatCapacity: "",
            })
          }
        >
          + Add Aircraft
        </button>

        {/*Search input */}
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search by Aircraft Code or Name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <table className="aircraft-table">
          <thead>
            <tr>
              <th>Aircraft Code</th>
              <th>Name</th>
              <th>Seat Layout</th>
              <th>Seat Pitch</th>
              <th>Seat Capacity</th>
              <th>Created</th>
              <th>Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAircrafts.map((item) => (
              <tr key={item.id}>
                <td>{item.aircraftCode}</td>
                <td>{item.name}</td>
                <td>{item.seatLayout}</td>
                <td>{item.seatPitch}</td>
                <td>{item.seatCapacity}</td>
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

        {showDeletePopup && (
          <ConfirmationPopup
            message="Are you sure you want to delete this aircraft?"
            onConfirm={handleDelete}
            onCancel={closeDeleteConfirm}
          />
        )}

        {editingAircraft && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>{editingAircraft.id ? "Edit Aircraft" : "Add Aircraft"}</h3>
              <div className="modal-form">
                <input
                  value={editingAircraft.aircraftCode}
                  onChange={(e) =>
                    setEditingAircraft({
                      ...editingAircraft,
                      aircraftCode: e.target.value,
                    })
                  }
                  placeholder="Aircraft Code"
                />
                <input
                  value={editingAircraft.name}
                  onChange={(e) =>
                    setEditingAircraft({
                      ...editingAircraft,
                      name: e.target.value,
                    })
                  }
                  placeholder="Aircraft Name"
                />
                <input
                  value={editingAircraft.seatLayout}
                  onChange={(e) =>
                    setEditingAircraft({
                      ...editingAircraft,
                      seatLayout: e.target.value,
                    })
                  }
                  placeholder="Seat Layout"
                />
                <input
                  value={editingAircraft.seatPitch}
                  onChange={(e) =>
                    setEditingAircraft({
                      ...editingAircraft,
                      seatPitch: e.target.value,
                    })
                  }
                  placeholder="Seat Pitch"
                />
                <input
                  value={editingAircraft.seatCapacity}
                  onChange={(e) =>
                    setEditingAircraft({
                      ...editingAircraft,
                      seatCapacity: e.target.value,
                    })
                  }
                  placeholder="Seat Capacity"
                />
              </div>
              <div className="modal-buttons">
                <button
                  className="btn-update"
                  onClick={editingAircraft.id ? handleUpdate : handleAdd}
                >
                  {editingAircraft.id ? "Update" : "Create"}
                </button>
                <button
                  className="btn-cancel"
                  onClick={() => setEditingAircraft(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Aircraft;
