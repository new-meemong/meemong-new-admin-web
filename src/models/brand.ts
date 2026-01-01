export interface IBrand {
  id: number;
  code: string;
  name: string;
  createdAt: string;
  updatedAt?: string;
}

export interface IBrandCreateRequest {
  name: string;
}

export interface IBrandUpdateRequest {
  name?: string;
}

export interface IBrandJoinRequest {
  userId: number;
}

export interface IBrandLeaveRequest {
  userId: number;
}


