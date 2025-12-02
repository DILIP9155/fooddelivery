import React, { useEffect, useState } from "react";
import { serverUrl } from "../App";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { IoIosArrowRoundBack } from "react-icons/io";
import DeliveryBoyTracking from "../components/DeliveryBoyTracking";

const TrackOrderPage = () => {
  const { orderId } = useParams();
  const [currentOrder, setCurrentOrder] = useState(null);
  const navigate = useNavigate();

  const handleGetOrder = async () => {
    try {
      const result = await axios.get(
        `${serverUrl}/api/order/get-order-by-id/${orderId}`,
        { withCredentials: true }
      );
      setCurrentOrder(result.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    handleGetOrder();
  }, [orderId]);

  const getStatusClass = (status) => {
    switch (status) {
      case "Preparing":
        return "bg-yellow-100 text-yellow-800";
      case "Ready for Pickup":
        return "bg-blue-100 text-blue-800";
      case "Out for Delivery":
        return "bg-purple-100 text-purple-800";
      case "Delivered":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="w-screen min-h-screen flex flex-col gap-5 items-center bg-gradient-to-b from-orange-50 to-white overflow-y-auto pt-20">
      {/* Header */}
      <div className="flex gap-3 items-center w-full max-w-2xl px-5">
        <button
          onClick={() => navigate("/")}
          className="rounded-full bg-orange-100 text-orange-600 hover:bg-orange-200 transition p-1 shadow-sm"
        >
          <IoIosArrowRoundBack size={40} />
        </button>
        <h1 className="text-3xl font-extrabold text-[#ff4d2d] tracking-wide">
          Track Order 🚚
        </h1>
      </div>

      {/* Orders */}
      {currentOrder?.shopOrders?.map((shopOrder, index) => (
        <div
          key={index}
          className="bg-white p-5 rounded-2xl shadow-md mb-6 w-[90%] max-w-2xl hover:shadow-lg transition"
        >
          {/* Header */}
          <div className="border-b pb-3 mb-4 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-[#ff4d2d]">
              Shop: {shopOrder.shop.name}
            </h2>
            <span
              className={`px-4 py-1 rounded-full text-sm font-semibold uppercase tracking-wide ${getStatusClass(
                shopOrder.orderStatus
              )}`}
            >
              {shopOrder.orderStatus}
            </span>
          </div>

          {/* Items List */}
          <div className="max-h-56 overflow-y-auto divide-y">
            {shopOrder.shopOrderItems.map((item) => (
              <div
                key={item._id}
                className="flex justify-between items-center py-2"
              >
                <div>
                  <h3 className="font-medium text-gray-800">{item.name}</h3>
                  <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                </div>
                <span className="font-semibold text-gray-700">
                  ₹{item.price * item.quantity}
                </span>
              </div>
            ))}
          </div>

          {/* Total & Address */}
          <div className="border-t pt-3 mt-4 flex flex-col gap-3">
            <div className="flex justify-between text-lg font-bold text-[#ff4d2d]">
              <span>Total: ₹{shopOrder.subtotal}</span>
              <span className="text-sm font-medium text-gray-600">
                Order ID: {shopOrder._id}
              </span>
            </div>
            <p className="text-sm text-gray-700">
              <span className="font-semibold text-gray-800">
                Delivery Address:{" "}
              </span>
              {currentOrder.deliveryAddress?.text}
            </p>
          </div>

          {/* Delivery Boy / Delivered */}
          {shopOrder.status !== "delivered" ? (
            <div className="mt-5">
              <h3 className="text-md font-semibold text-gray-800">
                Delivery Person
              </h3>
              {shopOrder.assignedDeliveryBoy ? (
                <div className="border mt-2 rounded-lg p-3 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900">
                      {shopOrder.assignedDeliveryBoy.fullName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {shopOrder.assignedDeliveryBoy.mobile}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-sm mt-2">
                  Delivery Person not assigned yet.
                </p>
              )}
            </div>
          ) : (
            <div className="text-green-600 font-bold text-center mt-4">
              Order Delivered ✅
            </div>
          )}

          {(shopOrder.assignedDeliveryBoy && shopOrder.status !== "delivered") &&
            <div className="h-[400px] w-full rounded-2xl overflow-hidden shadow-md">
              <DeliveryBoyTracking data={
            {
              deliveryBoyLocation:{lat:shopOrder.assignedDeliveryBoy.location.coordinates[1],lon:shopOrder.assignedDeliveryBoy.location.coordinates[0]},

              customerLocation:{lat:currentOrder.deliveryAddress?.latitude,lon:currentOrder.deliveryAddress?.longitude}

            }

          }/>
            </div>
          }
        </div>
      ))}

      
    </div>
  );
};

export default TrackOrderPage;
