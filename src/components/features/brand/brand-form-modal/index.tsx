"use client";

import React, { useCallback, useState } from "react";
import { usePostBrandMutation } from "@/queries/brands";

import { Modal } from "@/components/shared/modal";
import { ModalBody } from "@/components/shared/modal/modal-body";
import { ModalHeader } from "@/components/shared/modal/modal-header";
import { ModalFooter } from "@/components/shared/modal/modal-footer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-toastify";
import { useDialog } from "@/components/shared/dialog/context";
import { Button } from "@/components/ui/button";

interface BrandFormModalProps {
  isOpen: boolean;
  closable?: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

export default function BrandFormModal({
  isOpen,
  onClose,
  onSubmit
}: BrandFormModalProps) {
  const dialog = useDialog();
  const postBrandMutation = usePostBrandMutation();
  const [name, setName] = useState("");

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!name.trim()) {
        toast.error("브랜드명을 입력해주세요.");
        return;
      }

      try {
        const confirmed = await dialog.confirm("브랜드를 추가하시겠습니까?");

        if (confirmed) {
          await postBrandMutation.mutateAsync({
            name: name.trim(),
          });

          toast.success("브랜드를 추가했습니다.");
          setName("");
          onSubmit();
          onClose();
        }
      } catch (error: any) {
        console.error(error);
        const errorMessage =
          error?.message || "잠시 후 다시 시도해주세요.";
        toast.error(errorMessage);
      }
    },
    [dialog, postBrandMutation, name, onSubmit, onClose]
  );

  const handleClose = useCallback(() => {
    setName("");
    onClose();
  }, [onClose]);

  return (
    <Modal
      isOpen={isOpen}
      closable={false}
      size="md"
      onClose={handleClose}
      onClickOutside={handleClose}
    >
      <ModalHeader>브랜드 추가하기</ModalHeader>
      <ModalBody>
        <form onSubmit={handleSubmit} id="brand-form">
          <div className="flex flex-col gap-2">
            <Label htmlFor="brand-name">브랜드명</Label>
            <Input
              id="brand-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="브랜드명을 입력하세요"
              required
            />
          </div>
        </form>
      </ModalBody>
      <ModalFooter>
        <Button
          type="button"
          variant="outline"
          onClick={handleClose}
        >
          취소
        </Button>
        <Button
          type="submit"
          form="brand-form"
          disabled={postBrandMutation.isPending}
        >
          {postBrandMutation.isPending ? "추가 중..." : "추가하기"}
        </Button>
      </ModalFooter>
    </Modal>
  );
}

