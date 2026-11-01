import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({});

const Question = mongoose.model("Question", questionSchema);

export default Question;
