import type { Metadata } from "next";
import "@fontsource-variable/plus-jakarta-sans";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: siteConfig.fullTitle,
  description: siteConfig.description,
  icons: siteConfig.icons,
  openGraph: {
    title: siteConfig.seoTitle,
    description: "Full-stack interview prep platform for .NET Core developers — categories, subcategories & curated Q&A.",
    images: [siteConfig.ogImage],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.seoTitle,
    description: "Full-stack interview prep platform for .NET Core developers.",
    images: [siteConfig.ogImage],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('interviewify-theme');if(t==='dark'||t==='light'){document.documentElement.classList.add(t)}else if(window.matchMedia('(prefers-color-scheme: dark)').matches){document.documentElement.classList.add('dark')}else{document.documentElement.classList.add('light')}})();`,
          }}
        />
      </head>
      <body className="antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
