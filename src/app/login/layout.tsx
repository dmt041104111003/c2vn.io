import { Metadata } from "next";
import BackgroundMotion from "~/components/ui/BackgroundMotion";
// import LightBulbScene from "~/components/ui/LightBulbScene";

export const metadata: Metadata = {
  title: "Login - Cardano2vn",
  description: "Login to Cardano2vn with your preferred wallet or social account",
  keywords: ["login", "cardano", "wallet", "authentication", "cardano2vn"],
  authors: [{ name: "Cardano2vn Team" }],
  creator: "Cardano2vn",
  publisher: "Cardano2vn",
  robots: "noindex, nofollow",
  openGraph: {
    title: "Login - Cardano2vn",
    description: "Login to Cardano2vn with your preferred wallet or social account",
    type: "website",
    siteName: "Cardano2vn",
  },
  twitter: {
    card: "summary_large_image",
    title: "Login - Cardano2vn",
    description: "Login to Cardano2vn with your preferred wallet or social account",
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <BackgroundMotion />
      {/* <LightBulbScene /> */}
      {children}
    </div>
  );
} 
