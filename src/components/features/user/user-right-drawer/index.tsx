"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { useDrawer } from "@/stores/drawer";
import RightDrawer, {
  RightDrawerProps,
} from "@/components/shared/right-drawer";
import { ChevronRight } from "lucide-react";
import { useGetUserDetailQuery } from "@/queries/users";
import UserDetailForm from "@/components/features/user/user-right-drawer/user-detail-form";
import { Button } from "@/components/ui/button";

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

  return (
    <RightDrawer
      className={cn("w-full max-w-[1000px]", className)}
      onClose={closeDrawer}
      title={
        <>
          회원 관리 <ChevronRight /> 상세
        </>
      }
      headerActions={
        <Button asChild variant="outline" size="sm">
          <a
            href={`https://meemong-chat-admin.vercel.app/user-chat-list/${userId}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            전체 채팅방 보기
          </a>
        </Button>
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
          onRefresh={onRefresh}
        />
      ) : (
        <div>...loading</div>
      )}
    </RightDrawer>
  );
}

export default UserRightDrawer;
