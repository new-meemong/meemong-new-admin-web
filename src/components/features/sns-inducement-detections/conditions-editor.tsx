"use client";
import { useEffect, useState } from "react";
import type {
  DetectionConditions,
  DetectionRules,
} from "@/apis/snsInducementDetections";
import {
  useDetectionRules,
  useSaveDetectionRules,
} from "@/queries/snsInducementDetections";
import {
  changedConditions,
  FIELD_LABELS,
  validateConditions,
} from "@/lib/sns-inducement-detections";
import { Modal } from "@/components/shared/modal";
import { ModalHeader } from "@/components/shared/modal/modal-header";
import { ModalFooter } from "@/components/shared/modal/modal-footer";
import { ModalBody } from "@/components/shared/modal/modal-body";
import { useDialog } from "@/components/shared/dialog/context";
import { Button } from "@/components/ui/button";

export default function ConditionsEditor({
  mode,
  initial,
  onApply,
  onClose,
}: {
  mode: "shared" | "temporary";
  initial: DetectionConditions;
  onApply: (conditions: DetectionConditions) => void;
  onClose: () => void;
}) {
  const dialog = useDialog();
  const [confirmingClose, setConfirmingClose] = useState(false);
  const { refetch } = useDetectionRules();
  const save = useSaveDetectionRules();
  const [base, setBase] = useState<DetectionRules | null>(null);
  const [fields, setFields] = useState<string[]>([]);
  const [phrases, setPhrases] = useState("");
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    setError("");
    void refetch().then((result) => {
      if (!active) return;
      if (result.isError || !result.data) {
        setError("설정을 불러오지 못했습니다. 다시 시도해주세요.");
        return;
      }
      setBase(result.data);
      const value = mode === "shared" ? result.data : initial;
      setFields([...value.fieldList]);
      setPhrases(value.phraseList.join("\n"));
    });
    return () => {
      active = false;
    };
    // Snapshot only when opening/retrying, never overwrite an editor in progress.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refetch, attempt]);
  const draft = {
    fieldList: fields,
    phraseList: phrases
      .split(/\r?\n/)
      .filter((phrase) => phrase.trim().length > 0),
  };
  const validation = base
    ? validateConditions(draft, base.availableFieldList)
    : null;
  const change = base ? changedConditions(base, draft) : {};
  const close = async () => {
    if (save.isPending || confirmingClose) return;
    const original = mode === "shared" ? base : initial;
    if (
      base &&
      original &&
      Object.keys(changedConditions(original, draft)).length
    ) {
      setConfirmingClose(true);
      const discard = await dialog.confirm(
        "저장하지 않은 조건 변경을 버릴까요?",
        {
          title: "조건 변경 취소",
          confirmText: "변경 버리기",
          cancelText: "계속 편집",
        },
      );
      setConfirmingClose(false);
      if (!discard) return;
    }
    onClose();
  };
  async function submit() {
    if (!base || validation || save.isPending) return;
    if (mode === "temporary") {
      onApply(draft);
      onClose();
      return;
    }
    if (!Object.keys(change).length) return;
    try {
      await save.mutateAsync(change);
      onClose();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "저장하지 못했습니다.");
    }
  }
  return (
    <Modal
      isOpen
      size="lg"
      className="h-[800px] max-h-[calc(100dvh-32px)] w-[calc(100%-32px)] min-w-0"
      closable
      suspended={confirmingClose}
      onClose={() => void close()}
      onClickOutside={() => void close()}
    >
      <ModalHeader>
        {mode === "shared" ? "공통 조사 설정" : "이번 조사 조건 변경"}
      </ModalHeader>
      <ModalBody className="min-h-0">
        <p className="text-sm text-muted-foreground mb-4">
          {mode === "shared"
            ? "모든 관리자의 다음 조사부터 적용됩니다. 같은 배열을 동시에 수정하면 마지막 저장이 적용됩니다."
            : "공통 설정은 변경하지 않습니다. 새 조사에만 적용됩니다."}
        </p>
        {base ? (
          <>
            <p className="mb-4 text-xs text-muted-foreground">
              마지막 공통 설정 수정:{" "}
              {base.updatedAt
                ? new Date(base.updatedAt).toLocaleString("ko-KR", {
                    timeZone: "Asia/Seoul",
                  }) + " (한국 시간)"
                : "기본 설정"}
            </p>
            <fieldset
              disabled={save.isPending}
              className="grid gap-6 md:grid-cols-2"
            >
              <div className="space-y-4">
                <h3 className="font-semibold">
                  조사 대상 ({fields.length}개 필드)
                </h3>
                {base.categoryList.map((category) => {
                  const allowed = category.fieldList.filter((field) =>
                    base.availableFieldList.includes(field),
                  );
                  return (
                    <div
                      key={category.key}
                      className="rounded-lg border p-3 space-y-2"
                    >
                      <label className="flex items-center gap-2 font-medium">
                        <input
                          type="checkbox"
                          checked={
                            allowed.length > 0 &&
                            allowed.every((field) => fields.includes(field))
                          }
                          onChange={(event) =>
                            setFields((previous) =>
                              event.target.checked
                                ? [...new Set([...previous, ...allowed])]
                                : previous.filter(
                                    (field) => !allowed.includes(field),
                                  ),
                            )
                          }
                        />
                        {category.label}
                      </label>
                      {allowed.map((field) => (
                        <label key={field} className="flex gap-2 ml-5 text-sm">
                          <input
                            type="checkbox"
                            checked={fields.includes(field)}
                            onChange={(event) =>
                              setFields((previous) =>
                                event.target.checked
                                  ? [...previous, field]
                                  : previous.filter((value) => value !== field),
                              )
                            }
                          />
                          {FIELD_LABELS[field] ?? field}
                        </label>
                      ))}
                    </div>
                  );
                })}
              </div>
              <div className="space-y-2">
                <label htmlFor="detection-phrases" className="font-semibold">
                  탐지 키워드 ({draft.phraseList.length}/100)
                </label>
                <p className="text-sm text-muted-foreground">
                  한 줄에 한 문구, 문구당 최대 100자. 정규식이 아닌 문구 포함
                  여부를 조사합니다.
                </p>
                <textarea
                  id="detection-phrases"
                  rows={16}
                  className="w-full rounded-lg border p-3 text-sm"
                  value={phrases}
                  onChange={(event) => {
                    setPhrases(event.target.value);
                    setError("");
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  공백·문장부호·대소문자 차이를 무시합니다. 단순 소개나 부정
                  표현도 검토 후보에 포함될 수 있습니다.
                </p>
              </div>
            </fieldset>
            {validation && (
              <p role="alert" className="mt-3 text-sm text-red-600">
                {validation}
              </p>
            )}
          </>
        ) : (
          !error && <p role="status">최신 설정을 불러오는 중…</p>
        )}
        {error && (
          <div role="alert" className="my-3 text-sm text-red-600">
            {error}
            {!base && (
              <Button
                variant="outline"
                onClick={() => setAttempt((value) => value + 1)}
              >
                다시 시도
              </Button>
            )}
          </div>
        )}
      </ModalBody>
      <ModalFooter className="static mt-0 shrink-0 border-t bg-white rounded-b-2xl">
        <Button variant="outline" disabled={save.isPending} onClick={close}>
          취소
        </Button>
        <Button
          disabled={
            !base ||
            Boolean(validation) ||
            save.isPending ||
            (mode === "shared" && !Object.keys(change).length)
          }
          onClick={() => void submit()}
        >
          {save.isPending
            ? "저장 중…"
            : mode === "shared"
              ? "공통 설정 저장"
              : "이번 조사에 적용"}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
