import { fetcher } from "@/apis/core";
import { parseImageUrl } from "@/utils/image";

type PresignedUploadFields = Record<string, string>;

export type GetImagePresignedUrlRequest = {
  filename: string;
};

export type GetImagePresignedUrlResponse = {
  data: {
    uploadData: {
      url: string;
      fields: PresignedUploadFields;
    };
    uploadUrlList: string[];
    requestMethod: "POST";
  };
};

export type UploadedPresignedImage = {
  key: string;
  fileuri: string;
  fileUrl: string;
};

function getUploadedImageFromFields(
  fields: PresignedUploadFields,
): UploadedPresignedImage {
  const key = fields.key;

  if (!key) {
    throw new Error("업로드 응답에 파일 경로가 없습니다.");
  }

  const fileuri = `/${key.replace(/^\/+/, "")}`;

  return {
    key,
    fileuri,
    fileUrl: parseImageUrl(fileuri),
  };
}

export const uploadsAPI = {
  getImagePresignedUrl: async ({ filename }: GetImagePresignedUrlRequest) => {
    return fetcher<GetImagePresignedUrlResponse>(
      "/api/v1/uploads/images/presigned-url",
      {
        query: {
          filename,
        },
      },
    );
  },

  uploadToPresignedUrl: async (
    presignedUrl: GetImagePresignedUrlResponse,
    file: File,
  ) => {
    const { uploadData, requestMethod } = presignedUrl.data;
    const formData = new FormData();

    Object.entries(uploadData.fields).forEach(([key, value]) => {
      formData.append(key, value);
    });
    formData.append("file", file);

    const response = await fetch(uploadData.url, {
      method: requestMethod,
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`파일 업로드 실패: ${response.status}`);
    }

    return getUploadedImageFromFields(uploadData.fields);
  },

  uploadImage: async (file: File) => {
    const presignedUrl = await uploadsAPI.getImagePresignedUrl({
      filename: file.name,
    });

    return uploadsAPI.uploadToPresignedUrl(presignedUrl, file);
  },
};
