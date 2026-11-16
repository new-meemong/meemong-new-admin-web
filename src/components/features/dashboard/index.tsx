"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { parseISO } from "date-fns";
import { ko } from "date-fns/locale";
import type { DashboardRoleFilter } from "@/apis/dashboards/types";
import { dateRange, kstToday, validateRange } from "./statistics";
import { calendarRangeDraft } from "./calendar-range";
import { Segments } from "./dashboard-widgets";
import HomeDashboard from "./home-dashboard";
import PaymentDashboard from "./payment-dashboard";
import ReviewSaleDashboard from "./review-sale-dashboard";
import ActivityDashboard from "./activity-dashboard";
import HairConsultationDashboard from "./hair-consultation-dashboard";
import "./dashboard.css";

type DashboardSection =
  | "home"
  | "payments"
  | "reviews"
  | "hairConsultations"
  | "activity";
/** 회원 역할 조건이 없는 통계 탭은 역할 토글을 전체로 고정합니다. */
const roleFixedSections: DashboardSection[] = ["reviews", "hairConsultations"];
const sections: { value: DashboardSection; label: string }[] = [
  { value: "home", label: "홈" },
  { value: "payments", label: "결제" },
  { value: "reviews", label: "리뷰특가" },
  { value: "hairConsultations", label: "헤어컨설팅" },
  { value: "activity", label: "활동" },
];
export default function DashboardPageContent() {
  const [section, setSection] = useState<DashboardSection>("home");
  const [role, setRole] = useState<DashboardRoleFilter>("all");
  const [range, setRange] = useState(() => dateRange(30));
  const [draft, setDraft] = useState(range);
  const [preset, setPreset] = useState("30");
  // Do not prerender a date-dependent max: React can retain yesterday's
  // HTML attribute during hydration even when the client computes today.
  const [today, setToday] = useState<string>();
  useEffect(() => {
    const refreshToday = () => setToday(kstToday());
    refreshToday();
    const timer = window.setInterval(refreshToday, 60_000);
    window.addEventListener("focus", refreshToday);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", refreshToday);
    };
  }, []);
  const error = validateRange(draft, today);
  function choosePeriod(value: string) {
    setPreset(value);
    const next = dateRange(Number(value));
    setDraft(next);
    setRange(next);
  }
  return (
    <div className="operations-dashboard">
      <header className="dashboard-header">
        <div className="dashboard-container">
          <h1>미몽 통합 대시보드</h1>
          <nav className="dashboard-navigation" aria-label="대시보드 화면">
            {sections.map((item) => (
              <Button
                key={item.value}
                type="button"
                variant="ghost"
                aria-current={section === item.value ? "page" : undefined}
                onClick={() => setSection(item.value)}
              >
                {item.label}
              </Button>
            ))}
          </nav>
          <div className="dashboard-filters">
            <Segments
              label="회원 역할"
              value={roleFixedSections.includes(section) ? "all" : role}
              onChange={setRole}
              disabled={roleFixedSections.includes(section)}
              options={[
                { value: "all", label: "전체" },
                { value: "model", label: "고객" },
                { value: "designer", label: "디자이너" },
              ]}
            />
            {section === "activity" && (
              <span className="dashboard-note">
                행동 지표 카드는 당일 고정 · 추이·탈퇴는 선택 기간
              </span>
            )}
            <Segments
              label="조회 기간"
              value={preset}
              onChange={choosePeriod}
              options={[
                { value: "1", label: "당일" },
                { value: "7", label: "7일" },
                { value: "30", label: "30일" },
                { value: "90", label: "90일" },
              ]}
            />
            <form
              className="dashboard-date-range"
              onSubmit={(event) => {
                event.preventDefault();
                if (!error) {
                  setRange(draft);
                  setPreset("custom");
                }
              }}
            >
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    aria-label="기간 달력 열기"
                  >
                    <Image
                      src="/dashboard/calendar.svg"
                      width={14}
                      height={14}
                      alt=""
                    />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    max={89}
                    locale={ko}
                    defaultMonth={parseISO(draft.startDateKST || kstToday())}
                    selected={{
                      from: draft.startDateKST
                        ? parseISO(draft.startDateKST)
                        : undefined,
                      to: draft.endDateKST
                        ? parseISO(draft.endDateKST)
                        : undefined,
                    }}
                    disabled={{ after: parseISO(today ?? kstToday()) }}
                    onSelect={(selection, triggerDate) => {
                      setPreset("custom");
                      setDraft((current) =>
                        calendarRangeDraft(current, selection, triggerDate),
                      );
                    }}
                  />
                  <p className="px-3 pb-3 text-xs text-muted-foreground">
                    최대 90일 · 날짜 선택 후 조회를 눌러주세요.
                  </p>
                </PopoverContent>
              </Popover>
              <input
                aria-label="시작일"
                type="date"
                value={draft.startDateKST}
                max={today}
                onChange={(event) => {
                  setPreset("custom");
                  setDraft({ ...draft, startDateKST: event.target.value });
                }}
              />
              <span>~</span>
              <input
                aria-label="마감일"
                type="date"
                value={draft.endDateKST}
                max={today}
                onChange={(event) => {
                  setPreset("custom");
                  setDraft({ ...draft, endDateKST: event.target.value });
                }}
              />
              <Button type="submit" variant="ghost" disabled={!!error}>
                조회
              </Button>
            </form>
          </div>
          {error && (
            <p className="dashboard-filter-error" role="alert">
              {error}
            </p>
          )}
        </div>
      </header>
      <div className="dashboard-container dashboard-content">
        {section === "home" && <HomeDashboard range={range} role={role} />}{" "}
        {section === "payments" && (
          <PaymentDashboard range={range} role={role} />
        )}{" "}
        {section === "reviews" && <ReviewSaleDashboard range={range} />}{" "}
        {section === "hairConsultations" && (
          <HairConsultationDashboard range={range} />
        )}{" "}
        {section === "activity" && (
          <ActivityDashboard range={range} role={role} />
        )}
      </div>
    </div>
  );
}
