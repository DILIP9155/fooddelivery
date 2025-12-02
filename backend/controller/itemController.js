import Item from "../models/itemModel.js";
import Shop from "../models/shopModel.js";
import uploadOnCloudinary from "../utils/cloudinary.js";

export const addItems = async (req, res) => {
  try {
    const { name, category, foodType, price } = req.body;
    let image;
    if (req.file) {
      image = await uploadOnCloudinary(req.file.path);
    }
    const shop = await Shop.findOne({ owner: req.userId });

    if (!shop) {
      return res.status(400).json({ message: "shop not found" });
    }
    const item = await Item.create({
      name,
      category,
      foodType,
      price,
      image,
      shop: shop._id,
    });

    shop.items.push(item._id);
    await shop.save();
    await shop.populate([
      { path: "owner" },
      { path: "items", options: { sort: { updatedAt: -1 } } },
    ]);
    return res.status(201).json(shop);
  } catch (error) {
    return res.status(500).json({ message: `add item error: ${error}` });
  }
};

export const editItem = async (req, res) => {
  try {
    const itemId = req.params.itemId;
    const { name, category, foodType, price } = req.body;
    let image;
    if (req.file) {
      image = await uploadOnCloudinary(req.file.path);
    }

    const item = await Item.findByIdAndUpdate(
      itemId,
      { name, category, foodType, price, image },
      { new: true }
    );

    if (!item) {
      return res.status(400).json({ message: "item not found" });
    }

    const shop = await Shop.findOne({ owner: req.userId }).populate({
      path: "items",
      options: { sort: { updatedAt: -1 } },
    });
    return res.status(200).json(shop);
  } catch (error) {
    return res.status(500).json({ message: `edit item error ${error}` });
  }
};

export const getItemById = async (req, res) => {
  try {
    const itemId = req.params.itemId;
    const item = await Item.findById(itemId);

    if (!item) {
      return res.status(400).json({ message: "item not found" });
    }
    const userId = req.userId;
    const userRatingEntry = item.ratings?.find(
      (r) => r.user?.toString() === userId?.toString()
    );
    const userRating = userRatingEntry?.rating || null;
    return res.status(200).json({ ...item.toObject(), userRating });
  } catch (error) {
    return res.status(500).json({ message: `get item error ${error}` });
  }
};

export const deleteItem = async (req, res) => {
  try {
    const itemId = req.params.itemId;
    const item = await Item.findByIdAndDelete(itemId);

    if (!item) {
      return res.status(400).json({ message: "item not found" });
    }

    const shop = await Shop.findOne({ owner: req.userId });

    shop.items = shop.items.filter((i) => i._id !== item._id);

    await shop.save();

    await shop.populate({
      path: "items",
      options: { sort: { updatedAt: -1 } },
    });
    return res.status(200).json(shop);
  } catch (error) {
    return res.status(500).json({ message: `delete item error ${error}` });
  }
};

export const getItemByCity = async (req, res) => {
  try {
    const { city } = req.params;

    if (!city) {
      return res.status(400).json({ message: "city is required" });
    }

    const shops = await Shop.find({
      city: { $regex: new RegExp(`^${city}$`, "i") },
    }).populate("items");

    if (!shops) {
      return res.status(400).json({ message: "Shops not found" });
    }

    const shopId = shops.map((shop) => shop._id);

    const items = await Item.find({ shop: { $in: shopId } });

    // If userId available, include per-user rating info
    const userId = req.userId;
    const itemsWithUserRating = items.map((it) => {
      const userRatingEntry = it.ratings?.find(
        (r) => r.user?.toString() === userId?.toString()
      );
      const userRating = userRatingEntry?.rating || null;
      return { ...it.toObject(), userRating };
    });
    return res.status(200).json(itemsWithUserRating);
  } catch (error) {
    return res.status(500).json({ message: `get item by city error ${error}` });
  }
};

export const getItemByShop = async (req, res) => {
  try {
    const { shopId } = req.params;
    const shop = await Shop.findById(shopId).populate("items");

    if (!shop) {
      return res.status(400).json({ message: "shop not found" });
    }

    const userId = req.userId;
    const itemsWithUserRating = shop.items.map((it) => {
      const userRatingEntry = it.ratings?.find(
        (r) => r.user?.toString() === userId?.toString()
      );
      const userRating = userRatingEntry?.rating || null;
      return { ...it.toObject(), userRating };
    });
    return res.status(200).json({ shop, items: itemsWithUserRating });
  } catch (error) {
    return res.status(500).json({ message: `get item by shop error ${error}` });
  }
};

export const rateItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { rating } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Invalid rating" });
    }
    const item = await Item.findById(itemId);
    if (!item) return res.status(404).json({ message: "Item not found" });

    // per-user rating: update or add user's rating
    const existingIdx = item.ratings?.findIndex(
      (r) => r.user?.toString() === req.userId?.toString()
    );
    if (existingIdx >= 0) {
      item.ratings[existingIdx].rating = Number(rating);
    } else {
      item.ratings = item.ratings || [];
      item.ratings.push({ user: req.userId, rating: Number(rating) });
    }

    // recompute average and count
    const total = item.ratings.reduce((s, r) => s + Number(r.rating), 0);
    const count = item.ratings.length;
    const average = count > 0 ? total / count : 0;
    item.rating = { average, count };
    await item.save();

    // Broadcast rating update via socket if available
    try {
      const io = req.app.get("io");
      if (io) {
        io.emit("item-rated", { itemId: item._id, rating: item.rating });
      }
    } catch (err) {
      console.log("socket emit error", err);
    }

    return res
      .status(200)
      .json({ message: "Rating updated", rating: item.rating });
  } catch (error) {
    return res.status(500).json({ message: `rate item error ${error}` });
  }
};

export const searchItems = async (req, res) => {
  try {
    const { query, city } = req.query;
    if (!query || !city) {
      return res.status(400).json({ message: "query and city are required" });
    }
    const shops = await Shop.find({
      city: { $regex: new RegExp(`^${city}$`, "i") },
    }).populate("items");

    if (!shops) {
      return res.status(400).json({ message: "Shops not found" });
    }

    const shopIds = shops.map((s) => s._id);
    const items = await Item.find({
      shop: { $in: shopIds },
      $or: [
        { name: { $regex: query, $options: "i" } },
        { category: { $regex: query, $options: "i" } },
      ],
    }).populate("shop", "name image");

    const userId = req.userId;
    const itemsWithUserRating = items.map((it) => {
      const userRatingEntry = it.ratings?.find(
        (r) => r.user?.toString() === userId?.toString()
      );
      const userRating = userRatingEntry?.rating || null;
      return { ...it.toObject(), userRating };
    });
    return res.status(200).json(itemsWithUserRating);
  } catch (error) {
    return res.status(500).json({ message: `search items error ${error}` });
  }
};
