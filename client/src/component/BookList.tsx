import {
  Card,
  CardMedia,
  LinearProgress,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import LinkCardActionArea from "./LinkCardActionArea";
import { BookMetadata } from "../types/book";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import PageNavigation from "./PageNavigation";
import { JSX, useState } from "react";
import API_CLIENT from "../api/api";

export enum BookListKind {
  ALL_BOOK = "ALL_BOOK",
  PURCHASED_BOOK = "PURCHASED_BOOK",
}

export default function BookList(props: {
  size: "small" | "large";
  action?: JSX.Element;
  kind?: BookListKind;
  title: string;
  searchTitle?: string;
}) {
  const { size, action, kind: kind_, title, searchTitle } = props;
  const [sort, _setSort] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const pageSize = size === "small" ? 5 : 25;
  const kind = kind_ ?? BookListKind.ALL_BOOK;

  const { data: books } = useQuery({
    queryKey: [kind, page, sort, pageSize, searchTitle],
    queryFn: async () => {
      const response = await getFetchFunction(kind)({
        page,
        size: pageSize,
        sort,
        title: searchTitle,
      });
      if (response.isSuccessful) {
        setTotalPages(response.data.totalPages!);
        return response.data.content! as (BookMetadata | undefined)[];
      }
      throw new Error(response.errorMessage);
    },
    initialData: new Array(pageSize).fill(undefined) as (
      | BookMetadata
      | undefined
    )[],
    placeholderData: keepPreviousData,
  });

  return (
    <Card>
      <Stack spacing={2} sx={{ padding: 2 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h4">{title}</Typography>
          {action}
        </Stack>
        <PageNavigation
          pageZeroBased={page}
          setPage={setPage}
          totalPages={totalPages}
        />
        <Stack spacing={1}>
          {books.map((book) => (
            <BookListItem key={book?.id ?? Math.random()} book={book} />
          ))}
        </Stack>
        <PageNavigation
          pageZeroBased={page}
          setPage={setPage}
          totalPages={totalPages}
        />
      </Stack>
    </Card>
  );
}

function BookListItem(props: { book?: BookMetadata }) {
  const { book } = props;

  const { data: readProgress } = useQuery({
    queryKey: ["book", book?.id],
    queryFn: async () => {
      if (!book) return 0;
      const response = await API_CLIENT.readingProgressController.getMyProgress(
        book.id
      );
      if (!response.isSuccessful) {
        throw new Error(response.errorMessage);
      }
      return response.data.percentage!;
    },
    initialData: 0,
  });

  if (!book) {
    return (
      <Card elevation={3} sx={{ padding: 2 }}>
        <Stack spacing={1} direction={"row"}>
          <Skeleton variant="rectangular" width={128} height={160} />
          <Stack flexGrow={1} spacing={1}>
            <Skeleton variant="text" width="60%" height={32} />
            <Skeleton variant="text" width="40%" height={24} />
            <Skeleton variant="text" width="30%" height={20} />
          </Stack>
        </Stack>
      </Card>
    );
  }

  return (
    <Card elevation={3} key={book.id}>
      <LinearProgress value={readProgress * 100} variant="determinate" />
      <Stack spacing={1} direction={"row"} sx={{ padding: 2 }}>
        <LinkCardActionArea
          sx={{ width: 128, height: 160 }}
          to="/books/$bookId"
          params={{ bookId: book.id }}
        >
          <CardMedia
            image={book.bookCoverImageURL || "https://picsum.photos/128/160"}
            sx={{ width: 128, height: 160 }}
          />
        </LinkCardActionArea>
        <Stack flexGrow={1} spacing={1}>
          <LinkCardActionArea to="/books/$bookId" params={{ bookId: book.id }}>
            <Typography variant="h5">{book.title}</Typography>
          </LinkCardActionArea>
          <LinkCardActionArea to="/books/$bookId" params={{ bookId: book.id }}>
            <Typography variant="body2">{book.author}</Typography>
          </LinkCardActionArea>
          <Typography variant="body2">{book.size} KB</Typography>
        </Stack>
      </Stack>
    </Card>
  );
}

function getFetchFunction(groupType: BookListKind) {
  switch (groupType) {
    case BookListKind.ALL_BOOK:
      return API_CLIENT.ebookController.getBooks;
    case BookListKind.PURCHASED_BOOK:
      return API_CLIENT.ebookPurchaseController.getMyBooks;
    default:
      throw new Error("Invalid group type");
  }
}
