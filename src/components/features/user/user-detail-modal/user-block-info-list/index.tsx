"use client";

import { useGetUserBlockDetailQuery } from "@/queries/users/[userId]/block";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import React, { ChangeEventHandler, useCallback, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/utils/date";
import { useDialog } from "@/components/shared/dialog/context";
import { IUserForm } from "@/models/user";

interface UserBlockInfoListProps {
  user: IUserForm;
  isBlocked: boolean;
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
  isBlocked,
}: UserBlockInfoListProps) {
  const [description, setDescription] = useState<string>("");
  const getUserBlockDetailQuery = useGetUserBlockDetailQuery(user.id!);

  const dialog = useDialog();

  const handleChangeDescription: ChangeEventHandler<HTMLTextAreaElement> =
    useCallback((event) => {
      const value = event.target.value;

      setDescription(value);
    }, []);

  const handleSubmit = useCallback(
    async (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      const confirmed = await dialog.confirm(
        `${user?.nickname}(${user?.name}) 님을 ${isBlocked ? "차단 해제" : "차단"}하시겠습니까?`,
      );
      if (confirmed) {
        console.log("제출");
      }
    },
    [user?.nickname, user?.name, isBlocked, dialog],
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
            placeholder={"차단 사유를 입력해주세요."}
          />
        }
      />
      {(getUserBlockDetailQuery.data?.blockInfoList || []).map(
        (blockInfo, index) => (
          <BlockInfoListItem
            key={`block-info-list-item-${index}`}
            leftArea={
              <>
                <div className={cn("date-area text-left")}>
                  {formatDate(blockInfo.blockedAt, "YYYY.MM.DD")}
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
