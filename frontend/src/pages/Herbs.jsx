import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import AddHerb from "./AddHerb";

export default function Herbs() {
  const navigate = useNavigate();

  const [herbs, setHerbs] = useState([]);
  const [editData, setEditData] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    try {
      const res = await api.get("/herbs");
      setHerbs(res.data);
    } catch (err) {
      console.error("Failed to load herbs", err);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const del = async (id) => {
    if (!window.confirm("Delete herb?")) return;
    try {
      await api.delete(`/herbs/${id}`);
      load();
    } catch (err) {
      console.error("Delete failed", err);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-6">
      <div className="max-w-7xl mx-auto space-y-10">

        <div className="flex justify-end space-x-2">
          <button
            onClick={handleAddNew}
            className="bg-green-600 text-white px-6 py-2 rounded-lg"
          >
            + Add New Herb
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

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-2xl font-bold text-green-700">
              🌿 Herbs Management
            </h2>
          </div>

          <table className="w-full text-sm">
            <thead className="bg-green-600 text-white">
              <tr>
                <th className="p-4 text-left">Herb</th>
                <th className="p-4 text-left">Symptoms</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {herbs.map((h) => (
                <tr key={h._id} className="border-b">
                  <td className="p-4">{h.name}</td>
                  <td className="p-4">{h.symptoms.join(", ")}</td>
                  <td className="p-4 text-center space-x-2">
                    <button
                      onClick={() => handleEdit(h)}
                      className="bg-blue-500 text-white px-3 py-1 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => del(h._id)}
                      className="bg-red-500 text-white px-3 py-1 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}

              {herbs.length === 0 && (
                <tr>
                  <td colSpan="3" className="text-center p-6 text-gray-400">
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
