import { useCallback } from "react";
import { ApiBuilder } from "../apiBuilder";
import { useAtomValue } from "jotai";
import { AuthState } from "../../states/auth";

export default function useGetBook() {
  const user = useAtomValue(AuthState.user);

  const getBook = useCallback(
    async ({ bookId }: { bookId: number }) => {
      if (!user) {
        console.error("User is not logged in");
        return;
      }

      return new ApiBuilder<"GET", "admin/books/{id}">(
        "GET",
        `admin/books/${bookId}`
      )
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
    },
    [user]
  );

  return {
    getBook,
  };
}
