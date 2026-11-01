import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { body } from "express-validator";
import User from "../models/UserModel.mjs";
import {
    regestValidation,
    loginValidation,
} from "../middlewares/authValid.mjs";
import validateResult from "../middlewares/checkValid.mjs";
import { createToken, hashToken, expiryDate } from "../utils/tokens.mjs";
import { buildAuthLinks, sendAuthEmail, buildAuthEmail } from "../utils/mailer.mjs";

function localeFrom(req) {
    const raw = req.body?.locale || req.headers["accept-language"] || "en";
    return String(raw).toLowerCase().startsWith("ar") ? "ar" : "en";
}

async function dispatchAuthMail(req, kind, to, url) {
    const copy = buildAuthEmail(kind, url, localeFrom(req));
    const result = await sendAuthEmail({ to, ...copy });
    return {
        devLink: process.env.NODE_ENV === "production" ? undefined : url,
        emailPreview: process.env.NODE_ENV === "production" ? undefined : result.previewUrl,
        emailDelivered: result.delivered,
    };
}

const authRoutes = Router();

function tokenResponse(user) {
    const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "7d" }
    );

    return {
        success: true,
        msg: "Login done successfully",
        token,
        accountInfo: {
            name: user.accountInfo?.name,
            birthDate: user.accountInfo?.birthDate,
            email: user.email,
        },
        healthInfo: user.healthInfo,
        previousRecords: user.previousRecords,
        isVerified: user.isVerified !== false,
    };
}

authRoutes.post(
    "/regist",
    regestValidation,
    validateResult,
    async (req, res, next) => {
        try {
            const { name, email, password, phone, gender, birthDate } = req.body;

            const checkEmail = await User.findOne({ email }).exec();
            if (checkEmail) {
                return res.status(409).json({
                    success: false,
                    msg: "this email already exists",
                });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const rawToken = createToken();

            const newUser = await User.create({
                email,
                password: hashedPassword,
                isVerified: false,
                verificationToken: hashToken(rawToken),
                verificationExpires: expiryDate(24 * 60),
                accountInfo: { name, phone, gender, birthDate },
            });

            const verifyUrl = buildAuthLinks("verify", rawToken);
            const mail = await dispatchAuthMail(req, "verify", email, verifyUrl);

            return res.status(201).json({
                success: true,
                msg: "Account created. Check your email to verify your account.",
                user: {
                    name: newUser.accountInfo.name,
                    email: newUser.email,
                },
                needsVerification: true,
                ...mail,
            });
        } catch (err) {
            next(err);
        }
    }
);

authRoutes.post(
    "/login",
    loginValidation,
    validateResult,
    async (req, res, next) => {
        try {
            const { email, password } = req.body;
            const checkUser = await User.findOne({ email }).exec();
            if (!checkUser) {
                return res.status(401).json({ success: false, msg: "Incorrect email or password" });
            }

            const checkPass = await bcrypt.compare(password, checkUser.password);
            if (!checkPass) {
                return res.status(401).json({ success: false, msg: "Incorrect email or password" });
            }

            if (checkUser.isVerified === false) {
                return res.status(403).json({
                    success: false,
                    msg: "Please verify your email before signing in.",
                    needsVerification: true,
                    email: checkUser.email,
                });
            }

            return res.json(tokenResponse(checkUser));
        } catch (err) {
            next(err);
        }
    }
);

authRoutes.post(
    "/verify-email",
    body("token").exists().withMessage("Token is required"),
    validateResult,
    async (req, res, next) => {
        try {
            const hashed = hashToken(req.body.token);
            const user = await User.findOne({
                verificationToken: hashed,
                verificationExpires: { $gt: new Date() },
            });

            if (!user) {
                return res.status(400).json({ success: false, msg: "Invalid or expired verification link." });
            }

            user.isVerified = true;
            user.verificationToken = undefined;
            user.verificationExpires = undefined;
            await user.save();

            return res.json({
                ...tokenResponse(user),
                msg: "Email verified successfully. You are now signed in.",
            });
        } catch (err) {
            next(err);
        }
    }
);

authRoutes.post(
    "/resend-verification",
    body("email").isEmail().withMessage("Email must be valid").normalizeEmail(),
    validateResult,
    async (req, res, next) => {
        try {
            const user = await User.findOne({ email: req.body.email });
            if (!user) {
                return res.json({ success: true, msg: "If that email exists, a new link was sent." });
            }
            if (user.isVerified !== false) {
                return res.json({ success: true, msg: "This account is already verified." });
            }

            const rawToken = createToken();
            user.verificationToken = hashToken(rawToken);
            user.verificationExpires = expiryDate(24 * 60);
            await user.save();

            const verifyUrl = buildAuthLinks("verify", rawToken);
            const mail = await dispatchAuthMail(req, "verify", user.email, verifyUrl);

            return res.json({
                success: true,
                msg: "If that email exists, a new link was sent.",
                ...mail,
            });
        } catch (err) {
            next(err);
        }
    }
);

authRoutes.post(
    "/forgot-password",
    body("email").isEmail().withMessage("Email must be valid").normalizeEmail(),
    validateResult,
    async (req, res, next) => {
        try {
            const user = await User.findOne({ email: req.body.email });
            if (!user) {
                return res.json({ success: true, msg: "If that email exists, a reset link was sent." });
            }

            const rawToken = createToken();
            user.resetPasswordToken = hashToken(rawToken);
            user.resetPasswordExpires = expiryDate(30);
            await user.save();

            const resetUrl = buildAuthLinks("reset", rawToken);
            const mail = await dispatchAuthMail(req, "reset", user.email, resetUrl);

            return res.json({
                success: true,
                msg: "If that email exists, a reset link was sent.",
                ...mail,
            });
        } catch (err) {
            next(err);
        }
    }
);

authRoutes.post(
    "/reset-password",
    body("token").exists().withMessage("Token is required"),
    body("password")
        .isLength({ min: 8 }).withMessage("Password must be at least 8 characters")
        .matches(/\d/).withMessage("Password must contain a number")
        .matches(/[A-Z]/).withMessage("Password must contain an uppercase letter")
        .matches(/[@$!%*?&]/).withMessage("Password must contain a special character"),
    validateResult,
    async (req, res, next) => {
        try {
            const hashed = hashToken(req.body.token);
            const user = await User.findOne({
                resetPasswordToken: hashed,
                resetPasswordExpires: { $gt: new Date() },
            });

            if (!user) {
                return res.status(400).json({ success: false, msg: "Invalid or expired reset link." });
            }

            user.password = await bcrypt.hash(req.body.password, 10);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            await user.save();

            return res.json({ success: true, msg: "Password updated successfully. You can now sign in." });
        } catch (err) {
            next(err);
        }
    }
);

export default authRoutes;
