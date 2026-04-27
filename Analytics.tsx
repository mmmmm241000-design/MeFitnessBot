import { trpc } from "@/providers/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, ArrowRight, Activity } from "lucide-react";
import { Link } from "react-router";

export default function Analytics() {
  const { data: weeklyActivity, isLoading: activityLoading } = trpc.dashboard.weeklyActivity.useQuery();
  const { data: goalDist, isLoading: goalLoading } = trpc.dashboard.goalDistribution.useQuery();
  const { data: stats, isLoading: statsLoading } = trpc.dashboard.stats.useQuery();

  const maxLogs = Math.max(...(weeklyActivity?.map((d: { logs: number }) => d.logs) || [1]));
  const maxWorkouts = Math.max(...(weeklyActivity?.map((d: { workouts: number }) => d.workouts) || [1]));

  return (
    <div className="min-h-screen bg-slate-950 text-white" dir="rtl">
      <header className="border-b border-slate-800 bg-slate-900/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/dashboard"><ArrowRight className="w-4 h-4 ml-1" /> لوحة التحكم</Link>
            </Button>
            <h1 className="font-bold text-lg">التحليلات والإحصائيات</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Weekly Activity Chart */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-400" />
                النشاط الأسبوعي
              </CardTitle>
              <CardDescription>التسجيلات اليومية vs التمارين</CardDescription>
            </CardHeader>
            <CardContent>
              {activityLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <div className="space-y-4">
                  {weeklyActivity?.map((day: { date: string; logs: number; workouts: number }) => (
                    <div key={day.date} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">{day.date}</span>
                        <span className="text-slate-300">
                          {day.logs} تسجيل | {day.workouts} تمرين
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1 bg-slate-800 rounded-full h-4 relative overflow-hidden">
                          <div
                            className="bg-blue-500 h-full rounded-full transition-all"
                            style={{ width: `${Math.min((day.logs / maxLogs) * 100, 100)}%` }}
                          />
                        </div>
                        <div className="flex-1 bg-slate-800 rounded-full h-4 relative overflow-hidden">
                          <div
                            className="bg-green-500 h-full rounded-full transition-all"
                            style={{ width: `${Math.min((day.workouts / maxWorkouts) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Goal Distribution */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-amber-400" />
                توزيع أهداف المستخدمين
              </CardTitle>
              <CardDescription>ما يهدف إليه المستخدمون</CardDescription>
            </CardHeader>
            <CardContent>
              {goalLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <div className="space-y-4">
                  {goalDist?.map((g: { goal: string; count: number }) => {
                    const total = goalDist.reduce((sum: number, item: { count: number }) => sum + item.count, 0);
                    const pct = total > 0 ? Math.round((g.count / total) * 100) : 0;
                    const label = g.goal === "bulking" ? "ضخامة عضلية" : g.goal === "cutting" ? "تنشيف وحرق" : g.goal === "recomp" ? "إعادة تركيب" : "صيانة";
                    const color = g.goal === "bulking" ? "bg-amber-500" : g.goal === "cutting" ? "bg-green-500" : g.goal === "recomp" ? "bg-blue-500" : "bg-slate-500";

                    return (
                      <div key={g.goal} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-300">{label}</span>
                          <span className="text-slate-400">{g.count} ({pct}%)</span>
                        </div>
                        <div className="bg-slate-800 rounded-full h-6 relative overflow-hidden">
                          <div className={`${color} h-full rounded-full transition-all`} style={{ width: `${pct}%` }} />
                          <span className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                            {g.count} مستخدم
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Summary Stats */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-2">
              <CardDescription>إجمالي المستخدمين</CardDescription>
            </CardHeader>
            <CardContent>
              {statsLoading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{stats?.totalUsers}</div>}
            </CardContent>
          </Card>
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-2">
              <CardDescription>نسبة الإكمال</CardDescription>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">
                  {stats?.totalUsers ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0}%
                </div>
              )}
            </CardContent>
          </Card>
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-2">
              <CardDescription>متوسط التمارين/مستخدم</CardDescription>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">
                  {stats?.totalUsers ? (stats.totalWorkouts / stats.totalUsers).toFixed(1) : 0}
                </div>
              )}
            </CardContent>
          </Card>
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-2">
              <CardDescription>التمارين المتاحة</CardDescription>
            </CardHeader>
            <CardContent>
              {statsLoading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{stats?.totalExercises}</div>}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
