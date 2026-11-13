"use client";

import React, { lazy, Suspense, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import type { SupportAdminIdentity } from "@/lib/firebase/support-chat";
import type { IUserForm } from "@/models/users";
import { cn } from "@/lib/utils";
import { useDrawer } from "@/stores/drawer";
import RightDrawer, {
  RightDrawerProps,
} from "@/components/shared/right-drawer";
import { ChevronRight } from "lucide-react";
import { useGetUserDetailQuery } from "@/queries/users";
import UserDetailForm from "@/components/features/user/user-detail-form";
import { Button } from "@/components/ui/button";

const SupportChatOutreachDialog = lazy(
  () =>
    import("@/components/features/support-chat/support-chat-outreach-dialog"),
);

interface UserRightDrawerProps extends RightDrawerProps {
  userId: number;
  onRefresh: () => void;
}

function UserRightDrawer({
  className,
  userId,
  onRefresh,
  ...props
}: UserRightDrawerProps) {
  const { closeDrawer, isOpen } = useDrawer();
  const getUserDetailQuery = useGetUserDetailQuery(userId, {
    enabled: isOpen,
  });

  const [startingOutreach, setStartingOutreach] = useState(false);
  const [outreach, setOutreach] = useState<{
    admin: SupportAdminIdentity;
    recipient: IUserForm;
  } | null>(null);
  const outreachRevision = useRef(0);
  useEffect(() => {
    outreachRevision.current += 1;
    return () => {
      outreachRevision.current += 1;
    };
  }, [userId, isOpen]);
  const user = getUserDetailQuery.data;
  const canContact =
    user != null && !user.isWithdraw && (user.role === 1 || user.role === 2);

  const startOutreach = async () => {
    if (!canContact || !user || startingOutreach) return;
    const revision = outreachRevision.current;
    setStartingOutreach(true);
    try {
      const { ensureSupportAdminSession } = await import(
        "@/lib/firebase/support-chat"
      );
      const admin = await ensureSupportAdminSession();
      if (revision !== outreachRevision.current || !useDrawer.getState().isOpen)
        return;
      // 상세창과 발송창의 Escape·포커스 처리가 겹치지 않게 상세창을 닫고 전환한다.
      closeDrawer();
      setOutreach({ admin, recipient: user });
    } catch {
      toast.error("운영팀 채팅 연결에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setStartingOutreach(false);
    }
  };

  return (
    <>
      <RightDrawer
        className={cn("w-full max-w-[1000px]", className)}
        onClose={closeDrawer}
        title={
          <>
            회원 관리 <ChevronRight /> 상세
          </>
        }
        headerActions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!canContact || startingOutreach}
              onClick={() => void startOutreach()}
            >
              {startingOutreach ? "연결 중…" : "먼저 연락하기"}
            </Button>
            <Button asChild variant="outline" size="sm">
              <a
                href={`https://meemong-chat-admin.vercel.app/user-chat-list/${userId}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                전체 채팅방 보기
              </a>
            </Button>
          </div>
        }
        {...props}
      >
        {getUserDetailQuery.data ? (
          <UserDetailForm
            key={userId}
            formData={getUserDetailQuery.data!}
            onSubmit={() => {
              closeDrawer();
            }}
            onRefresh={() => {
              void getUserDetailQuery.refetch();
              onRefresh();
            }}
          />
        ) : (
          <div>...loading</div>
        )}
      </RightDrawer>
      {outreach && (
        <Suspense fallback={<p role="status">연락창을 불러오는 중…</p>}>
          <SupportChatOutreachDialog
            key={outreach.recipient.id}
            open
            admin={outreach.admin}
            recipient={outreach.recipient}
            onOpenChange={(open) => {
              if (!open) setOutreach(null);
            }}
            onSent={() => {
              toast.success("메시지를 보냈습니다.");
              onRefresh();
            }}
          />
        </Suspense>
      )}
    </>
  );
}

export default UserRightDrawer;
