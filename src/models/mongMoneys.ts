import { UserRoleType } from "@/models/users";

export type MongMoneyTransactionType = "deposit" | "withdraw";

export interface IMongMoneyUser {
  id: number;
  displayName: string;
  role: UserRoleType;
}

export interface IMongMoney {
  id: number;
  userId: number;
  amount: number;
  type: MongMoneyTransactionType;
  title: string;
  mongType: string;
  currentAmount?: number;
  version?: number;
  referTargetType?: string;
  referTargetId?: number | null;
  subType?: string;
  depositSum?: number;
  withdrawSum?: number;
  depositTotalSum?: number;
  withdrawTotalSum?: number;
  adminDescription?: string;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string | null;
  User?: IMongMoneyUser;
}
