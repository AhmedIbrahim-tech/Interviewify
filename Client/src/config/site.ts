/**
 * Central site branding and metadata.
 * Update name, tagline, and icon paths here to reflect across the app.
 */
export const siteConfig = {
  /** Main product name (tab, sidebar, login, footer) */
  name: "Interviewify",
  /** Short tagline for page titles */
  tagline: "Ace Your Next Interview",
  /** Full title for default tab and SEO */
  get fullTitle() {
    return `${this.name} | ${this.tagline}`;
  },
  /** SEO title variant (e.g. for Open Graph) */
  seoTitle: "Interviewify | .NET Core Interview Prep",
  /** Default meta description */
  description:
    "Structured .NET Core interview prep — categories, modules, and curated Q&A.",
  /** Current year (dynamic) */
  get year() {
    return new Date().getFullYear();
  },
  /** Copyright text for footers */
  get copyright() {
    return `© ${this.year} Interviewify. All rights reserved.`;
  },
  /** Footer variant (e.g. login page) */
  get copyrightPlatform() {
    return `© ${this.year} Interviewify Platform`;
  },
  /** 404 / error page brand label */
  brandEngine: "Interviewify Engine",
  /** Icon paths (favicon + apple touch; icon.svg is in app/ and served at /icon.svg) */
  icons: {
    icon: "/icon.svg",
    apple: "/icon.png",
  },
  /** OG/Twitter image */
  ogImage: "/images/interviewify-banner.png",
};
