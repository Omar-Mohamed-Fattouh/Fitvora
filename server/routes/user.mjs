import { Router } from "express";
import User from "../models/UserModel.mjs";
import Meal from "../models/MealModel.mjs";
import Exercise from "../models/ExerciseModel.mjs";
import mongoose from "mongoose";
import tokenVerfication from "../middlewares/tokenValid.mjs";
import { resetPasswordVaidation, accountDataValidation, healthDataValidation } from "../middlewares/settingValid.mjs";
import { mealIdPathValidation } from "../middlewares/mealValid.mjs";
import { workoutIDPathValidation, workoutBodyValidation } from "../middlewares/workoutValid.mjs";
import validateResult from "../middlewares/checkValid.mjs";
import { recordValidation } from "../middlewares/workoutValid.mjs";

import bcrypt from "bcryptjs";
import { body } from "express-validator";
import { calcBmi, calcTdee, calorieTarget, todayKey, buildDailyPlan, buildMealPlan, buildInsights, bmiCategory, weekStats } from "../utils/fitness.mjs";
import { buildAnalytics } from "../utils/analytics.mjs";

const userRoutes = Router();

// get all favourite meals
userRoutes.get("/current/fav", tokenVerfication, async (req, res, next) => {
    try {
        const { userId } = req.payload;
        const { favoriteMeals: favMeals } = await User.findById(userId);
        res.status(200).json({ success: true, favMeals });
    } catch (err) {
        next(err);
    }
});

// put a meal in favourites
userRoutes.post(
    "/current/fav/:mealId",
    tokenVerfication,
    mealIdPathValidation,
    validateResult,
    async (req, res, next) => {
        try {
            const { userId } = req.payload;
            const { mealId } = req.params;

            // check if meal is exist in fav before
            const { favoriteMeals } = await User.findById(userId);
            const alreadyExist = favoriteMeals.some((meal) =>
                meal._id.equals(mealId)
            );
            if (alreadyExist) {
                return res
                    .status(400)
                    .json({
                        success: false,
                        msg: "this meal is already exist in favorites",
                    });
            }

            // check for meal
            const meal = await Meal.findById(mealId).lean(); // ?? why User.findById is working and this is not working ? 
            if (!meal)
                return res
                    .status(404)
                    .json({ success: false, msg: "Meal is not found" });

            // add meal to favorites
            const addMeal = await User.findByIdAndUpdate(userId, {
                $push: { favoriteMeals: meal },
            });

            res
                .status(200)
                .json({
                    success: true,
                    msg: `${meal.name} meal has been added to favorites successfully`,
                });
        } catch (err) {
            next(err);
        }
    }
);

// delete a meal from favourites (path params)
userRoutes.delete(
    "/current/fav/:mealId",
    mealIdPathValidation,
    validateResult,
    tokenVerfication,
    async (req, res, next) => {
        try {
            const { userId } = req.payload;
            const { mealId } = req.params;

            // check if meal is exist in fav before
            const { favoriteMeals } = await User.findById(userId);
            const checkExist = favoriteMeals.some((meal) => meal._id.equals(mealId));
            if (!checkExist) {
                return res
                    .status(400)
                    .json({ success: false, msg: "this meal is not exist in favorites" });
            }

            // Convert mealId to ObjectId if it's a string then delete the meal
            const mealObjectId = new mongoose.Types.ObjectId(mealId);
            const deleteMeal = await User.findByIdAndUpdate(userId, {
                $pull: { favoriteMeals: { _id: mealObjectId } },
            });

            return res
                .status(200)
                .json({
                    success: true,
                    msg: `meal removed successfully from favorites`,
                });
        } catch (err) {
            next(err);
        }
    }
);
// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// user setting
// get acountInfo
userRoutes.get(
    "/current/accountInfo",
    tokenVerfication,
    async (req, res, next) => {
        try {
            const { userId } = req.payload;
            const user = await User.findById(userId);
            return res.status(200).json({
                success: true,
                email: user.email,
                isVerified: user.isVerified !== false,
                accountInfo: user.accountInfo,
            });
        } catch (err) {
            next(err);
        }
    }
);

// put accountInfo
userRoutes.put(
    "/current/accountInfo",
    tokenVerfication,
    accountDataValidation,
    validateResult,
    async (req, res, next) => {
        try {
            const { userId } = req.payload;
            const {
                name,
                phone,
                phoneCode,
                phoneNumber,
                gender,
                birthDate,
            } = req.body;
            const user = await User.findById(userId);
            const nextPhone = phone || [phoneCode, phoneNumber].filter(Boolean).join("") || user.accountInfo?.phone;

            const updateAccountInfo = await User.findByIdAndUpdate(userId, {
                accountInfo: {
                    name,
                    phone: nextPhone,
                    gender,
                    birthDate,
                },
            }, { new: true });

            res.status(200).json({ success: true, msg: "Account updated successfully", accountInfo: updateAccountInfo.accountInfo });

        } catch (err) {
            next(err);
        }
    }
);

// get healthInfo
userRoutes.get(
    "/current/healthInfo",
    tokenVerfication,
    async (req, res, next) => {
        try {
            const { userId } = req.payload;
            const { healthInfo } = await User.findById(userId);
            return res.status(200).json({ success: true, healthInfo });
        } catch (err) {
            next(err);
        }
    }
);

// put healthInfo
userRoutes.put(
    "/current/healthInfo",
    tokenVerfication,
    healthDataValidation,
    validateResult,
    async (req, res, next) => {
        try {
            const { userId } = req.payload;
            const {
                height,
                weight,
                fitnessGoals,
                activityLevel,
                healthConditions,
                bodyFatPercentage,
                preferredWorkoutType,
                restingHeartRate
            } = req.body;
            const updateHealthInfo = await User.findByIdAndUpdate(userId, {
                healthInfo: {
                    height,
                    weight,
                    fitnessGoals,
                    activityLevel,
                    healthConditions,
                    bodyFatPercentage,
                    preferredWorkoutType,
                    restingHeartRate
                },
            }, { new: true })

            res.status(200).json({ success: true, msg: "Account updated successfully", healthInfo: updateHealthInfo.healthInfo });

        } catch (err) {
            next(err);
        }
    }
);

// patch password 
userRoutes.patch("/current/password", tokenVerfication, resetPasswordVaidation, validateResult, async (req, res, next) => {
    try {
        const { currPassword, newPassword } = req.body;
        const { userId } = req.payload;

        const checkUser = await User.findById(userId);

        const compareCurrPassword = await bcrypt.compare(currPassword, checkUser.password);
        if (!compareCurrPassword) return res.status(401).json({ success: false, msg: "password is not correct" })

        // hash new password
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        // update password
        await User.findByIdAndUpdate(userId, { password: hashedNewPassword });
        res.status(200).json({ success: true, msg: "Password updated successfully. Please use your new password next time you log in." })

    } catch (err) {
        next(err);
    }
})

userRoutes.patch(
    "/current/profile",
    tokenVerfication,
    body("name").optional().trim().isLength({ min: 3, max: 16 }).withMessage("Name must be between 3 and 16 characters"),
    body("phone").optional().isString().isLength({ min: 7, max: 20 }),
    validateResult,
    async (req, res, next) => {
        try {
            const { userId } = req.payload;
            const user = await User.findById(userId);
            if (req.body.name) user.accountInfo.name = req.body.name;
            if (req.body.phone) user.accountInfo.phone = req.body.phone;
            await user.save();
            return res.status(200).json({
                success: true,
                msg: "Profile updated successfully",
                accountInfo: user.accountInfo,
            });
        } catch (err) {
            next(err);
        }
    }
);

// delete account 
userRoutes.delete("/current", tokenVerfication, async (req, res, next) => {
    try {
        const { userId } = req.payload;
        await User.findByIdAndDelete(userId);
        return res.status(200).json({ success: true, msg: "account deleted successfully" })
    } catch (err) {
        next(err);
    }
})
// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

userRoutes.get(
    "/workout/:pageNum",
    tokenVerfication,
    workoutIDPathValidation,
    validateResult,
    async (req, res, next) => {
        try {
            const { userId } = req.payload;
            const { pageNum } = req.params;

            const user = await User.findById(userId).populate({
                path: `workout${pageNum}.exercises.exerciseId`,
                model: "Exercise", // replace this if your model name is different
            });

            res.status(200).json({
                success: true,
                workout: user[`workout${pageNum}`],
            });
        } catch (err) {
            next(err);
        }
    }
);

// put a workout page data 
userRoutes.put("/workout/:pageNum",
    tokenVerfication,
    workoutIDPathValidation,
    workoutBodyValidation,
    validateResult,
    async (req, res, next) => {
        try {
            const { userId } = req.payload;
            const { pageNum } = req.params;
            const { exercises } = req.body;

            // 1. Extract all exercise IDs
            const exerciseIds = exercises.map(ex => ex.exerciseId);

            // 2. Query to find how many of them exist
            const foundExercises = await Exercise.find({
                _id: { $in: exerciseIds }
            }).select('_id');

            if (foundExercises.length !== exerciseIds.length) {
                const foundIds = foundExercises.map(e => e._id.toString());
                const missingIds = exerciseIds.filter(id => !foundIds.includes(id));
                console.log(foundIds, missingIds)
                return res.status(400).json({
                    success: false,
                    msg: "Some exercise IDs are not exist or incorrect",
                    missingIds
                });
            }

            // 3. If all IDs are valid, update the workout
            const updatedUser = await User.findByIdAndUpdate(
                userId,
                {
                    [`workout${pageNum}`]: req.body
                },
                {
                    new: true,
                    runValidators: true
                }
            );

            res.status(200).json({
                success: true,
                msg: `Workout${pageNum} updated successfully`,
                workout: updatedUser[`workout${pageNum}`]
            });

        } catch (err) {
            next(err);
        }
    }
);


// add to previouse records 
userRoutes.patch(
    "/addRecord",
    tokenVerfication,
    recordValidation,
    validateResult,
    async (req, res, next) => {
        try {
            const { userId } = req.payload;
            const newRecord = req.body;

            const user = await User.findById(userId);
            user.previousRecords.push({
                date: newRecord.date,
                duration: newRecord.duration,
                volume: newRecord.volume,
                sets: newRecord.sets,
                type: newRecord.type || "",
            });
            await user.save();

            res.status(200).json({
                success: true,
                msg: "Previous record updated",
                previousRecords: user.previousRecords,
            });
        } catch (err) {
            next(err);
        }
    }
);


userRoutes.get("/current/summary", tokenVerfication, async (req, res, next) => {
    try {
        const { userId } = req.payload;
        const [user, meals] = await Promise.all([
            User.findById(userId),
            Meal.find().lean(),
        ]);
        const today = todayKey();
        const daily = user.daily?.date === today
            ? user.daily
            : { date: today, water: 0, completedWorkouts: [], caloriesLogged: 0, loggedMeals: [] };

        const tdee = calcTdee({
            gender: user.accountInfo?.gender,
            birthDate: user.accountInfo?.birthDate,
            height: user.healthInfo?.height,
            weight: user.healthInfo?.weight,
            activityLevel: user.healthInfo?.activityLevel,
        });
        const bmi = calcBmi(user.healthInfo?.height, user.healthInfo?.weight);
        const target = calorieTarget(tdee, user.healthInfo?.fitnessGoals);
        const metrics = {
            bmi,
            bmiCategory: bmiCategory(bmi),
            tdee,
            calorieTarget: target,
            waterGoal: 8,
        };
        const plan = buildDailyPlan(user.healthInfo || {});
        const mealPlan = buildMealPlan(meals, user.healthInfo?.fitnessGoals);

        return res.status(200).json({
            success: true,
            accountInfo: user.accountInfo,
            email: user.email,
            isVerified: user.isVerified !== false,
            healthInfo: user.healthInfo,
            previousRecords: user.previousRecords,
            weightHistory: user.weightHistory || [],
            nutritionHistory: user.nutritionHistory || [],
            streak: user.streak || 0,
            daily,
            plan: plan.map((item) => ({
                ...item,
                completed: daily.completedWorkouts.includes(item.id),
            })),
            mealPlan,
            insights: buildInsights({
                bmi,
                streak: user.streak || 0,
                daily,
                metrics,
                healthInfo: user.healthInfo,
            }),
            metrics,
            week: weekStats(user.previousRecords || [], daily),
        });
    } catch (err) {
        next(err);
    }
});

userRoutes.get("/current/analytics", tokenVerfication, async (req, res, next) => {
    try {
        const { userId } = req.payload;
        const user = await User.findById(userId);
        const locale = String(req.headers["accept-language"] || req.query.locale || "en").startsWith("ar")
            ? "ar"
            : "en";
        const analytics = buildAnalytics({
            records: user.previousRecords || [],
            weightHistory: user.weightHistory || [],
            nutritionHistory: user.nutritionHistory || [],
            range: req.query.range,
            locale,
        });
        return res.status(200).json({ success: true, analytics });
    } catch (err) {
        next(err);
    }
});

userRoutes.patch(
    "/current/daily",
    tokenVerfication,
    body("water").optional().isInt({ min: 0, max: 20 }),
    body("completeWorkoutId").optional().isString(),
    body("caloriesLogged").optional().isInt({ min: 0, max: 10000 }),
    body("logMealId").optional().isMongoId(),
    validateResult,
    async (req, res, next) => {
        try {
            const { userId } = req.payload;
            const user = await User.findById(userId);
            const today = todayKey();
            const daily = user.daily?.date === today
                ? { ...user.daily.toObject?.() || user.daily }
                : { date: today, water: 0, completedWorkouts: [], caloriesLogged: 0, loggedMeals: [] };

            daily.loggedMeals = daily.loggedMeals || [];
            daily.completedWorkouts = daily.completedWorkouts || [];

            if (req.body.water !== undefined) daily.water = req.body.water;
            if (req.body.caloriesLogged !== undefined) daily.caloriesLogged = req.body.caloriesLogged;
            if (req.body.completeWorkoutId && !daily.completedWorkouts.includes(req.body.completeWorkoutId)) {
                daily.completedWorkouts.push(req.body.completeWorkoutId);
            }
            if (req.body.logMealId) {
                const meal = await Meal.findById(req.body.logMealId).lean();
                if (!meal) {
                    return res.status(404).json({ success: false, msg: "Meal is not found" });
                }
                daily.loggedMeals.push({
                    mealId: String(meal._id),
                    name: meal.name,
                    calories: meal.calories,
                    protein: meal.protein || 0,
                    category: meal.category,
                });
                daily.caloriesLogged = (daily.caloriesLogged || 0) + meal.calories;
            }

            user.daily = daily;

            if (user.lastCheckIn !== today) {
                const yesterday = todayKey(new Date(Date.now() - 86400000));
                user.streak = user.lastCheckIn === yesterday ? (user.streak || 0) + 1 : 1;
                user.lastCheckIn = today;
            }

            await user.save();
            return res.status(200).json({ success: true, daily: user.daily, streak: user.streak });
        } catch (err) {
            next(err);
        }
    }
);

export default userRoutes;
