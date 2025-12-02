import express from "express";

import isAuth from "../middlewares/isAuth.js";
import {
  addItems,
  deleteItem,
  editItem,
  getItemByCity,
  getItemById,
  getItemByShop,
  rateItem,
  searchItems,
} from "../controller/itemController.js";
import { upload } from "../middlewares/multer.js";

const itemRouter = express.Router();

itemRouter.post("/add-food", isAuth, upload.single("image"), addItems);

itemRouter.post("/edit-food/:itemId", isAuth, upload.single("image"), editItem);

itemRouter.get("/get-by-id/:itemId", isAuth, getItemById);

itemRouter.get("/delete/:itemId", isAuth, deleteItem);

itemRouter.get("/get-by-city/:city", isAuth, getItemByCity);

itemRouter.get("/get-by-shop/:shopId", isAuth, getItemByShop);
itemRouter.post("/rate/:itemId", isAuth, rateItem);

itemRouter.get("/search-items", isAuth, searchItems);

export default itemRouter;
