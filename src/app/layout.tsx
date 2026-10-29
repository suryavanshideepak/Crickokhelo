import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OpenCricket Pro | Open Source Cricket Scoring App",
  description:
    "A full-featured, mobile-friendly open source cricket scoring application with live ball-by-ball commentary, full scorecards, wagon wheel, worm charts, and offline audio feedback.",
  keywords: [
    "cricket scoring",
    "open source cricket",
    "cricket scorecard",
    "mobile cricket scorer",
    "wagon wheel cricket",
    "cricket live score",
    "gully cricket scorer",
  ],
  authors: [{ name: "OpenCricket Community" }],
  applicationName: "OpenCricket Pro",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "OpenCricket",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#070d14",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full">
      <body className="min-h-full flex flex-col bg-[#070d14] text-slate-100 antialiased selection:bg-emerald-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
