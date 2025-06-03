import { useQuery } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import API_CLIENT from "../api/api";
import { AuthState } from "../states/auth";
import { BookRequest, BookMetadata } from "../types/book";
import { Role } from "../types/role";

export const usePublisherData = () => {
  const user = useAtomValue(AuthState.user);
  const isPublisher =
    user &&
    (user?.role === Role.ROLE_PUBLISHER || user?.role === Role.ROLE_ADMIN);

  const publisherInfo = useQuery({
    queryKey: ["publisherInfo", user?.memberId],
    queryFn: async () => {
      const response = await API_CLIENT.publisherController.publisherInfo();
      if (!response.isSuccessful) {
        throw new Error(response.errorMessage);
      }
      return response.data;
    },
    enabled: isPublisher,
    initialData: {},
  });

  const publisherStats = useQuery({
    queryKey: ["publisherStats", user?.memberId],
    queryFn: async () => {
      const response = await API_CLIENT.publisherController.getPublisherStats();
      if (!response.isSuccessful) {
        throw new Error(response.errorMessage);
      }
      return response.data;
    },
    enabled: isPublisher,
    initialData: {},
  });

  const unreleasedBooks = useQuery({
    queryKey: ["unreleasedBooks", user?.memberId],
    queryFn: async () => {
      const response =
        await API_CLIENT.ebookRequestController.getEbookRequests();
      if (!response.isSuccessful) {
        alert(response.errorMessage);
        throw new Error(response.errorMessage);
      }
      return response.data.content as BookRequest[];
    },
    enabled: isPublisher,
    initialData: [] as BookRequest[],
  });

  const publishedBooks = useQuery({
    queryKey: ["publishedBooks", user?.memberId],
    queryFn: async () => {
      const response = await API_CLIENT.publisherController.getPublisherBooks();
      if (!response.isSuccessful) {
        throw new Error(response.errorMessage);
      }
      return response.data.content as BookMetadata[];
    },
    enabled: isPublisher,
    initialData: [] as BookMetadata[],
  });

  return {
    user,
    isPublisher,
    publisherInfo: publisherInfo.data,
    publisherStats: publisherStats.data,
    unreleasedBooks: unreleasedBooks.data,
    publishedBooks: publishedBooks.data,
    isLoading:
      publisherInfo.isLoading ||
      publisherStats.isLoading ||
      unreleasedBooks.isLoading ||
      publishedBooks.isLoading,
  };
};
