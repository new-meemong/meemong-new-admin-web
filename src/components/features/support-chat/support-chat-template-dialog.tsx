"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  type Timestamp,
} from "firebase/firestore";
import { FileText, Plus, Search, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { supportDb } from "@/lib/firebase/support-chat";
import { cn } from "@/lib/utils";

const NAME_MAX = 20;
const CONTENT_MAX = 1000;

export interface SupportChatTemplate {
  id: string;
  name: string;
  content: string;
  updatedAt: Date | null;
}

/** 템플릿 목록(최근 수정 순, Notion 답변 템플릿). 상담함 답장과 먼저 연락하기가 같이 쓴다. */
export function useSupportChatTemplates(enabled: boolean): SupportChatTemplate[] {
  const [templates, setTemplates] = useState<SupportChatTemplate[]>([]);
  useEffect(() => {
    if (!enabled) return;
    return onSnapshot(query(collection(supportDb, "supportTemplates"), orderBy("updatedAt", "desc")), (snapshot) =>
      setTemplates(
        snapshot.docs.map((d) => ({
          id: d.id,
          name: String(d.data().name ?? ""),
          content: String(d.data().content ?? ""),
          updatedAt: (d.data().updatedAt as Timestamp | undefined)?.toDate?.() ?? null,
        })),
      ),
    );
  }, [enabled]);
  return templates;
}

type Mode = { kind: "view" } | { kind: "add" } | { kind: "edit"; id: string };

/**
 * 프로토타입 답변 템플릿 모달(1040×680): 왼쪽 목록·검색·추가, 오른쪽 미리보기/추가/수정.
 * '답장에 넣기'는 작성 중 내용 뒤에 이어 붙인다. 수정·삭제해도 이미 보낸 메시지는 그대로다.
 * 제목은 쓰지 않는다(사용자 결정 2026-11-11).
 */
export default function SupportChatTemplateDialog({
  open,
  onOpenChange,
  onInsert,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInsert: (content: string) => void;
}) {
  const templates = useSupportChatTemplates(open);
  const [keyword, setKeyword] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>({ kind: "view" });
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const visible = useMemo(() => {
    const needle = keyword.trim();
    if (!needle) return templates;
    return templates.filter((t) => t.name.includes(needle) || t.content.includes(needle));
  }, [templates, keyword]);
  const selected = templates.find((t) => t.id === selectedId) ?? null;

  const startAdd = () => {
    setMode({ kind: "add" });
    setSelectedId(null);
    setName("");
    setContent("");
    setError(null);
  };
  const startEdit = (template: SupportChatTemplate) => {
    setMode({ kind: "edit", id: template.id });
    setName(template.name);
    setContent(template.content);
    setError(null);
  };

  const save = async () => {
    if (!name.trim() || !content.trim() || saving) return;
    setSaving(true);
    setError(null);
    try {
      if (mode.kind === "add") {
        const ref = await addDoc(collection(supportDb, "supportTemplates"), {
          name: name.trim(),
          content: content.trim(),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        setSelectedId(ref.id);
      } else if (mode.kind === "edit") {
        await updateDoc(doc(supportDb, "supportTemplates", mode.id), {
          name: name.trim(),
          content: content.trim(),
          updatedAt: serverTimestamp(),
        });
      }
      setMode({ kind: "view" });
    } catch (e) {
      setError(`저장 실패: ${(e as Error).message}`);
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (mode.kind !== "edit" || saving) return;
    if (!window.confirm("이 템플릿을 삭제할까요? 이미 보낸 메시지는 그대로예요.")) return;
    setSaving(true);
    try {
      await deleteDoc(doc(supportDb, "supportTemplates", mode.id));
      setSelectedId(null);
      setMode({ kind: "view" });
    } catch (e) {
      setError(`삭제 실패: ${(e as Error).message}`);
    } finally {
      setSaving(false);
    }
  };

  const editing = mode.kind !== "view";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex h-[680px] max-h-[90vh] w-[1040px] max-w-[calc(100vw-32px)] flex-col gap-0 overflow-hidden rounded-2xl p-0 tracking-[-0.3px] text-[#1d2024] sm:max-w-[1040px] [&>button:last-child]:hidden"
      >
        <div className="flex h-16 flex-none items-center gap-3 border-b border-[#eff1f4] pl-6 pr-5">
          <DialogTitle className="text-[17px] font-bold">답변 템플릿</DialogTitle>
          <DialogDescription className="hidden text-[13px] text-[#6b7480] sm:block">템플릿을 골라서 답장에 넣어요</DialogDescription>
          <label className="ml-auto flex h-9 w-[240px] items-center gap-2 rounded-lg bg-[#f4f5f7] px-3">
            <Search className="size-4 text-[#99a2ad]" aria-hidden />
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="템플릿 검색"
              aria-label="템플릿 검색"
              className="min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder:text-[#99a2ad]"
            />
          </label>
          <button type="button" aria-label="닫기" onClick={() => onOpenChange(false)} className="flex size-9 items-center justify-center">
            <X className="size-5 text-[#525a66]" />
          </button>
        </div>
        <div className="flex min-h-0 flex-1">
          <div className="flex w-[400px] flex-none flex-col gap-2 overflow-y-auto border-r border-[#eff1f4] p-3.5">
            <div className="flex items-center justify-between px-0.5 pb-1">
              <span className="text-[12px] font-bold text-[#6b7480]">템플릿 {templates.length}개</span>
              <button type="button" onClick={startAdd} className="flex items-center gap-1 text-[13px] font-semibold text-[#0060cc]">
                <Plus className="size-3.5" aria-hidden />
                템플릿 추가
              </button>
            </div>
            {mode.kind === "add" && (
              <div className="flex flex-col gap-1 rounded-lg bg-[#f5f9ff] px-3.5 py-3 shadow-[inset_0_0_0_1px_#b9d5ff]">
                <span className="text-[14px] font-semibold text-[#0060cc]">{name.trim() || "새 템플릿"}</span>
              </div>
            )}
            {templates.length === 0 && mode.kind !== "add" && (
              <div className="flex flex-1 items-center justify-center text-[13px] text-[#99a2ad]">등록된 템플릿이 없어요</div>
            )}
            {visible.map((template) => {
              const active = template.id === selectedId && mode.kind !== "add";
              return (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => {
                    setSelectedId(template.id);
                    setMode({ kind: "view" });
                  }}
                  className={cn(
                    "flex flex-col gap-1 rounded-lg px-3.5 py-3 text-left",
                    active ? "bg-[#f5f9ff] shadow-[inset_0_0_0_1px_#b9d5ff]" : "border border-[#eff1f4]",
                  )}
                >
                  <span className="text-[14px] font-semibold">{template.name}</span>
                  <span className="line-clamp-2 text-[12px] leading-[1.45] text-[#6b7480]">{template.content}</span>
                </button>
              );
            })}
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-3.5 px-6 py-5">
            {editing ? (
              <>
                <span className="text-[16px] font-bold">{mode.kind === "add" ? "템플릿 추가" : "템플릿 수정"}</span>
                <label className="flex flex-col gap-2">
                  <span className="text-[13px] font-bold text-[#2f343c]">
                    템플릿 이름 <span className="font-normal text-[#6b7480]">· 운영자만 보여요</span>
                  </span>
                  <span className="flex h-10 items-center rounded-lg border border-[#dfe2e7] px-3 focus-within:border-[#0079ff] focus-within:shadow-[0_0_0_3px_#e0edff]">
                    <input
                      value={name}
                      maxLength={NAME_MAX}
                      onChange={(event) => setName(event.target.value)}
                      placeholder="목록에 보일 이름"
                      className="min-w-0 flex-1 text-[14px] outline-none placeholder:text-[#99a2ad]"
                    />
                    <span className="text-[12px] text-[#99a2ad]">
                      {name.length} / {NAME_MAX}
                    </span>
                  </span>
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-[13px] font-bold text-[#2f343c]">내용</span>
                  <span className="overflow-hidden rounded-lg border border-[#dfe2e7] focus-within:border-[#0079ff] focus-within:shadow-[0_0_0_3px_#e0edff]">
                    <textarea
                      value={content}
                      maxLength={CONTENT_MAX}
                      onChange={(event) => setContent(event.target.value)}
                      placeholder="고객에게 보낼 내용을 입력하세요"
                      className="block min-h-[110px] w-full resize-y p-3 text-[14px] leading-[1.6] outline-none placeholder:text-[#99a2ad]"
                    />
                    <span className="block border-t border-[#f1f2f4] bg-[#fbfbfc] px-3 py-1.5 text-right text-[12px] text-[#6b7480]">
                      {content.length} / {CONTENT_MAX}
                    </span>
                  </span>
                  {mode.kind === "edit" && <span className="text-[12px] text-[#6b7480]">수정해도 이미 보낸 메시지는 바뀌지 않아요.</span>}
                </label>
                {error && <p className="text-[12px] text-red-600">{error}</p>}
                <div className="mt-auto flex items-center gap-2">
                  {mode.kind === "edit" && (
                    <button type="button" onClick={() => void remove()} className="text-[13px] text-[#d92d20]">
                      삭제
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setMode({ kind: "view" })}
                    className="ml-auto h-10 whitespace-nowrap rounded-lg border border-[#dfe2e7] px-4 text-[14px] text-[#2f343c]"
                  >
                    취소
                  </button>
                  <button
                    type="button"
                    disabled={!name.trim() || !content.trim() || saving}
                    onClick={() => void save()}
                    className="h-10 whitespace-nowrap rounded-lg bg-[#1d2024] px-[18px] text-[14px] font-semibold text-white disabled:bg-[#eff1f4] disabled:text-[#99a2ad]"
                  >
                    {mode.kind === "add" ? "추가" : "저장"}
                  </button>
                </div>
              </>
            ) : templates.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-2.5 text-[#6b7480]">
                <FileText className="size-7" aria-hidden />
                <span className="text-[15px] font-bold text-[#2f343c]">아직 등록된 템플릿이 없어요</span>
                <span className="text-center text-[13px] leading-[1.6]">
                  자주 보내는 답장을 템플릿으로 저장해 두면 다음부터 바로 넣을 수 있어요.
                  <br />
                  템플릿 없이 답장하려면 창을 닫고 입력창에 바로 쓰면 돼요.
                </span>
                <button
                  type="button"
                  onClick={startAdd}
                  className="mt-2 flex h-10 items-center gap-1.5 rounded-lg bg-[#1d2024] pl-3.5 pr-4 text-[14px] font-semibold text-white"
                >
                  <Plus className="size-4" aria-hidden />
                  템플릿 추가
                </button>
              </div>
            ) : selected ? (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-[16px] font-bold">{selected.name}</span>
                  <button type="button" onClick={() => startEdit(selected)} className="ml-auto text-[13px] text-[#525a66]">
                    수정
                  </button>
                </div>
                <span className="text-[12px] font-bold text-[#6b7480]">미리보기</span>
                <div className="whitespace-pre-wrap rounded-[10px] bg-[#f8f9fb] px-4 py-3.5 text-[14px] leading-[1.7] text-[#2f343c]">
                  {selected.content}
                </div>
                <div className="mt-auto flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedId(null)}
                    className="ml-auto h-10 whitespace-nowrap rounded-lg border border-[#dfe2e7] px-4 text-[14px] text-[#2f343c]"
                  >
                    선택 해제
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onInsert(selected.content);
                      onOpenChange(false);
                    }}
                    className="h-10 whitespace-nowrap rounded-lg bg-[#1d2024] px-[18px] text-[14px] font-semibold text-white"
                  >
                    답장에 넣기
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center gap-2.5 text-[#6b7480]">
                <FileText className="size-7" aria-hidden />
                <span className="text-[14px] font-semibold text-[#2f343c]">템플릿을 고르면 미리보기가 보여요</span>
                <span className="text-[13px]">템플릿 없이 답장하려면 창을 닫고 입력창에 바로 쓰면 돼요</span>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
