import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { images } from '~/public/images';
import Image from 'next/image';


export const baseOptions: BaseLayoutProps = {
  nav: {
    title: (
      <div className="flex flex-col items-start gap-3">
        <Image 
          src={images.logo} 
          alt="logo" 
          width={160} 
          height={100} 
        />
        
      </div>
    ),
  },
  githubUrl: 'https://github.com/cardano2vn',
  // disableThemeSwitch: true,
};
