"use client";

import React, { FormEvent, useCallback, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { usePostAdminLogin } from "@/queries/auth";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const router = useRouter();

  const postAdminLoginMutation = usePostAdminLogin();

  const handleLogin = useCallback(
    async (event: FormEvent) => {
      try {
        event.preventDefault();
        event.stopPropagation();
        const response = await postAdminLoginMutation.mutateAsync({
          name,
          password,
        });
        const token = response.token;

        if (token) {
          document.cookie = `accessToken=${token}; path=/; max-age=7776000; secure`;
        }

        router.push("/user");
      } catch (error) {
        console.log(error);
      }
    },
    [name, password],
  );

  return (
    <form onSubmit={handleLogin}>
      <div className={cn("w-full")}>
        <div className="mb-4">
          <Input
            name="name"
            type="text"
            placeholder="아이디"
            value={name}
            onChange={(e) => setName(e.target.value)}
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
          <Button
            type={"submit"}
            className={cn("w-full")}
            size={"submit"}
          >
            로그인
          </Button>
        </div>
      </div>
    </form>
  );
}
