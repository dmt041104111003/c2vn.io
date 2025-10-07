import type { Metadata } from "next";
import ServiceHubClient from "~/components/service/ServiceHubClient";

export const metadata: Metadata = {
  title: "About Us | Cardano2vn",
  description: "Tìm hiểu về đội ngũ chúng tôi, dự án và dịch vụ của chúng tôi tại một nơi.",
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
    description: "Tìm hiểu về đội ngũ chúng tôi, dự án và dịch vụ của chúng tôi tại một nơi.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Us | Cardano2vn",
    description: "Tìm hiểu về đội ngũ chúng tôi, dự án và dịch vụ của chúng tôi tại một nơi.",
  },
};

export default function ServiceHubPage() {
  return <ServiceHubClient />;
}


