import Image from "next/image";
import Link from "next/link";
import Logo from "~/components/ui/logo";
import { ThemeToggle } from "~/components/ui/theme-toggle";
import { routers } from "~/constants/routers";

export default function LoginHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full min-w-0 gap-4">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-shrink">
        <Link href={routers.home} className="flex-shrink-0">
          <Logo layout="inline" size="lg" />
        </Link>
      </div>
      
      <div className="flex items-center justify-center sm:justify-end gap-1 sm:gap-2 flex-shrink-0">
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="w-4 h-4 md:w-6 md:h-6 flex items-center justify-center hover:opacity-80 transition-opacity">
            <Image
              src="/images/wallets/google.png"
              alt="Google"
              width={16}
              height={16}
              className="w-4 h-4 md:w-6 md:h-6"
              loading="lazy"
            />
          </div>
          <div className="w-4 h-4 md:w-6 md:h-6 flex items-center justify-center hover:opacity-80 transition-opacity">
            <Image
              src="/images/wallets/github.png"
              alt="GitHub"
              width={16}
              height={16}
              className="w-4 h-4 md:w-6 md:h-6 rounded-full"
              loading="lazy"
            />
          </div>
          <div className="w-4 h-4 md:w-6 md:h-6 flex items-center justify-center hover:opacity-80 transition-opacity">
            <Image
              src="/images/wallets/telegram.png"
              alt="Telegram"
              width={16}
              height={16}
              className="w-4 h-4 md:w-6 md:h-6"
              loading="lazy"
            />
          </div>
          <div className="w-4 h-4 md:w-6 md:h-6 flex items-center justify-center hover:opacity-80 transition-opacity">
            <Image
              src="/images/wallets/discord.png"
              alt="Discord"
              width={16}
              height={16}
              className="w-4 h-4 md:w-6 md:h-6"
              loading="lazy"
            />
          </div>
        </div>
        <ThemeToggle />
      </div>
    </div>
  );
} 