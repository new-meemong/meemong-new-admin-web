"use client";

import { IBrand } from "@/models/brand";
import React, { useCallback, useState, useEffect } from "react";
import {
  usePatchBrandMutation,
  useDeleteBrandMutation,
} from "@/queries/brands";

import { Modal } from "@/components/shared/modal";
import { ModalBody } from "@/components/shared/modal/modal-body";
import { ModalHeader } from "@/components/shared/modal/modal-header";
import { ModalFooter } from "@/components/shared/modal/modal-footer";
import { CommonForm } from "@/components/shared/common-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDate } from "@/utils/date";
import { toast } from "react-toastify";
import { useDialog } from "@/components/shared/dialog/context";
import { Button } from "@/components/ui/button";

interface BrandEditModalProps {
  brand: IBrand;
  isOpen: boolean;
  closable?: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

export default function BrandEditModal({
  brand,
  isOpen,
  onClose,
  onSubmit
}: BrandEditModalProps) {
  const dialog = useDialog();
  const patchBrandMutation = usePatchBrandMutation();
  const deleteBrandMutation = useDeleteBrandMutation();
  const [name, setName] = useState(brand.name);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(brand.name);
      setIsEditMode(false);
    }
  }, [isOpen, brand.name]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!name.trim()) {
        toast.error("브랜드명을 입력해주세요.");
        return;
      }

      try {
        const confirmed = await dialog.confirm("브랜드를 수정하시겠습니까?");

        if (confirmed) {
          await patchBrandMutation.mutateAsync({
            id: brand.id,
            name: name.trim(),
          });

          toast.success("브랜드를 수정했습니다.");
          setIsEditMode(false);
          onSubmit();
        }
      } catch (error: any) {
        console.error(error);
        const errorMessage =
          error?.message || "잠시 후 다시 시도해주세요.";
        toast.error(errorMessage);
      }
    },
    [dialog, patchBrandMutation, brand.id, name, onSubmit]
  );

  const handleDelete = useCallback(async () => {
    try {
      const confirmed = await dialog.confirm(
        "브랜드를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
      );

      if (confirmed) {
        await deleteBrandMutation.mutateAsync({
          id: brand.id,
        });

        toast.success("브랜드를 삭제했습니다.");
        onSubmit();
        onClose();
      }
    } catch (error: any) {
      console.error(error);
      const errorMessage = error?.message || "잠시 후 다시 시도해주세요.";
      toast.error(errorMessage);
    }
  }, [dialog, deleteBrandMutation, brand.id, onSubmit, onClose]);

  const handleClose = useCallback(() => {
    setIsEditMode(false);
    setName(brand.name);
    onClose();
  }, [onClose, brand.name]);

  return (
    <Modal
      isOpen={isOpen}
      closable={false}
      size="md"
      onClose={handleClose}
      onClickOutside={handleClose}
    >
      <ModalHeader>브랜드 상세보기</ModalHeader>
      <ModalBody>
        <div className="space-y-4">
          <CommonForm.ReadonlyRow label="ID" value={brand.id.toString()} />
          <CommonForm.ReadonlyRow label="코드" value={brand.code} />
          {isEditMode ? (
            <form onSubmit={handleSubmit} id="brand-edit-form">
              <div className="flex flex-col gap-2">
                <Label htmlFor="brand-edit-name">브랜드명</Label>
                <Input
                  id="brand-edit-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="브랜드명을 입력하세요"
                  required
                />
              </div>
            </form>
          ) : (
            <CommonForm.ReadonlyRow label="브랜드명" value={brand.name} />
          )}
          <CommonForm.ReadonlyRow
            label="등록일"
            value={formatDate(brand.createdAt)}
          />
          {brand.updatedAt && (
            <CommonForm.ReadonlyRow
              label="수정일"
              value={formatDate(brand.updatedAt)}
            />
          )}
        </div>
      </ModalBody>
      <ModalFooter>
        <div className="flex justify-between w-full">
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteBrandMutation.isPending}
          >
            {deleteBrandMutation.isPending ? "삭제 중..." : "삭제하기"}
          </Button>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              {isEditMode ? "취소" : "닫기"}
            </Button>
            {!isEditMode && (
              <Button
                type="button"
                onClick={() => setIsEditMode(true)}
              >
                수정하기
              </Button>
            )}
            {isEditMode && (
              <Button
                type="submit"
                form="brand-edit-form"
                disabled={patchBrandMutation.isPending}
              >
                {patchBrandMutation.isPending ? "수정 중..." : "수정 완료"}
              </Button>
            )}
          </div>
        </div>
      </ModalFooter>
    </Modal>
  );
}

