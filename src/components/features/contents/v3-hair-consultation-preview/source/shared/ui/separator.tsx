import type { ComponentProps } from "react";
import { cn } from "../lib/utils";

// Read-only divider adapter: preserve the web reader's styles without another Radix dependency.
export function Separator({ className, ...props }: ComponentProps<"div">) {
  return <div aria-hidden="true" data-slot="separator-root" data-orientation="horizontal" className={cn("bg-divider-weak shrink-0 h-px w-full", className)} {...props} />;
}
