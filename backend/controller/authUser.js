import mongoose from "mongoose";
import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import getToken from "../utils/token.js";
import { sendOtpMail } from "../utils/mailer.js";
export const signUp = async (req, res) => {
  try {
    const { fullName, email, password, mobile, role } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "user is already exist" });
    }
    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "password must be at leat 8 chracters." });
    }
    if (mobile.length < 10) {
      return res
        .status(400)
        .json({ message: "mobile no must be of 10 digits" });
    }
    const hashedpassword = await bcrypt.hash(password, 10);

    user = await User.create({
      fullName,
      email,
      role,
      mobile,
      password: hashedpassword,
    });
    const token = await getToken(user._id);
    if (!token) {
      return res.status(401).json({ message: "token not found" });
    }
    res.cookie("token", token, {
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });
    return res.status(201).json(user);
  } catch (error) {
    return res.status(500).json(`signup error ${error}`);
  }
};

export const logIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "user doen't exist" });
    }
    const ismatch = await bcrypt.compare(password, user.password);

    if (!ismatch) {
      return res.status(400).json({ message: "Invalid emial or password" });
    }
    const token = await getToken(user._id);
    if (!token) {
      return res.status(401).json({ message: "token not found" });
    }
    res.cookie("token", token, {
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });
    return res.status(200).json({ message: "login succesfull" }, user);
  } catch (error) {
    return res.status(500).json(`login error ${error}`);
  }
};

export const logOut = async (req, res) => {
  try {
    res.clearCookie("token");
    return res.status(200).json({ message: "logout successfully" });
  } catch (error) {
    return res.status(500).json(`logout error ${error}`);
  }
};

export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "user doen't exist" });
    }
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    user.resetOtp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000;
    user.isOtpVerified = false;
    await user.save();
    await sendOtpMail(email, otp);
    return res.status(200).json({ messsage: "OTP send successfully" });
  } catch (error) {
    return res.status(500).json(`otp send error ${error}`);
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user || user.resetOtp != otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid / expired otp" });
    }
    user.isOtpVerified = true;
    user.resetOtp = undefined;
    user.otpExpires = undefined;
    await user.save();
    return res.status(200).json({ message: "otp verified successfully" });
  } catch (error) {
    return res.status(500).json(`send otp error ${error}`);
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const user = await User.findOne({ email });
    if (!user || !user.isOtpVerified) {
      return res.status(400).json({ message: "otp verification required" });
    }

    const hashedpassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedpassword;
    user.isOtpVerified = false;

    await user.save();
    return res.status(200).json({ message: "password reset successfully" });
  } catch (error) {
    return res.status(500).json(`reset password error ${error}`);
  }
};

export const googleAuth = async (req, res) => {
  try {
    const { fullName, email, mobile, role } = req.body;
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        fullName,
        email,
        mobile,
        role,
      });
    }
    const token = await getToken(user._id);
    if (!token) {
      return res.status(401).json({ message: "token not found" });
    }
    res.cookie("token", token, {
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });
    return res.status(201).json(user);
  } catch (error) {
    return res.status(500).json(`google auth error ${error}`);
  }
};
