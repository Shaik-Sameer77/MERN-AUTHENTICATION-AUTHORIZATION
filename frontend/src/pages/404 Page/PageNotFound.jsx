import React from "react";
import { Link } from "react-router-dom";

const PageNotFound = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-6">
      <div className="text-center">
        {/* 404 text */}
        <h1 className="text-9xl font-extrabold text-indigo-600">404</h1>
        <p className="text-2xl font-semibold text-gray-800 mt-4">
          Oops! Page not found
        </p>
        <p className="text-gray-600 mt-2">
          The page you’re looking for doesn’t exist or was moved.
        </p>

        {/* Action buttons */}
        <div className="mt-6 flex justify-center gap-4">
          <Link
            to="/"
            className="px-6 py-3 rounded-lg bg-indigo-600 text-white font-medium shadow hover:bg-indigo-700 transition"
          >
            Go Home
          </Link>
          <Link
            to="/login"
            className="px-6 py-3 rounded-lg bg-gray-200 text-gray-800 font-medium shadow hover:bg-gray-300 transition"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PageNotFound;
