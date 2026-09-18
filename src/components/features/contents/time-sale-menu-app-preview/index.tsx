"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import { formatTimeSaleMenuAppTreatmentType } from "@/utils/timeSaleMenus";
import { UserFileType } from "@/models/userFiles";
import localFont from "next/font/local";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import type { ImageSwiperItem } from "@/components/shared/image-swiper";
import TimeSaleMenuPreviewImageViewer from "./image-viewer";
import { ITimeSaleMenu } from "@/models/timeSaleMenus";
import { UserPhotoType } from "@/models/users";
import TimeSaleMenuReservationTab from "./reservation-tab";
import TimeSaleMenuStoreMap from "./store-map";
import { getDefaultPreviewReservationDate } from "./reservation";
import { parseImageUrl } from "@/utils/image";

const appFont = localFont({
  src: "./assets/PretendardVariable.woff2",
  weight: "100 900",
  preload: false,
});
const DEFAULT_PROFILE = "/images/time-sale-menu-preview/default-profile.png";

// Mirrors Flutter ReviewSpecialMenuDetailPage's customer presentation and
// MeemongTypography/SemanticColors. Only saved admin detail data is rendered.
export default function TimeSaleMenuAppPreview({
  menu,
  photos = [],
  photosLoading = false,
  photosError = false,
  onRetryPhotos,
}: {
  menu: ITimeSaleMenu;
  photos?: UserPhotoType[];
  photosLoading?: boolean;
  photosError?: boolean;
  onRetryPhotos?: () => void;
}) {
  const [selectedTab, setSelectedTab] = useState<"designer" | "reservation">(
    "designer",
  );
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);
  const tabBarRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const topBarRef = useRef<HTMLDivElement>(null);
  const portfolio = photos.filter(
    (photo) =>
      photo.fileType === ("portfolio" satisfies UserFileType) &&
      photo.s3Path?.trim(),
  );
  const storePhotos = photos.filter(
    (photo) =>
      photo.fileType === ("shop" satisfies UserFileType) &&
      photo.s3Path?.trim(),
  );
  const [imageIndex, setImageIndex] = useState(0);
  const [viewer, setViewer] = useState<{
    images: ImageSwiperItem[];
    initialIndex: number;
    returnFocusTo: HTMLButtonElement;
  } | null>(null);
  const openViewer = (
    images: ImageSwiperItem[],
    initialIndex: number,
    returnFocusTo: HTMLButtonElement,
  ) => setViewer({ images, initialIndex, returnFocusTo });
  const [isScrolled, setScrolled] = useState(false);
  const images = [...(menu.images ?? [])]
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .filter((image) => image.imageUrl?.trim())
    .map((image) => ({ id: image.id, src: parseImageUrl(image.imageUrl) }));
  if (!images.length && menu.thumbnailImageUrl?.trim()) {
    images.push({ id: menu.id, src: parseImageUrl(menu.thumbnailImageUrl) });
  }
  const currentIndex = Math.min(imageIndex, Math.max(0, images.length - 1));
  const discountRate =
    menu.originalPrice > 0 && menu.discountPrice < menu.originalPrice
      ? Math.round(
          ((menu.originalPrice - menu.discountPrice) / menu.originalPrice) *
            100,
        )
      : null;
  const storeName = menu.designer?.companyName?.trim() || "매장명 미등록";
  const designerName = menu.designer?.displayName?.trim() || "디자이너";
  const address = [menu.designer?.address, menu.designer?.address2]
    .map((value) => value?.trim())
    .filter(Boolean)
    .join(" ");
  const treatmentLabel = formatTimeSaleMenuAppTreatmentType(menu.treatmentType);
  const treatment = [treatmentLabel, menu.cutOption?.trim()]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        className={`${appFont.className} relative min-h-0 flex-1 overflow-hidden rounded-[24px] border border-[#DFE2E7] bg-white text-[#2F343C] shadow-sm`}
      >
        <div className="h-full" inert={viewer !== null}>
          <div
            ref={topBarRef}
            className={`pointer-events-none absolute inset-x-0 top-0 z-10 flex h-12 items-center px-4 ${isScrolled ? "bg-white" : "bg-gradient-to-b from-black/40 to-transparent"}`}
            aria-hidden="true"
          >
            <Image
              src="/images/time-sale-menu-preview/icon_chevron_left_line.svg"
              alt=""
              width={24}
              height={24}
              className={isScrolled ? "" : "brightness-0 invert"}
            />
          </div>
          <div
            className="h-full overflow-y-auto overscroll-contain [scrollbar-width:none]"
            onScroll={(event) =>
              // Derive the app bar transition from the rendered photo and toolbar sizes.
              setScrolled(
                event.currentTarget.scrollTop >=
                  (heroRef.current?.offsetHeight ?? 0) -
                    (topBarRef.current?.offsetHeight ?? 0),
              )
            }
          >
            <div
              ref={heroRef}
              className="relative aspect-square w-full bg-[#F8F9FB]"
            >
              <button
                type="button"
                className="relative block h-full w-full"
                aria-label="메뉴 사진 확대"
                disabled={!images.length}
                onClick={(event) =>
                  openViewer(images, currentIndex, event.currentTarget)
                }
              >
                <PreviewPhoto
                  key={images[currentIndex]?.src ?? "default"}
                  src={images[currentIndex]?.src ?? DEFAULT_PROFILE}
                  alt={menu.name}
                />
              </button>
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    aria-label="이전 메뉴 사진"
                    className="absolute left-2 top-1/2 rounded-full bg-black/30 p-1 text-white"
                    onClick={() =>
                      setImageIndex(
                        (currentIndex - 1 + images.length) % images.length,
                      )
                    }
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    type="button"
                    aria-label="다음 메뉴 사진"
                    className="absolute right-2 top-1/2 rounded-full bg-black/30 p-1 text-white"
                    onClick={() =>
                      setImageIndex((currentIndex + 1) % images.length)
                    }
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
              {!!images.length && (
                <span className="absolute bottom-4 right-4 rounded-full bg-black/50 px-2 py-1 text-xs leading-4 text-white">
                  {currentIndex + 1} / {images.length}
                </span>
              )}
            </div>
            <div className="p-4">
              <div className="flex items-start gap-3">
                <h4 className="min-w-0 flex-1 whitespace-pre-wrap break-words text-[18px] font-semibold leading-[26px]">
                  {menu.name}
                </h4>
                <Image
                  src="/images/time-sale-menu-preview/icon_heart_line.svg"
                  alt="찜하기 (미리보기)"
                  width={24}
                  height={24}
                  className="mt-px mx-1 shrink-0"
                />
              </div>
              <p className="mt-[10px] text-[16px] leading-6 text-[#99A2AD] line-through">
                {menu.originalPrice.toLocaleString("ko-KR")} 원
              </p>
              <div className="flex items-baseline gap-1">
                {discountRate !== null && (
                  <span className="text-[20px] font-semibold leading-[30px] text-[#FF3452]">
                    {discountRate}%
                  </span>
                )}
                <span className="text-[20px] font-bold leading-[30px] text-[#1D2024]">
                  {menu.discountPrice.toLocaleString("ko-KR")}
                </span>
                <span className="text-[16px] leading-6 text-[#525A66]">원</span>
              </div>
              {menu.description?.trim() && (
                <p className="mt-3 whitespace-pre-wrap break-words text-[14px] leading-5 text-[#525A66]">
                  {menu.description.trim()}
                </p>
              )}
              <dl className="mt-3 space-y-2 rounded-xl bg-[#F8F9FB] p-3 text-[14px]">
                <div className="flex">
                  <dt className="w-[68px] shrink-0 font-semibold leading-[22px] text-[#99A2AD]">
                    매장명
                  </dt>
                  <dd className="min-w-0 break-words leading-5 text-[#525A66]">
                    {storeName}
                  </dd>
                </div>
                <div className="flex">
                  <dt className="w-[68px] shrink-0 font-semibold leading-[22px] text-[#99A2AD]">
                    시술 종류
                  </dt>
                  <dd className="min-w-0 break-words leading-5 text-[#525A66]">
                    {treatment}
                  </dd>
                </div>
              </dl>
            </div>
            <div
              ref={tabBarRef}
              className="sticky top-12 scroll-mt-12 z-10 mx-4 flex bg-white border-b border-[#EFF1F4] text-center text-[16px] font-semibold leading-6"
              aria-label="앱 탭 미리보기"
            >
              {(
                [
                  ["designer", "디자이너 정보"],
                  ["reservation", "예약하기"],
                ] as const
              ).map(([tab, label]) => (
                <button
                  key={tab}
                  type="button"
                  aria-pressed={selectedTab === tab}
                  className={`flex-1 py-3 ${selectedTab === tab ? "border-b-2 border-[#2F343C]" : "text-[#525A66]"}`}
                  onClick={() => setSelectedTab(tab)}
                >
                  {label}
                </button>
              ))}
            </div>
            {selectedTab === "reservation" ? (
              <TimeSaleMenuReservationTab
                slots={menu.reservationSlots ?? []}
                selectedDate={
                  selectedDate ??
                  getDefaultPreviewReservationDate(menu.reservationSlots ?? [])
                }
                selectedSlotId={selectedSlotId}
                onDateChange={(date) => {
                  setSelectedDate(date);
                  setSelectedSlotId(null);
                }}
                onSlotChange={setSelectedSlotId}
              />
            ) : (
              <>
                <div className="flex items-center gap-2 p-4">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full">
                    <PreviewPhoto
                      src={
                        menu.designer?.profilePictureURL
                          ? parseImageUrl(menu.designer.profilePictureURL)
                          : DEFAULT_PROFILE
                      }
                      alt="디자이너 프로필"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[18px] font-semibold leading-[26px]">
                      {designerName}
                    </p>
                    <p className="truncate text-[14px] leading-5 text-[#525A66]">
                      {address.split(/\s+/).slice(0, 2).join(" ")}
                    </p>
                  </div>
                </div>
                <div className="h-2 bg-[#F8F9FB]" />
                {photosLoading ? (
                  <p role="status" className="p-4 text-sm text-[#99A2AD]">
                    사진을 불러오는 중입니다.
                  </p>
                ) : photosError ? (
                  <div role="alert" className="p-4 text-sm text-[#99A2AD]">
                    사진을 불러오지 못했습니다.{" "}
                    <button
                      type="button"
                      onClick={onRetryPhotos}
                      className="underline"
                    >
                      다시 시도
                    </button>
                  </div>
                ) : (
                  !!portfolio.length && (
                    <section className="border-b border-[#EFF1F4] p-4">
                      <h5 className="mb-2 text-[16px] font-semibold leading-6">
                        포트폴리오
                      </h5>
                      <PreviewGallery photos={portfolio} onOpen={openViewer} />
                    </section>
                  )
                )}
                <div className="p-4 pb-24">
                  <h5 className="mb-2 text-[16px] font-semibold leading-6">
                    매장 정보
                  </h5>
                  <p className="text-[14px] font-semibold leading-[22px] text-[#525A66]">
                    {storeName}
                  </p>
                  <p className="mt-1 rounded-[10px] border border-[#EFF1F4] p-3 text-[14px] leading-5 text-[#525A66]">
                    {address || "주소 정보가 없습니다."}
                  </p>
                  <TimeSaleMenuStoreMap
                    lat={menu.designer?.lat}
                    lng={menu.designer?.lng}
                  />
                  {!!storePhotos.length && (
                    <div className="mt-2">
                      <PreviewGallery
                        photos={storePhotos}
                        horizontal
                        onOpen={openViewer}
                      />
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
          {selectedTab === "designer" ? (
            <div className="absolute inset-x-0 bottom-0 flex justify-end p-4 pt-1 pointer-events-none">
              <button
                type="button"
                className="pointer-events-auto flex h-12 items-center gap-2 rounded-full border border-[#DFE2E7] bg-white px-5 text-[16px] font-semibold leading-6"
                onClick={() => {
                  setSelectedTab("reservation");
                  tabBarRef.current?.scrollIntoView({
                    block: "start",
                    behavior: "smooth",
                  });
                }}
              >
                예약 하기
                <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            <div className="absolute inset-x-0 bottom-0 bg-white p-4 pt-1">
              <button
                type="button"
                disabled
                className={`h-12 w-full rounded-xl text-[16px] font-semibold ${selectedSlotId === null ? "bg-[#DFE2E7] text-[#99A2AD]" : "bg-[#1D2024] text-white"}`}
              >
                예약 진행
              </button>
            </div>
          )}
        </div>
        {viewer && (
          <TimeSaleMenuPreviewImageViewer
            images={viewer.images}
            initialIndex={viewer.initialIndex}
            returnFocusTo={viewer.returnFocusTo}
            onClose={() => setViewer(null)}
          />
        )}
      </div>
    </div>
  );
}

function PreviewPhoto({ src, alt }: { src: string; alt: string }) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  return (
    <Image
      src={failedSrc === src ? DEFAULT_PROFILE : src}
      alt={alt}
      fill
      unoptimized
      sizes="375px"
      className="object-cover"
      onError={() => setFailedSrc(src)}
    />
  );
}

function PreviewGallery({
  photos,
  horizontal = false,
  onOpen,
}: {
  photos: UserPhotoType[];
  horizontal?: boolean;
  onOpen: (
    images: ImageSwiperItem[],
    initialIndex: number,
    trigger: HTMLButtonElement,
  ) => void;
}) {
  const images = photos.map((photo) => ({
    id: photo.id,
    src: parseImageUrl(photo.s3Path),
  }));
  return (
    <>
      <div
        className={horizontal ? "flex gap-[2px]" : "grid grid-cols-3 gap-[2px]"}
      >
        {(horizontal ? images.slice(0, 3) : images).map((image, index) => (
          <button
            type="button"
            key={image.id}
            aria-label={`${horizontal ? "매장" : "포트폴리오"} 사진 ${index + 1} 확대`}
            onClick={(event) => onOpen(images, index, event.currentTarget)}
            className={`relative overflow-hidden ${horizontal ? "h-[113px] min-w-0 flex-1" : "aspect-square"}`}
          >
            <PreviewPhoto
              src={image.src}
              alt={`${horizontal ? "매장" : "포트폴리오"} 사진 ${index + 1}`}
            />
          </button>
        ))}
      </div>
    </>
  );
}
