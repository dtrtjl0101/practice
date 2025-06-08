import { atom } from "jotai";
import getUserColorScheme from "../utils/getUserColorScheme";

export namespace UIState {
  export type UserColorScheme = "light" | "dark";
  export const userColorScheme = atom<UserColorScheme>(getUserColorScheme());
}
