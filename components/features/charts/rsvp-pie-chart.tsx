"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";

interface RSVPChartProps {
  data: {
    name: string;
    value: number;
    color: string;
  }[];
}

export default function RSVPPieChart({ data }: RSVPChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="42%"
          cy="50%"
          innerRadius={28}
          outerRadius={42}
          paddingAngle={2}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Legend
          verticalAlign="middle"
          align="right"
          layout="vertical"
          iconType="circle"
          iconSize={8}
          wrapperStyle={{
            fontSize: "10px",
            paddingLeft: "10px",
            lineHeight: "18px",
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
