import "dotenv/config";
import { createApp, connectDb } from "./app.mjs";
import { seedOmarHistory } from "./utils/seedHistory.mjs";

const app = createApp();
const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await connectDb();
    if (process.env.SEED_HISTORY !== "false") {
      try {
        const history = await seedOmarHistory();
        console.log("history ready", history.records, "sessions");
      } catch (error) {
        console.log("history seed skipped:", error.message);
      }
    }
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    console.error("API routes that need the database will fail until MongoDB is reachable.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`server listening on port ${PORT}`);
  });
}

start();
