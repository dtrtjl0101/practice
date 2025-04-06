import { useCallback } from "react";
import { useSetAtom } from "jotai";
import State from "../../states";
import { ENV } from "../../env";
import { Role } from "../../types/role";

// TODO: Use swagger
export default function useLogin() {
  const setLoggedInUser = useSetAtom(State.Auth.user);

  const login = useCallback(
    async ({ username, password }: { username: string; password: string }) => {
      fetch(`${ENV.CHAEKIT_API_ENDPOINT}/api/login`, {
        body: JSON.stringify({
          username,
          password,
        }),
        method: "POST",
      }).then(async (response) => {
        if (!response.ok) {
          console.error(await response.text());
          return;
        }
        const data = (await response.json()) as {
          id: number;
          nickname: string;
          username: string;
          role: Role;
          accessToken: string;
        };
        setLoggedInUser(data);
      });
    },
    [setLoggedInUser]
  );

  return {
    login,
  };
}
