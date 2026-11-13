import {
  modelHairLength,
  modelHopePrice,
  modelPersonalColor,
  modelShooting,
  modelReviews,
} from "./model-format";
import { useState } from "react";
import type {
  UserModelInfo,
  UserProfileDetailTarget,
} from "@/models/user-profile";
import {
  Chips,
  Empty,
  Gallery,
  profileDate,
  ProfileTabs,
  Section,
} from "./shared";

export function ModelProfileFacts({ info }: { info: UserModelInfo }) {
  const hope = info.modelInfoHopePrice;
  const shooting = info.modelInfoShootingType;
  return (
    <div className="grid grid-cols-2 gap-3 px-5 py-4 text-[13px] text-[#525A66]">
      {[
        ["선호비용", modelHopePrice(hope)],
        ["촬영", modelShooting(shooting)],
        ["모발길이", modelHairLength(info.hairLength)],
        ["모발타입", info.hairTexture],
      ].map(([label, value]) => (
        <div key={label}>
          <span className="text-[#99A2AD]">{label}</span>
          <p>{value || "정보 없음"}</p>
        </div>
      ))}
    </div>
  );
}
export default function ModelProfile({
  info,
  onOpenDetail,
}: {
  info: UserModelInfo | null | undefined;
  onOpenDetail: (target: UserProfileDetailTarget) => void;
}) {
  const [tab, setTab] = useState("이미지");
  const [postTab, setPostTab] = useState("헤어컨설팅");
  const posts =
    postTab === "헤어컨설팅"
      ? info?.hairConsultationList
      : info?.quickMatchingList;
  const updated = profileDate(info?.lastHairInfoUpdatedAt);
  const wanted = info?.modelInfoWantedStyle;
  const review = info?.modelInfoReviewType;
  return (
    <>
      {info && <ModelProfileFacts info={info} />}
      <ProfileTabs
        labels={["이미지", "고객정보", "작성한 글"]}
        value={tab}
        onChange={setTab}
      />
      <div role="tabpanel" aria-label={tab}>
        {tab === "이미지" && (
          <Gallery images={info?.modelImageList ?? []} label="모델 사진" />
        )}
        {tab === "고객정보" && (
          <>
            <Section
              title="헤어"
              trailing={
                updated ? (
                  <span className="text-[11px] text-[#99A2AD]">
                    {updated} 수정됨
                  </span>
                ) : null
              }
            >
              <dl className="space-y-3 rounded-md bg-[#F8F9FB] p-4 text-[14px]">
                {[
                  ["모발길이", modelHairLength(info?.hairLength)],
                  ["모발타입", info?.hairTexture],
                  ["헤어고민", info?.hairConcernList?.join(", ")],
                  [
                    "피부",
                    [
                      info?.skinBrightness,
                      modelPersonalColor(info?.personalColor),
                    ]
                      .filter(Boolean)
                      .join(" · "),
                  ],
                ].map(([label, value]) => (
                  <div key={label} className="flex gap-5">
                    <dt className="w-[60px] shrink-0 text-[#99A2AD]">
                      {label}
                    </dt>
                    <dd>{value || "정보 없음"}</dd>
                  </div>
                ))}
              </dl>
            </Section>
            <Section title="시술이력">
              {info?.modelInfoTreatmentHistoryList?.length ? (
                info.modelInfoTreatmentHistoryList.map((history) => (
                  <div
                    key={history.id}
                    className="mb-2 rounded border border-[#DFE2E7] p-4 text-[14px]"
                  >
                    <p className="text-[12px] text-[#99A2AD]">
                      {profileDate(history.treatmentDate) || "날짜 정보 없음"}
                    </p>
                    <p className="mt-1 font-semibold">
                      {history.treatmentType || "시술 정보 없음"}
                    </p>
                    <p className="mt-1 text-[#525A66]">
                      {[
                        history.isSelf === true || history.isSelf === 1
                          ? "셀프 시술"
                          : null,
                        history.treatmentArea,
                        history.decolorizationCount != null &&
                        history.decolorizationCount > 0
                          ? `탈색 ${history.decolorizationCount}회`
                          : null,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                ))
              ) : (
                <Empty />
              )}
            </Section>
            <Section title="원하는 스타일">
              {wanted?.imageList?.length ? (
                <Gallery
                  horizontal
                  label="원하는 스타일 사진"
                  images={wanted.imageList.map((image) => ({
                    id: image.id,
                    imageURL: image.imageUrl,
                  }))}
                />
              ) : null}
              {wanted?.description && (
                <p className="mt-2 whitespace-pre-wrap break-words text-[14px] leading-[22px]">
                  {wanted.description}
                </p>
              )}
              {!wanted?.description && !wanted?.imageList?.length && <Empty />}
            </Section>
            <Section title="관심시술">
              <Chips
                values={[
                  ...(info?.styleList ?? []),
                  ...(info?.facialList ?? []),
                ]}
              />
            </Section>
            <Section title="선호비용">
              <Chips
                values={[modelHopePrice(info?.modelInfoHopePrice ?? null)]}
              />
            </Section>
            <Section title="협찬">
              <Chips values={modelReviews(review ?? null)} />
            </Section>
          </>
        )}
        {tab === "작성한 글" && (
          <>
            <ProfileTabs
              label="작성 글 종류"
              variant="pill"
              labels={["헤어컨설팅", "빠른매칭"]}
              value={postTab}
              onChange={setPostTab}
            />
            <div className="px-5 py-3">
              {posts?.length ? (
                posts.map((post) => (
                  <button
                    key={post.id}
                    type="button"
                    className="block w-full border-b border-[#EFF1F4] py-4 text-left text-[14px]"
                    onClick={() =>
                      onOpenDetail({ kind: "consultation", id: post.id })
                    }
                  >
                    <span className="font-semibold">
                      {postTab} #{post.id}
                    </span>
                    {post.withdrawnAt && (
                      <span className="ml-2 rounded bg-[#EFF1F4] px-2 py-1 text-[11px]">
                        철회됨
                      </span>
                    )}
                    <p className="mt-2 text-[12px] text-[#99A2AD]">
                      {profileDate(post.createdAt) || "등록일 정보 없음"}
                    </p>
                  </button>
                ))
              ) : (
                <Empty>작성한 글이 없습니다.</Empty>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
