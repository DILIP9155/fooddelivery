import React, { useEffect, useState } from "react";
import { FadeLoader } from "react-spinners";
import { IoIosArrowRoundBack } from "react-icons/io";
import { useNavigate, useParams } from "react-router-dom";
import { FaUtensils } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { serverUrl } from "../App";
import { toast } from "react-toastify";
import { setMyShopData } from "../redux/ownerSlice";

const Edititem = () => {
  const navigate = useNavigate();
  const { myShopData } = useSelector((state) => state.owner);
  const [currentItem, setCurrentItem] = useState(null)
  const {itemId} = useParams()
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState( "Snacks");
  const [foodType, setFoodType] = useState( "Veg");
  const [frontendImage, setFrontendImage] = useState("");
  const [backendImage, setBackendImage] = useState(null);
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false);
  const handleImage = (e) => {
    const file = e.target.files[0];
    setBackendImage(file);
    setFrontendImage(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!myShopData?._id) {
      toast.error("Please create a shop first!");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("name", name);
      formData.append("price", price);
      formData.append("category", category);
      formData.append("foodType", foodType);
      if (backendImage) formData.append("image", backendImage);

      const result = await axios.post(`${serverUrl}/api/item/edit-food/${itemId}`, formData, {
        withCredentials: true,
      });
      dispatch(setMyShopData(result.data))
      toast.success("Item Updated Successfully!");
      setLoading(false);
      navigate("/");
    } catch (error) {
      setLoading(false);
      console.error(error);
      toast.error("Something went wrong!");
    }
  };

  useEffect(()=>{
    const handleGetItemByid = async () => {
      try {
        const result = await axios.get(`${serverUrl}/api/item/get-by-id/${itemId}`,{withCredentials:true})

        setCurrentItem(result.data)
      } catch (error) {
        console.log(error)
      }
    }
    handleGetItemByid()
  },[itemId])

  useEffect(()=>{
    setName(currentItem?.name || "")
    setPrice(currentItem?.price || "")
    setCategory(currentItem?.category || "Snacks")
    setFrontendImage(currentItem?.image || "")

    setFoodType(currentItem?.foodType || "Veg")
  },[currentItem])

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
          <h2 className="text-2xl font-bold text-gray-800">Edit Item</h2>
          <p className="text-sm text-gray-500">Fill in the details to update in an item to your shop</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Item Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter Item Name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
          </div>

          {/* Item Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Item Image</label>
            <input
              type="file"
              onChange={handleImage}
              className="w-full text-gray-600 border border-gray-300 rounded-lg file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-600 hover:file:bg-orange-100"
            />
            {frontendImage && (
              <div className="mt-4">
                <img src={frontendImage} alt="Preview" className="w-full h-48 object-cover rounded-lg border" />
              </div>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
            >
              {[
                "Snacks",
                "Main Course",
                "Desserts",
                "Pizza",
                "Burger",
                "Sandwiches",
                "South Indian",
                "North Indian",
                "Chinese",
                "Fast Food",
                "Others",
              ].map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Food Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Food Type</label>
            <select
              value={foodType}
              onChange={(e) => setFoodType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
            >
              <option value="Veg">Veg</option>
              <option value="non veg">Non Veg</option>
            </select>
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
            <input
              type="number"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Enter Price"
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
              "Edit Item"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Edititem;
