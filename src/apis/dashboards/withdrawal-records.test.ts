import { afterEach, describe, expect, it, vi } from "vitest";
import { fetcher } from "@/apis/core";
import { getWithdrawalRecords } from "./withdrawal-records";
vi.mock("@/apis/core", () => ({ fetcher: vi.fn() }));
afterEach(() => vi.resetAllMocks());
const record = {
  id: 1,
  role: 1,
  joinedAt: "2026-08-01T00:00:00Z",
  withdrawAt: "2026-09-01T00:00:00Z",
};
describe("withdrawal detail range loading", () => {
  it("uses KST midnight with an exclusive next-day end and retains only required fields", async () => {
    vi.mocked(fetcher).mockResolvedValue({
      dataList: [{ ...record, unusedField: "unused" }],
    });
    const signal = new AbortController().signal;
    expect(
      await getWithdrawalRecords(
        { startDateKST: "2026-09-01", endDateKST: "2026-09-30" },
        signal,
      ),
    ).toEqual([record]);
    expect(fetcher).toHaveBeenCalledWith(
      "/api/v1/un-auth/users/withdraw-statistics",
      {
        query: {
          startDateKST: "2026-09-01 00:00:00",
          endDateKST: "2026-10-01 00:00:00",
        },
        signal,
      },
    );
  });
  it("splits capped responses into non-overlapping date ranges without retaining the truncated parent", async () => {
    vi.mocked(fetcher)
      .mockResolvedValueOnce({ dataList: Array(1000).fill(record) })
      .mockResolvedValueOnce({ dataList: [record] })
      .mockResolvedValueOnce({ dataList: [{ ...record, id: 2 }] });
    expect(
      await getWithdrawalRecords({
        startDateKST: "2026-09-01",
        endDateKST: "2026-09-04",
      }),
    ).toEqual([record, { ...record, id: 2 }]);
    expect(
      vi
        .mocked(fetcher)
        .mock.calls.slice(1)
        .map((call) => call[1]?.query),
    ).toEqual([
      {
        startDateKST: "2026-09-01 00:00:00",
        endDateKST: "2026-09-03 00:00:00",
      },
      {
        startDateKST: "2026-09-03 00:00:00",
        endDateKST: "2026-09-05 00:00:00",
      },
    ]);
  });
  it("does not silently calculate an incomplete day or hide a request failure", async () => {
    vi.mocked(fetcher).mockResolvedValueOnce({
      dataList: Array(1000).fill(record),
    });
    await expect(
      getWithdrawalRecords({
        startDateKST: "2026-09-01",
        endDateKST: "2026-09-01",
      }),
    ).rejects.toThrow("1,000건");
    vi.mocked(fetcher).mockRejectedValueOnce(new Error("network failure"));
    await expect(
      getWithdrawalRecords({
        startDateKST: "2026-09-01",
        endDateKST: "2026-09-01",
      }),
    ).rejects.toThrow("network failure");
  });
});
