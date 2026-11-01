import dns from "node:dns";
import express from "express";
import "dotenv/config";
import mongoose from "mongoose";

// Node 24 on Windows fails mongodb+srv SRV lookups unless DNS servers are set.
dns.setServers(["8.8.8.8", "1.1.1.1"]);
import authRoutes from "./routes/auth.mjs";
import questionsRoutes from "./routes/questions.mjs";
import mealRoutes from "./routes/meals.mjs";
import userRoutes from "./routes/user.mjs";
import exerciseRoutes from "./routes/exercises.mjs";
import cors from "cors"
import { seedCatalog } from "./utils/seed.mjs";
import contactRoutes from "./routes/contact.mjs";
import { seedOmarHistory } from "./utils/seedHistory.mjs";

const app = express();

app.use(cors())
app.use(express.json())

// connect to routes 
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/exercises/", exerciseRoutes)
app.use("/api/meals", mealRoutes);
app.use("/api/questions", questionsRoutes);
app.use("/api/contact", contactRoutes);


// error handler middleware 
app.use((err, req, res, next) => {
    const status = err.status || 500;
    const message = err.message || "Something went wrong on the server.";
    console.log(err)
    res.status(status).json({
        from: "from general handling middleware",
        errorMsg: message
    });
})

app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
});

const PORT = process.env.PORT || 5000;

async function start() {
    try {
        await mongoose.connect(process.env.DATABASE_URL);
        console.log("connected to MongoDB");
        await seedCatalog();
        try {
            const history = await seedOmarHistory();
            console.log("history ready", history.records, "sessions");
        } catch (error) {
            console.log("history seed skipped:", error.message);
        }
    } catch (err) {
        console.error("MongoDB connection failed:", err.message);
        console.error("API routes that need the database will fail until MongoDB is reachable.");
    }

    app.listen(PORT, () => {
        console.log(`server listening on port ${PORT}`);
    });
}

start();
