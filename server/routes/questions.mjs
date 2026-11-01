import { Router } from "express";
import Question from "../models/QuestModel.mjs";
import tokenVerfication from "../middlewares/tokenValid.mjs";

const questionsRoutes = Router();

questionsRoutes.get("/", tokenVerfication, async (req, res, next) => {
    try {
        const questions = await Question.find();
        res.json({ success: true, questions });
    } catch (err) {
        next(err);
    }
});

export default questionsRoutes;