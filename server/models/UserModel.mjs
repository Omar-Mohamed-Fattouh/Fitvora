import mongoose from "mongoose";
const Schema = mongoose.Schema;

const workoutSchema = new mongoose.Schema({
    _id: false,
    name: {
        type: String,
        required: true,
        trim: true,
    },
    exercises: {
        type: [
            {
                _id: false, // Disable _id for individual objects inside the exercises array
                exerciseId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Exercise",
                    required: true,
                },
                "rest-timer": {
                    type: String,
                    required: true,
                    enum: [
                        "0s", "30s", "60s", "90s", "120s", "150s", "180s",
                        "210s", "240s", "270s", "300s",
                        "1m", "1.5m", "2m", "2.5m", "3m", "3.5m", "4m", "4.5m", "5m"
                    ],
                },
                "previous-sets": {
                    type: [
                        {
                            _id: false, // Disable _id for the individual previous-set objects
                            weight: {
                                type: Number,
                                required: true,
                                min: 0,
                            },
                            reps: {
                                type: Number,
                                required: true,
                                min: 0,
                            },
                        }
                    ],
                    required: true,
                    validate: {
                        validator: (v) => Array.isArray(v) && v.length > 0,
                        message: "Each exercise must include at least one previous set",
                    },
                },
            },
        ],
        default: [],
    },
});


const userSchema = new Schema({
    email: {
        required: true,
        type: String,
        unique: true,
        trim: true,
    },
    password: {
        required: true,
        type: String,
    },
    accountInfo: {
        name: {
            required: true,
            type: String,
            trim: true,
        },
        phone: {
            type: String,
            required: true,
        },
        gender: {
            required: true,
            type: String,
            enum: ["male", "female"],
        },
        birthDate: {
            required: true,
            type: Date,
        },
    },

    // Health Info
    healthInfo: {
        height: { type: String, default: "" },
        weight: { type: String, default: "" },
        fitnessGoals: { type: String, default: "" },
        activityLevel: { type: String, default: "" },
        healthConditions: { type: String, default: "" },
        bodyFatPercentage: { type: String, default: "" },
        preferredWorkoutType: { type: String, default: "" },
        restingHeartRate: { type: String, default: "" },
    },

    // Favorite meals
    favoriteMeals: {
        type: [Object],
        default: [],
    },

    workout1: {
        type: workoutSchema,
        default: () => ({ name: "workout1", exercises: [] }),
    },
    workout2: {
        type: workoutSchema,
        default: () => ({ name: "workout2", exercises: [] }),
    },
    workout3: {
        type: workoutSchema,
        default: () => ({ name: "workout3", exercises: [] }),
    },
    workout4: {
        type: workoutSchema,
        default: () => ({ name: "workout4", exercises: [] }),
    },

    // Previous records - Default is an empty array
    previousRecords: {
        type: [
            {
                _id: false,
                date: { type: Date, required: true },
                duration: { type: Number, required: true },
                volume: { type: Number, required: true },
                sets: { type: Number, required: true },
                type: { type: String, default: "" },
            }
        ],
        default: [],
    },

    weightHistory: {
        type: [
            {
                _id: false,
                date: { type: Date, required: true },
                weight: { type: Number, required: true },
            }
        ],
        default: [],
    },

    nutritionHistory: {
        type: [
            {
                _id: false,
                date: { type: Date, required: true },
                calories: { type: Number, required: true },
                protein: { type: Number, default: 0 },
            }
        ],
        default: [],
    },

    isVerified: {
        type: Boolean,
        default: true,
    },
    verificationToken: String,
    verificationExpires: Date,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    streak: {
        type: Number,
        default: 0,
    },
    lastCheckIn: String,
    daily: {
        date: { type: String, default: "" },
        water: { type: Number, default: 0 },
        completedWorkouts: { type: [String], default: [] },
        caloriesLogged: { type: Number, default: 0 },
        loggedMeals: {
            type: [{
                _id: false,
                mealId: String,
                name: String,
                calories: Number,
                protein: Number,
                category: String,
            }],
            default: [],
        },
    },
});

// Create the User model
const User = mongoose.model("User", userSchema);

export default User;
