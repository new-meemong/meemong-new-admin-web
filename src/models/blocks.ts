export interface IUserBlock {
  id: number;
  userId: number;
  reason: string;
  blockEndAt: string;
  adminDescription: string;
  createdAt: string;
}

export interface IUserBlockStatus {
  id: number;
  isBlocked: boolean;
  blockEndAt: string;
  reason: string;
  adminDescription: string;
  createdAt: string;
}
