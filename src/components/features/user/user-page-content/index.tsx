"use client";

import React from "react";
import { cn } from "@/lib/utils";
import UserSearchForm from "@/components/features/user/user-search-form";
import useSearchForm from "@/components/shared/search-form/useSearchForm";
import UserSearchTable from "@/components/features/user/user-table";

interface UserPageContentProps {
  className?: string;
}

function UserPageContent({ className }: UserPageContentProps) {
  const searchForm = useSearchForm({
    defaultValues: { userType: "0", blockType: "0", searchKeyword: "" },
  });

  return (
    <div className={cn("user-page-content", className)}>
      <UserSearchForm
        searchForm={searchForm}
        onSubmit={() => {
          console.log(searchForm.values);
        }}
      />
      <UserSearchTable />
    </div>
  );
}

export default UserPageContent;
