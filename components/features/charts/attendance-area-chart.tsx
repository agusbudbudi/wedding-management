"use client";

import {
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
} from "recharts";

interface AttendanceTimelineProps {
  data: {
    time: string;
    count: number;
  }[];
}

export default function AttendanceAreaChart({ data }: AttendanceTimelineProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
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
  );
}
