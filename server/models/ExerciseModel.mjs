import mongoose from "mongoose";

const exerciseSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    nameKey: { type: String, default: "" },
    muscle: { type: String, required: true },
    equipment: { type: String, default: "bodyweight" },
    difficulty: { type: String, enum: ["beginner", "intermediate", "advanced"], default: "beginner" },
    type: { type: String, default: "strength" },
    instructions: { type: String, default: "" },
    instructionsKey: { type: String, default: "" },
    duration: { type: Number, default: 8 },
});

const Exercise = mongoose.model("Exercise", exerciseSchema);

export default Exercise;
