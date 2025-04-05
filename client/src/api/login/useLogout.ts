import { useCallback } from "react";
import { useSetAtom } from "jotai";
import State from "../../states";

export default function useLogout() {
  const setLoggedInUser = useSetAtom(State.Auth.user);

  const logout = useCallback(async () => {
    setLoggedInUser(undefined);
  }, [setLoggedInUser]);

  return {
    logout,
  };
}
