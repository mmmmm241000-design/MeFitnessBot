import { trpc } from "@/providers/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Search, ArrowRight, User, Weight, Ruler, Target } from "lucide-react";
import { Link } from "react-router";
import { useState } from "react";

export default function Users() {
  const [search, setSearch] = useState("");
  const { data: users, isLoading } = trpc.dashboard.recentUsers.useQuery({ limit: 50 });
  const { data: goalDist } = trpc.dashboard.goalDistribution.useQuery();

  const filteredUsers = users?.filter((u: any) =>
    u.firstName?.toLowerCase().includes(search.toLowerCase()) ||
    u.username?.toLowerCase().includes(search.toLowerCase()) ||
    u.telegramId.toString().includes(search)
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white" dir="rtl">
      <header className="border-b border-slate-800 bg-slate-900/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/dashboard"><ArrowRight className="w-4 h-4 ml-1" /> لوحة التحكم</Link>
            </Button>
            <h1 className="font-bold text-lg">المستخدمين</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar Stats */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-sm">توزيع الأهداف</CardTitle>
              </CardHeader>
              <CardContent>
                {goalDist ? (
                  <div className="space-y-2">
                    {goalDist.map((g: { goal: string | null; count: number }) => (
                      <div key={g.goal} className="flex justify-between items-center">
                        <span className="text-sm text-slate-300">
                          {g.goal === "bulking" ? "ضخامة" : g.goal === "cutting" ? "تنشيف" : g.goal === "recomp" ? "تركيب" : "صيانة"}
                        </span>
                        <Badge variant="outline" className="border-slate-600">{g.count}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Skeleton className="h-20 w-full" />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Users List */}
          <div className="lg:col-span-3">
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      placeholder="بحث بالاسم أو ID..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-10 bg-slate-800 border-slate-700"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredUsers?.map((user: any) => (
                      <div key={user.id} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold">
                            {(user.firstName?.[0] || "U").toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium">{user.firstName} {user.lastName}</p>
                            <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                              <span>@{user.username || "no-username"}</span>
                              <span>ID: {user.telegramId}</span>
                            </div>
                            {user.profile && (
                              <div className="flex items-center gap-3 mt-2 text-xs">
                                <span className="flex items-center gap-1 text-slate-400">
                                  <Weight className="w-3 h-3" /> {user.profile.weightKg}kg
                                </span>
                                <span className="flex items-center gap-1 text-slate-400">
                                  <Ruler className="w-3 h-3" /> {user.profile.heightCm}cm
                                </span>
                                <span className="flex items-center gap-1 text-slate-400">
                                  <Target className="w-3 h-3" />
                                  {user.profile.goal === "bulking" ? "ضخامة" : user.profile.goal === "cutting" ? "تنشيف" : "تركيب"}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {user.profile?.setupComplete ? (
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/50">نشط</Badge>
                          ) : (
                            <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/50">غير مكتمل</Badge>
                          )}
                          <Button variant="ghost" size="sm" className="text-slate-400">
                            تفاصيل
                          </Button>
                        </div>
                      </div>
                    ))}
                    {filteredUsers?.length === 0 && (
                      <div className="text-center py-8 text-slate-400">
                        <User className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>لا يوجد مستخدمين مطابقين</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
