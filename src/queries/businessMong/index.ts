import { ApiError } from "@/apis/core";
import {
  infiniteQueryOptions,
  queryOptions,
  useMutation,
  useQueryClient,
  QueryClient,
} from "@tanstack/react-query";
import {
  businessMongAPI,
  BusinessMongGrantRequest,
  BusinessMongDistributionRequest,
  BusinessMongPage,
  BusinessMongPreset,
  BusinessMongPresetValues,
} from "@/apis/businessMong";
import { MONG_MONEY_GROUPS_QUERY_KEY } from "@/queries/mongMoneys";

const ROOT = ["business-mong"] as const;
function nextCursor<T>(
  page: BusinessMongPage<T>,
  _pages: BusinessMongPage<T>[],
  _param: string | undefined,
  params: (string | undefined)[],
) {
  return page.__nextCursor && !params.includes(page.__nextCursor)
    ? page.__nextCursor
    : undefined;
}
export const businessMongQueries = {
  presets: () =>
    queryOptions({
      queryKey: [...ROOT, "presets"],
      queryFn: businessMongAPI.presets,
    }),
  grants: (registrationNumber = "") =>
    infiniteQueryOptions({
      queryKey: [...ROOT, "grants", registrationNumber],
      initialPageParam: undefined as string | undefined,
      queryFn: ({ pageParam, signal }) =>
        businessMongAPI.grants(registrationNumber, pageParam, signal),
      getNextPageParam: nextCursor,
    }),
  grant: (id: number) =>
    queryOptions({
      queryKey: [...ROOT, "grant", id],
      queryFn: () => businessMongAPI.grant(id),
    }),
  distributions: (id: number) =>
    infiniteQueryOptions({
      queryKey: [...ROOT, "distributions", id],
      initialPageParam: undefined as string | undefined,
      queryFn: ({ pageParam, signal }) =>
        businessMongAPI.distributions(id, pageParam, signal),
      getNextPageParam: nextCursor,
    }),
};
// 응답이 유실되면 해당 사업자의 모든 페이지에서 같은 요청 키를 찾는다.
export async function findBusinessMongGrant(request: BusinessMongGrantRequest) {
  let cursor: string | undefined;
  const visited = new Set<string>();
  do {
    const page = await businessMongAPI.grants(
      request.businessRegistrationNumber,
      cursor,
    );
    const found = page.dataList.find(
      (grant) => grant.requestKey === request.requestKey,
    );
    if (found) return found;
    cursor = page.__nextCursor ?? undefined;
    if (cursor && visited.has(cursor))
      throw new Error("조회 커서가 반복됩니다. 다시 확인해주세요.");
    if (cursor) visited.add(cursor);
  } while (cursor);
  return null;
}
export const refreshBusinessMongAfterDistribution = async (
  client: QueryClient,
) => {
  await Promise.all([
    client.invalidateQueries({ queryKey: ROOT }),
    client.invalidateQueries({ queryKey: [MONG_MONEY_GROUPS_QUERY_KEY] }),
    client.invalidateQueries({ queryKey: ["GET_USER_DETAIL"] }),
  ]);
};
export function useCreateBusinessMongGrant() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: businessMongAPI.createGrant,
    retry: false,
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: [...ROOT, "grants"] });
    },
  });
}
export function useDistributeBusinessMong(id: number) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (request: BusinessMongDistributionRequest) =>
      businessMongAPI.distribute(id, request),
    retry: false,
    onSuccess: () => {
      void refreshBusinessMongAfterDistribution(client);
    },
  });
}
export function useFindBusinessMongGrant() {
  return useMutation({ mutationFn: findBusinessMongGrant, retry: false });
}

type SaveBusinessMongPreset =
  | { kind: "create"; values: BusinessMongPresetValues }
  | { kind: "update"; id: number; values: Partial<BusinessMongPresetValues> };
export function useSaveBusinessMongPreset() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (request: SaveBusinessMongPreset) =>
      request.kind === "create"
        ? businessMongAPI.createPreset(request.values)
        : businessMongAPI.updatePreset(request.id, request.values),
    retry: false,
    onSuccess: ({ data }) => {
      // 저장 응답을 먼저 반영해 재조회 실패 시에도 기존 상품 선택이 낡지 않도록 한다.
      client.setQueryData<{ dataList: BusinessMongPreset[] }>(
        businessMongQueries.presets().queryKey,
        (previous) =>
          previous
            ? {
                ...previous,
                dataList: [
                  ...previous.dataList.filter((item) => item.id !== data.id),
                  data,
                ].sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id),
              }
            : undefined,
      );
      void client.invalidateQueries({
        queryKey: businessMongQueries.presets().queryKey,
      });
    },
  });
}

export function useDeleteBusinessMongPreset() {
  const client = useQueryClient();
  const removeFromCache = (id: number) => {
    client.setQueryData<{ dataList: BusinessMongPreset[] }>(
      businessMongQueries.presets().queryKey,
      (previous) =>
        previous
          ? {
              ...previous,
              dataList: previous.dataList.filter((item) => item.id !== id),
            }
          : undefined,
    );
  };
  return useMutation({
    mutationFn: businessMongAPI.deletePreset,
    retry: false,
    onSuccess: (_result, id) => removeFromCache(id),
    onError: (error, id) => {
      if (
        error instanceof ApiError &&
        error.status === 404 &&
        error.code === "NOT_FOUND_ERROR"
      )
        removeFromCache(id);
    },
    onSettled: () => {
      // 응답 유실/동시 삭제의 처리 여부도 최신 목록으로 확인한다.
      void client.invalidateQueries({
        queryKey: businessMongQueries.presets().queryKey,
      });
    },
  });
}
