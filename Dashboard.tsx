import { trpc } from "@/providers/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Dumbbell, Activity, TrendingUp, ArrowRight } from "lucide-react";
import { Link } from "react-router";
import { useAuth } from "@/hooks/useAuth";

export default function Dashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const { data: stats, isLoading: statsLoading } = trpc.dashboard.stats.useQuery();
  const { data: recentUsers, isLoading: usersLoading } = trpc.dashboard.recentUsers.useQuery({ limit: 10 });
  const { data: weeklyActivity, isLoading: activityLoading } = trpc.dashboard.weeklyActivity.useQuery();

  if (authLoading) return <DashboardSkeleton />;
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>يجب تسجيل الدخول</CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to="/login">تسجيل الدخول</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white" dir="rtl">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-2 rounded-lg">
              <Dumbbell className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg">IronCoach Pro</h1>
              <p className="text-xs text-slate-400">لوحة التحكم</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="border-amber-500/50 text-amber-400">
              {user.role === "admin" ? "مدير" : "مستخدم"}
            </Badge>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/">الرئيسية</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <StatCard
            icon={<Users className="w-5 h-5" />}
            title="المستخدمين"
            value={stats?.totalUsers || 0}
            loading={statsLoading}
            color="blue"
          />
          <StatCard
            icon={<Activity className="w-5 h-5" />}
            title="نشطون"
            value={stats?.activeUsers || 0}
            loading={statsLoading}
            color="green"
          />
          <StatCard
            icon={<TrendingUp className="w-5 h-5" />}
            title="تسجيلات اليوم"
            value={stats?.todayLogs || 0}
            loading={statsLoading}
            color="amber"
          />
          <StatCard
            icon={<Dumbbell className="w-5 h-5" />}
            title="تمارين منجزة"
            value={stats?.totalWorkouts || 0}
            loading={statsLoading}
            color="purple"
          />
          <StatCard
            icon={<Dumbbell className="w-5 h-5" />}
            title="تمارين متاحة"
            value={stats?.totalExercises || 0}
            loading={statsLoading}
            color="orange"
          />
        </div>

        {/* Navigation Cards */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <Card className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors cursor-pointer">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="w-5 h-5 text-blue-400" />
                إدارة المستخدمين
              </CardTitle>
              <CardDescription>عرض وتتبع جميع مستخدمي البوت</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" size="sm" asChild className="text-blue-400">
                <Link to="/users">عرض الكل <ArrowRight className="w-4 h-4 mr-1" /></Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors cursor-pointer">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="w-5 h-5 text-green-400" />
                التحليلات والإحصائيات
              </CardTitle>
              <CardDescription>رسوم بيانية وتحليلات الأداء</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" size="sm" asChild className="text-green-400">
                <Link to="/analytics">عرض التحليلات <ArrowRight className="w-4 h-4 mr-1" /></Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Weekly Activity */}
        <Card className="bg-slate-900 border-slate-800 mb-8">
          <CardHeader>
            <CardTitle>النشاط الأسبوعي</CardTitle>
            <CardDescription>تسجيلات يومية وتمارين خلال آخر 7 أيام</CardDescription>
          </CardHeader>
          <CardContent>
            {activityLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : (
              <div className="space-y-3">
                {weeklyActivity?.map((day: { date: string; logs: number; workouts: number }) => (
                  <div key={day.date} className="flex items-center gap-4">
                    <div className="w-24 text-sm text-slate-400 text-right">{day.date}</div>
                    <div className="flex-1 flex gap-2">
                      <div className="flex-1 bg-slate-800 rounded-full h-6 relative overflow-hidden">
                        <div
                          className="bg-blue-500 h-full rounded-full transition-all"
                          style={{ width: `${Math.min((day.logs / (weeklyActivity[0]?.logs || 1)) * 100, 100)}%` }}
                        />
                        <span className="absolute inset-0 flex items-center justify-center text-xs">
                          {day.logs} تسجيل
                        </span>
                      </div>
                      <div className="flex-1 bg-slate-800 rounded-full h-6 relative overflow-hidden">
                        <div
                          className="bg-green-500 h-full rounded-full transition-all"
                          style={{ width: `${Math.min((day.workouts / (weeklyActivity[0]?.workouts || 1)) * 100, 100)}%` }}
                        />
                        <span className="absolute inset-0 flex items-center justify-center text-xs">
                          {day.workouts} تمرين
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Users */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle>آخر المستخدمين</CardTitle>
          </CardHeader>
          <CardContent>
            {usersLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {recentUsers?.map((user: any) => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center text-sm">
                        {(user.firstName?.[0] || "U").toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{user.firstName} {user.lastName}</p>
                        <p className="text-xs text-slate-400">@{user.username || "no-username"}</p>
                      </div>
                    </div>
                    <div className="text-xs text-slate-400">
                      {user.profile?.setupComplete ? (
                        <Badge variant="outline" className="border-green-500/50 text-green-400">نشط</Badge>
                      ) : (
                        <Badge variant="outline" className="border-amber-500/50 text-amber-400">غير مكتمل</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, loading, color }: {
  icon: React.ReactNode;
  title: string;
  value: number;
  loading: boolean;
  color: string;
}) {
  const colorMap: Record<string, string> = {
    blue: "from-blue-500/20 to-blue-600/20 text-blue-400",
    green: "from-green-500/20 to-green-600/20 text-green-400",
    amber: "from-amber-500/20 to-amber-600/20 text-amber-400",
    purple: "from-purple-500/20 to-purple-600/20 text-purple-400",
    orange: "from-orange-500/20 to-orange-600/20 text-orange-400",
  };

  return (
    <Card className={`bg-gradient-to-br ${colorMap[color]} border-slate-800`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium opacity-80">{title}</CardTitle>
          <div className="opacity-60">{icon}</div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-16" />
        ) : (
          <div className="text-2xl font-bold">{value.toLocaleString()}</div>
        )}
      </CardContent>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <Skeleton className="h-16 w-full mb-8" />
      <div className="grid grid-cols-5 gap-4 mb-8">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
