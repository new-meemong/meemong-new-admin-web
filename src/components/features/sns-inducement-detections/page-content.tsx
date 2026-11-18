"use client";
import { lazy, Suspense, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import type {
  DetectionCandidate,
  DetectionConditions,
  DetectionEvidence,
} from "@/apis/snsInducementDetections";
import type { ContentDetailTarget } from "@/models/content-detail";
import {
  useDetectionInvestigation,
  useDetectionRules,
} from "@/queries/snsInducementDetections";
import {
  categoryForField,
  evidenceKey,
  evidenceTarget,
  FIELD_LABELS,
  highlightRanges,
  validateConditions,
} from "@/lib/sns-inducement-detections";
import { USER_TYPE_MAP } from "@/constants/users";
import { useDialog } from "@/components/shared/dialog/context";
import { Button } from "@/components/ui/button";
import CommonTable from "@/components/shared/common-table";
import CommonPagination from "@/components/shared/common-pagination";
import ConditionsEditor from "./conditions-editor";
import { useInvestigationLeaveGuard } from "./use-investigation-leave-guard";
const ContentLinkedDetail = lazy(
  () => import("@/components/features/contents/content-linked-detail"),
);
const UserDetailModal = lazy(
  () => import("@/components/features/user/user-detail-modal"),
);
const statuses = {
  idle: "조사 전",
  running: "조사 중",
  paused: "일시정지",
  failed: "조사 중단",
  complete: "조사 완료",
};
const roleLabel = (role: number) => USER_TYPE_MAP[role] ?? `회원 유형 ${role}`;
const noop = () => {};
function EvidenceText({ evidence }: { evidence: DetectionEvidence }) {
  const ranges = useMemo(
    () => highlightRanges(evidence.text, evidence.matchedPhraseList),
    [evidence],
  );
  let previous = 0;
  return (
    <p className="whitespace-pre-wrap break-words text-sm leading-6">
      {ranges.map(([start, end]) => {
        const prefix = evidence.text.slice(previous, start);
        previous = end;
        return (
          <span key={start}>
            {prefix}
            <mark className="rounded bg-amber-100 text-inherit">
              {evidence.text.slice(start, end)}
            </mark>
          </span>
        );
      })}
      {evidence.text.slice(previous)}
    </p>
  );
}
export default function DetectionPageContent() {
  const dialog = useDialog();
  const [confirmingStart, setConfirmingStart] = useState(false);
  const rules = useDetectionRules();
  const investigation = useDetectionInvestigation();
  const [temporary, setTemporary] = useState<DetectionConditions | null>(null);
  const [editor, setEditor] = useState<"shared" | "temporary" | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [detail, setDetail] = useState<ContentDetailTarget | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [phrase, setPhrase] = useState("");
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);
  const running = investigation.status === "running";
  useInvestigationLeaveGuard(
    running ||
      investigation.candidates.length > 0 ||
      investigation.status === "paused",
  );
  const conditions = temporary ?? rules.data;
  const filtered = useMemo(
    () =>
      investigation.candidates.filter((candidate) => {
        if (
          !`${candidate.userDisplayName} ${candidate.userId}`
            .toLowerCase()
            .includes(search.trim().toLowerCase())
        )
          return false;
        return candidate.evidenceList.some(
          (evidence) =>
            (!category ||
              (rules.data &&
                categoryForField(rules.data, evidence.field)?.key ===
                  category)) &&
            (!phrase || evidence.matchedPhraseList.includes(phrase)),
        );
      }),
    [investigation.candidates, search, category, phrase, rules.data],
  );
  const selectedUser = investigation.candidates.find(
    (candidate) => candidate.userId === selected,
  );
  const resultPhrases = [
    ...new Set(
      investigation.candidates.flatMap((candidate) =>
        candidate.evidenceList.flatMap(
          (evidence) => evidence.matchedPhraseList,
        ),
      ),
    ),
  ];
  const columns: ColumnDef<DetectionCandidate>[] = [
    {
      accessorKey: "userDisplayName",
      header: "계정",
      cell: ({ row }) => (
        <span>
          {row.original.userDisplayName || "이름 없음"}
          <br />
          <span className="text-xs text-muted-foreground">
            #{row.original.userId}
          </span>
        </span>
      ),
    },
    {
      accessorKey: "userRole",
      header: "회원 유형",
      size: 100,
      cell: ({ row }) => roleLabel(row.original.userRole),
    },
    {
      id: "categories",
      header: "발견 분야",
      cell: ({ row }) =>
        [
          ...new Set(
            row.original.evidenceList.map((item) =>
              rules.data
                ? (categoryForField(rules.data, item.field)?.label ??
                  item.field)
                : item.field,
            ),
          ),
        ].join(", "),
    },
    {
      id: "phrases",
      header: "일치 키워드",
      cell: ({ row }) =>
        [
          ...new Set(
            row.original.evidenceList.flatMap((item) => item.matchedPhraseList),
          ),
        ].join(", "),
    },
    {
      id: "count",
      header: "근거 수",
      size: 80,
      accessorFn: (row) => row.evidenceList.length,
    },
    {
      id: "detail",
      header: "상세",
      size: 100,
      cell: ({ row }) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => setSelected(row.original.userId)}
        >
          근거 보기
        </Button>
      ),
    },
  ];
  async function start() {
    if (!rules.data || !conditions || running || confirmingStart) return;
    if (investigation.status !== "idle") {
      setConfirmingStart(true);
      const restart = await dialog.confirm(
        "기존 조사 결과를 지우고 새 조사를 시작할까요?",
        {
          title: "새 조사 시작",
          confirmText: "새 조사",
          cancelText: "결과 유지",
        },
      );
      setConfirmingStart(false);
      if (!restart) return;
    }
    setSelected(null);
    setPage(1);
    setSearch("");
    setCategory("");
    setPhrase("");
    await investigation.start(
      conditions,
      Math.min(rules.data.scanLimit, rules.data.maxScanLimit),
    );
  }
  const validation =
    conditions && rules.data
      ? validateConditions(conditions, rules.data.availableFieldList)
      : null;
  const currentPage = Math.min(
    page,
    Math.max(1, Math.ceil(filtered.length / size)),
  );
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap justify-between items-start gap-3">
        <p className="text-sm text-muted-foreground">
          외부 서비스 안내 문구를 찾아 계정별 검토 후보를 확인합니다. 자동 위반
          확정·제재는 실행하지 않습니다.
        </p>
        <Button
          variant="outline"
          disabled={!rules.data}
          onClick={() => setEditor("shared")}
        >
          조사 설정
        </Button>
      </div>
      {rules.isError && (
        <div role="alert" className="rounded-lg border p-4">
          설정을 불러오지 못했습니다. {rules.error.message}
          <Button variant="outline" onClick={() => void rules.refetch()}>
            다시 시도
          </Button>
        </div>
      )}
      {rules.isPending && <p role="status">조사 설정을 불러오는 중…</p>}
      {conditions && (
        <section
          aria-label="조사 조건"
          className="rounded-xl border p-5 space-y-3"
        >
          <div className="flex flex-wrap justify-between gap-3">
            <h2 className="font-semibold">
              다음 조사 조건 · {temporary ? "이번 조사 전용" : "공통 설정"}
            </h2>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={running}
                onClick={() => setEditor("temporary")}
              >
                이번 조사 조건 변경
              </Button>
              {temporary && (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={running}
                  onClick={() => setTemporary(null)}
                >
                  공통 설정 사용
                </Button>
              )}
            </div>
          </div>
          <p className="text-sm">
            {rules.data?.categoryList
              .filter((item) =>
                item.fieldList.some((field) =>
                  conditions.fieldList.includes(field),
                ),
              )
              .map((item) => item.label)
              .join(" · ")}{" "}
            · {conditions.fieldList.length}개 필드
          </p>
          <details className="text-sm">
            <summary className="cursor-pointer">
              키워드 {conditions.phraseList.length}개 보기
            </summary>
            <p className="mt-2 whitespace-pre-wrap break-words text-muted-foreground">
              {conditions.phraseList.join(" · ")}
            </p>
          </details>
          {validation && (
            <p role="alert" className="text-sm text-red-600">
              {validation}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              disabled={
                running ||
                confirmingStart ||
                rules.isError ||
                Boolean(validation)
              }
              onClick={() => void start()}
            >
              {investigation.status === "idle" ? "조사 시작" : "새 조사 시작"}
            </Button>
            {running && (
              <Button
                variant="outline"
                disabled={investigation.pausing}
                onClick={investigation.pause}
              >
                {investigation.pausing ? "현재 요청 후 정지…" : "일시정지"}
              </Button>
            )}
            {(investigation.status === "paused" ||
              (investigation.status === "failed" &&
                investigation.retryable)) && (
              <Button
                variant="outline"
                onClick={() => void investigation.resume()}
              >
                {investigation.status === "failed"
                  ? "같은 조건으로 재시도"
                  : "이어서 조사"}
              </Button>
            )}
            <span className="text-xs text-muted-foreground">
              검사 단위{" "}
              {rules.data &&
                Math.min(
                  rules.data.scanLimit,
                  rules.data.maxScanLimit,
                ).toLocaleString()}
              개 · 마지막 페이지까지 자동 조사
            </span>
          </div>
        </section>
      )}
      <section
        aria-label="조사 진행 현황"
        className="rounded-xl border bg-muted/30 p-5 space-y-2"
      >
        <div role="status" className="flex flex-wrap gap-6">
          <strong>{statuses[investigation.status]}</strong>
          <span>검사 {investigation.scanned.toLocaleString()}개</span>
          <span>
            검토 후보 {investigation.candidates.length.toLocaleString()}명
          </span>
          <span>
            근거{" "}
            {investigation.candidates
              .reduce((count, item) => count + item.evidenceList.length, 0)
              .toLocaleString()}
            건
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          {investigation.status === "complete"
            ? "선택한 대상의 전체 조사가 끝났습니다. 조사 중 변경된 원본은 다음 전체 조사에서 재확인해주세요."
            : "완료 전에는 현재까지 검사한 범위의 결과입니다."}{" "}
          결과는 이 화면에서만 유지됩니다.
        </p>
        {investigation.appliedRules && (
          <details className="text-xs">
            <summary className="cursor-pointer">
              현재 결과에 적용된 조건
            </summary>
            <p className="mt-2 break-words">
              필드:{" "}
              {investigation.appliedRules.fieldList
                .map((field) => FIELD_LABELS[field] ?? field)
                .join(", ")}
            </p>
            <p className="mt-2 break-words">
              키워드: {investigation.appliedRules.phraseList.join(" · ")}
            </p>
          </details>
        )}
        {investigation.error && (
          <p role="alert" className="text-sm text-red-600">
            {investigation.error}
          </p>
        )}
      </section>
      <div className="flex flex-wrap gap-3 items-center">
        <label className="text-sm">
          수집한 결과 내 검색{" "}
          <input
            className="ml-2 rounded-md border p-2"
            placeholder="계정명 / 회원 ID"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
          />
        </label>
        <select
          aria-label="발견 분야 필터"
          className="rounded-md border p-2 text-sm"
          value={category}
          onChange={(event) => {
            setCategory(event.target.value);
            setPage(1);
          }}
        >
          <option value="">모든 분야</option>
          {rules.data?.categoryList.map((item) => (
            <option key={item.key} value={item.key}>
              {item.label}
            </option>
          ))}
        </select>
        <select
          aria-label="일치 키워드 필터"
          className="max-w-64 rounded-md border p-2 text-sm"
          value={phrase}
          onChange={(event) => {
            setPhrase(event.target.value);
            setPage(1);
          }}
        >
          <option value="">모든 키워드</option>
          {resultPhrases.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <span className="text-sm text-muted-foreground">
          {filtered.length}명
        </span>
      </div>
      <div className="flex flex-col xl:flex-row gap-5 items-start">
        <div className="w-full min-w-0 flex-1">
          <div className="overflow-x-auto">
            <div className="min-w-[760px]">
              <CommonTable
                data={filtered.slice(
                  (currentPage - 1) * size,
                  currentPage * size,
                )}
                columns={columns}
                onClickRow={(row) => setSelected(row.original.userId)}
                emptyMessage={
                  investigation.status === "idle"
                    ? "조사를 시작하면 검토 후보가 표시됩니다."
                    : investigation.status === "complete"
                      ? "조건에 맞는 검토 후보가 없습니다."
                      : "현재까지 조건에 맞는 후보가 없습니다. 전체 조사 완료 여부를 확인해주세요."
                }
              />
            </div>
          </div>
          <CommonPagination
            currentPage={currentPage}
            totalCount={filtered.length}
            pageSize={size}
            onPageChange={setPage}
            onSizeChange={(value) => {
              setSize(value);
              setPage(1);
            }}
          />
        </div>
        {selectedUser && (
          <aside
            aria-label="계정별 조사 근거"
            className="w-full xl:w-[420px] shrink-0 rounded-xl border p-5 space-y-4 xl:sticky xl:top-4 max-h-[80vh] overflow-auto"
          >
            <div className="flex justify-between gap-2">
              <h2 className="font-semibold">
                {selectedUser.userDisplayName || "이름 없음"} · #
                {selectedUser.userId}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelected(null)}
              >
                닫기
              </Button>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setUserId(selectedUser.userId)}
            >
              회원 상세 보기
            </Button>
            <p className="text-xs text-muted-foreground">
              탐지 당시 원문입니다. 원본이 수정·삭제되어도 현재 조사 근거는
              유지됩니다.
            </p>
            {selectedUser.evidenceList.map((evidence) => {
              const target = evidenceTarget(evidence, selectedUser.userId);
              const profile = ["DesignerProfiles", "DesignerInfos"].includes(
                evidence.tableName,
              );
              return (
                <article
                  key={evidenceKey(evidence)}
                  className="rounded-lg border p-3 space-y-3"
                >
                  <p className="text-xs text-muted-foreground">
                    {rules.data &&
                      categoryForField(rules.data, evidence.field)?.label}{" "}
                    · {FIELD_LABELS[evidence.field] ?? evidence.field} · #
                    {evidence.recordId}
                  </p>
                  <EvidenceText evidence={evidence} />
                  <div className="flex flex-wrap gap-1">
                    {evidence.matchedPhraseList.map((item, index) => (
                      <span
                        className="rounded bg-amber-50 px-2 py-1 text-xs text-amber-900"
                        key={`${index}:${item}`}
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!target && !profile}
                    onClick={() =>
                      profile
                        ? setUserId(selectedUser.userId)
                        : setDetail(target)
                    }
                  >
                    원본 상세 보기
                  </Button>
                </article>
              );
            })}
          </aside>
        )}
      </div>
      {editor && conditions && (
        <ConditionsEditor
          mode={editor}
          initial={conditions}
          onApply={setTemporary}
          onClose={() => setEditor(null)}
        />
      )}
      <Suspense fallback={<p role="status">상세 화면을 불러오는 중…</p>}>
        {detail && (
          <ContentLinkedDetail
            target={detail}
            onClose={() => setDetail(null)}
            onRefresh={noop}
          />
        )}
        {userId !== null && (
          <UserDetailModal
            isOpen
            userId={userId}
            onClose={() => setUserId(null)}
            onRefresh={noop}
          />
        )}
      </Suspense>
    </div>
  );
}
