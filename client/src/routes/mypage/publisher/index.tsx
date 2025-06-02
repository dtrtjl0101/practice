import { useEffect, useMemo, useState } from "react";
import {
  Container,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  Stack,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  InputAdornment,
  Divider,
  CardMedia,
  CircularProgress,
} from "@mui/material";
import {
  Add,
  MenuBook,
  Visibility,
  ShoppingCart,
  PendingActions,
  Edit,
  FileUpload,
  Analytics,
  Business,
  Download,
  Email,
  ErrorOutline,
} from "@mui/icons-material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { createFileRoute } from "@tanstack/react-router";
import { useAtomValue } from "jotai";
import { AuthState } from "../../../states/auth";
import { Role } from "../../../types/role";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import API_CLIENT from "../../../api/api";
import { BookRequest } from "../../../types/book";

export const Route = createFileRoute("/mypage/publisher/")({
  component: RouteComponent,
});

// const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

function RouteComponent() {
  const user = useAtomValue(AuthState.user);
  const isPublisher =
    user &&
    (user?.role === Role.ROLE_PUBLISHER || user?.role === Role.ROLE_ADMIN);
  const queryClient = useQueryClient();

  const [currentTab, setCurrentTab] = useState(0);

  // 새 도서 등록 관련 상태
  const [openNewBookDialog, setOpenNewBookDialog] = useState(false);

  // 재신청 관련 상태
  const [openResubmitDialog, setOpenResubmitDialog] = useState(false);
  const [resubmitBook, setResubmitBook] = useState<BookRequest | null>(null);

  // 공통 폼 상태들
  const [bookTitle, setBookTitle] = useState("");
  const [bookAuthor, setBookAuthor] = useState("");
  const [bookPrice, setBookPrice] = useState<number | null>(null);
  const [bookDescription, setBookDescription] = useState("");
  const [bookFile, setBookFile] = useState<File | undefined>(undefined);
  const [bookCover, setBookCover] = useState<File | undefined>(undefined);

  // 도서 상세 다이얼로그 상태
  const [openBookDetailsDialog, setOpenBookDetailsDialog] = useState(false);
  const [selectedBook, setSelectedBook] = useState<BookRequest | null>(null);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  // 새 도서 등록 핸들러
  const handleOpenNewBookDialog = () => {
    resetBookForm();
    setOpenNewBookDialog(true);
  };

  const handleCloseNewBookDialog = () => {
    resetBookForm();
    setOpenNewBookDialog(false);
  };

  // 재신청 핸들러
  const handleOpenResubmitDialog = (book: BookRequest) => {
    // 기존 책 정보로 폼 채우기
    setBookTitle(book.title);
    setBookAuthor(book.author);
    setBookPrice(book.price);
    setBookDescription(book.description || "");
    setResubmitBook(book);
    setOpenResubmitDialog(true);
    // 파일들은 새로 업로드해야 하므로 초기화
    setBookFile(undefined);
    setBookCover(undefined);
  };

  const handleCloseResubmitDialog = () => {
    resetBookForm();
    setResubmitBook(null);
    setOpenResubmitDialog(false);
  };

  // 폼 초기화 함수
  const resetBookForm = () => {
    setBookTitle("");
    setBookAuthor("");
    setBookPrice(null);
    setBookDescription("");
    setBookFile(undefined);
    setBookCover(undefined);
  };

  // 출판사 정보 조회
  const { data: publisherInfo } = useQuery({
    queryKey: ["publisherInfo", user?.memberId],
    queryFn: async () => {
      const response = await API_CLIENT.publisherController.publisherInfo();
      if (!response.isSuccessful) {
        console.log(response.errorMessage);
        throw new Error(response.errorMessage);
      }
      return response.data;
    },
    enabled: isPublisher,
    initialData: {},
  });

  // 출판사 정보 조회
  const { data: publisherStats } = useQuery({
    queryKey: ["publisherStats", user?.memberId],
    queryFn: async () => {
      const response = await API_CLIENT.publisherController.getPublisherStats();
      if (!response.isSuccessful) {
        console.log(response.errorMessage);
        throw new Error(response.errorMessage);
      }
      return response.data;
    },
    enabled: isPublisher,
    initialData: {},
  });

  // 전체 도서 목록 조회
  const { data: unreleasedBooks } = useQuery({
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

  // 출판사 정보 조회
  const { data: publishedBooks } = useQuery({
    queryKey: ["publishedBooks", user?.memberId],
    queryFn: async () => {
      const response = await API_CLIENT.publisherController.getPublisherBooks();
      if (!response.isSuccessful) {
        console.log(response.errorMessage);
        throw new Error(response.errorMessage);
      }
      return response.data.content;
    },
    enabled: isPublisher,
    initialData: [],
  });

  const pendingBooks = useMemo(
    () => unreleasedBooks.filter((book) => book.status === "PENDING"),
    [unreleasedBooks]
  );

  const rejectedBooks = useMemo(
    () => unreleasedBooks.filter((book) => book.status === "REJECTED"),
    [unreleasedBooks]
  );

  // 선택된 책 정보 동기화
  useEffect(() => {
    if (!selectedBook) return;

    const updatedBook = unreleasedBooks.find(
      (book) => book.requestId === selectedBook.requestId
    );

    if (updatedBook && updatedBook !== selectedBook) {
      setSelectedBook(updatedBook);
    }
  }, [selectedBook, unreleasedBooks]);

  // 도서 등록 뮤테이션
  const createBookMutation = useMutation({
    mutationFn: async (bookData: any) => {
      const response = await API_CLIENT.ebookController.uploadFile(bookData);
      if (!response.isSuccessful) {
        alert(response.errorMessage);
        throw new Error(response.errorMessage);
      }
      return response;
    },

    onSuccess: () => {
      const isResubmit = openResubmitDialog;
      alert(
        isResubmit
          ? "도서 재신청이 완료되었습니다."
          : "도서 등록 신청이 완료되었습니다."
      );

      // 적절한 다이얼로그 닫기
      if (isResubmit) {
        handleCloseResubmitDialog();
      } else {
        handleCloseNewBookDialog();
      }

      queryClient.invalidateQueries({
        queryKey: [
          "publisherBooks",
          user?.role === Role.ROLE_PUBLISHER ? user.publisherId : undefined,
        ],
      });
    },
  });

  // 업로드 핸들러 (새 등록과 재신청 모두 처리)
  const handleUploadBook = () => {
    if (
      !bookTitle ||
      !bookAuthor ||
      !bookDescription ||
      !bookFile ||
      !bookCover
    ) {
      alert("모든 필드를 입력해주세요.");
      return;
    }

    const isResubmit = openResubmitDialog && resubmitBook;

    createBookMutation.mutate({
      title: bookTitle,
      author: bookAuthor,
      description: bookDescription,
      file: bookFile,
      price: bookPrice,
      cover: bookCover,
      // 재신청인 경우 원본 requestId 포함 (API에서 필요하다면)
      ...(isResubmit && { originalRequestId: resubmitBook.requestId }),
    });
  };

  const handleClickBook = (book: any) => {
    setSelectedBook(book);
    setOpenBookDetailsDialog(true);
  };

  const handleCloseBookDetailsDialog = () => {
    setOpenBookDetailsDialog(false);
    setSelectedBook(null);
  };

  // 요약 통계 카드 (실제 데이터 반영)
  // 요약 통계 카드 (실제 데이터 반영)
  const SummaryCards = () => {
    // 헬퍼 함수: 증감 텍스트 생성
    const getTrendText = (changeValue: any) => {
      if (changeValue > 0) {
        return {
          text: `전월 대비 +${changeValue.toLocaleString()}`,
          color: "#4caf50",
        };
      } else if (changeValue < 0) {
        return {
          text: `전월 대비 ${changeValue.toLocaleString()}`, // 이미 음수이므로 - 기호 포함됨
          color: "#f44336",
        };
      } else {
        return {
          text: "변동 없음",
          color: "#757575",
        };
      }
    };

    // 매출 증감 텍스트 (통화 포맷)
    const getRevenueTrendText = (changeValue: any) => {
      if (changeValue > 0) {
        return {
          text: `전월 대비 +₩${changeValue.toLocaleString()}`,
          color: "#4caf50",
        };
      } else if (changeValue < 0) {
        return {
          text: `전월 대비 -₩${Math.abs(changeValue).toLocaleString()}`,
          color: "#f44336",
        };
      } else {
        return {
          text: "변동 없음",
          color: "#757575",
        };
      }
    };

    return (
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card variant="outlined">
            <CardContent>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Box>
                  <Typography
                    color="textSecondary"
                    gutterBottom
                    variant="overline"
                  >
                    총 판매량
                  </Typography>
                  <Typography variant="h4">
                    {(publisherStats?.totalSalesCount ?? 0).toLocaleString()}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: getTrendText(publisherStats?.increasedSalesCount)
                        .color,
                    }}
                  >
                    {getTrendText(publisherStats?.increasedSalesCount).text}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: "primary.main" }}>
                  <ShoppingCart />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card variant="outlined">
            <CardContent>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Box>
                  <Typography
                    color="textSecondary"
                    gutterBottom
                    variant="overline"
                  >
                    총 매출
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    ₩{(publisherStats?.totalRevenue ?? 0).toLocaleString()}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: getRevenueTrendText(
                        publisherStats?.increasedRevenue
                      ).color,
                    }}
                  >
                    {getRevenueTrendText(publisherStats?.increasedRevenue).text}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: "success.main" }}>
                  <Analytics />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card variant="outlined">
            <CardContent>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Box>
                  <Typography
                    color="textSecondary"
                    gutterBottom
                    variant="overline"
                  >
                    총 조회수
                  </Typography>
                  <Typography variant="h4" color="info.main">
                    {(publisherStats?.totalViewCount ?? 0).toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    누적 도서 조회수
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: "info.main" }}>
                  <Visibility />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card variant="outlined">
            <CardContent>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Box>
                  <Typography
                    color="textSecondary"
                    gutterBottom
                    variant="overline"
                  >
                    활동 선정
                  </Typography>
                  <Typography variant="h4" color="warning.main">
                    {(publisherStats?.totalActivityCount ?? 0).toLocaleString()}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: getTrendText(
                        publisherStats?.increasedActivityCount
                      ).color,
                    }}
                  >
                    {getTrendText(publisherStats?.increasedActivityCount).text}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: "warning.main" }}>
                  <PendingActions />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  // 차트 섹션 (기존 유지)
  const ChartsSection = () => (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid size={{ xs: 12, lg: 8 }}>
        <Paper sx={{ p: 3 }} variant="outlined">
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h6">월별 매출</Typography>
          </Box>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={publisherStats.monthlyRevenueList}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="monthlyRevenue"
                stroke="#8884d8"
                name="수입"
              />
            </LineChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>

      <Grid size={{ xs: 12, lg: 4 }}>
        <Paper sx={{ p: 3 }} variant="outlined">
          <Typography variant="h6" gutterBottom>
            도서 상태 분포
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  {
                    name: "출간",
                    value: publishedBooks?.length,
                    color: "#00C49F",
                  },
                  {
                    name: "심사중",
                    value: pendingBooks.length,
                    color: "#FFBB28",
                  },
                  {
                    name: "거부됨",
                    value: rejectedBooks.length,
                    color: "#FF8042",
                  },
                ]}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {[publishedBooks, pendingBooks, rejectedBooks].map(
                  (_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={["#00C49F", "#FFBB28", "#FF8042"][index]}
                    />
                  )
                )}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>
    </Grid>
  );

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
      {/* 헤더 */}
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

      {/* 요약 통계 */}
      <SummaryCards />

      {/* 차트 */}
      <ChartsSection />

      {/* 탭 네비게이션 */}
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
        {/* 출간 도서 탭 */}
        <TabPanel value={currentTab} index={0}>
          <Box mb={2}>
            <Alert severity="success">
              현재 {publishedBooks?.length}권의 도서가 출간되었습니다.
            </Alert>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>도서</TableCell>
                  <TableCell>출판사</TableCell>
                  <TableCell align="right">가격</TableCell>
                  <TableCell align="right">파일 크기</TableCell>
                  <TableCell align="center">관리</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {publishedBooks?.length && publishedBooks?.length > 0 ? (
                  publishedBooks?.map((book) => (
                    <TableRow
                      key={book.id}
                      onClick={() => handleClickBook(book)}
                      sx={{ cursor: "pointer" }}
                      hover
                    >
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar
                            src={book.bookCoverImageURL}
                            variant="rounded"
                            sx={{ width: 40, height: 50 }}
                          >
                            {book.title![0]}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" fontWeight={600}>
                              {book.title}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              {book.author}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {publisherInfo.publisherName}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={600}>
                          ₩{book.price?.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          {(book.size! / 1024 / 1024).toFixed(1)} MB
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton size="small" color="primary">
                          <Visibility />
                        </IconButton>
                        <IconButton size="small" color="primary">
                          <Edit />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography variant="body2" color="textSecondary">
                        출간된 도서가 없습니다.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
        {/* 승인 대기 탭 */}
        <TabPanel value={currentTab} index={1}>
          <Box mb={2}>
            <Alert severity="warning">
              현재 {pendingBooks.length}권의 도서가 승인 대기 중입니다.
            </Alert>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>제목</TableCell>
                  <TableCell>저자</TableCell>
                  <TableCell>출판사</TableCell>
                  <TableCell align="right">가격</TableCell>
                  <TableCell>상태</TableCell>
                  <TableCell align="center">관리</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pendingBooks.length > 0 ? (
                  pendingBooks.map((book) => (
                    <TableRow
                      key={book.requestId}
                      onClick={() => handleClickBook(book)}
                      sx={{ cursor: "pointer" }}
                      hover
                    >
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {book.title}
                        </Typography>
                      </TableCell>
                      <TableCell>{book.author}</TableCell>
                      <TableCell>{book.publisherName}</TableCell>
                      <TableCell align="right">
                        ₩{book.price.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Chip label="심사중" color="warning" size="small" />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton size="small" color="primary">
                          <Visibility />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography variant="body2" color="textSecondary">
                        승인 대기 중인 도서가 없습니다.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
        {/* 거부된 도서 탭 */}
        <TabPanel value={currentTab} index={2}>
          <Box mb={2}>
            <Alert severity="error">
              현재 {rejectedBooks.length}권의 도서가 거부된 상태입니다.
            </Alert>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>제목</TableCell>
                  <TableCell>저자</TableCell>
                  <TableCell>거부 사유</TableCell>
                  <TableCell>상태</TableCell>
                  <TableCell align="center">관리</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rejectedBooks.length > 0 ? (
                  rejectedBooks.map((book) => (
                    <TableRow
                      key={book.requestId}
                      onClick={() => handleClickBook(book)}
                      sx={{ cursor: "pointer" }}
                      hover
                    >
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {book.title}
                        </Typography>
                      </TableCell>
                      <TableCell>{book.author}</TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          color="textSecondary"
                          sx={{
                            maxWidth: 200,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {book.rejectReason || "사유 없음"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label="거부됨" color="error" size="small" />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton size="small" color="primary">
                          <Visibility />
                        </IconButton>
                        <IconButton size="small" color="secondary">
                          <Edit />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography variant="body2" color="textSecondary">
                        거부된 도서가 없습니다.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/*상세 분석 탭*/}
        <TabPanel value={currentTab} index={3}>
          <Grid container spacing={3}>
            {/* 도서별 매출 비교 */}
            <Grid size={{ xs: 12, lg: 8 }}>
              <Paper sx={{ p: 3 }} variant="outlined">
                <Typography variant="h6" gutterBottom>
                  도서별 매출 분석
                </Typography>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={publisherStats?.statsPerEbookList || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="title"
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      interval={0}
                    />
                    <YAxis />
                    <Tooltip
                      formatter={(value, name) => [
                        name === "총 매출"
                          ? `₩${value.toLocaleString()}`
                          : value.toLocaleString(),
                        name,
                      ]}
                    />
                    <Bar dataKey="totalRevenue" fill="#8884d8" name="총 매출" />
                    <Bar
                      dataKey="totalSalesCount"
                      fill="#82ca9d"
                      name="총 판매량"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            {/* 도서별 활동 선정 현황 */}
            <Grid size={{ xs: 12, lg: 4 }}>
              <Paper sx={{ p: 3 }} variant="outlined">
                <Typography variant="h6" gutterBottom>
                  활동 선정 현황
                </Typography>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={(() => {
                        const sortedData = (
                          publisherStats?.statsPerEbookList || []
                        ).sort((a, b) => b.activityCount! - a.activityCount!);

                        const top5 = sortedData.slice(0, 5);
                        const others = sortedData.slice(5);

                        const othersSum = others.reduce(
                          (sum, item) => sum + item.activityCount!,
                          0
                        );

                        const result = top5.map((item) => ({
                          name:
                            item.title!.length > 10
                              ? item.title!.substring(0, 10) + "..."
                              : item.title,
                          value: item.activityCount,
                          fullName: item.title,
                        }));

                        if (othersSum > 0) {
                          result.push({
                            name: "기타",
                            value: othersSum,
                            fullName: `기타 ${others.length}권`,
                          });
                        }

                        return result;
                      })()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {(() => {
                        const colors = [
                          "#0088FE",
                          "#00C49F",
                          "#FFBB28",
                          "#FF8042",
                          "#8884D8",
                          "#82ca9d",
                        ];
                        const dataLength =
                          Math.min(
                            (publisherStats?.statsPerEbookList || []).length,
                            5
                          ) +
                          ((publisherStats?.statsPerEbookList || []).length > 5
                            ? 1
                            : 0);

                        return Array.from(
                          { length: dataLength },
                          (_, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={colors[index % colors.length]}
                            />
                          )
                        );
                      })()}
                    </Pie>
                    <Tooltip
                      formatter={(value, name, props) => [
                        value.toLocaleString(),
                        props.payload?.fullName || name,
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            {/* 도서별 조회수 vs 판매량 산점도 */}
            <Grid size={{ xs: 12, lg: 6 }}>
              <Paper sx={{ p: 3 }} variant="outlined">
                <Typography variant="h6" gutterBottom>
                  조회수 대비 판매 전환율
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={publisherStats?.statsPerEbookList}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="title"
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      interval={0}
                    />
                    <YAxis />
                    <Tooltip
                      formatter={(value, name) => [
                        value.toLocaleString(),
                        name,
                      ]}
                    />
                    <Bar dataKey="viewCount" fill="#ffc658" name="조회수" />
                    <Bar
                      dataKey="totalSalesCount"
                      fill="#8dd1e1"
                      name="판매량"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            {/* 월별 증가 판매량 */}
            <Grid size={{ xs: 12, lg: 6 }}>
              <Paper sx={{ p: 3 }} variant="outlined">
                <Typography variant="h6" gutterBottom>
                  최근 증가 판매량 (도서별)
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={(() => {
                        const sortedData = (
                          publisherStats?.increasedSalesCountsPerEbook || []
                        ).sort(
                          (a, b) => b.totalSalesCount! - a.totalSalesCount!
                        );

                        const top5 = sortedData.slice(0, 5);
                        const others = sortedData.slice(5);

                        const othersSum = others.reduce(
                          (sum, item) => sum + item.totalSalesCount!,
                          0
                        );

                        const result = top5.map((item) => ({
                          name:
                            item.bookName!.length > 10
                              ? item.bookName!.substring(0, 10) + "..."
                              : item.bookName,
                          value: item.totalSalesCount,
                          fullName: item.bookName,
                        }));

                        if (othersSum > 0) {
                          result.push({
                            name: "기타",
                            value: othersSum,
                            fullName: `기타 ${others.length}권`,
                          });
                        }

                        return result;
                      })()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {(() => {
                        const colors = [
                          "#ff7300",
                          "#00C49F",
                          "#FFBB28",
                          "#FF8042",
                          "#8884D8",
                          "#82ca9d",
                        ];
                        const dataLength =
                          Math.min(
                            (publisherStats?.increasedSalesCountsPerEbook || [])
                              .length,
                            5
                          ) +
                          ((publisherStats?.increasedSalesCountsPerEbook || [])
                            .length > 5
                            ? 1
                            : 0);

                        return Array.from(
                          { length: dataLength },
                          (_, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={colors[index % colors.length]}
                            />
                          )
                        );
                      })()}
                    </Pie>
                    <Tooltip
                      formatter={(value, name, props) => [
                        value.toLocaleString(),
                        props.payload?.fullName || name,
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            {/* 도서별 성과 레이더 차트 (상위 5개 도서) */}
            <Grid size={{ xs: 12, lg: 8 }}>
              <Paper sx={{ p: 3 }} variant="outlined">
                <Typography variant="h6" gutterBottom>
                  성과 매트릭스 (매출 기준 상위 5개 도서)
                </Typography>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart
                    data={
                      publisherStats?.statsPerEbookList
                        ?.sort((a, b) => b.totalRevenue! - a.totalRevenue!)
                        ?.slice(0, 5)
                        ?.map((book) => ({
                          title:
                            book.title!.length > 8
                              ? book.title!.substring(0, 8) + "..."
                              : book.title,
                          매출: book.totalRevenue! / 1000, // 천원 단위
                          판매량: book.totalSalesCount,
                          조회수: book.viewCount,
                          활동선정: book.activityCount,
                        })) || []
                    }
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="title" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: number, name) => [
                        name === "매출"
                          ? `₩${(value * 1000).toLocaleString()}`
                          : value.toLocaleString(),
                        name,
                      ]}
                    />
                    <Line
                      type="monotone"
                      dataKey="매출"
                      stroke="#8884d8"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="판매량"
                      stroke="#82ca9d"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="조회수"
                      stroke="#ffc658"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="활동선정"
                      stroke="#ff7300"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            {/* 성과 요약 테이블 */}
            <Grid size={{ xs: 12 }}>
              <Paper sx={{ p: 3 }} variant="outlined">
                <Typography variant="h6" gutterBottom>
                  도서별 성과 요약
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>도서명</TableCell>
                        <TableCell>저자</TableCell>
                        <TableCell align="right">총 매출</TableCell>
                        <TableCell align="right">판매량</TableCell>
                        <TableCell align="right">조회수</TableCell>
                        <TableCell align="right">활동 선정</TableCell>
                        <TableCell align="right">전환율</TableCell>
                        <TableCell align="right">평균 단가</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {publisherStats?.statsPerEbookList
                        ?.sort((a, b) => b.totalRevenue! - a.totalRevenue!)
                        ?.map((book) => {
                          const conversionRate =
                            book.viewCount! > 0
                              ? (book.totalSalesCount! / book.viewCount!) * 100
                              : 0;
                          const avgPrice =
                            book.totalSalesCount! > 0
                              ? book.totalRevenue! / book.totalSalesCount!
                              : 0;

                          return (
                            <TableRow key={book.bookId} hover>
                              <TableCell>
                                <Box display="flex" alignItems="center" gap={1}>
                                  <Avatar
                                    src={book.bookCoverImageURL}
                                    variant="rounded"
                                    sx={{ width: 24, height: 32 }}
                                  >
                                    {book.title![0]}
                                  </Avatar>
                                  <Typography variant="body2" fontWeight={500}>
                                    {book.title}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell>{book.author}</TableCell>
                              <TableCell
                                align="right"
                                sx={{ fontWeight: 600, color: "success.main" }}
                              >
                                ₩{book.totalRevenue!.toLocaleString()}
                              </TableCell>
                              <TableCell align="right">
                                {book.totalSalesCount!.toLocaleString()}
                              </TableCell>
                              <TableCell align="right">
                                {book.viewCount!.toLocaleString()}
                              </TableCell>
                              <TableCell align="right">
                                {book.activityCount!.toLocaleString()}
                              </TableCell>
                              <TableCell align="right">
                                <Typography
                                  variant="body2"
                                  color={
                                    conversionRate > 5
                                      ? "success.main"
                                      : conversionRate > 1
                                        ? "warning.main"
                                        : "error.main"
                                  }
                                  fontWeight={500}
                                >
                                  {conversionRate.toFixed(1)}%
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                ₩{avgPrice.toLocaleString()}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>

      {/* 새 도서 등록 다이얼로그 */}
      <BookRequestDialog
        open={openNewBookDialog}
        onClose={handleCloseNewBookDialog}
        title="새 도서 등록"
        buttonText="등록 신청"
        bookTitle={bookTitle}
        bookAuthor={bookAuthor}
        bookPrice={bookPrice}
        bookDescription={bookDescription}
        bookFile={bookFile}
        bookCover={bookCover}
        setBookTitle={setBookTitle}
        setBookAuthor={setBookAuthor}
        setBookPrice={setBookPrice}
        setBookDescription={setBookDescription}
        setBookCover={setBookCover}
        setBookFile={setBookFile}
        onUpload={handleUploadBook}
      />

      {/* 재신청 다이얼로그 */}
      <BookRequestDialog
        open={openResubmitDialog}
        onClose={handleCloseResubmitDialog}
        title="도서 재신청"
        buttonText="재신청"
        bookTitle={bookTitle}
        bookAuthor={bookAuthor}
        bookPrice={bookPrice}
        bookDescription={bookDescription}
        bookFile={bookFile}
        bookCover={bookCover}
        setBookTitle={setBookTitle}
        setBookAuthor={setBookAuthor}
        setBookPrice={setBookPrice}
        setBookDescription={setBookDescription}
        setBookCover={setBookCover}
        setBookFile={setBookFile}
        onUpload={handleUploadBook}
      />

      {/* 도서 상세 정보 다이얼로그 */}
      {selectedBook && (
        <BookInfoDialog
          book={selectedBook}
          open={openBookDetailsDialog}
          onClose={handleCloseBookDetailsDialog}
          openRequestDialog={() => handleOpenResubmitDialog(selectedBook)}
        />
      )}
    </Container>
  );
}

function BookInfoDialog({
  book,
  open,
  onClose,
  openRequestDialog,
}: {
  book: BookRequest;
  open: boolean;
  onClose(): void;
  openRequestDialog(): void;
}) {
  const [isDownloading, setIsDownloading] = useState(false);

  const { data: presignedURL, isLoading: urlLoading } = useQuery({
    queryKey: ["download-url", book.requestId],
    queryFn: async () => {
      const response = await API_CLIENT.ebookRequestController.download(
        book.requestId
      );
      if (!response.isSuccessful) {
        throw new Error(response.error);
      }
      return response.data.presignedUrl;
    },
    enabled: Boolean(book) && open,
    retry: 1,
  });

  const downloadBook = async () => {
    if (!presignedURL || isDownloading) return;

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
      console.error("다운로드 실패:", error);
      alert("다운로드에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsDownloading(false);
    }
  };

  // 파일 크기 포맷팅
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleOpenRequestDialog = () => {
    openRequestDialog();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h6">도서 상세 정보</Typography>
      </DialogTitle>

      <DialogContent>
        {/* 책 표지 */}
        <CardMedia
          component="img"
          image={book.coverImageURL}
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
              ₩{book.price.toLocaleString()}
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
              {formatFileSize(book.size)}
            </Typography>
          </Stack>

          {/* 출판사 정보 */}
          <Divider />
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

          {/* 거부 사유 (있는 경우) */}
          {book.status === "REJECTED" && book.rejectReason && (
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
        </Stack>
      </DialogContent>

      <DialogActions>
        {/* 재신청 버튼 (거부된 경우) */}
        {book.status === "REJECTED" && (
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
}

interface BookRequestDialogProps {
  open: boolean;
  onClose(): void;
  title: string;
  buttonText: string;
  bookTitle: string;
  bookAuthor: string;
  bookPrice: number | null;
  bookDescription: string;
  bookFile: File | undefined;
  bookCover: File | undefined;
  setBookTitle(title: string): void;
  setBookAuthor(author: string): void;
  setBookPrice(price: number): void;
  setBookDescription(description: string): void;
  setBookCover(cover: File | undefined): void;
  setBookFile(file: File | undefined): void;
  onUpload(): void;
}

function BookRequestDialog({
  open,
  onClose,
  title,
  buttonText,
  bookTitle,
  bookAuthor,
  bookPrice,
  bookDescription,
  bookFile,
  bookCover,
  setBookTitle,
  setBookAuthor,
  setBookPrice,
  setBookDescription,
  setBookCover,
  setBookFile,
  onUpload,
}: BookRequestDialogProps) {
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
}
