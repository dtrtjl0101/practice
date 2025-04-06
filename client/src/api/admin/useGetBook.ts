import { useCallback } from "react";
import { useAtomValue } from "jotai";
import { AuthState } from "../../states/auth";
import API from "../api";

export default function useGetBook() {
  const user = useAtomValue(AuthState.user);

  const getBook = useCallback(
    async ({ bookId }: { bookId: number }) => {
      if (!user) {
        console.error("User is not logged in");
        return;
      }

      return API.downloadFile(bookId, {
        headers: { authorization: `Bearer ${user.accessToken}` },
      }).then((response) => {
        if (response.data) {
          console.log(response.data);
        } else {
          console.error(response.error);
        }
        return response.data;
      });
    },
    [user]
  );

  return {
    getBook,
  };
}
