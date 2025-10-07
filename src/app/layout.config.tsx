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
  // githubUrl removed to hide GitHub button in docs header
  // Disable FumaDocs built-in toggle (we inject our own)
  disableThemeSwitch: true,
};
