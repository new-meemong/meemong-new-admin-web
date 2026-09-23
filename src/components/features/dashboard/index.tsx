"use client";
import { useState } from "react";
import { CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DashboardRoleFilter } from "@/apis/dashboards/types";
import { dateRange, kstToday, validateRange } from "./statistics";
import { Segments } from "./dashboard-widgets";
import HomeDashboard from "./home-dashboard";
import PaymentDashboard from "./payment-dashboard";
import ReviewSaleDashboard from "./review-sale-dashboard";
import ActivityDashboard from "./activity-dashboard";
import "./dashboard.css";

type DashboardSection = "home" | "payments" | "reviews" | "activity";
const sections: { value: DashboardSection; label: string }[] = [
  { value: "home", label: "홈" },
  { value: "payments", label: "결제" },
  { value: "reviews", label: "리뷰특가" },
  { value: "activity", label: "활동" },
];
export default function DashboardPageContent() {
  const [section, setSection] = useState<DashboardSection>("home");
  const [role, setRole] = useState<DashboardRoleFilter>("all");
  const [range, setRange] = useState(() => dateRange(30));
  const [draft, setDraft] = useState(range);
  const [preset, setPreset] = useState("30");
  const error = validateRange(draft);
  function choosePeriod(value: string) {
    setPreset(value);
    const next = dateRange(value === "all" ? 90 : Number(value));
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
              value={section === "reviews" ? "all" : role}
              onChange={setRole}
              disabled={section === "reviews"}
              options={[
                { value: "all", label: "전체" },
                { value: "model", label: "고객" },
                { value: "designer", label: "디자이너" },
              ]}
            />
            {section === "activity" && (
              <span className="dashboard-note">
                행동 지표는 당일 고정 · 탈퇴 기간
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
                { value: "all", label: "전체" },
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
              <CalendarDays size={16} aria-hidden />
              <input
                aria-label={section === "activity" ? "탈퇴 시작일" : "시작일"}
                type="date"
                value={draft.startDateKST}
                max={kstToday()}
                onChange={(event) =>
                  setDraft({ ...draft, startDateKST: event.target.value })
                }
              />
              <span>~</span>
              <input
                aria-label={section === "activity" ? "탈퇴 마감일" : "마감일"}
                type="date"
                value={draft.endDateKST}
                max={kstToday()}
                onChange={(event) =>
                  setDraft({ ...draft, endDateKST: event.target.value })
                }
              />
              <Button type="submit" variant="ghost" disabled={!!error}>
                조회
              </Button>
            </form>
          </div>
          {error && (
            <p className="dashboard-filter-error" role="alert">
              {error} 기존 조회 결과를 표시합니다.
            </p>
          )}
          {preset === "all" && (
            <p className="dashboard-note">
              전체는 API 최대 조회 범위인 최근 90일을 표시합니다.
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
        {section === "activity" && (
          <ActivityDashboard range={range} role={role} />
        )}
      </div>
    </div>
  );
}
