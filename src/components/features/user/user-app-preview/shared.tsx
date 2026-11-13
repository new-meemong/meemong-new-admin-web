import { useId, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import AppPreviewImageViewer from "@/components/shared/app-preview/image-viewer";
import type { UserProfileImage } from "@/models/user-profile";

export function Empty({
  children = "아직 등록된 정보가 없어요",
}: {
  children?: ReactNode;
}) {
  return (
    <p className="py-8 text-center text-[14px] leading-[22px] text-[#99A2AD]">
      {children}
    </p>
  );
}
export function Section({
  title,
  trailing,
  children,
}: {
  title: string;
  trailing?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="border-b-[8px] border-[#F8F9FB] px-4 py-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-[16px] font-semibold leading-6">{title}</h3>
        {trailing}
      </div>
      {children}
    </section>
  );
}
export function ProfileTabs({
  labels,
  value,
  onChange,
  label = "프로필 내용",
  variant = "underline",
}: {
  labels: string[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  variant?: "underline" | "square" | "pill";
}) {
  const id = useId();
  return (
    <div
      role="tablist"
      aria-label={label}
      className={
        variant === "underline"
          ? "flex border-b border-[#EFF1F4] px-4"
          : "flex gap-2 px-4 pt-4"
      }
    >
      {labels.map((item, index) => (
        <button
          key={item}
          type="button"
          role="tab"
          id={`${id}-${index}`}
          aria-selected={value === item}
          tabIndex={value === item ? 0 : -1}
          onClick={() => onChange(item)}
          onKeyDown={(event) => {
            const offset =
              event.key === "ArrowRight"
                ? 1
                : event.key === "ArrowLeft"
                  ? -1
                  : 0;
            if (!offset) return;
            event.preventDefault();
            const next = (index + offset + labels.length) % labels.length;
            onChange(labels[next]);
            document.getElementById(`${id}-${next}`)?.focus();
          }}
          className={
            variant === "underline"
              ? `h-12 flex-1 text-[14px] ${value === item ? "border-b-2 border-[#2F343C] font-semibold" : "text-[#99A2AD]"}`
              : `h-[34px] border px-4 text-[14px] ${variant === "pill" ? "rounded-full" : "rounded-lg"} ${value === item ? "border-[#2F343C] bg-[#2F343C] text-white" : "border-[#DFE2E7] text-[#525A66]"}`
          }
        >
          {item}
        </button>
      ))}
    </div>
  );
}
export function Gallery({
  images,
  label,
  horizontal = false,
}: {
  images: UserProfileImage[];
  label: string;
  horizontal?: boolean;
}) {
  const [index, setIndex] = useState<number | null>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const items = images
    .filter((image) => image.imageURL)
    .map((image) => ({ id: image.id, src: image.imageURL, deletable: false }));
  return (
    <>
      {items.length ? (
        <div
          aria-label={label}
          className={
            horizontal
              ? "flex gap-3 overflow-x-auto"
              : "grid grid-cols-3 gap-px"
          }
        >
          {items.map((image, i) => (
            <button
              type="button"
              key={image.id}
              aria-label={`${label} ${i + 1} 확대`}
              className={
                horizontal
                  ? "h-[140px] w-[140px] shrink-0 overflow-hidden rounded-md"
                  : "aspect-square overflow-hidden"
              }
              onClick={(event) => {
                trigger.current = event.currentTarget;
                setIndex(i);
              }}
            >
              <Image
                src={image.src}
                width={140}
                height={140}
                unoptimized
                alt={`${label} ${i + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      ) : (
        <Empty>등록된 {label}가 없습니다.</Empty>
      )}
      {index !== null && items[index] && (
        <AppPreviewImageViewer
          images={items}
          initialIndex={index}
          returnFocusTo={trigger.current}
          onClose={() => setIndex(null)}
        />
      )}
    </>
  );
}
export function Chips({ values }: { values: (string | null | undefined)[] }) {
  const list = [
    ...new Set(
      values.filter((value): value is string => Boolean(value?.trim())),
    ),
  ];
  return list.length ? (
    <div className="flex flex-wrap gap-2">
      {list.map((value) => (
        <span
          key={value}
          className="rounded-md border border-[#DFE2E7] px-3 py-2 text-[14px]"
        >
          {value}
        </span>
      ))}
    </div>
  ) : (
    <Empty />
  );
}
export function profileDate(value: string | null | undefined) {
  if (!value) return null;
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return null;
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}
export function price(value: number | null | undefined) {
  return value == null ? "" : `${value.toLocaleString("ko-KR")}원`;
}
export function safeProfileLink(value: string | null | undefined) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}
