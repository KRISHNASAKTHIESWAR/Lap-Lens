import "../styles/globals.css";
import Link from "next/link";
import React from "react";

export const metadata = {
  title: "LapLens Dashboard",
  description: "Engineer dashboard for LapLens",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-100 text-gray-900">
        <div className="min-h-screen">
          <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/90 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
              <Link className="text-xl font-semibold text-red-500 transition hover:text-red-600" href="/">
                🏎 LapLens
              </Link>
              <nav className="flex items-center gap-6 text-sm font-medium text-gray-700">
                <Link className="transition hover:text-red-500" href="/dashboard">
                  Dashboard
                </Link>
                <Link className="transition hover:text-red-500" href="/driver">
                  Driver HUD
                </Link>
                <Link className="transition hover:text-red-500" href="/postrace">
                  Post-Race
                </Link>
              </nav>
            </div>
          </header>
          <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
