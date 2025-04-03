import { useCallback } from "react";
import { ApiBuilder } from "../apiBuilder";
import { useAtomValue } from "jotai";
import { AuthState } from "../../states/auth";

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

      return new ApiBuilder<"POST", "admin/books/upload">(
        "POST",
        "admin/books/upload"
      )
        .authToken(user.accessToken)
        .formData({
          title,
          file,
          description,
          author,
        })
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
    uploadBook,
  };
}
