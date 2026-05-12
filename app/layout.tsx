import type { Metadata } from "next";
import { DM_Sans, Noto_Sans_Arabic } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({ subsets: ["latin"], weight: ["400", "500", "700", "800"], variable: "--font-dm-sans" });
const notoArabic = Noto_Sans_Arabic({ subsets: ["arabic"], weight: ["400", "700", "800"], variable: "--font-noto-arabic" });

export const metadata: Metadata = {
  title: "Appetie | أبيتي",
  description: "Healthy food restaurant - Ar Rayyan, Hittin, Malqa",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${dmSans.variable} ${notoArabic.variable}`} style={{ fontFamily: "var(--font-dm-sans), var(--font-noto-arabic), sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
