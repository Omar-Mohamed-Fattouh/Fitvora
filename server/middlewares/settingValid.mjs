import { body } from "express-validator";

export const accountDataValidation = [
    body("name")
        .exists().withMessage("Name is required")
        .trim()
        .isLength({ min: 3, max: 16 }).withMessage("Name must be between 3 and 16 characters"),

    body("phone")
        .optional()
        .isString()
        .isLength({ min: 7, max: 20 }).withMessage("Phone must be 7 to 20 characters"),

    body("phoneCode")
        .optional()
        .matches(/^\+?[0-9]{1,4}$/).withMessage("Invalid phone code"),

    body("phoneNumber")
        .optional()
        .isInt().withMessage("Phone number must be numeric")
        .isLength({ min: 7, max: 15 }).withMessage("Phone number must be 7 to 15 digits long"),

    body("gender")
        .exists().withMessage("Gender is required")
        .isIn(["male", "female"]).withMessage("Gender must be 'male' or 'female'"),

    body("birthDate")
        .exists().withMessage("Birth date is required")
        .isISO8601().withMessage("Birth date must be a valid ISO 8601 date (YYYY-MM-DD)")
];

export const resetPasswordVaidation = [
    body("currPassword")
        .notEmpty()
        .withMessage("Current password is required")
        .isLength({ min: 8 }).withMessage("Password must be at least 8 characters long"),

    body('newPassword')
        .isLength({ min: 8 })
        .withMessage('newPassword must be at least 8 characters')
        .matches(/\d/)
        .withMessage('newPassword must contain a number')
        .matches(/[A-Z]/)
        .withMessage('newPassword must contain an uppercase letter')
        .matches(/[@$!%*?&]/)
        .withMessage('newPassword must contain a special character'),

    body("confirmNewPassword")
        .exists({ checkFalsy: true })
        .withMessage("ConfirmNewPassword is required")
        .custom((value, { req }) => {
            if (value !== req.body.newPassword) {
                throw new Error("NewPassword and ConfirmNewPassword do not match");
            }
            return true;
        }),
]

export const healthDataValidation = [
    body('height')
        .isString()
        .trim()
        .isIn(["100-130", "130-160", "160-180", "180-200", "200-220"])
        .withMessage('Height must be one of the allowed ranges'),

    body('weight')
        .isString()
        .trim()
        .isIn(["40-55", "55-70", "70-85", "85-100", "100-120", "120-140", "140-160"])
        .withMessage('Weight must be one of the allowed ranges'),

    body('fitnessGoals')
        .isString()
        .trim()
        .isIn(["weight-loss", "muscle-gain", "endurance", "maintenance", "rehabilitation", "mobility", "recomposition"])
        .withMessage('Invalid fitness goal'),

    body('activityLevel')
        .isString()
        .trim()
        .isIn(["sedentary", "light", "moderate", "active", "extreme"])
        .withMessage('Invalid activity level'),

    body('healthConditions')
        .isString()
        .trim()
        .isIn(["none", "hypertension", "diabetes", "heart-disease", "asthma", "joint-pain", "thyroid"])
        .withMessage('Invalid health condition'),

    body('bodyFatPercentage')
        .isString()
        .trim()
        .isIn(["5-10", "10-15", "15-20", "20-25", "25-30", "30+"])
        .withMessage('Invalid body fat percentage'),

    body('preferredWorkoutType')
        .isString()
        .trim()
        .isIn(["cardio", "strength", "hiit", "yoga", "crossfit", "sports", "pilates", "swimming", "cycling"])
        .withMessage('Invalid workout type'),

    body('restingHeartRate')
        .isString()
        .trim()
        .isIn(["40-60", "60-80", "80-100", "100+"])
        .withMessage('Invalid resting heart rate'),
];





