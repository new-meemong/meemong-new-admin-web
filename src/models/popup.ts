export interface IPopup {
  id: number;
  userType: string;
  company: string;
  popupType: string;
  hideType: string;
  imageUrl: string;
  redirectUrl: string;
  createdAt: string;
  endAt?: string;
}

export interface IPopupForm {
  id?: number;
  company: string;
  userType: string;
  popupType: string;
  hideType?: string;
  imageUrl: string;
  imageFile?: File;
  redirectUrl: string;
  createdAt?: string;
  endAt?: string;
}
