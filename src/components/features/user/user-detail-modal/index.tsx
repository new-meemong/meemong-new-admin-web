"use client";

import React, { lazy, Suspense, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import type { SupportAdminIdentity } from "@/lib/firebase/support-chat";
import type { UserProfileDetailTarget } from "@/models/user-profile";
import type { IUserForm } from "@/models/users";
import { cn } from "@/lib/utils";
import { Modal } from "@/components/shared/modal";
import { ModalHeader } from "@/components/shared/modal/modal-header";
import { ModalBody } from "@/components/shared/modal/modal-body";
import UserAppPreview from "@/components/features/user/user-app-preview";
import { ChevronRight } from "lucide-react";
import { useGetUserDetailQuery } from "@/queries/users";
import UserDetailForm from "@/components/features/user/user-detail-form";
import { Button } from "@/components/ui/button";

const UserProfileLinkedDetail = lazy(() => import("./linked-detail"));

const SupportChatOutreachDialog = lazy(
  () =>
    import("@/components/features/support-chat/support-chat-outreach-dialog"),
);

interface UserDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
  userId: number;
  onRefresh: () => void;
}

function UserDetailModal({
  className,
  userId,
  onRefresh,
  isOpen,
  onClose,
}: UserDetailModalProps) {
  const [linkedDetail, setLinkedDetail] =
    useState<UserProfileDetailTarget | null>(null);
  useEffect(() => {
    setLinkedDetail(null);
  }, [userId, isOpen]);
  const detailTrigger = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (!linkedDetail && isOpen && detailTrigger.current?.isConnected)
      detailTrigger.current.focus();
  }, [linkedDetail, isOpen]);
  const openRef = useRef(isOpen);
  openRef.current = isOpen;
  const getUserDetailQuery = useGetUserDetailQuery(userId, {
    enabled: isOpen && userId > 0,
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
      if (revision !== outreachRevision.current || !openRef.current) return;
      // 상세창과 발송창의 Escape·포커스 처리가 겹치지 않게 상세창을 닫고 전환한다.
      onClose();
      setOutreach({ admin, recipient: user });
    } catch {
      toast.error("운영팀 채팅 연결에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setStartingOutreach(false);
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        suspended={Boolean(linkedDetail)}
        onClose={onClose}
        onClickOutside={onClose}
        closable
        size="lg"
        className={cn("h-[calc(100dvh-32px)] max-h-[1040px]", className)}
      >
        <ModalHeader>
          <div className="flex w-full items-center justify-between pr-4">
            <span className="flex items-center gap-2">
              회원 관리 <ChevronRight /> 상세
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={getUserDetailQuery.isFetching}
                onClick={() => void getUserDetailQuery.refetch()}
              >
                새로고침
              </Button>
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
          </div>
        </ModalHeader>
        <ModalBody className="flex min-h-0 gap-8 overflow-hidden space-y-0">
          {user && !getUserDetailQuery.isError ? (
            <>
              <section
                aria-label="앱 프로필 미리보기"
                className="flex min-h-0 w-[420px] shrink-0 justify-center"
              >
                <UserAppPreview
                  key={userId}
                  user={user}
                  onOpenDetail={(target) => {
                    detailTrigger.current =
                      document.activeElement as HTMLElement | null;
                    setLinkedDetail(target);
                  }}
                />
              </section>
              <section
                aria-label="회원 정보 수정"
                className="min-w-0 flex-1 overflow-y-auto"
              >
                <h3 className="mb-4 typo-title-2-semibold">수정하기</h3>
                <UserDetailForm
                  key={userId}
                  formData={user}
                  onSubmit={(event) => event.preventDefault()}
                  onRefresh={() => {
                    void getUserDetailQuery.refetch();
                    onRefresh();
                  }}
                />
              </section>
            </>
          ) : getUserDetailQuery.isError ? (
            <div role="alert">
              회원 정보를 불러오지 못했습니다.
              <Button onClick={() => void getUserDetailQuery.refetch()}>
                다시 시도
              </Button>
            </div>
          ) : (
            <p role="status">회원 정보를 불러오는 중…</p>
          )}
        </ModalBody>
      </Modal>
      {isOpen && linkedDetail && (
        <Suspense
          fallback={
            <Modal isOpen onClose={() => setLinkedDetail(null)} closable>
              <ModalHeader>상세</ModalHeader>
              <p role="status" className="p-6">
                상세를 불러오는 중…
              </p>
            </Modal>
          }
        >
          <UserProfileLinkedDetail
            target={linkedDetail}
            onClose={() => {
              setLinkedDetail(null);
              void getUserDetailQuery.refetch();
              onRefresh();
            }}
            onRefresh={() => {
              void getUserDetailQuery.refetch();
              onRefresh();
            }}
          />
        </Suspense>
      )}
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

export default UserDetailModal;
