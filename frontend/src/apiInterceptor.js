import axios from "axios";

const server = import.meta.env.VITE_SERVER_URL;

/**
 * Robust helper function to extract a non-httpOnly cookie value by name.
 * This is crucial for the "Double Submit Cookie" pattern, where the token
 * must be read by JavaScript from the cookie and set as a custom header.
 */
const getCookie = (name) => {
  if (typeof document === 'undefined' || !document.cookie) return null;
  
  // Cleanly separate and search for the cookie
  const parts = document.cookie.split('; ');
  for (const part of parts) {
    if (part.startsWith(`${name}=`)) {
      // Use decodeURIComponent to handle potential special characters in the cookie value
      return decodeURIComponent(part.substring(name.length + 1));
    }
  }
  return null;
};

const api = axios.create({
  baseURL: server,
  withCredentials: true,
});

// attach csrf token automatically for post/put/delete
api.interceptors.request.use(
  (config) => {
    // We also include 'patch' method for completeness, as it's a state-changing method
    const requiresCsrf = ["post", "put", "delete", "patch"].includes(config.method);

    if (requiresCsrf) {
      const csrfToken = getCookie("csrfToken");
      if (csrfToken) {
        // This is the critical step: reading the cookie and setting the header
        config.headers["x-csrf-token"] = csrfToken;
      } else {
        // This warning indicates the frontend logic failed to read the cookie
        console.warn("CSRF Token not found in cookies, x-csrf-token header will be missing.");
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let isRefreshingCSRFToken = false;
let failedQueue = [];
let csrfFailedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach((prom) =>
    error ? prom.reject(error) : prom.resolve()
  );
  failedQueue = [];
};

const processCSRFQueue = (error) => {
  csrfFailedQueue.forEach((prom) =>
    error ? prom.reject(error) : prom.resolve()
  );
  csrfFailedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // handle csrf errors
    if (error.response?.status === 403 && !originalRequest._retry) {
      const errorCode = error.response.data?.code || "";

      if (errorCode.startsWith("CSRF_")) {
        if (isRefreshingCSRFToken) {
          return new Promise((resolve, reject) => {
            csrfFailedQueue.push({ resolve, reject });
          }).then(() => api(originalRequest));
        }
        originalRequest._retry = true;
        isRefreshingCSRFToken = true;

        try {
          await api.post("/api/user/refresh-csrf");
          const newToken = getCookie("csrfToken");
          
          if (newToken) {
            originalRequest.headers["x-csrf-token"] = newToken;
          }
          processCSRFQueue(null);
          return api(originalRequest);
        } catch (err) {
          processCSRFQueue(err);
          return Promise.reject(err);
        } finally {
          isRefreshingCSRFToken = false;
        }
      }

      // handle session refresh (for 403 responses that aren't specific CSRF errors)
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => api(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await api.post("/api/user/refresh");
        processQueue(null);
        return api(originalRequest);
      } catch (err) {
        processQueue(err);
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;