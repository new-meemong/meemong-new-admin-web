"use client";

import React, { useCallback } from "react";
import { Modal } from "@/components/shared/modal";
import { ModalHeader } from "@/components/shared/modal/modal-header";

import { ModalBody } from "@/components/shared/modal/modal-body";
import {
  useGetDeclarationDetailQuery,
  usePutDeclarationMutation,
} from "@/queries/declaration";
import DeclarationDetailForm from "@/components/features/declaration/declaration-detail-modal/declaration-detail-form";
import { IDeclaration, IDeclarationForm } from "@/models/declaration";
import { useDialog } from "@/components/shared/dialog/context";

interface DeclarationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  declaration: IDeclaration;
}

export default function DeclarationDetailModal({
  isOpen,
  onClose,
  declaration,
}: DeclarationDetailModalProps) {
  const dialog = useDialog();

  const getDeclarationDetailQuery = useGetDeclarationDetailQuery(
    declaration?.id,
    {
      enabled: Boolean(isOpen && !!declaration?.id),
    },
  );

  const putDeclarationMutation = usePutDeclarationMutation();

  const handleSubmit = useCallback(
    async (formData: Partial<IDeclarationForm>) => {
      if (!declaration?.id) return;
      const confirmed = await dialog.confirm(`신고 내용을 저장하시겠습니까?`);

      if (confirmed) {
        await putDeclarationMutation.mutateAsync({
          id: declaration.id!,
          declaration: formData,
        });
      }

      onClose();
    },
    [declaration?.id, onClose],
  );

  if (!getDeclarationDetailQuery?.data) return null;

  return (
    <Modal isOpen={isOpen} size="sm">
      <ModalHeader closable={true} onClose={onClose}>
        신고 상세
      </ModalHeader>
      <ModalBody>
        <DeclarationDetailForm
          formData={getDeclarationDetailQuery.data!}
          onSubmit={handleSubmit}
        />
      </ModalBody>
    </Modal>
  );
}
