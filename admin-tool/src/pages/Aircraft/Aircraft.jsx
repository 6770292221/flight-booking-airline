import { useEffect, useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import Sidebar from "../Home/Sidebar";
import {
  addAircraft,
  getAllAircrafts,
  updateAircraft,
  deleteAircraft,
} from "../apis/aircraft"; // นำเข้า API สำหรับ Aircraft
import "./Aircraft.css"; // สไตล์ CSS

function Aircraft() {
  const [aircraftList, setAircraftList] = useState([]);
  const [editingAircraft, setEditingAircraft] = useState(null);

  // ฟังก์ชันดึงข้อมูลเครื่องบินทั้งหมด
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

  // ฟังก์ชันสำหรับเพิ่มเครื่องบิน
  const handleAdd = async () => {
    if (!editingAircraft.code || !editingAircraft.name) {
      return alert("Please fill in code and name");
    }
    try {
      await addAircraft(editingAircraft);
      setEditingAircraft(null); // รีเซ็ตค่า
      fetchAircrafts(); // รีเฟรชข้อมูล
    } catch (err) {
      console.error("Add failed", err);
    }
  };

  // ฟังก์ชันสำหรับลบเครื่องบิน
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure to delete this aircraft?")) return;
    try {
      await deleteAircraft(id);
      fetchAircrafts(); // รีเฟรชข้อมูล
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  // ฟังก์ชันสำหรับแก้ไขเครื่องบิน
  const handleUpdate = async () => {
    try {
      await updateAircraft(editingAircraft._id, editingAircraft);
      setEditingAircraft(null); // รีเซ็ตการแก้ไข
      fetchAircrafts(); // รีเฟรชข้อมูล
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  const openEditModal = (item) => {
    setEditingAircraft(item); // เปิด modal และตั้งค่าข้อมูลที่จะแก้ไข
  };

  return (
    <div className="home-wrapper">
      <Sidebar />
      <div className="aircraft-container">
        <h2>Aircrafts</h2>
        <button
          className="btn-add"
          onClick={() =>
            setEditingAircraft({
              code: "",
              name: "",
              airline: "",
              capacity: "",
            })
          }
        >
          + Add Aircraft
        </button>

        <table className="aircraft-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Airline</th>
              <th>Capacity</th>
              <th>Created</th>
              <th>Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {aircraftList.map((item) => (
              <tr key={item._id}>
                <td>{item.code}</td>
                <td>{item.name}</td>
                <td>{item.airline}</td>
                <td>{item.capacity}</td>
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
                      onClick={() => handleDelete(item._id)}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {editingAircraft && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>{editingAircraft._id ? "Edit Aircraft" : "Add Aircraft"}</h3>
              <div className="modal-form">
                <input
                  value={editingAircraft.code}
                  onChange={(e) =>
                    setEditingAircraft({
                      ...editingAircraft,
                      code: e.target.value,
                    })
                  }
                  placeholder="Code"
                />
                <input
                  value={editingAircraft.name}
                  onChange={(e) =>
                    setEditingAircraft({
                      ...editingAircraft,
                      name: e.target.value,
                    })
                  }
                  placeholder="Name"
                />
                <input
                  value={editingAircraft.airline}
                  onChange={(e) =>
                    setEditingAircraft({
                      ...editingAircraft,
                      airline: e.target.value,
                    })
                  }
                  placeholder="Airline"
                />
                <input
                  value={editingAircraft.capacity}
                  onChange={(e) =>
                    setEditingAircraft({
                      ...editingAircraft,
                      capacity: e.target.value,
                    })
                  }
                  placeholder="Capacity"
                />
              </div>
              <div className="modal-buttons">
                <button
                  className="btn-update"
                  onClick={editingAircraft._id ? handleUpdate : handleAdd}
                >
                  {editingAircraft._id ? "Update" : "Create"}
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
