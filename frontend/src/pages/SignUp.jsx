import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import axios from "axios";
import { serverUrl } from "../App";
import { toast } from "react-toastify";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../firebase";
import { FadeLoader } from "react-spinners";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";

const SignUp = () => {
  const primaryColor = "#ff4d2d";
  const hoverColor = "#e64323";
  const bgcolor = "#fff9f6";

  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [role, setRole] = useState("user");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch()

  const handleSignup = async () => {
    setLoading(true);
    try {
      const result = await axios.post(
        `${serverUrl}/api/auth/signup`,
        {
          fullName,
          email,
          password,
          mobile,
          role,
        },
        { withCredentials: true }
      );
      dispatch(setUserData(result.data))
      toast.success("Signup Successfull 🎉");
      setLoading(false);

    } catch (error) {
      const errorMsg = error.response?.data?.message || "Signup error ❌";
      toast.error(errorMsg);
      setLoading(false);

    }
  };

  const handleGoogleAuth = async () => {
    if (!mobile) {
      toast.error("mobile number is required ❌");
      return;
    }
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    try {
      const { data } = await axios.post(
        `${serverUrl}/api/auth/google-auth`,
        {
          fullName: result.user.displayName,
          email: result.user.email,
          role,
          mobile,
        },
        { withCredentials: true }
      );
      dispatch(setUserData(data))
      toast.success("Signup Successfull 🎉");
    } catch (error) {
      console.log(error);
      const errorMsg = error.response?.data?.message || "Signup error ❌";
      toast.error(errorMsg);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: bgcolor }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 border border-gray-200">
        {/* Title */}
        <h1
          className="text-3xl font-extrabold mb-2 text-center animate-bounce"
          style={{ color: primaryColor }}
        >
          🍔 Foodie Signup
        </h1>
        <p className="text-gray-600 text-center mb-8">
          Create your account to get started with delicious food deliveries
        </p>

        {/* Fullname */}
        <div className="mb-4">
          <label
            htmlFor="fullName"
            className="block text-gray-700 font-medium mb-1"
          >
            Full Name
          </label>
          <input
            type="text"
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-orange-400 border-gray-300"
            onChange={(e) => setFullName(e.target.value)}
            value={fullName}
            placeholder="Enter your full name"
            required
          />
        </div>

        {/* Email */}
        <div className="mb-4">
          <label
            htmlFor="email"
            className="block text-gray-700 font-medium mb-1"
          >
            Email
          </label>
          <input
            type="email"
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-orange-400 border-gray-300"
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            value={email}
            required
          />
        </div>

        {/* Password */}
        <div className="mb-4">
          <label
            htmlFor="password"
            className="block text-gray-700 font-medium mb-1"
          >
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              className="w-full border rounded-lg px-3 py-2 pr-10 focus:outline-none focus:border-orange-400 border-gray-300"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              placeholder="Enter your password"
              required
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>

        {/* Phone */}
        <div className="mb-6">
          <label
            htmlFor="mobile"
            className="block text-gray-700 font-medium mb-1"
          >
            Mobile
          </label>
          <input
            type="number"
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-orange-400 border-gray-300"
            onChange={(e) => setMobile(e.target.value)}
            value={mobile}
            placeholder="Enter your phone number"
            required
          />
        </div>

        {/* role */}
        <div className="mb-4">
          <label
            htmlFor="role"
            className="block text-gray-700 font-medium mb-1"
          >
            Role
          </label>
          <div className="flex gap-2">
            {["user", "owner", "deliveryBoy"].map((r) => (
              <button
                className="flex-1 border rounded-lg px-3 py-2 text-center font-medium transition-colors cursor-pointer"
                onClick={() => setRole(r)}
                style={
                  role == r
                    ? { backgroundColor: primaryColor, color: "white" }
                    : {
                        border: `1px solid ${primaryColor}`,
                        color: primaryColor,
                      }
                }
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Submit button */}
        <button
          className="w-full py-3 rounded-lg font-semibold transition duration-200 cursor-pointer flex justify-center items-center"
          style={{ backgroundColor: primaryColor, color: "#fff" }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = hoverColor)
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = primaryColor)
          }
          onClick={handleSignup}
          disabled={loading}
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
            "Sign Up"
          )}
        </button>

        {/* Google Signup Button */}
        <button
          type="button"
          onClick={handleGoogleAuth}
          className="w-full flex items-center justify-center gap-2 py-3 mt-4 border rounded-lg text-gray-700 font-medium shadow-sm hover:bg-gray-200 transition duration-200 cursor-pointer"
        >
          <FcGoogle size={22} />
          <span>Sign up with Google</span>
        </button>

        {/* Footer */}
        <p className="text-center text-gray-600 mt-4">
          Already have an account?{" "}
          <button
            onClick={() => navigate("/login")}
            style={{ color: primaryColor }}
            className="font-semibold hover:underline cursor-pointer"
          >
            Log in
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
