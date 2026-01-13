import { useNavigate } from "react-router-dom";

export default function Dashboard({ user, setUser }) {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.clear();
    setUser(null);
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-green-100 to-green-300 flex flex-col items-center justify-center px-4 py-6">
      
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-3 text-center">
        Welcome {user}
      </h1>

      <p className="text-base sm:text-lg text-gray-700 mb-8 text-center max-w-md px-2">
        VaidyaCure Admin Panel – Ayurveda & Herbal Management System
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-10 w-full max-w-3xl">
        <button
          className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-transform hover:scale-105 w-full"
          onClick={() => navigate("/dashboard/herbs")}
        >
          Herbs
        </button>

        <button
          className="bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-transform hover:scale-105 w-full"
          onClick={() => navigate("/dashboard/allopath")}
        >
          Allopath
        </button>

        <button
          className="bg-teal-500 hover:bg-teal-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-transform hover:scale-105 w-full"
          onClick={() => navigate("/dashboard/homeopathy")}
        >
          Homeopathy
        </button>

        <button
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-transform hover:scale-105 w-full"
        >
          Doctors
        </button>

        <button
          className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-transform hover:scale-105 w-full"
        >
          Patients
        </button>

        <button
          className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-transform hover:scale-105 w-full"
        >
          Reports
        </button>

        <button
          className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-transform hover:scale-105 w-full sm:col-span-2 md:col-span-1"
          onClick={() => navigate("/dashboard/feedback")}
        >
          Feedback
        </button>
      </div>

      <button
        className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-8 rounded-lg shadow-md transition-transform hover:scale-105"
        onClick={logout}
      >
        Logout
      </button>
    </div>
  );
}
