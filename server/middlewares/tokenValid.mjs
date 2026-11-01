import jwt from "jsonwebtoken"
import User from "../models/UserModel.mjs";

const tokenVerfication = async (req, res, next) => {
    try {
        const token = req.headers["authorization"]?.split(" ")[1];

        if (!token) return res.status(404).json({ success: false, msg: "no token provided" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

        req.payload = decoded;

        const user = await User.findById(decoded.userId);
        if (!user) return res.status(404).json({ success: false, msg: "User not found or may be deleted" });

        next()
    } catch (err) {
        return res.status(401).json({ success: false, msg: "Invalid or expired token." });
    }
}

export default tokenVerfication;

