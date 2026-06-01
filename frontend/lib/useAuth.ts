"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUser, getToken } from "./api";

export function useAuth(allowedRoles?: string[]) {
  const router = useRouter();
  const [user, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    const currentUser = getUser();

    if (!token || !currentUser) {
      router.push("/auth/login");
      return;
    }

    if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
      router.push("/"); // Redirect if not authorized
      return;
    }

    setUserData(currentUser);
    setIsLoading(false);
  }, [router, allowedRoles?.join(',')]);

  return { user, isLoading };
}
