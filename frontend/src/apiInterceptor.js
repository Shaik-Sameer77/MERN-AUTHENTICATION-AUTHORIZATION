import axios from "axios";

const server = import.meta.env.VITE_SERVER_URL;

// helper: get cookie
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
};

const api = axios.create({
  baseURL: server,
  withCredentials: true,
});

// attach csrf token automatically for post/put/delete
api.interceptors.request.use(
  (config) => {
    if (
      config.method === "post" ||
      config.method === "put" ||
      config.method === "delete"
    ) {
      const csrfToken = getCookie("csrfToken");
      if (csrfToken) {
        config.headers["x-csrf-token"] = csrfToken;
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

      // handle session refresh
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
