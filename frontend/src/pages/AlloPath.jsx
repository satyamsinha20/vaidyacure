import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import AddAllopath from "./AddAlloPath";
import toast, { Toaster } from "react-hot-toast";

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(to bottom right, #fff1f2, #ffe4e6)",
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
  addButton: { backgroundColor: "#db2777" },
  uploadButton: { backgroundColor: "#7e22ce" },
  dashboardButton: { backgroundColor: "#4b5563" },
  tableContainer: {
    backgroundColor: "#fff",
    borderRadius: "1rem",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
    overflowX: "auto", // ✅ mobile scroll
  },
  tableHeader: {
    backgroundColor: "#db2777",
    color: "#fff",
    textAlign: "left",
  },
  tableHeaderCell: {
    padding: "1rem",
    borderRight: "1px solid #f472b6",
    minWidth: "150px",
  },
  row: {
    height: "5rem",
    borderBottom: "1px solid #ccc",
  },
  rowGray: { backgroundColor: "#e5e7eb" },
  rowPink: { backgroundColor: "#ffe4e6" },
  cell: {
    padding: "1rem",
    borderRight: "1px solid #ccc",
    minWidth: "150px",
  },
  image: { height: "4rem", width: "4rem", objectFit: "cover", borderRadius: "0.375rem" },
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
  noData: { textAlign: "center", padding: "1.5rem", color: "#999" },
  headerTitle: { fontSize: "1.25rem", fontWeight: "bold", color: "#be185d", padding: "1rem" },
};

export default function Allopath() {
  const navigate = useNavigate();
  const [allopaths, setAllopaths] = useState([]);
  const [editData, setEditData] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    try {
      const res = await api.get("/allopath");
      setAllopaths(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error("Failed to load medicines");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const del = async (id) => {
    try {
      await api.delete(`/allopath/${id}`);
      toast.success("Medicine deleted 💊");
      load();
    } catch {
      toast.error("Failed to delete medicine");
    }
  };

  const downloadAllopaths = async () => {
    try {
      const res = await api.get("/allopath/download", { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "allopath.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error("Failed to download medicines");
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      await api.post("/allopath/bulk-upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Medicines uploaded successfully");
      load();
    } catch {
      toast.error("Upload failed");
    }
  };

  return (
    <div style={styles.container}>
      <Toaster position="top-right" />

      <div style={{ maxWidth: "1120px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "2rem" }}>
        {/* Buttons */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap", // ✅ responsive
            justifyContent: "flex-end",
            gap: "0.75rem",
          }}
        >
          <button onClick={() => setShowForm(true)} style={{ ...styles.button, ...styles.addButton }}>
            + Add New Medicine
          </button>

          <input type="file" accept=".csv,.xlsx" id="bulkUpload" hidden onChange={handleFileUpload} />
          <button onClick={() => document.getElementById("bulkUpload").click()} style={{ ...styles.button, ...styles.uploadButton }}>
            ⬆ Upload CSV / Excel
          </button>

          <button onClick={downloadAllopaths} style={{ ...styles.button, backgroundColor: "#ea580c" }}>
            ⬇ Download Excel
          </button>

          <button onClick={() => navigate("/dashboard")} style={{ ...styles.button, ...styles.dashboardButton }}>
            Back To Dashboard
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div style={{ backgroundColor: "#fff", borderRadius: "1rem", padding: "1.5rem" }}>
            <AddAllopath refresh={load} editData={editData} setEditData={setEditData} setShowForm={setShowForm} />
          </div>
        )}

        {/* Table */}
        <div style={styles.tableContainer}>
          <h2 style={styles.headerTitle}>💊 Allopathy Management</h2>

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={styles.tableHeader}>
              <tr>
                <th style={styles.tableHeaderCell}>Medicine</th>
                <th style={styles.tableHeaderCell}>Image</th>
                <th style={styles.tableHeaderCell}>Symptoms</th>
                <th style={{ padding: "1rem", textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {allopaths.map((m, i) => (
                <tr key={m._id} style={{ ...styles.row, ...(i % 2 ? styles.rowPink : styles.rowGray) }}>
                  <td style={styles.cell}>{m.name}</td>
                  <td style={styles.cell}>
                    {m.imageUrl ? <img src={m.imageUrl} alt="" style={styles.image} /> : "No image"}
                  </td>
                  <td style={styles.cell}>{m.symptoms?.join(", ")}</td>
                  <td style={{ textAlign: "center" }}>
                    <button onClick={() => setEditData(m)} style={{ ...styles.actionButton, ...styles.editButton }}>
                      Edit
                    </button>
                    <button onClick={() => del(m._id)} style={{ ...styles.actionButton, ...styles.deleteButton }}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {allopaths.length === 0 && (
                <tr>
                  <td colSpan="4" style={styles.noData}>
                    No medicines found 💊
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
