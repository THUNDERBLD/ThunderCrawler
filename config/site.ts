// config/site.ts
// Why separate config? -> Easy to update metadata and Used in multiple places (SEO, nav, footer)

export const siteConfig = {
  name: "ThunderCrawler",
  description: "Lightning-fast job aggregation with AI-powered automation. Scrape jobs, customize resumes, apply intelligently.",
  url: "https://thundercrawler.app",
  ogImage: "https://thundercrawler.app/og.png",
  links: {
    twitter: "https://twitter.com/thundercrawler",
    github: "https://github.com/yourusername/thundercrawler",
  },
}

export const navItems = [
  {
    title: "Features",
    href: "/#features",
  },
  {
    title: "How it Works",
    href: "/#how-it-works",
  },
  {
    title: "Pricing",
    href: "/pricing",
  },
]

export const dashboardNav = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: "dashboard",
  },
  {
    title: "Jobs",
    href: "/jobs",
    icon: "briefcase",
  },
  {
    title: "Applications",
    href: "/applications",
    icon: "fileText",
  },
  {
    title: "Resume",
    href: "/resume",
    icon: "file",
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: "barChart",
  },
  {
    title: "Settings",
    href: "/settings",
    icon: "settings",
  },
]
