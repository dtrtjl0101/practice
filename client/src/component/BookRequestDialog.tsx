import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  Grid,
  InputAdornment,
  Typography,
} from "@mui/material";
import { FileUpload } from "@mui/icons-material";

interface BookRequestDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  buttonText: string;
  formData: {
    bookTitle: string;
    bookAuthor: string;
    bookPrice: number | null;
    bookDescription: string;
    bookFile: File | undefined;
    bookCover: File | undefined;
  };
  setters: {
    setBookTitle: (title: string) => void;
    setBookAuthor: (author: string) => void;
    setBookPrice: (price: number) => void;
    setBookDescription: (description: string) => void;
    setBookCover: (cover: File | undefined) => void;
    setBookFile: (file: File | undefined) => void;
  };
  onUpload: () => void;
}

export const BookRequestDialog: React.FC<BookRequestDialogProps> = ({
  open,
  onClose,
  title,
  buttonText,
  formData,
  setters,
  onUpload,
}) => {
  const {
    bookTitle,
    bookAuthor,
    bookPrice,
    bookDescription,
    bookFile,
    bookCover,
  } = formData;
  const {
    setBookTitle,
    setBookAuthor,
    setBookPrice,
    setBookDescription,
    setBookCover,
    setBookFile,
  } = setters;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <TextField
            label="도서명"
            value={bookTitle}
            onChange={(e) => setBookTitle(e.target.value)}
            placeholder="도서 제목을 입력하세요."
            fullWidth
          />
          <Grid container spacing={2}>
            <Grid size="grow">
              <TextField
                label="저자명"
                value={bookAuthor}
                onChange={(e) => setBookAuthor(e.target.value)}
                placeholder="저자 이름을 입력하세요."
                fullWidth
              />
            </Grid>
            <Grid size="grow">
              <TextField
                label="가격"
                type="number"
                value={bookPrice || ""}
                onChange={(e) => setBookPrice(Number(e.target.value))}
                placeholder="가격을 입력하세요."
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">₩</InputAdornment>
                    ),
                  },
                }}
                fullWidth
              />
            </Grid>
          </Grid>
          <TextField
            label="도서 소개"
            multiline
            rows={4}
            value={bookDescription}
            onChange={(e) => setBookDescription(e.target.value)}
            placeholder="도서에 대한 설명을 입력하세요."
            fullWidth
          />
          <Grid container spacing={2}>
            <Grid size={12}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Button
                  variant="outlined"
                  startIcon={<FileUpload />}
                  component="label"
                >
                  표지 업로드
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={(e) => setBookCover(e.target.files?.[0])}
                  />
                </Button>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{ flexGrow: 1 }}
                >
                  {bookCover ? bookCover.name : "표지 파일을 선택하세요."}
                </Typography>
              </Stack>
            </Grid>
            <Grid size={12}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Button
                  variant="outlined"
                  startIcon={<FileUpload />}
                  component="label"
                >
                  전자책 업로드
                  <input
                    type="file"
                    hidden
                    accept=".epub"
                    onChange={(e) => setBookFile(e.target.files?.[0])}
                  />
                </Button>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{ flexGrow: 1 }}
                >
                  {bookFile ? bookFile.name : "전자책 파일을 선택하세요."}
                </Typography>
              </Stack>
            </Grid>
          </Grid>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>취소</Button>
        <Button variant="contained" onClick={onUpload}>
          {buttonText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
