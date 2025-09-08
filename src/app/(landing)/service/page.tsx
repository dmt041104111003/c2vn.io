import type { Metadata } from "next";
import ServiceHubClient from "~/components/service/ServiceHubClient";

export const metadata: Metadata = {
  title: "Service | Cardano2vn",
  description: "Explore About, Projects, and Our Service from one place.",
  keywords: [
    "Cardano",
    "Service",
    "About",
    "Projects",
    "Our Service",
    "Community",
  ],
  openGraph: {
    title: "Service | Cardano2vn",
    description: "Explore About, Projects, and Our Service from one place.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Service | Cardano2vn",
    description: "Explore About, Projects, and Our Service from one place.",
  },
};

export default function ServiceHubPage() {
  return <ServiceHubClient />;
}


