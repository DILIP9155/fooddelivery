import Order from "../models/orderModel.js";
import DeliveryAssignment from "../models/deliveryAssignment.js";
import Shop from "../models/shopModel.js";
import User from "../models/userModel.js";
import { sendDeliveryOtpMail } from "../utils/mailer.js";
import RazorPay from "razorpay";
import dotenv from "dotenv";
dotenv.config();
let instance = new RazorPay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});
export const placeOrder = async (req, res) => {
  try {
    const { cartItems, paymentMethod, deliveryAddress, totalAmount } = req.body;
    if (cartItems.length === 0 || !cartItems) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    if (
      !deliveryAddress.text ||
      !deliveryAddress.latitude ||
      !deliveryAddress.longitude
    ) {
      return res.status(400).json({ message: "Delivery address is required" });
    }

    if (!paymentMethod) {
      return res.status(400).json({ message: "Payment method is required" });
    }

    const groupItemsByShops = {};

    cartItems.forEach((item) => {
      const shopId = item.shop;
      if (!groupItemsByShops[shopId]) {
        groupItemsByShops[shopId] = [];
      }
      groupItemsByShops[shopId].push(item);
    });

    const shopOrders = await Promise.all(
      Object.keys(groupItemsByShops).map(async (shopId) => {
        const shop = await Shop.findById(shopId).populate("owner");

        if (!shop) {
          return res.status(404).json({ message: "Shop not found" });
        }

        const items = groupItemsByShops[shopId];

        const subtotal = items.reduce(
          (acc, item) => acc + Number(item.price) * Number(item.quantity),
          0
        );

        return {
          shop: shop._id,
          owner: shop.owner._id,
          subtotal,
          shopOrderItems: items.map((i) => ({
            item: i.id,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
          })),
        };
      })
    );

    if (paymentMethod === "online") {
      const razorOrder = await instance.orders.create({
        amount: Math.round(totalAmount * 100), // amount in the smallest currency unit
        currency: process.env.CURRENCY,
        receipt: `receipt_${Date.now()}`,
      });

      const newOrder = await Order.create({
        user: req.userId,
        paymentMethod,
        deliveryAddress,
        totalAmount,
        shopOrders,
        razorpayOrderId: razorOrder.id,
        payment: false,
      });

      return res.status(200).json({
        razorOrder,
        orderId: newOrder._id,
        key_id: process.env.RAZORPAY_KEY_ID,
      });
    }
    const newOrder = await Order.create({
      user: req.userId,
      paymentMethod,
      deliveryAddress,
      totalAmount,
      shopOrders,
    });

    await newOrder.populate(
      "shopOrders.shopOrderItems.item",
      "name image price"
    );

    await newOrder.populate("shopOrders.shop", "name");

    await newOrder.populate("shopOrders.owner", "name socketId");

    await newOrder.populate("user", "name email mobile");

    const io = req.app.get("io");

    if (io) {
      newOrder.shopOrders.forEach((shopOrder) => {
        const shopOwnerId = shopOrder.owner.toString();
        const shopOwnerSocketId = req.app.get("onlineUsers")?.[shopOwnerId];
        if (shopOwnerSocketId) {
          io.to(shopOwnerSocketId).emit("newOrder", {
            _id: newOrder._id,
            paymentMethod: newOrder.paymentMethod,
            user: newOrder.user,
            shopOrders: shopOrders,
            deliveryAddress: newOrder.deliveryAddress,
            createdAt: newOrder.createdAt,
            payment: newOrder.payment,
          });
        }
      });
    }

    return res.status(201).json(newOrder);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_payment_id, orderId } = req.body;
    const payment = await instance.payments.fetch(razorpay_payment_id);
    if (!payment || payment.status !== "captured") {
      return res.status(400).json({ message: "Paymet not successful" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.payment = true;
    order.razorpayPaymentId = razorpay_payment_id;
    await order.save();
    await order.populate("shopOrders.shopOrderItems.item", "name image price");

    await order.populate("shopOrders.shop", "name");

    return res.status(200).json(order);
  } catch (error) {
    return res
      .status(500)
      .json({ message: `verified payment order error ${error}` });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (user.role == "user") {
      const orders = await Order.find({ user: req.userId })
        .sort({ createdAt: -1 })
        .populate("shopOrders.shop", "name")
        .populate("shopOrders.owner", "name email mobile")
        .populate("shopOrders.shopOrderItems.item", "name price image");
      return res.status(200).json(orders);
    } else if (user.role == "owner") {
      const orders = await Order.find({ "shopOrders.owner": req.userId })
        .sort({ createdAt: -1 })
        .populate("shopOrders.shop", "name")
        .populate("user")
        .populate("shopOrders.shopOrderItems.item", "name price image")
        .populate("shopOrders.assignedDeliveryBoy", "fullName mobile");

      const filteredOrders = orders.map((order) => {
        // Only include shopOrders belonging to this owner
        const ownerShopOrders = order.shopOrders.filter(
          (so) => so.owner._id.toString() === req.userId.toString()
        );
        return {
          _id: order._id,
          paymentMethod: order.paymentMethod,
          user: order.user,
          shopOrders: ownerShopOrders,
          deliveryAddress: order.deliveryAddress,
          createdAt: order.createdAt,
          payment: order.payment,
        };
      });

      return res.status(200).json(filteredOrders);
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, shopId } = req.params;
    const { status } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const shopOrder = order.shopOrders.find(
      (so) => so._id.toString() === shopId.toString()
    );

    if (!shopOrder) {
      console.error(
        "Shop order not found for shopId:",
        shopId,
        "in order:",
        order._id
      );
      return res.status(404).json({ message: "Shop order not found" });
    }
    if (!shopOrder.shop) {
      console.error("Shop reference missing in shopOrder:", shopOrder._id);
      return res
        .status(404)
        .json({ message: "Shop reference missing in shopOrder" });
    }

    shopOrder.status = status || shopOrder.status;

    let deliveryBoyPayload = [];

    if (status == "out-for-delivery" && !shopOrder.assignment) {
      const { longitude, latitude } = order.deliveryAddress;

      const nearByDeliveryBoy = await User.find({
        role: "deliveryBoy",
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [Number(longitude), Number(latitude)],
            },
            $maxDistance: 5000, // 5 km
          },
        },
      });

      const nearByIds = nearByDeliveryBoy.map((d) => d._id);

      const busyIds = await DeliveryAssignment.find({
        assignedTo: { $in: nearByIds },
        status: { $nin: ["brodcasted", "completed"] },
      }).distinct("assignedTo");

      const busyIdSet = new Set(busyIds.map((id) => id.toString()));

      const freeDeliveryBoys = nearByDeliveryBoy.filter(
        (d) => !busyIdSet.has(d._id.toString())
      );

      const candidates = freeDeliveryBoys.map((d) => d._id);

      if (candidates.length == 0) {
        await order.save();
        return res.status(200).json({
          message: "No delivery",
        });
      }

      const deliveryAssignment = await DeliveryAssignment.create({
        order: order._id,
        shop: shopOrder.shop,
        shopOrderId: shopOrder._id,
        brodcastedTo: candidates,
        status: "brodcasted",
      });
      if (!deliveryAssignment) {
        console.error(
          "Delivery assignment creation failed for order:",
          order._id,
          "shopOrder:",
          shopOrder._id
        );
        return res
          .status(500)
          .json({ message: "Delivery assignment creation failed" });
      }
      shopOrder.assignedDeliveryBoy = deliveryAssignment.assignedTo;
      shopOrder.assignment = deliveryAssignment._id;

      deliveryBoyPayload = freeDeliveryBoys.map((d) => ({
        deliveryId: d._id,
        fullName: d.fullName,
        longitude: d.location.coordinates?.[0],
        latitude: d.location.coordinates?.[1],
        mobile: d.mobile,
      }));
    }

    await order.save();
    await order.populate("shopOrders.shop", "name");
    await order.populate("shopOrders.assignedDeliveryBoy", "name email mobile");

    const updatedShopOrder = order.shopOrders.find(
      (so) => so._id.toString() === shopId.toString()
    );

    if (!updatedShopOrder) {
      return res
        .status(404)
        .json({ message: "Shop order not found after update" });
    }

    return res.status(200).json({
      shopOrder: updatedShopOrder,
      assignedDeliveryBoy: updatedShopOrder?.assignedDeliveryBoy,
      freeDeliveryBoys: deliveryBoyPayload,
      assignment: updatedShopOrder?.assignment._id,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getDeliveryBoyAssignment = async (req, res) => {
  try {
    const deliveryBoyId = req.userId;
    const assignments = await DeliveryAssignment.find({
      brodcastedTo: deliveryBoyId,
      status: "brodcasted",
    })
      .populate("order")
      .populate("shop");

    const formated = assignments.map((a) => ({
      assignmentId: a._id,
      orderId: a.order._id,
      shopName: a.shop.name,
      deliveryAddress: a.order.deliveryAddress,
      items:
        a.order.shopOrders.find((so) => so._id.equals(a.shopOrderId))
          .shopOrderItems || [],

      subtotal: a.order.shopOrders.find((so) => so._id.equals(a.shopOrderId))
        ?.subtotal,
    }));

    return res.status(200).json(formated);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const acceptOrder = async (req, res) => {
  try {
    const deliveryBoyId = req.userId;
    const { assignmentId } = req.params;

    const assignment = await DeliveryAssignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    if (assignment.status !== "brodcasted") {
      return res
        .status(400)
        .json({ message: "Assignment is not available for acceptance" });
    }

    // Check whether the delivery boy already has an active assignment
    const alreadyAssigned = await DeliveryAssignment.findOne({
      assignedTo: req.userId,
      status: { $in: ["assigned"] },
    });

    if (alreadyAssigned) {
      return res
        .status(400)
        .json({ message: "You have already an active assignment" });
    }

    assignment.assignedTo = deliveryBoyId;
    assignment.status = "assigned";
    assignment.acceptedAt = new Date();
    await assignment.save();
    console.log(
      "Assignment accepted: ",
      assignment._id.toString(),
      "by user:",
      deliveryBoyId
    );

    const order = await Order.findById(assignment.order);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const shopOrder = order.shopOrders.find((so) =>
      so._id.equals(assignment.shopOrderId)
    );
    if (!shopOrder) {
      return res.status(404).json({ message: "Shop order not found" });
    }

    shopOrder.assignedDeliveryBoy = deliveryBoyId;
    await order.save();

    return res.status(200).json({ message: "Order accepted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getCurrentOrder = async (req, res) => {
  try {
    const assignment = await DeliveryAssignment.findOne({
      assignedTo: req.userId,
      status: "assigned",
    })
      .populate("shop", "name")
      .populate("assignedTo", "fullName email mobile location")
      .populate({
        path: "order",
        populate: { path: "user", select: "fullName email mobile location" },
      });

    if (!assignment) {
      return res.status(400).json({ message: "No current assignment found" });
    }
    console.log(
      "getCurrentOrder: found assignment:",
      assignment._id.toString(),
      "status:",
      assignment.status,
      "assignedTo:",
      assignment.assignedTo?.toString()
    );

    if (!assignment.order) {
      return res
        .status(400)
        .json({ message: "Order not found for this assignment" });
    }

    const shopOrder = assignment.order.shopOrders.find(
      (so) => so._id.toString() === assignment.shopOrderId.toString()
    );
    if (!shopOrder) {
      return res
        .status(400)
        .json({ message: "Shop order not found for this assignment" });
    }

    let deliveryBoyLocation = { lat: null, lon: null };
    if (assignment.assignedTo.location.coordinates.length == 2) {
      deliveryBoyLocation.lat = assignment.assignedTo.location.coordinates[1];
      deliveryBoyLocation.lon = assignment.assignedTo.location.coordinates[0];
    }

    let customerLocation = { lat: null, lon: null };
    if (assignment.order.deliveryAddress) {
      customerLocation.lat = assignment.order.deliveryAddress.latitude;
      customerLocation.lon = assignment.order.deliveryAddress.longitude;
    }
    return res.status(200).json({
      _id: assignment.order._id,
      user: assignment.order.user,
      shopOrder,
      deliveryAddress: assignment.order.deliveryAddress,
      deliveryBoyLocation,
      customerLocation,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId)
      .populate("user")
      .populate({
        path: "shopOrders.shop",
        model: "Shop",
      })
      .populate({
        path: "shopOrders.assignedDeliveryBoy",
        model: "User",
      })
      .populate({
        path: "shopOrders.shopOrderItems.item",
        model: "Item",
      })
      .lean();

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.status(200).json(order);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const sendDeliveryOtp = async (req, res) => {
  try {
    const { orderId, shopOrderId } = req.body;
    const order = await Order.findById(orderId).populate("user");
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    const shopOrder = order.shopOrders.id(shopOrderId);
    if (!shopOrder) {
      return res.status(404).json({ message: "Shop order not found" });
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    shopOrder.deliveryOtp = otp;
    shopOrder.otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

    await order.save();
    await sendDeliveryOtpMail(order.user, otp);

    return res
      .status(200)
      .json({ message: `Delivery OTP sent to ${order?.user?.fullName}` });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const verifyDeliveryOtp = async (req, res) => {
  try {
    const { orderId, shopOrderId, otp } = req.body;
    const order = await Order.findById(orderId).populate("user");

    const shopOrder = order.shopOrders.id(shopOrderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (!shopOrder) {
      return res.status(404).json({ message: "Shop order not found" });
    }

    if (
      shopOrder.deliveryOtp !== otp ||
      !shopOrder.otpExpires ||
      shopOrder.otpExpires < Date.now()
    ) {
      return res
        .status(400)
        .json({ message: "No OTP found. Please request a new one." });
    }

    shopOrder.status = "delivered";
    shopOrder.deliveredAt = new Date();

    await order.save();
    await DeliveryAssignment.deleteOne({
      shopOrderId: shopOrder._id,
      order: order._id,
      assignedTo: shopOrder.assignedDeliveryBoy,
    });
    return res.status(200).json({ message: "OTP Delivered successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
