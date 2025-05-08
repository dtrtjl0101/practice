import { useEffect } from "react";
import useLogin from "./useLogin";
import getLoggedInUserFromLocalStorage from "../../util/getLoggedInUserFromLocalStorage";

export default function useAutoLogin() {
  const { login } = useLogin();
  useEffect(() => {
    const savedLoggedInUser = getLoggedInUserFromLocalStorage();
    if (!savedLoggedInUser) {
      return;
    }
    login(savedLoggedInUser);
  }, []);
}
