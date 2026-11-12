"use client";

import React from "react";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGetUserDetailQuery } from "@/queries/users";
import { useDrawer } from "@/stores/drawer";
import UserRightDrawer from "@/components/features/user/user-right-drawer";
import ImageBox from "@/components/shared/image-box";
import { parseImageUrl } from "@/utils/image";
import {
  formatDeviceLabel,
  roleLabel,
  roomTitle,
  type SupportInboxRoom,
} from "./support-chat-model";

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 text-[13px]">
      <span className="shrink-0 text-[#6b7480]">{label}</span>
      <span className="min-w-0 break-words text-right text-[#1d2024]">
        {value}
      </span>
    </div>
  );
}

/** 프로토타입 고객 정보 패널(296px). 비회원은 기기·앱 버전만(Admin-Guest). */
export default function SupportChatCustomerInfoPanel({
  room,
  className,
  onBack,
}: {
  room: SupportInboxRoom;
  className: string;
  onBack: () => void;
}) {
  const userId = room.memberUserId ? Number(room.memberUserId) : undefined;
  const { openDrawer } = useDrawer();
  const { data, refetch } = useGetUserDetailQuery(userId, {
    enabled: room.kind === "member" && userId != null,
    retry: false,
  });
  // 회원 상세 API의 profilePictureURL은 설정 이미지·캐시를 우선해 해석된 결과다.
  const profileImage =
    room.kind === "member" ? data?.profilePictureURL?.trim() : null;
  const name =
    room.kind === "guest" ? "비회원" : data?.displayName || roomTitle(room);
  const role =
    room.profile?.role ??
    (data?.role === 1 ? "MODEL" : data?.role === 2 ? "DESIGNER" : null);
  const appVersion = room.device?.appVersion
    ? `${room.device.platform === "ios" ? "iOS" : "Android"} ${room.device.appVersion}`
    : "-";

  return (
    <aside
      className={cn(
        "min-h-0 flex-none flex-col gap-[22px] overflow-y-auto border-l border-[#eff1f4] p-5",
        className,
      )}
    >
      <div className="-mx-4 -mt-4 flex h-14 items-center xl:hidden">
        <button
          type="button"
          aria-label="채팅으로 돌아가기"
          onClick={onBack}
          className="flex size-11 items-center justify-center"
        >
          <ChevronLeft className="size-5" />
        </button>
        <span className="mr-11 flex-1 text-center text-[17px] font-semibold">
          고객 정보
        </span>
      </div>
      <div className="flex flex-col gap-3.5">
        <div className="flex items-center gap-2.5">
          {profileImage ? (
            <div
              role="button"
              tabIndex={0}
              aria-label={`${name} 프로필 이미지 확대`}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  event.currentTarget
                    .querySelector<HTMLElement>(".image-box")
                    ?.click();
                }
              }}
            >
              <ImageBox
                key={`${room.roomId}:${profileImage}`}
                src={profileImage}
                alt={`${name} 프로필 이미지`}
                width={44}
                height={44}
                className="rounded-full [&_img]:h-full [&_img]:w-full"
                images={[{ src: parseImageUrl(profileImage), title: name }]}
              />
            </div>
          ) : (
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#eff1f4] text-[14px] font-bold text-[#6b7480]">
              {room.kind === "guest" ? "?" : name.slice(0, 1)}
            </span>
          )}
          <button
            type="button"
            disabled={room.kind !== "member" || userId == null}
            onClick={openDrawer}
            aria-label={
              room.kind === "member" ? `${name} 회원 상세 보기` : undefined
            }
            className="flex min-w-0 flex-1 flex-col gap-0.5 text-left enabled:cursor-pointer enabled:hover:underline"
          >
            <span className="text-[15px] font-bold">{name}</span>
            <span className="text-[12px] text-[#6b7480]">
              {room.kind === "guest"
                ? "로그아웃 상태에서 문의했어요"
                : roleLabel(role) || "-"}
            </span>
          </button>
        </div>
        {room.kind === "guest" ? (
          <>
            <div className="rounded-lg bg-[#fff7ed] p-3 text-[12px] leading-[1.6] text-[#9a3b00]">
              로그인하지 않은 상태라 회원 정보를 불러올 수 없어요.
            </div>
            <div className="flex flex-col gap-2">
              <InfoRow label="기기" value={formatDeviceLabel(room.device)} />
              <InfoRow label="앱 버전" value={room.device?.appVersion ?? "-"} />
            </div>
          </>
        ) : (
          <div className="flex flex-col gap-2">
            <InfoRow label="회원 유형" value={roleLabel(role) || "-"} />
            <InfoRow label="회원번호" value={room.memberUserId ?? "-"} />
            <InfoRow label="지역" value={data?.address?.trim() || "-"} />
            <InfoRow label="연락처" value={data?.phone?.trim() || "-"} />
            <InfoRow
              label="가입일"
              value={
                data?.createdAt
                  ? data.createdAt.slice(0, 10).replaceAll("-", ".")
                  : "-"
              }
            />
            <InfoRow label="앱 버전" value={appVersion} />
            <InfoRow
              label="이용 제한"
              value={data == null ? "-" : data.isBlocked ? "있음" : "없음"}
            />
          </div>
        )}
      </div>
      {room.kind === "member" && userId != null && (
        <UserRightDrawer
          userId={userId}
          onRefresh={() => {
            void refetch();
          }}
        />
      )}
    </aside>
  );
}
