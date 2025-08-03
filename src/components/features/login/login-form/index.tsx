"use client";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import React, { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");

  const router = useRouter()

  const handleLogin = useCallback(() => {
    console.log(adminId, password)
    router.push("/user")
  }, [adminId, password]);

  return (
    <div className={cn("w-full")}>
      <div className="mb-4">
        <Input
          name="adminId"
          type="adminId"
          placeholder="아이디"
          value={adminId}
          onChange={(e) => setAdminId(e.target.value)}
          size="md"
          className="w-full"
        />
      </div>
      <div className="mb-4">
        <Input
          name="password"
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          size="md"
          className="w-full"
        />
      </div>
      <div className={cn("w-full mt-3")}>
        <Button className={cn("w-full")} onClick={handleLogin} size={"submit"}>
          로그인
        </Button>
      </div>
    </div>
  );
}
