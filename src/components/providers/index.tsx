"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { DialogProvider } from "@/components/shared/dialog/context";
import { ToastContainer } from "react-toastify";

export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <DialogProvider>
        {children}
        <ToastContainer
          position={"top-right"}
          autoClose={2000}
          hideProgressBar={true}
          pauseOnHover={false}
          pauseOnFocusLoss={false}
          theme="colored"
        />
        <ReactQueryDevtools initialIsOpen={false} />
      </DialogProvider>
    </QueryClientProvider>
  );
}
