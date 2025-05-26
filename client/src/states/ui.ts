import { atom } from "jotai";
import getUserColorScheme from "../util/getUserColorScheme";

export namespace UIState {
  export type UserColorScheme = "light" | "dark";
  export const userColorScheme = atom<UserColorScheme>(getUserColorScheme());
}
