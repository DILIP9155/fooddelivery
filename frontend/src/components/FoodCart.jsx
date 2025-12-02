import React from 'react'
import { IoIosArrowRoundBack } from "react-icons/io";
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import CartItemCard from './CartItemCard';

const FoodCart = () => {
  const navigate = useNavigate();
  const { cartItems, totalAmount } = useSelector((state) => state.user);

  return (
    <div className="min-h-screen bg-[#fff9f6] flex justify-center px-4 py-8">
      <div className="w-full max-w-[800px] relative">
        {/* Back Button */}
        <button
          onClick={() => navigate("/")}
          className="absolute top-4 left-4 flex items-center gap-1 text-[#ff4d2d] hover:text-[#e63d1f] transition-colors"
        >
          <IoIosArrowRoundBack size={35} />
          <span className="font-medium">Back</span>
        </button>

        {/* Header */}
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Your Cart
        </h1>

        {/* Empty State */}
        {(!cartItems || cartItems.length === 0) ? (
          <div className="bg-white shadow-lg rounded-2xl p-10 flex flex-col items-center">
            <img
              src="https://cdn-icons-png.flaticon.com/512/2038/2038854.png"
              alt="Empty Cart"
              className="w-24 h-24 mb-4 opacity-70 animate-bounce"
            />
            <p className="text-gray-500 text-lg">Your cart is empty</p>
          </div>
        ) : (
          <>
          <div className="space-y-4">
            {cartItems.map((item, index) => (
              <div
                key={index}
              >
                <CartItemCard data={item} />
              </div>
            ))}
          </div>

          <div className='mt-6 bg-white p-4 rounded-xl shadow flex justify-between items-center border'>
            <h1 className='text-lg font-semibold'>Total Amount</h1>
            <span className='text-xl font-bold text-[#ff4d2d]'>₹{totalAmount}</span>
          </div>

          <div className='mt-4 flex justify-end'>
            <button className='text-white px-6 py-2 rounded-lg text-lg font-medium hover:bg-[#e64526] transition cursor-pointer bg-[#ff4d2d]' onClick={()=>navigate("/checkOut")}>
              Proceed to CheckOut
            </button>
          </div>
          </>
      
        )}
      </div>
    </div>
  );
};

export default FoodCart;
