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
    setLoggedInUser((prev) => {
      return {
        ...prev,
        accessToken: accessToken!,
        ...(refreshToken ? { refreshToken } : {}),
      } as AuthState.LoggedInUser;
    });
  }, [user, setLoggedInUser, logout]);

  return {
    refresh,
  };
}
