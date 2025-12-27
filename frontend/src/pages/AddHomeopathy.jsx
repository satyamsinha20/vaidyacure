import { useState, useEffect } from "react";
import api from "../api/axios";

export default function AddHomeopathy({ refresh, editData, setEditData, setShowForm }) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    benefit: "",
    sideEffect: "",
    health: "",
    symptoms: "",
    process: "",
    potency: "",
    imageFile: null,
    imageUrl: "",
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
        potency: editData.potency || "",
        imageFile: null,
        imageUrl: editData.imageUrl || "",
      });
    } else {
      resetForm();
    }
  }, [editData]);

  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      benefit: "",
      sideEffect: "",
      health: "",
      symptoms: "",
      process: "",
      potency: "",
      imageFile: null,
      imageUrl: "",
    });
  };

  const submit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();

      Object.keys(form).forEach((key) => {
        if (key !== "imageFile" && key !== "imageUrl" && form[key]) {
          formData.append(key, form[key]);
        }
      });

      if (form.imageFile) {
        formData.append("image", form.imageFile);
      } else if (form.imageUrl) {
        formData.append("imageUrl", form.imageUrl);
      }

      if (editData) {
        await api.put(`/homeopathy/${editData._id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setEditData(null);
      } else {
        await api.post("/homeopathy", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      refresh();
      resetForm();
      setShowForm(false);
    } catch (err) {
      console.error("Error saving remedy:", err);
    }
  };

  const handleCancel = () => {
    setEditData(null);
    resetForm();
    setShowForm(false);
  };

  return (
    <div className="bg-white shadow-xl rounded-xl p-6">
      <h2 className="text-2xl font-bold mb-4 text-teal-700">
        {editData ? "Edit Remedy" : "Add New Remedy"}
      </h2>

      <form onSubmit={submit} className="space-y-4">

        <div>
          <label className="block text-sm font-semibold mb-1">Remedy Name</label>
          <input
            className="w-full border rounded-lg p-2"
            placeholder="Enter remedy name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Description</label>
          <textarea
            className="w-full border rounded-lg p-2 h-24"
            placeholder="Enter description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Benefits (comma separated)</label>
          <input
            className="w-full border rounded-lg p-2"
            value={form.benefit}
            onChange={(e) => setForm({ ...form, benefit: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Side Effects</label>
          <input
            className="w-full border rounded-lg p-2"
            value={form.sideEffect}
            onChange={(e) => setForm({ ...form, sideEffect: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Health Category</label>
          <input
            className="w-full border rounded-lg p-2"
            value={form.health}
            onChange={(e) => setForm({ ...form, health: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Symptoms</label>
          <input
            className="w-full border rounded-lg p-2"
            value={form.symptoms}
            onChange={(e) => setForm({ ...form, symptoms: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Preparation / Usage Process</label>
          <textarea
            className="w-full border rounded-lg p-2 h-24"
            value={form.process}
            onChange={(e) => setForm({ ...form, process: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Potency</label>
          <input
            className="w-full border rounded-lg p-2"
            placeholder="e.g., 30C"
            value={form.potency}
            onChange={(e) => setForm({ ...form, potency: e.target.value })}
          />
        </div>

        {form.imageUrl && !form.imageFile && (
          <div>
            <label className="block text-sm font-semibold mb-1">Current Image</label>
            <img
              src={form.imageUrl}
              alt="Remedy"
              className="h-32 w-32 object-cover rounded-md"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold mb-1">Upload Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              setForm({ ...form, imageFile: e.target.files[0], imageUrl: "" })
            }
          />
        </div>

        <div className="flex gap-4">
          <button type="submit" className="bg-teal-600 text-white px-6 py-2 rounded-lg">
            {editData ? "Update Remedy" : "Save Remedy"}
          </button>
          <button type="button" onClick={handleCancel} className="bg-gray-400 text-white px-6 py-2 rounded-lg">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
