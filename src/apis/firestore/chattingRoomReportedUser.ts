import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";

export async function getChattingRoomReportedUserId(
  chattingRoomId: string,
  reporterUserId: number,
): Promise<number | null> {
  const collections: Record<string, string> = {
    modelMatching: "modelMatchingChatChannels",
    hairConsultation: "hairConsultationChatChannels",
    jobPosting: "jobPostingChatChannels",
    reviewSpecial: "reviewSpecialChatChannels",
  };
  const collection = chattingRoomId.startsWith("v2_")
    ? collections[chattingRoomId.split("_")[1]]
    : collections.modelMatching;
  if (!collection) return null;
  const snapshot = await getDoc(doc(db, collection, chattingRoomId));
  if (!snapshot.exists()) return null;

  const data = snapshot.data();
  // v2 retains the original pair even after a participant leaves.
  const rawIds =
    data.schemaVersion === 2 ? data.participantIds : data.participantsIds;
  if (!Array.isArray(rawIds)) return null;
  const ids = rawIds.map((id: unknown) =>
    typeof id === "string" || typeof id === "number" ? Number(id) : NaN,
  );
  if (
    ids.length !== 2 ||
    ids.some((id) => !Number.isSafeInteger(id) || id <= 0) ||
    ids[0] === ids[1] ||
    !ids.includes(reporterUserId)
  )
    return null;

  return ids.find((id) => id !== reporterUserId) ?? null;
}
