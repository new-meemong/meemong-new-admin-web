import { UserRoleType } from "@/models/users";

export type MongMoneyTransactionType = "deposit" | "withdraw";
export type MongMoneyType = "default" | "event";

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
  adminDescription?: string | null;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string | null;
  User?: IMongMoneyUser;
}

export interface IMongMoneyGroupItem {
  id: number;
  mongType: MongMoneyType;
  depositSum: number;
  withdrawSum: number;
  currentAmount: number;
  amount: number;
}

export interface IMongMoneyGroup {
  id: number;
  cursorId: number;
  userId: number;
  createdAt: string;
  adminDescription?: string | null;
  amount: number;
  paymentAmountKRW: number | null;
  depositTotalSum: number;
  withdrawTotalSum: number;
  currentTotalAmount: number;
  type: MongMoneyTransactionType;
  title: string;
  referTargetType: string;
  referTargetId: number | null;
  mongMoneyItems: IMongMoneyGroupItem[];
}
