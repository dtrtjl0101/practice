import { useCallback } from "react";
import { useAtomValue } from "jotai";
import { AuthState } from "../../states/auth";
import API from "../api";

export default function useUploadBook() {
  const user = useAtomValue(AuthState.user);

  const uploadBook = useCallback(
    async ({
      title,
      file,
      description,
      author,
    }: {
      title: string;
      file: File;
      description: string;
      author: string;
    }) => {
      if (!user) {
        console.error("User is not logged in");
        return;
      }

      API.uploadFile(
        {
          request: {
            title,
            file,
            description,
            author,
          },
        },
        {
          headers: {
            authorization: `Bearer ${user.accessToken}`,
          },
        }
      ).then((response) => {
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
    uploadBook,
  };
}
