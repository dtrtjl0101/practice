import { AuthState } from "../states/auth";

export default function getLoggedInUserFromLocalStorage() {
  try {
    const savedLoggedInUser = localStorage.getItem("loggedInUser");
    if (!savedLoggedInUser) {
      return undefined;
    }
    const parsedLoggedInUser: AuthState.LoggedInUser =
      JSON.parse(savedLoggedInUser);

    return parsedLoggedInUser;
  } catch (e) {
    console.error("Error parsing loggedInUser from localStorage", e);
    localStorage.removeItem("loggedInUser");
    return undefined;
  }
}
