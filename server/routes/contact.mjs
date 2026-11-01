import { Router } from "express";
import { body } from "express-validator";
import validateResult from "../middlewares/checkValid.mjs";

const contactRoutes = Router();

contactRoutes.post(
  "/",
  body("name").trim().isLength({ min: 2, max: 40 }),
  body("email").isEmail(),
  body("message").trim().isLength({ min: 8, max: 1000 }),
  validateResult,
  async (req, res) => {
    const { name, email, message } = req.body;
    console.log("[contact]", { name, email, message: String(message).slice(0, 200) });
    return res.status(200).json({ success: true });
  }
);

export default contactRoutes;
