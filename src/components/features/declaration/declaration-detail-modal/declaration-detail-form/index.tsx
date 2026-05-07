"use client";

import { useForm } from "react-hook-form";
import React, {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { FormGroup } from "@/components/ui/form-group";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CommonForm } from "@/components/shared/common-form";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import ImageBox from "@/components/shared/image-box";
import { IUserReport } from "@/models/userReports";
import {
  CHATTING_ROOM_REPORT_MEMO_STORAGE_KEY,
  USER_REPORT_MEMO_STORAGE_KEY,
  USER_REPORT_STATUS_CHANGE_OPTIONS,
  getChattingRoomAdminUrl,
} from "@/constants/userReports";
import { IUserForm, UserRoleType } from "@/models/users";
import { formatDate } from "@/utils/date";
import { getUserRole } from "@/utils/user";
import { IChattingRoomReport } from "@/models/chattingRoomReports";
import {
  IReportAdminMemo,
  ReportManagementType,
  ReportStatus,
} from "@/models/reports";

type DeclarationReport = IUserReport | IChattingRoomReport;

type UserDetailWithAddress = IUserForm & {
  address?: string | null;
};

interface DeclarationDetailFormProps {
  formData: DeclarationReport;
  reportType: ReportManagementType;
  reporterUser?: IUserForm;
  reportedUser?: IUserForm;
  isSubmitting?: boolean;
  onSubmit: (form: {
    status: ReportStatus;
    memo?: string;
    onMemoSaved?: (memo: IReportAdminMemo) => void;
  }) => Promise<boolean>;
}

const formSchema = z.object({
  status: z.enum(["미열람", "보류", "완료"]),
  memo: z.string().optional(),
});

export default function DeclarationDetailForm({
  formData,
  reportType,
  reporterUser,
  reportedUser,
  isSubmitting,
  onSubmit,
}: DeclarationDetailFormProps) {
  const [memoHistory, setMemoHistory] = useState<IReportAdminMemo[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: "미열람",
      memo: "",
    },
    mode: "onChange",
  });

  const memoStorageKey =
    reportType === "MYPAGE"
      ? USER_REPORT_MEMO_STORAGE_KEY
      : CHATTING_ROOM_REPORT_MEMO_STORAGE_KEY;

  const reportImages = useMemo(() => {
    if (isUserReport(formData)) {
      return (formData.UserReportsImages || []).map((image) => ({
        id: image.id,
        src: image.imageUrl,
        title: `신고 이미지 ${image.id}`,
        deletable: false,
      }));
    }

    return (formData.ChattingRoomReportsImages || []).map((image) => ({
      id: image.id,
      src: image.imageUrl,
      title: `신고 이미지 ${image.id}`,
      deletable: false,
    }));
  }, [formData]);

  const reportDetailText = useMemo(() => {
    const texts = [formData.description, formData.reasonOtherText].filter(
      Boolean,
    );
    return texts.length > 0 ? texts.join("\n") : "-";
  }, [formData.description, formData.reasonOtherText]);

  const loadMemos = useCallback(
    (reportId: number) => {
      try {
        const raw = localStorage.getItem(memoStorageKey);
        const stored = raw
          ? (JSON.parse(raw) as Record<string, IReportAdminMemo[]>)
          : {};
        return stored[String(reportId)] ?? [];
      } catch {
        return [];
      }
    },
    [memoStorageKey],
  );

  const saveMemos = useCallback(
    (reportId: number, nextMemos: IReportAdminMemo[]) => {
      try {
        const raw = localStorage.getItem(memoStorageKey);
        const stored = raw
          ? (JSON.parse(raw) as Record<string, IReportAdminMemo[]>)
          : {};
        localStorage.setItem(
          memoStorageKey,
          JSON.stringify({
            ...stored,
            [String(reportId)]: nextMemos,
          }),
        );
      } catch {
        return;
      }
    },
    [memoStorageKey],
  );

  const handleMemoSaved = useCallback(
    (memo: IReportAdminMemo) => {
      const nextMemos = [memo, ...memoHistory];
      setMemoHistory(nextMemos);
      saveMemos(formData.id, nextMemos);
    },
    [formData.id, memoHistory, saveMemos],
  );

  const handleSubmit = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();

      const isSaved = await onSubmit({
        status: form.getValues("status"),
        memo: form.getValues("memo"),
        onMemoSaved: handleMemoSaved,
      });

      if (isSaved) {
        form.setValue("memo", "");
      }
    },
    [form, handleMemoSaved, onSubmit],
  );

  useEffect(() => {
    if (formData) {
      form.reset({
        status: formData.status,
        memo: "",
      });
      setMemoHistory(loadMemos(formData.id));
    }
  }, [formData, form, loadMemos]);

  if (!formData) {
    return "...loading";
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit}>
        <FormGroup>
          <CommonForm.ReadonlyRow
            label={"신고시간"}
            value={formData.createdAt}
            formatter={(value) =>
              value ? formatDate(value as string, "YYYY-MM-DD HH:mm:ss") : "-"
            }
          />
          {isChattingRoomReport(formData) && (
            <CommonForm.ReadonlyRow
              label={"채팅방"}
              value={formData.chattingRoomId}
              formatter={() => (
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={getChattingRoomAdminUrl(formData.chattingRoomId)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    이동
                  </a>
                </Button>
              )}
            />
          )}
          <CommonForm.ReadonlyRow
            label={"신고옵션"}
            value={formData.reason}
            formatter={(value) => String(value || "-")}
          />
          <CommonForm.ReadonlyRow
            label={"신고내용상세"}
            value={reportDetailText}
            formatter={(value) => (
              <div className={cn("whitespace-pre-wrap")}>
                {String(value || "-")}
              </div>
            )}
          />
          <CommonForm.ReadonlyRow
            label={"이미지"}
            value={reportImages}
            formatter={() => (
              <div className={cn("flex flex-wrap gap-4 py-[6px]")}>
                {reportImages.length > 0
                  ? reportImages.map((image, index) => (
                      <ImageBox
                        key={`${image.id}-${image.src}`}
                        src={image.src}
                        title={image.title}
                        images={reportImages}
                        index={index}
                      />
                    ))
                  : "-"}
              </div>
            )}
          />
        </FormGroup>

        <FormGroup title={"유저정보"} className={cn("mt-[24px]")}>
          <div className={cn("flex flex-col")}>
            <CommonForm.ReadonlyRow
              label={"신고자"}
              value={formData.userInfo}
              formatter={() => (
                <ReportUserSummary
                  fallbackId={formData.userInfo.userId}
                  fallbackName={formData.userInfo.displayName}
                  user={reporterUser}
                />
              )}
            />
            <CommonForm.ReadonlyRow
              label={"피신고자"}
              value={isUserReport(formData) ? formData.reportedUserId : "-"}
              formatter={() =>
                isUserReport(formData) ? (
                  <ReportUserSummary
                    fallbackId={formData.reportedUserId}
                    fallbackName={formData.reportedUserInfo?.displayName}
                    user={reportedUser}
                  />
                ) : (
                  "-"
                )
              }
            />
          </div>
        </FormGroup>

        <FormGroup title={"처리상태"} className={cn("mt-[24px]")}>
          <div className={cn("grid grid-cols-[1fr_180px] items-start gap-4")}>
            <CommonForm.Textarea
              name={"memo"}
              label={"메모"}
              className={cn("mt-0")}
              textareaClassName={cn("h-[120px] min-h-[120px]")}
            />
            <CommonForm.SelectBox
              name={"status"}
              label={"상태"}
              options={USER_REPORT_STATUS_CHANGE_OPTIONS}
              defaultValue={formData.status}
            />
          </div>

          <div className={cn("mt-[16px] flex flex-col gap-2")}>
            {memoHistory.length > 0 ? (
              memoHistory.map((memo) => (
                <div
                  key={memo.id}
                  className={cn(
                    "rounded-md border px-3 py-2 typo-body-2-regular",
                  )}
                >
                  <div
                    className={cn(
                      "mb-1 flex items-center justify-between text-foreground-sub",
                    )}
                  >
                    <span>
                      {formatDate(memo.createdAt, "YYYY-MM-DD HH:mm:ss")}
                    </span>
                    <span>{memo.status}</span>
                  </div>
                  <div className={cn("whitespace-pre-wrap")}>{memo.memo}</div>
                </div>
              ))
            ) : (
              <div className={cn("text-foreground-sub")}>
                저장된 메모가 없습니다.
              </div>
            )}
          </div>
        </FormGroup>

        <div className={cn("mt-[20px]")}>
          <Button
            type={"submit"}
            variant={"default"}
            className={cn("w-full")}
            disabled={isSubmitting}
          >
            확인
          </Button>
        </div>
      </form>
    </Form>
  );
}

function ReportUserSummary({
  fallbackId,
  fallbackName,
  user,
}: {
  fallbackId?: number;
  fallbackName?: string;
  user?: IUserForm;
}) {
  const userDetail = user as UserDetailWithAddress | undefined;

  if (!user && !fallbackId && !fallbackName) {
    return "-";
  }

  const displayName = user?.displayName || fallbackName || "-";
  const infoItems = [
    {
      label: "회원번호",
      value: fallbackId ? formatUserId(fallbackId, user?.role) : "-",
    },
    { label: "지역", value: userDetail?.address || "-" },
    {
      label: "가입일",
      value: user?.createdAt
        ? formatDate(user.createdAt, "YYYY-MM-DD HH:mm")
        : "-",
    },
    {
      label: "최근로그인",
      value: user?.recentLoginTime
        ? formatDate(user.recentLoginTime, "YYYY-MM-DD HH:mm:ss")
        : "-",
    },
    { label: "연락처", value: user?.phone || "-" },
  ];

  return (
    <div className={cn("flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1")}>
      <span className={cn("shrink-0 font-medium text-foreground")}>
        {displayName}
      </span>
      <span
        className={cn(
          "flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-foreground-sub",
        )}
      >
        {infoItems.map((item) => (
          <span key={item.label} className={cn("whitespace-nowrap")}>
            <span className={cn("mr-1 text-foreground-sub")}>{item.label}</span>
            <span className={cn("text-foreground")}>{item.value}</span>
          </span>
        ))}
      </span>
    </div>
  );
}

function formatUserId(userId: number, role?: UserRoleType) {
  if (!role) return String(userId);

  if (getUserRole(role) === "MODEL") {
    return `M-${userId}`;
  }

  if (getUserRole(role) === "DESIGNER") {
    return `D-${userId}`;
  }

  return String(userId);
}

function isUserReport(report: DeclarationReport): report is IUserReport {
  return "reportedUserId" in report;
}

function isChattingRoomReport(
  report: DeclarationReport,
): report is IChattingRoomReport {
  return "chattingRoomId" in report;
}
