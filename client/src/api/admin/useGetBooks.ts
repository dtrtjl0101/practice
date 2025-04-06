import { useCallback } from "react";
import { useAtomValue } from "jotai";
import { AuthState } from "../../states/auth";
import API from "../api";

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

    return API.getBooks(
      {
        // TODO: Pagination
        pageable: {},
      },
      { headers: { authorization: `Bearer ${user.accessToken}` } }
    ).then((response) => {
      if (response.data) {
        console.log(response.data);
      } else {
        console.error(response.error);
      }
      return response.data;
    });
  }, [user]);

  return {
    getBooks,
  };
}
