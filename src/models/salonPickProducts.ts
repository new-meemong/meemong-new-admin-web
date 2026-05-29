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
  isActive: boolean;
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
  isActive?: boolean;
}
