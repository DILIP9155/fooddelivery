import React, { useRef, useState } from "react";
import Nav from "./Nav";
import { categories } from "../category";
import CategoryCard from "./CategoryCard";
import { useSelector } from "react-redux";
import FoodCard from "./FoodCard";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { serverUrl } from "../App";

const UserDashboard = () => {
  const {currentCity,  shopInMyCity, itemsInMyCity, searchItems} = useSelector(state=>state.user)
  const scrollRef = useRef(null);
  const navigate = useNavigate();
  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef?.current?.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const [updatedItemsList, setUpdatedItemsList] = useState([])

  const handleFilterByCategory=(category)=>{
    if(category == "All"){
      setUpdatedItemsList(itemsInMyCity)
    }
    else{
      const filteredList = itemsInMyCity?.filter(i=>i.category===category)

      setUpdatedItemsList(filteredList)
    }
  }

  
  useEffect(()=>{
    setUpdatedItemsList(itemsInMyCity)
  },[itemsInMyCity])

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef?.current?.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  return (
    <div className="w-screen min-h-screen flex flex-col gap-5 items-center bg-[#fff9f6] overflow-y-auto mt-20">
      <Nav />
       
      {searchItems && searchItems.length > 0 &&
      <div className="w-full max-w-6xl flex flex-col gap-5 items-start p-5 bg-white shadow-md rounded-2xl mt-4">
        <h1 className="text-gray-800 text-2xl sm:text-3xl font-semibold border-b border-gray-200 pb-2">Search Results</h1>
        <div className="w-full h-auto flex flex-wrap gap-[20px] justify-center">
          {searchItems?.map((item,index)=>(
            <FoodCard key={index} data={item}/>
          ))}
      </div>
        </div> 
      }
      <div className="w-full max-w-6xl flex flex-col gap-5 items-start p-4 relative">
        <h1 className="text-gray-800 text-2xl sm:text-3xl font-light mb-2">
          Inspiration for your first order
        </h1>

        {/* horizontal scroll container */}
        <div className="relative w-full">
          {/* paper-style arrow buttons */}
          <button
            onClick={scrollLeft}
            className="
              absolute left-0 top-1/2 -translate-y-1/2 
              bg-red-500/90 backdrop-blur-sm 
              shadow-md rounded-full 
              px-3 py-1 text-gray-700 
              hover:bg-orange-500 hover:shadow-lg 
              hidden sm:flex items-center justify-center z-10
            "
          >
            &#10094;
          </button>

          <button
            onClick={scrollRight}
            className="
              absolute right-0 top-1/2 -translate-y-1/2 
              bg-red-500/90 backdrop-blur-sm 
              shadow-md rounded-full 
              px-3 py-1 text-gray-700 
              hover:bg-orange-500 hover:shadow-lg 
              hidden sm:flex items-center justify-center z-10
            "
          >
            &#10095;
          </button>

          <div
            ref={scrollRef}
            className="w-full overflow-x-auto scrollbar-hide"
          >
            <div className="flex gap-4 sm:gap-6">
              {categories.map((cate, index) => (
                <CategoryCard name={cate.category} key={index} image={cate.image} onClick={()=>handleFilterByCategory(cate.category)}/>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-6xl flex flex-col gap-5 items-start p-4 ">
        <h1 className="text-gray-800 text-2xl sm:text-3xl">
          Best Shop in {currentCity}
        </h1>

        <div className="relative w-full">
          {/* paper-style arrow buttons */}
          <button
            onClick={scrollLeft}
            className="
              absolute left-0 top-1/2 -translate-y-1/2 
              bg-red-500/90 backdrop-blur-sm 
              shadow-md rounded-full 
              px-3 py-1 text-gray-700 
              hover:bg-orange-500 hover:shadow-lg 
              hidden sm:flex items-center justify-center z-10
            "
          >
            &#10094;
          </button>

          <button
            onClick={scrollRight}
            className="
              absolute right-0 top-1/2 -translate-y-1/2 
              bg-red-500/90 backdrop-blur-sm 
              shadow-md rounded-full 
              px-3 py-1 text-gray-700 
              hover:bg-orange-500 hover:shadow-lg 
              hidden sm:flex items-center justify-center z-10
            "
          >
            &#10095;
          </button>

          <div
            ref={scrollRef}
            className="w-full overflow-x-auto scrollbar-hide"
          >
            <div className="flex gap-4 sm:gap-6">
              {shopInMyCity?.map((shop, index) => (
                <CategoryCard name={shop.name} key={index} image={shop.image} onClick={()=>navigate(`/shop/${shop._id}`)}/>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-6xl flex flex-col gap-5 items-start p-4 ">
          <h1 className="text-gray-800 text-2xl sm:text-3xl">Suggested Food Items</h1>
      
      <div className="w-full h-auto flex flex-wrap gap-[20px] justify-center">
          {updatedItemsList?.map((item,index)=>(
            <FoodCard key={index} data={item}/>
          ))}
      </div>
      </div>
    </div>
  );
};

export default UserDashboard;
