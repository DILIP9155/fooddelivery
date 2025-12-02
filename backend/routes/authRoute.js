import express from "express";
import {
  googleAuth,
  logIn,
  logOut,
  resetPassword,
  sendOtp,
  signUp,
  verifyOtp,
} from "../controller/authUser.js";

const authRouter = express.Router();

authRouter.post("/signup", signUp);
authRouter.post("/login", logIn);
authRouter.post("/logout", logOut);
authRouter.post("/send-otp", sendOtp);
authRouter.post("/verify-otp", verifyOtp);
authRouter.post("/reset-password", resetPassword);
authRouter.post("/google-auth", googleAuth);

export default authRouter;
