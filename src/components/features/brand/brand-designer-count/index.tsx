"use client";

import React from "react";
import { useGetUsersQuery } from "@/queries/users";
import { USER_LIST_ROLE } from "@/constants/users";

export default function BrandDesignerCount({ brandId }: { brandId: number }) {
  // Until brands include designerCount, fetch each visible brand's total and reuse it
  // for one minute. Explicit member-update invalidation still refreshes counts.
  const query = useGetUsersQuery(
    { role: USER_LIST_ROLE.DESIGNER, brandId, page: 1, size: 1 },
    { staleTime: 60_000 },
  );

  if (query.isError) {
    return (
      <button
        type="button"
        className="underline"
        onClick={(event) => {
          event.stopPropagation();
          void query.refetch();
        }}
      >
        조회 실패 · 재시도
      </button>
    );
  }

  return (
    <span>
      {query.isPending
        ? "조회 중..."
        : `${query.data.totalCount.toLocaleString()}명`}
    </span>
  );
}
