export type SubscriptionStatus = "active" | "paused" | "inactive" | "canceled";

export interface SubscriptionPlan {
  id: string;
  name: string;
  fee: number;
  nextPayment: string;
  streamId: string;
  uptime: string;
  status: SubscriptionStatus;
  color: string;
  logo: string;
  plan: string;
  cardLastFour: string;
}

export interface CatalogItem {
  name: string;
  fee: number;
  period: string;
  color: string;
  category: "entertainment" | "cloud" | "productivity";
  logo: string;
  plan: string;
}

export const subscriptionCatalog: CatalogItem[] = [
  { name: "Disney+ Standard", fee: 7.99, period: "MONTH", color: "bg-blue-600", category: "entertainment", logo: "/subscriptions/disney.svg", plan: "Standard" },
  { name: "YouTube Premium", fee: 11.99, period: "MONTH", color: "bg-red-500", category: "entertainment", logo: "/subscriptions/youtube.svg", plan: "Premium" },
  { name: "Creative Cloud", fee: 52.99, period: "MONTH", color: "bg-red-700", category: "productivity", logo: "/subscriptions/creative-cloud.svg", plan: "All Apps" },
  { name: "Figma Professional", fee: 15.0, period: "MONTH", color: "bg-purple-600", category: "productivity", logo: "/subscriptions/figma.svg", plan: "Professional" },
  { name: "GitHub Pro", fee: 4.0, period: "MONTH", color: "bg-neutral-800", category: "cloud", logo: "/subscriptions/github.svg", plan: "Pro" },
  { name: "Notion Plus", fee: 8.0, period: "MONTH", color: "bg-neutral-700", category: "productivity", logo: "/subscriptions/notion.svg", plan: "Plus" },
];

export const defaultSubscriptions: SubscriptionPlan[] = [
  { id: "1", name: "Netflix Premium", fee: 15.99, nextPayment: "Nov 24, 2024", streamId: "#RB-7729-001", uptime: "342 Days", status: "active", color: "bg-red-600", logo: "/subscriptions/netflix.svg", plan: "Premium", cardLastFour: "6721" },
  { id: "2", name: "DSTV Premium Plus", fee: 45.0, nextPayment: "Pending", streamId: "#RB-7730-002", uptime: "120 Days", status: "inactive", color: "bg-blue-800", logo: "/subscriptions/dstv.svg", plan: "Premium Plus", cardLastFour: "6721" },
  { id: "3", name: "Spotify Family Plan", fee: 9.99, nextPayment: "Nov 30, 2024", streamId: "#RB-7731-003", uptime: "200 Days", status: "active", color: "bg-green-600", logo: "/subscriptions/spotify.svg", plan: "Family", cardLastFour: "6721" },
  { id: "4", name: "AWS Cloud Instance", fee: 71.52, nextPayment: "Dec 1, 2024", streamId: "#RB-7732-004", uptime: "90 Days", status: "active", color: "bg-orange-500", logo: "/subscriptions/aws.svg", plan: "Cloud Instance", cardLastFour: "6721" },
  { id: "5", name: "Creative Cloud", fee: 52.99, nextPayment: "Canceled", streamId: "#RB-7733-005", uptime: "68 Days", status: "canceled", color: "bg-red-700", logo: "/subscriptions/creative-cloud.svg", plan: "All Apps", cardLastFour: "6721" },
  { id: "6", name: "GitHub Pro", fee: 4.0, nextPayment: "Inactive", streamId: "#RB-7734-006", uptime: "41 Days", status: "inactive", color: "bg-neutral-800", logo: "/subscriptions/github.svg", plan: "Pro", cardLastFour: "6721" },
];

export function subscriptionLogoFor(name: string) {
  const normalized = name.toLowerCase();
  const all = [...defaultSubscriptions, ...subscriptionCatalog];
  return all.find((item) => normalized.includes(item.name.split(" ")[0].toLowerCase()))?.logo;
}
