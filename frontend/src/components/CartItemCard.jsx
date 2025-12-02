import React from "react";
import { FaMinus, FaPlus } from "react-icons/fa";
import { CiTrash } from "react-icons/ci";
import { useDispatch } from "react-redux";
import { removeCartItem, updateQuantity } from "../redux/userSlice";

const CartItemCard = ({ data }) => {
  const dispatch = useDispatch()
  const handleIncrease=(id, currentQty)=>{
    dispatch(updateQuantity({id, quantity:currentQty+1}))
  }

  const handleDecrease=(id, currentQty)=>{
    if(currentQty > 1){
      dispatch(updateQuantity({id, quantity:currentQty-1}))
    }
  }

  return (
    <div className="flex items-center justify-between bg-white shadow-md rounded-2xl p-4 mb-4 hover:shadow-lg transition-shadow duration-200">
      {/* Product Info */}
      <div className="flex items-center space-x-4">
        <img
          src={data.image}
          alt={data.name}
          className="w-20 h-20 object-cover rounded-xl border"
        />
        <div>
          <h1 className="text-lg font-semibold text-gray-800">{data.name}</h1>
          <p className="text-sm text-gray-500">
            ₹{data.price} × {data.quantity}
          </p>
          <p className="text-base font-bold text-gray-800">
            ₹{data.price * data.quantity}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center space-x-3">
        <button
          onClick={()=>handleDecrease(data.id, data.quantity)}
          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
        >
          <FaMinus className="text-gray-700 text-sm" />
        </button>
        <span className="font-medium text-gray-800">{data.quantity}</span>
        <button
          onClick={()=>handleIncrease(data.id, data.quantity)}
          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
        >
          <FaPlus className="text-gray-700 text-sm" />
        </button>
        <button
          onClick={()=>dispatch(removeCartItem(data.id))}
          className="p-2 rounded-full bg-red-100 hover:bg-red-200 transition-colors cursor-pointer"
        >
          <CiTrash className="text-red-500 text-xl" />
        </button>
      </div>
    </div>
  );
};

export default CartItemCard;
