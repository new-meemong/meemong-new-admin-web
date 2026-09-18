export function formatReservationTime(time: string): string {
  const compactTimeMatch = time.match(/^(\d{2})(\d{2})$/);
  if (compactTimeMatch) {
    return `${compactTimeMatch[1]}:${compactTimeMatch[2]}`;
  }

  const colonTimeMatch = time.match(/^(\d{2}):(\d{2})(?::\d{2})?$/);
  if (colonTimeMatch) {
    return `${colonTimeMatch[1]}:${colonTimeMatch[2]}`;
  }

  return time;
}

export function formatTimeSaleMenuReservationRate(
  rate: number | null | undefined,
): string {
  return rate == null
    ? "-"
    : `${(rate * 100).toLocaleString("ko-KR", { maximumFractionDigits: 2 })}%`;
}

// Flutter: lib/constants/strings.dart treatmentDisplayNameOverrides,
// consumed by ReviewSpecialMenu.treatmentTypeWithCutOptionLabel in the detail summary.
// Display-only aliases: never use these values to build the admin API filter.
export function formatTimeSaleMenuAppTreatmentType(
  value: string | null,
): string {
  const raw = value?.trim() ?? "";
  return (
    ({ 커트: "컷트", 두피케어: "헤드스파" } as Record<string, string>)[raw] ??
    raw
  );
}

export function formatTimeSaleMenuAnalysisTreatmentType(
  value: string | null,
): string {
  const raw = value?.trim() || "-";
  const appLabel = formatTimeSaleMenuAppTreatmentType(value);
  return appLabel && appLabel !== raw ? `${raw} (앱: ${appLabel})` : raw;
}
