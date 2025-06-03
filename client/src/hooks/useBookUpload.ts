import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import API_CLIENT from "../api/api";
import { AuthState } from "../states/auth";
import { Role } from "../types/role";
import { enqueueSnackbar } from "notistack";

export const useBookUpload = () => {
  const user = useAtomValue(AuthState.user);
  const queryClient = useQueryClient();

  const [bookTitle, setBookTitle] = useState("");
  const [bookAuthor, setBookAuthor] = useState("");
  const [bookPrice, setBookPrice] = useState<number | null>(null);
  const [bookDescription, setBookDescription] = useState("");
  const [bookFile, setBookFile] = useState<File | undefined>(undefined);
  const [bookCover, setBookCover] = useState<File | undefined>(undefined);

  const resetForm = () => {
    setBookTitle("");
    setBookAuthor("");
    setBookPrice(null);
    setBookDescription("");
    setBookFile(undefined);
    setBookCover(undefined);
  };

  const fillForm = (book: any) => {
    setBookTitle(book.title);
    setBookAuthor(book.author);
    setBookPrice(book.price);
    setBookDescription(book.description || "");
    setBookFile(undefined);
    setBookCover(undefined);
  };

  const createBookMutation = useMutation({
    mutationFn: async (bookData: any) => {
      const response = await API_CLIENT.ebookController.uploadFile(bookData);
      if (!response.isSuccessful) {
        enqueueSnackbar(response.errorMessage, { variant: "error" });
        throw new Error(response.errorMessage);
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          "publisherBooks",
          user?.role === Role.ROLE_PUBLISHER ? user.publisherId : undefined,
        ],
      });
    },
  });

  const uploadBook = () => {
    if (
      !bookTitle ||
      !bookAuthor ||
      !bookDescription ||
      !bookFile ||
      !bookCover
    ) {
      enqueueSnackbar("모든 필드를 입력해주세요.", { variant: "warning" });
      return;
    }

    return createBookMutation.mutate({
      title: bookTitle,
      author: bookAuthor,
      description: bookDescription,
      file: bookFile,
      price: bookPrice,
      coverImageFile: bookCover,
    });
  };

  return {
    formData: {
      bookTitle,
      bookAuthor,
      bookPrice,
      bookDescription,
      bookFile,
      bookCover,
    },
    setters: {
      setBookTitle,
      setBookAuthor,
      setBookPrice,
      setBookDescription,
      setBookFile,
      setBookCover,
    },
    actions: {
      resetForm,
      fillForm,
      uploadBook,
    },
    isLoading: createBookMutation.isPending,
  };
};
