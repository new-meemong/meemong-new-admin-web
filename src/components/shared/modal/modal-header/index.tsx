import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { useModalContext } from "@/components/shared/modal/context";

interface ModalHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  closable?: boolean;
  size?: "xs" | "sm" | "md";
  onClose?: () => void;
}

export function ModalHeader({
  className,
  children,
  ...props
}: ModalHeaderProps) {
  const { closable, size, onClose } = useModalContext();

  return (
    <div
      className={cn(
        "typo-title-1-bold p-modal flex flex-row justify-between items-center border-border",
        { "border-b": closable, "pt-[25px] px-[32px] pb-[32px]": size === "xs" },
        className,
      )}
      {...props}
    >
      <div className={cn("flex flex-1", { "justify-center": !closable })}>
        {children}
      </div>
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
