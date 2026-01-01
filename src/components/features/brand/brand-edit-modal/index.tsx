"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  useDeleteBrandMutation,
  usePatchBrandMutation
} from "@/queries/brands";

import { Button } from "@/components/ui/button";
import { CommonForm } from "@/components/shared/common-form";
import { IBrand } from "@/models/brand";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/shared/modal";
import { ModalBody } from "@/components/shared/modal/modal-body";
import { ModalFooter } from "@/components/shared/modal/modal-footer";
import { ModalHeader } from "@/components/shared/modal/modal-header";
import { formatDate } from "@/utils/date";
import { toast } from "react-toastify";
import { useDialog } from "@/components/shared/dialog/context";

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
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (isOpen) {
      setName(brand.name);
      setIsEditMode(false);
      setShowPasswordModal(false);
      setPassword("");
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
            name: name.trim()
          });

          toast.success("브랜드를 수정했습니다.");
          setIsEditMode(false);
          onSubmit();
        }
      } catch (error: unknown) {
        console.error(error);
        const errorMessage =
          error instanceof Error ? error.message : "잠시 후 다시 시도해주세요.";
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
        // 세션 스토리지에서 저장된 비밀번호 확인
        const storedPassword = sessionStorage.getItem("adminPassword");
        if (!storedPassword) {
          toast.error("로그인 정보를 찾을 수 없습니다. 다시 로그인해주세요.");
          return;
        }
        setShowPasswordModal(true);
      }
    } catch (error: unknown) {
      console.error(error);
    }
  }, [dialog]);

  const handlePasswordSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!password.trim()) {
        toast.error("비밀번호를 입력해주세요.");
        return;
      }

      // 세션 스토리지에서 저장된 비밀번호 가져오기
      const storedPassword = sessionStorage.getItem("adminPassword");
      if (!storedPassword) {
        toast.error("로그인 정보를 찾을 수 없습니다. 다시 로그인해주세요.");
        return;
      }

      // 로컬에 저장된 비밀번호와 입력한 비밀번호 비교
      if (password.trim() !== storedPassword) {
        toast.error("비밀번호가 일치하지 않습니다.");
        return;
      }

      // 비밀번호 검증 성공 시 삭제 진행
      try {
        await deleteBrandMutation.mutateAsync({
          id: brand.id
        });

        toast.success("브랜드를 삭제했습니다.");
        setShowPasswordModal(false);
        setPassword("");
        onSubmit();
        onClose();
      } catch (error: unknown) {
        console.error("삭제 실패:", error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : "브랜드 삭제에 실패했습니다.";
        toast.error(errorMessage);
      }
    },
    [password, deleteBrandMutation, brand.id, onSubmit, onClose]
  );

  const handleClose = useCallback(() => {
    setIsEditMode(false);
    setName(brand.name);
    setShowPasswordModal(false);
    setPassword("");
    onClose();
  }, [onClose, brand.name]);

  const handlePasswordModalClose = useCallback(() => {
    setShowPasswordModal(false);
    setPassword("");
  }, []);

  return (
    <>
      <Modal
        isOpen={isOpen && !showPasswordModal}
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
              variant="negative"
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
                <Button type="button" onClick={() => setIsEditMode(true)}>
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
      <Modal
        isOpen={showPasswordModal}
        closable={false}
        size="md"
        onClose={handlePasswordModalClose}
        onClickOutside={handlePasswordModalClose}
      >
        <ModalHeader>비밀번호 확인</ModalHeader>
        <ModalBody>
          <form onSubmit={handlePasswordSubmit} id="password-form">
            <div className="flex flex-col gap-2">
              <Label htmlFor="admin-password">
                어드민 비밀번호를 입력해주세요
              </Label>
              <Input
                id="admin-password"
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                required
                autoFocus
              />
            </div>
          </form>
        </ModalBody>
        <ModalFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handlePasswordModalClose}
          >
            취소
          </Button>
          <Button
            type="submit"
            form="password-form"
            disabled={deleteBrandMutation.isPending}
          >
            {deleteBrandMutation.isPending ? "삭제 중..." : "확인"}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
