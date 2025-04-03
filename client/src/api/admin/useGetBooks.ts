import { useCallback } from "react";
import { ApiBuilder } from "../apiBuilder";
import { useAtomValue } from "jotai";
import { AuthState } from "../../states/auth";

export default function useGetBooks() {
  const user = useAtomValue(AuthState.user);

  const getBooks = useCallback(async () => {
    if (!user) {
      console.error("User is not logged in");
      return {
        isSuccessful: false,
        error: "User is not logged in",
      } as const;
    }

    return new ApiBuilder<"GET", "admin/books">("GET", "admin/books")
      .authToken(user.accessToken)
      .send()
      .then((response) => {
        if (response.isSuccessful) {
          console.log(response.data);
        } else {
          console.error(response.error);
        }
        return response;
      });
  }, [user]);

  return {
    getBooks,
  };
}
