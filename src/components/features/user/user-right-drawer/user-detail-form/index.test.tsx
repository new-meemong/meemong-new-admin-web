import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { IUserForm } from "@/models/users";
import type { ImageSwiperItem } from "@/components/shared/image-swiper";
import UserDetailForm from "./index";

const mocks = vi.hoisted(() => ({
  mutateAsync: vi.fn(),
  success: vi.fn(),
  warning: vi.fn(),
  info: vi.fn(),
  error: vi.fn(),
}));
vi.mock("@/queries/users", () => ({
  useDeleteUserPhotoMutation: () => ({ mutateAsync: mocks.mutateAsync }),
  useUpdateUserDescriptionMutation: () => ({}),
  useUpdateUserDisplayNameMutation: () => ({}),
  useUpdateUserPayModelMutation: () => ({}),
}));
vi.mock("react-toastify", () => ({ toast: mocks }));
vi.mock(
  "@/components/features/user/user-right-drawer/user-block-info-list",
  () => ({ default: () => null }),
);
vi.mock(
  "@/components/features/user/user-right-drawer/user-mong-money-deposit-form",
  () => ({ default: () => null }),
);
vi.mock(
  "@/components/features/user/user-right-drawer/user-mong-money-history",
  () => ({ default: () => null }),
);
interface CapturedImage {
  src: string;
  images: ImageSwiperItem[];
  index: number;
  onDeleteImage: (image: ImageSwiperItem) => Promise<boolean>;
}
const captured: CapturedImage[] = [];
vi.mock("@/components/shared/image-box", () => ({
  default: (props: CapturedImage) => {
    captured.push(props);
    return <div />;
  },
}));
const photos = [
  {
    id: 101,
    fileType: "portfolio",
    s3Path: "https://images.test/portfolio.jpg",
    source: "UserFiles",
    deleteUrl: "/api/v1/admins/user-files/101",
  },
  {
    id: "missing",
    fileType: "model",
    s3Path: null,
    source: "UserFiles",
    deleteUrl: "/api/v1/admins/user-files/102",
  },
  {
    id: "beauty-application-image:201",
    fileType: "펌",
    s3Path: "https://images.test/menu.jpg",
    source: "BeautyApplicationImages",
    deleteUrl: "/api/v1/admins/beauty-application-images/201",
  },
  {
    id: "user-profile:7",
    fileType: "profilePhoto",
    s3Path: "https://images.test/social.jpg",
    source: "Users",
    deleteUrl: "/api/v1/admins/users/7/profile-photo",
  },
] satisfies IUserForm["userPhotos"];
const render = (profilePictureURL = photos[3].s3Path!) =>
  renderToStaticMarkup(
    <UserDetailForm
      formData={{ id: 7, profilePictureURL, userPhotos: photos } as IUserForm}
      onSubmit={() => {}}
      onRefresh={() => {}}
    />,
  );
beforeEach(() => {
  captured.length = 0;
  vi.clearAllMocks();
  vi.stubGlobal("window", {
    confirm: vi.fn().mockReturnValue(true),
    alert: vi.fn(),
  });
  mocks.mutateAsync.mockResolvedValue({
    alreadyDeleted: false,
    refreshFailed: false,
  });
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("member detail photo wiring", () => {
  it("uses the returned gallery without duplicate profiles, preserves string IDs and skips null URLs", () => {
    render();
    expect(captured).toHaveLength(4); // representative preview plus three gallery thumbnails
    expect(captured[0].index).toBe(2);
    expect(captured[0].images.map((image) => image.id)).toEqual([
      101,
      "beauty-application-image:201",
      "user-profile:7",
    ]);
    expect(captured.slice(1).map((image) => image.index)).toEqual([0, 1, 2]);
  });
  it.each([0, 1, 2])(
    "routes gallery item %s using its exact deleteUrl",
    async (index) => {
      render();
      const gallery = captured[index + 1];
      const photo = gallery.images[gallery.index];
      expect(await gallery.onDeleteImage(photo)).toBe(true);
      expect(mocks.mutateAsync).toHaveBeenCalledWith(photo.deleteUrl);
      expect(mocks.success).toHaveBeenCalledOnce();
    },
  );
  it("renders a server-selected fallback instead of blanking the representative profile", () => {
    render(photos[0].s3Path!);
    expect(captured[0].src).toBe(photos[0].s3Path);
    expect(captured[0].index).toBe(0);
  });
  it("does not delete on cancel and distinguishes refresh failure from delete failure", async () => {
    render();
    const gallery = captured[1];
    vi.mocked(window.confirm).mockReturnValueOnce(false);
    expect(await gallery.onDeleteImage(gallery.images[0])).toBe(false);
    expect(mocks.mutateAsync).not.toHaveBeenCalled();
    mocks.mutateAsync.mockResolvedValueOnce({
      alreadyDeleted: false,
      refreshFailed: true,
    });
    expect(await gallery.onDeleteImage(gallery.images[0])).toBe(true);
    expect(mocks.warning).toHaveBeenCalledOnce();
    expect(mocks.error).not.toHaveBeenCalled();
  });
  it("keeps the viewer open and reports failure when deletion is not confirmed", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    render();
    const gallery = captured[1];
    mocks.mutateAsync.mockRejectedValueOnce(
      new Error("photo remains after 404"),
    );
    expect(await gallery.onDeleteImage(gallery.images[0])).toBe(false);
    expect(mocks.error).toHaveBeenCalledOnce();
    expect(mocks.success).not.toHaveBeenCalled();
    expect(mocks.info).not.toHaveBeenCalled();
    expect(mocks.warning).not.toHaveBeenCalled();
  });
});
