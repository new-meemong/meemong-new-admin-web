export const RELEASE_API_ORIGIN = "https://api.meemong.com";

export type FirestoreDatabaseId = "meemong-chat" | "meemong-dev";

export function resolveFirestoreDatabaseId(
  apiUrl = process.env.NEXT_PUBLIC_API_URL,
): FirestoreDatabaseId {
  if (!apiUrl) {
    throw new Error("NEXT_PUBLIC_API_URL이 설정되지 않았습니다.");
  }

  let apiOrigin: string;
  try {
    apiOrigin = new URL(apiUrl).origin;
  } catch {
    throw new Error("NEXT_PUBLIC_API_URL이 올바른 URL이 아닙니다.");
  }

  return apiOrigin === RELEASE_API_ORIGIN ? "meemong-chat" : "meemong-dev";
}

export function getFirestoreEnvironmentLabel(databaseId: FirestoreDatabaseId) {
  return databaseId === "meemong-chat" ? "운영" : "개발";
}
