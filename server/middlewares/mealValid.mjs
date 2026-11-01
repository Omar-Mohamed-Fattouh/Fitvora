import { param } from "express-validator";
import mongoose from "mongoose";

export const mealIdPathValidation = [
    param("mealId")
        .exists({ checkFalsy: true })
        .withMessage("ID must be provided")
        .custom((value) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                throw new Error("Invalid ID format");
            }
            return true;
        }),
];


