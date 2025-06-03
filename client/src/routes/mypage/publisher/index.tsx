import React, { useState, useMemo } from "react";
import {
  Container,
  Alert,
  Box,
  Typography,
  Stack,
  Button,
  Paper,
  Tabs,
  Tab,
} from "@mui/material";
import {
  Add,
  MenuBook,
  PendingActions,
  ErrorOutline,
  Analytics,
} from "@mui/icons-material";
import { createFileRoute } from "@tanstack/react-router";
import { BookMetadata, BookRequest } from "../../../types/book";
import { BookInfoDialog } from "../../../component/BookInfoDialog";
import { BookRequestDialog } from "../../../component/BookRequestDialog";
import { ChartsSection } from "../../../component/ChartsSection";
import { SummaryCards } from "../../../component/SummaryCards";
import { AnalyticsTab } from "../../../component/tabs/AnalyticsTab";
import { PendingBooksTab } from "../../../component/tabs/PendingBooksTab";
import { PublishedBooksTab } from "../../../component/tabs/PublishedBooksTab";
import { RejectedBooksTab } from "../../../component/tabs/RejectedBooksTab";
import { TabPanel } from "../../../component/tabs/TabPanel";
import { useBookUpload } from "../../../hooks/useBookUpload";
import { usePublisherData } from "../../../hooks/usePublisherData";
import { useSnackbar } from "notistack";

export const Route = createFileRoute("/mypage/publisher/")({
  component: PublisherDashboard,
});

export function PublisherDashboard() {
  const {
    isPublisher,
    publisherInfo,
    publisherStats,
    unreleasedBooks,
    publishedBooks,
  } = usePublisherData();
  const bookUpload = useBookUpload();

  const [currentTab, setCurrentTab] = useState(0);
  const [openNewBookDialog, setOpenNewBookDialog] = useState(false);
  const [openResubmitDialog, setOpenResubmitDialog] = useState(false);

  // 도서 상세 다이얼로그 상태
  const [openBookDetailsDialog, setOpenBookDetailsDialog] = useState(false);
  const [selectedPublishedBook, setSelectedPublishedBook] =
    useState<BookMetadata | null>(null);
  const [selectedUnreleasedBook, setSelectedUnreleasedBook] =
    useState<BookRequest | null>(null);

  const { enqueueSnackbar } = useSnackbar();

  const pendingBooks = useMemo(
    () => unreleasedBooks.filter((book) => book.status === "PENDING"),
    [unreleasedBooks]
  );

  const rejectedBooks = useMemo(
    () => unreleasedBooks.filter((book) => book.status === "REJECTED"),
    [unreleasedBooks]
  );

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleOpenNewBookDialog = () => {
    bookUpload.actions.resetForm();
    setOpenNewBookDialog(true);
  };

  const handleCloseNewBookDialog = () => {
    bookUpload.actions.resetForm();
    setOpenNewBookDialog(false);
  };

  const handleOpenResubmitDialog = (book: any) => {
    bookUpload.actions.fillForm(book);
    setOpenResubmitDialog(true);
  };

  const handleCloseResubmitDialog = () => {
    bookUpload.actions.resetForm();
    setOpenResubmitDialog(false);
  };

  // 출간된 도서 클릭 핸들러
  const handleClickPublishedBook = (book: BookMetadata) => {
    setSelectedPublishedBook(book);
    setSelectedUnreleasedBook(null); // 다른 선택 초기화
    setOpenBookDetailsDialog(true);
  };

  // 미출간 도서 클릭 핸들러 (승인 대기/거부됨)
  const handleClickUnreleasedBook = (book: BookRequest) => {
    setSelectedUnreleasedBook(book);
    setSelectedPublishedBook(null); // 다른 선택 초기화
    setOpenBookDetailsDialog(true);
  };

  const handleCloseBookDetailsDialog = () => {
    setOpenBookDetailsDialog(false);
    setSelectedPublishedBook(null);
    setSelectedUnreleasedBook(null);
  };

  const handleUploadBook = () => {
    const isResubmit = openResubmitDialog;
    bookUpload.actions.uploadBook();

    setTimeout(() => {
      enqueueSnackbar(
        isResubmit
          ? "도서 재신청이 완료되었습니다."
          : "도서 등록 신청이 완료되었습니다.",
        { variant: "success" }
      );
      if (isResubmit) {
        handleCloseResubmitDialog();
      } else {
        handleCloseNewBookDialog();
      }
    }, 100);
  };

  if (!isPublisher) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">출판사 권한이 필요합니다.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {publisherInfo.status === "PENDING" && (
        <Box sx={{ padding: 2 }}>
          <Alert severity="warning">관리자가 계정을 심사중입니다.</Alert>
        </Box>
      )}

      {publisherInfo.status === "REJECTED" && (
        <Box sx={{ padding: 2 }}>
          <Alert severity="warning">관리자가 계정을 거절했습니다.</Alert>
        </Box>
      )}

      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
      >
        <Box>
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="h4" gutterBottom>
              출판사 관리
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              {publisherInfo?.publisherName || ""}
            </Typography>
          </Stack>
          <Typography variant="body1" color="textSecondary">
            출판물 관리 및 성과 분석
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleOpenNewBookDialog}
          size="large"
          disabled={publisherInfo.status !== "APPROVED"}
        >
          새 도서 등록
        </Button>
      </Box>

      {/* Summary Cards */}
      <SummaryCards publisherStats={publisherStats} />

      {/* Charts */}
      <ChartsSection
        publisherStats={publisherStats}
        publishedBooks={publishedBooks}
        pendingBooks={pendingBooks}
        rejectedBooks={rejectedBooks}
      />

      {/* Tabs */}
      <Paper sx={{ mb: 3 }} variant="outlined">
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          <Tab
            icon={<MenuBook />}
            label={`출간 도서 (${publishedBooks?.length})`}
          />
          <Tab
            icon={<PendingActions />}
            label={`승인 대기 (${pendingBooks.length})`}
          />
          <Tab
            icon={<ErrorOutline />}
            label={`거부됨 (${rejectedBooks.length})`}
          />
          <Tab icon={<Analytics />} label="상세 분석" />
        </Tabs>

        <TabPanel value={currentTab} index={0}>
          <PublishedBooksTab
            books={publishedBooks}
            publisherInfo={publisherInfo}
            onBookClick={handleClickPublishedBook}
          />
        </TabPanel>

        <TabPanel value={currentTab} index={1}>
          <PendingBooksTab
            books={pendingBooks}
            onBookClick={handleClickUnreleasedBook}
          />
        </TabPanel>

        <TabPanel value={currentTab} index={2}>
          <RejectedBooksTab
            books={rejectedBooks}
            onBookClick={handleClickUnreleasedBook}
            onResubmit={handleOpenResubmitDialog}
          />
        </TabPanel>

        <TabPanel value={currentTab} index={3}>
          <AnalyticsTab publisherStats={publisherStats} />
        </TabPanel>
      </Paper>

      {/* Dialogs */}
      <BookRequestDialog
        open={openNewBookDialog}
        onClose={handleCloseNewBookDialog}
        title="새 도서 등록"
        buttonText="등록 신청"
        formData={bookUpload.formData}
        setters={bookUpload.setters}
        onUpload={handleUploadBook}
      />

      <BookRequestDialog
        open={openResubmitDialog}
        onClose={handleCloseResubmitDialog}
        title="도서 재신청"
        buttonText="재신청"
        formData={bookUpload.formData}
        setters={bookUpload.setters}
        onUpload={handleUploadBook}
      />

      {/* 도서 상세 정보 다이얼로그 */}
      {(selectedPublishedBook || selectedUnreleasedBook) && (
        <BookInfoDialog
          book={selectedPublishedBook || selectedUnreleasedBook}
          open={openBookDetailsDialog}
          onClose={handleCloseBookDetailsDialog}
          openRequestDialog={() =>
            handleOpenResubmitDialog(
              selectedPublishedBook || selectedUnreleasedBook
            )
          }
        />
      )}
    </Container>
  );
}
