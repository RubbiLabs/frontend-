export type SubscriptionStatus = "active" | "paused" | "inactive" | "canceled";

export interface SubscriptionPlanTier {
  id: string;
  name: string;
  priceUsd: number;
  priceRub: number;
  description: string;
  features: string[];
}

export interface CatalogChannel {
  id: string;
  name: string;
  category: "entertainment" | "cloud" | "productivity" | "music" | "tv";
  color: string;
  logo: string;
  tiers: SubscriptionPlanTier[];
}

// RUB price: 1 RUB = $0.02 (from pool ratio: 1000 RUB / 100 ARB at $1/ARB = 1000/20 = $0.02)
const RUB_USD_RATE = 0.02;
const toRub = (usd: number): number => Math.round(usd / RUB_USD_RATE);

export const subscriptionChannels: CatalogChannel[] = [
  {
    id: "netflix",
    name: "Netflix",
    category: "entertainment",
    color: "#E50914",
    logo: "/subscriptions/netflix.svg",
    tiers: [
      {
        id: "netflix-basic",
        name: "Basic",
        priceUsd: 6.99,
        priceRub: toRub(6.99),
        description: "720p, 1 screen, ads",
        features: ["720p HD", "1 device at a time", "Limited ads"],
      },
      {
        id: "netflix-standard",
        name: "Standard",
        priceUsd: 15.49,
        priceRub: toRub(15.49),
        description: "1080p, 2 screens, no ads",
        features: ["1080p Full HD", "2 devices at a time", "No ads", "Download on 2 devices"],
      },
      {
        id: "netflix-premium",
        name: "Premium",
        priceUsd: 22.99,
        priceRub: toRub(22.99),
        description: "4K HDR, 4 screens, no ads",
        features: ["4K Ultra HD + HDR", "4 devices at a time", "No ads", "Download on 6 devices", "Spatial audio"],
      },
    ],
  },
  {
    id: "spotify",
    name: "Spotify",
    category: "music",
    color: "#1DB954",
    logo: "/subscriptions/spotify.svg",
    tiers: [
      {
        id: "spotify-individual",
        name: "Individual",
        priceUsd: 11.99,
        priceRub: toRub(11.99),
        description: "1 account, ad-free music",
        features: ["Ad-free music", "Offline downloads", "On-demand playback"],
      },
      {
        id: "spotify-duo",
        name: "Duo",
        priceUsd: 16.99,
        priceRub: toRub(16.99),
        description: "2 accounts for couples",
        features: ["2 Premium accounts", "Duo Mix playlist", "Ad-free music"],
      },
      {
        id: "spotify-family",
        name: "Family",
        priceUsd: 19.99,
        priceRub: toRub(19.99),
        description: "Up to 6 accounts",
        features: ["Up to 6 accounts", "Family Mix playlist", "Explicit content filter", "Ad-free music"],
      },
    ],
  },
  {
    id: "disney",
    name: "Disney+",
    category: "entertainment",
    color: "#113CCF",
    logo: "/subscriptions/disney.svg",
    tiers: [
      {
        id: "disney-basic",
        name: "Basic",
        priceUsd: 9.99,
        priceRub: toRub(9.99),
        description: "1080p, ads, 2 screens",
        features: ["1080p HD", "2 concurrent streams", "Limited ads"],
      },
      {
        id: "disney-premium",
        name: "Premium",
        priceUsd: 16.99,
        priceRub: toRub(16.99),
        description: "4K, no ads, 4 screens, downloads",
        features: ["4K UHD + HDR", "4 concurrent streams", "No ads", "Download on 10 devices", "Dolby Atmos"],
      },
    ],
  },
  {
    id: "youtube",
    name: "YouTube Premium",
    category: "entertainment",
    color: "#FF0000",
    logo: "/subscriptions/youtube.svg",
    tiers: [
      {
        id: "youtube-individual",
        name: "Individual",
        priceUsd: 13.99,
        priceRub: toRub(13.99),
        description: "Ad-free, background play, downloads",
        features: ["No ads", "Background play", "Offline downloads", "YouTube Music Premium"],
      },
      {
        id: "youtube-family",
        name: "Family",
        priceUsd: 22.99,
        priceRub: toRub(22.99),
        description: "Up to 5 family members",
        features: ["Up to 5 members", "No ads", "Background play", "YouTube Music Premium"],
      },
    ],
  },
  {
    id: "dstv",
    name: "DStv",
    category: "tv",
    color: "#000000",
    logo: "/subscriptions/dstv.svg",
    tiers: [
      {
        id: "dstv-premium",
        name: "Premium",
        priceUsd: 45.00,
        priceRub: toRub(45.00),
        description: "All channels, 4K, sports",
        features: ["All channels", "4K Ultra HD", "Live sports", "Showmax included"],
      },
      {
        id: "dstv-compact",
        name: "Compact Plus",
        priceUsd: 32.00,
        priceRub: toRub(32.00),
        description: "Most channels, sports",
        features: ["Most channels", "Live sports", "Entertainment"],
      },
      {
        id: "dstv-access",
        name: "Access",
        priceUsd: 12.00,
        priceRub: toRub(12.00),
        description: "Basic channels",
        features: ["Local channels", "Basic entertainment"],
      },
    ],
  },
  {
    id: "aws",
    name: "AWS Cloud",
    category: "cloud",
    color: "#FF9900",
    logo: "/subscriptions/aws.svg",
    tiers: [
      {
        id: "aws-lightsail",
        name: "Lightsail Basic",
        priceUsd: 5.00,
        priceRub: toRub(5.00),
        description: "1 vCPU, 1GB RAM, 40GB SSD",
        features: ["1 vCPU", "1 GB RAM", "40 GB SSD", "2 TB transfer"],
      },
      {
        id: "aws-lightsail-plus",
        name: "Lightsail Standard",
        priceUsd: 10.00,
        priceRub: toRub(10.00),
        description: "2 vCPU, 2GB RAM, 80GB SSD",
        features: ["2 vCPU", "2 GB RAM", "80 GB SSD", "3 TB transfer"],
      },
      {
        id: "aws-ec2",
        name: "EC2 t3.small",
        priceUsd: 71.52,
        priceRub: toRub(71.52),
        description: "Production instance, 30-day",
        features: ["2 vCPU", "2 GB RAM", "EBS storage", "Static IP"],
      },
    ],
  },
  {
    id: "creative-cloud",
    name: "Adobe Creative Cloud",
    category: "cloud",
    color: "#FF0000",
    logo: "/subscriptions/creative-cloud.svg",
    tiers: [
      {
        id: "cc-photography",
        name: "Photography Plan",
        priceUsd: 9.99,
        priceRub: toRub(9.99),
        description: "Photoshop + Lightroom",
        features: ["Photoshop", "Lightroom", "100GB cloud storage"],
      },
      {
        id: "cc-all-apps",
        name: "All Apps",
        priceUsd: 59.99,
        priceRub: toRub(59.99),
        description: "All Adobe apps",
        features: ["All 20+ apps", "100GB cloud storage", "Adobe Fonts", "Adobe Portfolio"],
      },
    ],
  },
  {
    id: "figma",
    name: "Figma",
    category: "productivity",
    color: "#A259FF",
    logo: "/subscriptions/figma.svg",
    tiers: [
      {
        id: "figma-professional",
        name: "Professional",
        priceUsd: 15.00,
        priceRub: toRub(15.00),
        description: "Per editor/month, design systems",
        features: ["Unlimited projects", "Design systems", "Branching", "Dev mode"],
      },
      {
        id: "figma-organization",
        name: "Organization",
        priceUsd: 45.00,
        priceRub: toRub(45.00),
        description: "Per editor/month, enterprise features",
        features: ["All Professional features", "Design system analytics", "SAML SSO", "Centralized teams"],
      },
    ],
  },
  {
    id: "github",
    name: "GitHub",
    category: "productivity",
    color: "#24292e",
    logo: "/subscriptions/github.svg",
    tiers: [
      {
        id: "github-pro",
        name: "Pro",
        priceUsd: 4.00,
        priceRub: toRub(4.00),
        description: "Per user/month, advanced features",
        features: ["2,000 CI/minutes", "2GB Packages", "Code review", "Discussions"],
      },
      {
        id: "github-team",
        name: "Team",
        priceUsd: 4.00,
        priceRub: toRub(4.00),
        description: "Per user/month, team features",
        features: ["All Pro features", "Protected branches", "Required reviews", "Team discussions"],
      },
    ],
  },
  {
    id: "notion",
    name: "Notion",
    category: "productivity",
    color: "#000000",
    logo: "/subscriptions/notion.svg",
    tiers: [
      {
        id: "notion-plus",
        name: "Plus",
        priceUsd: 10.00,
        priceRub: toRub(10.00),
        description: "Per member/month, for small teams",
        features: ["Unlimited blocks", "Unlimited uploads", "30-day page history", "Custom automations"],
      },
      {
        id: "notion-business",
        name: "Business",
        priceUsd: 18.00,
        priceRub: toRub(18.00),
        description: "Per member/month, for companies",
        features: ["All Plus features", "SAML SSO", "Advanced page analytics", "90-day page history"],
      },
    ],
  },
];

export const categoryLabels: Record<string, string> = {
  all: "All",
  entertainment: "Entertainment",
  music: "Music",
  tv: "TV & Streaming",
  cloud: "Cloud & Dev",
  productivity: "Productivity",
};

export function subscriptionLogoFor(name: string): string {
  const channel = subscriptionChannels.find(
    (c) => c.name.toLowerCase().includes(name.toLowerCase().split(" ")[0])
  );
  return channel?.logo || "/subscriptions/default.svg";
}
