/** Keep metadata/draft values intact; only normalize the two styling labels for display. */
export function stylingMethodLabel(value: string): string {
  switch (value) {
    case '롤빗-구르프를 써요':
      return '롤빗·구르프를 써요';
    case '왁스-스프레이 등 제품을 써요':
      return '왁스·스프레이 등 제품을 써요';
    default:
      return value;
  }
}
