"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import {
  BusinessMongGrant,
  BusinessMongGrantRequest,
} from "@/apis/businessMong";
import {
  businessMongQueries,
  useCreateBusinessMongGrant,
  useFindBusinessMongGrant,
} from "@/queries/businessMong";
import { CommonForm } from "@/components/shared/common-form";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  businessMongError,
  grantFormSchema,
  canReleaseBusinessMongGrantRequest,
} from "./validation";
import { usePendingBusinessMongRequest } from "./use-pending-request";

type GrantForm = z.infer<typeof grantFormSchema>;
export default function BusinessMongGrantForm({
  onCreated,
}: {
  onCreated: (grant: BusinessMongGrant) => void;
}) {
  const form = useForm<GrantForm>({
    resolver: zodResolver(grantFormSchema),
    defaultValues: {
      businessName: "",
      businessRegistrationNumber: "",
      mongAmount: 0,
      adminDescription: "",
    },
  });
  const presets = useQuery(businessMongQueries.presets());
  const mutation = useCreateBusinessMongGrant();
  const lookup = useFindBusinessMongGrant();
  const pending = usePendingBusinessMongRequest<BusinessMongGrantRequest>(
    "business-mong:grant-request",
  );
  const [confirmation, setConfirmation] = useState<GrantForm | null>(null);
  const [message, setMessage] = useState("");
  const [selectedPresetId, setSelectedPresetId] = useState("");
  const busy = useRef(false);
  const locked =
    !pending.ready ||
    !!pending.request ||
    mutation.isPending ||
    lookup.isPending;
  const complete = (grant: BusinessMongGrant) => {
    pending.clear();
    form.reset();
    setSelectedPresetId("");
    setMessage(
      `지급 건 #${grant.id} 등록을 확인했습니다. 상세에서 직원과 원장님에게 분배해주세요.`,
    );
    onCreated(grant);
  };
  const submit = async () => {
    if (busy.current || (!pending.request && !confirmation)) return;
    busy.current = true;
    setConfirmation(null);
    setMessage("");
    try {
      const request = pending.request ?? {
        ...confirmation!,
        requestKey: crypto.randomUUID(),
      };
      pending.save(request);
      const result = await mutation.mutateAsync(request);
      complete(result.data);
    } catch (error) {
      // 이전 응답이 유실된 요청은 재시도에서 인증 오류가 나도 보존한다.
      if (canReleaseBusinessMongGrantRequest(error, !!pending.request))
        pending.clear();
      setMessage(businessMongError(error));
    } finally {
      busy.current = false;
    }
  };
  const check = async () => {
    if (!pending.request || busy.current) return;
    busy.current = true;
    try {
      const grant = await lookup.mutateAsync(pending.request);
      if (grant) complete(grant);
      else
        setMessage(
          "모든 지급 내역에서 요청 키를 찾지 못했습니다. 같은 요청으로 재시도할 수 있습니다. 새 지급 건으로 등록하지 마세요.",
        );
    } catch (error) {
      setMessage(businessMongError(error));
    } finally {
      busy.current = false;
    }
  };
  return (
    <div className="rounded-10 border bg-white p-5 space-y-4">
      <h3 className="font-semibold">사업자 지급 등록</h3>
      <p className="text-sm text-gray-600">
        입금 확인 후 보너스를 포함한 총 몽을 등록하세요. 실제 회원 지급은 지급
        건 상세의 분배 확정 시 이루어집니다.
      </p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(setConfirmation)}>
          <fieldset disabled={locked} className="grid gap-x-5 md:grid-cols-2">
            <CommonForm.Input
              name="businessName"
              label="사업자명"
              maxLength={100}
            />
            <CommonForm.Input
              name="businessRegistrationNumber"
              label="사업자등록번호"
              placeholder="123-45-67890"
            />
            <label className="mt-5 flex flex-col gap-2 text-sm">
              상품 수량 불러오기 (선택)
              <select
                className="rounded border p-2"
                value={selectedPresetId}
                onChange={(event) => {
                  setSelectedPresetId(event.target.value);
                  const preset = presets.data?.dataList.find(
                    (item) => item.id === Number(event.target.value),
                  );
                  if (preset)
                    form.setValue("mongAmount", preset.mongAmount, {
                      shouldValidate: true,
                    });
                }}
              >
                <option value="">직접 입력</option>
                {presets.data?.dataList
                  .filter((item) => !item.isHidden)
                  .map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.title} · {item.mongAmount.toLocaleString()}몽 · 입금{" "}
                      {item.paymentAmountKRW.toLocaleString()}원 (VAT 포함)
                    </option>
                  ))}
              </select>
              {presets.isError && (
                <span>
                  상품을 불러오지 못했습니다. 총 몽을 직접 입력하거나{" "}
                  <button
                    type="button"
                    className="underline"
                    onClick={() => presets.refetch()}
                  >
                    다시 조회
                  </button>
                  하세요.
                </span>
              )}
            </label>
            <CommonForm.Input
              name="mongAmount"
              label="총 지급 몽 (보너스 포함)"
              type="number"
              min={1}
              max={2147483647}
              step={1}
              onChange={(event) => {
                setSelectedPresetId("");
                form.setValue("mongAmount", event.target.valueAsNumber, {
                  shouldDirty: true,
                  shouldValidate: true,
                });
              }}
            />
            <div className="md:col-span-2">
              <CommonForm.Textarea
                name="adminDescription"
                label="지급 사유 / 운영 메모"
                maxLength={2000}
              />
            </div>
            <Button className="mt-4 w-fit" type="submit">
              지급 등록 확인
            </Button>
          </fieldset>
        </form>
      </Form>
      {pending.request && (
        <div className="rounded border border-amber-300 bg-amber-50 p-3 text-sm space-y-2">
          <p>
            처리 결과 확인이 필요한 요청이 있습니다. 사업자:{" "}
            {pending.request.businessName} /{" "}
            {pending.request.businessRegistrationNumber} /{" "}
            {pending.request.mongAmount.toLocaleString()}몽
          </p>
          <p className="break-all">요청 키: {pending.request.requestKey}</p>
          <p>
            새 키로 재등록하지 마세요. 먼저 지급 내역에서 처리 결과를
            확인하세요.
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={mutation.isPending || lookup.isPending}
              onClick={check}
            >
              처리 결과 확인
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={mutation.isPending || lookup.isPending}
              onClick={submit}
            >
              동일 요청 재시도
            </Button>
          </div>
        </div>
      )}
      {(message || pending.storageError) && (
        <p role="status" className="text-sm whitespace-pre-wrap">
          {pending.storageError || message}
        </p>
      )}
      <Dialog
        open={!!confirmation}
        onOpenChange={(open) => {
          if (!open) setConfirmation(null);
        }}
      >
        <DialogContent>
          <DialogTitle>사업자 몽 지급 등록</DialogTitle>
          <DialogDescription>
            입금 확인을 마쳤는지 확인해주세요. 등록 후 분배 단계에서 회원에게
            실제 몽을 지급합니다.
          </DialogDescription>
          <p>
            {confirmation?.businessName} (
            {confirmation?.businessRegistrationNumber})
          </p>
          <p className="font-semibold">
            {confirmation?.mongAmount.toLocaleString()}몽
          </p>
          <p className="whitespace-pre-wrap break-words">
            {confirmation?.adminDescription}
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmation(null)}>
              취소
            </Button>
            <Button onClick={submit}>등록 확정</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
