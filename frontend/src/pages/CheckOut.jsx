import React, { useEffect, useState } from "react";
import { IoIosArrowRoundBack } from "react-icons/io";
import { IoLocationSharp } from "react-icons/io5";
import { IoSearchOutline } from "react-icons/io5";
import { TbCurrentLocation } from "react-icons/tb";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { MdDeliveryDining } from "react-icons/md";
import { FaMobileScreenButton } from "react-icons/fa6";

import "leaflet/dist/leaflet.css";
import { FaCreditCard } from "react-icons/fa";

import { useDispatch, useSelector } from "react-redux";
import { setAddress, setLocation } from "../redux/mapSlice";
import axios from "axios";
import { serverUrl } from "../App";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { addMyOrder } from "../redux/userSlice";

const apikey = import.meta.env.VITE_GEOAPIKEY;
function RecenterMap({ location }) {
  if (location.lat && location.lon) {
    const map = useMap();
    map.setView([location.lat, location.lon], 16, { animate: true });
  }
  return null;
}

const CheckOut = () => {
  const { location, address } = useSelector((state) => state.map);
  const { cartItems, totalAmount, userData } = useSelector((state) => state.user);

  const [addressInput, setAddressInput] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const deliveryFee = totalAmount > 500 ? 0 : 40;

  const AmountWithDeliveryFee = totalAmount + deliveryFee;

  const onDragEnd = (e) => {
    const { lat, lng } = e.target._latlng;
    dispatch(setLocation({ lat, lon: lng }));

    getAddressByLatLng(lat, lng);
  };

  const getAddressByLatLng = async (lat, lng) => {
    try {
      const result = await axios.get(
        `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&format=json&apiKey=${apikey}`
      );

      dispatch(setAddress(result?.data?.results[0].formatted));
    } catch (error) {
      console.log(error);
    }
  };

  const getCurrentLocation = () => {
    
      const latitude = userData.location.coordinates[1];
      const longitude = userData.location.coordinates[0];

      dispatch(setLocation({ lat: latitude, lon: longitude }));
      getAddressByLatLng(latitude, longitude);
    
  };

  const getLatLngByAddress = async () => {
    try {
      const result = await axios.get(
        `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(
          addressInput
        )}&apiKey=${apikey}`
      );

      const { lat, lon } = result.data.features[0].properties;
      dispatch(setLocation({ lat, lon }));
    } catch (error) {
      console.log(error);
    }
  };

  const handlePlaceOrder = async() => {
    try {
      const result = await axios.post(`${serverUrl}/api/order/placeorder`,{
        paymentMethod,
        deliveryAddress:{
          text:addressInput,
          latitude:location.lat,
          longitude:location.lon
        },
        cartItems,
        totalAmount: AmountWithDeliveryFee
      },{
        withCredentials:true
      })

      if(paymentMethod === "cod"){
        dispatch(addMyOrder(result.data))
        navigate("/order-placed")
        toast.success("Order Placed Successfully")
      }
      else{
        const orderId = result.data.orderId;
        const razorOrder = result.data.razorOrder;
        openRazorapayWindow(orderId, razorOrder);
      }
    } catch (error) {
      console.log(error);
    }
  }

  const openRazorapayWindow=(orderId, razorOrder)=>{
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: razorOrder.amount,
      currency: 'INR',
      name: "AnuPam",
      description: "Food Delivery Website",
      order_id: razorOrder.id,
      handler: async function (response){
        try {
          const result = await axios.post(`${serverUrl}/api/order/verify-payment`,{
            orderId,
            razorpay_payment_id: response.razorpay_payment_id,
            
          },{withCredentials:true})

          dispatch(addMyOrder(result.data))
          navigate("/order-placed")
          toast.success("Order Placed Successfully")
        } catch (error) {
          console.log(error)
          toast.error("Payment verification failed, please contact support")
        }
      },
      prefill: {
        name: userData.fullName,
        email: userData.email,
        contact: userData.phone || ''
      },
      theme: {
        color: "#ff4d2d",
      },
    }
    const rzp = new window.Razorpay(options)
    rzp.open()
  }

  useEffect(() => {
    setAddressInput(address);
  }, [address]);
  return (
    <div className="min-h-screen bg-[#fff9f6] flex items-center justify-center p-6">
      <button
        onClick={() => navigate("/")}
        className="absolute top-4 left-4 flex items-center gap-1 text-[#ff4d2d] hover:text-[#e63d1f] transition-colors cursor-pointer"
      >
        <IoIosArrowRoundBack size={35} />
      </button>
      <div className="w-full max-w-[900px] bg-white rounded-2xl shadow-xl p-6 space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">Checkout</h1>

        <section>
          <h2 className="text-lg font-semibold mb-2 flex items-center gap-2 to-gray-800">
            <IoLocationSharp size={16} className="text-[#ff4d2d]" /> Delivery
            Location
          </h2>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              className="flex-1 border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]"
              placeholder="Enter Your Delivry Address..."
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
            />

            <button
              className="bg-[#ff4d2d] hover:bg-[#c5351b] text-white p-2 rounded-xl shadow-sm transition cursor-pointer"
              onClick={getLatLngByAddress}
            >
              <IoSearchOutline className="w-5 h-5" />
            </button>
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-xl shadow-sm transition cursor-pointer"
              onClick={getCurrentLocation}
            >
              <TbCurrentLocation className="w-5 h-5" />
            </button>
          </div>
          <div className="rounded-xl border overflow-hidden ">
            <div className="h-64 w-full flex items-center justify-center">
              <MapContainer
                className={"w-full h-full"}
                center={[location?.lat, location?.lon]}
                zoom={16}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <RecenterMap location={location} />
                <Marker
                  position={[location?.lat, location?.lon]}
                  draggable
                  eventHandlers={{ dragend: onDragEnd }}
                >
                  <Popup>
                    A pretty CSS3 popup. <br /> Easily customizable.
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3 text-gray-800">
            Payment Method
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${
                paymentMethod === "cod"
                  ? "border-[#ff4d2d] bg-orange-50 shadow"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => setPaymentMethod("cod")}
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full">
                <MdDeliveryDining className="text-green-600 text-xl bg-green-100 rounded-full" />
              </span>

              <div>
                <p className="font-medium text-gray-800">Cash On Delivery</p>
                <p className="text-xs text-gray-500">
                  Pay when your food arrives
                </p>
              </div>
            </div>
            <div
              className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${
                paymentMethod === "online"
                  ? "border-[#ff4d2d] bg-orange-50 shadow"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => setPaymentMethod("online")}
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 shadow-sm">
                <FaMobileScreenButton className="text-purple-700 text-xl" />
              </span>

              {/* Credit card icon */}
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 shadow-sm">
                <FaCreditCard className="text-blue-700 text-xl" />
              </span>
              <div>
                <p className="font-medium text-gray-800">
                  UPI / Credit / Debit Card
                </p>
                <p className="text-xs text-gray-500">Pay Securely Online</p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3 text-gray-800">
            Order Summary
          </h2>
          <div className="rounded-xl border bg-gray-50 p-4 space-y-2">
            {cartItems.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between"
              >
                <span className="text-gray-700 font-medium">
                  {item.name} × {item.quantity}
                </span>
                <span className="text-gray-900 font-semibold">
                  ₹{item.price * item.quantity}
                </span>
              </div>

            ))}
            <hr className="border-gray-200 my-2"/>
            <div className="flex justify-between text-gray-700 font-medium">
              <span>Subtotal</span>
              <span>{totalAmount}</span>
            </div>

            <div className="flex justify-between text-gray-700 font-medium">
              <span>Delivery Fee</span>
              <span>{deliveryFee == 0?"Free":deliveryFee}</span>
            </div>

            <div className="flex justify-between text-[#ff4d2d] font-bold text-lg pt-2">
              <span>Total</span>
              <span>{AmountWithDeliveryFee}</span>
            </div>

          </div>
        </section>
        <button className="w-full bg-[#ff4d2d] hover:bg-[#e63d1f] text-white font-bold py-3 px-6 rounded-xl shadow-lg transition"
        onClick={handlePlaceOrder}>
          {paymentMethod=="cod"?"Place Order":"Pay & Place Order"}</button>
      </div>
    </div>
  );
};

export default CheckOut;
