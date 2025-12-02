import React, { useState } from "react";
import { useEffect } from "react";
import { FaLeaf, FaDrumstickBite, FaStar, FaRegStar, FaMinus, FaPlus, FaShoppingCart } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../redux/userSlice";
import axios from "axios";
import { serverUrl } from "../App";
import { updateItemRating } from "../redux/userSlice";

// helper for stars
const renderStars = (rating, onRate, hoverRating, setHover) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    const filled = i <= (hoverRating || rating);
    stars.push(
      <button
        key={i}
        className="p-0 m-0"
        onMouseEnter={() => setHover && setHover(i)}
        onMouseLeave={() => setHover && setHover(0)}
        onClick={(e) => {
          e.stopPropagation();
          onRate && onRate(i);
        }}
        type="button"
        aria-label={`Rate ${i} star`}
      >
        {filled ? (
          <FaStar className="text-yellow-500 text-sm" />
        ) : (
          <FaRegStar className="text-yellow-500 text-sm" />
        )}
      </button>
    );
  }
  return stars;
};

const FoodCard = ({ data }) => {
  const [quantity, setQuantity] = useState(0);

  const {cartItems} = useSelector((state) => state.user)
  const dispatch = useDispatch()
  const { userData } = useSelector(state => state.user);

  const increment = () => setQuantity((q) => q + 1);
  const decrement = () => setQuantity((q) => (q > 0 ? q - 1 : 0));
  const [localRating, setLocalRating] = useState(data.userRating || data.rating?.average || 0);
  const [localCount, setLocalCount] = useState(data.rating?.count || 0);
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    setLocalRating(data.userRating ?? data.rating?.average ?? 0);
    setLocalCount(data.rating?.count ?? 0);
  }, [data.rating, data.userRating]);

  const rateItem = async (rating) => {
    if (!userData) {
      // require login
      alert('Login to rate items');
      return;
    }
    // Optimistic update first: show the clicked rating immediately
    // Increase count by 1 optimistically (server will correct exact values)
    setLocalRating(rating);
    setLocalCount((c) => c + 1);
    try {
      const result = await axios.post(`${serverUrl}/api/item/rate/${data._id}`, { rating }, { withCredentials: true });
      if (result.data?.rating) {
        setLocalRating(result.data.rating.average);
        setLocalCount(result.data.rating.count);
        dispatch(updateItemRating({ itemId: data._id, rating: result.data.rating }));
      }
    } catch (error) {
      console.log('rating error', error?.response?.data || error.message);
    }
  }

  return (
    <div className="max-w-xs bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">
      {/* Image + badge */}
      <div className="relative">
        <img
          src={data.image}
          alt={data.name}
          className="w-full h-40 object-cover"
        />
        <div className="absolute top-2 left-2 flex items-center justify-center w-8 h-8 rounded-full bg-white shadow">
          {data.foodType === "Veg" ? (
            <FaLeaf className="text-green-600 text-lg" />
          ) : (
            <FaDrumstickBite className="text-red-500 text-lg" />
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-4 space-y-2">
        <h1 className="text-lg font-semibold truncate">{data.name}</h1>

        {/* Stars + count */}
        <div className="flex items-center gap-1">
          <div className="flex">{renderStars(localRating, rateItem, hoverRating, setHoverRating)}</div>
          <span className="text-sm text-gray-500">
            ({localCount || 0})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-gray-800">
            ₹{data.price}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={decrement}
              className="p-1 rounded-full bg-gray-200 hover:bg-gray-300"
            >
              <FaMinus className="text-gray-700 text-sm" />
            </button>
            <span className="font-medium">{quantity}</span>
            <button
              onClick={increment}
              className="p-1 rounded-full bg-gray-200 hover:bg-gray-300"
            >
              <FaPlus className="text-gray-700 text-sm" />
            </button>
          </div>
        </div>

        {/* Add to cart button */}
        <button
          className={`${cartItems.some(i=>i.id==data._id) ? "bg-gray-800" : "bg-[#ff4d2d]"} w-full flex items-center justify-center gap-2 mt-3 text-white py-2 px-3 rounded-xl font-medium transition-colors duration-200`}
          disabled={cartItems.some(i=>i.id==data._id)}
          onClick={() =>{
            quantity>0?dispatch(addToCart({
            id: data._id,
            name: data.name,
            price: data.price,
            image: data.image,
            shop: data.shop,
            quantity,
            foodType: data.foodType,
          })):null
          }}
        >
          <FaShoppingCart />
          {cartItems.some(i=>i.id==data._id) ? "Added" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
};

export default FoodCard;
