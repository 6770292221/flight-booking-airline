import { useEffect, useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import Sidebar from "../Home/Sidebar";
import {
  addAirline,
  getAllAirlines,
  updateAirline,
  deleteAirline,
} from "../../apis/airline";
import "./Airline.css";
import { showErrorPopup } from "../components/ErrorPopup";
import ConfirmationPopup from "../components/ConfirmationPopup";

function Airline() {
  const [airlineList, setAirlineList] = useState([]);
  const [editingAirline, setEditingAirline] = useState(null);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [airlineToDelete, setAirlineToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchAirlines();
  }, []);

  const fetchAirlines = async () => {
    try {
      const res = await getAllAirlines();
      setAirlineList(res.data.data.items);
    } catch (err) {
      console.error("Failed to fetch airlines", err);
    }
  };

  const handleAdd = async () => {
    if (!editingAirline.carrierCode || !editingAirline.airlineName) {
      return alert("Please fill in carrier code and airline name");
    }

    try {
      const response = await addAirline(editingAirline);

      if (response.status === "failed") {
        const code = response.code || "UNKNOWN";
        const message =
          response.message || "An error occurred while adding the airline.";
        showErrorPopup(code, message);
        return;
      }

      setEditingAirline(null);
      fetchAirlines();
    } catch (err) {
      console.error("Error occurred:", err);

      if (err.response) {
        const code = err.response.data.error.code || "UNKNOWN";
        const message =
          err.response.data.error.message ||
          "An error occurred while adding the airline.";
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
      if (airlineToDelete) {
        await deleteAirline(airlineToDelete);
        setShowDeletePopup(false);
        fetchAirlines();
      }
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const handleUpdate = async () => {
    try {
      const response = await updateAirline(editingAirline._id, editingAirline);

      if (response.data.status === "failed") {
        const code = response.data.code || "UNKNOWN";
        const message =
          response.data.message ||
          "An error occurred while updating the airline.";
        showErrorPopup(code, message);
        return;
      }

      setEditingAirline(null);
      fetchAirlines();
    } catch (err) {
      console.error("Update failed:", err);

      if (err.response) {
        const code = err.response.data.code || "UNKNOWN";
        const message =
          err.response.data.message ||
          "An error occurred while updating the cabin class.";
        showErrorPopup(code, message);
      } else {
        showErrorPopup(
          "NETWORK_ERROR",
          "Network error. Please try again later."
        );
      }
    }
  };

  const openEditModal = (item) => {
    setEditingAirline(item);
  };

  const openDeleteConfirm = (id) => {
    setAirlineToDelete(id);
    setShowDeletePopup(true);
  };

  const closeDeleteConfirm = () => {
    setShowDeletePopup(false);
    setAirlineToDelete(null);
  };

  // ✅ Filter list by code or name
  const filteredAirlines = airlineList.filter((airline) => {
    const query = searchQuery.toLowerCase();
    return (
      airline.carrierCode?.toLowerCase().includes(query) ||
      airline.airlineName?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="home-wrapper">
      <Sidebar />
      <div className="airline-container">
        <h2>Airline</h2>

        {/* Add Airline Button */}
        <button
          className="btn-add"
          onClick={() =>
            setEditingAirline({
              carrierCode: "",
              airlineName: "",
              logoUrl: "",
              country: "",
              isLowCost: true,
            })
          }
        >
          + Add Airline
        </button>

        {/*Search Bar */}
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search by Code or Name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Airline Table */}
        <table className="airline-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Country</th>
              <th>Low Cost</th>
              <th>Logo</th>
              <th>Created</th>
              <th>Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAirlines.map((item) => (
              <tr key={item._id}>
                <td>{item.carrierCode}</td>
                <td>{item.airlineName}</td>
                <td>{item.country}</td>
                <td>{item.isLowCost ? "Yes" : "No"}</td>
                <td>
                  <img
                    src={item.logoUrl}
                    alt={item.airlineName}
                    width="100"
                    height="30"
                  />
                </td>
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
                      onClick={() => openDeleteConfirm(item._id)}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Delete Confirmation */}
        {showDeletePopup && (
          <ConfirmationPopup
            message="Are you sure you want to delete this airline?"
            onConfirm={handleDelete}
            onCancel={closeDeleteConfirm}
          />
        )}

        {/* Add/Edit Modal */}
        {editingAirline && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>{editingAirline._id ? "Edit Airline " : "Add Airline "}</h3>
              <div className="modal-form">
                <input
                  value={editingAirline.carrierCode}
                  onChange={(e) =>
                    setEditingAirline({
                      ...editingAirline,
                      carrierCode: e.target.value,
                    })
                  }
                  placeholder="Carrier Code"
                />
                <input
                  value={editingAirline.airlineName}
                  onChange={(e) =>
                    setEditingAirline({
                      ...editingAirline,
                      airlineName: e.target.value,
                    })
                  }
                  placeholder="Airline Name"
                />
                <input
                  value={editingAirline.logoUrl}
                  onChange={(e) =>
                    setEditingAirline({
                      ...editingAirline,
                      logoUrl: e.target.value,
                    })
                  }
                  placeholder="Logo URL"
                />
                <input
                  value={editingAirline.country}
                  onChange={(e) =>
                    setEditingAirline({
                      ...editingAirline,
                      country: e.target.value,
                    })
                  }
                  placeholder="Country"
                />
                <label>
                  Is Low Cost?
                  <input
                    type="checkbox"
                    checked={editingAirline.isLowCost}
                    onChange={(e) =>
                      setEditingAirline({
                        ...editingAirline,
                        isLowCost: e.target.checked,
                      })
                    }
                  />
                </label>
              </div>
              <div className="modal-buttons">
                <button
                  className="btn-update"
                  onClick={editingAirline._id ? handleUpdate : handleAdd}
                >
                  {editingAirline._id ? "Update" : "Create"}
                </button>
                <button
                  className="btn-cancel"
                  onClick={() => setEditingAirline(null)}
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

export default Airline;
