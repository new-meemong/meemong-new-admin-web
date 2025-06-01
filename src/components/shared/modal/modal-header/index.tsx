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
    <div className={cn("typo-title-1-bold p-modal flex flex-row items-center border-b border-border", className)} {...props}>
      {closable && onClose && (
        <button
          onClick={onClose}
          className="relative text-gray-400 mr-[8px] cursor-pointer"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
      )}
      {children}
    </div>
  );
}
