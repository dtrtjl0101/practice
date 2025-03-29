import { atom } from "jotai";

export namespace AuthState {
  export type LoggedInUser = {
    id: number;
    nickname: string;
    username: string;
    role: string;
  };
  export const user = atom<LoggedInUser | undefined>();
}
