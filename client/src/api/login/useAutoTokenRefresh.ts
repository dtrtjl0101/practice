import { useEffect } from "react";
import { AuthState } from "../../states/auth";
import { useAtomValue } from "jotai";
import useLogout from "./useLogout";
import useRefresh from "./useRefresh";

const REFRESH_INTERVAL = 1000 * 60 * 5; // 5 minutes

export default function useAutoTokenRefresh() {
  const user = useAtomValue(AuthState.user);
  const { logout } = useLogout();
  const { refresh } = useRefresh();

  useEffect(() => {
    if (!user) return;

    const timeout = setTimeout(() => {
      refresh();
    }, REFRESH_INTERVAL);

    return () => {
      clearTimeout(timeout);
    };
  }, [user, refresh, logout]);
}
