import { atom } from "jotai";
import { Role } from "../types/role";

export namespace AuthState {
  export type LoggedInUser = {
    memberId: number;
    email: string;
    userId?: number;
    publisherId?: number;
    role: Role;
    profileImageURL: string;
    accessToken: string;
  } & (
    | {
        userId: number;
        role: Role.ROLE_USER;
      }
    | {
        publisherId: number;
        role: Role.ROLE_PUBLISHER;
      }
    | {
        role: Role.ROLE_ADMIN;
      }
  );
  export const user = atom<LoggedInUser | undefined>();
}
