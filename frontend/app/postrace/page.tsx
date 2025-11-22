"use client";
import React from "react";
import LapTable from "../components/LapTable";

export default function PostRacePage() {
  // Placeholder demo data
  const laps = [
    { lap_number: 1, lap_time: 92.1 },
    { lap_number: 2, lap_time: 91.8 },
  ];

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Post Race Summary</h1>
      <LapTable laps={laps} />
    </main>
  );
}
