export type ShampooRoomCategory = "FREE" | "EDUCATION" | "PRODUCT" | "MARKET";

export interface IShampooRoomImage {
  imageUrl: string;
}

export interface IShampooRoomUser {
  userId: number;
  name: string;
  profilePictureURL: string | null;
}

export interface IShampooRoomUserDetail extends IShampooRoomUser {
  role: number;
  anonymousNumber: number;
  address: string;
  address2: string;
}

export interface IShampooRoom {
  id: number;
  title: string;
  category: ShampooRoomCategory;
  content: string;
  images: IShampooRoomImage[];
  viewCount: number;
  likeCount: number;
  commentCount: number;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
  user: IShampooRoomUser;
}

export interface IShampooRoomDetail extends Omit<IShampooRoom, "user"> {
  user: IShampooRoomUserDetail;
}
