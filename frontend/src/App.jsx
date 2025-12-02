import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import { ToastContainer, toast } from "react-toastify";

import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import Usercurrent from "./hooks/Usercurrent";
import { useDispatch, useSelector } from "react-redux";
import Home from "./pages/Home";
import UserGetCity from "./hooks/UserGetCity";
import useGetMyShop from "./hooks/useGetMyShop";
import CreateEditShop from "./pages/CreateEditShop";
import Additems from "./pages/Additems";
import Edititem from "./pages/Edititem";
import useGetshopBycity from "./hooks/useGetshopBycity";
import useGetItemBycity from "./hooks/useGetItemBycity";
import FoodCart from "./components/FoodCart";
import CheckOut from "./pages/CheckOut";
import OrderPlaced from "./pages/OrderPlaced";
import Myorders from "./pages/Myorders";
import useGetMyOrder from "./hooks/useGetMyOrder";
import useUpdateLocation from "./hooks/useUpdateLocation";
import TrackOrderPage from "./pages/TrackOrderPage";
import Shop from "./pages/Shop";
import { useEffect } from "react";
import { io } from "socket.io-client";
import { setSocket } from "./redux/userSlice";
import { updateItemRating } from "./redux/userSlice";

export const serverUrl = "https://anupam-backend.onrender.com";
function App() {
  const { userData } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  Usercurrent();
  useUpdateLocation();

  UserGetCity();
  useGetMyShop();
  useGetshopBycity();
  useGetItemBycity();
  useGetMyOrder();
 
  
  useEffect(() => {
    // create socket instance only once
    const socketInstance = io(serverUrl, { withCredentials: true });
    dispatch(setSocket(socketInstance));

    // On connect or reconnect: emit identity if userData available
    const identify = () => {
      if (userData && socketInstance.connected) {
        socketInstance.emit("identity", { userId: userData._id });
      }
    };
    socketInstance.on("connect", identify);
    socketInstance.on("reconnect", identify);
    const onItemRated = (payload) => {
      // payload: { itemId, rating }
      dispatch(updateItemRating({ itemId: payload.itemId, rating: payload.rating }));
    };
    socketInstance.on("item-rated", onItemRated);

    // If userData changes after socket created, re-identify
    if (userData) {
      identify();
    }

    return () => {
      socketInstance.off("connect", identify);
      socketInstance.off("reconnect", identify);
      socketInstance.off("item-rated", onItemRated);
      socketInstance.disconnect();
    };
  }, [userData, dispatch]);
  return (
    <>
      <ToastContainer
        position="top-center"
        style={{ zIndex: 20000 }}
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <Routes>
        <Route
          path="/signup"
          element={!userData ? <SignUp /> : <Navigate to={"/"} />}
        />
        <Route
          path="/login"
          element={!userData ? <Login /> : <Navigate to={"/"} />}
        />
        <Route
          path="/forgot-password"
          element={!userData ? <ForgotPassword /> : <Navigate to={"/"} />}
        />
        <Route
          path="/"
          element={userData ? <Home /> : <Navigate to={"/login"} />}
        />

        <Route
          path="/create-edit-shop"
          element={userData ? <CreateEditShop /> : <Navigate to={"/login"} />}
        />

        <Route
          path="/add-food"
          element={userData ? <Additems /> : <Navigate to={"/login"} />}
        />

        <Route
          path="/edit-food/:itemId"
          element={userData ? <Edititem /> : <Navigate to={"/login"} />}
        />

        <Route
          path="/food-cart"
          element={userData ? <FoodCart /> : <Navigate to={"/login"} />}
        />

        <Route
          path="/checkOut"
          element={userData ? <CheckOut /> : <Navigate to={"/login"} />}
        />
        <Route
          path="/order-placed"
          element={userData ? <OrderPlaced /> : <Navigate to={"/login"} />}
        />
        <Route
          path="/my-orders"
          element={userData ? <Myorders /> : <Navigate to={"/login"} />}
        />

        <Route
          path="/track-order/:orderId"
          element={userData ? <TrackOrderPage /> : <Navigate to={"/login"} />}
        />

        <Route
          path="/shop/:shopId"
          element={userData ? <Shop /> : <Navigate to={"/login"} />}
        />
      </Routes>
    </>
  );
}

export default App;
