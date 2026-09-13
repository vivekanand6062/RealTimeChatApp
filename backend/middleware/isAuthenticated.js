import jwt from "jsonwebtoken";
import { User } from "../models/userModel.js";

const isAuthenticated = async(req,res,next) => {
  try {
    const token = req.cookies.token;
    if(!token){
        return res.status(401).json({message:"User not authenticated."});
    }
    const decode = await jwt.verify(token, process.env.JWT_SECRET_KEY);
    if(!decode || !decode.userId){
        return res.status(401).json({message:"Invalid token."});
    }

    // Ensure user still exists in database (prevents deleted users with valid JWT from authenticating)
    const user = await User.findById(decode.userId).select("_id");
    if(!user){
        return res.status(401).json({message:"User account no longer exists. Please log in again."});
    }

    req.id = decode.userId;
    next();
  } catch (error) {
    console.error("Authentication error:", error.message || error);
    return res.status(401).json({ message: "Your session has expired. Please log in again." });
  }
};
export default isAuthenticated;