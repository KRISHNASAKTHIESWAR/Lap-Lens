"use client";
import React from "react";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

type TelemetryPoint = { lap_number: number; lap_time: number; tire_deg?: number };

export default function LiveCharts({ sessionId }: { sessionId: string }) {
  // For demo we use mocked data; in a real app this would come from a websocket state
  const data: TelemetryPoint[] = [
    { lap_number: 1, lap_time: 92.1, tire_deg: 0.02 },
    { lap_number: 2, lap_time: 91.8, tire_deg: 0.03 },
    { lap_number: 3, lap_time: 92.5, tire_deg: 0.04 },
  ];

  return (
    <div className="grid grid-cols-1 gap-4">
      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-medium mb-2">Lap Time</h3>
        <div style={{ width: "100%", height: 200 }}>
          <ResponsiveContainer>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="lap_number" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="lap_time" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-medium mb-2">Tire Degradation</h3>
        <div style={{ width: "100%", height: 140 }}>
          <ResponsiveContainer>
            <AreaChart data={data}>
              <XAxis dataKey="lap_number" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="tire_deg" stroke="#82ca9d" fill="#82ca9d" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-medium mb-2">Sectors</h3>
        <div style={{ width: "100%", height: 140 }}>
          <ResponsiveContainer>
            <BarChart data={data}>
              <XAxis dataKey="lap_number" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="lap_time" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
