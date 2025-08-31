"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import React, {
  ChangeEventHandler,
  useCallback,
  useMemo,
  useState,
} from "react";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/utils/date";
import { useDialog } from "@/components/shared/dialog/context";
import { IUserForm } from "@/models/users";
import {
  useGetUserBlockListQuery,
  useUpdateUserBlockMutation,
} from "@/queries/users";
import { toast } from "react-toastify";

interface UserBlockInfoListProps {
  user: IUserForm;
  onUpdate: () => void;
}

function BlockInfoListItem({
  leftArea,
  rightArea,
}: {
  leftArea: React.ReactNode;
  rightArea: React.ReactNode;
}) {
  return (
    <li
      className={cn(
        "user-block-info-list-item",
        "flex flex-row justify-start w-full border-b typo-body-2-regular py-[6px]",
      )}
    >
      <div className={cn("description-box w-[80px] text-left")}>{leftArea}</div>
      <div className={cn("button-box flex-1 ml-[8px]")}>{rightArea}</div>
    </li>
  );
}

export default function UserBlockInfoList({
  user,
  onUpdate,
}: UserBlockInfoListProps) {
  const [description, setDescription] = useState<string>("");
  const getUserBlockDetailQuery = useGetUserBlockListQuery(user.id!);
  const updateUserBlockMutation = useUpdateUserBlockMutation();

  const dialog = useDialog();

  const isBlocked = useMemo(
    () => getUserBlockDetailQuery.data?.isBlocked,
    [getUserBlockDetailQuery.data?.isBlocked],
  );

  const handleChangeDescription: ChangeEventHandler<HTMLTextAreaElement> =
    useCallback((event) => {
      const value = event.target.value;

      setDescription(value);
    }, []);

  const handleSubmit = useCallback(
    async (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();

      if (!description) {
        toast.info("차단 사유를 입력해주세요.");
        return;
      }

      try {
        const confirmed = await dialog.confirm(
          `${user?.displayName}(${user?.name || "-"}) 님을 ${isBlocked ? "차단 해제" : "차단"}하시겠습니까?`,
        );

        if (confirmed) {
          const result = await updateUserBlockMutation.mutateAsync({
            userId: user.id,
            description,
            isBlocked: !isBlocked,
          });

          if (result.isBlocked !== undefined) {
            toast.success(
              `해당 회원을 ${result.isBlocked ? "차단" : "차단 해제"}했습니다.`,
            );
            setDescription("");
            getUserBlockDetailQuery.refetch();
            onUpdate();
          } else {
            throw new Error();
          }
        }
      } catch (error) {
        console.error(error);
        toast.error("잠시 후 다시 시도해주세요.");
      }
    },
    [user?.id, user?.displayName, user?.name, isBlocked, dialog, description],
  );

  return (
    <ul className={cn("user-block-info-list", "flex flex-col w-full")}>
      <BlockInfoListItem
        leftArea={
          <>
            <div className={cn("date-area text-left")}>
              {formatDate(new Date(), "YYYY.MM.DD")}
            </div>
            <div className={cn("block-area mt-[4px] text-left")}>
              <Button onClick={handleSubmit} variant={"outline"} size={"sm"}>
                {isBlocked ? "차단해제" : "차단"}
              </Button>
            </div>
          </>
        }
        rightArea={
          <Textarea
            className={cn("w-full")}
            value={description}
            onChange={handleChangeDescription}
            placeholder={`${isBlocked ? "차단해제" : "차단"} 사유를 입력해주세요.`}
          />
        }
      />
      {(getUserBlockDetailQuery.data?.blockList || []).map(
        (blockInfo, index) => (
          <BlockInfoListItem
            key={`block-info-list-item-${index}`}
            leftArea={
              <>
                <div className={cn("date-area text-left")}>
                  {formatDate(blockInfo.createdAt, "YYYY.MM.DD")}
                </div>
                <div className={cn("block-area mt-[4px] text-left")}>
                  {blockInfo.isBlocked ? "차단" : "차단해제"}
                </div>
              </>
            }
            rightArea={blockInfo.description}
          />
        ),
      )}
    </ul>
  );
}
