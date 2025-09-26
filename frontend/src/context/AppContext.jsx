import React, { createContext, useContext, useEffect, useState } from "react";
import { server } from "../main.jsx";
import api from "../apiInterceptor.js";
import { toast } from "react-toastify";

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  // fetch logged in user
  async function fetchUser() {
    try {
      const { data } = await api.get(`/api/user/me`);
      console.log(data)
      setUser(data.user);
      setIsAuth(true);
    } catch (error) {
      console.log("fetchUser error:", error.response?.data || error.message);
      setUser(null)
      setIsAuth(false)
    } finally {
      setLoading(false);
    }
  }

  // logout user
async function logoutUser(navigate) {
  try {
    // The apiInterceptor is configured to automatically attach the CSRF token,
    // so the manual retrieval and attachment are no longer necessary.
    const { data } = await api.post(`/api/user/logout`);

    toast.success(data.message);
    setIsAuth(false);
    setUser(null);
    navigate("/login");
  } catch (error) {
    console.error("logoutUser failed:", error.response?.data || error.message);
    toast.error(error.response?.data?.message || "Something went wrong");
  }
}

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AppContext.Provider
      value={{ user, setUser, isAuth, setIsAuth, loading, logoutUser }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const AppData = () => {
  const context = useContext(AppContext);

  if (!context) throw new Error("AppData must be used within an AppProvider");
  return context;
};
