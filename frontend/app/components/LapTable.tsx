"use client";
import React from "react";

export default function LapTable({ laps }: { laps: Array<{ lap_number: number; lap_time: number }> }) {
  return (
    <div className="bg-white rounded shadow p-4">
      <table className="w-full text-left table-auto">
        <thead>
          <tr>
            <th className="p-2">Lap</th>
            <th className="p-2">Time (s)</th>
          </tr>
        </thead>
        <tbody>
          {laps.map((l) => (
            <tr key={l.lap_number}>
              <td className="p-2">{l.lap_number}</td>
              <td className="p-2">{l.lap_time}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
