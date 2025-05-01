import { useCallback } from "react";
import { useSetAtom } from "jotai";
import State from "../../states";
import API_CLIENT from "../api";
import { AuthState } from "../../states/auth";

export default function useLogin() {
  const setLoggedInUser = useSetAtom(State.Auth.user);

  const login = useCallback(
    async (loggedInUser: AuthState.LoggedInUser) => {
      API_CLIENT.setSecurityData(loggedInUser.accessToken);
      setLoggedInUser(loggedInUser);
      localStorage.setItem("loggedInUser", JSON.stringify(loggedInUser));
    },
    [setLoggedInUser]
  );

  return {
    login,
  };
}
