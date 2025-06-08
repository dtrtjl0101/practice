import { getDefaultStore } from "jotai";
import getLoggedInUserFromLocalStorage from "../../utils/getLoggedInUserFromLocalStorage";
import State from "../../states";

export default function autoLogin() {
  const savedLoggedInUser = getLoggedInUserFromLocalStorage();
  if (!savedLoggedInUser) {
    return;
  }
  getDefaultStore().set(State.Auth.user, savedLoggedInUser);
}
