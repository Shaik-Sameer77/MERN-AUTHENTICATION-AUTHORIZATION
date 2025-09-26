import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { server } from "../../main.jsx";
import { toast } from "react-toastify";
import { AppData } from "../../context/AppContext.jsx";

const VerifyOtp = () => {
  const [otp, setOtp] = useState("");
  const [btnLoading, setBtnLoading] = useState(false);
   const [resendTimer, setResendTimer] = useState(0); // countdown timer state
  const navigate = useNavigate();
  const { setIsAuth, setUser } = AppData();

  const handleSubmit = async (e) => {
    setBtnLoading(true);
    e.preventDefault();
    const email = localStorage.getItem("email");
    try {
      const { data } = await axios.post(
        `${server}/api/user/verify`,
        { email, otp },
        {
          withCredentials: true,
        }
      );
      toast.success(data.message);
      setIsAuth(true); // 🔑 manually mark user as authenticated
      setUser(data.user); // optional if backend returns user
      localStorage.removeItem("email");
      navigate("/");
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      setBtnLoading(false);
    }
  };

  const handleResend = async () => {
    const email = localStorage.getItem("email");
    if (!email) return toast.error("No email found, please login again");

    try {
      const { data } = await axios.post(
        `${server}/api/user/resend-otp`,
        { email },
        { withCredentials: true }
      );
      toast.success(data.message);

      // Start countdown timer (60 sec)
      setResendTimer(60);
    } catch (error) {
      toast.error(error.response?.data?.message || "Resend failed");
    }
  };

  // Countdown effect
  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendTimer]);

  useEffect(() => {
    const email = localStorage.getItem("email");
    if (!email) {
      navigate("/login"); // 🚫 stop direct access to /verify
    }
  }, [navigate]);

  return (
    <section className="text-gray-600 body-font">
      <div className="container px-5 py-24 mx-auto flex flex-wrap items-center">
        <div className="lg:w-3/5 md:w-1/2 md:pr-16 lg:pr-0 pr-0">
          <h1 className="title-font font-medium text-3xl text-gray-900">
            Slow-carb next level shoindcgoitch ethical authentic, poko scenester
          </h1>
          <p className="leading-relaxed mt-4">
            Poke slow-carb mixtape knausgaard, typewriter street art gentrify
            hammock starladder roathse. Craies vegan tousled etsy austin.
          </p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="lg:w-2/6 md:w-1/2 bg-gray-100 rounded-lg p-8 flex flex-col md:ml-auto w-full mt-10 md:mt-0"
        >
          <h2 className="text-gray-900 text-lg font-medium title-font mb-5">
            Verify using OTP
          </h2>
          <div className="relative mb-4">
            <label htmlFor="otp" className="leading-7 text-sm text-gray-600">
              OTP
            </label>
            <input
              type="number"
              id="otp"
              name="otp"
              className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
          </div>
          <button
            className="text-white bg-indigo-500 border-0 py-2 px-8 focus:outline-none hover:bg-indigo-600 rounded text-lg"
            disabled={btnLoading}
          >
            {btnLoading ? "Submitting..." : "Login"}
          </button>
          <Link to={"/login"} className="text-xs text-gray-500 mt-3">
            Go to login page
          </Link>
          {/* Resend OTP button with timer */}
          <div className="mt-3 text-sm">
            {resendTimer > 0 ? (
              <span className="text-gray-400">
                Resend OTP in {resendTimer}s
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                className="text-indigo-500 hover:underline"
              >
                Resend OTP
              </button>
            )}
          </div>
        </form>
      </div>
    </section>
  );
};

export default VerifyOtp;
