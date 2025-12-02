import React from 'react'
import { IoIosArrowRoundBack } from 'react-icons/io'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import UserOrderCard from '../components/UserOrderCard'
import OwnerOrderCard from '../components/OwnerOrderCard'

const Myorders = () => {
  const {userData, myOrders} = useSelector(state=>state.user)
  const navigate = useNavigate()
  return (
    <div className='min-h-screen w-full bg-[#fff9f6] flex justify-center px-4'>
      <div className='w-full max-w-[800px] p-4'>
        <div className='w-full flex items-center gap-4 mb-4'>
          <div className='z-[10] ' onClick={()=>navigate("/")}>
            <IoIosArrowRoundBack size={35} className='text-[#ff4d3d]'/>
          </div>
          <h1 className='text-2xl font-bold text-start'>My Orders</h1>
        </div>

        {/* Orders List */}
        <div className='space-y-6'>
          {myOrders && myOrders.length > 0 ? (
            myOrders?.map((order, index) => (
              userData.role === "user" ? (
                <UserOrderCard data={order} key={index} />
              ) : userData.role === "owner" ? (
                <OwnerOrderCard data={order} key={index} />
              ) : null
            ))
          ) : (
            <div className="text-center text-gray-500 mt-8">No orders found.</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Myorders
