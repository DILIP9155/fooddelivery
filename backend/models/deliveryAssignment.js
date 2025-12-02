import mongoose from "mongoose";
const deliveryAssignmentSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
  },
  shop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Shop",
  },
  shopOrderId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  brodcastedTo: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Assuming User model represents delivery personnel
    },
  ],
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Assuming User model represents delivery personnel
    default: null,
  },
  status: {
    type: String,
    enum: ["brodcasted", "assigned", "completed"],
    default: "brodcasted",
  },
  acceptedAt: Date,
});

const DeliveryAssignment = mongoose.model(
  "DeliveryAssignment",
  deliveryAssignmentSchema
);

export default DeliveryAssignment;
