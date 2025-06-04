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
  Box,
  Paper,
  Divider,
  IconButton,
} from "@mui/material";
import {
  FileUpload,
  Close,
  ImageOutlined,
  MenuBookOutlined,
} from "@mui/icons-material";
import { enqueueSnackbar } from "notistack";

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

  const FileUploadButton = ({
    label,
    accept,
    onChange,
    fileName,
    placeholder,
    icon,
  }: {
    label: string;
    accept: string;
    onChange: (file: File | undefined) => void;
    fileName?: string;
    placeholder: string;
    icon: React.ReactNode;
  }) => (
    <Paper
      variant="outlined"
      sx={{
        p: 2.5,
        borderStyle: fileName ? "solid" : "dashed",
        borderColor: fileName ? "primary.main" : "grey.300",
        backgroundColor: fileName ? "primary.50" : "transparent",
        transition: "all 0.2s ease",
        "&:hover": {
          borderColor: "primary.main",
          backgroundColor: "primary.50",
        },
      }}
    >
      <Stack spacing={2}>
        <Stack direction="row" alignItems="center" spacing={1}>
          {icon}
          <Typography variant="subtitle2" fontWeight="600">
            {label}
          </Typography>
        </Stack>

        <Stack direction="row" spacing={2} alignItems="center">
          <Button
            variant={fileName ? "outlined" : "contained"}
            startIcon={<FileUpload />}
            component="label"
            size="small"
            color={fileName ? "primary" : "primary"}
          >
            파일 선택
            <input
              type="file"
              hidden
              accept={accept}
              onChange={(e) => onChange(e.target.files?.[0])}
            />
          </Button>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="body2"
              color={fileName ? "primary.main" : "text.secondary"}
              sx={{
                fontWeight: fileName ? 500 : 400,
                wordBreak: "break-all",
              }}
            >
              {fileName || placeholder}
            </Typography>
          </Box>
        </Stack>
      </Stack>
    </Paper>
  );

  const handleUploadBook = () => {
    if (
      !bookTitle ||
      !bookAuthor ||
      !bookDescription ||
      !bookFile ||
      !bookCover
    ) {
      enqueueSnackbar("모든 필드를 입력해주세요", { variant: "warning" });
      return;
    } else {
      onUpload();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3 },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h5" fontWeight="600">
            {title}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ px: 3, pb: 2 }}>
        <Stack spacing={4} sx={{ mt: 2 }}>
          {/* 기본 정보 섹션 */}
          <Box>
            <Typography
              variant="h6"
              gutterBottom
              color="primary"
              fontWeight="600"
            >
              📖 기본 정보
            </Typography>
            <Stack spacing={3}>
              <TextField
                label="도서명"
                value={bookTitle}
                onChange={(e) => setBookTitle(e.target.value)}
                placeholder="도서 제목을 입력하세요"
                fullWidth
                variant="outlined"
              />

              <Grid container spacing={2}>
                <Grid size={8}>
                  <TextField
                    label="저자명"
                    value={bookAuthor}
                    onChange={(e) => setBookAuthor(e.target.value)}
                    placeholder="저자 이름을 입력하세요"
                    fullWidth
                  />
                </Grid>
                <Grid size={4}>
                  <TextField
                    label="가격"
                    type="number"
                    value={bookPrice || ""}
                    onChange={(e) => setBookPrice(Number(e.target.value))}
                    placeholder="0"
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
                placeholder="도서에 대한 설명을 입력하세요"
                fullWidth
              />
            </Stack>
          </Box>

          <Divider />

          {/* 파일 업로드 섹션 */}
          <Box>
            <Typography
              variant="h6"
              gutterBottom
              color="primary"
              fontWeight="600"
            >
              📁 파일 업로드
            </Typography>
            <Grid container spacing={3}>
              <Grid size={6}>
                <FileUploadButton
                  label="도서 표지"
                  accept="image/*"
                  onChange={setBookCover}
                  fileName={bookCover?.name}
                  placeholder="이미지 파일을 선택하세요"
                  icon={<ImageOutlined color="primary" />}
                />
              </Grid>
              <Grid size={6}>
                <FileUploadButton
                  label="전자책 파일"
                  accept=".epub"
                  onChange={setBookFile}
                  fileName={bookFile?.name}
                  placeholder="EPUB 파일을 선택하세요"
                  icon={<MenuBookOutlined color="primary" />}
                />
              </Grid>
            </Grid>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2.5, gap: 1 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          size="large"
          sx={{ px: 3 }}
        >
          취소
        </Button>
        <Button
          variant="contained"
          onClick={() => handleUploadBook()}
          size="large"
          sx={{ px: 4 }}
        >
          {buttonText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
