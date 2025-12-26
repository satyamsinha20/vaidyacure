import { useNavigate } from "react-router-dom";

export default function Dashboard({ user, setUser }) {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.clear();
    setUser(null);
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-green-100 to-green-300 flex flex-col items-center justify-center p-6">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">
        Welcome {user}
      </h1>

      <p className="text-lg text-gray-700 mb-8 text-center max-w-md">
        VaidyaCure Admin Panel – Ayurveda & Herbal Management System
      </p>

      <div className="flex flex-wrap justify-center gap-4 mb-8">
        <button
          className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-transform transform hover:scale-105"
          onClick={() => navigate("/dashboard/herbs")}
        >
          Herbs
        </button>

        <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-transform transform hover:scale-105">
          Doctors
        </button>

        <button className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-transform transform hover:scale-105">
          Patients
        </button>

        <button className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-transform transform hover:scale-105">
          Reports
        </button>
      </div>

      <button
        className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition-transform transform hover:scale-105"
        onClick={logout}
      >
        Logout
      </button>
    </div>
  );
}
