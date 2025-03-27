import { useCallback } from "react";
import { ApiBuilder } from "../apiBuilder";

export default function useJoin() {
  const join = useCallback(
    async ({ username, password }: { username: string; password: string }) => {
      new ApiBuilder<"join">("join")
        .body({
          username,
          password,
        })
        .send()
        .then((response) => {
          if (response.isSuccessful) {
            console.log(response.data.authToken);
          } else {
            console.error(response.error);
          }
        });
    },
    []
  );

  return {
    join,
  };
}
