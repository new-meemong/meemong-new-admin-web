import {
  SalonPickProductHairConcern,
  SalonPickProductSex,
  SalonPickProductTreatmentType,
} from "@/constants/salonPickProducts";

export interface ISalonPickProductCount {
  id: number;
  date: string;
  dailyClickCount: number;
  createdAt: string;
  updatedAt: string;
  salonPickProductId: number;
}

export interface ISalonPickProduct {
  id: number;
  productName: string;
  productLinkUrl: string;
  originalPrice: string;
  discountPrice: string;
  chipText: string;
  imageUrl: string;
  bannerImageUrl?: string | null;
  isActive: boolean;
  sex?: SalonPickProductSex;
  hairConcerns?: SalonPickProductHairConcern[];
  preferredTreatmentTypes?: SalonPickProductTreatmentType[];
  clickCount?: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  salonPickProductCounts?: ISalonPickProductCount[];
  yesterdaySalonPickProductCount?: ISalonPickProductCount | null;
}

export interface ISalonPickProductForm {
  id?: number;
  productName: string;
  productLinkUrl: string;
  originalPrice: string;
  discountPrice: string;
  chipText: string;
  imageUrl: string;
  imageFile?: File;
  bannerImageUrl?: string | null;
  bannerImageFile?: File;
  sex: SalonPickProductSex;
  hairConcerns: SalonPickProductHairConcern[];
  preferredTreatmentTypes: SalonPickProductTreatmentType[];
  isActive?: boolean;
}
