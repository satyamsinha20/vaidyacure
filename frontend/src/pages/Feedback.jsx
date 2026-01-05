import { useEffect, useState } from "react";
import api from "../api/axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"; // default styles

export default function Feedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [filters, setFilters] = useState({ name: "", email: "", date: null });
  const [filteredFeedbacks, setFilteredFeedbacks] = useState([]);

  // Fetch feedbacks
  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const res = await api.get("/feedback");
        const sorted = res.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setFeedbacks(sorted);
        setFilteredFeedbacks(sorted);
      } catch (error) {
        console.error("Error fetching feedbacks:", error);
      }
    };
    fetchFeedbacks();
  }, []);

  // Apply filters
  useEffect(() => {
    const filtered = feedbacks.filter((fb) => {
      const matchesName = fb.name.toLowerCase().includes(filters.name.toLowerCase());
      const matchesEmail = fb.email.toLowerCase().includes(filters.email.toLowerCase());
      const matchesDate = filters.date
        ? new Date(fb.createdAt).toDateString() === filters.date.toDateString()
        : true;
      return matchesName && matchesEmail && matchesDate;
    });
    setFilteredFeedbacks(filtered);
  }, [filters, feedbacks]);

  // Download Excel
  const downloadExcel = async () => {
    try {
      const res = await api.get("/feedback/download", { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "feedbacks.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error downloading Excel:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Back to Dashboard */}
      <div className="mb-4">
        <button
          onClick={() => window.location.href = "/dashboard"}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg shadow hover:bg-gray-300 transition flex items-center gap-2"
        >
          ← Back to Dashboard
        </button>
      </div>

      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
        💬 User Feedbacks
      </h1>

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div className="flex flex-wrap gap-4">
          <input
            type="text"
            placeholder="Search by Name"
            value={filters.name}
            onChange={(e) => setFilters({ ...filters, name: e.target.value })}
            className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm hover:shadow-md placeholder-gray-400"
          />
          <input
            type="text"
            placeholder="Search by Email"
            value={filters.email}
            onChange={(e) => setFilters({ ...filters, email: e.target.value })}
            className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm hover:shadow-md placeholder-gray-400"
          />
          {/* React DatePicker */}
          <div className="w-48">
            <DatePicker
              selected={filters.date}
              onChange={(date) => setFilters({ ...filters, date })}
              placeholderText="Select Date"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm hover:shadow-md"
              dateFormat="yyyy-MM-dd"
              isClearable
              showPopperArrow={false}
              autoComplete="off"
            />
          </div>
        </div>

        <button
          onClick={downloadExcel}
          className="px-5 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition flex items-center gap-2"
        >
          ⬇ Download Excel
        </button>
      </div>

      {/* Feedback Table */}
      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-indigo-100 text-indigo-700 uppercase text-sm sticky top-0">
            <tr>
              <th className="py-3 px-4 text-left">S.No.</th>
              <th className="py-3 px-4 text-left">Name</th>
              <th className="py-3 px-4 text-left">Email</th>
              <th className="py-3 px-4 text-left">Feedback</th>
              <th className="py-3 px-4 text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredFeedbacks.length ? (
              filteredFeedbacks.map((fb, index) => (
                <tr key={fb._id} className="border-b hover:bg-indigo-50 transition">
                  <td className="py-2 px-4">{index + 1}</td>
                  <td className="py-2 px-4 font-medium">{fb.name}</td>
                  <td className="py-2 px-4">{fb.email}</td>
                  <td className="py-2 px-4">{fb.feedback}</td>
                  <td className="py-2 px-4">{new Date(fb.createdAt).toLocaleString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-6 text-gray-400">
                  No feedback found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
