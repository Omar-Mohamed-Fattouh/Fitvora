import { Router } from "express";
import tokenVerfication from "../middlewares/tokenValid.mjs";
import Exercise from "../models/ExerciseModel.mjs";

const exerciseRoutes = Router();

// get all exercises 
exerciseRoutes.get("/", tokenVerfication, async (req, res, next) => {
    try {
        const exercises = await Exercise.find();
        res.status(200).json({
            success: true,
            exercises
        })
    } catch (err) {
        next(err)
    }
})

export default exerciseRoutes;