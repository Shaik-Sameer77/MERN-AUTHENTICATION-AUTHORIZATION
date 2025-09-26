import sanitize from "mongo-sanitize";
import TryCatch from "../middlewares/TryCatch.js";
import { loginSchema, registerSchema } from "../config/zod.js";
import { redisClient } from "../index.js";
import { User } from "../models/user-model.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import sendMail from "../config/sendMail.js";
import { getOtpHtml, getVerifyEmailHtml } from "../config/html.js";
import {
  generateAccessToken,
  generateToken,
  revokeRefreshToken,
  verifyRefreshToken,
} from "../config/generateToken.js";
import {
  generateCSRFToken,
  revokeCSRFTOKEN,
} from "../config/csrfMiddleware.js";
import fs from "fs";
import { uploadToCloudinary, deleteFromCloudinary } from "../helper/cloudinaryHelper.js";


export const registerUser = TryCatch(async (req, res) => {
  const sanitizedBody = sanitize(req.body);
  const validation = registerSchema.safeParse(sanitizedBody);

  if (!validation.success) {
    const zodError = validation.error;
    let firstErrorMessage = "Validation failed";
    let allErrors = [];

    if (zodError?.issues && Array.isArray(zodError.issues)) {
      allErrors = zodError.issues.map((issue) => ({
        field: issue.path ? issue.path.join(".") : "unknown",
        message: issue.message || "Validation Error",
        code: issue.code,
      }));
      firstErrorMessage = allErrors[0]?.message || "Validation Error";
    }
    return res.status(400).json({
      message: firstErrorMessage,
      error: allErrors,
    });
  }
  const { name, email, password } = validation.data;

  const rateLimitKey = `register-rate-limit:${req.ip}:${email}`;

  if (await redisClient.get(rateLimitKey)) {
    return res.status(429).json({
      message: "Too many requests, try again later",
    });
  }

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    res.status(400).json({
      message: "user already exists",
    });
  }

  const hashPassword = await bcrypt.hash(password, 10);

  const verifyToken = crypto.randomBytes(32).toString("hex");

  const verifyKey = `verify:${verifyToken}`;

  const datatoStore = JSON.stringify({
    name,
    email,
    password: hashPassword,
  });

  await redisClient.set(verifyKey, datatoStore, { EX: 300 });

  const subject = "verify your email for account creation";

  const html = getVerifyEmailHtml({ email, token: verifyToken });

  await sendMail({ email, subject, html });

  await redisClient.set(rateLimitKey, "true", { EX: 60 });

  res.json({
    message:
      "If your email is valid, a verification has been sent. It will expire in 5 minutes",
  });
});

export const verifyUser = TryCatch(async (req, res) => {
  const { token } = req.params;

  if (!token) {
    return res.status(400).json({
      message: "Verification token is required",
    });
  }

  const verifyKey = `verify:${token}`;

  const userDataJson = await redisClient.get(verifyKey);

  if (!userDataJson) {
    return res.status(400).json({
      message: "Verification link is expired",
    });
  }

  await redisClient.del(verifyKey);

  const userData = JSON.parse(userDataJson);

  const existingUser = await User.findOne({ email: userData.email });

  if (existingUser) {
    res.status(400).json({
      message: "user already exists",
    });
  }

  const newUser = await User.create({
    name: userData.name,
    email: userData.email,
    password: userData.password,
  });

  res.status(201).json({
    message: "Email verified successfully! your account has been created ",
    user: { _id: newUser._id, name: newUser.name, email: newUser.email },
  });
});

export const loginUser = TryCatch(async (req, res) => {
  const sanitizedBody = sanitize(req.body);
  const validation = loginSchema.safeParse(sanitizedBody);

  if (!validation.success) {
    const zodError = validation.error;
    let firstErrorMessage = "Validation failed";
    let allErrors = [];

    if (zodError?.issues && Array.isArray(zodError.issues)) {
      allErrors = zodError.issues.map((issue) => ({
        field: issue.path ? issue.path.join(".") : "unknown",
        message: issue.message || "Validation Error",
        code: issue.code,
      }));
      firstErrorMessage = allErrors[0]?.message || "Validation Error";
    }
    return res.status(400).json({
      message: firstErrorMessage,
      error: allErrors,
    });
  }
  const { email, password } = validation.data;

  const rateLimitKey = `login-rate-limit:${req.ip}:${email}`;

  if (await redisClient.get(rateLimitKey)) {
    return res.status(429).json({
      message: "Too many requests, try again later",
    });
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(400).json({
      message: "Invaild credentials",
    });
  }
  const comparePassword = await bcrypt.compare(password, user.password);

  if (!comparePassword) {
    return res.status(400).json({
      message: "Invalid password",
    });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const otpKey = `otp:${email}`;

  await redisClient.set(otpKey, JSON.stringify(otp), { EX: 300 });

  const subject = "Otp for verification ";

  const html = getOtpHtml({ email, otp });

  await sendMail({ email, subject, html });

  await redisClient.set(rateLimitKey, "true", { EX: 60 });

  res.json({
    message: "Otp has sent to your email, it will be valid for 5 min",
  });
});

export const verifyOtp = TryCatch(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({
      message: "Please provide all details",
    });
  }

  const otpKey = `otp:${email}`;

  const storedOtpString = await redisClient.get(otpKey);

  if (!storedOtpString) {
    return res.status(400).json({
      message: "otp expired",
    });
  }

  const storedOtp = JSON.parse(storedOtpString);

  if (storedOtp !== otp) {
    return res.status(400).json({
      message: "Invalid Otp",
    });
  }

  await redisClient.del(otpKey);

  let user = await User.findOne({ email });

  const tokenData = await generateToken(user._id, res);

  res.status(200).json({
    message: `Welcome ${user.name}`,
    user,
    sessionInfo: {
      sessionId: tokenData.sessionId,
      loginTime: new Date().toISOString(),
      csrfToken: tokenData.csrfToken,
    },
  });
});

// resend otp
export const resendOtp = TryCatch(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      message: "Email is required",
    });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({
      message: "User not found",
    });
  }

  // Rate limit: prevent spamming OTP
  const rateLimitKey = `resend-otp-rate-limit:${req.ip}:${email}`;
  if (await redisClient.get(rateLimitKey)) {
    return res.status(429).json({
      message: "Too many requests, please try again after 1 minute",
    });
  }

  // Generate new OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpKey = `otp:${email}`;

  await redisClient.set(otpKey, JSON.stringify(otp), { EX: 300 }); // 5 min expiry

  // Send email
  const subject = "Your new OTP for verification";
  const html = getOtpHtml({ email, otp });

  await sendMail({ email, subject, html });

  // Set rate limit for 1 minute
  await redisClient.set(rateLimitKey, "true", { EX: 60 });

  return res.json({
    message:
      "A new OTP has been sent to your email. It will expire in 5 minutes.",
  });
});

// AdminController
export const adminController = TryCatch(async (req, res) => {
  res.json({
    message: "Hello Admin",
  });
});

export const myProfile = TryCatch(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  if (!user) return res.status(404).json({ message: "User not found" });

  const sessionId = req.sessionId;
  const sessionData = await redisClient.get(`session:${sessionId}`);
  let sessionInfo = null;

  if (sessionData) {
    const parsedSession = JSON.parse(sessionData);
    sessionInfo = {
      sessionId,
      loginTime: parsedSession.createdAt,
      lastActivity: parsedSession.lastActivity,
    };
  }

  const cleanUser = user.toObject();
  if (!cleanUser.avatar?.url) {
    cleanUser.avatar = null;
  }

  res.json({ user: cleanUser, sessionInfo });
});


export const refreshToken = TryCatch(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({
      message: "Invalid refresh token",
    });
  }

  const decode = await verifyRefreshToken(refreshToken);

  if (!decode) {
    res.clearCookie("refreshToken");
    res.clearCookie("accessToken");
    res.clearCookie("csrfToken");
    return res.status(401).json({
      message: "Session Expired. Please login",
    });
  }

  generateAccessToken(decode.id, decode.sessionId, res);
  await generateCSRFToken(decode.id,res)
  res.status(200).json({
    message: "token refreshed",
  });
});

export const logOutUser = TryCatch(async (req, res) => {
  const userId = req.user._id;
  await revokeRefreshToken(userId);
  await revokeCSRFTOKEN(userId);

  res.clearCookie("refreshToken");
  res.clearCookie("accessToken");
  res.clearCookie("csrfToken");

  await redisClient.del(`user:${userId}`);

  res.json({
    message: "Logged out successfully",
  });
});

//

export const refreshCSRF = TryCatch(async (req, res) => {
  const userId = req.user._id;

  const newCSRFToken = await generateCSRFToken(userId, res);

  res.json({
    message: "CSRF token refreshed",
    csrfToken: newCSRFToken,
  });
});

/**
 * Change password (user must be logged in)
 */
export const changePassword = TryCatch(async (req, res) => {
  const userId = req.user._id;
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ message: "Please provide all fields" });
  }

  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: "User not found" });

  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: "Old password incorrect" });
  }

  // Update password
  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  // Invalidate all other refresh tokens except current one
  const currentRefreshToken = req.cookies.refreshToken;
  const refreshKey = `refresh_token:${userId}`;

  const storedToken = await redisClient.get(refreshKey);
  if (storedToken && storedToken !== currentRefreshToken) {
    // remove the old stored token
    await redisClient.del(refreshKey);
    // store only current one again
    await redisClient.setEx(refreshKey, 7 * 24 * 60 * 60, currentRefreshToken);
  }

  return res.json({ message: "Password updated successfully" });
});

/**
 * Forgot password (send reset link / OTP)
 */
export const forgotPassword = TryCatch(async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  const user = await User.findOne({ email });
  if (!user) return res.json({ message: "If email exists, reset link sent" });

  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetKey = `reset:${resetToken}`;

  await redisClient.setEx(
    resetKey,
    15 * 60,
    JSON.stringify({ userId: user._id })
  );

  const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  await sendMail({
    email,
    subject: "Password Reset",
    html: `<p>Click <a href="${resetLink}">here</a> to reset your password. Link expires in 15 minutes.</p>`,
  });

  return res.json({ message: "If email exists, reset link sent" });
});

/**
 * Reset password (via reset token)
 */
export const resetPassword = TryCatch(async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  if (!token || !newPassword) {
    return res
      .status(400)
      .json({ message: "Token and new password are required" });
  }

  const resetKey = `reset:${token}`;
  const data = await redisClient.get(resetKey);
  if (!data)
    return res.status(400).json({ message: "Invalid or expired token" });

  await redisClient.del(resetKey);

  const { userId } = JSON.parse(data);
  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: "User not found" });

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  // Force logout everywhere (delete all refresh tokens)
  await redisClient.del(`refresh_token:${user._id}`);

  res.clearCookie("refreshToken");
  res.clearCookie("accessToken");

  return res.json({
    message: "Password reset successfully. Please log in again.",
  });
});



// Upload / Update profile image
export const uploadProfileImage = TryCatch(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Please upload an image" });
  }

  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ message: "User not found" });

  // Delete old avatar if exists
  if (user.avatar?.publicId) {
    await deleteFromCloudinary(user.avatar.publicId);
  }

  // Upload new one
  const { url, publicId } = await uploadToCloudinary(req.file.path);

  // Save to user
  user.avatar = { url, publicId };
  await user.save();

  // Delete temp file
  fs.unlinkSync(req.file.path);

  return res.json({
    message: "Profile picture updated successfully",
    avatar: user.avatar,
  });
});
