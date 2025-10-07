export const metadata = {
  title: "Cardano2vn Catalyst",
  description: "Hành trình của chúng tôi trong việc xây dựng nền tảng và hệ sinh thái Cardano2VN, từ những ngày đầu thành lập cho đến hiện tại — và hướng tới tương lai.",
  keywords: ["Cardano", "projects", "catalyst", "Cardano2vn", "smart contracts", "blockchain"],
  openGraph: {
    title: "Cardano2vn Catalyst",
    description: "Hành trình của chúng tôi trong việc xây dựng nền tảng và hệ sinh thái Cardano2VN, từ những ngày đầu thành lập cho đến hiện tại — và hướng tới tương lai.",
    type: "website",
  },
};

import ProjectPageClient from "~/components/catalyst/CatalystPageClient";

export default function ProjectPage() {
  return <ProjectPageClient />;
}
