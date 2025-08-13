import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface ModalHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  closable?: boolean;
  onClose?: () => void;
}

export function ModalHeader({
  className,
  children,
  closable = true,
  onClose,
  ...props
}: ModalHeaderProps) {
  return (
    <div
      className={cn(
        "typo-title-1-bold p-modal flex flex-row justify-between items-center border-b border-border",
        className,
      )}
      {...props}
    >
      <div className={cn("flex flex-1")}>{children}</div>
      {closable && onClose && (
        <div className={cn("flex align-center justify-center flex-shrink-0")}>
          <button
            onClick={onClose}
            className={cn(
              "relative w-[24px] h-[24px] text-gray-400 cursor-pointer rounded-4",
              "hover:text-[rgba(0,0,0,0.88)] hover:bg-[rgba(0,0,0,0.06)] transition-all duration-200",
            )}
            aria-label="Close"
          >
            <X className="h-5 w-5 mx-auto" />
          </button>
        </div>
      )}
    </div>
  );
}
