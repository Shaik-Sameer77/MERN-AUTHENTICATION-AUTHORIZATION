import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/home/Home.jsx";
import Login from "./pages/login/Login.jsx";
import Register from "./pages/register/Register.jsx";
import { ToastContainer } from "react-toastify";
import VerifyOtp from "./pages/verifyOtp/VerifyOtp.jsx";
import { AppData } from "./context/AppContext.jsx";
import Loading from "./Loading.jsx";
import Verify from "./pages/verify/verify.jsx";
import ForgotPassword from "./pages/forgotpassword/ForgotPassword.jsx";
import Dashboard from "./pages/dashboard/Dashboard.jsx";
import ResetPassword from "./pages/resetpassword/ResetPassword.jsx";
import ChangePassword from "./pages/changepassword/ChangePassword.jsx";
import Profile from "./pages/profile/Profile.jsx";
import PageNotFound from "./pages/404 Page/PageNotFound.jsx";

const App = () => {
  const { isAuth, loading } = AppData();
  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <BrowserRouter>
          <Routes>
            <Route path="/" element={isAuth ? <Home /> : <Login />} />
            <Route
              path="/dashboard"
              element={isAuth ? <Dashboard /> : <Login />}
            />
            <Route
              path="/login"
              element={isAuth ? <Navigate to="/" replace /> : <Login />}
            />
            <Route
              path="/register"
              element={isAuth ? <Navigate to="/" replace /> : <Register />}
            />
            <Route
              path="/verify-otp"
              element={isAuth ? <Navigate to="/" replace /> : <VerifyOtp />}
            />
            <Route
              path="/forgot-password"
              element={
                isAuth ? <Navigate to="/" replace /> : <ForgotPassword />
              }
            />
            <Route
              path="/reset-password/:token"
              element={isAuth ? <Navigate to="/" replace /> : <ResetPassword />}
            />
            <Route
              path="/token/:token"
              element={isAuth ? <Navigate to="/" replace /> : <Verify />}
            />
            <Route path="/profile" element={isAuth ? <Profile /> : <Login />} />
            <Route
              path="/changepassword"
              element={isAuth ? <ChangePassword /> : <Login />}
            />
            <Route path="*" element={<PageNotFound />} />
          </Routes>
          <ToastContainer />
        </BrowserRouter>
      )}
    </>
  );
};

export default App;
