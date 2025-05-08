import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import API_CLIENT, { wrapApiResponse } from "../../../api/api";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  Card,
  CardActionArea,
  CardMedia,
  Container,
  Divider,
  FilledInput,
  IconButton,
  InputAdornment,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import PageNavigation from "../../../component/PageNavigation";
import { BookMetadata } from "../../../types/book";
import { Search } from "@mui/icons-material";

export const Route = createFileRoute("/_pathlessLayout/books/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [page, setPage] = useState(0);
  const [sort, _setSort] = useState<string[]>([]);
  const [totalPages, setTotalPages] = useState(1);

  const pageSize = 25;

  // TODO: Search
  const { data: books } = useQuery({
    queryKey: ["bookList", page, sort, pageSize],
    queryFn: async () => {
      const response = await wrapApiResponse(
        API_CLIENT.ebookController.getBooks({
          page,
          size: pageSize,
          sort,
        })
      );

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
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Stack spacing={4}>
        <FilledInput
          placeholder="검색"
          fullWidth
          sx={{ padding: 1 }}
          endAdornment={
            <InputAdornment position="end">
              <IconButton>
                <Search />
              </IconButton>
            </InputAdornment>
          }
        />
        <Paper sx={{ p: 2 }}>
          <Stack spacing={2} sx={{ padding: 2 }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="h4">도서</Typography>
            </Stack>
            <PageNavigation
              pageZeroBased={page}
              setPage={setPage}
              totalPages={totalPages}
            />
            <Divider />
            <Stack spacing={1}>
              {books.map((book) => (
                <BookCard book={book} />
              ))}
            </Stack>
            <Divider />

            <PageNavigation
              pageZeroBased={page}
              setPage={setPage}
              totalPages={totalPages}
            />
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}
function BookCard(props: { book?: BookMetadata }) {
  const { book } = props;
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
    <Card
      elevation={3}
      key={book.id}
      sx={{
        padding: 2,
      }}
    >
      <Stack spacing={1} direction={"row"}>
        <CardActionArea sx={{ width: 128, height: 160 }}>
          <CardMedia
            image={book.bookCoverImageURL || "https://picsum.photos/128/160"}
            sx={{ width: 128, height: 160 }}
          />
        </CardActionArea>
        <Stack flexGrow={1} spacing={1}>
          <CardActionArea>
            <Typography variant="h5">{book.title}</Typography>
          </CardActionArea>
          <CardActionArea>
            <Typography variant="body2">{book.author}</Typography>
          </CardActionArea>
          <Typography variant="body2">{book.size} KB</Typography>
        </Stack>
      </Stack>
    </Card>
  );
}
