import dayjs from "dayjs";

/**
 * 날짜를 지정된 형식으로 변환합니다.
 * @param date - 포맷할 날짜 (string, number, Date, dayjs 객체 등)
 * @param format - 변환할 포맷 (기본값: "YYYY-MM-DD HH:mm:ss")
 * @returns 포맷된 날짜 문자열
 */
export function formatDate(
  date: string | number | Date | dayjs.Dayjs,
  format = "YYYY-MM-DD HH:mm:ss",
): string | undefined {
  if (!date) {
    return
  }

  return dayjs(date).format(format);
}
