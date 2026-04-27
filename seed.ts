import { getDb } from "../api/queries/connection";
import { exercises, foodItems } from "./schema";

async function seed() {
  const db = getDb();

  // Seed exercises
  const exerciseData = [
    // Chest
    { name: "Barbell Bench Press", nameAr: "ضغطة الصدر بالبار", category: "chest", muscleGroup: "chest", equipment: "barbell", difficulty: "intermediate", isCompound: true, instructions: "Lie flat on bench, grip bar slightly wider than shoulders, lower to chest, press up.", instructionsAr: "استلقِ على البنش، امسك البار أعرض قليلاً من الكتفين، انزل إلى الصدر، اضغط للأعلى.", tips: "Keep feet planted, slight arch in back, control the eccentric." },
    { name: "Incline Dumbbell Press", nameAr: "ضغطة الأدمبل المنحرف", category: "chest", muscleGroup: "upper chest", equipment: "dumbbell", difficulty: "intermediate", isCompound: true, instructions: "Set bench to 30-45 degrees, press dumbbells from chest level.", instructionsAr: "اجعل البENCH منحرفاً 30-45 درجة، اضغط الأدمبل من مستوى الصدر.", tips: "Focus on upper chest squeeze at top." },
    { name: "Cable Fly", nameAr: "فتحة الصدر بالكيبل", category: "chest", muscleGroup: "chest", equipment: "cable", difficulty: "beginner", isCompound: false, instructions: "Stand in middle of cable machine, bring handles together in arc motion.", instructionsAr: "قف في منتصف جهاز الكيبل، اجمع المقابض معاً بحركة قوسية.", tips: "Slight bend in elbows, squeeze chest at peak contraction." },
    { name: "Push Ups", nameAr: "تمرين الضغط", category: "chest", muscleGroup: "chest, triceps", equipment: "bodyweight", difficulty: "beginner", isCompound: true, instructions: "Start in plank position, lower body until chest nearly touches floor, push back up.", instructionsAr: "ابدأ بوضعية البلانك، انزل حتى يكاد صدرك يلمس الأرض، اضغط للأعلى.", tips: "Keep core tight, full range of motion." },
    // Back
    { name: "Deadlift", nameAr: "الرفعة الميتة", category: "back", muscleGroup: "back, legs, core", equipment: "barbell", difficulty: "advanced", isCompound: true, instructions: "Stand with feet hip-width, grip bar, lift by extending hips and knees.", instructionsAr: "قف بعرض الوركين، امسك البار، ارفع بتمديد الوركين والركبتين.", tips: "Keep back neutral, drive through heels, lockout at top." },
    { name: "Pull Ups", nameAr: "تمرين السحب", category: "back", muscleGroup: "lats, biceps", equipment: "bodyweight", difficulty: "intermediate", isCompound: true, instructions: "Hang from bar, pull body up until chin over bar, lower with control.", instructionsAr: "تدلّق من البار، اسحب جسمك حتى يتجاوز ذقنك البار، انزل بتحكم.", tips: "Full dead hang at bottom, drive elbows down." },
    { name: "Bent Over Row", nameAr: "الصف المنحني", category: "back", muscleGroup: "lats, rhomboids", equipment: "barbell", difficulty: "intermediate", isCompound: true, instructions: "Bend at hips, back flat, row bar to lower chest/upper abs.", instructionsAr: "انحنِ عند الوركين، ظهر مستوٍ، اسحب البار إلى أسفل الصدر.", tips: "Don't round back, squeeze shoulder blades together." },
    { name: "Lat Pulldown", nameAr: "سحب اللات", category: "back", muscleGroup: "lats", equipment: "machine", difficulty: "beginner", isCompound: true, instructions: "Sit at lat pulldown machine, pull bar to upper chest.", instructionsAr: "اجلس في جهاز سحب اللات، اسحب البار إلى أعلى الصدر.", tips: "Lean back slightly, pull elbows down and back." },
    // Shoulders
    { name: "Overhead Press", nameAr: "الضغط العلوي", category: "shoulders", muscleGroup: "shoulders, triceps", equipment: "barbell", difficulty: "intermediate", isCompound: true, instructions: "Press bar from upper chest to full overhead extension.", instructionsAr: "اضغط البار من أعلى الصدر إلى التمدد الكامل فوق الرأس.", tips: "Brace core, don't arch excessively, head through at top." },
    { name: "Lateral Raises", nameAr: "رفعات جانبية", category: "shoulders", muscleGroup: "side deltoids", equipment: "dumbbell", difficulty: "beginner", isCompound: false, instructions: "Raise dumbbells to side until arms parallel to floor.", instructionsAr: "ارفع الأدمبل للجانب حتى تتوازى الذراعان مع الأرض.", tips: "Slight bend in elbows, don't swing, control the descent." },
    { name: "Face Pulls", nameAr: "سحب الوجه", category: "shoulders", muscleGroup: "rear deltoids", equipment: "cable", difficulty: "beginner", isCompound: false, instructions: "Pull rope to face level, external rotate at end.", instructionsAr: "اسحب الحبل إلى مستوى الوجه، قم بالدوران الخارجي في النهاية.", tips: "Keep elbows high, squeeze rear delts." },
    // Legs
    { name: "Squat", nameAr: "السكوات", category: "legs", muscleGroup: "quads, glutes", equipment: "barbell", difficulty: "intermediate", isCompound: true, instructions: "Bar on upper back, descend until thighs parallel, drive up.", instructionsAr: "البار على ظهرك العلوي، انزل حتى تتوازي الفخذين، اضغط للأعلى.", tips: "Knees track over toes, chest up, brace core." },
    { name: "Leg Press", nameAr: "ضغطة الأرجل", category: "legs", muscleGroup: "quads, glutes", equipment: "machine", difficulty: "beginner", isCompound: true, instructions: "Sit in leg press, lower platform until knees 90 degrees, press up.", instructionsAr: "اجلس في ضغطة الأرجل، انزل المنصة حتى تكون الركبتين بزاوية 90 درجة.", tips: "Don't lock knees at top, full range of motion." },
    { name: "Romanian Deadlift", nameAr: "الرفعة الرومانية", category: "legs", muscleGroup: "hamstrings, glutes", equipment: "barbell", difficulty: "intermediate", isCompound: true, instructions: "Hip hinge with slight knee bend, lower bar along legs, feel hamstring stretch.", instructionsAr: "مفصل الورك مع ثني بسيط للركبة، انزل البار على طول الساقين.", tips: "Keep bar close to body, don't round back." },
    { name: "Walking Lunges", nameAr: "خطوات المشي", category: "legs", muscleGroup: "quads, glutes", equipment: "dumbbell", difficulty: "intermediate", isCompound: true, instructions: "Step forward into lunge, back knee nearly touches ground, drive up and step forward.", instructionsAr: "خطوة إلى الأمام في الوضعية، ركبة الخلف تكاد تلمس الأرض، اضغط للأعلى.", tips: "Torso upright, controlled steps." },
    { name: "Leg Curls", nameAr: "ثني الأرجل", category: "legs", muscleGroup: "hamstrings", equipment: "machine", difficulty: "beginner", isCompound: false, instructions: "Lie face down, curl heels toward glutes, squeeze hamstrings.", instructionsAr: "استلقِ على وجهك، اثنِ الكعبين نحو الأرداف، شدّ أوتار الركبة.", tips: "Don't lift hips off pad, control the negative." },
    { name: "Calf Raises", nameAr: "رفعات السمانة", category: "legs", muscleGroup: "calves", equipment: "machine", difficulty: "beginner", isCompound: false, instructions: "Rise up on toes, hold at top, lower slowly.", instructionsAr: "ارتفع على أصابع قدميك، تماسك في الأعلى، انزل ببطء.", tips: "Full stretch at bottom, pause at top." },
    // Arms
    { name: "Barbell Curls", nameAr: "ثني البايسبس بالبار", category: "arms", muscleGroup: "biceps", equipment: "barbell", difficulty: "beginner", isCompound: false, instructions: "Curl bar from arms extended to shoulders, squeeze biceps.", instructionsAr: "اثنِ البار من الذراعين الممدودتين إلى الكتفين، شدّ العضلة ذات الرأسين.", tips: "Don't swing, elbows fixed at sides." },
    { name: "Hammer Curls", nameAr: "ثني المطرقة", category: "arms", muscleGroup: "biceps, brachialis", equipment: "dumbbell", difficulty: "beginner", isCompound: false, instructions: "Curl dumbbells with neutral grip (palms facing each other).", instructionsAr: "اثنِ الأدمبل بقبضة محايدة (راحتا اليد متجهتان للداخل).", tips: "Great for forearm and brachialis development." },
    { name: "Tricep Pushdowns", nameAr: "ضغط الترايسبس", category: "arms", muscleGroup: "triceps", equipment: "cable", difficulty: "beginner", isCompound: false, instructions: "Push bar/rope down until arms fully extended, squeeze triceps.", instructionsAr: "اضغط الحبل/البار للأسفل حتى تمدد الذراعين بالكامل.", tips: "Keep elbows pinned to sides." },
    { name: "Skull Crushers", nameAr: "تكسير الجمجمة", category: "arms", muscleGroup: "triceps", equipment: "barbell", difficulty: "intermediate", isCompound: false, instructions: "Lie on bench, lower bar to forehead, extend arms.", instructionsAr: "استلقِ على البنش، انزل البار إلى الجبين، مدّ الذراعين.", tips: "Upper arms stationary, lower under control." },
    // Core
    { name: "Plank", nameAr: "البلانك", category: "core", muscleGroup: "core", equipment: "bodyweight", difficulty: "beginner", isCompound: false, instructions: "Hold push-up position on forearms, keep body straight.", instructionsAr: "حافظ على وضعية الضغط على السواعد، أبقِ الجسم مستقيماً.", tips: "Don't let hips sag, breathe normally." },
    { name: "Hanging Leg Raises", nameAr: "رفع الأرجل المعلق", category: "core", muscleGroup: "lower abs", equipment: "bodyweight", difficulty: "intermediate", isCompound: false, instructions: "Hang from bar, raise legs to 90 degrees or higher.", instructionsAr: "تدلّق من البار، ارفع الأرجل إلى 90 درجة أو أعلى.", tips: "Control the swing, avoid momentum." },
    // Cardio
    { name: "Treadmill Running", nameAr: "الجري على السير", category: "cardio", muscleGroup: "full body", equipment: "machine", difficulty: "beginner", isCompound: true, instructions: "Run at chosen pace, maintain good posture.", instructionsAr: "اركض بالسرعة المختارة، حافظ على وضعية جيدة.", tips: "Don't hold handles, natural stride." },
  ];

  await db.insert(exercises).values(exerciseData as any);

  // Seed food items
  const foodData = [
    // Proteins
    { name: "Chicken Breast", nameAr: "صدر دجاج", category: "protein", caloriesPer100g: 165, proteinPer100g: 31, carbsPer100g: 0, fatsPer100g: 3.6, budgetLevel: "medium", isVegetarian: false, isVegan: false, commonServing: "150g cooked" },
    { name: "Eggs", nameAr: "بيض", category: "protein", caloriesPer100g: 155, proteinPer100g: 13, carbsPer100g: 1.1, fatsPer100g: 11, budgetLevel: "low", isVegetarian: true, isVegan: false, commonServing: "2 large eggs" },
    { name: "Egg Whites", nameAr: "بياض بيض", category: "protein", caloriesPer100g: 52, proteinPer100g: 11, carbsPer100g: 0.7, fatsPer100g: 0.2, budgetLevel: "low", isVegetarian: true, isVegan: false, commonServing: "200ml" },
    { name: "Tuna (canned in water)", nameAr: "تونة معلبة بالماء", category: "protein", caloriesPer100g: 116, proteinPer100g: 26, carbsPer100g: 0, fatsPer100g: 1, budgetLevel: "low", isVegetarian: false, isVegan: false, commonServing: "1 can (165g)" },
    { name: "Salmon", nameAr: "سلمون", category: "protein", caloriesPer100g: 208, proteinPer100g: 20, carbsPer100g: 0, fatsPer100g: 13, budgetLevel: "high", isVegetarian: false, isVegan: false, commonServing: "150g fillet" },
    { name: "Lean Beef", nameAr: "لحم بقري قليل الدهن", category: "protein", caloriesPer100g: 250, proteinPer100g: 26, carbsPer100g: 0, fatsPer100g: 15, budgetLevel: "medium", isVegetarian: false, isVegan: false, commonServing: "150g" },
    { name: "Turkey Breast", nameAr: "صدر ديك رومي", category: "protein", caloriesPer100g: 135, proteinPer100g: 30, carbsPer100g: 0, fatsPer100g: 1, budgetLevel: "medium", isVegetarian: false, isVegan: false, commonServing: "150g" },
    { name: "Greek Yogurt (0%)", nameAr: "زبادي يوناني خالي الدسم", category: "dairy", caloriesPer100g: 59, proteinPer100g: 10, carbsPer100g: 3.6, fatsPer100g: 0.4, budgetLevel: "medium", isVegetarian: true, isVegan: false, commonServing: "200g cup" },
    { name: "Cottage Cheese (low fat)", nameAr: "جبنة قريش قليلة الدسم", category: "dairy", caloriesPer100g: 72, proteinPer100g: 12, carbsPer100g: 2.7, fatsPer100g: 1, budgetLevel: "medium", isVegetarian: true, isVegan: false, commonServing: "200g" },
    { name: "Whey Protein", nameAr: "بروتين مصل اللبن", category: "protein", caloriesPer100g: 400, proteinPer100g: 80, carbsPer100g: 8, fatsPer100g: 5, budgetLevel: "medium", isVegetarian: true, isVegan: false, commonServing: "30g scoop" },
    { name: "Lentils (cooked)", nameAr: "عدس مطبوخ", category: "protein", caloriesPer100g: 116, proteinPer100g: 9, carbsPer100g: 20, fatsPer100g: 0.4, budgetLevel: "low", isVegetarian: true, isVegan: true, commonServing: "200g" },
    { name: "Chickpeas (cooked)", nameAr: "حمص مطبوخ", category: "protein", caloriesPer100g: 164, proteinPer100g: 8.9, carbsPer100g: 27, fatsPer100g: 2.6, budgetLevel: "low", isVegetarian: true, isVegan: true, commonServing: "200g" },
    { name: "Tofu", nameAr: "توفو", category: "protein", caloriesPer100g: 76, proteinPer100g: 8, carbsPer100g: 1.9, fatsPer100g: 4.8, budgetLevel: "low", isVegetarian: true, isVegan: true, commonServing: "150g" },
    // Carbs
    { name: "White Rice (cooked)", nameAr: "أرز أبيض مطبوخ", category: "carbs", caloriesPer100g: 130, proteinPer100g: 2.7, carbsPer100g: 28, fatsPer100g: 0.3, budgetLevel: "low", isVegetarian: true, isVegan: true, commonServing: "200g" },
    { name: "Brown Rice (cooked)", nameAr: "أرز بني مطبوخ", category: "carbs", caloriesPer100g: 112, proteinPer100g: 2.6, carbsPer100g: 23, fatsPer100g: 0.9, budgetLevel: "low", isVegetarian: true, isVegan: true, commonServing: "200g" },
    { name: "Oats", nameAr: "شوفان", category: "grains", caloriesPer100g: 389, proteinPer100g: 16.9, carbsPer100g: 66, fatsPer100g: 6.9, budgetLevel: "low", isVegetarian: true, isVegan: true, commonServing: "50g dry" },
    { name: "Sweet Potato", nameAr: "بطاطا حلوة", category: "carbs", caloriesPer100g: 86, proteinPer100g: 1.6, carbsPer100g: 20, fatsPer100g: 0.1, budgetLevel: "low", isVegetarian: true, isVegan: true, commonServing: "200g" },
    { name: "Potato (white)", nameAr: "بطاطا بيضاء", category: "carbs", caloriesPer100g: 77, proteinPer100g: 2, carbsPer100g: 17, fatsPer100g: 0.1, budgetLevel: "low", isVegetarian: true, isVegan: true, commonServing: "200g" },
    { name: "Pasta (cooked)", nameAr: "معكرونة مطبوخة", category: "carbs", caloriesPer100g: 131, proteinPer100g: 5, carbsPer100g: 25, fatsPer100g: 1.1, budgetLevel: "low", isVegetarian: true, isVegan: true, commonServing: "200g" },
    { name: "Bread (whole wheat)", nameAr: "خبز القمح الكامل", category: "grains", caloriesPer100g: 247, proteinPer100g: 13, carbsPer100g: 41, fatsPer100g: 3.4, budgetLevel: "low", isVegetarian: true, isVegan: true, commonServing: "2 slices (60g)" },
    { name: "Banana", nameAr: "موز", category: "fruits", caloriesPer100g: 89, proteinPer100g: 1.1, carbsPer100g: 23, fatsPer100g: 0.3, budgetLevel: "low", isVegetarian: true, isVegan: true, commonServing: "1 medium (120g)" },
    // Fats
    { name: "Olive Oil", nameAr: "زيت زيتون", category: "fats", caloriesPer100g: 884, proteinPer100g: 0, carbsPer100g: 0, fatsPer100g: 100, budgetLevel: "medium", isVegetarian: true, isVegan: true, commonServing: "1 tbsp (15ml)" },
    { name: "Avocado", nameAr: "أفوكادو", category: "fats", caloriesPer100g: 160, proteinPer100g: 2, carbsPer100g: 8.5, fatsPer100g: 15, budgetLevel: "medium", isVegetarian: true, isVegan: true, commonServing: "1/2 medium (100g)" },
    { name: "Almonds", nameAr: "لوز", category: "nuts", caloriesPer100g: 579, proteinPer100g: 21, carbsPer100g: 22, fatsPer100g: 50, budgetLevel: "medium", isVegetarian: true, isVegan: true, commonServing: "30g handful" },
    { name: "Peanut Butter", nameAr: "زبدة الفول السوداني", category: "nuts", caloriesPer100g: 588, proteinPer100g: 25, carbsPer100g: 20, fatsPer100g: 50, budgetLevel: "low", isVegetarian: true, isVegan: true, commonServing: "2 tbsp (32g)" },
    // Vegetables
    { name: "Broccoli", nameAr: "بروكلي", category: "vegetables", caloriesPer100g: 34, proteinPer100g: 2.8, carbsPer100g: 7, fatsPer100g: 0.4, budgetLevel: "low", isVegetarian: true, isVegan: true, commonServing: "200g" },
    { name: "Spinach", nameAr: "سبانخ", category: "vegetables", caloriesPer100g: 23, proteinPer100g: 2.9, carbsPer100g: 3.6, fatsPer100g: 0.4, budgetLevel: "low", isVegetarian: true, isVegan: true, commonServing: "100g" },
    { name: "Tomato", nameAr: "طماطم", category: "vegetables", caloriesPer100g: 18, proteinPer100g: 0.9, carbsPer100g: 3.9, fatsPer100g: 0.2, budgetLevel: "low", isVegetarian: true, isVegan: true, commonServing: "1 large (180g)" },
    { name: "Cucumber", nameAr: "خيار", category: "vegetables", caloriesPer100g: 15, proteinPer100g: 0.7, carbsPer100g: 3.6, fatsPer100g: 0.1, budgetLevel: "low", isVegetarian: true, isVegan: true, commonServing: "1 medium (200g)" },
    { name: "Carrots", nameAr: "جزر", category: "vegetables", caloriesPer100g: 41, proteinPer100g: 0.9, carbsPer100g: 10, fatsPer100g: 0.2, budgetLevel: "low", isVegetarian: true, isVegan: true, commonServing: "2 medium (120g)" },
    { name: "Bell Peppers", nameAr: "فلفل حلو", category: "vegetables", caloriesPer100g: 31, proteinPer100g: 1, carbsPer100g: 6, fatsPer100g: 0.3, budgetLevel: "low", isVegetarian: true, isVegan: true, commonServing: "1 large (150g)" },
    // Dairy
    { name: "Milk (low fat)", nameAr: "حليب قليل الدسم", category: "dairy", caloriesPer100g: 42, proteinPer100g: 3.4, carbsPer100g: 5, fatsPer100g: 1, budgetLevel: "low", isVegetarian: true, isVegan: false, commonServing: "250ml glass" },
    { name: "Cheese (feta)", nameAr: "جبنة فيتا", category: "dairy", caloriesPer100g: 264, proteinPer100g: 14, carbsPer100g: 4.1, fatsPer100g: 21, budgetLevel: "medium", isVegetarian: true, isVegan: false, commonServing: "50g" },
  ];

  await db.insert(foodItems).values(foodData as any);

  console.log("Seed completed: exercises and food items added.");
}

seed().catch(console.error);
