export function formatPrice(price: number | null | undefined): string {
  return price == null ? "-" : `${price.toLocaleString("ko-KR")}원`;
}
