import { useCallback } from "react";
import { AuthState } from "../../states/auth";
import { useAtomValue, useSetAtom } from "jotai";
import API_CLIENT, { wrapApiResponse } from "../api";
import useLogout from "./useLogout";
import State from "../../states";

export default function useRefresh() {
  const user = useAtomValue(AuthState.user);
  const setLoggedInUser = useSetAtom(State.Auth.user);
  const { logout } = useLogout();
  const setRefreshState = useSetAtom(AuthState.refreshState);

  const refresh = useCallback(async () => {
    if (!user) return;

    const response = await wrapApiResponse(
      API_CLIENT.tokenController.refreshAccessToken({
        refreshToken: user.refreshToken,
      })
    );

    if (!response.isSuccessful) {
      console.error("Failed to refresh token", response.errorCode);
      logout();
      return;
    }

    const { accessToken, refreshToken } = response.data;
    API_CLIENT.setSecurityData(accessToken!);
    setLoggedInUser((prev) => {
      const next = {
        ...prev,
        accessToken: accessToken!,
        ...(refreshToken ? { refreshToken } : {}),
      } as AuthState.LoggedInUser;
      localStorage.setItem("loggedInUser", JSON.stringify(next));
      return next;
    });
    setRefreshState(AuthState.RefreshState.IDLE);
  }, [user, setLoggedInUser, logout, setRefreshState]);

  return {
    refresh,
  };
}
