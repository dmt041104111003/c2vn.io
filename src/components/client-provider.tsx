"use client";

import { SessionProvider } from "next-auth/react";
import { ToastProvider } from "~/components/toast-provider";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import BanCheckProvider from "~/components/BanCheckProvider";

const queryClient = new QueryClient();

export default function ClientProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <BanCheckProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </BanCheckProvider>
      </SessionProvider>
    </QueryClientProvider>
  );
} 