import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import Navbar from "../components/Navbar";

export const metadata: Metadata = {
  title: "Sessions Marketplace",
  description: "A premium containerized Next.js, Django, and PostgreSQL marketplace.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased dark"
    >
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-50 font-sans">
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
