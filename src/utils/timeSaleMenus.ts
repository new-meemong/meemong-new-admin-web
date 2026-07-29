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
