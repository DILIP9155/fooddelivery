import React, { useEffect, useState } from 'react'
import Nav from './Nav'
import { useSelector } from 'react-redux'
import axios from 'axios'
import { serverUrl } from '../App'
import DeliveryBoyTracking from './DeliveryBoyTracking'

const DeliveryBoydash = () => {
  const {userData, socket} = useSelector(state=>state.user)
  const [currentOrder, setCurrentOrder] = useState(null)
  const [showOtp, setShowOtp] = useState(false)
  const [availableAssignments, setAvailableAssignments] = useState(null)

  const [otp, setOtp] = useState("")
  const getAssignments = async () =>{
    try {
      const result = await axios.get(`${serverUrl}/api/order/get-assignments`,{withCredentials: true})
      setAvailableAssignments(result.data)
    } catch (error) {
      console.log(error)
    }
  }

  const getCurrentOrder = async () =>{
    try {
      const result = await axios.get(`${serverUrl}/api/order/get-current-order`,{withCredentials: true})
      setCurrentOrder(result.data)
      console.log(result.data)
    } catch (error) {
      console.log(error)
    }
  }

  const handleSendOtp=(e)=>{
    e.preventDefault()
   

  }

  const acceptOrder = async (assignmentId) =>{
    try {
      const result = await axios.get(`${serverUrl}/api/order/accept-order/${assignmentId}`,{withCredentials: true})
      console.log(result.data)
      await getCurrentOrder()
    } catch (error) {
      console.log(error)
    }
  }

  const sendOtp = async () =>{
    try {
      const result = await axios.post(`${serverUrl}/api/order/send-delivery-otp`,{orderId:currentOrder._id, shopOrderId:currentOrder.shopOrder._id},{withCredentials: true})
      setShowOtp(true)
      console.log(result.data)
    } catch (error) {
      console.log(error)
    }
  }

  const verifyOtp = async () =>{
    try {
      const result = await axios.post(`${serverUrl}/api/order/verify-delivery-otp`,{orderId:currentOrder._id, shopOrderId:currentOrder.shopOrder._id, otp},{withCredentials: true})
      console.log(result.data)
    } catch (error) {
      console.log(error)
    }
  }




  useEffect(()=>{
    getAssignments()
    getCurrentOrder()
    // socket listeners
    const currentSocket = socket;
    if (currentSocket) {
      currentSocket.on("new-assignment", (payload) => {
        getAssignments();
      });
      currentSocket.on("assignment-assigned", (payload) => {
        // assigned to this user -> refresh current order
        const assignedId = payload?.deliveryBoyId || payload?.assignedDeliveryBoy?._id;
        if (assignedId && assignedId === userData._id) {
          getCurrentOrder();
        }
      });
    }
    return ()=>{
      if (currentSocket) {
        currentSocket.off("new-assignment");
        currentSocket.off("assignment-assigned");
      }
    }
  },[userData, socket])
  return (
    <div className='w-screen min-h-screen flex flex-col gap-5 items-center bg-[#fff9f6] overflow-y-auto'>
      <Nav/>

      <div className='w-full max-w-[800px] flex flex-col gap-5 items-center mt-35'>
        <div className='bg-white rounded-2xl shadow-md p-5 flex justify-start items-center w-[90%] border border-orange-100 flex-col text-center gap-2'>
          <h1 className='text-xl font-bold text-[#ff4d2d]'>Welcome, {userData.fullName}</h1>
          <p className='text-[#ff4d2d]'><span className='font-semibold'>Latitude:</span> {userData.location.coordinates[1]}, <span className='font-semibold'>Longitude:</span> {userData.location.coordinates[0]}</p>
        </div>
        {!currentOrder && <div className='bg-white rounded-2xl shadow-md p-5 w-[90%] border border-orange-100 gap-2'>
          <h1 className='text-2xl font-bold text-gray-700 mb-2'>Available Orders</h1>
          {availableAssignments && availableAssignments.length > 0 ? availableAssignments.map((data, index)=>(
            <div key={index} className='w-[90%] bg-white rounded-2xl shadow-md p-5 flex flex-col gap-3 border border-orange-100 mb-4'>
              {/* <h2 className='text-lg font-semibold text-[#ff4d2d]'>Order ID: {data.items._id}</h2> */}
              <p className='text-gray-600'><span className='font-semibold text-gray-700'>Shop Name:</span> {data.shopName}</p>
              <p className='text-gray-600'><span className='font-semibold text-gray-700'>Delivery Address:</span> {data.deliveryAddress?.text} <span className='text-xs text-gray-500'>(Lat: {data.deliveryAddress?.latitude}, Lon: {data.deliveryAddress?.longitude})</span></p>
              <p className='text-gray-600'><span className='font-semibold text-gray-700'>Items: {data.items.length} | Subtotal:</span> ₹{data.subtotal}</p>

              <div>
                <button className='bg-[#ff4d2d] text-white px-4 py-2 rounded-lg hover:bg-[#e04324] transition' onClick={()=>acceptOrder(data.assignmentId)}>Accept Order</button>
              </div>
            </div>
          )) : <p className='text-gray-500'>No assignments available at the moment.</p>}
        </div>}
      
      {currentOrder && <div className='bg-white rounded-2xl shadow-md p-5 w-[90%] border border-orange-100 gap-2'>
        <h1 className='text-2xl font-bold text-gray-700 mb-2'>Current Order 📦</h1>
    
          <h2 className='text-lg font-semibold text-[#ff4d2d]'>Order ID: {currentOrder._id}</h2>
          <p className='text-gray-600'><span className='font-semibold text-gray-700'>Shop Name:</span> {currentOrder?.shopOrder?.shop.name}</p>
          <p className='text-gray-600'><span className='font-semibold text-gray-700'>Delivery Address:</span> {currentOrder.deliveryAddress?.text} <span className='text-xs text-gray-500'>(Lat: {currentOrder.deliveryAddress?.latitude}, Lon: {currentOrder.deliveryAddress?.longitude})</span></p>
          <p className='text-gray-600'><span className='font-semibold text-gray-700'>Items: {currentOrder.shopOrder.shopOrderItems.length} | Subtotal:</span> ₹{currentOrder.shopOrder.subtotal}</p>
          <DeliveryBoyTracking data={currentOrder}/>

          {showOtp ? <div className='flex flex-col gap-2 mt-3'>
            <input type='text' placeholder={`Enter OTP Send To: ${currentOrder.user.fullName}`} className='border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500'
            onChange={(e)=>setOtp(e.target.value)} value={otp}/>
            <button className='bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition w-full'
            onClick={verifyOtp}>
              Confirm Delivery
            </button>
          </div> : <button className='bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition mt-3 w-full' onClick={sendOtp}
          >
            Mark As Delivered
          </button>}
      </div>}
      </div>
    </div>
  )
}

export default DeliveryBoydash
