import type { DocumentData, Timestamp } from "firebase/firestore";

/** 담당자는 이 5명 중에서만 고른다(사용자 결정 2026-11-11, Rules 목록과 같아야 한다). */
export const SUPPORT_CHAT_ASSIGNEES = [
  "유주호",
  "유주혁",
  "문새한슬",
  "박목인",
  "임지훈",
] as const;
export type SupportChatAssignee = (typeof SUPPORT_CHAT_ASSIGNEES)[number];

/** 담당자 필터: 전체 / 운영자별(미배정 필터는 두지 않는다, 사용자 결정 2026-11-11). */
export type SupportInboxFilter = "all" | SupportChatAssignee;

export function isSupportChatAssignee(
  value: unknown,
): value is SupportChatAssignee {
  return (
    typeof value === "string" &&
    (SUPPORT_CHAT_ASSIGNEES as readonly string[]).includes(value)
  );
}

/** 프로토타입 담당자 아바타 색(CmpAssignee 드롭다운). 이름 뒤 두 글자를 이니셜로 쓴다. */
export const ASSIGNEE_AVATAR: Record<
  SupportChatAssignee,
  { bg: string; fg: string }
> = {
  유주호: { bg: "#e6f0ff", fg: "#0060cc" },
  유주혁: { bg: "#e3f6ec", fg: "#08804a" },
  문새한슬: { bg: "#fff1e6", fg: "#c24e00" },
  박목인: { bg: "#f1edff", fg: "#5b3fd1" },
  임지훈: { bg: "#fdecef", fg: "#c01048" },
};

export function assigneeInitials(name: string): string {
  return name.slice(-2);
}

export type SupportCustomerRole = "MODEL" | "DESIGNER";

export function roleLabel(
  role: SupportCustomerRole | null | undefined,
): string {
  if (role === "MODEL") return "모델";
  if (role === "DESIGNER") return "디자이너";
  return "";
}

export interface SupportInboxRoom {
  roomId: string;
  kind: "member" | "guest";
  memberUserId: string | null;
  lastMessageAt: Date | null;
  lastMessagePreview: string;
  lastMessageSender: "customer" | "operator" | null;
  operatorInitiated: boolean;
  inboxUnreadCount: number;
  assigneeName: string | null;
  device: { platform?: string; osVersion?: string; appVersion?: string } | null;
  /** 앱이 관리자채팅을 열 때 기록한 닉네임·역할 요약. 문의 전 먼저 연락한 회원은 없을 수 있다. */
  profile: { displayName: string; role: SupportCustomerRole } | null;
}

export interface SupportChatMessage {
  id: string;
  sender: "customer" | "operator" | "bot";
  /** faqMenu·faqQuestion·faqAnswer는 고객이 둘러본 챗봇 FAQ 흐름(어드민에는 '자동 응답'으로 표시). */
  type:
    | "text"
    | "image"
    | "video"
    | "notice"
    | "faqMenu"
    | "faqQuestion"
    | "faqAnswer";
  text: string | null;
  imageUrl: string | null;
  videoUrl: string | null;
  operatorName: string | null;
  createdAt: Date | null;
}

export interface SupportAdminEvent {
  id: string;
  type: "assigneeChanged";
  toName: string | null;
  createdAt: Date | null;
}

function toDate(value: unknown): Date | null {
  return value && typeof (value as Timestamp).toDate === "function"
    ? (value as Timestamp).toDate()
    : null;
}

function str(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

export function parseInboxRoom(
  id: string,
  data: DocumentData,
): SupportInboxRoom {
  return {
    roomId: id,
    kind: data.kind === "guest" ? "guest" : "member",
    memberUserId: str(data.memberUserId),
    lastMessageAt: toDate(data.lastMessageAt),
    lastMessagePreview: str(data.lastMessagePreview) ?? "",
    lastMessageSender:
      data.lastMessageSender === "customer" ||
      data.lastMessageSender === "operator"
        ? data.lastMessageSender
        : null,
    operatorInitiated: data.operatorInitiated === true,
    inboxUnreadCount: Number.isInteger(data.inboxUnreadCount)
      ? data.inboxUnreadCount
      : 0,
    assigneeName: str(data.assigneeName),
    device: data.device && typeof data.device === "object" ? data.device : null,
    profile:
      data.profile &&
      typeof data.profile.displayName === "string" &&
      (data.profile.role === "MODEL" || data.profile.role === "DESIGNER")
        ? { displayName: data.profile.displayName, role: data.profile.role }
        : null,
  };
}

export function parseMessage(
  id: string,
  data: DocumentData,
): SupportChatMessage | null {
  if (
    data.sender !== "customer" &&
    data.sender !== "operator" &&
    data.sender !== "bot"
  )
    return null;
  if (
    ![
      "text",
      "image",
      "video",
      "notice",
      "faqMenu",
      "faqQuestion",
      "faqAnswer",
    ].includes(data.type)
  )
    return null;
  return {
    id,
    sender: data.sender,
    type: data.type,
    text:
      data.type === "faqMenu"
        ? [
            str(data.greeting),
            ...(Array.isArray(data.questions)
              ? data.questions.map(
                  (q: { question?: unknown }) =>
                    `· ${String(q?.question ?? "")}`,
                )
              : []),
          ]
            .filter(Boolean)
            .join("\n")
        : str(data.text),
    imageUrl: str(data.image?.url),
    videoUrl: str(data.video?.url),
    operatorName: str(data.operatorName),
    createdAt: toDate(data.createdAt),
  };
}

export function parseAdminEvent(
  id: string,
  data: DocumentData,
): SupportAdminEvent | null {
  if (data.type !== "assigneeChanged") return null;
  return {
    id,
    type: "assigneeChanged",
    toName: str(data.toName),
    createdAt: toDate(data.createdAt),
  };
}

/** 담당자 필수(사용자 결정 2026-11-11). 담당자 없는 방에는 답장할 수 없다(Rules도 같은 조건). */
export function canReply(room: SupportInboxRoom): boolean {
  return room.assigneeName != null;
}

export function matchesFilter(
  room: SupportInboxRoom,
  filter: SupportInboxFilter,
): boolean {
  if (filter === "all") return true;
  return room.assigneeName === filter;
}

/**
 * 답장 말풍선 위 보낸 사람 이름. 어드민이 공용 계정이라 실제 작성자를 알 수 없어 그 방의
 * 담당자 이름으로 표시한다(사용자 결정 2026-11-11). 사람별 계정이 생기면 작성자로 바꾼다.
 */
export function operatorDisplayName(
  room: SupportInboxRoom,
  fallback: string,
): string {
  return room.assigneeName ?? fallback;
}

/** 글자 수 표시용. 답장·먼저 연락 본문은 최대 1000자(프로토타입 입력창). */
export const SUPPORT_CHAT_REPLY_MAX = 1000;

/** 방금 / N분 전 / N시간 전 / N일 전 (Notion 상담함 목록 시각). */
export function relativeTime(date: Date | null, now: Date): string {
  if (!date) return "";
  const minutes = Math.floor((now.getTime() - date.getTime()) / 60000);
  if (minutes < 1) return "방금";
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  return `${Math.floor(hours / 24)}일 전`;
}

export function unreadBadge(count: number): string | null {
  if (count <= 0) return null;
  return count >= 100 ? "99+" : String(count);
}

/** 고객 화면에서 운영자가 보낸 말풍선의 '읽음' 표시. 고객 열람 시각 이전 메시지만 읽음. */
export function isReadByCustomer(
  message: SupportChatMessage,
  customerReadAt: Date | null,
): boolean {
  return (
    message.sender === "operator" &&
    customerReadAt != null &&
    message.createdAt != null &&
    message.createdAt.getTime() <= customerReadAt.getTime()
  );
}

/** 목록·헤더 이름. 비회원은 '비회원', 프로필이 없는 회원은 회원번호로 보여준다. */
export function roomTitle(room: SupportInboxRoom): string {
  if (room.kind === "guest") return "비회원";
  return room.profile?.displayName || `회원 ${room.memberUserId ?? ""}`;
}

/** 이름 옆 보조 표기. 비회원은 '로그아웃 문의'(Notion 목록 표기). */
export function roomSubtitle(room: SupportInboxRoom): string {
  if (room.kind === "guest") return "로그아웃 문의";
  return roleLabel(room.profile?.role);
}

/** 닉네임·회원번호 검색. 메시지 내용 검색은 하지 않는다(사용자 결정 2026-11-11). */
export function matchesSearch(
  room: SupportInboxRoom,
  keyword: string,
): boolean {
  const needle = keyword.trim().toLowerCase();
  if (!needle) return true;
  return (
    roomTitle(room).toLowerCase().includes(needle) ||
    (room.memberUserId ?? "").includes(needle)
  );
}

export type OutreachSearchType = "NAME" | "USERS_ID" | "PHONE";

/** 먼저 연락하기 한 입력창으로 닉네임·회원번호·연락처를 찾는다. 숫자만 10자리 이상이면 연락처. */
export function detectSearchType(keyword: string): OutreachSearchType {
  const digits = keyword.trim().replace(/-/g, "");
  if (/^\d+$/.test(digits)) return digits.length >= 10 ? "PHONE" : "USERS_ID";
  return "NAME";
}

/** FAQ 답변의 `**굵게**` 조각을 나눈다(앱 SupportChatRichText와 같은 규칙). */
export function splitBold(text: string): { text: string; bold: boolean }[] {
  const parts: { text: string; bold: boolean }[] = [];
  const pattern = /\*\*([\s\S]+?)\*\*/g;
  let cursor = 0;
  for (const match of text.matchAll(pattern)) {
    const start = match.index ?? 0;
    if (start > cursor)
      parts.push({ text: text.slice(cursor, start), bold: false });
    parts.push({ text: match[1], bold: true });
    cursor = start + match[0].length;
  }
  if (cursor < text.length)
    parts.push({ text: text.slice(cursor), bold: false });
  return parts;
}

export function formatDeviceLabel(device: SupportInboxRoom["device"]): string {
  if (!device?.platform) return "-";
  const os = device.platform === "ios" ? "iOS" : "Android";
  return device.osVersion ? `${os} · ${device.osVersion}` : os;
}

/** 시작 화면에 보이는 질문 최대 개수(Notion 챗봇 설정). */
export const FAQ_VISIBLE_MAX = 5;

export interface SupportFaq {
  id: string;
  question: string;
  answer: string;
  visible: boolean;
  order: number;
}

/** 최근 30일(KST) 일별 집계 문서 키 범위의 시작. Functions kstDayKey와 같은 형식(YYYYMMDD). */
export function faqStatsStartKey(now: Date, days = 30): string {
  const kst = new Date(
    now.getTime() + 9 * 60 * 60 * 1000 - (days - 1) * 86_400_000,
  );
  return kst.toISOString().slice(0, 10).replace(/-/g, "");
}

/** 노출 질문만 순서대로 다시 번호를 매긴다(끌어서 옮긴 결과 저장용). */
export function reorderVisible(
  faqs: SupportFaq[],
  fromId: string,
  toId: string,
): SupportFaq[] {
  const visible = faqs
    .filter((f) => f.visible)
    .sort((a, b) => a.order - b.order);
  const from = visible.findIndex((f) => f.id === fromId);
  const to = visible.findIndex((f) => f.id === toId);
  if (from < 0 || to < 0 || from === to) return visible;
  const next = [...visible];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next.map((f, index) => ({ ...f, order: index + 1 }));
}

/**
 * 상담함 표시 목록. 일회성 검색 결과보다 실시간 목록, 그보다 선택한 방 구독 값을 우선한다
 * (오래된 검색 결과가 최신 담당자·읽음 상태를 덮어쓰지 않게). 마지막 메시지 순 정렬.
 */
export function mergeInboxRooms(
  searched: SupportInboxRoom[],
  live: SupportInboxRoom[],
  selected: SupportInboxRoom | null,
): SupportInboxRoom[] {
  const byId = new Map<string, SupportInboxRoom>();
  [...searched, ...live, ...(selected ? [selected] : [])].forEach((room) =>
    byId.set(room.roomId, room),
  );
  return [...byId.values()].sort(
    (a, b) =>
      (b.lastMessageAt?.getTime() ?? 0) - (a.lastMessageAt?.getTime() ?? 0),
  );
}

/** 슬랙 링크의 방 ID. 방 ID 형식(member_숫자·guest_영숫자)만 받는다. */
export function parseRoomLinkParam(search: string): string | null {
  const roomId = new URLSearchParams(search).get("room");
  return roomId && /^(member_\d{1,20}|guest_[A-Za-z0-9]{1,128})$/.test(roomId)
    ? roomId
    : null;
}
