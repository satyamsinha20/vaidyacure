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
    padding: "1rem",
    fontFamily: "Arial, sans-serif",
  },
  button: {
    padding: "0.5rem 1.5rem",
    borderRadius: "0.5rem",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    fontWeight: "bold",
    whiteSpace: "nowrap",
  },
  addButton: { backgroundColor: "#16a34a" },
  uploadButton: { backgroundColor: "#7e22ce" },
  dashboardButton: { backgroundColor: "#4b5563" },
  tableContainer: {
    backgroundColor: "#fff",
    borderRadius: "1rem",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
    overflowX: "auto", // ✅ MOBILE FIX
  },
  tableHeader: {
    backgroundColor: "#16a34a",
    color: "#fff",
    textAlign: "left",
  },
  tableHeaderCell: {
    padding: "1rem",
    borderRight: "1px solid #4ade80",
    minWidth: "150px",
  },
  row: {
    height: "5rem",
    borderBottom: "1px solid #ccc",
  },
  rowGray: { backgroundColor: "#e0e0e0" },
  rowOrange: { backgroundColor: "#ffd8a8" },
  cell: {
    padding: "1rem",
    borderRight: "1px solid #ccc",
    minWidth: "150px",
  },
  image: {
    height: "4rem",
    width: "4rem",
    objectFit: "cover",
    borderRadius: "0.375rem",
  },
  actionButton: {
    padding: "0.25rem 0.75rem",
    borderRadius: "0.25rem",
    border: "none",
    color: "#fff",
    cursor: "pointer",
    margin: "0.25rem",
    fontWeight: "bold",
  },
  editButton: { backgroundColor: "#3b82f6" },
  deleteButton: { backgroundColor: "#ef4444" },
  noHerbs: {
    textAlign: "center",
    padding: "1.5rem",
    color: "#999",
  },
  headerTitle: {
    fontSize: "1.25rem",
    fontWeight: "bold",
    color: "#15803d",
    padding: "1rem",
  },
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
    } catch {
      toast.error("Failed to load herbs");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const del = async (id) => {
    try {
      await api.delete(`/herbs/${id}`);
      toast.success("Herb deleted 🌿");
      load();
    } catch {
      toast.error("Failed to delete herb");
    }
  };

  const downloadHerbs = async () => {
    try {
      const res = await api.get("/herbs/download", { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "herbs.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      toast.error("Failed to download ❌");
    }
  };

  return (
    <div style={styles.container}>
      <Toaster position="top-right" />

      <div
        style={{
          maxWidth: "1120px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "2rem",
        }}
      >
        {/* Buttons */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap", // ✅ MOBILE FIX
            gap: "0.75rem",
            justifyContent: "flex-end",
          }}
        >
          <button onClick={() => setShowForm(true)} style={{ ...styles.button, ...styles.addButton }}>
            + Add New Herb
          </button>

          <input type="file" accept=".csv,.xlsx" id="bulkUpload" hidden />
          <button
            onClick={() => document.getElementById("bulkUpload").click()}
            style={{ ...styles.button, ...styles.uploadButton }}
          >
            ⬆ Upload CSV / Excel
          </button>

          <button onClick={downloadHerbs} style={{ ...styles.button, backgroundColor: "#ea580c" }}>
            ⬇ Download Herbs
          </button>

          <button onClick={() => navigate("/dashboard")} style={{ ...styles.button, ...styles.dashboardButton }}>
            Back To Dashboard
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div style={{ backgroundColor: "#fff", borderRadius: "1rem", padding: "1.5rem" }}>
            <AddHerb refresh={load} editData={editData} setEditData={setEditData} setShowForm={setShowForm} />
          </div>
        )}

        {/* Table */}
        <div style={styles.tableContainer}>
          <h2 style={styles.headerTitle}>🌿 Herbs Management</h2>
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
              {herbs.map((h, i) => (
                <tr key={h._id} style={{ ...styles.row, ...(i % 2 ? styles.rowOrange : styles.rowGray) }}>
                  <td style={styles.cell}>{h.name}</td>
                  <td style={styles.cell}>
                    {h.imageUrl ? <img src={h.imageUrl} alt="" style={styles.image} /> : "No image"}
                  </td>
                  <td style={styles.cell}>{h.symptoms?.join(", ")}</td>
                  <td style={{ textAlign: "center" }}>
                    <button onClick={() => setEditData(h)} style={{ ...styles.actionButton, ...styles.editButton }}>
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
