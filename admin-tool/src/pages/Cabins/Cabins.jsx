import { useEffect, useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import Sidebar from "../Home/Sidebar";
import {
  getCabinClasses,
  deleteCabinClass,
  addCabinClass,
  updateCabinClass,
} from "../apis/cabin";
import { showErrorPopup } from "../components/ErrorPopup";
import ConfirmationPopup from "../components/ConfirmationPopup";
import "./Cabins.css";

function Cabins() {
  const [cabinList, setCabinList] = useState([]);
  const [editingCabin, setEditingCabin] = useState(null);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [cabinToDelete, setCabinToDelete] = useState(null);

  useEffect(() => {
    fetchCabinClasses();
  }, []);

  const fetchCabinClasses = async () => {
    try {
      const res = await getCabinClasses();
      setCabinList(res.data.data.items);
    } catch (err) {
      console.error("Failed to fetch cabin classes", err);
    }
  };

  const handleAdd = async () => {
    if (!editingCabin.code || !editingCabin.name) {
      return alert("Please fill in code and name");
    }

    try {
      const response = await addCabinClass(editingCabin);

      if (response.status === "failed") {
        console.error("Failed response:", response);
        showErrorPopup(response.data.code, response.data.message);
      } else {
        setEditingCabin(null);
        fetchCabinClasses();
      }
    } catch (err) {
      console.error("Error occurred:", err);

      if (err.response) {
        const code = err.response.data.code || "UNKNOWN";
        const message =
          err.response.data.message ||
          "An error occurred while adding the cabin class.";
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
      if (cabinToDelete) {
        await deleteCabinClass(cabinToDelete);
        setShowDeletePopup(false);
        fetchCabinClasses();
      }
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const handleUpdate = async () => {
    try {
      const response = await updateCabinClass(editingCabin._id, editingCabin);

      if (response.status === "failed") {
        showErrorPopup(response.data.code, response.data.message);
      } else {
        setEditingCabin(null);
        fetchCabinClasses();
      }
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

  const formatDate = (isoString) => {
    if (!isoString) return "-";
    return new Date(isoString).toLocaleString("th-TH", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Bangkok",
    });
  };

  const openEditModal = (item) => {
    setEditingCabin(item);
  };

  const openDeleteConfirm = (id) => {
    setCabinToDelete(id);
    setShowDeletePopup(true);
  };

  const closeDeleteConfirm = () => {
    setShowDeletePopup(false);
    setCabinToDelete(null);
  };

  return (
    <div className="home-wrapper">
      <Sidebar />
      <div className="cabins-container">
        <h2>Cabin Classes</h2>
        <button
          className="btn-add"
          onClick={() =>
            setEditingCabin({ code: "", name: "", checked: "", carryOn: "" })
          }
        >
          + Add Cabin Class
        </button>

        <table className="cabin-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Checked</th>
              <th>Carry-On</th>
              <th>Created</th>
              <th>Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {cabinList.map((item) => (
              <tr key={item._id}>
                <td>{item.code}</td>
                <td>{item.name}</td>
                <td>{item.checked}</td>
                <td>{item.carryOn}</td>
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

        {/* Show delete confirmation popup */}
        {showDeletePopup && (
          <ConfirmationPopup
            message="Are you sure you want to delete this cabin?"
            onConfirm={handleDelete}
            onCancel={closeDeleteConfirm}
          />
        )}

        {editingCabin && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>
                {editingCabin._id ? "Edit Cabin Class" : "Add Cabin Class"}
              </h3>
              <div className="modal-form">
                <input
                  value={editingCabin.code}
                  onChange={(e) =>
                    setEditingCabin({ ...editingCabin, code: e.target.value })
                  }
                  placeholder="Code"
                />
                <input
                  value={editingCabin.name}
                  onChange={(e) =>
                    setEditingCabin({ ...editingCabin, name: e.target.value })
                  }
                  placeholder="Name"
                />
                <input
                  value={editingCabin.checked}
                  onChange={(e) =>
                    setEditingCabin({
                      ...editingCabin,
                      checked: e.target.value,
                    })
                  }
                  placeholder="Checked"
                />
                <input
                  value={editingCabin.carryOn}
                  onChange={(e) =>
                    setEditingCabin({
                      ...editingCabin,
                      carryOn: e.target.value,
                    })
                  }
                  placeholder="Carry-On"
                />
              </div>
              <div className="modal-buttons">
                <button
                  className="btn-update"
                  onClick={editingCabin._id ? handleUpdate : handleAdd}
                >
                  {editingCabin._id ? "Update" : "Create"}
                </button>
                <button
                  className="btn-cancel"
                  onClick={() => setEditingCabin(null)}
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

export default Cabins;
