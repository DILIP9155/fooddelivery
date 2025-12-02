import React from "react";
import Nav from "./Nav.jsx";
import { useSelector } from "react-redux";
import { FaUtensils } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { FaPen } from "react-icons/fa";
import Owneritem from "./Owneritem.jsx";

const OwnerDashboard = () => {
  const { myShopData } = useSelector((state) => state.owner);

  const navigate = useNavigate();

  return (
    <div>
      <Nav />
      {!myShopData && (
        <div className="flex justify-center items-center p-6 mt-25">
          <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md text-center border border-gray-100 hover:shadow-2xl transition duration-300">
            {/* Icon */}
            <div className="flex justify-center items-center w-16 h-16 mx-auto rounded-full bg-[#ff4d2d]/10 text-[#ff4d2d] text-3xl mb-4">
              <FaUtensils />
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Add Your Restaurant
            </h2>

            {/* Subtitle */}
            <p className="text-gray-600 mb-6">
              Join our food delivery platform and reach thousands of hungry
              customers every day.
            </p>

            {/* CTA Button */}
            <button
              className="w-full px-6 py-3 bg-gradient-to-r from-[#ff4d2d] to-[#ff7b2d] text-white font-semibold rounded-xl shadow-md hover:scale-105 transition-transform duration-300"
              onClick={() => navigate("/create-edit-shop")}
            >
              Get Started
            </button>
          </div>
        </div>
      )}

      {myShopData && (
        <div className="w-full flex flex-col items-center px-4 sm:px-6 mt-25">
          <div className="max-w-md w-full bg-white shadow-lg rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-800 flex items-center gap-2">
                <FaUtensils className="text-orange-500" />
                Welcome to {myShopData.name}
              </h1>
              <button
                onClick={() => navigate("/create-edit-shop")}
                className="p-2 rounded-full hover:bg-gray-100 transition"
              >
                <FaPen className="text-gray-600 hover:text-orange-500" />
              </button>
            </div>

            {/* Shop Image */}
            <div className="w-full h-56 overflow-hidden">
              <img
                src={myShopData.image}
                alt={myShopData.name}
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              />
            </div>

            {/* Shop Details */}
            <div className="px-6 py-4 space-y-2">
              <h2 className="text-lg font-semibold text-gray-900">
                {myShopData.name}
              </h2>
              <p className="text-gray-600">
                📍 {myShopData.city}, {myShopData.state}
              </p>
              <p className="text-gray-600">{myShopData.address}</p>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t flex justify-end">
              <button
                onClick={() => navigate("/create-edit-shop")}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg shadow hover:bg-orange-600 transition"
              >
                Edit Shop
              </button>
            </div>
          </div>
          {myShopData.items.length == 0 &&  <div className="flex justify-center items-center p-6 mt-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md text-center border border-gray-100 hover:shadow-2xl transition duration-300">
            {/* Icon */}
            <div className="flex justify-center items-center w-16 h-16 mx-auto rounded-full bg-[#ff4d2d]/10 text-[#ff4d2d] text-3xl mb-4">
              <FaUtensils />
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Add Your Food Items
            </h2>

            {/* Subtitle */}
            <p className="text-gray-600 mb-6">
              Share your delicious creations with our customers by adding them to the menu.
            </p>

            {/* CTA Button */}
            <button
              className="w-full px-6 py-3 bg-gradient-to-r from-[#ff4d2d] to-[#ff7b2d] text-white font-semibold rounded-xl shadow-md hover:scale-105 transition-transform duration-300"
              onClick={() => navigate("/add-food")}
            >
              Add Food
            </button>
          </div>
        </div>}

        {myShopData.items.length > 0 && <div className="flex flex-col items-center gap-4 w-full max-w-3xl">
          {myShopData.items.map((item, index)=>(
            <Owneritem data={item} key={index}/>
          ))}
        </div>}
        </div>
      )}
    </div>
  );
};

export default OwnerDashboard;
