import { useState, useEffect } from "react";
import axios from "axios";

export default function AddHerb({ refresh, editData, setEditData, setShowForm }) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    benefit: "",
    sideEffect: "",
    health: "",
    symptoms: "",
    process: "",
    imageFile: null,
    imageUrl: "", // existing image URL
  });

  useEffect(() => {
    if (editData) {
      setForm({
        ...editData,
        benefit: editData.benefit.join(","),
        sideEffect: editData.sideEffect.join(","),
        health: editData.health.join(","),
        symptoms: editData.symptoms.join(","),
        process: editData.process.join("\n"),
        imageFile: null,
        imageUrl: editData.imageUrl || "",
      });
    } else {
      setForm({
        name: "",
        description: "",
        benefit: "",
        sideEffect: "",
        health: "",
        symptoms: "",
        process: "",
        imageFile: null,
        imageUrl: "",
      });
    }
  }, [editData]);

  const submit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("benefit", form.benefit);
      formData.append("sideEffect", form.sideEffect);
      formData.append("health", form.health);
      formData.append("symptoms", form.symptoms);
      formData.append("process", form.process);

      // If user selected a new image, append it
      if (form.imageFile) {
        formData.append("image", form.imageFile);
      } else if (form.imageUrl) {
        // Otherwise, send the existing URL to backend
        formData.append("imageUrl", form.imageUrl);
      }

      if (editData) {
        await axios.put(
          `http://localhost:5000/api/herbs/${editData._id}`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        setEditData(null);
      } else {
        await axios.post(
          "http://localhost:5000/api/herbs",
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
      }

      refresh();
      setForm({
        name: "",
        description: "",
        benefit: "",
        sideEffect: "",
        health: "",
        symptoms: "",
        process: "",
        imageFile: null,
        imageUrl: "",
      });
      setShowForm(false);
    } catch (err) {
      console.error("Error saving herb:", err);
    }
  };

  const handleCancel = () => {
    setEditData(null);
    setForm({
      name: "",
      description: "",
      benefit: "",
      sideEffect: "",
      health: "",
      symptoms: "",
      process: "",
      imageFile: null,
      imageUrl: "",
    });
    setShowForm(false);
  };

  return (
    <div className="bg-white shadow-xl rounded-xl p-6">
      <h2 className="text-2xl font-bold mb-4 text-green-700">
        {editData ? "Edit Herb" : "Add New Herb"}
      </h2>

      <form onSubmit={submit} className="space-y-4">
        <input
          className="input w-full border border-gray-300 rounded-lg p-2"
          placeholder="Herb Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <textarea
          className="input w-full border border-gray-300 rounded-lg p-2 h-24"
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          required
        />
        <input
          className="input w-full border border-gray-300 rounded-lg p-2"
          placeholder="Benefits (comma separated)"
          value={form.benefit}
          onChange={(e) => setForm({ ...form, benefit: e.target.value })}
        />
        <input
          className="input w-full border border-gray-300 rounded-lg p-2"
          placeholder="Side Effects"
          value={form.sideEffect}
          onChange={(e) => setForm({ ...form, sideEffect: e.target.value })}
        />
        <input
          className="input w-full border border-gray-300 rounded-lg p-2"
          placeholder="Health"
          value={form.health}
          onChange={(e) => setForm({ ...form, health: e.target.value })}
        />
        <input
          className="input w-full border border-gray-300 rounded-lg p-2"
          placeholder="Symptoms"
          value={form.symptoms}
          onChange={(e) => setForm({ ...form, symptoms: e.target.value })}
        />
        <textarea
          className="input w-full border border-gray-300 rounded-lg p-2 h-24"
          placeholder="Process (each step new line)"
          value={form.process}
          onChange={(e) => setForm({ ...form, process: e.target.value })}
        />

        {/* Show existing image if available */}
        {form.imageUrl && !form.imageFile && (
          <div className="mb-2">
            <p className="text-sm text-gray-500">Current Image:</p>
            <img
              src={form.imageUrl}
              alt="Current Herb"
              className="h-32 w-32 object-cover rounded-md"
            />
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          onChange={(e) =>
            setForm({ ...form, imageFile: e.target.files[0], imageUrl: "" })
          }
        />

        <div className="flex space-x-4 mt-4">
          <button
            type="submit"
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
          >
            {editData ? "Update Herb" : "Save Herb"}
          </button>

          <button
            type="button"
            onClick={handleCancel}
            className="bg-gray-400 text-white px-6 py-2 rounded-lg hover:bg-gray-500"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
