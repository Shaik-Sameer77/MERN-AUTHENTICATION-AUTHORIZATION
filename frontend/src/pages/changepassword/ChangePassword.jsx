// src/pages/changepassword/ChangePassword.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../apiInterceptor.js";
import { toast } from "react-toastify";
import { Eye, EyeOff } from "lucide-react";

// Reusable input field outside the component
const InputField = ({ label, value, onChange, show, toggle, field }) => (
  <div className="relative">
    <label className="block text-sm font-medium mb-1">{label}</label>
    <input
      type={show ? "text" : "password"}
      value={value}
      onChange={onChange}
      className="w-full border rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring focus:ring-blue-200"
      placeholder={label}
    />
    <button
      type="button"
      onClick={() => toggle(field)}
      className="absolute right-3 top-9 transform -translate-y-1/2 text-gray-500"
    >
      {show ? <EyeOff size={20} /> : <Eye size={20} />}
    </button>
  </div>
);

const ChangePassword = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState({
    old: false,
    new: false,
    confirm: false,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!oldPassword || !newPassword || !confirmPassword) {
      return toast.error("Please fill in all fields");
    }

    if (newPassword !== confirmPassword) {
      return toast.error("New password and confirm password do not match");
    }

    try {
      setLoading(true);
      const { data } = await api.post("/api/user/change-password", {
        oldPassword,
        newPassword,
      });

      toast.success(data.message || "Password updated successfully");
      setOldPassword("")
      setNewPassword("")
      setConfirmPassword("")
      // navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const togglePassword = (field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Change Password</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
            label="Old Password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            show={showPassword.old}
            toggle={togglePassword}
            field="old"
          />
          <InputField
            label="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            show={showPassword.new}
            toggle={togglePassword}
            field="new"
          />
          <InputField
            label="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            show={showPassword.confirm}
            toggle={togglePassword}
            field="confirm"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white rounded-lg py-2 hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
