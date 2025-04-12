import { useEffect } from "react";
import { AuthState } from "../../states/auth";
import useLogin from "./useLogin";

export default function useAutoLogin() {
  const { login } = useLogin();
  useEffect(() => {
    try {
      const savedLoggedInUser = localStorage.getItem("loggedInUser");
      if (!savedLoggedInUser) {
        return;
      }
      const parsedLoggedInUser: AuthState.LoggedInUser =
        JSON.parse(savedLoggedInUser);
      login(parsedLoggedInUser);
    } catch (e) {
      console.error("Error parsing loggedInUser from localStorage", e);
      localStorage.removeItem("loggedInUser");
      return undefined;
    }
  }, []);
}
