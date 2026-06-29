import type { Metadata } from "next";
import { Press_Start_2P, Lilita_One } from "next/font/google";
import "./globals.css";

const pixelFont = Press_Start_2P({
  variable: "--font-pixel",
  weight: "400",
  subsets: ["latin"],
});

const displayFont = Lilita_One({
  variable: "--font-display",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "100 Pots",
  description: "We help indie games cross the finish line.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${pixelFont.variable} ${displayFont.variable} h-full antialiased`}
    >
      <body className="h-full w-full overflow-hidden bg-[#060716]">
        {children}
      </body>
    </html>
  );
}
