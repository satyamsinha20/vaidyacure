import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import AddHomeopathy from "./AddHomeopathy";

export default function Homeopathy() {
  const navigate = useNavigate();
  const [remedies, setRemedies] = useState([]);
  const [editData, setEditData] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    try {
      const res = await api.get("/homeopathy");
      setRemedies(res.data);
    } catch (err) {
      console.error("Failed to load homeopathy remedies", err);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const del = async (id) => {
    if (!window.confirm("Delete remedy?")) return;
    try {
      await api.delete(`/homeopathy/${id}`);
      load();
    } catch (err) {
      console.error("Delete failed", err);
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
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-teal-100 p-6">
      <div className="max-w-7xl mx-auto space-y-10">

        <div className="flex justify-end space-x-2">
          <button
            onClick={handleAddNew}
            className="bg-teal-600 text-white px-6 py-2 rounded-lg"
          >
            + Add New Remedy
          </button>

          <button
            onClick={() => navigate("/dashboard")}
            className="bg-gray-600 text-white px-6 py-2 rounded-lg"
          >
            Back To Dashboard
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
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

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-2xl font-bold text-teal-700">
              🧪 Homeopathy Management
            </h2>
          </div>

          <table className="w-full text-sm">
            <thead className="bg-teal-600 text-white">
              <tr>
                <th className="p-4 text-left">Remedy</th>
                <th className="p-4 text-left">Symptoms</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {remedies.map((r) => (
                <tr key={r._id} className="border-b">
                  <td className="p-4">{r.name}</td>
                  <td className="p-4">{r.symptoms.join(", ")}</td>
                  <td className="p-4 text-center space-x-2">
                    <button
                      onClick={() => handleEdit(r)}
                      className="bg-blue-500 text-white px-3 py-1 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => del(r._id)}
                      className="bg-red-500 text-white px-3 py-1 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}

              {remedies.length === 0 && (
                <tr>
                  <td colSpan="3" className="text-center p-6 text-gray-400">
                    No homeopathy remedies found 🧪
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
