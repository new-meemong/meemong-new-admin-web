"use client";

import React, { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ASSIGNEE_AVATAR,
  SUPPORT_CHAT_ASSIGNEES,
  assigneeInitials,
  type SupportChatAssignee,
} from "./support-chat-model";

export function AssigneeAvatar({ name }: { name: SupportChatAssignee | null }) {
  if (!name) {
    return <span className="size-6 flex-none rounded-full border-[1.5px] border-dashed border-[#b3b9c2]" />;
  }
  const color = ASSIGNEE_AVATAR[name];
  return (
    <span
      className="flex size-6 flex-none items-center justify-center rounded-full text-[10px] font-bold tracking-[-0.5px]"
      style={{ background: color.bg, color: color.fg }}
    >
      {assigneeInitials(name)}
    </span>
  );
}

/**
 * 프로토타입 담당자 선택(CmpAssignee + 드롭다운). '미배정'은 고를 수 없다(담당자 필수,
 * 사용자 결정 2026-11-11). 아직 배정되지 않은 방은 버튼에만 미배정 상태를 보여준다.
 */
export function AssigneePicker({
  value,
  onChange,
  placeholder = "담당자 미배정",
  label = "담당자 지정",
  variant = "desktop",
  align = "right",
  className,
}: {
  value: SupportChatAssignee | null;
  onChange: (name: SupportChatAssignee) => void;
  placeholder?: string;
  label?: string;
  variant?: "desktop" | "mobile";
  align?: "left" | "right";
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={cn("relative flex-none", className)}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="담당자 선택"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-1.5 border bg-white text-[13px] text-[#2f343c] whitespace-nowrap",
          variant === "mobile" ? "h-8 rounded-2xl pl-1 pr-2" : "h-[34px] rounded-lg pl-1.5 pr-2",
          open ? "border-[#5a4b8a] shadow-[0_0_0_3px_#efedf6]" : "border-[#dfe2e7]",
        )}
      >
        <AssigneeAvatar name={value} />
        <span className={cn(!value && "text-[#6b7480]")}>{value ?? placeholder}</span>
        <ChevronDown className="size-3.5 text-[#6b7480]" aria-hidden />
      </button>
      {open && (
        <div
          role="listbox"
          aria-label="담당자"
          className={cn(
            "absolute top-[42px] z-20 flex w-[200px] flex-col gap-0.5 rounded-[10px] border border-[#e6e9ee] bg-white p-1.5 shadow-[0_8px_24px_rgba(17,20,24,.12)]",
            align === "right" ? "right-0" : "left-0",
          )}
        >
          <span className="px-2.5 pb-1 pt-1.5 text-[11px] font-bold text-[#99a2ad]">{label}</span>
          {SUPPORT_CHAT_ASSIGNEES.map((name) => {
            const selected = name === value;
            return (
              <button
                key={name}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => {
                  setOpen(false);
                  if (!selected) onChange(name);
                }}
                className={cn(
                  "flex h-9 items-center gap-2 rounded-md px-2.5 text-left text-[13px] text-[#1d2024] hover:bg-[#f5f4fa]",
                  selected && "bg-[#f5f4fa]",
                )}
              >
                <AssigneeAvatar name={name} />
                <span>{name}</span>
                {selected && <Check className="ml-auto size-3.5 text-[#5a4b8a]" aria-hidden />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
