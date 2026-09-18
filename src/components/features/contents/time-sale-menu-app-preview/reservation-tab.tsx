import React from "react";
import { ITimeSaleMenuReservationSlot } from "@/models/timeSaleMenus";
import { getPreviewDaySlots, getPreviewReservationDates } from "./reservation";

export default function TimeSaleMenuReservationTab({
  slots,
  selectedDate,
  selectedSlotId,
  onDateChange,
  onSlotChange,
}: {
  slots: ITimeSaleMenuReservationSlot[];
  selectedDate: string;
  selectedSlotId: number | null;
  onDateChange: (date: string) => void;
  onSlotChange: (id: number) => void;
}) {
  const dates = getPreviewReservationDates();
  const date = dates.find((date) => date.key === selectedDate) ?? dates[0];
  const daySlots = getPreviewDaySlots(slots, date.dayOfWeek, date.key);
  if (!slots.length)
    return (
      <p className="p-4 text-[14px] leading-[22px] text-[#99A2AD]">
        예약 가능한 시간이 없습니다.
      </p>
    );

  return (
    <div className="min-h-[360px] p-4 pb-24">
      <div
        className="flex gap-1 border-b border-[#EFF1F4]"
        aria-label="예약 날짜"
      >
        {dates.map((item) => {
          const enabled = slots.some(
            (slot) => slot.dayOfWeek === item.dayOfWeek,
          );
          return (
            <button
              key={item.key}
              type="button"
              disabled={!enabled}
              aria-pressed={enabled && item.key === date.key}
              aria-label={`${item.month}월 ${item.date}일 ${item.label}`}
              onClick={() => onDateChange(item.key)}
              className={`flex h-[70px] w-11 shrink-0 flex-col items-center py-2 ${!enabled ? "text-[#D4D7DE]" : item.dayOfWeek === "일" ? "text-[#FF3452]" : "text-[#525A66]"}`}
            >
              <span className="text-[12px] leading-[18px]">{item.label}</span>
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-lg text-[18px] font-semibold ${enabled && item.key === date.key ? "bg-[#EFF1F4]" : ""}`}
              >
                {item.date}
              </span>
            </button>
          );
        })}
      </div>
      {!daySlots.length && (
        <p className="mt-4 text-[14px] leading-[22px] text-[#99A2AD]">
          예약 가능한 시간이 없습니다.
        </p>
      )}
      {[
        { label: "오전", items: daySlots.filter((slot) => slot.minutes < 720) },
        {
          label: "오후",
          items: daySlots.filter((slot) => slot.minutes >= 720),
        },
      ].map(({ label, items }) => {
        return items.length ? (
          <div key={label} className="mt-4">
            <h5 className="mb-2 text-[14px] font-semibold leading-[22px]">
              {label}
            </h5>
            <div className="grid grid-cols-4 gap-2">
              {items.map((slot) => (
                <button
                  key={slot.id}
                  type="button"
                  disabled={slot.isPast}
                  aria-pressed={selectedSlotId === slot.id}
                  onClick={() => onSlotChange(slot.id)}
                  className={`h-10 rounded-[10px] border text-[14px] ${slot.isPast ? "border-[#EFF1F4] bg-[#F8F9FB] text-[#B7BCC7]" : selectedSlotId === slot.id ? "border-[#2F343C] bg-[#2F343C] text-white" : "border-[#DFE2E7] bg-white text-[#525A66]"}`}
                >
                  {slot.time}
                </button>
              ))}
            </div>
          </div>
        ) : null;
      })}
    </div>
  );
}
