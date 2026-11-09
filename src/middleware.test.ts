import { describe, expect, it } from "vitest";
import { unstable_doesMiddlewareMatch } from "next/experimental/testing/server";
import { config } from "./middleware";

describe("middleware route matching", () => {
  it.each([
    "/v3-hair-preview/preview.css",
    "/v3-hair-preview/PretendardVariable.woff2",
    "/v3-hair-preview/assets/consultation/icon.svg",
    "/v3-hair-preview/assets/consultation/image.webp?v=1",
  ])("serves public preview assets without authentication: %s", (url) => {
    for (const cookies of [{}, { accessToken: "expired-token" }]) {
      expect(unstable_doesMiddlewareMatch({ config, url, cookies })).toBe(false);
    }
  });

  it.each(["/contents", "/user", "/api/private", "/v3-hair-preview-admin"])(
    "keeps authentication enabled outside the public directory: %s",
    (url) => {
      expect(unstable_doesMiddlewareMatch({ config, url })).toBe(true);
    },
  );
});
