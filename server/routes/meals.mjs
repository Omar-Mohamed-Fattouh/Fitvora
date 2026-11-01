import { Router } from "express";
import tokenVerfication from "../middlewares/tokenValid.mjs";
import Meal from "../models/MealModel.mjs";
import validateResult from "../middlewares/checkValid.mjs";
import { mealIdPathValidation } from "../middlewares/mealValid.mjs"

const mealRoutes = Router();

// get all meals 
mealRoutes.get("/", tokenVerfication, async (req, res, next) => {
    try {
        const meals = await Meal.find();
        res.send({ success: true, meals })
    } catch (err) {
        next(err)
    }
})

// get one meal (path params)
mealRoutes.get("/:mealId", tokenVerfication, mealIdPathValidation, validateResult, async (req, res, next) => {
    try {
        const { mealId } = req.params;

        const meal = await Meal.findById(mealId);
        if (!meal) return res.status(404).json({ success: false, msg: "incorrect id" })

        res.json({ success: true, meal })
    } catch (err) {
        next(err)
    }
})












export default mealRoutes;