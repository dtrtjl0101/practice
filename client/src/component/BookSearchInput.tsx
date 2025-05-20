import { Autocomplete, TextField } from "@mui/material";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { BookMetadata } from "../types/book";
import API_CLIENT from "../api/api";
import { Stack, Typography, Avatar } from "@mui/material";

export default function BookSearchInput(props: {
  onAction?: (value: string) => void;
  onBookChange?: (book: BookMetadata | null) => void;
  onValueChange?: (value: string) => void;
  inputValue: string;
  setInputValue: (value: string) => void;
}) {
  const { onAction, onBookChange, onValueChange, inputValue, setInputValue } =
    props;
  const [titleToSearch, setTitleToSearch] = useState("");
  const [book, setBook] = useState<BookMetadata | null>(null);

  const { data: books } = useQuery({
    queryKey: ["books", titleToSearch],
    queryFn: async () => {
      const response = await API_CLIENT.ebookController.getBooks({
        title: titleToSearch,
        page: 0,
        size: 10,
      });
      if (!response.isSuccessful) {
        throw new Error(response.errorMessage);
      }
      return response.data.content! as BookMetadata[];
    },
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    const handler = setTimeout(() => {
      setTitleToSearch(inputValue);
    }, 400);
    return () => clearTimeout(handler);
  }, [inputValue]);

  useEffect(() => {
    if (!onBookChange) {
      return;
    }
    onBookChange(book);
  }, [book, onBookChange]);

  useEffect(() => {
    if (!onValueChange) {
      return;
    }
    onValueChange(inputValue);
  }, [inputValue, onValueChange]);

  return (
    <Autocomplete
      freeSolo
      autoComplete
      disablePortal
      options={
        books?.map((book) => ({
          label: book.title,
          id: book.id,
          author: book.author,
          bookCoverImageURL: book.bookCoverImageURL,
        })) || []
      }
      noOptionsText="검색된 책이 없습니다."
      fullWidth
      isOptionEqualToValue={(option, value) => {
        return option.id === value.id;
      }}
      onChange={(_, value) => {
        if (!value) {
          setBook(null);
          return;
        }
        if (typeof value === "string") {
          setBook(null);
          return;
        }
        const selectedBook = books?.find((book) => book.id === value.id);
        if (!selectedBook) {
          setBook(null);
          return;
        }
        setBook(selectedBook);
      }}
      onInputChange={(_, value) => {
        setInputValue(value);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          if (!onAction) {
            return;
          }
          onAction(inputValue);
        }
      }}
      renderInput={(params) => <TextField {...params} placeholder="책 제목" />}
      renderOption={(props, option) => (
        <li {...props} key={option.id}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar
              src={option.bookCoverImageURL}
              variant="rounded"
              sx={{ width: 40, height: 56 }}
            />
            <Stack spacing={1} flexGrow={1}>
              <Typography variant="body2">{option.label}</Typography>
              <Typography variant="caption" color="textSecondary">
                {option.author}
              </Typography>
            </Stack>
          </Stack>
        </li>
      )}
    />
  );
}
