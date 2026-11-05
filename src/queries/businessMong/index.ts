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
