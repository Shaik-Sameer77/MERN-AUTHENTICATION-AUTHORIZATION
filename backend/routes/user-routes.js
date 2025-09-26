import express from "express";
import {
    adminController,
  changePassword,
  forgotPassword,
  loginUser,
  logOutUser,
  myProfile,
  refreshCSRF,
  refreshToken,
  registerUser,
  resendOtp,
  resetPassword,
  uploadProfileImage,
  verifyOtp,
  verifyUser,
} from "../controllers/user-controller.js";
import { isAuth,authorizedAdmin } from "../middlewares/isAuth.js";
import { verifyCSRFToken } from "../config/csrfMiddleware.js";
import upload from "../middlewares/upload-middleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/verify/:token", verifyUser);
router.post("/verify", verifyOtp);
router.get("/me", isAuth, myProfile);
router.post("/refresh", refreshToken);
router.post("/logout", isAuth, verifyCSRFToken, logOutUser);
router.post("/refresh-csrf", isAuth, refreshCSRF);
router.get("/admin",isAuth,authorizedAdmin,adminController)

router.post("/resend-otp", resendOtp);
router.post("/forgot-password", forgotPassword); // public
router.post("/reset-password/:token", resetPassword); // via reset link
router.post("/change-password", isAuth,verifyCSRFToken, changePassword); // logged in required
router.post(
  "/upload-avatar",
  isAuth,verifyCSRFToken,
  upload.single("avatar"),
  uploadProfileImage
);
export default router;
