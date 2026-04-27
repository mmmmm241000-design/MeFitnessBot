import OpenAI from "openai";
import { env } from "../../lib/env";

const openai = new OpenAI({
  apiKey: env.openaiApiKey || process.env.OPENAI_API_KEY || "",
});

export async function generateMealPlan(params: {
  goal: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  budget: string;
  preferences?: string;
}) {
  const prompt = `أنت خبير تغذية رياضي محترف. صمم خطة وجبات يومية باللغة العربية للاعب كمال أجسام.

البيانات:
- الهدف: ${params.goal}
- السعرات المطلوبة: ${params.calories}
- البروتين: ${params.protein}g
- الكارب: ${params.carbs}g
- الدهون: ${params.fats}g
- الميزانية: ${params.budget}
${params.preferences ? `- التفضيلات: ${params.preferences}` : ""}

المطلوب:
1. خطة 5-6 وجبات يومية
2. كل وجبة تحتوي على: الأطعمة + السعرات + البروتين + الكارب + الدهون
3. بدائل رخيصة عند الإمكان
4. نصائح تحضير
5. اجعل الرد منسقاً وواضحاً

اكتب بالعربية الفصحى.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "أنت مدرب تغذية رياضي خبير في كمال الأجسام. تقدم خططاً علمية مبنية على أبحاث ISSN وACSM." },
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 2000,
  });

  return response.choices[0].message.content || "عذراً، حدث خطأ في توليد الخطة.";
}

export async function generateWorkoutPlan(params: {
  goal: string;
  experience: string;
  daysPerWeek: number;
  splitType: string;
  injuries?: string;
}) {
  const prompt = `أنت مدرب كمال أجسام محترف. صمم جدول تمارين أسبوعي باللغة العربية.

البيانات:
- الهدف: ${params.goal}
- الخبرة: ${params.experience}
- أيام التمرين: ${params.daysPerWeek}
- نوع التقسيم: ${params.splitType}
${params.injuries ? `- إصابات/قيود: ${params.injuries}` : ""}

المطلوب:
1. جدول ${params.daysPerWeek} أيام تمرين
2. كل يوم: العضلات المستهدفة + التمارين + المجموعات + التكرارات + الراحة
3. نصائح تقدم الحمل (Progressive Overload)
4. تمارين بديلة إذا لم تتوفر معدات
5. اجعل الرد منسقاً وواضحاً

اكتب بالعربية الفصحى.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "أنت مدرب كمال أجسام خبير، تبني خططك على إرشادات ACSM وNSCA. تركز على التقدم التدريجي والتقنية السليمة." },
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 2500,
  });

  return response.choices[0].message.content || "عذراً، حدث خطأ في توليد الجدول.";
}

export async function coachChat(params: {
  message: string;
  userContext: string;
  history: { role: string; content: string }[];
}) {
  const messages = [
    {
      role: "system",
      content: `أنت IronCoach - مدرب كمال أجسام شخصي ذكي ومحترف. تتحدث بالعربية.

مبادئك:
- تعتمد على أبحاث PubMed، ACSM، ISSNS
- تقدم نصائح عملية ومختصرة
- تحفز المستخدم دائماً
- لا تكتب ردوداً طويلة جداً (300 كلمة كحد أقصى)
- تذكر سياق المستخدم: ${params.userContext}

البيانات الحالية للمستخدم:
${params.userContext}`,
    },
    ...params.history.slice(-5),
    { role: "user", content: params.message },
  ];

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: messages as any,
    temperature: 0.8,
    max_tokens: 1000,
  });

  return response.choices[0].message.content || "عذراً، حدث خطأ. حاول مرة أخرى.";
}

export async function analyzeProgress(params: {
  weeklyData: string;
  userGoal: string;
  previousAnalysis?: string;
}) {
  const prompt = `أحلل تقدم لاعب كمال الأجسام هذا الأسبوع:

البيانات:
${params.weeklyData}

الهدف: ${params.userGoal}
${params.previousAnalysis ? "التحليل السابق: " + params.previousAnalysis : ""}

المطلوب:
1. تقييم الأداء (أداء جيد/يحتاج تحسين/ممتاز)
2. اكتشاف أي ثبات أو تراجع
3. توصيات فورية للتعديل
4. رسالة تحفيزية قصيرة

اكتب بالعربية الفصحى، 200 كلمة كحد أقصى.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "أنت محلل أداء رياضي، تستخدم البيانات لإعطاء رؤى علمية دقيقة." },
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 800,
  });

  return response.choices[0].message.content || "عذراً، حدث خطأ في التحليل.";
}

export async function generateMotivation(name?: string) {
  const prompt = `اكتب رسالة تحفيزية قصيرة (30-50 كلمة) للاعب كمال أجسام بالعربية.
${name ? `مخصصة لـ: ${name}` : ""}
اجعلها قوية ومؤثرة.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "أنت مدرب تحفيزي محترف." },
      { role: "user", content: prompt },
    ],
    temperature: 0.9,
    max_tokens: 200,
  });

  return response.choices[0].message.content || "استمر! كل يوم تقربك من هدفك. 💪";
}
