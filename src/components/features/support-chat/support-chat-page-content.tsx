"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  collection,
  doc,
  endAt,
  getDoc,
  getDocs,
  limit,
  startAt,
  where,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  Image as ImageIcon,
  Search,
  Send,
} from "lucide-react";
import {
  ensureSupportAdminSession,
  supportDb,
  type SupportAdminIdentity,
} from "@/lib/firebase/support-chat";
import { uploadSupportChatAttachment } from "@/lib/firebase/support-chat-media";
import { cn } from "@/lib/utils";
import { AssigneePicker } from "./support-chat-assignee-picker";
import SupportChatCustomerInfoPanel from "./support-chat-customer-info-panel";
import SupportChatOutreachDialog from "./support-chat-outreach-dialog";
import SupportChatTemplateDialog from "./support-chat-template-dialog";
import {
  SUPPORT_CHAT_ASSIGNEES,
  canReply,
  isReadByCustomer,
  isSupportChatAssignee,
  matchesFilter,
  matchesSearch,
  mergeInboxRooms,
  operatorDisplayName,
  SUPPORT_CHAT_REPLY_MAX,
  parseAdminEvent,
  parseInboxRoom,
  parseMessage,
  relativeTime,
  roomSubtitle,
  roomTitle,
  splitBold,
  unreadBadge,
  type SupportAdminEvent,
  type SupportChatAssignee,
  type SupportChatMessage,
  type SupportInboxFilter,
  type SupportInboxRoom,
  parseRoomLinkParam,
} from "./support-chat-model";

// 목록·대화는 페이지 단위로 늘려 받는다(끝까지 스크롤하면 다음 페이지).
const INBOX_PAGE = 100;
const MESSAGE_PAGE = 100;
const SEARCH_LIMIT = 50;

function useMediaQuery(media: string): boolean {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const list = window.matchMedia(media);
    const update = () => setMatches(list.matches);
    update();
    list.addEventListener("change", update);
    return () => list.removeEventListener("change", update);
  }, [media]);
  return matches;
}

function useDocumentVisible(): boolean {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const update = () => setVisible(document.visibilityState === "visible");
    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);
  return visible;
}

type MobileView = "list" | "chat" | "info";

/**
 * 상담함. 레이아웃·수치는 어드민 프로토타입(Admin-Inbox 외)을 따른다.
 * 프로토타입과 다른 점(사용자 결정 2026-11-11): 담당자 미배정 선택·필터 없음, 메시지 내용
 * 검색 없음, 먼저 연락하기는 팝업 모달, 제목 없음, 보유 몽 없음(어드민 API 미제공).
 */
export default function SupportChatPageContent() {
  const [admin, setAdmin] = useState<SupportAdminIdentity | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [rooms, setRooms] = useState<SupportInboxRoom[]>([]);
  const [filter, setFilter] = useState<SupportInboxFilter>("all");
  const [keyword, setKeyword] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [view, setView] = useState<MobileView>("list");
  const [now, setNow] = useState(() => new Date());
  const [outreachOpen, setOutreachOpen] = useState(false);

  useEffect(() => {
    ensureSupportAdminSession()
      .then(setAdmin)
      .catch((error: unknown) =>
        setSessionError(error instanceof Error ? error.message : String(error)),
      );
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  const [inboxLimit, setInboxLimit] = useState(INBOX_PAGE);
  const [searchRooms, setSearchRooms] = useState<SupportInboxRoom[]>([]);
  const [searchLimit, setSearchLimit] = useState(SEARCH_LIMIT);
  const [selectedLive, setSelectedLive] = useState<SupportInboxRoom | null>(
    null,
  );
  const isMd = useMediaQuery("(min-width: 768px)");
  const isXl = useMediaQuery("(min-width: 1280px)");
  const documentVisible = useDocumentVisible();

  useEffect(() => {
    setInboxLimit(INBOX_PAGE);
    setSearchLimit(SEARCH_LIMIT);
  }, [filter, keyword]);

  useEffect(() => {
    // 슬랙 알림의 '상담함에서 열기'는 ?room=<방 ID>로 들어온다. 목록 페이지 밖의 방도
    // 선택한 방 구독(selectedLive)으로 불러온다.
    const roomId = parseRoomLinkParam(window.location.search);
    if (roomId) openRoom(roomId);
    // 최초 진입 때만 읽는다.
  }, []);

  useEffect(() => {
    // 선택한 방은 상담함 문서를 직접 구독한다. 검색으로만 찾은 방도 담당자·읽음 변경이
    // 바로 반영돼야 답장 입력 가능 여부가 어긋나지 않는다.
    if (!admin || !selectedId) {
      setSelectedLive(null);
      return;
    }
    return onSnapshot(doc(supportDb, "supportInbox", selectedId), (snapshot) =>
      setSelectedLive(
        snapshot.exists() ? parseInboxRoom(snapshot.id, snapshot.data()) : null,
      ),
    );
  }, [admin, selectedId]);

  useEffect(() => {
    if (!admin) return;
    // 한 목록, 고객·운영자 상관없이 마지막 메시지 시각 내림차순(Notion). 담당자 필터는
    // 내려받은 범위가 아니라 서버 쿼리로 걸러 오래된 방도 찾을 수 있게 한다.
    const inbox = collection(supportDb, "supportInbox");
    const constraints =
      filter === "all"
        ? [orderBy("lastMessageAt", "desc"), limit(inboxLimit)]
        : [
            where("assigneeName", "==", filter),
            orderBy("lastMessageAt", "desc"),
            limit(inboxLimit),
          ];
    return onSnapshot(
      query(inbox, ...constraints),
      (snapshot) =>
        setRooms(snapshot.docs.map((d) => parseInboxRoom(d.id, d.data()))),
      (error) =>
        setSessionError(`상담함을 불러오지 못했습니다: ${error.message}`),
    );
  }, [admin, filter, inboxLimit]);

  useEffect(() => {
    // 내려받지 않은 오래된 방도 찾도록 서버에서도 검색한다. 회원번호는 방을 직접 조회하고,
    // 닉네임은 앞부분 일치로 찾는다(Firestore는 중간 글자 검색을 지원하지 않는다).
    const value = keyword.trim();
    if (!admin || !value) {
      setSearchRooms([]);
      return;
    }
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const found: SupportInboxRoom[] = [];
        if (/^\d+$/.test(value)) {
          const snapshot = await getDoc(
            doc(supportDb, "supportInbox", `member_${value}`),
          );
          if (snapshot.exists())
            found.push(parseInboxRoom(snapshot.id, snapshot.data()));
        } else {
          // 담당자 필터도 검색 쿼리에 걸고, 끝까지 스크롤하면 searchLimit을 늘려 더 받는다.
          const snapshot = await getDocs(
            query(
              collection(supportDb, "supportInbox"),
              ...(filter === "all"
                ? []
                : [where("assigneeName", "==", filter)]),
              orderBy("profile.displayName"),
              startAt(value),
              endAt(`${value}\uf8ff`),
              limit(searchLimit),
            ),
          );
          snapshot.docs.forEach((d) =>
            found.push(parseInboxRoom(d.id, d.data())),
          );
        }
        if (!cancelled) setSearchRooms(found);
      } catch {
        if (!cancelled) setSearchRooms([]);
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [admin, keyword, filter, searchLimit]);

  const unreadRoomCount = rooms.filter(
    (room) => room.inboxUnreadCount > 0,
  ).length;
  useEffect(() => {
    // 탭 제목은 안 읽은 메시지 수가 아니라 안 읽은 방 수(Notion 어드민 알림).
    document.title =
      unreadRoomCount > 0 ? `(${unreadRoomCount}) 상담함` : "상담함";
  }, [unreadRoomCount]);

  const allRooms = useMemo(() => {
    return mergeInboxRooms(searchRooms, rooms, selectedLive);
  }, [rooms, searchRooms, selectedLive]);
  const visibleRooms = useMemo(
    () =>
      allRooms.filter(
        (room) => matchesFilter(room, filter) && matchesSearch(room, keyword),
      ),
    [allRooms, filter, keyword],
  );
  const selected = allRooms.find((room) => room.roomId === selectedId) ?? null;
  // 대화 패널이 실제로 화면에 보일 때만 읽음 처리한다(모바일에서 목록으로 돌아가면 숨김).
  const chatVisible =
    documentVisible &&
    (view === "chat" || (isMd && view === "list") || (isXl && view === "info"));

  const openRoom = (roomId: string) => {
    setSelectedId(roomId);
    setView("chat");
  };

  if (sessionError) {
    return <p className="p-6 text-[14px] text-red-600">{sessionError}</p>;
  }
  if (!admin)
    return <p className="p-6 text-[14px] text-[#6b7480]">운영자 확인 중…</p>;

  return (
    <div className="flex h-[calc(100dvh-53px)] min-h-0 bg-white text-[#1d2024] tracking-[-0.3px] md:h-screen">
      <section
        className={cn(
          "min-h-0 w-full flex-col border-r border-[#eff1f4] md:flex md:w-[344px] md:flex-none",
          view === "list" ? "flex" : "hidden",
        )}
      >
        <div className="flex flex-col gap-3 px-4 pb-3 pt-[18px]">
          <div className="flex items-center justify-between">
            <h1 className="text-[18px] font-bold">상담함</h1>
            <button
              type="button"
              onClick={() => setOutreachOpen(true)}
              className="hidden h-[34px] items-center gap-1.5 whitespace-nowrap rounded-lg bg-[#1d2024] pl-2.5 pr-3 text-[13px] font-semibold text-white md:flex"
            >
              <Send className="size-3.5" aria-hidden />
              먼저 연락하기
            </button>
          </div>
          <label className="flex h-9 items-center gap-2 rounded-lg bg-[#f4f5f7] px-3">
            <Search className="size-4 text-[#99a2ad]" aria-hidden />
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="닉네임, 회원번호 검색"
              aria-label="닉네임, 회원번호 검색"
              className="min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder:text-[#99a2ad]"
            />
          </label>
        </div>
        <div className="flex gap-1.5 border-b border-[#eff1f4] px-4 py-2.5">
          <FilterChip
            label={filter === "all" ? "담당자" : filter}
            options={[
              { value: "all", label: "전체" },
              ...SUPPORT_CHAT_ASSIGNEES.map((name) => ({
                value: name,
                label: name,
              })),
            ]}
            value={filter}
            onChange={(value) => setFilter(value as SupportInboxFilter)}
          />
          {/* 정렬은 마지막 메시지 시각 내림차순 하나뿐이다(Notion·프로토타입). */}
          <FilterChip
            label="최근 메시지 순"
            options={[{ value: "recent", label: "최근 메시지 순" }]}
            value="recent"
            onChange={() => undefined}
          />
        </div>
        <ul
          className="min-h-0 flex-1 overflow-y-auto"
          onScroll={(event) => {
            const el = event.currentTarget;
            if (el.scrollTop + el.clientHeight < el.scrollHeight - 120) return;
            if (keyword.trim()) {
              if (searchRooms.length >= searchLimit)
                setSearchLimit((value) => value + SEARCH_LIMIT);
            } else if (rooms.length >= inboxLimit) {
              setInboxLimit((value) => value + INBOX_PAGE);
            }
          }}
        >
          {visibleRooms.length === 0 && (
            <li className="p-6 text-center text-[13px] text-[#99a2ad]">
              문의가 없습니다.
            </li>
          )}
          {visibleRooms.map((room) => (
            <li key={room.roomId}>
              <InboxItem
                room={room}
                now={now}
                selected={room.roomId === selectedId}
                onClick={() => openRoom(room.roomId)}
              />
            </li>
          ))}
        </ul>
      </section>

      {selected ? (
        <>
          <SupportChatRoomPanel
            key={selected.roomId}
            room={selected}
            admin={admin}
            now={now}
            visible={chatVisible}
            className={
              view === "chat"
                ? "flex"
                : view === "info"
                  ? "hidden xl:flex"
                  : "hidden md:flex"
            }
            onBack={() => setView("list")}
            onShowInfo={() => setView("info")}
          />
          <SupportChatCustomerInfoPanel
            room={selected}
            className={
              view === "info"
                ? "flex w-full md:w-[296px]"
                : "hidden xl:flex xl:w-[296px]"
            }
            onBack={() => setView("chat")}
          />
        </>
      ) : (
        <section className="hidden flex-1 items-center justify-center md:flex">
          <p className="text-[14px] text-[#99a2ad]">대화를 선택하세요.</p>
        </section>
      )}

      <SupportChatOutreachDialog
        open={outreachOpen}
        onOpenChange={setOutreachOpen}
        admin={admin}
        onSent={openRoom}
      />
    </div>
  );
}

function FilterChip({
  label,
  options,
  value,
  onChange,
  warn = false,
  className,
}: {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  warn?: boolean;
  className?: string;
}) {
  return (
    <label
      className={cn(
        "relative flex h-7 items-center gap-0.5 whitespace-nowrap rounded-md border pl-2.5 pr-2 text-[12px] text-[#2f343c]",
        warn ? "border-red-400 text-red-600" : "border-[#dfe2e7]",
        className,
      )}
    >
      {label}
      <ChevronDown className="size-3 text-[#6b7480]" aria-hidden />
      <select
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="absolute inset-0 cursor-pointer opacity-0"
      >
        {value === "" && <option value="" disabled />}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

/** 프로토타입 CmpInboxItem(데스크톱 344×72). */
function InboxItem({
  room,
  now,
  selected,
  onClick,
}: {
  room: SupportInboxRoom;
  now: Date;
  selected: boolean;
  onClick: () => void;
}) {
  const badge = unreadBadge(room.inboxUnreadCount);
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full flex-col gap-1.5 border-b border-[#f1f2f4] px-4 py-3 text-left",
        selected
          ? "bg-[#f5f9ff] shadow-[inset_3px_0_0_#0079ff]"
          : "bg-white hover:bg-[#fafbfc]",
      )}
    >
      <div className="flex w-full items-center gap-1.5">
        <span
          className={cn(
            "truncate text-[14px]",
            badge ? "font-bold" : "font-medium",
          )}
        >
          {roomTitle(room)}
        </span>
        <span className="flex-none text-[12px] text-[#6b7480]">
          {roomSubtitle(room)}
        </span>
        <span className="ml-auto flex-none text-[12px] text-[#99a2ad]">
          {relativeTime(room.lastMessageAt, now)}
        </span>
      </div>
      <div className="flex w-full items-center gap-1">
        {room.operatorInitiated && <FlagTag />}
        <span className="ml-0.5 min-w-0 flex-1 truncate text-[13px] text-[#525a66]">
          {room.lastMessagePreview}
        </span>
        {badge && (
          <span
            aria-label={`안 읽은 메시지 ${room.inboxUnreadCount}개`}
            className="flex h-[18px] min-w-[18px] flex-none items-center justify-center rounded-full bg-[#d92d20] px-[5px] text-[11px] font-bold text-white"
          >
            {badge}
          </span>
        )}
      </div>
    </button>
  );
}

function FlagTag() {
  return (
    <span className="flex-none whitespace-nowrap rounded bg-[#f1edff] px-1.5 py-0.5 text-[11px] font-semibold text-[#5b3fd1]">
      운영팀 발신
    </span>
  );
}

type TimelineItem =
  | { kind: "message"; at: number; message: SupportChatMessage }
  | { kind: "event"; at: number; event: SupportAdminEvent };

function formatTime(date: Date | null, now: Date): string {
  if (!date) return "";
  const hm = date.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  if (date.toDateString() === now.toDateString()) return hm;
  return `${date.getMonth() + 1}.${date.getDate()} ${hm}`;
}

function SupportChatRoomPanel({
  room,
  admin,
  now,
  visible,
  className,
  onBack,
  onShowInfo,
}: {
  room: SupportInboxRoom;
  admin: SupportAdminIdentity;
  now: Date;
  visible: boolean;
  className: string;
  onBack: () => void;
  onShowInfo: () => void;
}) {
  const [messages, setMessages] = useState<SupportChatMessage[]>([]);
  const [events, setEvents] = useState<SupportAdminEvent[]>([]);
  const [customerReadAt, setCustomerReadAt] = useState<Date | null>(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [templateOpen, setTemplateOpen] = useState(false);
  const [messageLimit, setMessageLimit] = useState(MESSAGE_PAGE);
  const fileInput = useRef<HTMLInputElement>(null);
  const bottom = useRef<HTMLDivElement>(null);
  const roomRef = useMemo(
    () => doc(supportDb, "supportRooms", room.roomId),
    [room.roomId],
  );
  const assignee = isSupportChatAssignee(room.assigneeName)
    ? room.assigneeName
    : null;
  const replyable = canReply(room);

  useEffect(() => {
    const unsubscribers = [
      onSnapshot(
        query(
          collection(roomRef, "messages"),
          orderBy("createdAt", "desc"),
          limit(messageLimit),
        ),
        (snapshot) =>
          setMessages(
            snapshot.docs
              .map((d) => parseMessage(d.id, d.data()))
              .filter((m): m is SupportChatMessage => m != null),
          ),
      ),
      onSnapshot(
        query(
          collection(roomRef, "adminEvents"),
          orderBy("createdAt", "desc"),
          limit(50),
        ),
        (snapshot) =>
          setEvents(
            snapshot.docs
              .map((d) => parseAdminEvent(d.id, d.data()))
              .filter((e): e is SupportAdminEvent => e != null),
          ),
      ),
      onSnapshot(roomRef, (snapshot) => {
        const value = snapshot.data()?.customerReadAt;
        setCustomerReadAt(value?.toDate ? value.toDate() : null);
      }),
    ];
    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }, [roomRef, messageLimit]);

  // 누구든 열면 읽음. 기획은 '배정 후엔 담당자가 열어야 읽음'이지만 어드민이 공용 계정이라
  // 여는 사람을 구분할 수 없다(사용자 결정 2026-11-11). 사람별 계정이 생기면 담당자 기준으로 바꾼다.
  useEffect(() => {
    if (!visible || room.inboxUnreadCount === 0) return;
    updateDoc(doc(supportDb, "supportInbox", room.roomId), {
      inboxReadAt: serverTimestamp(),
      inboxReadBy: admin.adminId,
    }).catch((e: Error) => setError(`읽음 처리 실패: ${e.message}`));
  }, [visible, room.inboxUnreadCount, room.roomId, admin.adminId]);

  const timeline = useMemo<TimelineItem[]>(() => {
    const items: TimelineItem[] = [
      ...messages.map((message) => ({
        kind: "message" as const,
        at: message.createdAt?.getTime() ?? Date.now(),
        message,
      })),
      ...events.map((event) => ({
        kind: "event" as const,
        at: event.createdAt?.getTime() ?? Date.now(),
        event,
      })),
    ];
    return items.sort((a, b) => a.at - b.at);
  }, [messages, events]);

  // 새 메시지가 오면 맨 아래로, 이전 대화를 더 불러온 경우에는 보던 위치를 지킨다.
  const latestId = messages[0]?.id;
  useEffect(() => {
    bottom.current?.scrollIntoView({ block: "end" });
  }, [latestId, events.length]);

  const operatorFields = () => ({
    sender: "operator",
    operatorId: admin.adminId,
    operatorName: operatorDisplayName(room, admin.adminName),
    createdAt: serverTimestamp(),
  });

  const send = async () => {
    const text = draft.trim();
    if (!text || sending || !replyable) return;
    setSending(true);
    setError(null);
    const ref = doc(collection(roomRef, "messages"));
    try {
      // 담당자가 지정된 방이면 담당자가 아니어도 답장할 수 있다(Notion 상담 응대 + 담당자 필수).
      await setDoc(ref, {
        messageId: ref.id,
        type: "text",
        text,
        ...operatorFields(),
      });
      setDraft("");
    } catch (e) {
      setError(`전송 실패: ${(e as Error).message}`);
    } finally {
      setSending(false);
    }
  };

  const sendFiles = async (files: FileList | null) => {
    if (!files || files.length === 0 || !replyable) return;
    setSending(true);
    setError(null);
    try {
      // 고른 순서대로 한 개당 메시지 1건.
      for (const file of Array.from(files)) {
        const ref = doc(collection(roomRef, "messages"));
        const attachment = await uploadSupportChatAttachment(
          room.roomId,
          ref.id,
          file,
        );
        await setDoc(ref, {
          messageId: ref.id,
          ...attachment,
          ...operatorFields(),
        });
      }
    } catch (e) {
      setError(`첨부 전송 실패: ${(e as Error).message}`);
    } finally {
      setSending(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  };

  const assign = async (assigneeName: SupportChatAssignee) => {
    setError(null);
    try {
      await updateDoc(doc(supportDb, "supportInbox", room.roomId), {
        assigneeName,
        assignedAt: serverTimestamp(),
        assignedBy: admin.adminId,
      });
    } catch (e) {
      setError(`담당자 변경 실패: ${(e as Error).message}`);
    }
  };

  const subtitle =
    room.kind === "guest"
      ? "로그아웃 상태 문의"
      : `회원번호 ${room.memberUserId ?? ""}`;

  return (
    <section className={cn("min-h-0 min-w-0 flex-1 flex-col", className)}>
      {/* 데스크톱 헤더(72px): 이름·역할·회원번호 + 담당자 선택 */}
      <header className="hidden h-[72px] flex-none items-center gap-3 border-b border-[#eff1f4] px-5 md:flex">
        <button
          type="button"
          onClick={onShowInfo}
          className="flex min-w-0 flex-1 flex-col gap-1 text-left xl:pointer-events-none"
        >
          <span className="flex items-center gap-2">
            <span className="whitespace-nowrap text-[16px] font-bold">
              {roomTitle(room)}
            </span>
            <span className="whitespace-nowrap text-[13px] text-[#6b7480]">
              {roomSubtitle(room)}
            </span>
          </span>
          <span className="truncate text-[12px] text-[#6b7480]">
            {subtitle}
          </span>
        </button>
        <AssigneePicker
          value={assignee}
          onChange={(name) => void assign(name)}
        />
      </header>
      {/* 모바일 헤더(56px) + 담당자 바(48px) */}
      <header className="flex h-14 flex-none items-center gap-0.5 border-b border-[#eff1f4] px-1 md:hidden">
        <button
          type="button"
          aria-label="목록으로 돌아가기"
          onClick={onBack}
          className="flex size-11 items-center justify-center"
        >
          <ChevronLeft className="size-5" />
        </button>
        <button
          type="button"
          onClick={onShowInfo}
          className="flex min-w-0 flex-1 flex-col gap-0.5 text-left"
        >
          <span className="flex items-center gap-1.5 text-[16px] font-bold">
            {roomTitle(room)}
            <ChevronRight className="size-4 text-[#6b7480]" aria-hidden />
          </span>
          <span className="truncate text-[12px] text-[#6b7480]">
            {subtitle}
          </span>
        </button>
      </header>
      <div className="flex h-12 flex-none items-center border-b border-[#eff1f4] px-4 md:hidden">
        <AssigneePicker
          value={assignee}
          onChange={(name) => void assign(name)}
          variant="mobile"
          align="left"
        />
      </div>

      <div
        className="flex min-h-0 flex-1 flex-col gap-3.5 overflow-y-auto p-4 md:p-5"
        onScroll={(event) => {
          if (
            event.currentTarget.scrollTop < 80 &&
            messages.length >= messageLimit
          ) {
            setMessageLimit((value) => value + MESSAGE_PAGE);
          }
        }}
      >
        {timeline.map((item) =>
          item.kind === "event" ? (
            <div key={`e-${item.event.id}`} className="self-center">
              <span className="inline-flex whitespace-nowrap rounded-full bg-[#f8f9fb] px-3 py-1.5 text-[12px] text-[#525a66]">
                {item.event.toName
                  ? `${item.event.toName} 님이 담당자로 지정됐어요`
                  : "담당자가 변경됐어요"}{" "}
                · {formatTime(item.event.createdAt, now)}
              </span>
            </div>
          ) : (
            <MessageBubble
              key={item.message.id}
              message={item.message}
              time={formatTime(item.message.createdAt, now)}
              read={isReadByCustomer(item.message, customerReadAt)}
            />
          ),
        )}
        <div ref={bottom} />
      </div>

      <footer className="flex-none border-t border-[#eff1f4] px-3 pb-7 pt-2 md:px-5 md:pb-4 md:pt-0">
        <label htmlFor="admin-reply" className="sr-only">
          답장
        </label>
        <textarea
          id="admin-reply"
          value={draft}
          disabled={!replyable}
          maxLength={SUPPORT_CHAT_REPLY_MAX}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && (event.metaKey || event.ctrlKey))
              void send();
          }}
          placeholder={
            replyable
              ? "고객에게 보낼 답장을 입력하세요"
              : "담당자를 지정하면 답장할 수 있어요"
          }
          className="h-[72px] w-full resize-none rounded-lg border border-[#dfe2e7] px-3 py-2.5 text-[14px] leading-[1.5] outline-none focus:border-[#5a4b8a] disabled:bg-[#f8f9fb] md:mt-2.5"
        />
        <div className="mt-2.5 flex items-center gap-1.5">
          <input
            ref={fileInput}
            type="file"
            accept="image/*,video/*"
            multiple
            className="hidden"
            onChange={(event) => void sendFiles(event.target.files)}
          />
          <button
            type="button"
            disabled={!replyable}
            onClick={() => setTemplateOpen(true)}
            className="flex h-[30px] flex-none items-center gap-1.5 whitespace-nowrap rounded-md border border-[#dfe2e7] px-2.5 text-[12px] text-[#2f343c] disabled:opacity-50"
          >
            <FileText className="size-3.5" aria-hidden />
            템플릿
          </button>
          <button
            type="button"
            disabled={!replyable || sending}
            onClick={() => fileInput.current?.click()}
            className="flex h-[30px] flex-none items-center gap-1.5 whitespace-nowrap rounded-md border border-[#dfe2e7] px-2.5 text-[12px] text-[#2f343c] disabled:opacity-50"
          >
            <ImageIcon className="size-3.5" aria-hidden />
            사진
          </button>
          <span
            className={cn(
              "ml-auto min-w-0 truncate text-[12px]",
              error || !replyable ? "text-red-600" : "text-[#6b7480]",
            )}
          >
            {error ??
              (!replyable
                ? "담당자를 먼저 지정하세요"
                : draft.length > 0
                  ? `${draft.length} / ${SUPPORT_CHAT_REPLY_MAX}`
                  : "보내면 고객에게 바로 전달돼요")}
          </span>
          <button
            type="button"
            onClick={() => void send()}
            disabled={sending || draft.trim().length === 0 || !replyable}
            className="h-9 flex-none whitespace-nowrap rounded-lg bg-[#1d2024] px-[18px] text-[14px] font-semibold text-white disabled:opacity-40"
          >
            보내기
          </button>
        </div>
      </footer>
      <SupportChatTemplateDialog
        open={templateOpen}
        onOpenChange={setTemplateOpen}
        // 작성 중 내용이 있으면 뒤에 이어 붙인다(Notion 답변 템플릿).
        onInsert={(content) =>
          setDraft((current) =>
            (current.trim() ? `${current}\n${content}` : content).slice(
              0,
              SUPPORT_CHAT_REPLY_MAX,
            ),
          )
        }
      />
    </section>
  );
}

/** 프로토타입 CmpBubble: 고객 왼쪽 회색, 운영팀 오른쪽 검정 + 보낸 사람·읽음, 챗봇은 '자동 응답'. */
function MessageBubble({
  message,
  time,
  read,
}: {
  message: SupportChatMessage;
  time: string;
  read: boolean;
}) {
  const bot = message.sender === "bot";
  const mine = message.sender === "operator" || bot;
  const body =
    message.type === "image" && message.imageUrl ? (
      <a href={message.imageUrl} target="_blank" rel="noreferrer">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={message.imageUrl}
          alt="첨부 사진"
          className="size-[140px] rounded-[10px] object-cover"
        />
      </a>
    ) : message.type === "video" && message.videoUrl ? (
      <video
        src={message.videoUrl}
        controls
        preload="metadata"
        className="max-h-[320px] w-[240px] rounded-[10px] bg-black"
      />
    ) : (
      <div
        className={cn(
          "max-w-[360px] whitespace-pre-wrap break-words px-3.5 py-[11px] text-[14px] leading-[1.5]",
          bot
            ? "rounded-[14px_4px_14px_14px] border border-dashed border-[#c9ced6] bg-white text-[#525a66]"
            : mine
              ? "rounded-[14px_4px_14px_14px] bg-[#262524] text-white"
              : "rounded-[4px_14px_14px_14px] bg-[#f4f4f4]",
        )}
      >
        {bot
          ? splitBold(message.text ?? "").map((part, index) =>
              part.bold ? (
                <b key={index}>{part.text}</b>
              ) : (
                <React.Fragment key={index}>{part.text}</React.Fragment>
              ),
            )
          : message.text}
      </div>
    );
  return (
    <div
      className={cn("flex flex-col gap-1", mine ? "items-end" : "items-start")}
    >
      {bot ? (
        <span className="text-[11px] text-[#6b7480]">자동 응답</span>
      ) : (
        mine &&
        message.operatorName && (
          <span className="text-[11px] text-[#6b7480]">
            {message.operatorName}
          </span>
        )
      )}
      <div className={cn("flex items-end gap-1.5", mine && "flex-row-reverse")}>
        {body}
        <span className="flex flex-col items-end whitespace-nowrap text-[11px] leading-[1.4] text-[#99a2ad]">
          {mine && !bot && read && <span className="text-[#0060cc]">읽음</span>}
          {time}
        </span>
      </div>
    </div>
  );
}
