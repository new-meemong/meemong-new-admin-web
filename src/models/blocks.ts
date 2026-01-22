export interface IUserBlock {
  id: number;
  userId: number;
  reason: string;
  blockEndAt: string;
  createdAt: string;
}

export interface IUserBlockStatus {
  isBlocked: boolean;
  blockEndAt: string;
  reason: string;
  createdAt: string;
}
