import { Router } from "express";
import bcrypt from "bcryptjs";
import { body } from "express-validator";
import User from "../models/UserModel.mjs";
import {
    regestValidation,
    loginValidation,
} from "../middlewares/authValid.mjs";
import validateResult from "../middlewares/checkValid.mjs";
import { createToken, hashToken, expiryDate, signJwt } from "../utils/tokens.mjs";
import { buildAuthLinks, sendAuthEmail, buildAuthEmail, hasSmtp } from "../utils/mailer.mjs";
import { normalizeAccountEmail, escapeRegex } from "../utils/account.mjs";

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

async function findAccount(email) {
    const normalized = normalizeAccountEmail(email);
    return (
        (await User.findOne({ email: normalized })) ||
        (await User.findOne({ email: new RegExp(`^${escapeRegex(normalized)}$`, "i") }))
    );
}

async function passwordsMatch(plain, hash) {
    if (!plain || !hash) return false;
    if (await bcrypt.compare(plain, hash)) return true;
    const trimmed = String(plain).trim();
    if (trimmed === plain) return false;
    return bcrypt.compare(trimmed, hash);
}

function tokenResponse(user) {
    const token = signJwt(
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
            const { name, password, phone, gender, birthDate } = req.body;
            const email = normalizeAccountEmail(req.body.email);

            const checkEmail = await findAccount(email);
            if (checkEmail) {
                return res.status(409).json({
                    success: false,
                    code: "EMAIL_EXISTS",
                    msg: "emailExists",
                });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const rawToken = createToken();
            const mailConfigured = hasSmtp();

            const newUser = await User.create({
                email,
                password: hashedPassword,
                isVerified: !mailConfigured,
                verificationToken: mailConfigured ? hashToken(rawToken) : undefined,
                verificationExpires: mailConfigured ? expiryDate(24 * 60) : undefined,
                accountInfo: { name, phone, gender, birthDate },
            });

            if (!mailConfigured) {
                return res.status(201).json({
                    ...tokenResponse(newUser),
                    msg: "accountReadyToSignIn",
                    needsVerification: false,
                });
            }

            const verifyUrl = buildAuthLinks("verify", rawToken);
            const mail = await dispatchAuthMail(req, "verify", email, verifyUrl);

            if (!mail.emailDelivered) {
                newUser.isVerified = true;
                newUser.verificationToken = undefined;
                newUser.verificationExpires = undefined;
                await newUser.save();
                return res.status(201).json({
                    ...tokenResponse(newUser),
                    msg: "accountReadyToSignIn",
                    needsVerification: false,
                });
            }

            return res.status(201).json({
                success: true,
                msg: "accountCreated",
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
            const email = normalizeAccountEmail(req.body.email);
            const password = String(req.body.password ?? "");
            const checkUser = await findAccount(email);
            if (!checkUser) {
                return res.status(401).json({
                    success: false,
                    code: "INVALID_CREDENTIALS",
                    msg: "invalidCredentials",
                });
            }

            const checkPass = await passwordsMatch(password, checkUser.password);
            if (!checkPass) {
                return res.status(401).json({
                    success: false,
                    code: "INVALID_CREDENTIALS",
                    msg: "invalidCredentials",
                });
            }

            if (checkUser.isVerified === false) {
                if (!hasSmtp()) {
                    checkUser.isVerified = true;
                    checkUser.verificationToken = undefined;
                    checkUser.verificationExpires = undefined;
                    await checkUser.save();
                } else {
                    return res.status(403).json({
                        success: false,
                        code: "UNVERIFIED",
                        msg: "needsVerification",
                        needsVerification: true,
                        email: checkUser.email,
                    });
                }
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
    body("email").customSanitizer(normalizeAccountEmail).isEmail().withMessage("invalidEmail"),
    validateResult,
    async (req, res, next) => {
        try {
            const user = await findAccount(req.body.email);
            if (!user) {
                return res.json({ success: true, msg: "verifyLinkIfExists" });
            }
            if (user.isVerified !== false) {
                return res.json({ success: true, msg: "alreadyVerified" });
            }

            const rawToken = createToken();
            user.verificationToken = hashToken(rawToken);
            user.verificationExpires = expiryDate(24 * 60);
            await user.save();

            const verifyUrl = buildAuthLinks("verify", rawToken);
            const mail = await dispatchAuthMail(req, "verify", user.email, verifyUrl);

            return res.json({
                success: true,
                msg: "verifyLinkIfExists",
                ...mail,
            });
        } catch (err) {
            next(err);
        }
    }
);

authRoutes.post(
    "/forgot-password",
    body("email").customSanitizer(normalizeAccountEmail).isEmail().withMessage("invalidEmail"),
    validateResult,
    async (req, res, next) => {
        try {
            const user = await findAccount(req.body.email);
            if (!user) {
                return res.json({ success: true, msg: "resetLinkIfExists" });
            }

            const rawToken = createToken();
            user.resetPasswordToken = hashToken(rawToken);
            user.resetPasswordExpires = expiryDate(30);
            await user.save();

            const resetUrl = buildAuthLinks("reset", rawToken);
            const mail = await dispatchAuthMail(req, "reset", user.email, resetUrl);

            return res.json({
                success: true,
                msg: "resetLinkIfExists",
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
