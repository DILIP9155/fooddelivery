import React, { useState } from "react";
import { FadeLoader } from "react-spinners";
import { IoIosArrowRoundBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { FaUtensils } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { serverUrl } from "../App";
import { setMyShopData } from "../redux/ownerSlice";
import { toast } from "react-toastify";

const CreateEditShop = () => {
  const navigate = useNavigate();
  const { myShopData } = useSelector((state) => state.owner);
  const { currentCity, currentState, currentAddress } = useSelector(
    (state) => state.user
  );

  const [name, setName] = useState(myShopData?.name || "");
  const [address, setAddress] = useState(myShopData?.address || currentAddress);
  const [city, setCity] = useState(myShopData?.city || currentCity);
  const [state, setState] = useState(myShopData?.state || currentState);

  const [frontendImage, setFrontEndImage] = useState(myShopData?.image || null);
  const [backendImage, setBackEndImage] = useState(null);

  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false);
  const handleImage = (e) => {
    const file = e.target.files[0];
    setBackEndImage(file);
    setFrontEndImage(URL.createObjectURL(file));
  };
  const handleSubmit = async(e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const formData = new FormData()
      formData.append("name", name)
      formData.append("city", city)
      formData.append("state", state)
      formData.append("address", address)
      if(backendImage){
        formData.append("image", backendImage)
      }
      const result = await axios.post(`${serverUrl}/api/shop/create-edit`,formData,{withCredentials:true})
      dispatch(setMyShopData(result.data))
      navigate("/")
      toast.success("Shop Added Successfully")
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log(error)
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-lg bg-white shadow-xl rounded-2xl p-6 relative">
        {/* Back button */}
        <button
          onClick={() => navigate("/")}
          className="absolute top-4 left-4 w-10 h-10 flex items-center justify-center rounded-full bg-orange-100 text-orange-600 hover:bg-orange-200 transition"
        >
          <IoIosArrowRoundBack size={26} />
        </button>

        {/* Title with Icon */}
        <div className="flex flex-col items-center gap-3 mb-8 mt-6">
          <div className="p-4 rounded-full bg-orange-100 text-orange-600 shadow-inner">
            <FaUtensils size={28} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">
            {myShopData ? "Edit Shop" : "Add Shop"}
          </h2>
          <p className="text-sm text-gray-500">
            Fill in the details to {myShopData ? "update" : "create"} your shop
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Shop Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Shop Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter Shop Name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
          </div>

          {/* Shop Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Shop Image
            </label>
            <input
              type="file"
              className="w-full text-gray-600 border border-gray-300 rounded-lg file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-600 hover:file:bg-orange-100"
              onChange={handleImage}
            />
            {frontendImage && (
              <div className="mt-4">
                <img
                  src={frontendImage}
                  alt=""
                  className="w-full h-48 object-cover rounded-lg border"
                />
              </div>
            )}
          </div>

          {/* City & State */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Enter City"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State
              </label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="Enter State"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter Address"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
          </div>

          {/* Save Button */}
          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-orange-600 text-white font-semibold hover:bg-orange-700 transition flex items-center justify-center"
            disabled={loading}
          >
            {loading ? (
              <FadeLoader height={10} width={3} margin={-8} color="#fff" loading={true} />
            ) : (
              myShopData ? "Save Shop" : "Add Shop"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateEditShop;
