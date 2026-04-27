import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell, Brain, TrendingUp, Users, ArrowRight, Shield, MessageCircle } from "lucide-react";
import { Link } from "react-router";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Hero */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-4 rounded-2xl">
              <Dumbbell className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
            IronCoach Pro
          </h1>
          <p className="text-xl text-slate-300 mb-8 leading-relaxed">
            مدربك الشخصي الذكي في Telegram لبناء الكتلة العضلية
            <br />
            متابعة يومية، خطط غذائية، تمارين مخصصة، وذكاء تكيفي
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg" className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700">
              <Link to="/dashboard">لوحة التحكم <ArrowRight className="w-4 h-4 mr-2" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-slate-500 text-slate-300 hover:bg-slate-800">
              <Link to="/login">تسجيل الدخول</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">المميزات الرئيسية</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard
            icon={<Brain className="w-8 h-8" />}
            title="مدرب ذكي"
            description="AI يتعلم من بياناتك ويقدم نصائح مخصصة بناءً على أبحاث PubMed و ACSM"
          />
          <FeatureCard
            icon={<TrendingUp className="w-8 h-8" />}
            title="متابعة التقدم"
            description="تتبع الوزن، القياسات، الصور، والأداء مع تحليلات أسبوعية ذكية"
          />
          <FeatureCard
            icon={<MessageCircle className="w-8 h-8" />}
            title="خطط غذائية"
            description="وجبات مقترحة حسب هدفك وميزانيتك مع حسابات السعرات والماكروز"
          />
          <FeatureCard
            icon={<Dumbbell className="w-8 h-8" />}
            title="جداول تمارين"
            description="خطط تمرين مخصصة بأوزان وتكرارات مع تقدم تلقائي"
          />
          <FeatureCard
            icon={<Users className="w-8 h-8" />}
            title="واجهة احترافية"
            description="أزرار منظمة، قوائم سهلة، وتجربة مستخدم ممتازة بالعربية"
          />
          <FeatureCard
            icon={<Shield className="w-8 h-8" />}
            title="أمان وخصوصية"
            description="بياناتك محفوظة بشكل آمن مع قابلية التوسع المستقبلي"
          />
        </div>
      </div>

      {/* Stats preview */}
      <div className="container mx-auto px-4 py-16">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-center text-2xl">ابدأ رحلتك الآن</CardTitle>
            <CardDescription className="text-center text-slate-400">
              تواصل مع البوت على Telegram وابدأ بناء جسمك المثالي
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pb-8">
            <div className="text-center">
              <p className="text-slate-400 mb-4">الخطوات:</p>
              <ol className="text-right space-y-2 text-slate-300">
                <li>1. افتح Telegram وابحث عن @IronCoachProBot</li>
                <li>2. اضغط Start وأكمل ملفك الشخصي</li>
                <li>3. احصل على خطة غذائية وتمرين مخصصة</li>
                <li>4. سجل يومياً وتابع تقدمك</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 text-center text-slate-500">
        <p>IronCoach Pro - مدرب كمال الأجسام الذكي © 2025</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <Card className="bg-slate-800/50 border-slate-700 hover:border-amber-500/50 transition-colors">
      <CardHeader>
        <div className="text-amber-400 mb-2">{icon}</div>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-slate-400 text-sm">{description}</p>
      </CardContent>
    </Card>
  );
}
