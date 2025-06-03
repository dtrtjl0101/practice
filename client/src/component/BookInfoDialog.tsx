import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Stack,
  Divider,
  Alert,
  Button,
  CircularProgress,
  Box,
  CardMedia,
  TextField,
} from "@mui/material";
import { Download, Business, Email } from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { formatFileSize } from "../utils/bookUtils";
import { BookMetadata, BookRequest } from "../types/book";
import API_CLIENT from "../api/api";
import { useSnackbar } from "notistack";

interface BookInfoDialogProps {
  book: BookRequest | BookMetadata | null;
  open: boolean;
  onClose: () => void;
  openRequestDialog: () => void;
}

export const BookInfoDialog: React.FC<BookInfoDialogProps> = ({
  book,
  open,
  onClose,
  openRequestDialog,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const { enqueueSnackbar } = useSnackbar();

  // 타입 가드 함수
  const isBookMetadata = (book: any): book is BookMetadata => {
    return (
      book &&
      typeof book.id !== "undefined" &&
      typeof book.bookCoverImageURL !== "undefined"
    );
  };

  const bookId =
    book && isBookMetadata(book) ? book.id : (book?.requestId as number);
  const bookCoverURL =
    book && isBookMetadata(book) ? book.bookCoverImageURL : book?.coverImageURL;

  const { data: presignedURL, isLoading: urlLoading } = useQuery({
    queryKey: ["download-url", bookId],
    queryFn: async () => {
      const response = isBookMetadata(book)
        ? await API_CLIENT.ebookController.getPresignedEbookUrlForPublisher(
            bookId
          )
        : await API_CLIENT.ebookRequestController.download(bookId);
      if (!response.isSuccessful) {
        throw new Error(response.error);
      }
      return response.data.presignedUrl;
    },
    enabled: Boolean(book) && open,
    retry: 1,
  });

  const downloadBook = async () => {
    if (!presignedURL || isDownloading || !book) return;

    setIsDownloading(true);
    try {
      const response = await fetch(presignedURL);
      if (!response.ok) throw new Error("다운로드 실패");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `${book.title}.epub`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      enqueueSnackbar("다운로드에 실패했습니다. 다시 시도해주세요.", {
        variant: "error",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleOpenRequestDialog = () => {
    openRequestDialog();
    onClose();
  };

  const handleApproveBook = async () => {
    const response =
      await API_CLIENT.ebookRequestController.approveRequest(bookId);
    if (!response.isSuccessful) {
      throw new Error(response.error);
    }
    enqueueSnackbar("도서 신청이 완료되었습니다.", { variant: "success" });
    onClose();
  };

  const handleRejectBook = async () => {
    if (rejectReason.trim() === "") {
      enqueueSnackbar("거절 사유를 입력해주세요.", { variant: "warning" });
      return;
    }
    const response = await API_CLIENT.ebookRequestController.rejectRequest(
      bookId,
      { reason: rejectReason }
    );
    if (!response.isSuccessful) {
      throw new Error(response.error);
    }
    enqueueSnackbar("도서 신청이 거절되었습니다.", { variant: "success" });
    onClose();
  };

  // book이 null인 경우 빈 다이얼로그 반환
  if (!book) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogContent>
          <Typography>로딩 중...</Typography>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h6">도서 상세 정보</Typography>
      </DialogTitle>

      <DialogContent>
        <CardMedia
          component="img"
          image={bookCoverURL}
          alt={book.title}
          sx={{
            width: 192,
            height: 256,
            borderRadius: 2,
            mb: 2,
            objectFit: "cover",
            border: "1px solid",
            borderColor: "grey.300",
          }}
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/api/placeholder/192/256";
          }}
        />
        <Stack spacing={2} flex={1} justifyContent="flex-start">
          {/* 제목 및 저자 */}
          <Box>
            <Typography variant="h4" gutterBottom>
              {book.title}
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              {book.author}
            </Typography>
          </Box>

          <Divider />

          {/* 책 설명 */}
          <Typography
            variant="body1"
            sx={{
              whiteSpace: "pre-line",
              maxHeight: 120,
              overflow: "auto",
              padding: 1,
              bgcolor: "grey.50",
              borderRadius: 1,
            }}
          >
            {book.description || "설명이 없습니다."}
          </Typography>

          <Divider />

          {/* 가격 정보 */}
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography
              variant="body1"
              color="textSecondary"
              sx={{ minWidth: 80 }}
            >
              가격
            </Typography>
            <Typography variant="h5" color="primary.main" fontWeight={700}>
              ₩{book.price?.toLocaleString()}
            </Typography>
          </Stack>

          {/* 파일 크기 */}
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography
              variant="body1"
              color="textSecondary"
              sx={{ minWidth: 80 }}
            >
              파일 크기
            </Typography>
            <Typography variant="body2" fontWeight={500}>
              {formatFileSize(book.size || 0)}
            </Typography>
          </Stack>

          {/* 출판사 정보 */}
          <Divider />
          {!isBookMetadata(book) && (
            <Box>
              <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                출판사 정보
              </Typography>
              <Stack spacing={1}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Business fontSize="small" color="action" />
                  <Typography variant="body2">{book.publisherName}</Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <Email fontSize="small" color="action" />
                  <Typography variant="body2">{book.publisherEmail}</Typography>
                </Box>
              </Stack>
            </Box>
          )}

          {/* 거부 사유 (있는 경우) */}
          {!isBookMetadata(book) &&
            book.status === "REJECTED" &&
            book.rejectReason && (
              <>
                <Divider />
                <Alert severity="error" variant="outlined">
                  <Typography variant="subtitle2" gutterBottom>
                    거부 사유
                  </Typography>
                  <Typography variant="body2">{book.rejectReason}</Typography>
                </Alert>
              </>
            )}

          {/* 거부 사유 (있는 경우) */}
          {!isBookMetadata(book) && book.status === "PENDING" && (
            <>
              <Divider />
              <TextField
                label="거절 사유 (거절시에만 입력)"
                color="warning"
                multiline
                rows={4}
                onChange={(e) => {
                  setRejectReason(e.target.value);
                }}
              />
            </>
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        {!isBookMetadata(book) && book.status === "PENDING" && (
          <Stack direction={"row"} spacing={1}>
            <Button
              color="success"
              variant="contained"
              onClick={() => handleApproveBook()}
            >
              승인
            </Button>
            <Button
              color="error"
              variant="contained"
              onClick={() => handleRejectBook()}
            >
              거부
            </Button>
          </Stack>
        )}
        {/* 재신청 버튼 (거부된 경우) */}
        {!isBookMetadata(book) && book.status === "REJECTED" && (
          <Button
            variant="contained"
            color="secondary"
            onClick={handleOpenRequestDialog}
          >
            재신청
          </Button>
        )}
        <Button
          variant="contained"
          startIcon={
            isDownloading ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <Download />
            )
          }
          onClick={downloadBook}
          disabled={!presignedURL || isDownloading || urlLoading}
        >
          {isDownloading
            ? "다운로드 중..."
            : urlLoading
              ? "준비 중..."
              : "다운로드"}
        </Button>
        <Button onClick={onClose}>닫기</Button>
      </DialogActions>
    </Dialog>
  );
};
