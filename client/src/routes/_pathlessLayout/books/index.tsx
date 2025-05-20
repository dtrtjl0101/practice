import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Container, IconButton, Stack } from "@mui/material";
import BookSearchInput from "../../../component/BookSearchInput";
import { Search } from "@mui/icons-material";
import BookList from "../../../component/BookList";

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

  const [searchInput, setSearchInput] = useState("");
  const navigate = Route.useNavigate();

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
    <Container sx={{ my: 8 }}>
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
        <BookList size="large" title="도서" searchTitle={title} />
      </Stack>
    </Container>
  );
}
