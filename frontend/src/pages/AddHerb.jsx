import { useState, useEffect } from "react";
import api from "../api/axios";

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
        if (
          key !== "imageFile" &&
          key !== "imageUrl" &&
          form[key]
        ) {
          formData.append(key, form[key]);
        }
      });

      if (form.imageFile) {
        formData.append("image", form.imageFile);
      } else if (form.imageUrl) {
        formData.append("imageUrl", form.imageUrl);
      }

      if (editData) {
        await api.put(`/herbs/${editData._id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setEditData(null);
      } else {
        await api.post("/herbs", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      refresh();
      resetForm();
      setShowForm(false);
    } catch (err) {
      console.error("Error saving herb:", err);
    }
  };

  const handleCancel = () => {
    setEditData(null);
    resetForm();
    setShowForm(false);
  };

  return (
    <div className="bg-white shadow-xl rounded-xl p-6">
      <h2 className="text-2xl font-bold mb-4 text-green-700">
        {editData ? "Edit Herb" : "Add New Herb"}
      </h2>

      <form onSubmit={submit} className="space-y-4">
        <input
          className="w-full border rounded-lg p-2"
          placeholder="Herb Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />

        <textarea
          className="w-full border rounded-lg p-2 h-24"
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          required
        />

        <input
          className="w-full border rounded-lg p-2"
          placeholder="Benefits (comma separated)"
          value={form.benefit}
          onChange={(e) => setForm({ ...form, benefit: e.target.value })}
        />

        <input
          className="w-full border rounded-lg p-2"
          placeholder="Side Effects"
          value={form.sideEffect}
          onChange={(e) => setForm({ ...form, sideEffect: e.target.value })}
        />

        <input
          className="w-full border rounded-lg p-2"
          placeholder="Health"
          value={form.health}
          onChange={(e) => setForm({ ...form, health: e.target.value })}
        />

        <input
          className="w-full border rounded-lg p-2"
          placeholder="Symptoms"
          value={form.symptoms}
          onChange={(e) => setForm({ ...form, symptoms: e.target.value })}
        />

        <textarea
          className="w-full border rounded-lg p-2 h-24"
          placeholder="Process (each step new line)"
          value={form.process}
          onChange={(e) => setForm({ ...form, process: e.target.value })}
        />

        {form.imageUrl && !form.imageFile && (
          <div>
            <p className="text-sm text-gray-500">Current Image:</p>
            <img
              src={form.imageUrl}
              alt="Herb"
              className="h-32 w-32 object-cover rounded-md"
            />
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          onChange={(e) =>
            setForm({
              ...form,
              imageFile: e.target.files[0],
              imageUrl: "",
            })
          }
        />

        <div className="flex gap-4">
          <button
            type="submit"
            className="bg-green-600 text-white px-6 py-2 rounded-lg"
          >
            {editData ? "Update Herb" : "Save Herb"}
          </button>

          <button
            type="button"
            onClick={handleCancel}
            className="bg-gray-400 text-white px-6 py-2 rounded-lg"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
