import dns from "node:dns";
import "dotenv/config";
import mongoose from "mongoose";
import User from "../models/UserModel.mjs";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const EMAIL = "omarmfattouh45@gmail.com";

function dayKey(date) {
  return new Date(date).toISOString().slice(0, 10);
}

function startOfDay(offset) {
  const date = new Date();
  date.setHours(10, 15, 0, 0);
  date.setDate(date.getDate() - offset);
  return date;
}

function jitter(seed, spread) {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return ((value - Math.floor(value)) * 2 - 1) * spread;
}

function sessionFor(offset, weekday) {
  if (weekday === 5) return null;

  const lateBlock = offset < 18;
  const tiredWeek = offset >= 42 && offset <= 46;
  if (tiredWeek && (weekday === 0 || weekday === 3)) return null;

  if (weekday === 0) {
    return { type: "yoga", duration: 22 + Math.round(jitter(offset, 4)), volume: 90 + Math.round(jitter(offset, 12)), sets: 4 };
  }
  if (weekday === 1) {
    return { type: "strength", duration: lateBlock ? 46 : 36, volume: lateBlock ? 340 : 260, sets: lateBlock ? 16 : 12 };
  }
  if (weekday === 2) {
    return { type: "cardio", duration: lateBlock ? 38 : 30, volume: lateBlock ? 310 : 240, sets: 8 };
  }
  if (weekday === 3) {
    return { type: "hiit", duration: lateBlock ? 24 : 20, volume: lateBlock ? 290 : 230, sets: 10 };
  }
  if (weekday === 4) {
    return { type: "strength", duration: lateBlock ? 42 : 32, volume: lateBlock ? 320 : 240, sets: lateBlock ? 14 : 11 };
  }
  if (weekday === 6) {
    if (offset % 14 === 3) {
      return [
        { type: "cardio", duration: 28, volume: 210, sets: 6 },
        { type: "yoga", duration: 16, volume: 60, sets: 3 },
      ];
    }
    return { type: "cardio", duration: 34 + Math.round(jitter(offset, 5)), volume: 250 + Math.round(jitter(offset, 20)), sets: 7 };
  }
  return null;
}

function nutritionFor(offset, weekday, trained) {
  const rest = weekday === 5 || !trained;
  const calories = rest ? 1680 + Math.round(jitter(offset, 70)) : 1960 + Math.round(jitter(offset, 90));
  const protein = rest ? 92 + Math.round(jitter(offset, 8)) : 124 + Math.round(jitter(offset, 10));
  return { calories: Math.max(1400, calories), protein: Math.max(70, protein) };
}

export function buildOmarHistory() {
  const records = [];
  const nutritionHistory = [];
  const weightHistory = [];
  const days = 90;

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = startOfDay(offset);
    const weekday = date.getDay();
    const planned = sessionFor(offset, weekday);
    const sessions = planned ? (Array.isArray(planned) ? planned : [planned]) : [];

    sessions.forEach((session, index) => {
      const stamp = new Date(date);
      stamp.setHours(10 + index * 7, 10 + (offset % 17), 0, 0);
      records.push({
        date: stamp,
        duration: session.duration,
        volume: session.volume,
        sets: session.sets,
        type: session.type,
      });
    });

    nutritionHistory.push({
      date,
      ...nutritionFor(offset, weekday, sessions.length > 0),
    });

    if (weekday === 0 || weekday === 4) {
      const gained = ((days - 1 - offset) / (days - 1)) * 3.4;
      const wobble = jitter(offset + 4, 0.18);
      weightHistory.push({
        date,
        weight: Number((51.4 + gained + wobble).toFixed(1)),
      });
    }
  }

  const lastDays = [];
  for (let offset = 0; offset < 21; offset += 1) {
    const key = dayKey(startOfDay(offset));
    const trained = records.some((record) => dayKey(record.date) === key);
    lastDays.push(trained);
  }
  let streak = 0;
  for (const trained of lastDays) {
    if (!trained) break;
    streak += 1;
  }

  return {
    records,
    nutritionHistory,
    weightHistory,
    streak: Math.max(streak, 11),
    lastWeight: weightHistory[weightHistory.length - 1]?.weight,
  };
}

export async function seedOmarHistory() {
  const user = await User.findOne({ email: EMAIL });
  if (!user) {
    throw new Error(`No account found for ${EMAIL}`);
  }

  const history = buildOmarHistory();
  user.previousRecords = history.records;
  user.nutritionHistory = history.nutritionHistory;
  user.weightHistory = history.weightHistory;
  user.streak = history.streak;
  user.lastCheckIn = dayKey(new Date());
  user.isVerified = true;

  if (!user.healthInfo?.fitnessGoals) {
    user.healthInfo.fitnessGoals = "muscle-gain";
  }
  if (!user.healthInfo?.activityLevel) {
    user.healthInfo.activityLevel = "moderate";
  }
  if (!user.healthInfo?.preferredWorkoutType) {
    user.healthInfo.preferredWorkoutType = "strength";
  }

  await user.save();
  return {
    email: user.email,
    records: history.records.length,
    weighIns: history.weightHistory.length,
    nutritionDays: history.nutritionHistory.length,
    streak: history.streak,
    lastWeight: history.lastWeight,
  };
}

const isDirect = process.argv[1] && process.argv[1].includes("seedHistory");
if (isDirect) {
  try {
    await mongoose.connect(process.env.DATABASE_URL);
    const result = await seedOmarHistory();
    console.log("history seeded", result);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}
