import { useCallback } from "react";
import { useSetAtom } from "jotai";
import State from "../../states";
import { AuthState } from "../../states/auth";

export default function useLogin() {
  const setLoggedInUser = useSetAtom(State.Auth.user);

  const login = useCallback(
    async (loggedInUser: AuthState.LoggedInUser) => {
      setLoggedInUser(loggedInUser);
      localStorage.setItem("loggedInUser", JSON.stringify(loggedInUser));
    },
    [setLoggedInUser]
  );

  return {
    login,
  };
}
