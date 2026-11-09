function hasFinalConsonant(value: string): boolean {
  const code = value.trim().charCodeAt(value.trim().length - 1);
  return code >= 0xac00 && code <= 0xd7a3 && (code - 0xac00) % 28 !== 0;
}
export function withObjectParticle(value: string): string {
  return `${value}${hasFinalConsonant(value) ? '을' : '를'}`;
}
/** 로 follows a vowel or ㄹ; other final consonants take 으로. */
export function withDirectionParticle(value: string): string {
  const code = value.trim().charCodeAt(value.trim().length - 1);
  const finalConsonant = code >= 0xac00 && code <= 0xd7a3 ? (code - 0xac00) % 28 : 0;
  return `${value}${finalConsonant === 0 || finalConsonant === 8 ? '로' : '으로'}`;
}
export function withSubjectParticle(value: string): string {
  return `${value}${hasFinalConsonant(value) ? '이' : '가'}`;
}

export function withPoliteCopula(value: string): string {
  return `${value}${hasFinalConsonant(value) ? '이에요' : '예요'}`;
}
