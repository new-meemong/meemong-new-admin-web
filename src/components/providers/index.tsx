"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { DialogProvider } from "@/components/shared/dialog/context";

export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <DialogProvider>
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
      </DialogProvider>
    </QueryClientProvider>
  );
}
