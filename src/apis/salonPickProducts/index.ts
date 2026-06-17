import {
  ISalonPickProduct,
  ISalonPickProductForm,
} from "@/models/salonPickProducts";
import {
  SALON_PICK_PRODUCT_CURSOR_ORDER,
  SALON_PICK_PRODUCT_MAX_FETCH_PAGE_COUNT,
  SalonPickProductCursorOrder,
} from "@/constants/salonPickProducts";
import { fetcher } from "@/apis/core";
import { normalizeSalonPickProductCounts } from "@/utils/salonPickProducts";
import { uploadsAPI, UploadedPresignedImage } from "@/apis/uploads";

const BASE_URL = "/api/v1/admins/salon-pick-products";

export type GetSalonPickProductsRequest = {
  __cursorOrder?: SalonPickProductCursorOrder;
  __nextCursor?: string;
  __limit?: number;
};

type ServerSalonPickProductsResponse = {
  dataCount?: number;
  dataList?: ISalonPickProduct[];
  __nextCursor?: string;
};

export type GetSalonPickProductsResponse = {
  content: ISalonPickProduct[];
  totalCount: number;
  nextCursor?: string;
};

export type GetSalonPickProductDetailResponse = {
  data: ISalonPickProduct;
};

export type PostSalonPickProductRequest = Partial<
  Omit<ISalonPickProductForm, "id" | "imageFile" | "bannerImageFile">
>;

export type PostSalonPickProductResponse = {
  data: ISalonPickProduct;
};

export type PutSalonPickProductRequest = {
  id: number;
} & Partial<
  Omit<ISalonPickProductForm, "id" | "imageFile" | "bannerImageFile">
>;

export type PutSalonPickProductResponse = {
  data: ISalonPickProduct;
};

export type DeleteSalonPickProductResponse = {
  data: ISalonPickProduct;
};

export type PostSalonPickProductImageUploadRequest = File;

export type PostSalonPickProductImageUploadResponse = {
  data: {
    imageFile: UploadedPresignedImage;
  };
};

function normalizeSalonPickProductsResponse(
  response:
    | ServerSalonPickProductsResponse
    | { data: ServerSalonPickProductsResponse },
): GetSalonPickProductsResponse {
  const payload = "data" in response ? response.data : response;
  const content = (payload.dataList ?? []).map((product) => ({
    ...product,
    salonPickProductCounts: normalizeSalonPickProductCounts(
      product.salonPickProductCounts,
    ),
  }));

  return {
    content,
    totalCount: payload.dataCount ?? content.length,
    nextCursor: payload.__nextCursor,
  };
}

async function getSalonPickProductsPage({
  __cursorOrder = SALON_PICK_PRODUCT_CURSOR_ORDER.ID_DESC,
  __nextCursor,
  __limit,
}: GetSalonPickProductsRequest = {}) {
  const response = await fetcher<
    ServerSalonPickProductsResponse | { data: ServerSalonPickProductsResponse }
  >(BASE_URL, {
    query: {
      __cursorOrder,
      ...(__nextCursor && { __nextCursor }),
      ...(__limit && { __limit }),
    },
  });

  return normalizeSalonPickProductsResponse(response);
}

export const salonPickProductsAPI = {
  getAll: async (request: GetSalonPickProductsRequest = {}) => {
    const firstPage = await getSalonPickProductsPage(request);

    if (request.__nextCursor || !firstPage.nextCursor) {
      return firstPage;
    }

    const content = [...firstPage.content];
    const seenCursors = new Set<string>();
    let nextCursor: string | undefined = firstPage.nextCursor;
    let fetchedPageCount = 1;

    while (
      nextCursor &&
      !seenCursors.has(nextCursor) &&
      fetchedPageCount < SALON_PICK_PRODUCT_MAX_FETCH_PAGE_COUNT
    ) {
      seenCursors.add(nextCursor);

      const nextPage = await getSalonPickProductsPage({
        ...request,
        __nextCursor: nextCursor,
      });
      content.push(...nextPage.content);
      fetchedPageCount += 1;

      if (!nextPage.content.length) {
        nextCursor = undefined;
        break;
      }

      nextCursor = nextPage.nextCursor;
    }

    return {
      content,
      totalCount: content.length,
      nextCursor:
        nextCursor &&
        fetchedPageCount >= SALON_PICK_PRODUCT_MAX_FETCH_PAGE_COUNT
          ? nextCursor
          : undefined,
    };
  },

  getById: async (salonPickProductId: number) => {
    const response = await fetcher<GetSalonPickProductDetailResponse>(
      `${BASE_URL}/${salonPickProductId}`,
    );

    return {
      ...response.data,
      salonPickProductCounts: normalizeSalonPickProductCounts(
        response.data.salonPickProductCounts,
      ),
    };
  },

  post: async (request: PostSalonPickProductRequest) => {
    const response = await fetcher<PostSalonPickProductResponse>(BASE_URL, {
      method: "POST",
      json: request,
    });

    return response;
  },

  update: async (request: PutSalonPickProductRequest) => {
    const { id, ...body } = request;
    const response = await fetcher<PutSalonPickProductResponse>(
      `${BASE_URL}/${id}`,
      {
        method: "PUT",
        json: body,
      },
    );

    return response;
  },

  delete: async (salonPickProductId: number) => {
    const response = await fetcher<DeleteSalonPickProductResponse>(
      `${BASE_URL}/${salonPickProductId}`,
      {
        method: "DELETE",
        json: {},
      },
    );

    return response;
  },

  uploadImage: async (request: PostSalonPickProductImageUploadRequest) => {
    const originalImageFile = await uploadsAPI.uploadImage(request);
    const response: PostSalonPickProductImageUploadResponse = {
      data: {
        imageFile: originalImageFile,
      },
    };

    return response;
  },
};
