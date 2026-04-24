"use client";

import {
  ImageManagementTabType
} from "@/components/features/user-files/image-management-tab";
import BeautyApplicationImagesPageContent from "@/components/features/user-files/beauty-application-images-page-content";
import UserFilesPageContent from "@/components/features/user-files/user-files-page-content";

interface ImageManagementPageContentProps {
  imageTabType: ImageManagementTabType;
}

function ImageManagementPageContent({
  imageTabType
}: ImageManagementPageContentProps) {
  if (imageTabType === "BEAUTY_APPLICATION_IMAGES") {
    return <BeautyApplicationImagesPageContent />;
  }

  return <UserFilesPageContent />;
}

export default ImageManagementPageContent;
