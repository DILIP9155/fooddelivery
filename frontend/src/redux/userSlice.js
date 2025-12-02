import { createSlice } from "@reduxjs/toolkit";
// Removed direct server imports - frontend should call APIs via axios instead

const userSlice = createSlice({
  name: "user",
  initialState: {
    userData: null,
    currentCity: null,
    currentState: null,
    currentAddress: null,
    shopInMyCity: [],
    itemsInMyCity: [],
    cartItems: [],
    totalAmount: 0,
    myOrders: [],
    searchItems: null,
    socket: null,
  },
  reducers: {
    setUserData: (state, action) => {
      state.userData = action.payload;
    },
    setCurrentCity: (state, action) => {
      state.currentCity = action.payload;
    },
    setCurrentState: (state, action) => {
      state.currentState = action.payload;
    },
    setCurrentAddress: (state, action) => {
      state.currentAddress = action.payload;
    },
    setShopsInMyCity: (state, action) => {
      state.shopInMyCity = action.payload;
    },
    setItemsInMyCity: (state, action) => {
      state.itemsInMyCity = action.payload;
    },
    setSocket: (state, action) => {
      state.socket = action.payload;
    },

    addToCart: (state, action) => {
      const cartItem = action.payload;
      const existing = state.cartItems.find((i) => i.id === cartItem.id);
      if (existing) {
        existing.quantity += cartItem.quantity;
      } else {
        state.cartItems.push(cartItem);
      }

      state.totalAmount = state.cartItems.reduce(
        (sum, i) => sum + i.price * i.quantity,
        0
      );
    },

    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.cartItems.find((i) => i.id == id);

      if (item) {
        item.quantity = quantity;
      }
      state.totalAmount = state.cartItems.reduce(
        (sum, i) => sum + i.price * i.quantity,
        0
      );
    },

    removeCartItem: (state, action) => {
      state.cartItems = state.cartItems.filter((i) => i.id !== action.payload);
      state.totalAmount = state.cartItems.reduce(
        (sum, i) => sum + i.price * i.quantity,
        0
      );
    },

    setMyOrders: (state, action) => {
      state.myOrders = action.payload;
    },

    addMyOrder: (state, action) => {
      state.myOrders = [action.payload, ...state.myOrders];
    },

    updateOrderStatus: (state, action) => {
      const { orderId, shopId, status } = action.payload;

      const order = state.myOrders.find((o) => o._id === orderId);
      if (order) {
        if (order.shopOrders) {
          const shopOrder = order.shopOrders.find(
            (so) => so.shop._id === shopId
          );
          if (shopOrder) {
            shopOrder.status = status;
          }
        }
      }
    },
    setSearchItems: (state, action) => {
      state.searchItems = action.payload;
    },
    updateItemRating: (state, action) => {
      const { itemId, rating } = action.payload;
      // Update items in arrays: itemsInMyCity and searchItems
      if (state.itemsInMyCity && state.itemsInMyCity.length > 0) {
        state.itemsInMyCity = state.itemsInMyCity.map((it) =>
          it._id?.toString() === itemId?.toString() ? { ...it, rating } : it
        );
      }
      if (state.searchItems && state.searchItems.length > 0) {
        state.searchItems = state.searchItems.map((it) =>
          it._id?.toString() === itemId?.toString() ? { ...it, rating } : it
        );
      }
    },
  },
});

export const {
  setUserData,
  setCurrentCity,
  setCurrentState,
  setCurrentAddress,
  setShopsInMyCity,
  setItemsInMyCity,
  addToCart,
  updateQuantity,
  removeCartItem,
  setMyOrders,
  addMyOrder,
  updateOrderStatus,
  setSearchItems,
  updateItemRating,
  setSocket,
} = userSlice.actions;

export default userSlice.reducer;
