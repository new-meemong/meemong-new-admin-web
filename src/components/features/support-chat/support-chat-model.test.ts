import { describe, expect, it } from "vitest";
import {
  parseRoomLinkParam,
  canReply,
  mergeInboxRooms,
  splitBold,
  faqStatsStartKey,
  reorderVisible,
  operatorDisplayName,
  parseMessage,
  detectSearchType,
  isSupportChatAssignee,
  matchesSearch,
  roomSubtitle,
  roomTitle,
  isReadByCustomer,
  matchesFilter,
  parseInboxRoom,
  relativeTime,
  unreadBadge,
} from "./support-chat-model";

const room = parseInboxRoom("member_1", {
  kind: "member",
  memberUserId: "1",
  inboxUnreadCount: 3,
});

describe("support chat inbox policy", () => {
  it("requires an assignee from the fixed list before replying", () => {
    expect(canReply(room)).toBe(false);
    expect(canReply({ ...room, assigneeName: "문새한슬" })).toBe(true);
    expect(isSupportChatAssignee("박목인")).toBe(true);
    expect(isSupportChatAssignee("admin")).toBe(false);
  });

  it("filters by assignee and labels replies with the room assignee", () => {
    const assigned = { ...room, assigneeName: "유주혁" };
    expect(matchesFilter(assigned, "유주혁")).toBe(true);
    expect(matchesFilter(assigned, "임지훈")).toBe(false);
    expect(matchesFilter(room, "all")).toBe(true);
    expect(operatorDisplayName(assigned, "admin")).toBe("유주혁");
    expect(operatorDisplayName(room, "admin")).toBe("admin");
  });

  it("renders FAQ menu snapshots as text for the admin timeline", () => {
    const menu = parseMessage("m", {
      sender: "bot",
      type: "faqMenu",
      greeting: "안녕하세요",
      questions: [{ faqId: "f1", question: "환불" }],
    });
    expect(menu?.text).toBe("안녕하세요\n· 환불");
  });

  it("searches nickname and member id but not message content", () => {
    const withProfile = {
      ...room,
      profile: { displayName: "미테애플", role: "DESIGNER" as const },
      lastMessagePreview: "결제 오류",
    };
    expect(matchesSearch(withProfile, "미테")).toBe(true);
    expect(matchesSearch(withProfile, "1")).toBe(true);
    expect(matchesSearch(withProfile, "결제")).toBe(false);
    expect(roomTitle(parseInboxRoom("guest_a", { kind: "guest" }))).toBe(
      "비회원",
    );
    expect(roomSubtitle(parseInboxRoom("guest_a", { kind: "guest" }))).toBe(
      "로그아웃 문의",
    );
    expect(roomSubtitle(withProfile)).toBe("디자이너");
  });

  it("detects the outreach search field from one input", () => {
    expect(detectSearchType("미테")).toBe("NAME");
    expect(detectSearchType("56455")).toBe("USERS_ID");
    expect(detectSearchType("010-1234-5678")).toBe("PHONE");
  });

  it("formats relative time and caps the badge at 99+", () => {
    const now = new Date("2026-11-11T12:00:00Z");
    expect(relativeTime(new Date("2026-11-11T11:59:40Z"), now)).toBe("방금");
    expect(relativeTime(new Date("2026-11-11T11:15:00Z"), now)).toBe("45분 전");
    expect(relativeTime(new Date("2026-11-11T09:00:00Z"), now)).toBe(
      "3시간 전",
    );
    expect(relativeTime(new Date("2026-11-08T12:00:00Z"), now)).toBe("3일 전");
    expect(unreadBadge(0)).toBeNull();
    expect(unreadBadge(100)).toBe("99+");
  });

  it("marks operator messages read only up to the customer read time", () => {
    const readAt = new Date("2026-11-11T12:00:00Z");
    const base = {
      id: "m",
      type: "text" as const,
      text: "a",
      imageUrl: null,
      videoUrl: null,
      operatorName: null,
    };
    expect(
      isReadByCustomer(
        {
          ...base,
          sender: "operator",
          createdAt: new Date("2026-11-11T11:00:00Z"),
        },
        readAt,
      ),
    ).toBe(true);
    expect(
      isReadByCustomer(
        {
          ...base,
          sender: "operator",
          createdAt: new Date("2026-11-11T13:00:00Z"),
        },
        readAt,
      ),
    ).toBe(false);
    expect(
      isReadByCustomer(
        {
          ...base,
          sender: "customer",
          createdAt: new Date("2026-11-11T11:00:00Z"),
        },
        readAt,
      ),
    ).toBe(false);
  });

  it("computes the 30-day KST stats window and renumbers dragged visible FAQs", () => {
    expect(faqStatsStartKey(new Date("2026-11-11T15:30:00Z"))).toBe("20261014");
    const faqs = [
      { id: "a", question: "a", answer: "a", visible: true, order: 1 },
      { id: "b", question: "b", answer: "b", visible: true, order: 2 },
      { id: "c", question: "c", answer: "c", visible: true, order: 3 },
      { id: "h", question: "h", answer: "h", visible: false, order: 0 },
    ];
    expect(
      reorderVisible(faqs, "c", "a").map((f) => `${f.id}${f.order}`),
    ).toEqual(["c1", "a2", "b3"]);
  });

  it("splits FAQ bold markup for the admin auto-response bubble", () => {
    expect(splitBold("탈퇴하면 **7일 동안** 가입 불가")).toEqual([
      { text: "탈퇴하면 ", bold: false },
      { text: "7일 동안", bold: true },
      { text: " 가입 불가", bold: false },
    ]);
  });

  it("prefers live inbox values over stale search results", () => {
    const stale = { ...room, assigneeName: null };
    const live = { ...room, assigneeName: "유주호" };
    expect(mergeInboxRooms([stale], [live], null)[0].assigneeName).toBe(
      "유주호",
    );
    expect(
      mergeInboxRooms([stale], [], { ...room, assigneeName: "임지훈" })[0]
        .assigneeName,
    ).toBe("임지훈");
  });
});

describe("parseRoomLinkParam", () => {
  it("슬랙 링크의 방 ID만 받고 다른 값은 무시한다", () => {
    expect(parseRoomLinkParam("?room=member_42")).toBe("member_42");
    expect(parseRoomLinkParam("?room=guest_AbC9")).toBe("guest_AbC9");
    expect(parseRoomLinkParam("?room=admin_1")).toBeNull();
    expect(parseRoomLinkParam("?room=member_42%2F..")).toBeNull();
    expect(parseRoomLinkParam("")).toBeNull();
  });
});
