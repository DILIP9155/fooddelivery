import React, { use, useState } from "react";
import { FaPhoneAlt } from "react-icons/fa";
import { serverUrl } from "../App";
import { toast } from "react-toastify";
import axios from "axios";
import { useDispatch } from "react-redux";
import { updateOrderStatus } from "../redux/userSlice";

const OwnerOrderCard = ({ data, onStatusChange }) => {

  const [availableBoys, setAvailableBoys] = useState([]);
  const dispatch = useDispatch()
  
  const handleUpdateStatus = async (orderId, shopId, status) => {
    try {
      const result = await axios.post(`${serverUrl}/api/order/update-status/${orderId}/${shopId}`,{status},{withCredentials:true});

      dispatch(updateOrderStatus({orderId, shopId, status}))

      setAvailableBoys(result.data.freeDeliveryBoys)
      console.log(result.data)
                  console.log(availableBoys);

      toast.success("Status updated successfully");
      
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-4">
      {/* Customer Info */}
      <div className="flex justify-between border-b pb-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">
            {data.user?.fullName}
          </h2>
          <p className="text-sm text-gray-500">{data.user?.email}</p>
          <p className="flex items-center gap-1 text-sm text-gray-500 mt-1">
            <FaPhoneAlt className="text-blue-500" />
            {data.user?.mobile}
          </p>
          {data.paymentMethod == "online" ? <p className="gap-2 text-gray-600 text-sm">Payment: {data.payment?"true":"false"}</p> : <p className="gap-2 text-gray-600 text-sm">Payment Method: {data.paymentMethod}</p>}
          
        </div>

        <div className="text-right text-sm text-gray-500">
          <p>
            <span className="font-semibold text-gray-700">Order #</span>{" "}
            <span className="text-red-400">{data._id.slice(-6)}</span>
          </p>
          <p>
            {new Date(data.createdAt).toLocaleString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </div>

      {/* Address */}
      <div className="mt-3">
        <p className="text-sm text-gray-700">
          <span className="font-semibold">Delivery:</span>{" "}
          {data?.deliveryAddress?.text}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Lat: {data?.deliveryAddress?.latitude} | Lon:{" "}
          {data?.deliveryAddress?.longitude}
        </p>
      </div>

      {/* Items */}
      <div className="mt-3 space-y-2">
        {data.shopOrders[0]?.shopOrderItems?.map((item, index) => {
          const imgSrc =
            item.item?.image || item.image || placeholderImage;

          return (
            <div
              key={index}
              className="flex items-center bg-gray-50 p-3 rounded-lg shadow-sm"
            >
              <img
                src={imgSrc}
                alt={item.name}
                className="w-14 h-14 object-cover rounded-md border mr-3"
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">{item.name}</p>
                <p className="text-xs text-gray-500">
                  {item.quantity} × ₹{item.price}
                </p>
              </div>
              <div className="text-sm font-semibold text-gray-800">
                ₹{item.quantity * item.price}
              </div>
            </div>
          );
        })}
      </div>

      {/* Status & Total */}
      <div className="flex justify-between items-center border-t pt-3 mt-3">
        <div className="flex items-center gap-2 justify-between">
          <span className="text-sm font-medium text-gray-700">
            Status: <span className="text-orange-400 font-semibold text-lg">{data.shopOrders[0]?.status}</span>
          </span>
        </div>
        <div>
           <select
            className="border rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-[#ff4d2d] "
            onChange={(e)=>handleUpdateStatus(data._id, data.shopOrders[0]?._id, e.target.value)}
          >
            <option value="">Change</option>
            <option value="pending">Pending</option>
            <option value="preparing">Preparing</option>
            <option value="out-for-delivery">Out For Delivery</option>
          </select>
          {data.shopOrders[0]?.status === "out-for-delivery" && (
            <div className="mt-3 p-2 border rounded-lg text-sm bg-orange-50">
              {data.shopOrders[0]?.assignedDeliveryBoy ? (
                <div>
                  <p className="font-semibold text-green-700">Assigned Delivery Boy:</p>
                  <div className="text-gray-700">
                    {data.shopOrders[0].assignedDeliveryBoy.fullName} - {data.shopOrders[0].assignedDeliveryBoy.mobile}
                  </div>
                </div>
              ) : (
                <>
                  <p>Available Delivery Boys:</p>
                  {availableBoys.length > 0 ? (
                    availableBoys.map((b, index) => (
                      <div className="text-gray-500" key={index}>{b.fullName} - {b.mobile}</div>
                    ))
                  ) : (
                    <div className="text-gray-500">Waiting for delivery boy to accept</div>
                  )}
                </>
              )}
            </div>
          )}
          <div className="mt-2 text-right">
            <p className="font-bold text-[#ff4d2d] text-lg">
          Total: ₹{data.shopOrders[0].subtotal}
        </p>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default OwnerOrderCard;
