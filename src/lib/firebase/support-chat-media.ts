"use client";

import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { app } from "@/lib/firebase/client";

/** Storage Rules(storage.support-chat.rules)와 같은 한도. 사용자 결정 2026-11-11. */
export const SUPPORT_CHAT_MAX_IMAGE_BYTES = 20 * 1024 * 1024;
export const SUPPORT_CHAT_MAX_VIDEO_BYTES = 100 * 1024 * 1024;

const storage = getStorage(app);

export type SupportChatAttachment =
  | { type: "image"; image: { url: string; path: string; width: number; height: number } }
  | { type: "video"; video: { url: string; path: string; sizeBytes: number; contentType: string } };

async function imageSize(file: File): Promise<{ width: number; height: number }> {
  try {
    const bitmap = await createImageBitmap(file);
    const size = { width: bitmap.width, height: bitmap.height };
    bitmap.close();
    return size;
  } catch {
    return { width: 1, height: 1 };
  }
}

/** 운영자 첨부를 고객 방 경로에 올린다. 경로의 방·메시지 ID로 Storage Rules가 검사한다. */
export async function uploadSupportChatAttachment(
  roomId: string,
  messageId: string,
  file: File,
): Promise<SupportChatAttachment> {
  const isVideo = file.type.startsWith("video/");
  if (!isVideo && !file.type.startsWith("image/")) {
    throw new Error("사진이나 동영상만 보낼 수 있습니다.");
  }
  if (file.size > (isVideo ? SUPPORT_CHAT_MAX_VIDEO_BYTES : SUPPORT_CHAT_MAX_IMAGE_BYTES)) {
    throw new Error(isVideo ? "동영상은 100MB까지 보낼 수 있습니다." : "사진은 20MB까지 보낼 수 있습니다.");
  }
  const extension = file.name.includes(".") ? file.name.slice(file.name.lastIndexOf(".")).toLowerCase() : "";
  const path = `supportChat/${roomId}/${messageId}/media${extension}`;
  const target = ref(storage, path);
  await uploadBytes(target, file, { contentType: file.type });
  const url = await getDownloadURL(target);
  if (isVideo) {
    return { type: "video", video: { url, path, sizeBytes: file.size, contentType: file.type } };
  }
  return { type: "image", image: { url, path, ...(await imageSize(file)) } };
}
