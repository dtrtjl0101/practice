import { useCallback } from "react";
import API from "../api";
import { useSetAtom } from "jotai";
import State from "../../states";
import { Role } from "../../types/role";

export default function useJoin() {
  const setUser = useSetAtom(State.Auth.user);

  const join = useCallback(
    async ({
      nickname,
      username,
      password,
    }: {
      nickname: string;
      username: string;
      password: string;
    }) => {
      API.userJoin({
        nickname,
        username,
        password,
      }).then((response) => {
        if (!response.data) {
          console.error(response.error);
          return;
        }

        const { id, nickname, username, role, accessToken } = response.data;
        setUser({
          id: id!,
          nickname: nickname!,
          username: username!,
          role: role as unknown as Role,
          accessToken: accessToken!,
        });
      });
    },
    [setUser]
  );

  return {
    join,
  };
}
