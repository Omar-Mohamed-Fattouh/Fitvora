import mongoose from "mongoose";

const mealSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    nameKey: { type: String, default: "" },
    descriptionKey: { type: String, default: "" },
    category: { type: String, enum: ["breakfast", "lunch", "dinner", "snack"], required: true },
    calories: { type: Number, required: true },
    protein: { type: Number, required: true },
    carbs: { type: Number, required: true },
    fat: { type: Number, required: true },
    tags: { type: [String], default: [] },
    description: { type: String, default: "" },
});

const Meal = mongoose.model("meal", mealSchema);

export default Meal;
