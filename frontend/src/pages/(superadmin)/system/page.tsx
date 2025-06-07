import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable } from "@/components/ui/data-table";
import {
  Activity,
  CheckCircle,
  AlertCircle,
  Database,
  Server,
  Settings,
  RefreshCw,
  Filter,
  Search,
  Download,
  Clock,
  Bug,
  Info,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { useToast } from "@/lib/hooks/use-toast";
import { ColumnDef } from "@tanstack/react-table";
import {
  superAdminService,
  SystemHealthResponse,
  LogEntry,
  SystemMetric,
} from "@/lib/api/services/superadmin";
import { useTranslation } from "react-i18next";

export default function SuperAdminSystemPage() {
  const { t } = useTranslation();
  const [healthData, setHealthData] = useState<SystemHealthResponse | null>(
    null
  );
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [totalLogs, setTotalLogs] = useState(0);
  const [healthLoading, setHealthLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [logLevel, setLogLevel] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchSystemHealth();
    fetchLogs();
  }, [currentPage, pageSize, logLevel, searchTerm]);

  const fetchSystemHealth = async () => {
    try {
      setHealthLoading(true);
      const data = await superAdminService.getSystemHealth();
      setHealthData(data);
    } catch (error) {
      console.error("Failed to fetch system health:", error);
      toast({
        variant: "destructive",
        title: t("superadmin.common.error"),
        description: t("superadmin.system.toast.loadError"),
      });
    } finally {
      setHealthLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      setLogsLoading(true);
      const data = await superAdminService.getSystemLogs(
        currentPage,
        pageSize,
        logLevel && logLevel !== "all" ? logLevel : undefined,
        searchTerm || undefined
      );
      setLogs(data.logs);
      setTotalLogs(data.total);
    } catch (error) {
      console.error("Failed to fetch logs:", error);
      toast({
        variant: "destructive",
        title: t("superadmin.common.error"),
        description: t("superadmin.system.toast.loadError"),
      });
    } finally {
      setLogsLoading(false);
    }
  };

  const handleSearch = () => {
    setSearchTerm(searchInput);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setLogLevel("all");
    setSearchTerm("");
    setSearchInput("");
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-4 w-4" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4" />;
      case "critical":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getMetricIcon = (iconName: string) => {
    switch (iconName) {
      case "database":
        return <Database className="h-4 w-4" />;
      case "server":
        return <Server className="h-4 w-4" />;
      case "settings":
        return <Settings className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getLogLevelIcon = (level: string) => {
    switch (level) {
      case "debug":
        return <Bug className="h-4 w-4 text-gray-500" />;
      case "info":
        return <Info className="h-4 w-4 text-blue-500" />;
      case "warn":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case "debug":
        return "text-gray-600 dark:text-gray-400";
      case "info":
        return "text-blue-600 dark:text-blue-400";
      case "warn":
        return "text-yellow-600 dark:text-yellow-400";
      case "error":
        return "text-red-600 dark:text-red-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  // Define columns for the logs DataTable
  const logColumns: ColumnDef<LogEntry>[] = [
    {
      accessorKey: "level",
      header: t("superadmin.system.logs.level"),
      size: 120,
      cell: ({ row }) => {
        const level = row.getValue("level") as string;
        return (
          <div className="flex items-center gap-2">
            {getLogLevelIcon(level)}
            <span className={`text-sm font-medium ${getLogLevelColor(level)}`}>
              {level.toUpperCase()}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "timestamp",
      header: t("superadmin.system.logs.timestamp"),
      size: 180,
      cell: ({ row }) => {
        const timestamp = row.getValue("timestamp") as string;
        return (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {formatTimestamp(timestamp)}
          </div>
        );
      },
    },
    {
      accessorKey: "context",
      header: t("superadmin.system.logs.context"),
      size: 120,
      cell: ({ row }) => {
        const context = row.getValue("context") as string;
        return context ? (
          <Badge variant="outline" className="text-xs">
            {context}
          </Badge>
        ) : null;
      },
    },
    {
      accessorKey: "msg",
      header: t("superadmin.system.logs.message"),
      cell: ({ row }) => {
        const message = row.getValue("msg") as string;
        return <div className="text-sm">{message}</div>;
      },
    },
  ];

  const totalPages = Math.ceil(totalLogs / pageSize);

  if (healthLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Activity className="h-8 w-8" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t("superadmin.system.title")}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {t("superadmin.system.description")}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-4 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Activity className="h-8 w-8" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t("superadmin.system.title")}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {t("superadmin.system.description")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchSystemHealth}
            disabled={healthLoading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${healthLoading ? "animate-spin" : ""}`}
            />
            {t("superadmin.system.refresh")}
          </Button>
        </div>
      </div>

      {/* Overall Status */}
      {healthData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon(healthData.overallStatus)}
              {t("superadmin.system.systemStatus")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <Badge
                  variant="secondary"
                  className={getStatusColor(healthData.overallStatus)}
                >
                  <div className="flex items-center gap-1">
                    {getStatusIcon(healthData.overallStatus)}
                    <span className="capitalize font-medium">
                      {t(
                        `superadmin.system.health.${healthData.overallStatus}`
                      )}
                    </span>
                  </div>
                </Badge>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  {t("superadmin.system.version")}: {healthData.version} •{" "}
                  {healthData.uptime}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t("superadmin.system.lastUpdated")}:{" "}
                  {formatTimestamp(new Date().toISOString())}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Metrics Grid */}
      {healthData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {healthData.metrics.map((metric) => (
            <Card key={metric.name}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {metric.name}
                </CardTitle>
                {getMetricIcon(metric.icon)}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {metric.value}
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {metric.description}
                  </p>
                  <Badge
                    variant="secondary"
                    className={getStatusColor(metric.status)}
                  >
                    <div className="flex items-center gap-1">
                      {getStatusIcon(metric.status)}
                      <span className="capitalize">
                        {t(`superadmin.system.health.${metric.status}`)}
                      </span>
                    </div>
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* System Logs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t("superadmin.system.logs.title")}</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                {t("superadmin.system.logs.export")}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">
                {t("superadmin.system.logs.search")}
              </Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="search"
                  placeholder={t("superadmin.system.logs.searchPlaceholder")}
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
                <Button onClick={handleSearch} size="sm">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="w-full sm:w-48">
              <Label htmlFor="level">
                {t("superadmin.system.logs.logLevel")}
              </Label>
              <Select value={logLevel} onValueChange={setLogLevel}>
                <SelectTrigger>
                  <SelectValue
                    placeholder={t("superadmin.system.logs.allLevels")}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t("superadmin.system.logs.levels.all")}
                  </SelectItem>
                  <SelectItem value="debug">
                    {t("superadmin.system.logs.levels.debug")}
                  </SelectItem>
                  <SelectItem value="info">
                    {t("superadmin.system.logs.levels.info")}
                  </SelectItem>
                  <SelectItem value="warn">
                    {t("superadmin.system.logs.levels.warn")}
                  </SelectItem>
                  <SelectItem value="error">
                    {t("superadmin.system.logs.levels.error")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button variant="outline" onClick={clearFilters} size="sm">
                <Filter className="h-4 w-4 mr-2" />
                {t("superadmin.system.logs.clear")}
              </Button>
            </div>
          </div>

          {/* Logs DataTable */}
          {logs.length === 0 && !logsLoading ? (
            <div className="rounded-md border">
              <div className="flex flex-col items-center justify-center py-12">
                <Clock className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500 text-lg font-medium">
                  {t("superadmin.system.logs.noLogsFound")}
                </p>
                <p className="text-gray-400 text-sm">
                  {t("superadmin.system.logs.noLogsDescription")}
                </p>
              </div>
            </div>
          ) : (
            <DataTable
              columns={logColumns}
              data={logs}
              isLoading={logsLoading}
              // Server-side pagination
              pageCount={totalPages}
              currentPage={currentPage}
              pageSize={pageSize}
              totalItems={totalLogs}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              // Advanced pagination
              showAdvancedPagination={true}
              pageSizeOptions={[10, 20, 50, 100]}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
