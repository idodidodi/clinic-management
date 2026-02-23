import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="flex min-h-screen bg-gray-50">
          {/* Sidebar */}
          <aside className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col gap-8 hidden md:flex">
            <div className="text-xl font-bold text-blue-600">Clinic Manager</div>
            <nav className="flex flex-col gap-2">
              <Link href="/" className="px-4 py-2 rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition-colors">Dashboard</Link>
              <Link href="/customers" className="px-4 py-2 rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition-colors">Customers</Link>
              <Link href="/payments" className="px-4 py-2 rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition-colors">Reconciliation</Link>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
