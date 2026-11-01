import dns from "node:dns";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.mjs";
import questionsRoutes from "./routes/questions.mjs";
import mealRoutes from "./routes/meals.mjs";
import userRoutes from "./routes/user.mjs";
import exerciseRoutes from "./routes/exercises.mjs";
import contactRoutes from "./routes/contact.mjs";
import { seedCatalog } from "./utils/seed.mjs";

if (process.platform === "win32") {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
}

const extraOrigins = String(process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = new Set(
  [
    process.env.CLIENT_URL,
    "https://fitvora-lime.vercel.app",
    "https://fitvoraa.vercel.app",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    ...extraOrigins,
  ]
    .filter(Boolean)
    .map((origin) => origin.replace(/\/$/, ""))
);

function isAllowedOrigin(origin) {
  if (!origin) return true;
  const normalized = origin.replace(/\/$/, "");
  if (allowedOrigins.has(normalized)) return true;
  try {
    const { hostname } = new URL(normalized);
    return hostname === "fitvora-lime.vercel.app" || (hostname.endsWith(".vercel.app") && hostname.includes("fitvora"));
  } catch {
    return false;
  }
}

let dbReady;

export function connectDb() {
  if (mongoose.connection.readyState === 1) return Promise.resolve(mongoose.connection);
  if (!dbReady) {
    dbReady = mongoose.connect(process.env.DATABASE_URL).then(async (connection) => {
      console.log("connected to MongoDB");
      if (process.env.SKIP_SEED !== "true") {
        await seedCatalog();
      }
      return connection;
    });
  }
  return dbReady;
}

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin(origin, callback) {
        callback(null, isAllowedOrigin(origin));
      },
      credentials: true,
    })
  );
  app.use(express.json());

  app.use(async (_req, _res, next) => {
    try {
      if (process.env.DATABASE_URL) await connectDb();
      next();
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/health", (_req, res) => {
    res.json({
      ok: true,
      db: mongoose.connection.readyState === 1,
    });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/exercises/", exerciseRoutes);
  app.use("/api/meals", mealRoutes);
  app.use("/api/questions", questionsRoutes);
  app.use("/api/contact", contactRoutes);

  app.use((err, _req, res, _next) => {
    const status = err.status || 500;
    const message = err.message || "Something went wrong on the server.";
    console.log(err);
    res.status(status).json({
      from: "from general handling middleware",
      errorMsg: message,
    });
  });

  return app;
}
