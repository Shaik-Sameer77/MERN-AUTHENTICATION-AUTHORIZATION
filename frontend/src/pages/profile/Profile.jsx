import React, { useState, useEffect } from "react";
import { AppData } from "../../context/AppContext.jsx";
import api from "../../apiInterceptor.js";
import { toast } from "react-toastify";
import { CircleUserRound } from "lucide-react";

const Profile = () => {
  const { user, setUser } = AppData();
  const [uploading, setUploading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // ✅ Close dropdown on any click
  useEffect(() => {
    const handleClick = () => setIsOpen(false);

    if (isOpen) {
      document.addEventListener("click", handleClick);
    }

    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, [isOpen]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-gray-600 text-lg">Loading user profile...</p>
      </div>
    );
  }

  // Handle file upload
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      setUploading(true);
      const { data } = await api.post("/api/user/upload-avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Profile picture updated");
      setUser((prev) => ({
        ...prev,
        avatar: data.avatar,
      }));
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  // ✅ Prevent avatar click from closing immediately
  const handleAvatarClick = (e) => {
    e.stopPropagation(); // stops event bubbling
    setIsOpen((prev) => !prev);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white shadow-lg rounded-xl p-6 max-w-md w-full relative">
        <div className="flex flex-col items-center">
          {/* Avatar */}
          <div className="relative">
            {user?.avatar?.url ? (
              <img
                src={user?.avatar?.url}
                alt={user?.name ? `${user?.name}'s avatar` : "User's avatar"}
                className="w-24 h-24 rounded-full border-4 border-gray-200 shadow-md cursor-pointer"
                onClick={handleAvatarClick}
              />
            ) : (
              <CircleUserRound
                className="w-24 h-24 rounded-full border-4 border-gray-200 shadow-md cursor-pointer"
                onClick={handleAvatarClick}
              />
            )}
            <label
              htmlFor="avatar-upload"
              className="absolute bottom-0 right-0 bg-blue-600 text-white p-1 rounded-full cursor-pointer hover:bg-blue-700 transition"
            >
              {uploading ? "..." : "✎"}
            </label>
            <input
              type="file"
              id="avatar-upload"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Dropdown */}
          {isOpen && (
            <div className="absolute mt-2 bg-white shadow-md rounded-lg p-4 z-50">
              <p className="text-gray-700">Extra profile options here…</p>
            </div>
          )}

          {/* Username */}
          <h2 className="mt-4 text-2xl font-bold text-gray-800">
            {user.name || "Unknown User"}
          </h2>

          {/* Role */}
          <span className="text-sm text-gray-500 capitalize">
            {user.role || "user"}
          </span>

          {/* Email */}
          <p className="mt-2 text-gray-600">{user.email || "No email"}</p>
        </div>
         {/* Extra Info */}
        <div className="mt-6 space-y-3">
          <div className="flex justify-between text-gray-700">
            <span className="font-medium">Username:</span>
            <span>{user.name}</span>
          </div>
          <div className="flex justify-between text-gray-700">
            <span className="font-medium">Email:</span>
            <span>{user.email}</span>
          </div>
          <div className="flex justify-between text-gray-700">
            <span className="font-medium">Role:</span>
            <span className="capitalize">{user.role}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
