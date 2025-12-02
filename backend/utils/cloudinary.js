import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
const uploadOnCloudinary = async (file) => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API,
    api_secret: process.env.CLOUDINARY_SECRET,
  });
  try {
    const result = await cloudinary.uploader.upload(file);
    if (fs.existsSync(file)) fs.unlinkSync(file);
    return result.secure_url;
  } catch (error) {
    if (fs.existsSync(file)) fs.unlinkSync(file);
    console.log(error);
    throw error;
  }
};

export default uploadOnCloudinary;
