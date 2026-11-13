"use client";

import type { UserProfileDetailTarget } from "@/models/user-profile";
import { Modal } from "@/components/shared/modal";
import { ModalHeader } from "@/components/shared/modal/modal-header";
import { ModalBody } from "@/components/shared/modal/modal-body";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/apis/core";
import { useGetTimeSaleMenuByIdQuery } from "@/queries/timeSaleMenus";
import TimeSaleMenuDetailModal from "@/components/features/contents/contents-detail-modal/time-sale-menu-detail-modal";
import AnnouncementDetailForm from "@/components/features/contents/contents-detail-modal/announcement-detail-form";
import V3ConsultationDetailModal from "@/components/features/contents/v3-hair-consultation-content/detail-modal";

export default function UserProfileLinkedDetail({
  target,
  onClose,
  onRefresh,
}: {
  target: UserProfileDetailTarget;
  onClose: () => void;
  onRefresh: () => void;
}) {
  if (target.kind === "consultation")
    return <V3ConsultationDetailModal id={target.id} onClose={onClose} />;
  if (target.kind === "time-sale")
    return (
      <UserTimeSaleDetail
        id={target.id}
        onClose={onClose}
        onRefresh={onRefresh}
      />
    );
  return (
    <Modal
      isOpen
      size="lg"
      closable
      onClose={onClose}
      onClickOutside={onClose}
      className="h-[calc(100dvh-32px)] max-h-[1040px]"
    >
      <ModalHeader>모델시술 상세 #{target.id}</ModalHeader>
      <ModalBody>
        <AnnouncementDetailForm
          id={target.id}
          onClose={onClose}
          onRefresh={onRefresh}
        />
      </ModalBody>
    </Modal>
  );
}
function UserTimeSaleDetail({
  id,
  onClose,
  onRefresh,
}: {
  id: number;
  onClose: () => void;
  onRefresh: () => void;
}) {
  const query = useGetTimeSaleMenuByIdQuery(id);
  if (query.data && !query.isError)
    return (
      <TimeSaleMenuDetailModal
        isOpen
        onClose={onClose}
        timeSaleMenu={query.data}
        onRefresh={onRefresh}
      />
    );
  return (
    <Modal isOpen size="lg" closable onClose={onClose} onClickOutside={onClose}>
      <ModalHeader>리뷰특가 상세 #{id}</ModalHeader>
      <ModalBody>
        {query.isError ? (
          <div role="alert">
            <p>
              {query.error instanceof ApiError &&
              [401, 403].includes(query.error.status)
                ? "조회 권한이 없습니다."
                : query.error instanceof ApiError && query.error.status === 404
                  ? "메뉴를 찾을 수 없습니다."
                  : "메뉴를 불러오지 못했습니다."}
            </p>
            <Button onClick={() => void query.refetch()}>다시 시도</Button>
          </div>
        ) : (
          <p role="status">불러오는 중…</p>
        )}
      </ModalBody>
    </Modal>
  );
}
