import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppData } from "../../context/AppContext.jsx";
import { CircleUserRound } from "lucide-react";

export default function HomePage() {
  const [isOpen, setIsOpen] = useState(false);
    const {  user, logoutUser } = AppData();
  const navigate = useNavigate();
  console.log(user)
  const handleLogout = () => {
    // clear tokens, session, etc.
    logoutUser(navigate)
    
  };

  const goToProfile = () => {
    navigate("/profile");
  };
  const goToChangePassword = () => {
    navigate("/changepassword");
  };
  

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="flex items-center justify-between bg-white shadow px-6 py-4">
        {/* Logo */}
        <div className="text-xl font-bold cursor-pointer">MyApp</div>

        {/* Avatar */}
        <div className="relative">
          {user?.avatar?.url ? (
            <img
              src={user?.avatar?.url}
              alt={user.name ? `${user.name}'s avatar` : "User's avatar"}
              className="w-10 h-10 rounded-full cursor-pointer border-2 border-gray-300"
              onClick={() => setIsOpen(!isOpen)}
            />
          ) : (
            <CircleUserRound
              className="w-10 h-10 rounded-full cursor-pointer border-2 border-gray-300 text-gray-400"
              onClick={() => setIsOpen(!isOpen)}
            />
          )}

          {/* Dropdown Menu */}
          {isOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg py-2 border">
              <button
                onClick={goToProfile}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                Profile
              </button>
              <button
                onClick={goToChangePassword}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                Change Password
              </button>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                Logout
              </button>

              {
                user && user.role === "admin" && (
                  <Link to={"/dashboard"}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                Dashboard
              </Link>
                )
              }
            </div>
          )}
        </div>
      </nav>

      {/* Body */}
      <main className="flex-1 flex items-center justify-center text-3xl font-semibold">
        Home
      </main>
    </div>
  );
}
