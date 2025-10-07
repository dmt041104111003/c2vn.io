import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

import Logo from '~/components/ui/logo';


export const baseOptions: BaseLayoutProps = {
  nav: {
    title: (
      <div className="flex flex-col items-start gap-3">
        <Logo layout="inline" size="md" />
      </div>
    ),
  },
  githubUrl: 'https://github.com/cardano2vn',
  // disableThemeSwitch: true,
};
