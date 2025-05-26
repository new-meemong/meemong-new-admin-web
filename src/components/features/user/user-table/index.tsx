"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { SearchFormProps } from "@/components/shared/search-form";

interface UserSearchTableProps {
  className?: string;
}

function UserSearchTable({
  searchForm,
  className,
  ...props
}: UserSearchTableProps) {
  return (
    <div className={cn("user-search-table", className)} {...props}>
      table
    </div>
  );
}

export default UserSearchTable;
