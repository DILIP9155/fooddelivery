import React from 'react';
import { useNavigate } from 'react-router-dom';

const UserOrderCard = ({ data }) => {
  const naviage = useNavigate()
  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-4">
      {/* Header */}
      <div className="flex justify-between border-b pb-2">
        <div>
          <p className="font-semibold">
            Order #<span className="text-red-400">{data._id.slice(-6)}</span>
          </p>
          <p className="text-sm text-gray-500">
            Date:{' '}
            {new Date(data.createdAt).toLocaleString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
        <div className="text-right">
          {data.paymentMethod==="cod" ? <p className="font-semibold text-gray-500">
            {data.paymentMethod?.toUpperCase()}
          </p> : <p className="font-semibold text-gray-500">Payment:
            {data.payment?" true":" false"}
          </p>}
          
          <p className="font-medium text-blue-500">
            {data.shopOrders[0]?.status}
          </p>
        </div>
      </div>

      {/* Shop Orders */}
      <div>
        {data.shopOrders?.map((shopOrder, idx) => (
          <div key={idx} className="mt-3">
            <div className="font-bold mb-2">
              Shop: {shopOrder.shop?.name}
            </div>

            <div className="space-y-2">
              {shopOrder.shopOrderItems?.map((item, i) => {
                const imgSrc =
                  item.item?.image ||
                  item.image ||
                  (item.images && item.images[0]) ||
                  placeholderImage;

                return (
                  <div
                    key={i}
                    className="flex items-center bg-gray-50 p-3 rounded-lg shadow-sm"
                  >
                    {/* Image */}
                    <img
                      src={imgSrc}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-md border mr-3"
                    />

                    {/* Name & qty */}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        Qty: {item.quantity} × ₹{item.price}
                      </p>
                    </div>

                    {/* Line total */}
                    <div className="text-sm font-semibold text-gray-800">
                      ₹{item.price * item.quantity}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className='flex justify-between items-center border-t pt-2 mt-3'>
              <p className='font-semibold'>
                Subtotal: ₹{shopOrder.subtotal}
              </p>
              <span className='text-sm font-medium text-blue-600'>Status: {data.shopOrders[0]?.status}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t pt-2 mt-3 flex justify-between font-bold text-lg text-[#ff4d2d]">
        <span>Total Amount: ₹{data.totalAmount}</span>
        <button
          onClick={() => naviage(`/track-order/${data._id}`)}
          className='bg-[#ff4d2d] hover:bg-[#e64525] text-white font-medium px-4 py-2 rounded-lg shadow'

        >
          Track Order
        </button>
      </div>


    </div>
  );
};

export default UserOrderCard;
