"use client";

import React from "react";
// Chart
import {LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, } from "recharts";

interface ChartProps {
  data: { date: string; count: number }[];
}

// Tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white shadow-md rounded px-3 py-2 text-xs">
        <p className="font-semibold">{label}</p>
        <p>Activities: {payload[0].value}</p>
      </div>
    );
  }
  return null;
};

const ActivityChart: React.FC<ChartProps> = ({ data }) => {
  return (
    <div className="w-full px-2 sm:px-4 md:px-8" style={{ fontSize: "12px" }}>
      <div className="h-[250px] sm:h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" fontSize={10} />
            <YAxis allowDecimals={false} fontSize={10} />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ActivityChart;
