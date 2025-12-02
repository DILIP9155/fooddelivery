import axios from "axios";
import React from "react";
import { FaPen, FaTrashAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { serverUrl } from "../App";
import { useDispatch } from "react-redux";
import { setMyShopData } from "../redux/ownerSlice";
import { toast } from "react-toastify";

const Owneritem = ({ data }) => {
  const navigate = useNavigate();

  const dispatch = useDispatch()
  const handleDelete = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/item/delete/${data._id}`,{withCredentials:true})

      dispatch(setMyShopData(result.data))
      toast.success("Items Deleted Successfully")
    } catch (error) {
      console.log(error)
    }
  }
  return (
    <div className="flex flex-col sm:flex-row bg-white shadow-md rounded-2xl overflow-hidden hover:shadow-lg transition-shadow duration-300 mt-10">
      {/* Image Section */}
      <div className="w-full sm:w-1/3 h-48 sm:h-auto">
        <img
          src={data.image}
          alt={data.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content Section */}
      <div className="flex flex-col justify-between p-4 sm:w-2/3">
        {/* Item Info */}
        <div>
          <h2 className="text-xl font-semibold text-[#ff4d2d]">{data.name}</h2>
          <p className="text-sm text-gray-500 mt-1">
            <span className="font-medium text-gray-700">Category:</span>{" "}
            {data.category}
          </p>
          <p className="text-sm text-gray-500">
            <span className="font-medium text-gray-700">Food Type:</span>{" "}
            {data.foodType}
          </p>
        </div>

        {/* Price + Actions */}
        <div className="flex items-center justify-between mt-4">
          <div className="text-lg font-bold text-green-600">
            <span className="font-medium text-[#ff4d2d]">Price:</span>₹
            {data.price}
          </div>
          <div className="flex gap-3 text-gray-600">
            <button
              className=" rounded-full cursor-pointer hover:bg-red-300 w-[30px] h-[30px] items-center flex justify-center transition-all duration-500"
              onClick={() => navigate(`/edit-food/${data._id}`)}
            >
              <FaPen size={20} className="text-[#ff4d2d]" />
            </button>
            <button className="rounded-full cursor-pointer hover:bg-red-300 w-[30px] h-[30px] items-center flex justify-center transition-all duration-500" onClick={handleDelete}>
              <FaTrashAlt size={20} className="text-[#ff4d2d]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Owneritem;
