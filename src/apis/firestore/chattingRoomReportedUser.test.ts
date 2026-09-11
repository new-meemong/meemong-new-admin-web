import { beforeEach, describe, expect, it, vi } from "vitest";
import { doc, getDoc } from "firebase/firestore";
import { getChattingRoomReportedUserId } from "./chattingRoomReportedUser";

vi.mock("@/lib/firebase/client", () => ({ db: {} }));
vi.mock("firebase/firestore", () => ({ doc: vi.fn(), getDoc: vi.fn() }));

function channel(data: Record<string, unknown>, exists = true) {
  vi.mocked(getDoc).mockResolvedValue({
    exists: () => exists,
    data: () => data,
  } as never);
}

beforeEach(() => vi.clearAllMocks());

describe("getChattingRoomReportedUserId", () => {
  it("reads the legacy room and resolves either reporter's counterpart", async () => {
    channel({ participantsIds: ["12", "57"] });
    expect(await getChattingRoomReportedUserId("legacy-room", 12)).toBe(57);
    expect(await getChattingRoomReportedUserId("legacy-room", 57)).toBe(12);
    expect(doc).toHaveBeenCalledWith(
      {},
      "modelMatchingChatChannels",
      "legacy-room",
    );
  });

  it.each([
    ["modelMatching", "modelMatchingChatChannels"],
    ["reviewSpecial", "reviewSpecialChatChannels"],
    ["hairConsultation", "hairConsultationChatChannels"],
    ["jobPosting", "jobPostingChatChannels"],
  ])(
    "uses immutable participants for %s even after leaving",
    async (type, collection) => {
      channel({
        schemaVersion: 2,
        participantIds: ["12", "57"],
        participantsIds: ["12"],
      });
      const id = `v2_${type}_post_1_12_57_1`;
      expect(await getChattingRoomReportedUserId(id, 12)).toBe(57);
      expect(doc).toHaveBeenCalledWith({}, collection, id);
    },
  );

  it.each([[12], [12, 12], [12, 57, 90], [57, 90], [12, "bad"], [12, null]])(
    "does not guess from invalid or ambiguous participants %j",
    async (...participantsIds) => {
      channel({ participantsIds });
      expect(await getChattingRoomReportedUserId("legacy-room", 12)).toBeNull();
    },
  );

  it("returns null for a missing channel", async () => {
    channel({}, false);
    expect(await getChattingRoomReportedUserId("missing", 12)).toBeNull();
  });

  it("does not substitute active participants for missing v2 identity", async () => {
    channel({ schemaVersion: 2, participantsIds: [12, 57] });
    expect(
      await getChattingRoomReportedUserId(
        "v2_modelMatching_post_1_12_57_1",
        12,
      ),
    ).toBeNull();
  });

  it("propagates read failures so the UI can distinguish them", async () => {
    vi.mocked(getDoc).mockRejectedValue(new Error("permission-denied"));
    await expect(
      getChattingRoomReportedUserId("legacy-room", 12),
    ).rejects.toThrow("permission-denied");
  });
});
