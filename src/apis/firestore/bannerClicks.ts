import {
  collection,
  getCountFromServer,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  Timestamp,
  type DocumentData,
  type QueryConstraint,
  type QueryDocumentSnapshot,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { MAX_CLICK_DOCS } from "@/constants/bannerClick";
import type {
  BannerClickDateRange,
  BannerClicksResult,
} from "@/models/bannerClick";
import { normalizeBannerClickDocument } from "@/utils/bannerClickAnalytics";

function createBannerClickDateConstraints(range: BannerClickDateRange) {
  const constraints: QueryConstraint[] = [];
  if (range.from) {
    constraints.push(where("clickedAt", ">=", Timestamp.fromDate(range.from)));
  }
  constraints.push(where("clickedAt", "<", Timestamp.fromDate(range.to)));
  return constraints;
}

function createBannerClicksQueryConstraints(range: BannerClickDateRange) {
  const constraints = createBannerClickDateConstraints(range);
  constraints.push(orderBy("clickedAt", "asc"));
  return constraints;
}

// 현재 named Firestore DB는 limit 10,000 초과 쿼리를 invalid-argument로 거부한다.
const FIRESTORE_MAX_QUERY_LIMIT = 10_000;

async function getBannerClickDocuments(range: BannerClickDateRange) {
  const documents: QueryDocumentSnapshot<DocumentData>[] = [];
  let lastDocument: QueryDocumentSnapshot<DocumentData> | undefined;

  while (documents.length < MAX_CLICK_DOCS + 1) {
    const remaining = MAX_CLICK_DOCS + 1 - documents.length;
    const pageLimit = Math.min(FIRESTORE_MAX_QUERY_LIMIT, remaining);
    const constraints = createBannerClicksQueryConstraints(range);
    if (lastDocument) constraints.push(startAfter(lastDocument));
    constraints.push(limit(pageLimit));

    const snapshot = await getDocs(
      query(collection(db, "bannerClicks"), ...constraints),
    );
    documents.push(...snapshot.docs);

    if (snapshot.size < pageLimit) break;
    lastDocument = snapshot.docs.at(-1);
  }

  return documents;
}

export async function getBannerClicks(
  range: BannerClickDateRange,
): Promise<BannerClicksResult> {
  const totalDocumentCount = await getBannerClickCount(range);
  if (totalDocumentCount > MAX_CLICK_DOCS) {
    return { clicks: [], isTruncated: true, invalidDocumentCount: 0 };
  }
  if (totalDocumentCount === 0) {
    return { clicks: [], isTruncated: false, invalidDocumentCount: 0 };
  }

  const queriedDocuments = await getBannerClickDocuments(range);
  if (queriedDocuments.length > MAX_CLICK_DOCS) {
    return { clicks: [], isTruncated: true, invalidDocumentCount: 0 };
  }
  let invalidDocumentCount = 0;
  const clicks = queriedDocuments.flatMap((document) => {
    const normalized = normalizeBannerClickDocument(
      document.id,
      document.data(),
    );
    if (!normalized) {
      invalidDocumentCount += 1;
      return [];
    }
    return [normalized];
  });

  return { clicks, isTruncated: false, invalidDocumentCount };
}

export async function getBannerClickCount(range: BannerClickDateRange) {
  const snapshot = await getCountFromServer(
    query(
      collection(db, "bannerClicks"),
      ...createBannerClickDateConstraints(range),
    ),
  );
  return snapshot.data().count;
}
