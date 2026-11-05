"use client";

import { useRef, useState } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  BusinessMongGrant,
  BusinessMongDistributionRequest,
} from "@/apis/businessMong";
import { useDistributeBusinessMong } from "@/queries/businessMong";
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
  distributionFormSchema,
  canReleaseBusinessMongDistributionRequest,
  validateDistribution,
} from "./validation";
import { usePendingBusinessMongRequest } from "./use-pending-request";

type DistributionForm = z.infer<typeof distributionFormSchema>;
export default function BusinessMongDistributionForm({
  grant,
  onRefresh,
  historyConfirmed,
}: {
  grant: BusinessMongGrant;
  onRefresh: () => void;
  historyConfirmed: boolean;
}) {
  const form = useForm<DistributionForm>({
    resolver: zodResolver(distributionFormSchema),
    defaultValues: {
      title: "",
      adminDescription: "",
      owner: { displayName: "", phone: "" },
      recipientList: [],
    },
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "recipientList",
  });
  const recipients = useWatch({ control: form.control, name: "recipientList" });
  const staffAmount = (recipients ?? []).reduce(
    (sum, item) => sum + (Number(item.amount) || 0),
    0,
  );
  const mutation = useDistributeBusinessMong(grant.id);
  const pending =
    usePendingBusinessMongRequest<BusinessMongDistributionRequest>(
      `business-mong:distribution:${grant.id}`,
    );
  const [confirmation, setConfirmation] =
    useState<BusinessMongDistributionRequest | null>(null);
  const [message, setMessage] = useState("");
  const busy = useRef(false);
  const distributed =
    grant.distributedMongAmount > 0 || grant.remainingMongAmount <= 0;
  const locked =
    distributed || !pending.ready || !!pending.request || mutation.isPending;
  const preview = (values: DistributionForm) => {
    try {
      const request = validateDistribution(values, grant.remainingMongAmount);
      setConfirmation({ ...request, requestKey: crypto.randomUUID() });
      setMessage("");
    } catch (error) {
      setMessage(businessMongError(error));
    }
  };
  const submit = async () => {
    const request = pending.request ?? confirmation;
    if (!request || busy.current) return;
    busy.current = true;
    setConfirmation(null);
    setMessage("");
    try {
      pending.save(request);
      await mutation.mutateAsync(request);
      pending.clear();
      form.reset();
      setMessage("직원 및 원장님 몽 지급이 완료되었습니다.");
    } catch (error) {
      // 확정 거절은 재시도라도 수정할 수 있도록 보류 요청을 해제한다.
      if (canReleaseBusinessMongDistributionRequest(error, !!pending.request)) {
        form.reset({
          ...request,
          owner: request.owner ?? { displayName: "", phone: "" },
        });
        pending.clear();
      }
      setMessage(businessMongError(error));
    } finally {
      busy.current = false;
      onRefresh();
    }
  };
  return (
    <div className="space-y-3">
      <h4 className="font-semibold">직원 / 원장님 분배</h4>
      <p className="text-sm text-gray-600">
        지급 건별 한 번만 분배할 수 있습니다. 직원 배분 후 남은 몽은 원장님에게
        모두 지급됩니다. 직원 없이 원장님에게 전액 지급할 수도 있습니다.
      </p>
      {distributed && (
        <p className="rounded bg-gray-100 p-3 text-sm">
          이미 분배된 지급 건으로 추가 분배할 수 없습니다.
        </p>
      )}
      {!distributed && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(preview)}>
            <fieldset disabled={locked} className="space-y-3">
              <div className="grid gap-x-4 md:grid-cols-2">
                <CommonForm.Input
                  name="title"
                  label="직원에게 보이는 선물 문구"
                  placeholder="홍길동님의 선물"
                  maxLength={255}
                />
                <CommonForm.Input
                  name="adminDescription"
                  label="관리자 메모"
                  maxLength={255}
                />
              </div>
              <div className="flex justify-between items-center pt-3">
                <span>직원 {fields.length}명</span>
                <Button
                  type="button"
                  variant="outline"
                  disabled={fields.length >= 100}
                  onClick={() =>
                    append({ displayName: "", phone: "", amount: 1 })
                  }
                >
                  직원 추가
                </Button>
              </div>
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid items-end gap-3 rounded border px-3 pb-3 md:grid-cols-[1fr_1fr_1fr_auto]"
                >
                  <CommonForm.Input
                    name={`recipientList.${index}.displayName`}
                    label={`직원 ${index + 1} 닉네임`}
                    maxLength={100}
                  />
                  <CommonForm.Input
                    name={`recipientList.${index}.phone`}
                    label="전화번호"
                    type="tel"
                    maxLength={20}
                  />
                  <CommonForm.Input
                    name={`recipientList.${index}.amount`}
                    label="지급 몽"
                    type="number"
                    min={1}
                    max={2147483647}
                    step={1}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    aria-label={`직원 ${index + 1} 삭제`}
                    onClick={() => remove(index)}
                  >
                    삭제
                  </Button>
                </div>
              ))}
              <div className="rounded bg-gray-50 p-3">
                <p>
                  직원 합계: {staffAmount.toLocaleString()}몽 / 원장님 지급:{" "}
                  {Math.max(
                    0,
                    grant.remainingMongAmount - staffAmount,
                  ).toLocaleString()}
                  몽
                </p>
                {staffAmount > grant.remainingMongAmount && (
                  <p className="text-red-600">
                    직원 합계가 잔여 몽을 초과했습니다.
                  </p>
                )}
                {staffAmount < grant.remainingMongAmount && (
                  <div className="grid gap-x-4 md:grid-cols-2">
                    <CommonForm.Input
                      name="owner.displayName"
                      label="원장님 닉네임 (잔여 몽 수령)"
                      maxLength={100}
                    />
                    <CommonForm.Input
                      name="owner.phone"
                      label="원장님 전화번호"
                      type="tel"
                      maxLength={20}
                    />
                  </div>
                )}
              </div>
              <Button
                type="submit"
                disabled={staffAmount > grant.remainingMongAmount}
              >
                분배 내용 확인
              </Button>
            </fieldset>
          </form>
        </Form>
      )}
      {pending.request && (
        <div className="space-y-3 rounded border border-amber-300 bg-amber-50 p-3 text-sm">
          <p>
            처리 여부 확인이 필요한 요청입니다. 이력을 먼저 새로고침하거나
            동일한 내용으로 재시도하세요.
          </p>
          <p className="break-all">요청 키: {pending.request.requestKey}</p>
          <DistributionSummary
            request={pending.request}
            total={grant.mongAmount}
          />
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={mutation.isPending}
              onClick={onRefresh}
            >
              처리 이력 새로고침
            </Button>
            <Button
              type="button"
              disabled={mutation.isPending}
              onClick={submit}
            >
              동일 요청 재시도
            </Button>
            {distributed && historyConfirmed && (
              <Button
                type="button"
                variant="outline"
                disabled={mutation.isPending}
                onClick={() => {
                  pending.clear();
                  setMessage("서버의 분배 이력을 확인했습니다.");
                }}
              >
                이력 확인 완료
              </Button>
            )}
          </div>
        </div>
      )}
      {(pending.storageError || message) && (
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
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogTitle>몽 분배 최종 확인</DialogTitle>
          <DialogDescription>
            확정하면 아래 회원들에게 실제 몽이 지급됩니다. 한 명이라도 정보가
            맞지 않으면 전체 분배가 취소됩니다.
          </DialogDescription>
          <p>
            {grant.businessName} · 지급 건 #{grant.id}
          </p>
          {confirmation && (
            <DistributionSummary
              request={confirmation}
              total={grant.remainingMongAmount}
            />
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmation(null)}>
              수정
            </Button>
            <Button onClick={submit}>분배 확정</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
function DistributionSummary({
  request,
  total,
}: {
  request: BusinessMongDistributionRequest;
  total: number;
}) {
  const staffTotal = request.recipientList.reduce(
    (sum, item) => sum + item.amount,
    0,
  );
  return (
    <div className="space-y-2 text-sm break-words">
      <p>선물 문구: {request.title}</p>
      <p>메모: {request.adminDescription}</p>
      <ul className="space-y-1">
        {request.recipientList.map((item, index) => (
          <li key={index}>
            직원 {index + 1}: {item.displayName} / {item.phone} /{" "}
            {item.amount.toLocaleString()}몽
          </li>
        ))}
      </ul>
      {request.owner && (
        <p>
          원장님: {request.owner.displayName} / {request.owner.phone} /{" "}
          {(total - staffTotal).toLocaleString()}몽
        </p>
      )}
      <p className="font-semibold">총 {total.toLocaleString()}몽 지급</p>
    </div>
  );
}
