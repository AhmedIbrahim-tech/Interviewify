import type { Metadata } from "next";
import "@fontsource-variable/plus-jakarta-sans";
import "./globals.css";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "Interviewify | Ace Your Next Interview",
  description: "Personalized prep, real-time feedback, and data-driven insights to help you land your dream job.",
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
  openGraph: {
    title: "Interviewify | .NET Core Interview Prep",
    description: "Full-stack interview prep platform for .NET Core developers — categories, subcategories & curated Q&A.",
    images: ["/images/interviewify-banner.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Interviewify | .NET Core Interview Prep",
    description: "Full-stack interview prep platform for .NET Core developers.",
    images: ["/images/interviewify-banner.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
