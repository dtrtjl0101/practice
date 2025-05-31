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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
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

// 더미 데이터
const salesData = [
  { name: "1월", sales: 4000, revenue: 2400000, views: 12000 },
  { name: "2월", sales: 3000, revenue: 1800000, views: 10000 },
  { name: "3월", sales: 5000, revenue: 3000000, views: 15000 },
  { name: "4월", sales: 4500, revenue: 2700000, views: 13500 },
  { name: "5월", sales: 6000, revenue: 3600000, views: 18000 },
  { name: "6월", sales: 5500, revenue: 3300000, views: 16500 },
];

const bookSalesData = [
  { name: "소설 A", sales: 1200, revenue: 720000, views: 4500, activities: 15 },
  { name: "에세이 B", sales: 800, revenue: 480000, views: 3200, activities: 8 },
  {
    name: "자기계발 C",
    sales: 1500,
    revenue: 900000,
    views: 5800,
    activities: 22,
  },
  { name: "시집 D", sales: 600, revenue: 360000, views: 2100, activities: 5 },
  { name: "소설 E", sales: 900, revenue: 540000, views: 3800, activities: 12 },
];

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
  const isPublisher = user && user?.role === Role.ROLE_PUBLISHER;
  const queryClient = useQueryClient();

  const [currentTab, setCurrentTab] = useState(0);
  const [timePeriod, setTimePeriod] = useState("month");

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
    queryKey: ["publisherInfo", isPublisher ? user.publisherId : undefined],
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

  // 전체 도서 목록 조회
  const { data: books } = useQuery({
    queryKey: ["publisherBooks", isPublisher ? user.publisherId : undefined],
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

  // 상태별로 필터링된 도서 목록들
  const publishedBooks = useMemo(
    () => books.filter((book) => book.status === "APPROVED"),
    [books]
  );

  const pendingBooks = useMemo(
    () => books.filter((book) => book.status === "PENDING"),
    [books]
  );

  const rejectedBooks = useMemo(
    () => books.filter((book) => book.status === "REJECTED"),
    [books]
  );

  // 선택된 책 정보 동기화
  useEffect(() => {
    if (!selectedBook) return;

    const updatedBook = books.find(
      (book) => book.requestId === selectedBook.requestId
    );

    if (updatedBook && updatedBook !== selectedBook) {
      setSelectedBook(updatedBook);
    }
  }, [selectedBook, books]);

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

  const handleClickBook = (book: BookRequest) => {
    setSelectedBook(book);
    setOpenBookDetailsDialog(true);
  };

  const handleCloseBookDetailsDialog = () => {
    setOpenBookDetailsDialog(false);
    setSelectedBook(null);
  };

  // 요약 통계 카드 (실제 데이터 반영)
  const SummaryCards = () => (
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
                  총 도서 수
                </Typography>
                <Typography variant="h4">{books.length}</Typography>
                <Typography variant="body2" color="textSecondary">
                  전체 등록 도서
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: "primary.main" }}>
                <MenuBook />
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
                  출간 도서
                </Typography>
                <Typography variant="h4" color="success.main">
                  {publishedBooks.length}
                </Typography>
                <Typography variant="body2" color="success.main">
                  승인됨
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: "success.main" }}>
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
                  심사 대기
                </Typography>
                <Typography variant="h4" color="warning.main">
                  {pendingBooks.length}
                </Typography>
                <Typography variant="body2" color="warning.main">
                  검토 중
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: "warning.main" }}>
                <PendingActions />
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
                  거부된 도서
                </Typography>
                <Typography variant="h4" color="error.main">
                  {rejectedBooks.length}
                </Typography>
                <Typography variant="body2" color="error.main">
                  재검토 필요
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: "error.main" }}>
                <ErrorOutline />
              </Avatar>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

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
            <Typography variant="h6">판매 추이</Typography>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>기간</InputLabel>
              <Select
                value={timePeriod}
                onChange={(e) => setTimePeriod(e.target.value)}
                label="기간"
              >
                <MenuItem value="week">주간</MenuItem>
                <MenuItem value="month">월간</MenuItem>
                <MenuItem value="year">연간</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="sales"
                stroke="#8884d8"
                name="판매량"
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#82ca9d"
                name="매출"
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
                    value: publishedBooks.length,
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
      <Box sx={{ padding: 2 }}>
        {publisherInfo.status === "PENDING" && (
          <Alert severity="warning">관리자가 계정을 심사중입니다.</Alert>
        )}
        {publisherInfo.status === "REJECTED" && (
          <Alert severity="warning">관리자가 계정을 거절했습니다.</Alert>
        )}
      </Box>
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
            label={`출간 도서 (${publishedBooks.length})`}
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
              현재 {publishedBooks.length}권의 도서가 출간되었습니다.
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
                {publishedBooks.length > 0 ? (
                  publishedBooks.map((book) => (
                    <TableRow
                      key={book.requestId}
                      onClick={() => handleClickBook(book)}
                      sx={{ cursor: "pointer" }}
                      hover
                    >
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar
                            src={book.coverImageURL}
                            variant="rounded"
                            sx={{ width: 40, height: 50 }}
                          >
                            {book.title[0]}
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
                          {book.publisherName}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={600}>
                          ₩{book.price.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          {(book.size / 1024 / 1024).toFixed(1)} MB
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

        {/* 상세 분석 탭 */}
        <TabPanel value={currentTab} index={3}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper sx={{ p: 3 }} variant="outlined">
                <Typography variant="h6" gutterBottom>
                  도서별 성과 비교
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={bookSalesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="sales" fill="#8884d8" name="판매량" />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper sx={{ p: 3 }} variant="outlined">
                <Typography variant="h6" gutterBottom>
                  활동 선정 현황
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={bookSalesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar
                      dataKey="activities"
                      fill="#82ca9d"
                      name="활동 선정 수"
                    />
                  </BarChart>
                </ResponsiveContainer>
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

  // 상태별 색상 및 텍스트
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "PENDING":
        return { color: "warning" as const, text: "심사중" };
      case "APPROVED":
        return { color: "success" as const, text: "승인됨" };
      case "REJECTED":
        return { color: "error" as const, text: "거부됨" };
      default:
        return { color: "default" as const, text: status };
    }
  };

  const statusDisplay = getStatusDisplay(book.status);

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

            {/* 상태 표시 */}
            <Box mt={1}>
              <Chip
                label={statusDisplay.text}
                color={statusDisplay.color}
                size="small"
                variant="outlined"
              />
            </Box>
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
