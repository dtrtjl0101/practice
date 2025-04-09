import { useCallback } from "react";
import { useSetAtom } from "jotai";
import State from "../../states";
import API_CLIENT from "../api";

export default function useLogout() {
  const setLoggedInUser = useSetAtom(State.Auth.user);

  const logout = useCallback(async () => {
    API_CLIENT.setSecurityData(null);
    setLoggedInUser(undefined);
  }, [setLoggedInUser]);

  return {
    logout,
  };
}
