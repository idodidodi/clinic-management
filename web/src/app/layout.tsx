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
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2563eb" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
        <script dangerouslySetInnerHTML={{
          __html: `
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
              navigator.serviceWorker.register('/sw.js');
            });
          }
        ` }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="flex min-h-screen bg-gray-50 pb-20 md:pb-0">
          {/* Desktop Sidebar */}
          <aside className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col gap-8 hidden md:flex h-screen sticky top-0">
            <div className="text-xl font-bold text-blue-600 flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xs font-bold font-sans">CM</div>
              Clinic Manager
            </div>
            <nav className="flex flex-col gap-2">
              <Link href="/" className="px-4 py-3 rounded-xl hover:bg-blue-50 hover:text-blue-700 text-gray-700 font-semibold transition-all flex items-center gap-3">
                <span className="text-xl">📊</span> Dashboard
              </Link>
              <Link href="/customers" className="px-4 py-3 rounded-xl hover:bg-blue-50 hover:text-blue-700 text-gray-700 font-semibold transition-all flex items-center gap-3">
                <span className="text-xl">👥</span> Customers
              </Link>
              <Link href="/payments" className="px-4 py-3 rounded-xl hover:bg-blue-50 hover:text-blue-700 text-gray-700 font-semibold transition-all flex items-center gap-3">
                <span className="text-xl">💰</span> Reconciliation
              </Link>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 overflow-x-hidden min-h-screen">
            {children}
          </main>

          {/* Mobile Bottom Bar */}
          <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 flex justify-around items-center md:hidden z-50 backdrop-blur-md bg-white/80">
            <Link href="/" className="flex flex-col items-center gap-1 text-gray-600 active:text-blue-600 transition-colors">
              <span className="text-2xl">📊</span>
              <span className="text-[10px] font-bold uppercase tracking-wider">Home</span>
            </Link>
            <Link href="/customers" className="flex flex-col items-center gap-1 text-gray-600 active:text-blue-600 transition-colors">
              <span className="text-2xl">👥</span>
              <span className="text-[10px] font-bold uppercase tracking-wider">Clients</span>
            </Link>
            <Link href="/payments" className="flex flex-col items-center gap-1 text-gray-600 active:text-blue-600 transition-colors">
              <span className="text-2xl">💰</span>
              <span className="text-[10px] font-bold uppercase tracking-wider">Cash</span>
            </Link>
          </nav>
        </div>
      </body>
    </html>
  );
}
