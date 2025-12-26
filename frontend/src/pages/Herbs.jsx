import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AddHerb from "./AddHerb";

export default function Herbs() {
  const navigate = useNavigate(); // ✅ Moved inside the component

  const [herbs, setHerbs] = useState([]);
  const [editData, setEditData] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    try {
      const res = await axios.get("http://172.20.10.10:5000/api/herbs");
      console.log(res.data);
      setHerbs(res.data);
    } catch (error) {
      console.error("Failed to load herbs:", error);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const del = async (id) => {
    if (!window.confirm("Delete herb?")) return;
    try {
      await axios.delete(`http://172.20.10.10:5000/api/herbs/${id}`);
      load();
    } catch (error) {
      console.error("Failed to delete herb:", error);
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

        {/* Add New Herb Button */}
        <div className="flex justify-end space-x-2">
          <button
            onClick={handleAddNew}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
          >
            + Add New Herb
          </button>
          <button
            className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition"
            onClick={() => navigate("/dashboard")}
          >
            Back To Dashboard
          </button>
        </div>

        {/* Add / Edit Herb Form */}
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

        {/* Herbs Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-2xl font-bold text-green-700">🌿 Herbs Management</h2>
            <p className="text-sm text-gray-500">Manage all herbal records here</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-green-600 text-white">
                <tr>
                  <th className="p-4 text-left">Herb Name</th>
                  <th className="p-4 text-left">Symptoms</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                {herbs.length === 0 && (
                  <tr>
                    <td colSpan="3" className="text-center py-10 text-gray-400">
                      No herbs found 🌱
                    </td>
                  </tr>
                )}

                {herbs.map((h, index) => (
                  <tr
                    key={h._id}
                    className={`border-b hover:bg-green-50 transition ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td className="p-4 font-medium text-gray-800">{h.name}</td>
                    <td className="p-4 text-gray-600">{h.symptoms.join(", ")}</td>
                    <td className="p-4 text-center space-x-2">
                      <button
                        onClick={() => handleEdit(h)}
                        className="px-4 py-1.5 rounded-full bg-blue-500 text-white text-xs font-semibold hover:bg-blue-600 transition"
                      >
                        ✏ Edit
                      </button>

                      <button
                        onClick={() => del(h._id)}
                        className="px-4 py-1.5 rounded-full bg-red-500 text-white text-xs font-semibold hover:bg-red-600 transition"
                      >
                        🗑 Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
