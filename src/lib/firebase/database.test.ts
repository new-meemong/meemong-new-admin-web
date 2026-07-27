import { describe, expect, it } from "vitest";
import {
  getFirestoreEnvironmentLabel,
  resolveFirestoreDatabaseId,
} from "@/lib/firebase/database";

describe("resolveFirestoreDatabaseId", () => {
  it("릴리즈 API만 운영 DB로 연결한다", () => {
    expect(resolveFirestoreDatabaseId("https://api.meemong.com")).toBe(
      "meemong-chat",
    );
    expect(resolveFirestoreDatabaseId("https://api.meemong.com/")).toBe(
      "meemong-chat",
    );
  });

  it.each([
    "https://api-test.meemong.com",
    "http://localhost:3000",
    "https://preview.meemong.com",
  ])("%s는 개발 DB로 연결한다", (apiUrl) => {
    expect(resolveFirestoreDatabaseId(apiUrl)).toBe("meemong-dev");
  });

  it("주소가 없거나 잘못되면 조용히 default DB로 폴백하지 않는다", () => {
    expect(() => resolveFirestoreDatabaseId("")).toThrow(
      "NEXT_PUBLIC_API_URL이 설정되지 않았습니다.",
    );
    expect(() => resolveFirestoreDatabaseId("not-a-url")).toThrow(
      "NEXT_PUBLIC_API_URL이 올바른 URL이 아닙니다.",
    );
  });
});

describe("getFirestoreEnvironmentLabel", () => {
  it("DB에 맞는 환경 라벨을 반환한다", () => {
    expect(getFirestoreEnvironmentLabel("meemong-chat")).toBe("운영");
    expect(getFirestoreEnvironmentLabel("meemong-dev")).toBe("개발");
  });
});
