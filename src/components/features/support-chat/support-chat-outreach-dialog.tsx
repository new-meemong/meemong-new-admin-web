"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { userAPI } from "@/apis/user";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  supportDb,
  type SupportAdminIdentity,
} from "@/lib/firebase/support-chat";
import type { IUser, IUserForm, UserListRoleType } from "@/models/users";
import { getUserRole } from "@/utils/user";
import { AssigneePicker } from "./support-chat-assignee-picker";
import { useSupportChatTemplates } from "./support-chat-template-dialog";
import {
  detectSearchType,
  roleLabel,
  type SupportChatAssignee,
  type SupportCustomerRole,
} from "./support-chat-model";

const CONTENT_MAX = 1000;
const RESULT_SIZE = 20;
const AVATAR_COLORS = [
  { bg: "#d9e4f0", fg: "#33506e" },
  { bg: "#efe4d6", fg: "#6b4f33" },
  { bg: "#e3f6ec", fg: "#08804a" },
];

interface OutreachCandidate {
  user: IUser;
  role: SupportCustomerRole | null;
  /** 회원 목록 API에는 연락처가 없어 상세 API로 채운다. 실패하면 null. */
  phone: string | null;
}

function toRole(role: IUser["role"]): SupportCustomerRole | null {
  const value = getUserRole(role);
  return value === "MODEL" || value === "DESIGNER" ? value : null;
}

/**
 * 운영팀 먼저 연락(프로토타입 Admin-Outbound를 팝업 모달로). 탈퇴 회원 제외 검색 →
 * 담당자·내용 → 기존 방에 이어서 발송. 제목은 쓰지 않는다(사용자 결정 2026-11-11). 방이 없으면 방·담당자·공지를 한 batch로
 * 만든다(Rules가 같은 batch 결과로 담당자를 확인). 템플릿을 선택해 내용을 채울 수 있다.
 */
export default function SupportChatOutreachDialog({
  open,
  onOpenChange,
  admin,
  onSent,
  recipient,
}: {
  recipient?: IUserForm;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  admin: SupportAdminIdentity;
  onSent: (roomId: string) => void;
}) {
  const [role, setRole] = useState<UserListRoleType | "ALL">("ALL");
  const [keyword, setKeyword] = useState("");
  const [searchedKeyword, setSearchedKeyword] = useState("");
  const [results, setResults] = useState<OutreachCandidate[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [selectedMember, setMember] = useState<OutreachCandidate | null>(null);
  const member = useMemo(
    () =>
      recipient
        ? {
            user: recipient,
            role: toRole(recipient.role),
            phone: recipient.phone || null,
          }
        : selectedMember,
    [recipient, selectedMember],
  );
  const [assignee, setAssignee] = useState<SupportChatAssignee | null>(null);
  const [content, setContent] = useState("");
  const [templateId, setTemplateId] = useState("");
  const templates = useSupportChatTemplates(open);

  // 템플릿을 고르면 내용을 채운다. 작성 중 내용을 바꿀 때는 확인하고,
  // '선택 안 함'으로 바꿔도 입력한 내용은 유지한다(Notion 발신 템플릿).
  const chooseTemplate = (id: string) => {
    if (!id) {
      setTemplateId("");
      return;
    }
    const template = templates.find((t) => t.id === id);
    if (!template) return;
    if (
      content.trim() &&
      content !== template.content &&
      !window.confirm("작성 중인 내용을 템플릿으로 바꿀까요?")
    )
      return;
    setTemplateId(id);
    setContent(template.content.slice(0, CONTENT_MAX));
  };
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const value = keyword.trim();
    if (!open || member || !value) {
      setResults(null);
      return;
    }
    let cancelled = false;
    const timer = setTimeout(async () => {
      setSearching(true);
      setError(null);
      try {
        const searchType = detectSearchType(value);
        const page = await userAPI.getAll({
          searchType,
          searchKeyword:
            searchType === "PHONE" ? value.replace(/-/g, "") : value,
          ...(role === "ALL" ? {} : { role }),
          page: 1,
          size: RESULT_SIZE,
        });
        const users = page.content.filter(
          (user: IUser) => user.isWithdraw !== true,
        );
        const details = await Promise.allSettled(
          users.map((user) => userAPI.getById(user.id)),
        );
        if (cancelled) return;
        setResults(
          users.map((user, index) => {
            const detail = details[index];
            return {
              user,
              role: toRole(user.role),
              phone:
                detail.status === "fulfilled" && detail.value?.phone
                  ? detail.value.phone
                  : null,
            };
          }),
        );
        setSearchedKeyword(value);
      } catch (e) {
        if (!cancelled) setError(`회원 검색 실패: ${(e as Error).message}`);
      } finally {
        if (!cancelled) setSearching(false);
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [keyword, role, open, member]);

  const reset = () => {
    setMember(null);
    setKeyword("");
    setResults(null);
    setContent("");
    setTemplateId("");
    setError(null);
  };

  const canSend =
    member != null &&
    member.user.isWithdraw !== true &&
    (member.user.role === 1 || member.user.role === 2) &&
    assignee != null &&
    content.trim().length > 0 &&
    !sending;

  const send = async () => {
    if (!canSend || !member || !assignee) return;
    setSending(true);
    setError(null);
    const memberUserId = String(member.user.id);
    const roomId = `member_${memberUserId}`;
    const roomRef = doc(supportDb, "supportRooms", roomId);
    const inboxRef = doc(supportDb, "supportInbox", roomId);
    const messageRef = doc(collection(roomRef, "messages"));
    try {
      const [room, inbox] = await Promise.all([
        getDoc(roomRef),
        getDoc(inboxRef),
      ]);
      const batch = writeBatch(supportDb);
      if (!room.exists()) {
        batch.set(roomRef, {
          roomId,
          kind: "member",
          ownerUid: memberUserId,
          memberUserId,
          createdAt: serverTimestamp(),
          // 문의 전이라 앱이 기록한 요약이 없으므로 검색 결과로 목록 표시용 요약을 채운다.
          ...(member.role
            ? {
                profile: {
                  displayName: (member.user.displayName ?? "").slice(0, 40),
                  role: member.role,
                },
              }
            : {}),
        });
      }
      const assignment = {
        assigneeName: assignee,
        assignedAt: serverTimestamp(),
        assignedBy: admin.adminId,
      };
      if (!inbox.exists()) {
        batch.set(inboxRef, { roomId, ...assignment });
      } else if (inbox.data().assigneeName !== assignee) {
        batch.update(inboxRef, assignment);
      }
      batch.set(messageRef, {
        messageId: messageRef.id,
        sender: "operator",
        type: "notice",
        text: content.trim(),
        operatorId: admin.adminId,
        // 공용 어드민 계정이라 작성자 대신 지정한 담당자 이름으로 표시한다.
        operatorName: assignee,
        createdAt: serverTimestamp(),
      });
      await batch.commit();
      onSent(roomId);
      onOpenChange(false);
      reset();
    } catch (e) {
      setError(`발송 실패: ${(e as Error).message}`);
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] w-[640px] max-w-[calc(100vw-32px)] sm:max-w-[640px] flex-col gap-0 overflow-hidden p-0 tracking-[-0.3px] text-[#1d2024]">
        <div className="flex h-[72px] flex-none items-center gap-2 border-b border-[#eff1f4] px-8">
          <DialogTitle className="text-[18px] font-bold">
            먼저 연락하기
          </DialogTitle>
          <DialogDescription className="text-[13px] text-[#6b7480]">
            고객의 미몽 운영팀 채팅방으로 메시지를 보내요
          </DialogDescription>
        </div>
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-8 py-5">
          <div className="flex flex-col gap-2">
            <span className="text-[13px] font-bold text-[#2f343c]">
              받는 회원
            </span>
            {member ? (
              <div className="flex items-center gap-2.5 rounded-lg bg-[#f8f9fb] px-3 py-2.5">
                <MemberAvatar candidate={member} index={0} />
                <span className="flex-1 text-[14px] font-semibold">
                  {member.user.displayName}{" "}
                  <span className="text-[12px] font-normal text-[#6b7480]">
                    {[roleLabel(member.role), member.user.id, member.phone]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                </span>
                {!recipient && (
                  <button
                    type="button"
                    onClick={() => setMember(null)}
                    className="text-[13px] text-[#6b7480]"
                  >
                    변경
                  </button>
                )}
              </div>
            ) : (
              <div className="relative">
                <div className="flex h-10 items-center gap-2 rounded-lg border border-[#dfe2e7] px-3 focus-within:border-[#5a4b8a] focus-within:shadow-[0_0_0_3px_#efedf6]">
                  <select
                    aria-label="회원 유형"
                    value={role}
                    onChange={(event) =>
                      setRole(
                        event.target.value === "ALL"
                          ? "ALL"
                          : (Number(event.target.value) as UserListRoleType),
                      )
                    }
                    className="bg-transparent text-[13px] text-[#525a66] outline-none"
                  >
                    <option value="ALL">전체</option>
                    <option value={1}>모델</option>
                    <option value={2}>디자이너</option>
                  </select>
                  <Search
                    className="size-4 flex-none text-[#99a2ad]"
                    aria-hidden
                  />
                  <input
                    autoFocus
                    value={keyword}
                    onChange={(event) => setKeyword(event.target.value)}
                    placeholder="닉네임, 회원번호, 연락처로 검색"
                    aria-label="받는 회원 검색"
                    className="min-w-0 flex-1 bg-transparent text-[14px] outline-none placeholder:text-[#99a2ad]"
                  />
                </div>
                {results != null && (
                  <div
                    role="listbox"
                    aria-label="회원 검색 결과"
                    className="absolute left-0 right-0 top-[46px] z-10 flex max-h-[320px] flex-col gap-0.5 overflow-y-auto rounded-[10px] border border-[#dfe2e7] bg-white p-1.5 shadow-[0_12px_32px_rgba(17,20,24,.14)]"
                  >
                    <span className="px-3 pb-1 pt-1.5 text-[12px] text-[#6b7480]">
                      {searching ? "검색 중…" : `검색 결과 ${results.length}명`}
                    </span>
                    {results.map((candidate, index) => (
                      <button
                        key={candidate.user.id}
                        type="button"
                        role="option"
                        aria-selected={false}
                        onClick={() => setMember(candidate)}
                        className="flex items-center gap-2.5 rounded-md px-3 py-2.5 text-left hover:bg-[#f5f4fa]"
                      >
                        <MemberAvatar candidate={candidate} index={index} />
                        <span className="min-w-0 flex-1 text-[14px] font-semibold">
                          <Highlighted
                            text={candidate.user.displayName ?? ""}
                            keyword={searchedKeyword}
                          />{" "}
                          <span className="text-[12px] font-normal text-[#6b7480]">
                            {roleLabel(candidate.role) || "-"} ·{" "}
                            <Highlighted
                              text={String(candidate.user.id)}
                              keyword={searchedKeyword}
                            />
                            {candidate.phone && (
                              <>
                                {" "}
                                ·{" "}
                                <Highlighted
                                  text={candidate.phone}
                                  keyword={searchedKeyword.replace(/-/g, "")}
                                />
                              </>
                            )}
                          </span>
                        </span>
                      </button>
                    ))}
                    <div className="mx-1.5 my-1 h-px bg-[#f1f2f4]" />
                    <span className="px-3 pb-2 pt-1.5 text-[12px] leading-[1.5] text-[#6b7480]">
                      탈퇴한 회원은 나오지 않아요.
                    </span>
                  </div>
                )}
              </div>
            )}
            <span className="text-[12px] text-[#6b7480]">
              회원마다 운영팀 채팅방은 하나라, 이전 대화에 이어서 보내져요.
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="text-[13px] font-bold text-[#2f343c]">
                템플릿
              </span>
              <span className="relative flex h-10 items-center justify-between rounded-lg border border-[#dfe2e7] px-3 text-[14px]">
                <span
                  className={cn(
                    "truncate",
                    templateId ? "text-[#1d2024]" : "text-[#6b7480]",
                  )}
                >
                  {templates.find((t) => t.id === templateId)?.name ??
                    "선택 안 함"}
                </span>
                <ChevronDown className="size-4 text-[#6b7480]" aria-hidden />
                <select
                  aria-label="템플릿"
                  value={templateId}
                  onChange={(event) => chooseTemplate(event.target.value)}
                  className="absolute inset-0 cursor-pointer opacity-0"
                >
                  <option value="">선택 안 함</option>
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </span>
            </label>
            <div className="flex flex-col gap-2">
              <span className="text-[13px] font-bold text-[#2f343c]">
                담당자
              </span>
              <AssigneePicker
                value={assignee}
                onChange={setAssignee}
                placeholder="담당자 선택"
                align="left"
                className="w-full [&>button]:h-10 [&>button]:w-full"
              />
            </div>
          </div>

          <label className="flex flex-col gap-2">
            <span className="text-[13px] font-bold text-[#2f343c]">내용</span>
            <div className="overflow-hidden rounded-lg border border-[#dfe2e7] focus-within:border-[#5a4b8a]">
              <textarea
                value={content}
                maxLength={CONTENT_MAX}
                onChange={(event) => setContent(event.target.value)}
                placeholder="고객에게 보낼 내용을 입력하세요"
                className="block min-h-[140px] w-full resize-y p-3 text-[14px] leading-[1.6] outline-none placeholder:text-[#99a2ad]"
              />
              <div className="flex border-t border-[#f1f2f4] bg-[#fbfbfc] px-3 py-2 text-[12px] text-[#6b7480]">
                <span className="ml-auto">
                  {content.length} / {CONTENT_MAX}
                </span>
              </div>
            </div>
          </label>
          {error && <p className="text-[12px] text-red-600">{error}</p>}
        </div>
        <div className="flex h-[72px] flex-none items-center gap-2 border-t border-[#eff1f4] px-8">
          <span className="hidden min-w-0 truncate text-[12px] text-[#6b7480] sm:inline">
            보내면 목록 맨 위에 올라오고, 고객이 답장하면 안읽음으로 표시돼요
          </span>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="ml-auto h-10 flex-none whitespace-nowrap rounded-lg border border-[#dfe2e7] px-4 text-[14px] text-[#2f343c]"
          >
            취소
          </button>
          <button
            type="button"
            onClick={() => void send()}
            disabled={!canSend}
            className="h-10 flex-none whitespace-nowrap rounded-lg bg-[#1d2024] px-5 text-[14px] font-semibold text-white disabled:opacity-40"
          >
            보내기
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MemberAvatar({
  candidate,
  index,
}: {
  candidate: OutreachCandidate;
  index: number;
}) {
  const color = AVATAR_COLORS[index % AVATAR_COLORS.length];
  return (
    <span
      className="flex size-8 flex-none items-center justify-center rounded-full text-[13px] font-bold"
      style={{ background: color.bg, color: color.fg }}
    >
      {(candidate.user.displayName ?? "?").slice(0, 1)}
    </span>
  );
}

/**
 * 검색어 부분만 굵게 강조한다(프로토타입 #5a4b8a). 한 덩어리(span) 안에 이어 붙여야
 * 부모의 flex/grid gap이 조각 사이에 끼지 않는다('미테 애플'처럼 벌어져 보이던 문제).
 */
function Highlighted({ text, keyword }: { text: string; keyword: string }) {
  const needle = keyword.trim();
  const index = needle ? text.indexOf(needle) : -1;
  if (index < 0) return <span>{text}</span>;
  return (
    <span>
      {text.slice(0, index)}
      <b className="text-[#5a4b8a]">
        {text.slice(index, index + needle.length)}
      </b>
      {text.slice(index + needle.length)}
    </span>
  );
}
