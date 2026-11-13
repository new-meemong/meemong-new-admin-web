import { useState } from "react";
import Image from "next/image";
import AppPreviewStoreMap from "@/components/shared/app-preview/store-map";
import type {
  UserDesignerInfo,
  UserProfileDetailTarget,
} from "@/models/user-profile";
import {
  getPreviewReservationDates,
  reservationTimeMinutes,
} from "@/components/features/contents/time-sale-menu-app-preview/reservation";
import {
  Empty,
  Gallery,
  price,
  ProfileTabs,
  safeProfileLink,
  Section,
} from "./shared";

function Availability({ info }: { info: UserDesignerInfo }) {
  const [dates] = useState(() => getPreviewReservationDates());
  const hours = info.designerInfoStoreHourList ?? [];
  const slots = info.designerInfoReservationSlotList ?? [];
  const available = (day: string) =>
    hours.find((hour) => hour.dayOfWeek === day)?.isOpen !== false &&
    slots.some((slot) => slot.dayOfWeek === day);
  const [selected, setSelected] = useState<string | null>(null);
  const day =
    selected && available(selected)
      ? selected
      : (dates.find((date) => available(date.dayOfWeek))?.dayOfWeek ??
        dates[0].dayOfWeek);
  const hour = hours.find((hour) => hour.dayOfWeek === day);
  const starts = new Set<number>();
  slots
    .filter((slot) => slot.dayOfWeek === day)
    .forEach((slot) => {
      const start = reservationTimeMinutes(slot.startTime);
      const end = reservationTimeMinutes(slot.endTime);
      if (start == null) return;
      if (end == null || end <= start) starts.add(start);
      else
        for (let time = start; time + 30 <= end; time += 30) starts.add(time);
    });
  const open = hour?.openTime ? reservationTimeMinutes(hour.openTime) : null;
  const close = hour?.closeTime ? reservationTimeMinutes(hour.closeTime) : null;
  const candidates =
    hour?.isOpen && open != null && close != null && close > open
      ? Array.from(
          { length: Math.floor((close - open) / 30) },
          (_, index) => open + index * 30,
        )
      : [...starts].sort((a, b) => a - b);
  return (
    <Section title="예약 가능 시간">
      {!slots.length ? (
        <Empty />
      ) : (
        <>
          <div className="mb-3 flex gap-1">
            {dates.map((date) => (
              <button
                type="button"
                key={date.key}
                disabled={!available(date.dayOfWeek)}
                aria-pressed={day === date.dayOfWeek}
                onClick={() => setSelected(date.dayOfWeek)}
                className={`flex h-[66px] flex-1 flex-col items-center justify-center gap-1 rounded-lg text-[12px] disabled:text-[#D4D7DE] ${day === date.dayOfWeek ? "bg-[#EFF1F4]" : ""}`}
              >
                <span>{date.label}</span>
                <span className="text-[18px] font-semibold">{date.date}</span>
              </button>
            ))}
          </div>
          {hour?.isOpen === false ? (
            <Empty>휴무일입니다.</Empty>
          ) : candidates.length ? (
            ["오전", "오후"].map((period, index) => {
              const times = candidates.filter((time) =>
                index === 0 ? time < 720 : time >= 720,
              );
              return times.length ? (
                <div key={period} className="mb-3">
                  <h4 className="mb-2 text-[14px] font-semibold">{period}</h4>
                  <div className="grid grid-cols-4 gap-2">
                    {times.map((time) => (
                      <span
                        key={time}
                        className={`flex h-10 items-center justify-center rounded-lg border text-[14px] ${starts.has(time) ? "border-[#DFE2E7]" : "border-[#EFF1F4] bg-[#F8F9FB] text-[#B7BCC7]"}`}
                      >
                        {String(Math.floor(time / 60)).padStart(2, "0")}:
                        {String(time % 60).padStart(2, "0")}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null;
            })
          ) : (
            <Empty>예약 가능한 시간이 없습니다.</Empty>
          )}
        </>
      )}
    </Section>
  );
}

export default function DesignerProfile({
  info,
  onOpenDetail,
}: {
  info: UserDesignerInfo | null | undefined;
  onOpenDetail: (target: UserProfileDetailTarget) => void;
}) {
  const [tab, setTab] = useState("메뉴");
  const [menuTab, setMenuTab] = useState("모델시술");
  const address = [info?.address, info?.address2].filter(Boolean).join(" ");
  const reservationUrl = safeProfileLink(
    info?.storeReservationUrl || info?.storelink,
  );
  return (
    <>
      <div className="mt-5">
        <ProfileTabs
          labels={["포트폴리오", "예약안내", "메뉴"]}
          value={tab}
          onChange={setTab}
        />
      </div>
      <div role="tabpanel" aria-label={tab}>
        {tab === "포트폴리오" && (
          <Gallery label="포트폴리오" images={info?.portfolioImageList ?? []} />
        )}
        {tab === "예약안내" && (
          <>
            {info ? (
              <Availability info={info} />
            ) : (
              <Section title="예약 가능 시간">
                <Empty />
              </Section>
            )}
            <Section title="예약 방법 안내">
              {info?.storeReservationNotice ? (
                <p className="whitespace-pre-wrap break-words text-[14px] leading-[22px]">
                  {info.storeReservationNotice}
                </p>
              ) : (
                <Empty />
              )}
              {reservationUrl && (
                <a
                  href={reservationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 block rounded-lg border border-[#DFE2E7] p-3 text-center text-[14px]"
                >
                  {info?.storeReservationPlatformName || "매장"} 예약 링크
                </a>
              )}
            </Section>
            <Section title="매장 정보">
              <p className="text-[16px] font-semibold">
                {info?.companyName || "매장명 정보 없음"}
              </p>
              <p className="my-2 text-[14px] text-[#525A66]">
                {address || "주소 정보 없음"}
              </p>
              <AppPreviewStoreMap lat={info?.lat} lng={info?.lng} />
              <div className="mt-3">
                <Gallery
                  horizontal
                  images={info?.shopImageList ?? []}
                  label="매장 사진"
                />
              </div>
            </Section>
          </>
        )}
        {tab === "메뉴" && (
          <>
            <ProfileTabs
              label="메뉴 종류"
              variant="square"
              labels={["모델시술", "리뷰특가"]}
              value={menuTab}
              onChange={setMenuTab}
            />
            <div className="px-4 py-2">
              {menuTab === "모델시술" &&
                (info?.modelTreatmentMenuList?.length ? (
                  info.modelTreatmentMenuList.map((menu) => (
                    <button
                      type="button"
                      key={menu.id}
                      onClick={() =>
                        onOpenDetail({ kind: "model-treatment", id: menu.id })
                      }
                      className="flex w-full gap-3 border-b border-[#EFF1F4] py-3 text-left"
                    >
                      {menu.imageList?.[0]?.imageURL ? (
                        <Image
                          src={menu.imageList[0].imageURL}
                          unoptimized
                          width={96}
                          height={96}
                          alt={menu.title || "모델시술"}
                          className="h-24 w-24 shrink-0 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="h-24 w-24 shrink-0 rounded-xl bg-[#F8F9FB]" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[16px]">
                          {menu.title ||
                            menu.categoryList?.join(", ") ||
                            menu.category ||
                            "모델시술"}
                        </p>
                        {menu.activated === false || menu.activated === 0 ? (
                          <span className="text-[11px] text-[#99A2AD]">
                            비활성
                          </span>
                        ) : null}
                        <p className="mt-1 text-[12px] text-[#99A2AD]">
                          {[menu.shootingType, menu.shootingUseType]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                        <p className="text-[12px] text-[#99A2AD]">
                          {[
                            ...(menu.reviewTypeList ?? []),
                            menu.reviewTypeDescription,
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                        <p className="mt-2 text-[14px] font-semibold">
                          {[menu.priceType, price(menu.price)]
                            .filter(Boolean)
                            .join(" · ") || "가격 정보 없음"}
                        </p>
                      </div>
                    </button>
                  ))
                ) : (
                  <Empty>아직 등록된 내용이 없어요</Empty>
                ))}
              {menuTab === "리뷰특가" &&
                (info?.timeSaleMenuList?.length ? (
                  info.timeSaleMenuList.map((menu) => (
                    <button
                      type="button"
                      key={menu.id}
                      onClick={() =>
                        onOpenDetail({ kind: "time-sale", id: menu.id })
                      }
                      className="block w-full border-b border-[#EFF1F4] py-4 text-left"
                    >
                      <p className="text-[16px]">
                        {menu.name || menu.treatmentType || "리뷰특가"}
                      </p>
                      {menu.isActive === false && (
                        <span className="text-[11px] text-[#99A2AD]">
                          비활성
                        </span>
                      )}
                      <p className="mt-1 text-[12px] text-[#99A2AD]">
                        {menu.treatmentType}
                      </p>
                      <p className="mt-2 text-[14px]">
                        <del className="mr-2 text-[#99A2AD]">
                          {price(menu.originalPrice)}
                        </del>
                        <strong>
                          {price(menu.discountPrice) || "가격 정보 없음"}
                        </strong>
                      </p>
                    </button>
                  ))
                ) : (
                  <Empty>아직 등록된 내용이 없어요</Empty>
                ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
