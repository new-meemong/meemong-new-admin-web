import { ITimeSaleMenuReservationSlot } from "@/models/timeSaleMenus";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

export function getPreviewReservationDates(now = new Date()) {
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const today = Date.UTC(
    kst.getUTCFullYear(),
    kst.getUTCMonth(),
    kst.getUTCDate(),
  );
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today + index * 86400000);
    return {
      key: date.toISOString().slice(0, 10),
      month: date.getUTCMonth() + 1,
      date: date.getUTCDate(),
      dayOfWeek: WEEKDAYS[date.getUTCDay()],
      label: index === 0 ? "오늘" : WEEKDAYS[date.getUTCDay()],
    };
  });
}

export function reservationTimeMinutes(time: string) {
  const match = /^(\d{2}):?(\d{2})(?::\d{2})?$/.exec(time);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  return hours < 24 && minutes < 60 ? hours * 60 + minutes : null;
}

export function getPreviewDaySlots(
  slots: ITimeSaleMenuReservationSlot[],
  dayOfWeek: string,
  date: string,
  now = new Date(),
) {
  return slots
    .filter(
      (slot) =>
        slot.dayOfWeek === dayOfWeek &&
        reservationTimeMinutes(slot.startTime) !== null,
    )
    .map((slot) => {
      const minutes = reservationTimeMinutes(slot.startTime)!;
      const time = `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
      return {
        ...slot,
        minutes,
        time,
        isPast: new Date(`${date}T${time}:00+09:00`).getTime() <= now.getTime(),
      };
    })
    .sort((a, b) => a.minutes - b.minutes);
}

export function getDefaultPreviewReservationDate(
  slots: ITimeSaleMenuReservationSlot[],
  now = new Date(),
) {
  const dates = getPreviewReservationDates(now);
  return (
    dates.find((date) =>
      getPreviewDaySlots(slots, date.dayOfWeek, date.key, now).some(
        (slot) => !slot.isPast,
      ),
    ) ?? dates[0]
  ).key;
}
