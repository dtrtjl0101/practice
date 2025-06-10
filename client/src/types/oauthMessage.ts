import { AuthState } from "../states/auth";

export type OAuthMessage =
  | {
      type: "OAUTH_SUCCESS";
      user: AuthState.LoggedInUser;
    }
  | {
      type: "OAUTH_ERROR";
      error: string;
    };
