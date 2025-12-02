import jwt from "jsonwebtoken";

const isAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(400).json({ message: "token not found" });
    }
    const decodetoken = jwt.verify(token, process.env.JWT_SECRET);

    if (!decodetoken) {
      return res.status(400).json({ message: "token not verified" });
    }
    req.userId = decodetoken.userId;
    next();
  } catch (error) {
    return res.status(500).json({ message: "isAuth error" });
  }
};

export default isAuth;
