import { atom } from "jotai";
import { Role } from "../types/role";

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace AuthState {
  export type LoggedInUser = {
    memberId: number;
    email: string;
    role: Role;
    profileImageURL: string;
    refreshToken: string;
    accessToken: string;
  } & (
    | {
        userId: number;
        nickname: string;
        role: Role.ROLE_USER;
        firstPaymentBenefit: boolean;
      }
    | {
        publisherId: number;
        publisherName: string;
        role: Role.ROLE_PUBLISHER;
      }
    | {
        role: Role.ROLE_ADMIN;
        firstPaymentBenefit: boolean;
      }
  );
  export const user = atom<LoggedInUser | undefined>();

  export enum RefreshState {
    IDLE = "IDLE",
    NEED_REFRESH = "NEED_REFRESH",
    REFRESHING = "REFRESHING",
  }
  export const refreshState = atom<RefreshState>(RefreshState.IDLE);
}
