"use client";

import { useMemo } from "react";
import {
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
} from "recharts";
import { Guest, GuestLog } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DashboardAnalyticsProps {
  stats: {
    confirmedGuests: number;
    declinedGuests: number;
    pendingRSVP: number;
  } | null;
  logs: GuestLog[];
}

const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#6366f1",
];

export function DashboardAnalytics({ stats, logs }: DashboardAnalyticsProps) {
  const rsvpData = useMemo(() => {
    if (!stats) return [];
    return [
      { name: "Confirmed", value: stats.confirmedGuests },
      { name: "Declined", value: stats.declinedGuests },
      { name: "Pending", value: stats.pendingRSVP },
    ];
  }, [stats]);

  const attendanceTimeline = useMemo(() => {
    const hourlyData: Record<string, number> = {};

    // Filter logs for attendance actions and group by hour
    logs
      .filter((l) => ["attended", "souvenir_delivered"].includes(l.action))
      .forEach((l) => {
        const date = new Date(l.created_at);
        const hour = date.getHours();
        const label = `${hour.toString().padStart(2, "0")}:00`;
        hourlyData[label] = (hourlyData[label] || 0) + 1;
      });

    // If no data, provide a mock range or empty
    if (Object.keys(hourlyData).length === 0) return [];

    return Object.entries(hourlyData)
      .map(([time, count]) => ({ time, count }))
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [logs]);

  return (
    <div className="space-y-6">
      {/* Attendance Flow */}
      <Card className="rounded-[2rem] shadow-[0_2px_40px_-12px_rgba(0,0,0,0.08)] border-none bg-white overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold text-gray-900">
            Arrival Timeline
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[200px]">
          {attendanceTimeline.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={attendanceTimeline}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f0f0f0"
                />
                <XAxis
                  dataKey="time"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "1rem",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorCount)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-2">
              <span className="text-sm font-medium">No check-in data yet</span>
              <p className="text-[10px] text-center max-w-[150px]">
                Charts will appear once guests start checking in.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
