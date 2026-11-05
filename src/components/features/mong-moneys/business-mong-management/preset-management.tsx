"use client";

import { ApiError } from "@/apis/core";
import { useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import {
  BusinessMongPreset,
  BusinessMongPresetValues,
} from "@/apis/businessMong";
import {
  businessMongQueries,
  useSaveBusinessMongPreset,
  useDeleteBusinessMongPreset,
} from "@/queries/businessMong";
import { CommonForm } from "@/components/shared/common-form";
import CommonTable from "@/components/shared/common-table";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { businessMongError } from "./validation";
import {
  businessMongPresetSchema,
  changedBusinessMongPresetFields,
} from "./preset-validation";

const defaults: BusinessMongPresetValues = {
  title: "",
  mongBaseAmount: 0,
  mongBonusAmount: 0,
  supplyAmountKRW: 0,
  sortOrder: 0,
  isHidden: false,
};
export default function BusinessMongPresetManagement() {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!pending) setOpen(next);
      }}
    >
      <Button type="button" variant="outline" onClick={() => setOpen(true)}>
        상품 관리
      </Button>
      {open && <BusinessMongPresetEditor onPendingChange={setPending} />}
    </Dialog>
  );
}
function BusinessMongPresetEditor({
  onPendingChange,
}: {
  onPendingChange: (pending: boolean) => void;
}) {
  const presets = useQuery(businessMongQueries.presets());
  const saveMutation = useSaveBusinessMongPreset();
  const deleteMutation = useDeleteBusinessMongPreset();
  const isPending = saveMutation.isPending || deleteMutation.isPending;
  const [deleting, setDeleting] = useState<BusinessMongPreset | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [editing, setEditing] = useState<BusinessMongPreset | null>(null);
  const [message, setMessage] = useState("");
  const busy = useRef(false);
  const form = useForm<BusinessMongPresetValues>({
    resolver: zodResolver(businessMongPresetSchema),
    defaultValues: defaults,
  });
  const values = useWatch({ control: form.control });
  const totalMong =
    Number(values.mongBaseAmount || 0) + Number(values.mongBonusAmount || 0);
  const supply = Number(values.supplyAmountKRW || 0);
  const vat = Math.round(supply * 0.1);
  const startNew = () => {
    setEditing(null);
    form.reset(defaults);
    setMessage("");
  };
  const edit = (preset: BusinessMongPreset) => {
    setEditing(preset);
    // 계산 필드와 서버 메타데이터는 폼/요청에 포함하지 않는다.
    form.reset({
      title: preset.title,
      mongBaseAmount: preset.mongBaseAmount,
      mongBonusAmount: preset.mongBonusAmount,
      supplyAmountKRW: preset.supplyAmountKRW,
      sortOrder: preset.sortOrder,
      isHidden: preset.isHidden,
    });
    setMessage("");
  };
  const save = async (next: BusinessMongPresetValues) => {
    if (busy.current) return;
    const changes = editing
      ? changedBusinessMongPresetFields(editing, next)
      : next;
    if (editing && Object.keys(changes).length === 0) {
      setMessage("변경된 내용이 없습니다.");
      return;
    }
    busy.current = true;
    onPendingChange(true);
    setMessage("");
    try {
      await saveMutation.mutateAsync(
        editing
          ? { kind: "update", id: editing.id, values: changes }
          : { kind: "create", values: next },
      );
      form.reset(defaults);
      setEditing(null);
      setMessage(editing ? "상품을 수정했습니다." : "상품을 등록했습니다.");
    } catch (error) {
      setMessage(
        `${businessMongError(error)} 저장 응답을 받지 못한 경우 목록을 새로고침해 반영 여부를 먼저 확인해주세요.`,
      );
    } finally {
      busy.current = false;
      onPendingChange(false);
    }
  };
  const deletePreset = async () => {
    if (!deleting || busy.current) return;
    busy.current = true;
    onPendingChange(true);
    setDeleteError("");
    try {
      await deleteMutation.mutateAsync(deleting.id);
      if (editing?.id === deleting.id) {
        form.reset(defaults);
        setEditing(null);
      }
      setMessage(`「${deleting.title}」 상품을 삭제했습니다.`);
      setDeleting(null);
    } catch (error) {
      if (
        error instanceof ApiError &&
        error.status === 404 &&
        error.code === "NOT_FOUND_ERROR"
      ) {
        if (editing?.id === deleting.id) {
          form.reset(defaults);
          setEditing(null);
        }
        setDeleting(null);
        setMessage(
          "이미 삭제되었거나 존재하지 않는 상품입니다. 목록을 갱신했습니다.",
        );
      } else {
        setDeleteError(
          `${businessMongError(error)} 목록을 새로고침해 삭제 여부를 확인해주세요.`,
        );
      }
    } finally {
      busy.current = false;
      onPendingChange(false);
    }
  };
  return (
    <DialogContent
      className="flex max-h-[90vh] flex-col sm:max-w-5xl"
      onInteractOutside={(event) => {
        if (isPending) event.preventDefault();
      }}
      onEscapeKeyDown={(event) => {
        if (isPending) event.preventDefault();
      }}
    >
      <DialogHeader>
        <DialogTitle>원장님 몽 상품 관리</DialogTitle>
        <DialogDescription>
          상품 저장 시 공개 상품 안내와 지급 등록의 상품 선택 목록에 반영됩니다.
          노출을 중단하려면 숨김으로 설정하세요.
        </DialogDescription>
      </DialogHeader>
      <div className="min-h-0 overflow-y-auto space-y-5">
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={startNew}
          >
            새 상품
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={presets.isFetching || isPending}
            onClick={() => presets.refetch()}
          >
            상품 목록 새로고침
          </Button>
        </div>
        {presets.isPending && <p>상품을 불러오는 중...</p>}
        {presets.isError && (
          <p role="alert">상품 조회 실패: {businessMongError(presets.error)}</p>
        )}
        {presets.data && (
          <div className="overflow-x-auto">
            <div className="min-w-[780px]">
              <CommonTable
                data={presets.data.dataList}
                columns={[
                  {
                    accessorKey: "title",
                    header: "상품명",
                    enableSorting: false,
                  },
                  {
                    accessorKey: "mongBaseAmount",
                    header: "기본 몽",
                    size: 95,
                    cell: ({ row }) =>
                      row.original.mongBaseAmount.toLocaleString(),
                    enableSorting: false,
                  },
                  {
                    accessorKey: "mongBonusAmount",
                    header: "보너스 몽",
                    size: 95,
                    cell: ({ row }) =>
                      row.original.mongBonusAmount.toLocaleString(),
                    enableSorting: false,
                  },
                  {
                    accessorKey: "supplyAmountKRW",
                    header: "공급가 (VAT 별도)",
                    size: 145,
                    cell: ({ row }) =>
                      row.original.supplyAmountKRW.toLocaleString() + "원",
                    enableSorting: false,
                  },
                  {
                    accessorKey: "paymentAmountKRW",
                    header: "입금액 (VAT 포함)",
                    size: 145,
                    cell: ({ row }) =>
                      row.original.paymentAmountKRW.toLocaleString() + "원",
                    enableSorting: false,
                  },
                  {
                    accessorKey: "sortOrder",
                    header: "순서",
                    size: 60,
                    enableSorting: false,
                  },
                  {
                    accessorKey: "isHidden",
                    header: "노출",
                    size: 65,
                    cell: ({ row }) =>
                      row.original.isHidden ? "숨김" : "공개",
                    enableSorting: false,
                  },
                  {
                    id: "actions",
                    header: "관리",
                    size: 140,
                    cell: ({ row }) => (
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={isPending}
                          onClick={() => edit(row.original)}
                          aria-label={`${row.original.title} 수정`}
                        >
                          수정
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="text-red-600"
                          disabled={isPending}
                          aria-label={`${row.original.title} 삭제`}
                          onClick={() => {
                            setDeleting(row.original);
                            setDeleteError("");
                          }}
                        >
                          삭제
                        </Button>
                      </div>
                    ),
                  },
                ]}
                emptyMessage="등록된 상품이 없습니다."
              />
            </div>
          </div>
        )}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(save)}
            className="rounded border p-4"
          >
            <h3 className="font-semibold">
              {editing ? `상품 #${editing.id} 수정` : "새 상품 등록"}
            </h3>
            <fieldset
              disabled={isPending}
              className="grid gap-x-4 md:grid-cols-2"
            >
              <CommonForm.Input name="title" label="상품명" maxLength={100} />
              <CommonForm.Input
                name="sortOrder"
                label="표시 순서 (작은 값부터)"
                type="number"
                min={0}
                max={2147483647}
                step={1}
              />
              <CommonForm.Input
                name="mongBaseAmount"
                label="기본 몽"
                type="number"
                min={1}
                max={2147483647}
                step={1}
              />
              <CommonForm.Input
                name="mongBonusAmount"
                label="보너스 몽"
                type="number"
                min={0}
                max={2147483647}
                step={1}
              />
              <CommonForm.Input
                name="supplyAmountKRW"
                label="공급가 (원, 부가세 별도)"
                type="number"
                min={1}
                max={2147483647}
                step={1}
              />
              <div className="mt-5">
                <CommonForm.CheckBox
                  name="isHidden"
                  label="노출 설정"
                  checkboxLabel="상품 숨김"
                  checked={values.isHidden}
                  disabled={isPending}
                  onChange={(checked) =>
                    form.setValue("isHidden", checked, { shouldDirty: true })
                  }
                />
              </div>
              <p className="md:col-span-2 my-4 text-sm">
                미리보기: 총 {totalMong.toLocaleString()}몽 · 부가세{" "}
                {vat.toLocaleString()}원 · 입금액{" "}
                {(supply + vat).toLocaleString()}원 (VAT 포함)
              </p>
              <div className="flex gap-2">
                <Button type="submit">
                  {isPending
                    ? "저장 중..."
                    : editing
                      ? "상품 수정 저장"
                      : "상품 등록"}
                </Button>
                {editing && (
                  <Button type="button" variant="outline" onClick={startNew}>
                    수정 취소
                  </Button>
                )}
              </div>
            </fieldset>
          </form>
        </Form>
        {message && (
          <p role="status" className="text-sm whitespace-pre-wrap">
            {message}
          </p>
        )}
      </div>
      <Dialog
        open={deleting !== null}
        onOpenChange={(next) => {
          if (!next && !isPending) setDeleting(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>사업자 몽 상품 삭제</DialogTitle>
            <DialogDescription>
              삭제한 상품은 공개 상품 안내와 관리자 상품 목록에서 제외됩니다.
            </DialogDescription>
          </DialogHeader>
          <p className="font-semibold break-words">{deleting?.title}</p>
          <p>
            상품 #{deleting?.id} · {deleting?.mongAmount.toLocaleString()}몽 ·{" "}
            {deleting?.paymentAmountKRW.toLocaleString()}원 (VAT 포함)
          </p>
          {deleteError && (
            <p role="alert" className="text-sm text-red-600">
              {deleteError}
            </p>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => setDeleting(null)}
            >
              취소
            </Button>
            <Button type="button" disabled={isPending} onClick={deletePreset}>
              {deleteMutation.isPending ? "삭제 중..." : "삭제 확정"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DialogContent>
  );
}
