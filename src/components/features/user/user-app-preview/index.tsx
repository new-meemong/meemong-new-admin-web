"use client";

import { useState } from "react";
import localFont from "next/font/local";
import {
  ChevronLeft,
  Heart,
  MoreHorizontal,
  Link as LinkIcon,
} from "lucide-react";
import type { IUserForm } from "@/models/users";
import type { UserProfileDetailTarget } from "@/models/user-profile";
import ModelProfile from "./model-profile";
import DesignerProfile from "./designer-profile";
import { Gallery, safeProfileLink } from "./shared";

const pretendard = localFont({
  src: "../../contents/time-sale-menu-app-preview/assets/PretendardVariable.woff2",
  display: "swap",
});

export default function UserAppPreview({
  user,
  onOpenDetail,
}: {
  user: IUserForm;
  onOpenDetail: (target: UserProfileDetailTarget) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [linksOpen, setLinksOpen] = useState(false);
  const designer = user.role === 2 || user.role === 4;
  const profileUnavailable = designer
    ? user.designerInfo === undefined
    : user.modelInfo === undefined;
  const info = user.designerInfo;
  const model = user.modelInfo;
  const address = designer
    ? [info?.address, info?.address2].filter(Boolean).join(" ")
    : model?.address;
  const description = designer ? info?.description : null;
  const links = (user.snsInfoList ?? [])
    .map((link) => ({ label: link.type, href: safeProfileLink(link.value) }))
    .filter((link) => link.href);
  const storeLink = safeProfileLink(
    info?.storeReservationUrl || info?.storelink,
  );
  if (designer && storeLink)
    links.push({
      label: info?.storeReservationPlatformName || "매장 예약",
      href: storeLink,
    });
  const reserving =
    !designer && (model?.isHairReserving || model?.isBeautyReserving);
  return (
    <div
      className={`${pretendard.className} relative flex min-h-0 w-[375px] flex-col overflow-hidden rounded-[24px] border border-[#DFE2E7] bg-white text-[#2F343C] shadow-sm`}
    >
      <header
        className="flex h-14 shrink-0 items-center justify-between px-4"
        aria-label="프로필"
      >
        <ChevronLeft aria-hidden className="h-6 w-6" />
        <span className="text-[16px] font-semibold">
          {designer ? "디자이너 프로필" : `${user.displayName} 모델`}
        </span>
        <MoreHorizontal aria-hidden className="h-6 w-6" />
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {reserving && (
          <p className="bg-[#F4F0FF] px-5 py-3 text-center text-[14px] text-[#7556D9]">
            {model?.isHairReserving && model?.isBeautyReserving
              ? "헤어/뷰티"
              : model?.isHairReserving
                ? "헤어"
                : "뷰티"}{" "}
            시술 예약중인 고객입니다
          </p>
        )}
        <div className="px-4 pt-5">
          <div className="flex items-start gap-2">
            {user.profilePictureURL ? (
              <div className="h-[60px] w-[60px] shrink-0 [&_img]:rounded-full [&_div[aria-label]]:grid-cols-1">
                <Gallery
                  images={[{ id: user.id, imageURL: user.profilePictureURL }]}
                  label="프로필 사진"
                />
              </div>
            ) : (
              <div className="h-[60px] w-[60px] shrink-0 rounded-full bg-[#EFF1F4]" />
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-[18px] font-semibold leading-7">
                  {user.displayName}
                </h2>
                {links.length > 0 && (
                  <button
                    type="button"
                    aria-label="프로필 링크"
                    aria-expanded={linksOpen}
                    onClick={() => setLinksOpen(!linksOpen)}
                  >
                    <LinkIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
              {designer && info?.companyName && (
                <p className="mt-1 text-[12px] text-[#525A66]">
                  {info.companyName}
                </p>
              )}
              <p className="mt-1 text-[12px] leading-[18px] text-[#99A2AD]">
                {[!designer ? user.sex : null, address]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
            <Heart aria-hidden className="mt-1 h-6 w-6 text-[#99A2AD]" />
          </div>
          {linksOpen && (
            <div className="mt-3 space-y-2">
              {links.map((link, index) => (
                <a
                  key={`${link.href}-${index}`}
                  href={link.href!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-lg border p-2 text-[14px]"
                >
                  {link.label}
                </a>
              ))}
            </div>
          )}
          {description && (
            <div className="mt-4 text-[14px] leading-[22px]">
              <p
                className={`whitespace-pre-wrap break-words ${expanded ? "" : "line-clamp-2"}`}
              >
                {description}
              </p>
              <button
                type="button"
                aria-expanded={expanded}
                className="text-[#99A2AD]"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? "접기" : "더보기"}
              </button>
            </div>
          )}
        </div>
        {profileUnavailable ? (
          <p
            role="status"
            className="px-5 py-8 text-center text-[14px] text-[#99A2AD]"
          >
            추가 프로필 정보를 불러오지 못했습니다. 다시 조회해주세요.
          </p>
        ) : designer ? (
          <DesignerProfile info={info} onOpenDetail={onOpenDetail} />
        ) : (
          <ModelProfile info={model} onOpenDetail={onOpenDetail} />
        )}
      </div>
    </div>
  );
}
