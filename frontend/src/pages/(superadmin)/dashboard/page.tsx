import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  Building,
  Activity,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Calendar,
  Clock,
  Target,
  Zap,
  BarChart3,
  PieChart,
  Globe,
  Gauge,
  ArrowUp,
  ArrowDown,
  Minus,
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { superAdminService } from "@/lib/api/services/superadmin";
import { SuperAdminStats } from "@/lib/interfaces";
import { useTranslation } from "react-i18next";

export default function SuperAdminDashboard() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<SuperAdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await superAdminService.getStats();
        setStats(data);
      } catch (err) {
        setError(t("superadmin.dashboard.errors.loadFailed"));
        console.error("Failed to fetch superadmin stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const getHealthColor = (health: string) => {
    switch (health) {
      case "healthy":
        return "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20";
      case "warning":
        return "text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20";
      case "critical":
        return "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20";
      default:
        return "text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800";
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case "healthy":
        return <CheckCircle className="h-4 w-4" />;
      case "warning":
      case "critical":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <ArrowUp className="h-3 w-3 text-green-500" />;
      case "down":
        return <ArrowDown className="h-3 w-3 text-red-500" />;
      default:
        return <Minus className="h-3 w-3 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent":
        return "text-green-600 dark:text-green-400";
      case "good":
        return "text-blue-600 dark:text-blue-400";
      case "warning":
        return "text-yellow-600 dark:text-yellow-400";
      case "critical":
        return "text-red-600 dark:text-red-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  // Colors for charts
  const chartColors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];
  const gradientColors = {
    users: "#3b82f6",
    companies: "#10b981",
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-800 dark:text-red-400">
            <AlertCircle className="h-5 w-5" />
            <span className="font-medium">
              {t("superadmin.dashboard.errors.error")}
            </span>
          </div>
          <p className="text-red-700 dark:text-red-300 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t("superadmin.dashboard.title")}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t("superadmin.dashboard.description")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {new Date().toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("superadmin.dashboard.metrics.totalUsers")}
            </CardTitle>
            <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats?.totalUsers.toLocaleString() || 0}
                </div>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                  <span className="text-xs text-green-600 dark:text-green-400">
                    {t("superadmin.dashboard.metrics.userGrowthRate", {
                      rate: stats?.userGrowthRate.toFixed(1),
                    })}
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Total Companies */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("superadmin.dashboard.metrics.companies")}
            </CardTitle>
            <Building className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats?.totalCompanies.toLocaleString() || 0}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Active organizations
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Active Users */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("superadmin.dashboard.metrics.activeUsers")}
            </CardTitle>
            <Activity className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats?.activeUsers.toLocaleString() || 0}
                </div>
                <div className="flex items-center mt-1">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      Last 30 days
                    </span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Recent Signups */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
              New Signups
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats?.recentSignups.toLocaleString() || 0}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Last 7 days
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Analytics Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Retention Rate */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Retention Rate
            </CardTitle>
            <Target className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats?.retentionRate.toFixed(1)}%
                </div>
                <Progress value={stats?.retentionRate} className="mt-2" />
              </>
            )}
          </CardContent>
        </Card>

        {/* Conversion Rate */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Conversion Rate
            </CardTitle>
            <Zap className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats?.conversionRate.toFixed(1)}%
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Visitor to user
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Session Duration */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Avg Session
            </CardTitle>
            <Clock className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats?.avgSessionDuration || "0m"}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Duration
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Bounce Rate */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Bounce Rate
            </CardTitle>
            <Globe className="h-4 w-4 text-red-600 dark:text-red-400" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats?.bounceRate.toFixed(1)}%
                </div>
                <div className="flex items-center mt-1">
                  <TrendingDown className="h-3 w-3 text-green-500 mr-1" />
                  <span className="text-xs text-green-600 dark:text-green-400">
                    -2.1% vs last week
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              User Growth Trend
            </CardTitle>
            <CardDescription>
              Daily user registrations over the last 30 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-80 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={stats?.userGrowthData}>
                  <defs>
                    <linearGradient
                      id="userGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor={gradientColors.users}
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor={gradientColors.users}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `${30 - value}d ago`}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    labelFormatter={(value) => `${30 - value} days ago`}
                    formatter={(value: any) => [value, "New Users"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="users"
                    stroke={gradientColors.users}
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#userGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Weekly Activity Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Weekly Activity Pattern
            </CardTitle>
            <CardDescription>User activity by day of the week</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-80 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats?.weeklyActivity}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value: any) => [value, "Active Users"]}
                  />
                  <Bar
                    dataKey="users"
                    fill={gradientColors.users}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Role Distribution and Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Role Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              User Role Distribution
            </CardTitle>
            <CardDescription>Breakdown of users by role</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-80 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={stats?.roleDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="count"
                    label={({ percentage }) => `${percentage.toFixed(0)}%`}
                  >
                    {stats?.roleDistribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={chartColors[index % chartColors.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any, name) => [value, "Users"]} />
                  <Legend />
                </RechartsPieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gauge className="h-5 w-5" />
              System Performance
            </CardTitle>
            <CardDescription>Key performance indicators</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {stats?.performanceMetrics.map((metric, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {metric.metric}
                      </span>
                      {getTrendIcon(metric.trend)}
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm font-bold ${getStatusColor(
                          metric.status
                        )}`}
                      >
                        {metric.value}
                      </span>
                      <Badge
                        variant="outline"
                        className={getStatusColor(metric.status)}
                      >
                        {metric.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* System Health and Top Companies */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Health
            </CardTitle>
            <CardDescription>
              Current system status and performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Overall Status</span>
                  <Badge
                    variant="secondary"
                    className={getHealthColor(stats?.systemHealth || "healthy")}
                  >
                    <div className="flex items-center gap-1">
                      {getHealthIcon(stats?.systemHealth || "healthy")}
                      <span className="capitalize">
                        {stats?.systemHealth || "Unknown"}
                      </span>
                    </div>
                  </Badge>
                </div>

                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {stats?.systemHealth === "healthy" &&
                    "All systems are running optimally. Performance metrics are within expected ranges."}
                  {stats?.systemHealth === "warning" &&
                    "Some systems may be experiencing minor issues. Monitoring closely."}
                  {stats?.systemHealth === "critical" &&
                    "Critical systems require immediate attention. Please check system logs."}
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-lg font-bold text-green-600 dark:text-green-400">
                      99.9%
                    </div>
                    <div className="text-xs text-green-600 dark:text-green-400">
                      Uptime
                    </div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      125ms
                    </div>
                    <div className="text-xs text-blue-600 dark:text-blue-400">
                      Response
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Companies */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Most Active Companies
            </CardTitle>
            <CardDescription>
              Companies ranked by activity level
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {stats?.topCompanies.map((company, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {company.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-sm">
                          {company.name}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {company.userCount} users
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={company.activity} className="w-20" />
                      <span className="text-sm font-medium">
                        {company.activity}%
                      </span>
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
