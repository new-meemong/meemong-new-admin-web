import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";

interface AccordionItem {
  title: React.ReactNode;
  content: React.ReactNode;
  rightChild?: React.ReactNode;
}

interface AccordionProps {
  items: AccordionItem[];
}

export function Accordion({ items }: AccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleIndex = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div className={cn("w-full mx-auto")}>
      {items.map((item, index) => (
        <div key={`accordion-${index}`} className={cn("w-full flex")}>
          <div key={index} className="border-b flex-1">
            <div
              className={cn(
                "w-full justify-between items-center transition flex flex-row",
              )}
            >
              <div className={cn("py-[10px]")}>{item.title}</div>
              <button
                className={cn("cursor-pointer")}
                onClick={() => toggleIndex(index)}
              >
                {openIndex === index ? <ChevronUpIcon /> : <ChevronDownIcon />}
              </button>
            </div>
            {openIndex === index && (
              <div className={cn("py-[10px]")}>{item.content}</div>
            )}
          </div>
          {item.rightChild && (
            <div className={cn("ml-4 py-[10px]")}>{item.rightChild}</div>
          )}
        </div>
      ))}
    </div>
  );
}
