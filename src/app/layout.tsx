import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { authScript } from "@/stores/auth-store";
import { themeScript } from "@/stores/theme-store";
import { AntdProvider } from "./antd-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Orbis",
  description:
    "Orbis is a home for groups of people. Create a community, bring people in, and share posts everyone can follow.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{ __html: themeScript + authScript }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <AntdProvider>{children}</AntdProvider>
      </body>
    </html>
  );
}
