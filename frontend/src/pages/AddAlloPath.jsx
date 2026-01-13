import { useState, useEffect } from "react";
import api from "../api/axios";
import toast from "react-hot-toast";

export default function AddAllopath({ refresh, editData, setEditData, setShowForm }) {
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
      Object.keys(form).forEach(key => {
        if (key !== "imageFile" && key !== "imageUrl" && form[key]) {
          formData.append(key, form[key]);
        }
      });

      if (form.imageFile) formData.append("image", form.imageFile);
      else if (form.imageUrl) formData.append("imageUrl", form.imageUrl);

      if (editData) {
        await api.put(`/allopath/${editData._id}`, formData, { headers: { "Content-Type": "multipart/form-data" } });
        toast.success("Medicine updated 💊");
        setEditData(null);
      } else {
        await api.post("/allopath", formData, { headers: { "Content-Type": "multipart/form-data" } });
        toast.success("Medicine added 💊");
      }

      refresh();
      resetForm();
      setShowForm(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save medicine ❌");
    }
  };

  const handleCancel = () => {
    setEditData(null);
    resetForm();
    setShowForm(false);
  };

  return (
    <div className="bg-white shadow-xl rounded-xl p-4 sm:p-6 max-w-4xl mx-auto">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 text-pink-700 text-center sm:text-left">
        {editData ? "Edit Allopathic Medicine" : "Add New Allopathic Medicine"}
      </h2>

      <form onSubmit={submit} className="space-y-4">
        <input className="input w-full" placeholder="Medicine Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />

        <textarea className="input w-full h-24" placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input className="input w-full" placeholder="Benefits (comma separated)" value={form.benefit} onChange={e => setForm({ ...form, benefit: e.target.value })} />
          <input className="input w-full" placeholder="Health (general wellness)" value={form.health} onChange={e => setForm({ ...form, health: e.target.value })} />
        </div>

        <input className="input w-full" placeholder="Symptoms (comma separated)" value={form.symptoms} onChange={e => setForm({ ...form, symptoms: e.target.value })} required />

        <textarea className="input w-full h-20" placeholder="Process / Steps" value={form.process} onChange={e => setForm({ ...form, process: e.target.value })} required />

        <input className="input w-full" placeholder="Side Effects" value={form.sideEffect} onChange={e => setForm({ ...form, sideEffect: e.target.value })} />

        {form.imageUrl && !form.imageFile && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <label className="font-medium">Current Image</label>
            <img src={form.imageUrl} alt="Medicine" className="h-28 w-28 object-cover rounded-md border" />
          </div>
        )}

        <input type="file" accept="image/*" className="w-full" onChange={e => setForm({ ...form, imageFile: e.target.files[0], imageUrl: "" })} />

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button type="submit" className="bg-pink-600 text-white px-6 py-2 rounded-lg w-full sm:w-auto">
            {editData ? "Update" : "Save"}
          </button>
          <button type="button" onClick={handleCancel} className="bg-gray-400 text-white px-6 py-2 rounded-lg w-full sm:w-auto">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
