// config/site.ts
// Why separate config? -> Easy to update metadata and Used in multiple places (SEO, nav, footer)

export const siteConfig = {
  name: "ThunderCrawler",
  description: "ThunderCrawler job listings, customize resumes, automate applications with AI",
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