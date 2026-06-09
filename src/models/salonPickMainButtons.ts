export interface ISalonPickMainButtonDailyClickCount {
  id: number;
  date: string;
  dailyClickCount: number;
  createdAt: string;
  updatedAt: string;
  salonPickMainButtonId: number;
}

export interface ISalonPickMainButton {
  id: number;
  code: string;
  clickCount: number;
  createdAt: string;
  updatedAt: string;
  dailyClickCounts?: ISalonPickMainButtonDailyClickCount[];
  yesterdayDailyClickCount?: ISalonPickMainButtonDailyClickCount | null;
}
