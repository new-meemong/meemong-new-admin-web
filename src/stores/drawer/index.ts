import { create } from "zustand";

interface DrawerStore {
  isOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  setOpen: (open: boolean) => void;
  preventCloseOnOverlayClick: boolean;
}

export const useDrawer = create<DrawerStore>((set) => ({
  isOpen: false,
  openDrawer: () => set({ isOpen: true }),
  closeDrawer: () => set({ isOpen: false }),
  setOpen: (isOpen) => set({ isOpen }),
  preventCloseOnOverlayClick: true,
}));
