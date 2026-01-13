import { useState, useEffect } from "react";
import api from "../api/axios";
import toast from "react-hot-toast";

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

      if (form.imageFile) formData.append("image", form.imageFile);
      else if (form.imageUrl) formData.append("imageUrl", form.imageUrl);

      if (editData) {
        await api.put(`/herbs/${editData._id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Herb updated successfully 🌿");
        setEditData(null);
      } else {
        await api.post("/herbs", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Herb added successfully 🌿");
      }

      refresh();
      resetForm();
      setShowForm(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save herb ❌");
    }
  };

  const handleCancel = () => {
    setEditData(null);
    resetForm();
    setShowForm(false);
  };

  return (
    <div className="bg-white shadow-xl rounded-xl p-4 sm:p-6 max-w-4xl mx-auto">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 text-green-700 text-center sm:text-left">
        {editData ? "Edit Herb" : "Add New Herb"}
      </h2>

      <form onSubmit={submit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-semibold mb-1">Herb Name</label>
          <input
            className="w-full border rounded-lg p-2"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold mb-1">Description</label>
          <textarea
            className="w-full border rounded-lg p-2 h-24"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
          />
        </div>

        {/* Grid fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Benefits</label>
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
            <label className="block text-sm font-semibold mb-1">Health</label>
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
        </div>

        {/* Process */}
        <div>
          <label className="block text-sm font-semibold mb-1">Process</label>
          <textarea
            className="w-full border rounded-lg p-2 h-24"
            value={form.process}
            onChange={(e) => setForm({ ...form, process: e.target.value })}
          />
        </div>

        {/* Image */}
        {form.imageUrl && !form.imageFile && (
          <div className="flex flex-col sm:flex-row gap-3 items-start">
            <label className="text-sm font-semibold">Current Image</label>
            <img src={form.imageUrl} alt="Herb" className="h-28 w-28 rounded-md object-cover" />
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

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="submit"
            className="bg-green-600 text-white px-6 py-2 rounded-lg w-full sm:w-auto"
          >
            {editData ? "Update Herb" : "Save Herb"}
          </button>

          <button
            type="button"
            onClick={handleCancel}
            className="bg-gray-400 text-white px-6 py-2 rounded-lg w-full sm:w-auto"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
