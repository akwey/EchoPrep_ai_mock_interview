"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { logout } from "@/lib/actions/auth.action";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {

      await logout();

      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return <Button onClick={handleLogout}>Logout</Button>;
}
