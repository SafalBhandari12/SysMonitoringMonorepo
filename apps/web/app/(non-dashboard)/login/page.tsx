"use client";

import { LoginForm } from "@/components/authentication/login-form";
import Loading from "@/components/loading";
import { GalleryVerticalEndIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const { status, data } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (data?.user?.onboarded === false) {
      router.push("/onboarding");
    }
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  if (status === "loading") {
    return <Loading />;
  }
  if (data?.user?.onboarded === false) {
    redirect("/onboarding");
  }
  if (status === "authenticated") {
    redirect("/dashboard");
  }

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <img
          src="/sd.png"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
}
