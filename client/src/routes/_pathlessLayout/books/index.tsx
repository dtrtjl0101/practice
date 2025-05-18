import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import API_CLIENT from "../../../api/api";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  Card,
  CardMedia,
  Container,
  Divider,
  IconButton,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import PageNavigation from "../../../component/PageNavigation";
import { BookMetadata } from "../../../types/book";
import LinkCardActionArea from "../../../component/LinkCardActionArea";
import BookSearchInput from "../../../component/BookSearchInput";
import { Search } from "@mui/icons-material";

export const Route = createFileRoute("/_pathlessLayout/books/")({
  component: RouteComponent,
  validateSearch: (search) => {
    return {
      title: search.title as string | undefined,
    };
  },
});

function RouteComponent() {
  const { title } = Route.useSearch();
  const [page, setPage] = useState(0);
  const [sort, _setSort] = useState<string[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const navigate = Route.useNavigate();

  const pageSize = 25;

  const { data: books } = useQuery({
    queryKey: ["bookList", page, sort, pageSize, title],
    queryFn: async () => {
      const response = await API_CLIENT.ebookController.getBooks({
        page,
        size: pageSize,
        sort,
        title,
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

  const handleSearch = () => {
    if (!searchInput) {
      return;
    }
    navigate({
      to: ".",
      search: {
        title: searchInput,
      },
    });
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Stack spacing={4}>
        <Stack spacing={2} direction={"row"} alignItems="center">
          <BookSearchInput
            onValueChange={setSearchInput}
            onAction={handleSearch}
            inputValue={searchInput}
            setInputValue={setSearchInput}
          />
          <IconButton onClick={handleSearch}>
            <Search />
          </IconButton>
        </Stack>
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
        <LinkCardActionArea
          sx={{ width: 128, height: 160 }}
          to="/books/$bookId"
          params={{ bookId: `${book.id}` }}
        >
          <CardMedia
            image={book.bookCoverImageURL || "https://picsum.photos/128/160"}
            sx={{ width: 128, height: 160 }}
          />
        </LinkCardActionArea>
        <Stack flexGrow={1} spacing={1}>
          <LinkCardActionArea
            to="/books/$bookId"
            params={{ bookId: `${book.id}` }}
          >
            <Typography variant="h5">{book.title}</Typography>
          </LinkCardActionArea>
          <LinkCardActionArea
            to="/books/$bookId"
            params={{ bookId: `${book.id}` }}
          >
            <Typography variant="body2">{book.author}</Typography>
          </LinkCardActionArea>
          <Typography variant="body2">{book.size} KB</Typography>
        </Stack>
      </Stack>
    </Card>
  );
}
