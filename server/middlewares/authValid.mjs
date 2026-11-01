import { body } from "express-validator";

export const regestValidation = [
    body("name")
        .exists()
        .withMessage("Name is required")
        .trim()
        .isLength({ min: 3, max: 16 })
        .withMessage("Name must be between 3 and 16 characters"),

    body("email")
        .exists()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Email must be valid")
        .normalizeEmail(),

    body("password")
        .exists()
        .withMessage("password is required")
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters")
        .matches(/\d/)
        .withMessage("Password must contain a number")
        .matches(/[A-Z]/)
        .withMessage("Password must contain an uppercase letter")
        .matches(/[@$!%*?&]/)
        .withMessage("Password must contain a special character"),

    body("phone")
        .exists()
        .withMessage("Phone is required")
        .matches(/^\+[1-9]{1}[0-9]{3,14}$/)
        .withMessage(
            'Phone number must start with a "+" followed by the country code and the phone number'
        )
        .trim(),

    body("gender")
        .exists()
        .withMessage("Gender is required")
        .isIn(["male", "female"])
        .withMessage("Gender must be 'male' or 'female'"),

    body("birthDate")
        .exists()
        .withMessage("Birth date is required")
        .isISO8601()
        .withMessage("Birth date must be a valid ISO 8601 date (YYYY-MM-DD)"),
];

export const loginValidation = [
    body("email")
        .exists()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Email must be valid")
        .normalizeEmail(),

    body("password")
        .exists()
        .withMessage("Password is required")
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters long"),
];
