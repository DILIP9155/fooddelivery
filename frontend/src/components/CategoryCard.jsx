import React from 'react'

const CategoryCard = ({ name, image, onClick}) => {
  return (
    <div
      className="
        w-[120px] h-[120px] md:w-[180px] md:h-[180px] 
        rounded-2xl border-2 border-[#ff4d2d] 
        shrink-0 overflow-hidden bg-white 
        shadow-xl shadow-gray-200 hover:shadow-lg 
        transition-shadow cursor-pointer relative
      "
      onClick={()=>onClick()}
    >
      {/* Image wrapper */}
      <div className="w-full h-full overflow-hidden">
        <img
          src={image}
          alt=""
          className="w-full h-full object-cover transition-transform duration-300 ease-in-out hover:scale-110"
        />
      </div>

      {/* Category name at bottom */}
      <div
        className="
          absolute bottom-0 left-0 right-0 
          bg-gray-300 text-gray-800 
          text-sm md:text-base font-medium 
          px-2 py-1 text-center
          rounded-2xl
        "
      >
        {name}
      </div>
    </div>
  )
}

export default CategoryCard
