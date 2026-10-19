import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  MutationObserver,
  QueryClient,
  QueryObserver,
} from "@tanstack/react-query";
import { ApiError } from "@/apis/core";
import { deleteUserPhotoMutationOptions } from "./index";

const client = () =>
  new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
const response = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });
beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_API_URL", "https://api.example.test");
  vi.stubGlobal("document", { cookie: "accessToken=admin-test-token" });
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("member photo deletion contract", () => {
  it.each([
    "/api/v1/admins/user-files/101",
    "/api/v1/admins/beauty-application-images/201",
    "/api/v1/admins/users/7/profile-photo",
  ])(
    "deletes %s with admin authentication, then reloads both photo fields and lists",
    async (path) => {
      const qc = client();
      const fresh = {
        id: 7,
        profilePictureURL: "https://images.test/fallback.jpg",
        userPhotos: [
          {
            id: "user-profile:7",
            deleteUrl: "/api/v1/admins/users/7/profile-photo",
          },
        ],
      };
      qc.setQueryData(["GET_USER_DETAIL", 7], {
        id: 7,
        profilePictureURL: "old",
        userPhotos: [],
      });
      qc.setQueryData(["GET_USERS", { role: 1 }], { content: [] });
      qc.setQueryData(["GET_USERS", { role: 2 }], { content: [] });
      const reloadList = vi.fn().mockResolvedValue({ content: [fresh] });
      const observer = new QueryObserver(qc, {
        queryKey: ["GET_USERS", { role: 1 }],
        queryFn: reloadList,
        staleTime: Infinity,
      });
      const unsubscribe = observer.subscribe(() => {});
      const fetchMock = vi
        .fn()
        .mockResolvedValueOnce(response({ data: null }))
        .mockResolvedValueOnce(response({ data: fresh }));
      vi.stubGlobal("fetch", fetchMock);
      try {
        const result = await new MutationObserver(
          qc,
          deleteUserPhotoMutationOptions(qc, 7),
        ).mutate(path);
        expect(result).toEqual({ alreadyDeleted: false, refreshFailed: false });
        expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
          `https://api.example.test${path}`,
          "https://api.example.test/api/v1/admins/users/7",
        ]);
        const init = fetchMock.mock.calls[0][1];
        expect(init.method).toBe("DELETE");
        expect(init.body).toBeUndefined();
        expect(init.headers.get("Authorization")).toBe("admin-test-token");
        expect(qc.getQueryData(["GET_USER_DETAIL", 7])).toEqual(fresh);
        expect(reloadList).toHaveBeenCalledTimes(1);
        expect(
          qc.getQueryState(["GET_USERS", { role: 2 }])?.isInvalidated,
        ).toBe(true);
      } finally {
        unsubscribe();
        qc.clear();
      }
    },
  );

  it.each([404, 403, 500])(
    "handles HTTP %s using the documented error code and refreshed photo list",
    async (status) => {
      const qc = client();
      const fetchMock = vi
        .fn()
        .mockResolvedValueOnce(
          response(
            {
              code: status === 404 ? "NOT_FOUND_ERROR" : "ERROR",
              message: "request failed",
            },
            status,
          ),
        )
        .mockResolvedValueOnce(
          response({ data: { userPhotos: [], profilePictureURL: "" } }),
        );
      vi.stubGlobal("fetch", fetchMock);
      try {
        const mutation = new MutationObserver(
          qc,
          deleteUserPhotoMutationOptions(qc, 7),
        );
        if (status === 404) {
          await expect(
            mutation.mutate("/api/v1/admins/users/7/profile-photo"),
          ).resolves.toEqual({ alreadyDeleted: true, refreshFailed: false });
          expect(fetchMock).toHaveBeenCalledTimes(2);
        } else {
          await expect(
            mutation.mutate("/api/v1/admins/users/7/profile-photo"),
          ).rejects.toBeInstanceOf(ApiError);
          expect(fetchMock).toHaveBeenCalledTimes(1);
        }
      } finally {
        qc.clear();
      }
    },
  );

  it.each([undefined, "ROUTE_NOT_FOUND"])(
    "rejects a route 404 with code %s without claiming the photo was deleted",
    async (code) => {
      const qc = client();
      vi.stubGlobal(
        "fetch",
        vi
          .fn()
          .mockResolvedValue(response({ code, message: "Not found" }, 404)),
      );
      try {
        await expect(
          new MutationObserver(
            qc,
            deleteUserPhotoMutationOptions(qc, 7),
          ).mutate("/api/v1/admins/users/7/profile-photo"),
        ).rejects.toMatchObject({ status: 404 });
        expect(fetch).toHaveBeenCalledTimes(1);
      } finally {
        qc.clear();
      }
    },
  );

  it.each(["still-present", "refresh-failed", "missing-list"])(
    "rejects NOT_FOUND_ERROR when absence cannot be confirmed: %s",
    async (scenario) => {
      const qc = client();
      const deleteUrl = "/api/v1/admins/users/7/profile-photo";
      const fetchMock = vi
        .fn()
        .mockResolvedValueOnce(response({ code: "NOT_FOUND_ERROR" }, 404));
      if (scenario === "refresh-failed") {
        fetchMock.mockRejectedValueOnce(new Error("offline"));
      } else {
        fetchMock.mockResolvedValueOnce(
          response({
            data:
              scenario === "missing-list"
                ? {}
                : {
                    userPhotos: [{ id: "user-profile:7", deleteUrl }],
                    profilePictureURL: "https://images.test/social.jpg",
                  },
          }),
        );
      }
      vi.stubGlobal("fetch", fetchMock);
      try {
        await expect(
          new MutationObserver(
            qc,
            deleteUserPhotoMutationOptions(qc, 7),
          ).mutate(deleteUrl),
        ).rejects.toMatchObject({ status: 404, code: "NOT_FOUND_ERROR" });
        expect(fetchMock).toHaveBeenCalledTimes(2);
      } finally {
        qc.clear();
      }
    },
  );

  it("still invalidates lists and reports a refresh failure after a successful deletion", async () => {
    const qc = client();
    qc.setQueryData(["GET_USERS"], { content: [] });
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(response({ data: null }))
        .mockRejectedValueOnce(new Error("offline")),
    );
    try {
      await expect(
        new MutationObserver(qc, deleteUserPhotoMutationOptions(qc, 7)).mutate(
          "/api/v1/admins/user-files/101",
        ),
      ).resolves.toEqual({ alreadyDeleted: false, refreshFailed: true });
      expect(qc.getQueryState(["GET_USERS"])?.isInvalidated).toBe(true);
      expect(fetch).toHaveBeenCalledTimes(2);
    } finally {
      qc.clear();
    }
  });
});
