export interface IBrand {
  id: number;
  code: string;
  name: string;
  isRecommended: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface IBrandCreateRequest {
  name: string;
  isRecommended?: boolean;
}

export interface IBrandUpdateRequest {
  name?: string;
  isRecommended?: boolean;
}

export interface IBrandJoinRequest {
  userId: number;
}

export interface IBrandLeaveRequest {
  userId: number;
}
