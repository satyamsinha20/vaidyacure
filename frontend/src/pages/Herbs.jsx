import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import AddHerb from "./AddHerb";
import toast, { Toaster } from "react-hot-toast";

// ===== CUSTOM STYLES =====
const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(to bottom right, #f0fff4, #dcfce7)",
    padding: "1.5rem",
    fontFamily: "Arial, sans-serif",
  },
  button: {
    padding: "0.5rem 1.5rem",
    borderRadius: "0.5rem",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    fontWeight: "bold",
  },
  addButton: { backgroundColor: "#16a34a" }, // green
  uploadButton: { backgroundColor: "#7e22ce" }, // purple
  dashboardButton: { backgroundColor: "#4b5563" }, // gray
  tableContainer: {
    backgroundColor: "#fff",
    borderRadius: "1rem",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
    overflow: "hidden",
  },
  tableHeader: {
    backgroundColor: "#16a34a",
    color: "#fff",
    textAlign: "left",
  },
  tableHeaderCell: {
    padding: "1rem",
    borderRight: "1px solid #4ade80",
  },
  row: {
    height: "5rem",
    borderBottom: "1px solid #ccc",
  },
  rowGray: { backgroundColor: "#e0e0e0" },
  rowOrange: { backgroundColor: "#ffd8a8" },
  cell: { padding: "1rem", borderRight: "1px solid #ccc" },
  image: { height: "4rem", width: "4rem", objectFit: "cover", borderRadius: "0.375rem" },
  actionButton: {
    padding: "0.25rem 0.75rem",
    borderRadius: "0.25rem",
    border: "none",
    color: "#fff",
    cursor: "pointer",
    marginRight: "0.5rem",
    fontWeight: "bold",
  },
  editButton: { backgroundColor: "#3b82f6" },
  deleteButton: { backgroundColor: "#ef4444" },
  noHerbs: { textAlign: "center", padding: "1.5rem", color: "#999" },
  headerTitle: { fontSize: "1.5rem", fontWeight: "bold", color: "#15803d", padding: "1rem" },
};

export default function Herbs() {
  const navigate = useNavigate();

  const [herbs, setHerbs] = useState([]);
  const [editData, setEditData] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    try {
      const res = await api.get("/herbs");
      setHerbs(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to load herbs", err);
      toast.error("Failed to load herbs");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const del = async (id) => {
    try {
      await api.delete(`/herbs/${id}`);
      toast.success("Herb deleted successfully 🌿");
      load();
    } catch (err) {
      console.error("Delete failed", err);
      toast.error("Failed to delete herb");
    }
  };
  // Download Herbs
  const downloadHerbs = async () => {
    try {
      const res = await api.get("/herbs/download", {
        responseType: "blob", // important
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "herbs.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Download failed", err);
      toast.error("Failed to download herbs ❌");
    }
  };


  const handleEdit = (herb) => {
    setEditData(herb);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAddNew = () => {
    setEditData(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      await api.post("/herbs/bulk-upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Herbs uploaded successfully 🌿");
      load();
    } catch (err) {
      console.error("Bulk upload failed", err);
      toast.error("Upload failed");
    }
  };

  return (
    <div style={styles.container}>
      <Toaster position="top-right" reverseOrder={false} />
      <div style={{ maxWidth: "1120px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "2.5rem" }}>
        {/* Buttons */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
          <button onClick={handleAddNew} style={{ ...styles.button, ...styles.addButton }}>
            + Add New Herb
          </button>

          <input type="file" accept=".csv,.xlsx" id="bulkUpload" style={{ display: "none" }} onChange={handleFileUpload} />
          <button onClick={() => document.getElementById("bulkUpload").click()} style={{ ...styles.button, ...styles.uploadButton }}>
            ⬆ Upload CSV / Excel
          </button>
          <button
            onClick={downloadHerbs}
            className="bg-orange-600 text-white px-6 py-2 rounded-lg"
          >
            ⬇ Download Herbs Excel
          </button>


          <button onClick={() => navigate("/dashboard")} style={{ ...styles.button, ...styles.dashboardButton }}>
            Back To Dashboard
          </button>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div style={{ backgroundColor: "#fff", borderRadius: "1rem", boxShadow: "0 4px 6px rgba(0,0,0,0.1)", padding: "1.5rem" }}>
            <AddHerb
              refresh={load}
              editData={editData}
              setEditData={(data) => {
                setEditData(data);
                if (!data) setShowForm(false);
              }}
              setShowForm={setShowForm}
            />
          </div>
        )}

        {/* Table */}
        <div style={styles.tableContainer}>
          <div style={{ borderBottom: "1px solid #ccc" }}>
            <h2 style={styles.headerTitle}>🌿 Herbs Management</h2>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={styles.tableHeader}>
              <tr>
                <th style={styles.tableHeaderCell}>Herb</th>
                <th style={styles.tableHeaderCell}>Image</th>
                <th style={styles.tableHeaderCell}>Symptoms</th>
                <th style={{ padding: "1rem", textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {herbs.map((h, index) => (
                <tr
                  key={h._id}
                  style={{
                    ...styles.row,
                    ...(index % 2 === 0 ? styles.rowGray : styles.rowOrange),
                  }}
                >
                  <td style={styles.cell}>{h.name}</td>
                  <td style={styles.cell}>
                    {h.imageUrl ? (
                      <img src={h.imageUrl} alt={h.name} style={styles.image} />
                    ) : (
                      <span style={{ color: "#999" }}>No image</span>
                    )}
                  </td>
                  <td style={styles.cell}>{Array.isArray(h.symptoms) ? h.symptoms.join(", ") : ""}</td>
                  <td style={{ padding: "1rem", textAlign: "center" }}>
                    <button onClick={() => handleEdit(h)} style={{ ...styles.actionButton, ...styles.editButton }}>
                      Edit
                    </button>
                    <button onClick={() => del(h._id)} style={{ ...styles.actionButton, ...styles.deleteButton }}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {herbs.length === 0 && (
                <tr>
                  <td colSpan="4" style={styles.noHerbs}>
                    No herbs found 🌱
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
