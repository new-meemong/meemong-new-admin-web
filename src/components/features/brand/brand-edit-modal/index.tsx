"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  useDeleteBrandMutation,
  usePatchBrandMutation,
} from "@/queries/brands";

import BrandRecommendationField from "@/components/features/brand/brand-recommendation-field";
import BrandDesignerList from "@/components/features/brand/brand-designer-list";
import UserRightDrawer from "@/components/features/user/user-right-drawer";
import { useDrawer } from "@/stores/drawer";
import { useQueryClient } from "@tanstack/react-query";
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
  onSubmit,
}: BrandEditModalProps) {
  const dialog = useDialog();
  const queryClient = useQueryClient();
  const { isOpen: isUserDrawerOpen, openDrawer, closeDrawer } = useDrawer();
  const [selectedDesignerId, setSelectedDesignerId] = useState<number | null>(
    null,
  );

  useEffect(() => {
    return () => closeDrawer();
  }, [closeDrawer]);
  const patchBrandMutation = usePatchBrandMutation();
  const deleteBrandMutation = useDeleteBrandMutation();
  const [name, setName] = useState(brand.name);
  const [isRecommended, setIsRecommended] = useState(brand.isRecommended);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState("");

  const initializedBrandId = useRef<number | null>(null);

  const seedDraftFromBrand = useCallback(() => {
    setName(brand.name);
    setIsRecommended(brand.isRecommended);
  }, [brand.name, brand.isRecommended]);

  useEffect(() => {
    if (!isOpen) {
      initializedBrandId.current = null;
      setSelectedDesignerId(null);
      closeDrawer();
      return;
    }
    // Refreshes update read-only values without replacing an open editing draft.
    if (initializedBrandId.current !== brand.id) {
      initializedBrandId.current = brand.id;
      setSelectedDesignerId(null);
      seedDraftFromBrand();
      setIsEditMode(false);
      setShowPasswordModal(false);
      setPassword("");
    }
  }, [isOpen, brand.id, seedDraftFromBrand, closeDrawer]);

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
            isRecommended,
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
    [dialog, patchBrandMutation, brand.id, name, isRecommended, onSubmit],
  );

  const handleDelete = useCallback(async () => {
    try {
      const confirmed = await dialog.confirm(
        "브랜드를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.",
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
          id: brand.id,
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
    [password, deleteBrandMutation, brand.id, onSubmit, onClose],
  );

  const handleClose = useCallback(() => {
    if (isUserDrawerOpen) return;
    setIsEditMode(false);
    seedDraftFromBrand();
    setShowPasswordModal(false);
    setPassword("");
    onClose();
  }, [onClose, seedDraftFromBrand, isUserDrawerOpen]);

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
        className="h-[900px] max-h-[calc(100dvh-48px)]"
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
                    disabled={patchBrandMutation.isPending}
                    placeholder="브랜드명을 입력하세요"
                    required
                  />
                </div>
                <BrandRecommendationField
                  id="brand-edit-recommended"
                  checked={isRecommended}
                  onChange={setIsRecommended}
                  disabled={patchBrandMutation.isPending}
                />
              </form>
            ) : (
              <>
                <CommonForm.ReadonlyRow label="브랜드명" value={brand.name} />
                <CommonForm.ReadonlyRow
                  label="추천 여부"
                  value={brand.isRecommended ? "추천" : "미추천"}
                />
              </>
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
          {isOpen && !showPasswordModal && (
            <BrandDesignerList
              key={brand.id}
              brandId={brand.id}
              onSelectDesigner={(userId) => {
                setSelectedDesignerId(userId);
                openDrawer();
              }}
            />
          )}
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
                <Button
                  type="button"
                  onClick={() => {
                    seedDraftFromBrand();
                    setIsEditMode(true);
                  }}
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
      {isOpen && selectedDesignerId !== null && (
        <UserRightDrawer
          className="z-[60]"
          overlayClassName="z-[60]"
          userId={selectedDesignerId}
          onRefresh={() => {
            void queryClient.invalidateQueries({ queryKey: ["GET_USERS"] });
            void queryClient.invalidateQueries({
              queryKey: ["GET_USER_DETAIL", selectedDesignerId],
            });
          }}
        />
      )}
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
