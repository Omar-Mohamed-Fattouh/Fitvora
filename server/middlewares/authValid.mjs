import { body } from "express-validator";
import { normalizeAccountEmail, normalizePhone } from "../utils/account.mjs";

export const regestValidation = [
    body("name")
        .exists()
        .withMessage("nameRequired")
        .trim()
        .isLength({ min: 3, max: 16 })
        .withMessage("nameLength"),

    body("email")
        .exists()
        .withMessage("emailRequired")
        .customSanitizer(normalizeAccountEmail)
        .isEmail()
        .withMessage("invalidEmail"),

    body("password")
        .exists()
        .withMessage("passwordRequired")
        .isLength({ min: 8 })
        .withMessage("passwordMin")
        .matches(/\d/)
        .withMessage("passwordNumber")
        .matches(/[A-Z]/)
        .withMessage("passwordUpper")
        .matches(/[@$!%*?&]/)
        .withMessage("passwordSpecial"),

    body("phone")
        .exists()
        .withMessage("phoneRequired")
        .customSanitizer(normalizePhone)
        .matches(/^\+[1-9]\d{6,14}$/)
        .withMessage("phoneInvalid"),

    body("gender")
        .exists()
        .withMessage("genderRequired")
        .isIn(["male", "female"])
        .withMessage("genderInvalid"),

    body("birthDate")
        .exists()
        .withMessage("dobRequired")
        .isISO8601()
        .withMessage("dobInvalid"),
];

export const loginValidation = [
    body("email")
        .exists()
        .withMessage("emailRequired")
        .customSanitizer(normalizeAccountEmail)
        .isEmail()
        .withMessage("invalidEmail"),

    body("password")
        .exists()
        .withMessage("passwordRequired")
        .isLength({ min: 8 })
        .withMessage("passwordMin"),
];
