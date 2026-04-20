import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "900"],
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  title: "VELOCITY — The Premium Sports Gear",
  description:
    "Your trusted destination for premium sports equipment. Elevate your performance with top-tier Cricket, Football, and Badminton gear.",
  keywords: "sports, cricket, football, badminton, jerseys, shoes, equipment",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${roboto.variable} font-sans bg-white text-[#111111] antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
