import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import AddHomeopathy from "./AddHomeopathy";
import toast, { Toaster } from "react-hot-toast";

// ===== CUSTOM STYLES =====
const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(to bottom right, #f0fdf4, #d1fae5)",
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
  addButton: { backgroundColor: "#0d9488" }, // teal
  uploadButton: { backgroundColor: "#7e22ce" }, // purple
  dashboardButton: { backgroundColor: "#4b5563" }, // gray
  tableContainer: {
    backgroundColor: "#fff",
    borderRadius: "1rem",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
    overflow: "hidden",
  },
  tableHeader: {
    backgroundColor: "#0d9488",
    color: "#fff",
    textAlign: "left",
  },
  tableHeaderCell: { padding: "1rem", borderRight: "1px solid #4ade80" },
  row: { height: "5rem", borderBottom: "1px solid #ccc" },
  rowGray: { backgroundColor: "#e0f2f1" },
  rowOrange: { backgroundColor: "#ffe4b5" },
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
  noRemedies: { textAlign: "center", padding: "1.5rem", color: "#999" },
  headerTitle: { fontSize: "1.5rem", fontWeight: "bold", color: "#0f766e", padding: "1rem" },
};

export default function Homeopathy() {
  const navigate = useNavigate();
  const [remedies, setRemedies] = useState([]);
  const [editData, setEditData] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    try {
      const res = await api.get("/homeopathy");
      setRemedies(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Load failed", err);
      toast.error("Failed to load remedies ❌");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const del = async (id) => {
    try {
      await api.delete(`/homeopathy/${id}`);
      toast.success("Remedy deleted ⚕️");
      load();
    } catch (err) {
      console.error("Delete failed", err);
      toast.error("Failed to delete remedy ❌");
    }
  };

  const downloadRemedies = async () => {
    try {
      const res = await api.get("/homeopathy/download", { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "homeopathy.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Download failed", err);
      toast.error("Failed to download Excel ❌");
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      await api.post("/homeopathy/bulk-upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Remedies uploaded successfully ⚕️");
      load();
    } catch (err) {
      console.error("Bulk upload failed", err);
      toast.error("Upload failed ❌");
    }
  };

  const handleEdit = (remedy) => {
    setEditData(remedy);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAddNew = () => {
    setEditData(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div style={styles.container}>
      <Toaster position="top-right" reverseOrder={false} />

      <div style={{ maxWidth: "1120px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "2.5rem" }}>
        {/* Buttons */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
          <button onClick={handleAddNew} style={{ ...styles.button, ...styles.addButton }}>
            + Add New Remedy
          </button>

          <input type="file" accept=".csv,.xlsx" id="bulkUploadHomeopathy" style={{ display: "none" }} onChange={handleFileUpload} />
          <button onClick={() => document.getElementById("bulkUploadHomeopathy").click()} style={{ ...styles.button, ...styles.uploadButton }}>
            ⬆ Upload CSV / Excel
          </button>

          <button onClick={downloadRemedies} style={{ ...styles.button, backgroundColor: "#f97316" }}>
            ⬇ Download Excel
          </button>

          <button onClick={() => navigate("/dashboard")} style={{ ...styles.button, ...styles.dashboardButton }}>
            Back To Dashboard
          </button>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div style={{ backgroundColor: "#fff", borderRadius: "1rem", boxShadow: "0 4px 6px rgba(0,0,0,0.1)", padding: "1.5rem" }}>
            <AddHomeopathy
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
            <h2 style={styles.headerTitle}>⚕️ Homeopathy Management</h2>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={styles.tableHeader}>
              <tr>
                <th style={styles.tableHeaderCell}>Name</th>
                <th style={styles.tableHeaderCell}>Image</th>
                <th style={styles.tableHeaderCell}>Symptoms</th>
                <th style={{ padding: "1rem", textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {remedies.map((r, idx) => (
                <tr key={r._id} style={{ ...styles.row, ...(idx % 2 === 0 ? styles.rowGray : styles.rowOrange) }}>
                  <td style={styles.cell}>{r.name}</td>
                  <td style={styles.cell}>
                    {r.imageUrl ? (
                      <img src={r.imageUrl} alt={r.name} style={styles.image} />
                    ) : (
                      <span style={{ color: "#999" }}>No image</span>
                    )}
                  </td>
                  <td style={styles.cell}>{Array.isArray(r.symptoms) ? r.symptoms.join(", ") : ""}</td>
                  <td style={{ padding: "1rem", textAlign: "center" }}>
                    <button onClick={() => handleEdit(r)} style={{ ...styles.actionButton, ...styles.editButton }}>Edit</button>
                    <button onClick={() => del(r._id)} style={{ ...styles.actionButton, ...styles.deleteButton }}>Delete</button>
                  </td>
                </tr>
              ))}
              {remedies.length === 0 && (
                <tr>
                  <td colSpan="4" style={styles.noRemedies}>
                    No remedies found ⚕️
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
