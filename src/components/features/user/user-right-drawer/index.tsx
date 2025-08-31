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
      {...props}
    >
      {getUserDetailQuery.data ? (
        <UserDetailForm
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
