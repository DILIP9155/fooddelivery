import React from 'react'
import { useNavigate } from 'react-router-dom';

const OrderPlaced = () => {
  const navigate = useNavigate();
  return (
    <div className='min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4'>
      <h1 className='text-3xl font-bold text-center mt-20'>Your order has been placed successfully!</h1>
      <p className='text-center mt-4 text-lg '>Thank you for ordering with us. Your delicious food is on its way!</p>
      <img src="https://cdn-icons-png.flaticon.com/512/190/190411.png" alt="Order Placed" className='w-25 h-25 mt-8 animate-bounce' />
      <div className='mt-10'>
        <button className='bg-[#ff4d2d] text-white px-6 py-2 rounded-lg text-lg font-medium hover:bg-[#e64526] transition cursor-pointer' onClick={()=>navigate('/my-orders')}>
          Back to My Orders
        </button>
      </div>  
      
    </div>
  )
}

export default OrderPlaced
