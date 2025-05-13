import { useCallback } from "react";
import State from "../../states";
import API_CLIENT from "../api";
import { useAtom } from "jotai";

export default function useLogout() {
  const [loggedInUser, setLoggedInUser] = useAtom(State.Auth.user);

  const logout = useCallback(async () => {
    API_CLIENT.setSecurityData(null);
    setLoggedInUser(undefined);
    localStorage.removeItem("loggedInUser");

    let refreshToken = loggedInUser?.refreshToken;
    if (refreshToken) {
      await API_CLIENT.tokenController.logout({
        refreshToken,
      });
    }
  }, [loggedInUser, setLoggedInUser]);

  return {
    logout,
  };
}
