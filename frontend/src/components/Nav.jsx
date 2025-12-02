import React, { useEffect, useState } from "react";
import { FaLocationDot } from "react-icons/fa6";
import { IoIosSearch } from "react-icons/io";
import { FiShoppingCart } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { RxCross2 } from "react-icons/rx";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { serverUrl } from "../App";
import { setSearchItems, setUserData } from "../redux/userSlice";
import { toast } from "react-toastify";
import { FaPlus } from "react-icons/fa6";
import { LuReceipt } from "react-icons/lu";
import { useNavigate } from "react-router-dom";

const Nav = () => {
  const [showInfo, setShowInfo] = useState(false);
  const { userData, currentCity, cartItems } = useSelector((state) => state.user);
  const { socket } = useSelector((state) => state.user);
  const { myShopData } = useSelector((state) => state.owner);
  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate()
  const dispatch = useDispatch();
  const handleLogOut = async () => {
    try {
      await axios.post(
        `${serverUrl}/api/auth/logout`,
        {},
        { withCredentials: true }
      );
      // notify server to clear socket and go offline
      if (socket) {
        try {
          socket.emit("logout", { userId: userData?._id });
          socket.disconnect();
        } catch (err) {
          console.error("socket logout error", err);
        }
      }
      dispatch(setUserData(null));
      toast.success("Logout Successfully");
      // window.location.href = "/login";
    } catch (error) {
      const errorMsg =
        error?.response?.data?.message || "Logout failed. Please try again.";
      toast.error(errorMsg);
    }
  };

  const handleSearchItems = async (query) => {
    if (!query || !currentCity) {
      dispatch(setSearchItems(null));
      return;
    }
    try {
      const result = await axios.get(`${serverUrl}/api/item/search-items?query=${encodeURIComponent(query)}&city=${encodeURIComponent(currentCity)}`, { withCredentials: true });
      dispatch(setSearchItems(result.data));
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (query) {
      handleSearchItems(query);
    } else {
      dispatch(setSearchItems(null));
    }
  }, [query, currentCity]);
  return (
    <div className="w-full h-[80px] flex items-center justify-between md:justify-center gap-[30px] px-[20px] fixed top-0 z-[9999] bg-white shadow-md">
      {/* Brand */}
      <h1 className="text-5xl font-extrabold mb-3 bg-gradient-to-r from-[#ff4d2d] via-pink-500 to-yellow-400 bg-clip-text text-transparent">
        Anupam
      </h1>

      {/* Search Bar (Desktop + Mobile when toggled) */}
      {userData.role == "user" && (
        <div
          className={`${
            showSearch ? "flex" : "hidden"
          } absolute top-[80px] left-0 w-full px-4 py-3 bg-white md:static md:flex md:w-[60%] lg:w-[40%] md:py-0 md:px-0`}
        >
          <div className="flex items-center gap-3 w-full h-[50px] bg-white shadow-inner rounded-full px-4">
            <FaLocationDot className="text-[#ff4d2d]" />
            <div className="border-r-[1px] border-gray-300 pr-3">
              {currentCity}
            </div>
            <IoIosSearch className="text-gray-500 text-lg" />
            <input
              type="text"
              placeholder={`Search delicious food...`}
              className="px-2 text-gray-700 outline-0 w-full bg-transparent"
              onChange={(e) => setQuery(e.target.value)}
              value={query}
            />
          </div>
        </div>
      )}

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Mobile Search Toggle (Search <-> Cross) */}
        {/* Mobile Search Toggle (only for users) */}
        {userData?.role === "user" &&
          (showSearch ? (
            <RxCross2
              className="md:hidden block text-2xl cursor-pointer text-[#ff4d2d]"
              onClick={() => setShowSearch((prev) => !prev)}
            />
          ) : (
            <IoIosSearch
              className="md:hidden block text-2xl cursor-pointer text-[#ff4d2d]"
              onClick={() => setShowSearch((prev) => !prev)}
            />
          ))}

        {userData?.role === "owner" ? (
          <>
            {myShopData && (
              <>
                <button className="md:flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-[#ff4d2d] to-[#ff7b2d] text-white font-semibold rounded-full shadow-md hover:scale-105 transition-all duration-300 hidden cursor-pointer" onClick={()=>navigate("/add-food")}>
                  <FaPlus className="text-lg" />
                  <span>Add Food Item</span>
                </button>
                <button className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-[#ff4d2d] to-[#ff7b2d] text-white font-semibold rounded-full shadow-md hover:scale-105 transition-all duration-300 md:hidden cursor-pointer">
                  <FaPlus className="text-lg" onClick={()=>navigate("/add-food")}/>
                </button>
              </>
            )}
            <div className="relative flex items-center gap-2 cursor-pointer">
              {/* Small Screen (only icon + badge) */}
              <div className="md:hidden relative" onClick={()=>navigate("/my-orders")}>
                <LuReceipt className="text-2xl text-[#ff4d2d]" />
                <span className="absolute -top-2 -right-2 bg-[#ff4d2d] text-white text-xs px-1.5 py-0.5 rounded-full">
                  0
                </span>
              </div>

              {/* Large Screen (icon + text + badge on top) */}
              <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-[#ff4d2d]/10 rounded-lg hover:bg-[#ff4d2d]/20 transition relative" onClick={()=>navigate("/my-orders")}>
                <div className="">
                  <LuReceipt className="text-xl text-[#ff4d2d]" />
                  <span className="absolute -top-2 -right-2 bg-[#ff4d2d] text-white text-xs px-1.5 py-0.5 rounded-full">
                    0
                  </span>
                </div>
                <span className="font-medium text-red-700">My Orders</span>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* My Orders (Desktop Only) */}
            <button className="hidden md:block px-4 py-2 bg-[#ff4d2d] text-white rounded-full hover:bg-[#e63d1f] transition cursor-pointer" onClick={()=>navigate("/my-orders")}>
              My Orders
            </button>
          </>
        )}

        {/* Cart */}
        {userData.role == "user" && (
          <div className="relative cursor-pointer" onClick={()=>navigate("/food-cart")}>
            <FiShoppingCart className="text-2xl text-[#ff4d2d] animate-bounce" />
            <span className="absolute top-[-8px] right-[-10px] bg-[#ca7161] text-white text-xs px-2 py-0.5 rounded-full animate-bounce">
              {cartItems.length}
            </span>
          </div>
        )}

        {/* My Orders (Desktop Only)
        <button className="hidden md:block px-4 py-2 bg-[#ff4d2d] text-white rounded-full hover:bg-[#e63d1f] transition cursor-pointer">
          My Orders
        </button> */}

        {/* Profile Avatar */}
        <div
          onClick={() => setShowInfo((prev) => !prev)}
          className="w-10 h-10 flex items-center justify-center bg-[#ff4d2d] text-white rounded-full cursor-pointer font-bold"
        >
          {userData?.fullName?.slice(0, 1).toUpperCase() || "U"}
        </div>

        {/* Profile Dropdown */}
        <AnimatePresence>
          {showInfo && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`absolute top-[80px] right-[20px] ${userData.role == "deliveryBoy"?"md:right-[20%] lg:right-[45%]":"md:right-[10%] lg:right-[25%]"}bg-white shadow-lg rounded-2xl w-[200px] p-4 flex flex-col gap-3 z-[99999]`}
            >
              <div className="flex items-center gap-3 border-b pb-2">
                <div className="w-10 h-10 flex items-center justify-center bg-[#ff4d2d] text-white rounded-full font-bold">
                  {userData?.fullName?.slice(0, 1).toUpperCase() || "U"}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">
                    {userData?.fullName || "Guest"}
                  </p>
                  <p className="text-sm text-gray-500">Food Lover</p>
                </div>
              </div>
              {userData.role == "user" && (
                <div className="cursor-pointer hover:bg-gray-100 px-3 py-2 rounded-lg md:hidden" onClick={()=>navigate("/my-orders")}>
                  My Orders
                </div>
              )}
              <div
                className="cursor-pointer hover:bg-gray-100 px-3 py-2 rounded-lg text-red-400"
                onClick={handleLogOut}
              >
                Log Out
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Nav;
