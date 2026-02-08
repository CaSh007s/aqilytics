import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AQILYTICS | Air Intelligence",
  description: "Predict. Explain. Protect.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
