import Meal from "../models/MealModel.mjs";
import Exercise from "../models/ExerciseModel.mjs";

const meals = [
  { name: "Greek Yogurt Bowl", nameKey: "meal_yogurt", descriptionKey: "meal_yogurt_d", category: "breakfast", calories: 320, protein: 24, carbs: 38, fat: 8, tags: ["high-protein"], description: "Yogurt, berries, and honey." },
  { name: "Avocado Toast", nameKey: "meal_avocado", descriptionKey: "meal_avocado_d", category: "breakfast", calories: 380, protein: 12, carbs: 36, fat: 20, tags: ["vegetarian"], description: "Sourdough, avocado, chili flakes." },
  { name: "Overnight Oats", nameKey: "meal_oats", descriptionKey: "meal_oats_d", category: "breakfast", calories: 340, protein: 16, carbs: 48, fat: 10, tags: ["balanced"], description: "Oats, milk, chia, and banana." },
  { name: "Veggie Omelette", nameKey: "meal_omelette", descriptionKey: "meal_omelette_d", category: "breakfast", calories: 290, protein: 20, carbs: 8, fat: 20, tags: ["keto-friendly"], description: "Eggs, spinach, and mushrooms." },
  { name: "Grilled Chicken Bowl", nameKey: "meal_chicken", descriptionKey: "meal_chicken_d", category: "lunch", calories: 520, protein: 42, carbs: 48, fat: 16, tags: ["high-protein", "balanced"], description: "Chicken, rice, and greens." },
  { name: "Salmon & Quinoa", nameKey: "meal_salmon", descriptionKey: "meal_salmon_d", category: "lunch", calories: 560, protein: 38, carbs: 40, fat: 24, tags: ["omega-3"], description: "Baked salmon with quinoa salad." },
  { name: "Turkey Wrap", nameKey: "meal_turkey", descriptionKey: "meal_turkey_d", category: "lunch", calories: 430, protein: 32, carbs: 42, fat: 14, tags: ["quick"], description: "Whole-wheat wrap with turkey." },
  { name: "Lentil Salad", nameKey: "meal_lentil", descriptionKey: "meal_lentil_d", category: "lunch", calories: 390, protein: 22, carbs: 46, fat: 12, tags: ["vegan"], description: "Lentils, cucumber, lemon, and olive oil." },
  { name: "Lean Beef Stir Fry", nameKey: "meal_beef", descriptionKey: "meal_beef_d", category: "dinner", calories: 580, protein: 40, carbs: 44, fat: 22, tags: ["muscle-gain"], description: "Beef, broccoli, and jasmine rice." },
  { name: "Baked Cod Plate", nameKey: "meal_cod", descriptionKey: "meal_cod_d", category: "dinner", calories: 410, protein: 36, carbs: 28, fat: 14, tags: ["light"], description: "Cod, potatoes, and salad." },
  { name: "Chicken Veggie Soup", nameKey: "meal_soup", descriptionKey: "meal_soup_d", category: "dinner", calories: 320, protein: 28, carbs: 22, fat: 10, tags: ["light"], description: "Broth, chicken, and mixed vegetables." },
  { name: "Tofu Buddha Bowl", nameKey: "meal_tofu", descriptionKey: "meal_tofu_d", category: "dinner", calories: 450, protein: 24, carbs: 52, fat: 16, tags: ["vegan"], description: "Tofu, brown rice, and roasted veg." },
  { name: "Protein Shake", nameKey: "meal_shake", descriptionKey: "meal_shake_d", category: "snack", calories: 210, protein: 28, carbs: 12, fat: 4, tags: ["quick", "high-protein"], description: "Whey, banana, and milk." },
  { name: "Hummus & Veg", nameKey: "meal_hummus", descriptionKey: "meal_hummus_d", category: "snack", calories: 180, protein: 7, carbs: 18, fat: 9, tags: ["vegan"], description: "Carrots, cucumber, and hummus." },
  { name: "Cottage Cheese Cup", nameKey: "meal_cottage", descriptionKey: "meal_cottage_d", category: "snack", calories: 160, protein: 18, carbs: 8, fat: 6, tags: ["high-protein"], description: "Cottage cheese with pineapple." },
  { name: "Apple & Almonds", nameKey: "meal_apple", descriptionKey: "meal_apple_d", category: "snack", calories: 220, protein: 6, carbs: 24, fat: 12, tags: ["balanced"], description: "One apple and a small handful of almonds." },
];

const exercises = [
  { name: "Push Up", nameKey: "ex_pushup", instructionsKey: "ex_pushup_d", muscle: "chest", equipment: "bodyweight", difficulty: "beginner", type: "strength", duration: 8, instructions: "Hands under shoulders. Lower with control, then press up." },
  { name: "Squat", nameKey: "ex_squat", instructionsKey: "ex_squat_d", muscle: "legs", equipment: "bodyweight", difficulty: "beginner", type: "strength", duration: 8, instructions: "Feet shoulder-width. Sit back, keep heels down, stand tall." },
  { name: "Plank", nameKey: "ex_plank", instructionsKey: "ex_plank_d", muscle: "core", equipment: "bodyweight", difficulty: "beginner", type: "strength", duration: 4, instructions: "Elbows under shoulders. Brace ribs and hold a straight line." },
  { name: "Dumbbell Row", nameKey: "ex_row", instructionsKey: "ex_row_d", muscle: "back", equipment: "dumbbell", difficulty: "intermediate", type: "strength", duration: 10, instructions: "Hinge at the hips and pull the weight to the ribcage." },
  { name: "Jump Rope", nameKey: "ex_rope", instructionsKey: "ex_rope_d", muscle: "full-body", equipment: "rope", difficulty: "beginner", type: "cardio", duration: 10, instructions: "Light bounce on the balls of the feet. Keep wrists relaxed." },
  { name: "Lunges", nameKey: "ex_lunge", instructionsKey: "ex_lunge_d", muscle: "legs", equipment: "bodyweight", difficulty: "beginner", type: "strength", duration: 8, instructions: "Step forward, drop the back knee, then drive through the front heel." },
  { name: "Shoulder Press", nameKey: "ex_press", instructionsKey: "ex_press_d", muscle: "shoulders", equipment: "dumbbell", difficulty: "intermediate", type: "strength", duration: 8, instructions: "Press overhead without arching the lower back." },
  { name: "Deadlift", nameKey: "ex_deadlift", instructionsKey: "ex_deadlift_d", muscle: "back", equipment: "barbell", difficulty: "advanced", type: "strength", duration: 12, instructions: "Hinge, keep the bar close, and stand by driving the hips forward." },
  { name: "Mountain Climbers", nameKey: "ex_climbers", instructionsKey: "ex_climbers_d", muscle: "core", equipment: "bodyweight", difficulty: "beginner", type: "hiit", duration: 6, instructions: "High plank, then drive knees in quickly without bouncing the hips." },
  { name: "Glute Bridge", nameKey: "ex_bridge", instructionsKey: "ex_bridge_d", muscle: "legs", equipment: "bodyweight", difficulty: "beginner", type: "strength", duration: 6, instructions: "Lie on your back, drive through the heels, and squeeze at the top." },
  { name: "Bicycle Crunch", nameKey: "ex_bicycle", instructionsKey: "ex_bicycle_d", muscle: "core", equipment: "bodyweight", difficulty: "beginner", type: "strength", duration: 6, instructions: "Opposite elbow to opposite knee. Slow the twist." },
  { name: "Burpee", nameKey: "ex_burpee", instructionsKey: "ex_burpee_d", muscle: "full-body", equipment: "bodyweight", difficulty: "intermediate", type: "hiit", duration: 8, instructions: "Squat, plank, jump back up. Land softly." },
];

async function upsertByName(Model, items) {
  for (const item of items) {
    await Model.updateOne({ name: item.name }, { $set: item }, { upsert: true });
  }
}

export async function seedCatalog() {
  await Promise.all([
    upsertByName(Meal, meals),
    upsertByName(Exercise, exercises),
  ]);
  console.log(`catalog ready: ${meals.length} meals, ${exercises.length} exercises`);
}
