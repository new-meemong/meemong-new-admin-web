// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import UserAppPreview from "./index";
import type { IUserForm } from "@/models/users";
import type { UserDesignerInfo, UserModelInfo } from "@/models/user-profile";

vi.mock("next/font/local", () => ({
  default: () => ({ className: "app-font" }),
}));
vi.mock("@/components/shared/app-preview/store-map", () => ({
  default: () => <div>매장 지도</div>,
}));
let host: HTMLDivElement;
let root: Root;
const open = vi.fn();
const model: UserModelInfo = {
  id: null,
  userId: 7,
  address: "서울",
  paymodel: null,
  modelImageList: [
    { id: 9, imageURL: "https://example.test/model-9.jpg" },
    { id: 2, imageURL: "https://example.test/model-2.jpg" },
  ],
  isHairReserving: true,
  isBeautyReserving: false,
  hairLength: "롱",
  hairTexture: "반곱슬",
  hairConcernList: ["모발손상"],
  skinBrightness: "19~21호",
  personalColor: "봄웜",
  lastHairInfoUpdatedAt: null,
  modelInfoShootingType: {
    id: 1,
    shootingType: "헤어 촬영",
    shootingRange: "조건부 가능",
    description: "얼굴 제외",
  },
  modelInfoTreatmentHistoryList: [
    {
      id: 1,
      treatmentType: "탈색",
      treatmentDate: "2026-10-01",
      isSelf: true,
      treatmentArea: "전체",
      decolorizationCount: 2,
      displayOrder: 1,
    },
  ],
  modelInfoWantedStyle: {
    id: 1,
    description: "차분한 스타일\n긴 기장 유지",
    updatedAt: "2026-11-03T00:00:00Z",
    imageList: [
      { id: 1, imageUrl: "https://example.test/wanted.jpg", displayOrder: 1 },
    ],
  },
  styleList: ["펌"],
  facialList: ["네일"],
  modelInfoHopePrice: { id: 1, priceType: "무료시술 원해요", price: 0 },
  modelInfoReviewType: {
    id: 1,
    reviewTypeList: ["네이버 포토리뷰"],
    reviewTypeDescription: null,
    description: "리뷰 가능",
  },
  hairConsultationList: [
    {
      id: 90,
      consultationType: "DEEP",
      customerType: "CONSULTING",
      createdAt: "2026-11-01",
      updatedAt: null,
      withdrawnAt: "2026-11-02",
      detailUrl: "/api/v1/admins/v3-hair-consultations/90",
    },
  ],
  quickMatchingList: [
    {
      id: 91,
      consultationType: "QUICK",
      customerType: null,
      createdAt: null,
      updatedAt: null,
      withdrawnAt: null,
      detailUrl: "/api/v1/admins/v3-hair-consultations/91",
    },
  ],
};
const designer: UserDesignerInfo = {
  id: null,
  userId: 7,
  description: "새 소개",
  brandId: null,
  Brand: null,
  companyName: "미몽 헤어",
  storeTypeList: ["HAIR"],
  address: "서울 강남구",
  address2: "2층",
  lat: null,
  lng: null,
  storelink: null,
  storeReservationNotice: "예약 전 문의\n<script>안내</script>",
  storeReservationPlatformName: "네이버",
  storeReservationUrl: "https://example.test/book",
  portfolioImageList: [
    { id: 6, imageURL: "https://example.test/portfolio.jpg" },
  ],
  shopImageList: [],
  designerInfoStoreHourList: [],
  designerInfoReservationSlotList: [],
  modelTreatmentMenuList: [
    {
      id: 20,
      title: "모델 펌",
      category: "펌",
      categoryList: ["펌"],
      price: 0,
      priceType: "무료시술",
      shootingType: null,
      shootingUseType: null,
      reviewTypeList: [],
      reviewTypeDescription: null,
      description: null,
      activated: 0,
      imageList: [],
      detailUrl: "/api/v1/admins/beauty-applications/20",
    },
  ],
  timeSaleMenuList: [
    {
      id: 30,
      name: "리뷰 펌",
      treatmentType: "펌",
      originalPrice: 100000,
      discountPrice: 30000,
      description: null,
      isActive: false,
      detailUrl: "/api/v1/admins/time-sale-menus/30",
    },
  ],
};
const user = (role: 1 | 2 | 3 | 4) =>
  ({
    id: 7,
    role,
    displayName: "회원",
    description: "옛 소개",
    address: "옛 주소",
    profilePictureURL: "",
    modelInfo: role === 1 || role === 3 ? model : null,
    designerInfo: role === 2 || role === 4 ? designer : null,
    snsInfoList: [{ id: 1, type: "위험 링크", value: "javascript:alert(1)" }],
    userPhotos: [
      {
        id: 100,
        fileType: "contract-signature",
        s3Path: "https://example.test/secret.jpg",
      },
    ],
  }) as IUserForm;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  open.mockClear();
  vi.unstubAllGlobals();
});
async function render(value: IUserForm) {
  await act(async () =>
    root.render(<UserAppPreview user={value} onOpenDetail={open} />),
  );
}
async function click(text: string) {
  const element = Array.from(host.querySelectorAll("button")).find((item) =>
    item.textContent?.includes(text),
  );
  expect(element).toBeTruthy();
  await act(async () => element!.click());
}

it.each([1, 3] as const)(
  "role %s의 고객정보·작성 글과 전용 사진 목록을 연결한다",
  async (role) => {
    await render(user(role));
    expect(
      Array.from(host.querySelectorAll("img")).map((image) =>
        image.getAttribute("src"),
      ),
    ).toEqual(model.modelImageList.map((image) => image.imageURL));
    expect(host.innerHTML).not.toContain("secret.jpg");
    expect(host.textContent).toContain("헤어 시술 예약중인 고객");
    await click("고객정보");
    expect(host.textContent).toContain("차분한 스타일\n긴 기장 유지");
    expect(host.textContent).toContain("탈색 2회");
    expect(host.textContent).toContain("무료시술 원해요");

    expect(host.textContent).not.toContain("수정됨");
    await click("작성한 글");
    expect(host.textContent).toContain("철회됨");
    await click("헤어컨설팅 #90");
    expect(open).toHaveBeenLastCalledWith({ kind: "consultation", id: 90 });
    await click("빠른매칭");
    await click("빠른매칭 #91");
    expect(open).toHaveBeenLastCalledWith({ kind: "consultation", id: 91 });
  },
);
it.each([2, 4] as const)(
  "role %s의 예약안내·매장·전체 메뉴를 구분하고 상세로 연결한다",
  async (role) => {
    await render(user(role));
    expect(host.textContent).toContain("새 소개");
    expect(host.textContent).not.toContain("옛 소개");
    expect(host.textContent).toContain("비활성");
    await click("모델 펌");
    expect(open).toHaveBeenLastCalledWith({ kind: "model-treatment", id: 20 });
    await click("리뷰특가");
    expect(host.textContent).toContain("30,000원");
    await click("리뷰 펌");
    expect(open).toHaveBeenLastCalledWith({ kind: "time-sale", id: 30 });
    await click("예약안내");
    expect(host.textContent).toContain("예약 전 문의\n<script>안내</script>");
    expect(host.querySelector("script")).toBeNull();
    expect(host.textContent).toContain("서울 강남구 2층");
    expect(
      host.querySelector('a[href="https://example.test/book"]'),
    ).toBeTruthy();
    expect(host.querySelector('a[href^="javascript:"]')).toBeNull();
    await click("포트폴리오");
    expect(host.querySelector("img")?.getAttribute("src")).toBe(
      "https://example.test/portfolio.jpg",
    );
  },
);
it("역할 객체가 비어 있으면 관리용 사진이나 다른 수정일을 대신 쓰지 않는다", async () => {
  await render({ ...user(1), modelInfo: null });
  expect(host.querySelector("img")).toBeNull();
  await click("고객정보");
  expect(host.textContent).toContain("정보 없음");
  expect(host.textContent).not.toContain("수정됨");
  await click("작성한 글");
  expect(host.textContent).toContain("작성한 글이 없습니다");
});
it("사진 삭제 후 갱신된 역할 목록으로 미리보기를 다시 그린다", async () => {
  await render(user(2));
  await click("포트폴리오");
  expect(host.querySelector("img")).toBeTruthy();
  await render({
    ...user(2),
    designerInfo: { ...designer, portfolioImageList: [] },
  });
  expect(host.querySelector("img")).toBeNull();
  expect(host.textContent).toContain("등록된 포트폴리오가 없습니다");
});

it("구버전 응답을 등록된 정보가 없는 상태로 오인하지 않는다", async () => {
  await render({ ...user(2), designerInfo: undefined });
  expect(host.textContent).toContain("추가 프로필 정보를 불러오지 못했습니다");
  expect(host.textContent).not.toContain("등록된 내용이 없어요");
});
