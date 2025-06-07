import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  MessageSquare,
  Users,
  Activity,
  TrendingUp,
  CalendarIcon,
} from "lucide-react";
import { useToast } from "@/lib/hooks/use-toast";
import { analyticsService, type AnalyticsDashboard } from "@/lib/api/services";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { cn } from "@/lib/utils";

export default function AnalyticsPage() {
  const [dashboard, setDashboard] = useState<AnalyticsDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("7");
  const [customStartDate, setCustomStartDate] = useState<Date>();
  const [customEndDate, setCustomEndDate] = useState<Date>();
  const [isCustomRange, setIsCustomRange] = useState(false);
  const { toast } = useToast();

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      let response;

      if (isCustomRange && customStartDate && customEndDate) {
        response = await analyticsService.getDashboard({
          startDate: format(customStartDate, "yyyy-MM-dd"),
          endDate: format(customEndDate, "yyyy-MM-dd"),
        });
      } else {
        response = await analyticsService.getDashboard({
          days: parseInt(timeRange),
        });
      }

      console.log("Full response:", response);
      console.log("Response data:", response.data);
      console.log("Response type:", typeof response);
      console.log("Data type:", typeof response.data);

      // Check if we have the data we expect
      if (response && response.data) {
        setDashboard(response.data);
      } else if (response && response.conversationStats) {
        // If the response is directly the dashboard data
        setDashboard(response);
      } else {
        console.error("Unexpected response structure:", response);
        toast({
          title: "Error",
          description: "Received unexpected data format",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
      toast({
        title: "Error",
        description: "Failed to fetch analytics data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const handleTimeRangeChange = (value: string) => {
    if (value === "custom") {
      setIsCustomRange(true);
    } else {
      setIsCustomRange(false);
      setTimeRange(value);
    }
  };

  const handleCustomRangeSubmit = () => {
    if (customStartDate && customEndDate) {
      fetchAnalytics();
    } else {
      toast({
        title: "Invalid Date Range",
        description: "Please select both start and end dates",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-gray-500">No analytics data available</p>
        </div>
      </div>
    );
  }

  // Format the date range display using date-fns
  const formatDateRange = () => {
    if (isCustomRange && customStartDate && customEndDate) {
      return `${format(customStartDate, "PPP")} to ${format(
        customEndDate,
        "PPP"
      )}`;
    }

    if (dashboard.dateRange.startDate && dashboard.dateRange.endDate) {
      const startDate = new Date(dashboard.dateRange.startDate);
      const endDate = new Date(dashboard.dateRange.endDate);
      return `${format(startDate, "PPP")} to ${format(endDate, "PPP")}`;
    }

    return `Last ${timeRange} days`;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
          <p className="text-gray-600">Analytics for {formatDateRange()}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Select
            value={isCustomRange ? "custom" : timeRange}
            onValueChange={handleTimeRangeChange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="14">Last 14 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="custom">Custom range</SelectItem>
            </SelectContent>
          </Select>

          {isCustomRange && (
            <div className="flex gap-2 items-end">
              <div>
                <Label htmlFor="start-date" className="text-xs">
                  Start Date
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[140px] justify-start text-left font-normal",
                        !customStartDate && "text-muted-foreground"
                      )}
                    >
                      {customStartDate ? (
                        format(customStartDate, "PP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={customStartDate}
                      onSelect={(date) => {
                        if (date) {
                          setCustomStartDate(startOfDay(date));
                          // If end date is before start date, reset it
                          if (customEndDate && date > customEndDate) {
                            setCustomEndDate(undefined);
                          }
                        }
                      }}
                      disabled={(date) => {
                        const today = new Date();
                        const isAfterToday = date > today;
                        const isBeforeStartDate = customStartDate
                          ? date < customStartDate
                          : false;
                        return isAfterToday || isBeforeStartDate;
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label htmlFor="end-date" className="text-xs">
                  End Date
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[140px] justify-start text-left font-normal",
                        !customEndDate && "text-muted-foreground"
                      )}
                    >
                      {customEndDate ? (
                        format(customEndDate, "PP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={customEndDate}
                      onSelect={(date) => {
                        if (date) {
                          setCustomEndDate(endOfDay(date));
                        }
                      }}
                      disabled={(date) =>
                        date > new Date() ||
                        Boolean(customStartDate && date < customStartDate)
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <Button onClick={handleCustomRangeSubmit} size="sm">
                Apply
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Conversations
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboard.conversationStats.totalConversations}
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboard.conversationStats.newConversations} new conversations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Messages
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboard.messageStats.totalMessages}
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboard.messageStats.averagePerConversation.toFixed(1)} avg per
              conversation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Agent Messages
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboard.messageStats.agentMessages}
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboard.messageStats.contactMessages} from contacts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Conversations
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboard.conversationStatusStats.active}
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboard.conversationStatusStats.pending} pending
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Conversation Status Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Conversation Status Breakdown</CardTitle>
          <CardDescription>
            Distribution of conversation statuses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {dashboard.conversationStatusStats.active}
              </div>
              <p className="text-sm text-muted-foreground">Active</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {dashboard.conversationStatusStats.pending}
              </div>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {dashboard.conversationStatusStats.resolved}
              </div>
              <p className="text-sm text-muted-foreground">Resolved</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {dashboard.conversationStatusStats.closed}
              </div>
              <p className="text-sm text-muted-foreground">Closed</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Agent Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Agent Performance</CardTitle>
          <CardDescription>Conversations assigned by agent</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dashboard.agentStats.length === 0 ? (
              <p className="text-center text-muted-foreground">
                No agent data available
              </p>
            ) : (
              dashboard.agentStats.map((agent) => (
                <div
                  key={agent.agentId}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <h4 className="font-medium">{agent.agentName}</h4>
                    <p className="text-sm text-muted-foreground">
                      {agent.totalAssigned} total assignments
                    </p>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <div className="text-center">
                      <div className="font-medium text-green-600">
                        {agent.activeAssigned}
                      </div>
                      <p className="text-xs text-muted-foreground">Active</p>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-gray-600">
                        {agent.closedAssigned}
                      </div>
                      <p className="text-xs text-muted-foreground">Closed</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
