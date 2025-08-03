"use client";

import React from "react";
import { cn } from "@/lib/utils";
import LoginForm from "@/components/features/login/login-form";

export default function LoginPage() {
  return (
    <div
      className={cn(
        "w-full h-screen bg-white flex flex-col items-center justify-center",
      )}
    >
      <div
        className={cn(
          "typo-title-1-bold text-6xl mx-auto text-primary-foreground",
        )}
      >
        미몽
      </div>
      <div className={cn("typo-title-1-medium text-foreground-label-sub mt-4")}>
        미몽 관리자 페이지입니다.
      </div>
      <div className={cn('w-[250px] mt-4')}>
        <LoginForm />
      </div>
    </div>
  );
}
