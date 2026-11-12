"use client";

import { toast } from "react-toastify";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  documentId,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { ChevronDown, GripVertical, Plus } from "lucide-react";
import { ensureSupportAdminSession, supportDb } from "@/lib/firebase/support-chat";
import { cn } from "@/lib/utils";
import { FAQ_VISIBLE_MAX, faqStatsStartKey, reorderVisible, type SupportFaq } from "./support-chat-model";

const QUESTION_MAX = 30;
const ANSWER_MAX = 2000;
const GREETING_MAX = 200;
type Tab = "faq" | "greeting";
type Editing = { kind: "edit"; id: string } | { kind: "add" } | null;

/** 프로토타입 Admin-FAQ·Admin-FAQ-Add·Admin-FAQ-Greeting. */
export default function SupportChatFaqPageContent() {
  const [ready, setReady] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("faq");
  const [faqs, setFaqs] = useState<SupportFaq[]>([]);
  const [views, setViews] = useState<Record<string, number>>({});
  const [editing, setEditing] = useState<Editing>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [greeting, setGreeting] = useState("");
  const [savedGreeting, setSavedGreeting] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const answerRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    ensureSupportAdminSession()
      .then(() => setReady(true))
      .catch((e: unknown) => setSessionError(e instanceof Error ? e.message : String(e)));
  }, []);

  useEffect(() => {
    if (!ready) return;
    const unsubscribeFaqs = onSnapshot(collection(supportDb, "supportFaqs"), (snapshot) =>
      setFaqs(
        snapshot.docs.map((d) => ({
          id: d.id,
          question: String(d.data().question ?? ""),
          answer: String(d.data().answer ?? ""),
          visible: d.data().visible === true,
          order: Number(d.data().order ?? 0),
        })),
      ),
    );
    const unsubscribeStats = onSnapshot(
      query(collection(supportDb, "supportFaqDailyStats"), where(documentId(), ">=", faqStatsStartKey(new Date()))),
      (snapshot) => {
        const totals: Record<string, number> = {};
        snapshot.docs.forEach((d) => {
          const counts = (d.data().counts ?? {}) as Record<string, number>;
          Object.entries(counts).forEach(([id, count]) => {
            totals[id] = (totals[id] ?? 0) + Number(count || 0);
          });
        });
        setViews(totals);
      },
    );
    getDoc(doc(supportDb, "supportConfig", "greeting")).then((snapshot) => {
      const text = String(snapshot.data()?.text ?? "");
      setGreeting(text);
      setSavedGreeting(text);
    });
    return () => {
      unsubscribeFaqs();
      unsubscribeStats();
    };
  }, [ready]);

  const visible = useMemo(() => faqs.filter((f) => f.visible).sort((a, b) => a.order - b.order), [faqs]);
  const hidden = useMemo(() => faqs.filter((f) => !f.visible).sort((a, b) => a.question.localeCompare(b.question, "ko")), [faqs]);

  useEffect(() => {
    if (editing === null && visible[0]) selectFaq(visible[0]);
    // 처음 불러왔을 때만 첫 질문을 고른다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible.length > 0]);

  function selectFaq(faq: SupportFaq) {
    setEditing({ kind: "edit", id: faq.id });
    setQuestion(faq.question);
    setAnswer(faq.answer);
    setError(null);
  }

  const startAdd = () => {
    setTab("faq");
    setEditing({ kind: "add" });
    setQuestion("");
    setAnswer("");
    setError(null);
  };

  const save = async () => {
    if (!editing || !question.trim() || !answer.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      if (editing.kind === "add") {
        // 새 질문은 숨김 상태로 추가한다(Notion 챗봇 설정).
        const ref = doc(collection(supportDb, "supportFaqs"));
        await setDoc(ref, {
          question: question.trim(),
          answer: answer.trim(),
          visible: false,
          order: 0,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        setEditing({ kind: "edit", id: ref.id });
      } else {
        const current = faqs.find((f) => f.id === editing.id);
        if (!current) return;
        await setDoc(
          doc(supportDb, "supportFaqs", editing.id),
          { question: question.trim(), answer: answer.trim(), updatedAt: serverTimestamp() },
          { merge: true },
        );
      }
    } catch (e) {
      setError(`저장 실패: ${(e as Error).message}`);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (editing?.kind !== "edit" || busy) return;
    if (!window.confirm("이 질문을 삭제할까요? 이미 고객 대화에 보낸 답변은 그대로예요.")) return;
    setBusy(true);
    try {
      await deleteDoc(doc(supportDb, "supportFaqs", editing.id));
      setEditing(null);
    } catch (e) {
      setError(`삭제 실패: ${(e as Error).message}`);
    } finally {
      setBusy(false);
    }
  };

  const toggle = async (faq: SupportFaq) => {
    setError(null);
    if (!faq.visible && visible.length >= FAQ_VISIBLE_MAX) {
      setError(`시작 화면에는 최대 ${FAQ_VISIBLE_MAX}개까지 보여요. 다른 질문의 노출을 먼저 꺼 주세요.`);
      return;
    }
    const batch = writeBatch(supportDb);
    if (faq.visible) {
      batch.set(doc(supportDb, "supportFaqs", faq.id), { visible: false, updatedAt: serverTimestamp() }, { merge: true });
      // 남은 노출 질문 번호를 다시 매긴다.
      visible
        .filter((f) => f.id !== faq.id)
        .forEach((f, index) =>
          batch.set(doc(supportDb, "supportFaqs", f.id), { order: index + 1, updatedAt: serverTimestamp() }, { merge: true }),
        );
    } else {
      batch.set(
        doc(supportDb, "supportFaqs", faq.id),
        { visible: true, order: visible.length + 1, updatedAt: serverTimestamp() },
        { merge: true },
      );
    }
    try {
      await batch.commit();
    } catch (e) {
      setError(`노출 변경 실패: ${(e as Error).message}`);
    }
  };

  const drop = async (targetId: string) => {
    if (!dragId) return;
    const next = reorderVisible(faqs, dragId, targetId);
    setDragId(null);
    const batch = writeBatch(supportDb);
    next.forEach((f) => batch.set(doc(supportDb, "supportFaqs", f.id), { order: f.order, updatedAt: serverTimestamp() }, { merge: true }));
    try {
      await batch.commit();
    } catch (e) {
      setError(`순서 변경 실패: ${(e as Error).message}`);
    }
  };

  // 답변 편집기: B는 선택한 글자를 **굵게**로 감싸고, 줄바꿈은 커서 위치에 줄을 넣는다.
  const wrapBold = () => {
    const el = answerRef.current;
    if (!el) return;
    const { selectionStart: s, selectionEnd: e } = el;
    const selected = answer.slice(s, e) || "굵게";
    setAnswer(`${answer.slice(0, s)}**${selected}**${answer.slice(e)}`.slice(0, ANSWER_MAX));
  };
  const insertBreak = () => {
    const el = answerRef.current;
    const at = el?.selectionStart ?? answer.length;
    setAnswer(`${answer.slice(0, at)}\n${answer.slice(at)}`.slice(0, ANSWER_MAX));
  };

  const saveGreeting = async () => {
    setBusy(true);
    setError(null);
    try {
      await setDoc(doc(supportDb, "supportConfig", "greeting"), { text: greeting.trim(), updatedAt: serverTimestamp() });
      setSavedGreeting(greeting.trim());
      toast.success("저장되었습니다.");
    } catch (e) {
      setError(`저장 실패: ${(e as Error).message}`);
    } finally {
      setBusy(false);
    }
  };

  if (sessionError) return <p className="p-6 text-[14px] text-red-600">{sessionError}</p>;
  if (!ready) return <p className="p-6 text-[14px] text-[#6b7480]">운영자 확인 중…</p>;

  const row = (faq: SupportFaq, index: number | null) => {
    const selected = editing?.kind === "edit" && editing.id === faq.id;
    const count = views[faq.id];
    return (
      <div
        key={faq.id}
        draggable={faq.visible}
        onDragStart={() => setDragId(faq.id)}
        onDragOver={(event) => faq.visible && event.preventDefault()}
        onDrop={() => faq.visible && void drop(faq.id)}
        onClick={() => selectFaq(faq)}
        className={cn(
          "flex h-14 cursor-pointer items-center gap-3 border-b border-[#f1f2f4] px-4 last:border-b-0",
          selected && "bg-[#f5f9ff] shadow-[inset_3px_0_0_#0079ff]",
          !faq.visible && "text-[#99a2ad]",
        )}
      >
        <GripVertical className={cn("size-4 flex-none", faq.visible ? "cursor-grab text-[#b3b9c2]" : "text-[#dfe2e7]")} aria-hidden />
        <span className="w-[18px] flex-none text-[13px] text-[#99a2ad]">{index ?? ""}</span>
        <span className={cn("min-w-0 flex-1 truncate text-[14px]", selected ? "font-semibold" : "font-medium")}>{faq.question}</span>
        <span className="w-[72px] flex-none text-right text-[13px] text-[#2f343c]">
          {faq.visible || count ? (count ?? 0).toLocaleString("ko-KR") : "—"}
        </span>
        <span className="flex w-16 flex-none justify-end">
          <button
            type="button"
            role="switch"
            aria-checked={faq.visible}
            aria-label={`${faq.question} 노출`}
            onClick={(event) => {
              event.stopPropagation();
              void toggle(faq);
            }}
            className={cn("relative h-[22px] w-9 flex-none rounded-full", faq.visible ? "bg-[#5a4b8a]" : "bg-[#dfe2e7]")}
          >
            <span
              className={cn(
                "absolute top-0.5 size-[18px] rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,.2)]",
                faq.visible ? "right-0.5" : "left-0.5",
              )}
            />
          </button>
        </span>
      </div>
    );
  };

  return (
    <div className="flex h-[calc(100dvh-53px)] min-h-0 flex-col bg-white text-[#1d2024] tracking-[-0.3px] md:h-screen">
      <div className="flex flex-none flex-col gap-1.5 border-b border-[#eff1f4] px-8 pt-5">
        <div className="flex items-center gap-2">
          <h1 className="text-[18px] font-bold">챗봇 FAQ</h1>
          <span className="hidden text-[13px] text-[#6b7480] lg:inline">
            운영팀 채팅방을 처음 열 때와 FAQ 버튼을 누를 때 챗봇이 보여주는 질문과 답변이에요
          </span>
          {tab === "faq" && (
            <button
              type="button"
              onClick={startAdd}
              className="ml-auto flex h-9 items-center gap-1.5 rounded-lg bg-[#1d2024] pl-3 pr-3.5 text-[13px] font-semibold text-white"
            >
              <Plus className="size-4" aria-hidden />
              질문 추가
            </button>
          )}
        </div>
        <div className="flex gap-5">
          {(
            [
              ["faq", "자주 묻는 질문"],
              ["greeting", "시작 인사말"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setTab(value)}
              className={cn(
                "border-b-2 px-0.5 py-3 text-[14px]",
                tab === value ? "border-[#1d2024] font-bold text-[#1d2024]" : "border-transparent font-medium text-[#6b7480]",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {tab === "greeting" ? (
        <div className="flex max-w-[720px] flex-col gap-6 px-8 py-6">
          <label className="flex flex-col gap-2">
            <span className="text-[13px] font-bold text-[#2f343c]">시작 인사말</span>
            <span className="overflow-hidden rounded-lg border border-[#dfe2e7] focus-within:border-[#0079ff]">
              <textarea
                value={greeting}
                maxLength={GREETING_MAX}
                onChange={(event) => setGreeting(event.target.value)}
                className="block min-h-24 w-full resize-y p-3 text-[14px] leading-[1.6] outline-none"
              />
              <span className="block border-t border-[#f1f2f4] bg-[#fbfbfc] px-3 py-1.5 text-right text-[12px] text-[#6b7480]">
                {greeting.length} / {GREETING_MAX}
              </span>
            </span>
            <span className="text-[12px] leading-[1.5] text-[#6b7480]">
              운영팀 채팅방을 처음 열 때(계정 기준 1회)와 FAQ 버튼을 누를 때 챗봇이 보내는 말이에요. 아래에 자주 묻는 질문 버튼이 이어서 붙어요.
            </span>
          </label>
          {error && <p className="text-[12px] text-red-600">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              disabled={busy || greeting.trim() === savedGreeting}
              onClick={() => void saveGreeting()}
              className="h-10 rounded-lg bg-[#1d2024] px-[18px] text-[14px] font-semibold text-white disabled:bg-[#eff1f4] disabled:text-[#99a2ad]"
            >
              저장
            </button>
          </div>
        </div>
      ) : (
        <div className="flex min-h-0 flex-1">
          <div className="flex min-w-0 flex-1 flex-col gap-2.5 overflow-y-auto py-5 pl-8 pr-6">
            <div className="flex items-center gap-2">
              <span className="text-[14px] font-bold">시작 화면에 보이는 질문</span>
              <span className="text-[13px] text-[#6b7480]">
                {visible.length} / {FAQ_VISIBLE_MAX} · 끌어서 순서를 바꿔요
              </span>
              <span className="relative ml-auto flex h-[30px] items-center gap-0.5 whitespace-nowrap rounded-md border border-[#dfe2e7] pl-2.5 pr-2 text-[12px] text-[#2f343c]">
                최근 30일
                <ChevronDown className="size-3 text-[#6b7480]" aria-hidden />
                <select aria-label="조회 기간" value="30" onChange={() => undefined} className="absolute inset-0 cursor-pointer opacity-0">
                  <option value="30">최근 30일</option>
                </select>
              </span>
            </div>
            <div className="overflow-hidden rounded-[10px] border border-[#eff1f4]">
              <div className="flex h-9 items-center gap-3 bg-[#f8f9fb] px-4 text-[12px] text-[#6b7480]">
                <span className="w-11 flex-none" />
                <span className="flex-1">질문</span>
                <span className="w-[72px] flex-none text-right">조회</span>
                <span className="w-16 flex-none text-right">노출</span>
              </div>
              {visible.length === 0 && <p className="p-4 text-[13px] text-[#99a2ad]">노출 중인 질문이 없어요.</p>}
              {visible.map((faq, index) => row(faq, index + 1))}
            </div>
            <span className="mt-2.5 text-[14px] font-bold">
              숨긴 질문 <span className="font-medium text-[#99a2ad]">{hidden.length + (editing?.kind === "add" ? 1 : 0)}</span>
            </span>
            <div className="overflow-hidden rounded-[10px] border border-[#eff1f4]">
              {hidden.map((faq) => row(faq, null))}
              {editing?.kind === "add" && (
                <div className="flex h-14 items-center gap-3 bg-[#f5f9ff] px-4 text-[#99a2ad] shadow-[inset_3px_0_0_#0079ff]">
                  <GripVertical className="size-4 text-[#dfe2e7]" aria-hidden />
                  <span className="w-[18px]" />
                  <span className="min-w-0 flex-1 truncate text-[14px] font-semibold text-[#0060cc]">{question.trim() || "새 질문"}</span>
                  <span className="w-[72px] text-right text-[13px] text-[#2f343c]">—</span>
                  <span className="w-16" />
                </div>
              )}
              {hidden.length === 0 && editing?.kind !== "add" && <p className="p-4 text-[13px] text-[#99a2ad]">숨긴 질문이 없어요.</p>}
            </div>
            {error && <p className="text-[12px] text-red-600">{error}</p>}
          </div>

          {editing && (
            <div className="flex w-[400px] flex-none flex-col gap-3.5 border-l border-[#eff1f4] px-6 py-5">
              <span className="text-[14px] font-bold">{editing.kind === "add" ? "질문 추가" : "질문 수정"}</span>
              <label className="flex flex-col gap-2">
                <span className="text-[13px] font-bold text-[#2f343c]">질문 (버튼 문구)</span>
                <span className="flex h-10 items-center rounded-lg border border-[#dfe2e7] px-3 focus-within:border-[#0079ff] focus-within:shadow-[0_0_0_3px_#e0edff]">
                  <input
                    value={question}
                    maxLength={QUESTION_MAX}
                    onChange={(event) => setQuestion(event.target.value)}
                    placeholder="고객이 누를 질문을 입력하세요"
                    className="min-w-0 flex-1 text-[14px] outline-none placeholder:text-[#99a2ad]"
                  />
                  <span className="text-[12px] text-[#99a2ad]">
                    {question.length} / {QUESTION_MAX}
                  </span>
                </span>
              </label>
              <div className="flex flex-col gap-2">
                <span className="text-[13px] font-bold text-[#2f343c]">답변</span>
                <div className="overflow-hidden rounded-lg border border-[#dfe2e7] focus-within:border-[#0079ff]">
                  <div className="flex gap-3 border-b border-[#f1f2f4] px-2.5 py-2 text-[13px] text-[#525a66]">
                    <button type="button" onClick={wrapBold} className="font-bold" aria-label="굵게">
                      B
                    </button>
                    <button type="button" onClick={insertBreak}>
                      줄바꿈
                    </button>
                  </div>
                  <textarea
                    ref={answerRef}
                    value={answer}
                    maxLength={ANSWER_MAX}
                    onChange={(event) => setAnswer(event.target.value)}
                    placeholder="질문을 누르면 챗봇이 보여줄 답변을 입력하세요"
                    className="block min-h-[120px] w-full resize-y p-3 text-[14px] leading-[1.6] outline-none placeholder:text-[#99a2ad]"
                  />
                </div>
                <span className="text-[12px] leading-[1.5] text-[#6b7480]">답변 아래에는 &apos;다른 질문 보기&apos; 버튼이 자동으로 붙어요.</span>
              </div>
              {editing.kind === "add" && (
                <div className="rounded-lg bg-[#f8f9fb] p-3 text-[12px] leading-[1.6] text-[#525a66]">
                  추가한 질문은 &apos;숨긴 질문&apos;에 들어가요. 내용을 확인한 뒤 노출을 켜면 시작 화면에 보여요. (시작 화면 최대 {FAQ_VISIBLE_MAX}개)
                </div>
              )}
              <div className="mt-auto flex items-center gap-2">
                {editing.kind === "edit" ? (
                  <button type="button" onClick={() => void remove()} className="text-[13px] text-[#d92d20]">
                    삭제
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setEditing(null)}
                    className="ml-auto h-10 rounded-lg border border-[#dfe2e7] px-4 text-[14px] text-[#2f343c]"
                  >
                    취소
                  </button>
                )}
                <button
                  type="button"
                  disabled={busy || !question.trim() || !answer.trim()}
                  onClick={() => void save()}
                  className={cn(
                    "h-10 rounded-lg bg-[#1d2024] px-[18px] text-[14px] font-semibold text-white disabled:bg-[#eff1f4] disabled:text-[#99a2ad]",
                    editing.kind === "edit" && "ml-auto",
                  )}
                >
                  {editing.kind === "add" ? "추가" : "저장"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
