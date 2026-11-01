import { param, body } from "express-validator";

export const workoutIDPathValidation = [
    param("pageNum")
        .exists({ checkFalsy: true })
        .withMessage("workout pageNum parameter must be provided")
        .isInt({ min: 1, max: 4 })
        .withMessage("workout pageNum parameter must be a number between 1 and 4")
];

const allowedRestTimers = [
    "0s", "30s",
    "1m", "1.5m", "2m", "2.5m", "3m", "3.5m", "4m", "4.5m", "5m",
    "60s", "90s", "120s", "150s", "180s", "210s", "240s", "270s", "300s"
];

export const workoutBodyValidation = [
    body("name")
        .exists()
        .withMessage("Workout name is required")
        .isString()
        .withMessage("Workout name must be a string")
        .notEmpty()
        .withMessage("Workout name cannot be empty"),

    body("exercises")
        .isArray({ min: 1 })
        .withMessage("Exercises must be a non-empty array"),

    body("exercises.*.exerciseId")
        .exists()
        .withMessage("Each exercise must include an exerciseId")
        .isMongoId()
        .withMessage("exerciseId must be a valid MongoDB ObjectId"),

    body("exercises.*['rest-timer']")
        .exists()
        .withMessage("Each exercise must include a rest timer")
        .notEmpty()
        .withMessage("Rest timer cannot be empty")
        .isIn(allowedRestTimers)
        .withMessage(`Rest timer must be one of: ${allowedRestTimers.join(", ")}`),

    body("exercises.*['previous-sets']")
        .exists()
        .withMessage("previouse-sets is required in each exercise object")
        .isArray({ min: 1 })
        .withMessage("Previous sets must be a non-empty array"),

    body("exercises.*['previous-sets'].*.weight")
        .exists()
        .withMessage("Each set must include weight")
        .notEmpty()
        .withMessage("Weight cannot be empty")
        .isNumeric()
        .withMessage("Weight must be a number"),

    body("exercises.*['previous-sets'].*.reps")
        .exists()
        .withMessage("Each set must include reps")
        .notEmpty()
        .withMessage("Reps cannot be empty")
        .isInt({ min: 0 })
        .withMessage("Reps must be a non-negative integer"),
];

export const recordValidation = [
    body("date")
        .notEmpty()
        .withMessage("Date is required")
        .isISO8601()
        .withMessage("Date must be a valid ISO8601 date"),

    body("duration")
        .notEmpty()
        .withMessage("Duration is required")
        .isNumeric()
        .withMessage("Duration must be a number"),

    body("volume")
        .notEmpty()
        .withMessage("Volume is required")
        .isNumeric()
        .withMessage("Volume must be a number"),

    body("sets")
        .notEmpty()
        .withMessage("Sets is required")
        .isNumeric()
        .withMessage("Sets must be a number"),

    body("type")
        .optional()
        .isString()
        .isLength({ max: 32 }),
];


