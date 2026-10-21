import type { Metadata } from "next";
import { Barlow_Condensed, Inter } from "next/font/google";
import { authScript } from "@/stores/auth-store";
import { themeScript } from "@/stores/theme-store";
import { AntdProvider } from "./antd-provider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  subsets: ["latin"],
  weight: ["700", "800"],
});

export const metadata: Metadata = {
  title: "Orbis",
  description:
    "Orbis is a platform for online communities, with feeds for updates and forums for discussions.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${barlowCondensed.variable} h-full antialiased`}
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
