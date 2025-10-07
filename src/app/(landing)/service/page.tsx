import type { Metadata } from "next";
import ServiceHubClient from "~/components/service/ServiceHubClient";

export const metadata: Metadata = {
  title: "About Us | Cardano2vn",
  description: "Learn about our team, projects, and services in one place.",
  keywords: [
    "Cardano",
    "About Us",
    "About",
    "Projects",
    "Our Service",
    "Community",
  ],
  openGraph: {
    title: "About Us | Cardano2vn",
    description: "Learn about our team, projects, and services in one place.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Us | Cardano2vn",
    description: "Learn about our team, projects, and services in one place.",
  },
};

export default function ServiceHubPage() {
  return <ServiceHubClient />;
}


