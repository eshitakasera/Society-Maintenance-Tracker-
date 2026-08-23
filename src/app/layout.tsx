import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import Navigation from "@/components/Navigation";

export const metadata: Metadata = {
  title: "Society Maintenance Tracker",
  description: "Track and manage your society maintenance complaints",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Navigation />
          <main className="page-wrapper container animate-fade-in">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
