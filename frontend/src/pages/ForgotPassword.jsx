import React, { useState } from "react";
import { IoIosArrowRoundBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { serverUrl } from "../App";
import { toast } from "react-toastify";
import { FadeLoader } from "react-spinners";

const ForgotPassword = () => {
  const primaryColor = "#ff4d2d";
  const hoverColor = "#e64323";
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    setLoading(true);
    try {
      const result = await axios.post(
        `${serverUrl}/api/auth/send-otp`,
        { email },
        { withCredentials: true }
      );
      setStep(2);
      console.log(result);
      toast.success("OTP send successfully");
      setLoading(false);
    } catch (error) {
      const errorMsg = error.response?.data?.message || "OTP send error";
      toast.error(errorMsg);
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setLoading(true);

    try {
      const result = await axios.post(
        `${serverUrl}/api/auth/verify-otp`,
        { email, otp },
        { withCredentials: true }
      );
      setStep(3);
      console.log(result);
      toast.success("OTP verified successfully");
      setLoading(false);
    } catch (error) {
      console.log(error);
      const errorMsg = error.response?.data?.message || "OTP verify error";
      toast.error(errorMsg);
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setLoading(true);

    if (newPassword != confirmPassword) {
      return null;
    }
    try {
      const result = await axios.post(
        `${serverUrl}/api/auth/reset-password`,
        { email, newPassword },
        { withCredentials: true }
      );
      console.log(result);
      navigate("/login");
      toast.success("Password updated successfully");
      setLoading(false);
    } catch (error) {
      console.log(error);
      const errorMsg = error.response?.data?.message || "Password update error";
      toast.error(errorMsg);
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full min-h-screen items-center justify-center bg-gradient-to-br from-orange-100 via-white to-orange-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8"
      >
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <IoIosArrowRoundBack
            className="text-[#ff4d2d] cursor-pointer hover:scale-110 transition"
            size={36}
            onClick={() => navigate("/login")}
          />
          <h1 className="text-xl font-bold text-gray-800">Forgot Password</h1>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 w-2 rounded-full ${
                step === s ? "bg-[#ff4d2d]" : "bg-gray-300"
              }`}
            />
          ))}
        </div>

        {/* Step 1: Email */}
        {step === 1 && (
          <motion.div
            initial={{ x: -40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <label className="block text-gray-700 font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              className="w-full border rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400 border-gray-300 mb-6"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              placeholder="Enter your email"
              required
            />
            <button
              onClick={handleSendOtp}
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold transition transform duration-200"
              style={{ backgroundColor: primaryColor, color: "#fff" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = hoverColor)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = primaryColor)
              }
            >
              {loading ? (
                <div className="flex justify-center items-center">
                  <FadeLoader
                    height={10} // height of each bar
                    width={3} // width of each bar
                    margin={-8} // spacing between bars
                    color="#fff"
                    loading={true}
                  />
                </div>
              ) : (
                "Send OTP"
              )}
            </button>
          </motion.div>
        )}

        {/* Step 2: OTP */}
        {step === 2 && (
          <motion.div
            initial={{ x: -40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <label className="block text-gray-700 font-medium mb-2">
              Enter OTP
            </label>
            <input
              type="number"
              className="w-full border rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400 border-gray-300 mb-6"
              onChange={(e) => setOtp(e.target.value)}
              value={otp}
              placeholder="Enter OTP"
              required
            />
            <button
              onClick={handleVerifyOtp}
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold transition transform duration-200"
              style={{ backgroundColor: primaryColor, color: "#fff" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = hoverColor)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = primaryColor)
              }
            >
              {loading ? (
                <div className="flex justify-center items-center">
                  <FadeLoader
                    height={10} // height of each bar
                    width={3} // width of each bar
                    margin={-8} // spacing between bars
                    color="#fff"
                    loading={true}
                  />
                </div>
              ) : (
                "Verify"
              )}
            </button>
          </motion.div>
        )}

        {/* Step 3: Reset Password */}
        {step === 3 && (
          <motion.div
            initial={{ x: -40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <label className="block text-gray-700 font-medium mb-2">
              New Password
            </label>
            <input
              type="password"
              className="w-full border rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400 border-gray-300 mb-4"
              onChange={(e) => setNewPassword(e.target.value)}
              value={newPassword}
              placeholder="Enter new password"
              required
            />
            <label className="block text-gray-700 font-medium mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              className="w-full border rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400 border-gray-300 mb-6"
              onChange={(e) => setConfirmPassword(e.target.value)}
              value={confirmPassword}
              placeholder="Confirm password"
              required
            />
            <button
              onClick={handleResetPassword}
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold transition transform duration-200"
              style={{ backgroundColor: primaryColor, color: "#fff" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = hoverColor)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = primaryColor)
              }
            >
              {loading ? (
                <div className="flex justify-center items-center">
                  <FadeLoader
                    height={10} // height of each bar
                    width={3} // width of each bar
                    margin={-8} // spacing between bars
                    color="#fff"
                    loading={true}
                  />
                </div>
              ) : (
                "Reset Password"
              )}
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
