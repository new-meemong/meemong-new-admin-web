export type UserFileType = "profilePhoto" | "portfolio" | "shop";

export type UserFileSearchType = "NAME" | "PHONE";

export type UserFileOrderBy = "updatedAt" | "createdAt";

export type UserFileSort = "ASC" | "DESC";

export interface IUserFileUserInfo {
  userId: number;
  displayName: string;
  phone: string;
  role?: 1 | 2;
}

export interface IUserFile {
  id: number;
  fileType: UserFileType;
  s3Path: string;
  createdAt: string;
  updatedAt: string;
  userInfo: IUserFileUserInfo;
}
