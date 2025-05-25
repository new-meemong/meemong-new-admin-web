import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type Size = "sm" | "md" | "lg";

interface DropdownMenuProps {
  options: { label: string; value: string }[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  size?: Size;
  className?: string;
}

const triggerSizeMap: Record<Size, string> = {
  sm: "w-[262px] h-[30px] px-[15px] py-[5px]",
  md: "w-[262px] h-[36px] px-[15px] py-[8px]",
  lg: "w-[262px] h-[44px] px-[15px] py-[12px]",
};

export function SelectBox({
  options,
  value,
  onChange,
  placeholder = "선택하세요",
  size = "md",
  className,
}: DropdownMenuProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        size={size}
        className={cn(triggerSizeMap[size], className)}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
